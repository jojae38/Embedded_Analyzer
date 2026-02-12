# protocol/messages.py
from dataclasses import dataclass

@dataclass
class ImuPacket:
    roll: float
    pitch: float
    yaw: float

@dataclass
class Command:
    cmd: str  # e.g. "RESET", "CALIB_START"