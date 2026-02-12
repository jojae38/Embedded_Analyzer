# protocol/codec.py
from .message import ImuPacket, Command

def encode_imu_csv(p: ImuPacket) -> bytes:
    return f"{p.roll:.2f},{p.pitch:.2f},{p.yaw:.2f}".encode("utf-8")

def decode_imu_csv(data: bytes) -> ImuPacket:
    s = data.decode("utf-8").strip()
    r, p, y = s.split(",")
    return ImuPacket(float(r), float(p), float(y))

def encode_cmd_text(c: Command) -> bytes:
    return c.cmd.strip().upper().encode("utf-8")

def decode_cmd_text(data: bytes) -> Command:
    return Command(data.decode("utf-8").strip().upper())