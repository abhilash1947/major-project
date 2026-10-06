import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import json


@dataclass
class Train:
    id: str
    position: float
    speed: float
    destination: str
    max_speed: float = 120.0
    acceleration: float = 2.0
    deceleration: float = 3.0
    priority: str = "normal"
    length: float = 200.0
    departure_time: float = 0.0
    arrival_time: float = 0.0
    mass: float = 500000.0
    power: float = 5000.0
    grade: float = 0.0
    rolling_resistance: float = 0.002
    air_resistance: float = 0.0005
    wheel_slip_threshold: float = 0.1
    lat: float = 0.0
    lon: float = 0.0

    def to_dict(self):
        return {
            "id": self.id,
            "position": round(self.position, 2),
            "speed": round(self.speed, 2),
            "destination": self.destination,
            "priority": self.priority,
            "length": self.length,
            "lat": round(self.lat, 6),
            "lon": round(self.lon, 6)
        }

@dataclass
class TrackSegment:
    segment_id: str
    start_km: float
    end_km: float
    max_capacity: int
    speed_limit: float = 120.0
    occupancy: int = 0
    conflicts: List[str] = field(default_factory=list)
    grade: float = 0.0
    start_lat: float = 0.0
    start_lon: float = 0.0
    end_lat: float = 0.0
    end_lon: float = 0.0

    def to_dict(self):
        return {
            "segment_id": self.segment_id,
            "start_km": self.start_km,
            "end_km": self.end_km,
            "max_capacity": self.max_capacity,
            "speed_limit": self.speed_limit,
            "occupancy": self.occupancy,
            "utilization": round((self.occupancy / self.max_capacity) * 100, 2) if self.max_capacity > 0 else 0,
            "startLat": self.start_lat,
            "startLon": self.start_lon,
            "endLat": self.end_lat,
            "endLon": self.end_lon
        }

