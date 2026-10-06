"""
Deep Reinforcement Learning Agent for Railway Optimization
Uses Stable-Baselines3 for multi-agent coordination
"""

import numpy as np
from typing import Dict, Tuple, List
from stable_baselines3 import PPO, DQN
from gymnasium import Env, spaces
import json


class RailwayEnv(Env):
    """
    OpenAI Gym environment for railway scheduling
    """

    def __init__(self, num_trains: int = 10, track_length_km: float = 100.0):
        super(RailwayEnv, self).__init__()
        
        self.num_trains = num_trains
        self.track_length = track_length_km
        self.max_steps = 1000
        self.current_step = 0
        
        # Action space: speed adjustment for each train
        # -1: decelerate, 0: maintain, 1: accelerate
        self.action_space = spaces.Box(
            low=-1, high=1, shape=(num_trains,), dtype=np.float32
        )
        
        # Observation space: train positions, speeds, and track occupancy
        self.observation_space = spaces.Box(
            low=0, high=track_length_km, shape=(num_trains * 2 + 10,), dtype=np.float32
        )
        
        self.state = None
        self.reward_history = []

    def reset(self):
        """Reset environment to initial state"""
        self.current_step = 0
        self.state = self._initialize_state()
        return self.state, {}

    def _initialize_state(self) -> np.ndarray:
        """Initialize train positions and speeds"""
        state = np.zeros(self.num_trains * 2 + 10)
        
        # Initialize train positions (km)
        for i in range(self.num_trains):
            state[i] = np.random.uniform(0, self.track_length * 0.3)
        
        # Initialize train speeds (km/h normalized to 0-1)
        for i in range(self.num_trains):
            state[self.num_trains + i] = np.random.uniform(0.3, 1.0)
        
        return state

    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        """
        Execute one step of the environment
        
        Args:
            action: Speed adjustments for each train
            
        Returns:
            observation, reward, terminated, truncated, info
        """
        self.current_step += 1
        
        # Update train positions based on actions
        dt = 1.0  # time step in seconds
        
        for i in range(self.num_trains):
            # Action: -1 to 1 maps to deceleration to acceleration
            acceleration = action[i] * 2.0  # km/h per second
            
            # Update speed (cap at 120 km/h)
            current_speed = self.state[self.num_trains + i] * 120
            new_speed = np.clip(current_speed + acceleration * dt, 0, 120)
            self.state[self.num_trains + i] = new_speed / 120
            
            # Update position
            distance = (new_speed / 3600.0) * dt
            self.state[i] = np.clip(self.state[i] + distance, 0, self.track_length)
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Check termination
        terminated = self.current_step >= self.max_steps
        truncated = False
        
        info = {"step": self.current_step}
        
        return self.state, reward, terminated, truncated, info

    def _calculate_reward(self) -> float:
        """
        Calculate reward signal
        Reward components:
        - Positive for reducing delays
        - Positive for maintaining safe distances
        - Negative for conflicts
        """
        reward = 0.0
        
        # Reward for trains making progress
        progress_reward = np.sum(self.state[self.num_trains:self.num_trains + self.num_trains] >= 0.5) * 0.1
        reward += progress_reward
        
        # Penalty for trains bunching up (conflict detection)
        positions = self.state[:self.num_trains]
        for i in range(len(positions)):
            for j in range(i + 1, len(positions)):
                distance = abs(positions[i] - positions[j])
                if distance < 0.5:  # Too close (500m)
                    reward -= 1.0
        
        # Reward for reaching destination
        destinations = np.sum(positions >= self.track_length * 0.9)
        reward += destinations * 0.5
        
        return reward

    def render(self):
        """Render environment state (optional)"""
        pass


