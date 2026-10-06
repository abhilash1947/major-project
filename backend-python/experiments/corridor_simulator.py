"""
Corridor Simulator - Paper-faithful 60 km single-direction railway simulation.

Parameters match the methodology chapter:
  - Track: 60 km, 12 x 5 km blocks
  - Train classes: Fast (120 km/h) and Slow (80 km/h)
  - Arrivals: Poisson process at rate lambda (trains/hour)
  - Timestep: 5 seconds
  - Simulation: 4 hours + 30-min warm-up
  - Min safe headway: 3 minutes (180 s)
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Optional, Dict


TRACK_LENGTH_KM = 60.0
BLOCK_LENGTH_KM = 5.0
NUM_BLOCKS = int(TRACK_LENGTH_KM / BLOCK_LENGTH_KM)
DT_S = 5.0
SIM_DURATION_S = 4 * 3600.0
WARMUP_S = 30 * 60.0
MIN_HEADWAY_S = 180.0
FAST_MAX_KMH = 120.0
SLOW_MAX_KMH = 80.0
RESTRICTION_SPEED_KMH = 40.0
EXIT_POINT_KM = TRACK_LENGTH_KM


@dataclass
class TrainState:
    train_id: int
    max_speed_kmh: float
    entry_time_s: float
    scheduled_travel_s: float
    position_km: float = 0.0
    speed_kmh: float = 0.0
    completed: bool = False
    actual_exit_time_s: float = 0.0
    priority: str = "normal"


@dataclass
class SimulationResult:
    seed: int
    controller_name: str
    trains_completed: int
    throughput_per_hour: float
    mean_delay_s: float
    std_delay_s: float
    delays_s: List[float]
    headway_violations: int
    decision_times_ms: List[float]
    avg_decision_time_ms: float
    max_decision_time_ms: float


class CorridorSimulator:
    def __init__(self, seed=0, lam_per_hour=8.0, disturbance=None):
        self.seed = seed
        self.rng = np.random.default_rng(seed)
        self.lam_per_hour = lam_per_hour
        self.disturbance = disturbance
        self.dt = DT_S
        self.time_s = 0.0
        self.trains = []
        self.next_train_id = 0
        self._pending_arrivals = []
        self._schedule_arrivals()
        self.completed_trains = []
        self.headway_violations = 0
        self._last_entry_time = -9999.0

    def _schedule_arrivals(self):
        lam_per_s = self.lam_per_hour / 3600.0
        t = 0.0
        arrivals = []
        total_s = SIM_DURATION_S + WARMUP_S
        while t < total_s:
            inter = self.rng.exponential(1.0 / lam_per_s)
            t += inter
            if t < total_s:
                arrivals.append(t)
        self._pending_arrivals = arrivals

    def _speed_limit_at(self, position_km):
        if self.disturbance and self.disturbance.get('active', False):
            d = self.disturbance
            if d['segment_start_km'] <= position_km <= d['segment_end_km']:
                return RESTRICTION_SPEED_KMH
        return None

    def get_state(self):
        return {
            'time_s': self.time_s,
            'trains': [
                {
                    'id': tr.train_id,
                    'position_km': tr.position_km,
                    'speed_kmh': tr.speed_kmh,
                    'max_speed_kmh': tr.max_speed_kmh,
                    'priority': tr.priority,
                }
                for tr in self.trains
            ],
            'disturbance': self.disturbance,
        }

    def apply_actions(self, actions):
        for tr in self.trains:
            if tr.train_id in actions:
                target = actions[tr.train_id]
                limit = self._speed_limit_at(tr.position_km)
                if limit is not None:
                    target = min(target, limit)
                target = min(target, tr.max_speed_kmh)
                target = max(target, 0.0)
                delta_kmh = target - tr.speed_kmh
                max_delta = 1.0 * self.dt * 3.6
                tr.speed_kmh += float(np.clip(delta_kmh, -max_delta, max_delta))

    def _check_headway(self, new_entry_time):
        if self._last_entry_time < 0:
            return True
        return (new_entry_time - self._last_entry_time) >= MIN_HEADWAY_S

    def step(self, actions=None):
        self.time_s += self.dt
        if self.disturbance:
            d = self.disturbance
            d['active'] = d['start_time_s'] <= self.time_s <= d['end_time_s']

        while self._pending_arrivals and self._pending_arrivals[0] <= self.time_s:
            arr_t = self._pending_arrivals.pop(0)
            fast = self.rng.random() < 0.5
            max_spd = FAST_MAX_KMH if fast else SLOW_MAX_KMH
            scheduled_s = (TRACK_LENGTH_KM / max_spd) * 3600.0
            tr = TrainState(
                train_id=self.next_train_id,
                max_speed_kmh=max_spd,
                entry_time_s=arr_t,
                scheduled_travel_s=scheduled_s,
                position_km=0.0,
                speed_kmh=max_spd * 0.5,
                priority="high" if fast else "normal",
            )
            self.next_train_id += 1
            if not self._check_headway(arr_t):
                self.headway_violations += 1
            else:
                self._last_entry_time = arr_t
            self.trains.append(tr)

        if actions:
            self.apply_actions(actions)

        for tr in self.trains:
            if tr.completed:
                continue
            limit = self._speed_limit_at(tr.position_km)
            if limit is not None and tr.speed_kmh > limit:
                tr.speed_kmh = limit
            distance_km = (tr.speed_kmh / 3600.0) * self.dt
            tr.position_km += distance_km
            if tr.position_km >= EXIT_POINT_KM:
                tr.completed = True
                tr.actual_exit_time_s = self.time_s

        still_active = []
        for tr in self.trains:
            if tr.completed:
                if tr.entry_time_s >= WARMUP_S:
                    self.completed_trains.append(tr)
            else:
                still_active.append(tr)
        self.trains = still_active

    def run(self, controller, controller_name):
        import time as _time
        decision_times_ms = []
        total_steps = int((SIM_DURATION_S + WARMUP_S) / self.dt)
        for _ in range(total_steps):
            state = self.get_state()
            t0 = _time.perf_counter()
            actions = controller.decide(state)
            t1 = _time.perf_counter()
            decision_times_ms.append((t1 - t0) * 1000.0)
            self.step(actions)

        completed = self.completed_trains
        trains_completed = len(completed)
        throughput = trains_completed / (SIM_DURATION_S / 3600.0)
        delays = []
        for tr in completed:
            actual_travel = tr.actual_exit_time_s - tr.entry_time_s
            delay = actual_travel - tr.scheduled_travel_s
            delays.append(delay)

        mean_delay = float(np.mean(delays)) if delays else 0.0
        std_delay = float(np.std(delays)) if delays else 0.0
        avg_dt = float(np.mean(decision_times_ms)) if decision_times_ms else 0.0
        max_dt = float(np.max(decision_times_ms)) if decision_times_ms else 0.0

        return SimulationResult(
            seed=self.seed,
            controller_name=controller_name,
            trains_completed=trains_completed,
            throughput_per_hour=round(throughput, 4),
            mean_delay_s=round(mean_delay, 4),
            std_delay_s=round(std_delay, 4),
            delays_s=delays,
            headway_violations=self.headway_violations,
            decision_times_ms=decision_times_ms,
            avg_decision_time_ms=round(avg_dt, 4),
            max_decision_time_ms=round(max_dt, 4),
        )