class DigitalTwin:
    CITIES = {
        "MAS": {"name": "Chennai", "lat": 13.0827, "lon": 80.2707},
        "SBC": {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
        "SC":  {"name": "Hyderabad", "lat": 17.3850, "lon": 78.4867},
        "BZA": {"name": "Vijayawada", "lat": 16.5062, "lon": 80.6480},
        "TPJ": {"name": "Trichy", "lat": 10.7905, "lon": 78.7047},
        "MDU": {"name": "Madurai", "lat": 9.9252, "lon": 78.1198},
        "TVC": {"name": "Trivandrum", "lat": 8.5241, "lon": 76.9366},
        "CBE": {"name": "Coimbatore", "lat": 11.0168, "lon": 76.9558},
        "ERS": {"name": "Ernakulam", "lat": 9.9816, "lon": 76.2999},
        "UBL": {"name": "Hubli", "lat": 15.3647, "lon": 75.1240},
        "MAO": {"name": "Goa", "lat": 15.2993, "lon": 73.9690},
        "MAQ": {"name": "Mangalore", "lat": 12.8700, "lon": 74.8800}
    }

    ROUTES = [
        ("MAS", "SBC", 350), ("SBC", "UBL", 400), ("UBL", "MAO", 150),
        ("MAS", "BZA", 450), ("BZA", "SC", 280), ("SC", "SBC", 570),
        ("MAS", "TPJ", 330), ("TPJ", "MDU", 130), ("MDU", "TVC", 300),
        ("SBC", "CBE", 380), ("CBE", "ERS", 200), ("ERS", "TVC", 220),
        ("SBC", "MAQ", 350)
    ]

    TRAIN_TYPES = {
        "VANDE_BHARAT": {"max_speed": 130.0, "accel": 3.5, "priority": "high"},
        "SHATABDI": {"max_speed": 130.0, "accel": 2.5, "priority": "high"},
        "EXPRESS": {"max_speed": 110.0, "accel": 2.0, "priority": "normal"},
        "MAIL": {"max_speed": 110.0, "accel": 2.0, "priority": "normal"},
        "PASSENGER": {"max_speed": 90.0, "accel": 1.8, "priority": "normal"},
        "GOODS": {"max_speed": 75.0, "accel": 1.2, "priority": "low"}
    }

    def __init__(self, track_length_km: float = 4110.0, num_segments: int = 13):
        self.track_length = sum(r[2] for r in self.ROUTES)
        self.num_segments = len(self.ROUTES)
        self.trains: Dict[str, Train] = {}
        self.segments: List[TrackSegment] = []
        self.timestamp = 0.0
        self.dt = 2.0
        self.safety_buffer = 1000.0
        self.disruption = "none"
        self.disruption_segment = None
        self.operational_events = []
        
        self._initialize_track()

    def _initialize_track(self):
        current_km = 0.0
        for r in self.ROUTES:
            s1, s2, dist = r
            c1, c2 = self.CITIES[s1], self.CITIES[s2]
            segment = TrackSegment(
                segment_id=f"{s1}-{s2}",
                start_km=current_km,
                end_km=current_km + dist,
                max_capacity=20,
                speed_limit=110.0 if "MAO" not in s2 and "MAQ" not in s2 else 80.0,
                grade=np.random.uniform(-1, 1),
                start_lat=c1["lat"],
                start_lon=c1["lon"],
                end_lat=c2["lat"],
                end_lon=c2["lon"]
            )
            self.segments.append(segment)
            current_km += dist

    def add_train(self, train: Train):
        self.trains[train.id] = train
        self.operational_events.append({
            "severity": "info",
            "type": "Operations Notification",
            "message": f"New service {train.id} injected into system.",
            "segment": "Global"
        })

    def remove_train(self, train_id: str):
        if train_id in self.trains:
            del self.trains[train_id]
            self.operational_events.append({
                "severity": "info",
                "type": "Operations Notification",
                "message": f"Service {train_id} decommissioned from track.",
                "segment": "Global"
            })

    def clear_conflicts(self, segment_id: str = None):
        if segment_id == self.disruption_segment:
            self.disruption = "none"
            self.disruption_segment = None
            
        if segment_id == "Global":
            self.operational_events.clear()

        for segment in self.segments:
            if segment_id is None or segment.segment_id == segment_id:
                segment.conflicts.clear()

    def step(self):
        self.timestamp += self.dt
        for train_id, train in self.trains.items():
            self._update_train(train)
        self._update_track_occupancy()
        self._detect_conflicts()

    def _update_train(self, train: Train):
        speed_ms = train.speed * 1000 / 3600
        
        current_idx = next((i for i, s in enumerate(self.segments) if s.start_km <= train.position <= s.end_km), -1)
        if current_idx == -1:
            current_idx = 0
            train.position = self.segments[0].start_km
            
        current_segment = self.segments[current_idx]
        
        # Apply disruption logic
        effective_max_speed = train.max_speed
        if self.disruption == "blockage" and current_segment.segment_id == self.disruption_segment:
            effective_max_speed = 0 # Blocked segment
        elif self.disruption == "bottleneck" and current_segment.segment_id == self.disruption_segment:
            effective_max_speed = 30.0 # Speed restriction
        
        train.grade = current_segment.grade

        traction_force = self._calculate_traction_force(train, speed_ms)
        
        # Override traction if we need to stop/slow down
        if speed_ms > effective_max_speed * 1000 / 3600:
            traction_force = -train.deceleration * train.mass # Braking

        gravity_force = self._calculate_gravity_force(train)
        rolling_force = self._calculate_rolling_resistance(train, speed_ms)
        air_force = self._calculate_air_resistance(train, speed_ms)
        
        net_force = traction_force - (gravity_force + rolling_force + air_force)
        acceleration_ms2 = net_force / train.mass
        speed_ms += acceleration_ms2 * self.dt
        speed_ms = max(0, min(speed_ms, effective_max_speed * 1000 / 3600))
        
        if self._check_wheel_slip(train, traction_force):
            speed_ms *= 0.9
        
        distance_m = speed_ms * self.dt
        new_position = train.position + distance_m / 1000
        
        next_idx = next((i for i, s in enumerate(self.segments) if s.start_km <= new_position <= s.end_km), -1)
        
        if next_idx != -1 and next_idx != current_idx:
            curr_seg = self.segments[current_idx]
            next_seg = self.segments[next_idx]
            if curr_seg.segment_id.split('-')[1] != next_seg.segment_id.split('-')[0]:
                # Loop back
                start_idx = current_idx
                while start_idx > 0 and self.segments[start_idx-1].segment_id.split('-')[1] == self.segments[start_idx].segment_id.split('-')[0]:
                    start_idx -= 1
                new_position = self.segments[start_idx].start_km + 0.1
        elif next_idx == -1:
            # Reached absolute end of all segments
            start_idx = current_idx
            while start_idx > 0 and self.segments[start_idx-1].segment_id.split('-')[1] == self.segments[start_idx].segment_id.split('-')[0]:
                start_idx -= 1
            new_position = self.segments[start_idx].start_km + 0.1
            
        train.position = new_position
        train.speed = speed_ms * 3600 / 1000

        # Update lat/lon
        for segment in self.segments:
            if segment.start_km <= train.position <= segment.end_km:
                ratio = (train.position - segment.start_km) / max(0.001, segment.end_km - segment.start_km)
                train.lat = segment.start_lat + ratio * (segment.end_lat - segment.start_lat)
                train.lon = segment.start_lon + ratio * (segment.end_lon - segment.start_lon)
                break

    def _calculate_traction_force(self, train: Train, speed_ms: float) -> float:
        if speed_ms <= 0:
            return train.power * 1000
        max_force = train.power * 1000 / speed_ms
        return min(max_force, train.power * 1000 / 10)

    def _calculate_gravity_force(self, train: Train) -> float:
        g = 9.81
        theta = np.arctan(train.grade / 100)
        return train.mass * g * np.sin(theta)

    def _calculate_rolling_resistance(self, train: Train, speed_ms: float) -> float:
        g = 9.81
        theta = np.arctan(train.grade / 100)
        return train.rolling_resistance * train.mass * g * np.cos(theta)

    def _calculate_air_resistance(self, train: Train, speed_ms: float) -> float:
        return train.air_resistance * train.mass * speed_ms ** 2

    def _check_wheel_slip(self, train: Train, traction_force: float) -> bool:
        g = 9.81
        theta = np.arctan(train.grade / 100)
        normal_force = train.mass * g * np.cos(theta)
        max_friction = 0.6 * normal_force
        return traction_force > max_friction * (1 + train.wheel_slip_threshold)

    def _update_track_occupancy(self):
        for segment in self.segments:
            segment.occupancy = 0
            segment.conflicts.clear()
        
        for train in self.trains.values():
            for segment in self.segments:
                if segment.start_km <= train.position <= segment.end_km:
                    segment.occupancy += 1
                    break

    def _detect_conflicts(self):
        train_list = list(self.trains.values())
        for i in range(len(train_list)):
            for j in range(i + 1, len(train_list)):
                train1, train2 = train_list[i], train_list[j]
                distance_between = abs(train1.position - train2.position) * 1000
                if distance_between < self.safety_buffer and abs(train1.position - train2.position) < 1.0:
                    for segment in self.segments:
                        if segment.start_km <= train1.position <= segment.end_km:
                            if train2.id not in segment.conflicts:
                                segment.conflicts.append(train2.id)

    def get_state(self) -> Dict:
        alerts = []
        
        # Helper to find trains in a segment
        def get_trains_in_segment(seg_id):
            segment = next((s for s in self.segments if s.segment_id == seg_id), None)
            if not segment: return []
            return [t.id for t in self.trains.values() if segment.start_km <= t.position <= segment.end_km]

        # Add disruption alerts
        if self.disruption == "blockage":
            affected = get_trains_in_segment(self.disruption_segment)
            alerts.append({
                "severity": "critical",
                "type": "Signal Failure",
                "message": f"Critical signal malfunction detected in {self.disruption_segment}.",
                "segment": self.disruption_segment,
                "affected_trains": affected if affected else ["Approaching Traffic"]
            })
        elif self.disruption == "bottleneck":
            affected = get_trains_in_segment(self.disruption_segment)
            alerts.append({
                "severity": "high",
                "type": "Track Maintenance",
                "message": f"Speed restriction (30km/h) imposed in {self.disruption_segment}.",
                "segment": self.disruption_segment,
                "affected_trains": affected if affected else ["Approaching Traffic"]
            })
        elif self.disruption == "congestion":
             alerts.append({
                "severity": "medium",
                "type": "Peak Congestion",
                "message": "High traffic density detected in central corridor.",
                "segment": "All Central",
                "affected_trains": ["Multiple Services"]
            })

        # Add operational alerts
        for event in self.operational_events[-5:]:
            alerts.append({
                **event,
                "affected_trains": [event["message"].split(" ")[2]] if "New service" in event["message"] or "Service" in event["message"] else ["System"]
            })

        for segment in self.segments:
            # Add Capacity Alert
            utilization = (segment.occupancy / segment.max_capacity) * 100
            if utilization > 80:
                alerts.append({
                    "severity": "high",
                    "type": "Track Capacity Alert",
                    "message": f"High utilization ({utilization:.1f}%) in {segment.segment_id}.",
                    "segment": segment.segment_id,
                    "affected_trains": get_trains_in_segment(segment.segment_id)
                })

            for train_id in segment.conflicts:
                # Find the other train(s) it might be in conflict with
                t1 = self.trains.get(train_id)
                others = []
                if t1:
                    others = [t.id for t in self.trains.values() if t.id != train_id and abs(t.position - t1.position) * 1000 < self.safety_buffer]

                alerts.append({
                    "severity": "critical",
                    "type": "proximity_alert",
                    "message": f"Conflict detected in {segment.segment_id} between {train_id} and other traffic",
                    "segment": segment.segment_id,
                    "affected_trains": [train_id] + others
                })

        return {
            "timestamp": self.timestamp,
            "trains": [train.to_dict() for train in self.trains.values()],
            "segments": [segment.to_dict() for segment in self.segments],
            "metrics": self._calculate_metrics(),
            "alerts": alerts,
            "route": {
                "name": "Total South Indian Railway Network",
                "stations": list(self.CITIES.values())
            }
        }

    def _calculate_metrics(self) -> Dict:
        total_trains = len(self.trains)
        total_occupancy = sum(s.occupancy for s in self.segments)
        average_utilization = np.mean([s.occupancy / max(1, s.max_capacity) for s in self.segments]) * 100
        return {
            "total_trains": total_trains,
            "total_occupancy": total_occupancy,
            "average_utilization": round(average_utilization, 2),
            "total_conflicts": sum(len(s.conflicts) for s in self.segments)
        }

    def create_scenario(self, num_trains: int, disruption: str = "none") -> None:
        self.trains.clear()
        self.disruption = disruption or "none"
        train_codes = list(self.TRAIN_TYPES.keys())
        
        if self.disruption != "none":
            # Pick a random segment for the disruption
            self.disruption_segment = np.random.choice(self.segments).segment_id
        else:
            self.disruption_segment = None
        
        for i in range(num_trains):
            t_type_code = np.random.choice(train_codes)
            t_type = self.TRAIN_TYPES[t_type_code]
            train_no = f"{np.random.randint(12600, 22600)}"
            
            # Place train on a random segment
            segment = np.random.choice(self.segments)
            pos = np.random.uniform(segment.start_km, segment.end_km)
            
            # If congestion, pack some trains into the disruption area
            if self.disruption == "congestion" and self.disruption_segment and i < 5:
                 target_seg = next(s for s in self.segments if s.segment_id == self.disruption_segment)
                 pos = np.random.uniform(target_seg.start_km, target_seg.end_km)

            train = Train(
                id=f"{t_type_code}_{train_no}",
                position=pos,
                speed=np.random.uniform(40, t_type["max_speed"]),
                destination="Network Patrolling",
                max_speed=t_type["max_speed"],
                priority=t_type["priority"],
                lat=segment.start_lat,
                lon=segment.start_lon
            )
            self.add_train(train)