class MultiAgentDRLController:
    """
    Multi-Agent Deep Reinforcement Learning Controller
    Coordinates multiple train agents for optimal scheduling
    """

    def __init__(self, num_trains: int = 10, model_name: str = "ppo"):
        self.num_trains = num_trains
        self.model_name = model_name
        self.env = RailwayEnv(num_trains=num_trains)
        self.model = self._initialize_model()
        self.training_history = []

    def _initialize_model(self):
        """Initialize DRL model"""
        if self.model_name == "ppo":
            return PPO(
                policy="MlpPolicy",
                env=self.env,
                verbose=1,
                learning_rate=3e-4,
                n_steps=2048,
                batch_size=64,
                n_epochs=20
            )
        elif self.model_name == "dqn":
            return DQN(
                policy="MlpPolicy",
                env=self.env,
                verbose=1,
                learning_rate=1e-3,
                buffer_size=50000,
                batch_size=32
            )

    def train(self, total_timesteps: int = 100000):
        """
        Train the DRL model
        
        Args:
            total_timesteps: Total number of environment steps
        """
        print(f"Training {self.model_name.upper()} model for {total_timesteps} steps...")
        self.model.learn(total_timesteps=total_timesteps)
        print("Training completed!")

    def predict_actions(self, observations: np.ndarray) -> np.ndarray:
        """
        Predict optimal actions for given observations
        
        Args:
            observations: Current state observations
            
        Returns:
            Recommended speed adjustments for each train
        """
        actions, _ = self.model.predict(observations, deterministic=True)
        return actions

    def save_model(self, path: str):
        """Save trained model"""
        self.model.save(path)
        print(f"Model saved to {path}")

    def load_model(self, path: str):
        """Load trained model"""
        self.model = self.model.load(path, env=self.env)
        print(f"Model loaded from {path}")

    def evaluate(self, num_episodes: int = 10) -> Dict:
        """
        Evaluate model performance
        
        Args:
            num_episodes: Number of evaluation episodes
            
        Returns:
            Performance metrics
        """
        rewards = []
        episode_lengths = []
        
        for _ in range(num_episodes):
            obs, _ = self.env.reset()
            done = False
            episode_reward = 0.0
            steps = 0
            
            while not done:
                action, _ = self.model.predict(obs, deterministic=True)
                obs, reward, terminated, truncated, _ = self.env.step(action)
                episode_reward += reward
                steps += 1
                done = terminated or truncated
            
            rewards.append(episode_reward)
            episode_lengths.append(steps)
        
        return {
            "mean_reward": np.mean(rewards),
            "std_reward": np.std(rewards),
            "mean_episode_length": np.mean(episode_lengths),
            "max_reward": np.max(rewards),
            "min_reward": np.min(rewards)
        }


class ConflictResolver:
    """
    Rule-based conflict resolution using hybrid AI-Rule engine
    Ensures adherence to safety standards while optimizing flow
    """

    def __init__(self, safety_buffer_m: float = 500.0):
        self.safety_buffer = safety_buffer_m / 1000.0  # convert to km
        self.max_speed_limit = 120.0  # km/h

    def check_conflict(self, train_positions: List[float]) -> List[Tuple[int, int]]:
        """
        Check for conflicts between trains
        
        Args:
            train_positions: List of train positions (km)
            
        Returns:
            List of conflicting train pairs (indices)
        """
        conflicts = []
        
        for i in range(len(train_positions)):
            for j in range(i + 1, len(train_positions)):
                distance = abs(train_positions[i] - train_positions[j])
                if distance < self.safety_buffer:
                    conflicts.append((i, j))
        
        return conflicts

    def resolve_conflicts(self, actions: np.ndarray, train_positions: List[float], 
                         train_speeds: List[float]) -> np.ndarray:
        """
        Adjust DRL actions to resolve conflicts while respecting safety rules
        
        Args:
            actions: Recommended actions from DRL model
            train_positions: Current train positions
            train_speeds: Current train speeds
            
        Returns:
            Modified actions ensuring safety compliance
        """
        modified_actions = actions.copy()
        
        conflicts = self.check_conflict(train_positions)
        
        for idx1, idx2 in conflicts:
            if train_positions[idx1] < train_positions[idx2]:
                # Train 1 should slow down or maintain
                modified_actions[idx1] = np.clip(modified_actions[idx1], -1.0, 0.0)
                # Train 2 should speed up or maintain (if possible)
                modified_actions[idx2] = np.clip(modified_actions[idx2], 0.0, 1.0)
            else:
                # Train 2 should slow down
                modified_actions[idx2] = np.clip(modified_actions[idx2], -1.0, 0.0)
                # Train 1 should speed up
                modified_actions[idx1] = np.clip(modified_actions[idx1], 0.0, 1.0)
        
        # Enforce speed limits
        for i in range(len(modified_actions)):
            if train_speeds[i] >= self.max_speed_limit * 0.9:
                modified_actions[i] = np.clip(modified_actions[i], -1.0, 0.0)
        
        return modified_actions


# Example usage
if __name__ == "__main__":
    print("=" * 60)
    print("DRL Multi-Agent Control System - Initialization")
    print("=" * 60)
    
    # Create controller
    controller = MultiAgentDRLController(num_trains=10, model_name="ppo")
    print(f"✓ DRL Controller initialized with {controller.num_trains} trains")
    
    # Quick evaluation before training
    print("\nInitial model evaluation (untrained):")
    metrics = controller.evaluate(num_episodes=2)
    print(json.dumps(metrics, indent=2))
    
    # Initialize conflict resolver
    resolver = ConflictResolver(safety_buffer_m=500.0)
    print("\n✓ Conflict resolver initialized")
    
    print("\n" + "=" * 60)
    print("System ready for training!")
    print("=" * 60)
