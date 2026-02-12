# bridge/bridge.py
import time, math
from state import SharedState
from protocol.message import ImuPacket, Command
from protocol.codec import encode_imu_csv, encode_cmd_text
from transport.udp import UdpSender

class Bridge:
    def __init__(self, shared: SharedState, imu_sender: UdpSender):
        self.shared = shared
        self.imu_sender = imu_sender
        self._running = True

    def stop(self):
        self._running = False

    def imu_loop(self):
        t = 0.0
        last = time.time()
        count = 0

        while self._running:
            roll = 30.0 * math.sin(t)
            pitch = 15.0 * math.sin(t * 0.7)
            yaw = 60.0 * math.sin(t * 0.3)

            now = time.time()
            count += 1
            hz = 0.0
            if now - last >= 1.0:
                hz = count / (now - last)
                count = 0
                last = now

            self.shared.update_imu(
                roll=roll, pitch=pitch, yaw=yaw,
                hz=hz, connected=True
            )

            pkt = ImuPacket(roll, pitch, yaw)
            self.imu_sender.send(encode_imu_csv(pkt))

            t += 0.05
            time.sleep(0.02)

    def handle_command(self, cmd: Command) -> str:
        # 여기서 실제로는 "시리얼로 RESET 보내기" 같은 동작
        if cmd.cmd == "RESET":
            return "RESET accepted"
        if cmd.cmd == "CALIB_START":
            return "CALIB_START accepted"
        return f"Unknown cmd: {cmd.cmd}"