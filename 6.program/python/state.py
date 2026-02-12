# state.py
from dataclasses import dataclass, asdict
import threading
import time

@dataclass
class ImuState:
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0
    hz: float = 0.0
    connected: bool = False
    last_update_ms: int = 0

class SharedState:
    def __init__(self):
        self._lock = threading.Lock()
        self._imu = ImuState()

    def update_imu(self, **kwargs):
        with self._lock:
            for k, v in kwargs.items():
                setattr(self._imu, k, v)
            self._imu.last_update_ms = int(time.time() * 1000)

    def get_imu_dict(self):
        with self._lock:
            return asdict(self._imu)