# transport/udp.py
import socket
from typing import Optional, Tuple

class UdpSender:
    def __init__(self, ip: str, port: int):
        self.addr = (ip, port)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send(self, payload: bytes):
        self.sock.sendto(payload, self.addr)

class UdpReceiver:
    def __init__(self, listen_ip: str, listen_port: int, bufsize: int = 2048):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((listen_ip, listen_port))
        self.sock.settimeout(0.5)
        self.bufsize = bufsize

    def recv(self) -> Optional[Tuple[bytes, Tuple[str, int]]]:
        try:
            data, addr = self.sock.recvfrom(self.bufsize)
            return data, addr
        except socket.timeout:
            return None