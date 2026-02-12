# app.py
import threading
import webview

from config import *
from state import SharedState
from transport.udp import UdpSender
from bridge.bridge import Bridge
from ui.server import create_app

def run_flask(app):
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=False, use_reloader=False)

if __name__ == "__main__":
    shared = SharedState()

    imu_sender = UdpSender(UDP_TARGET_IP, UDP_TARGET_PORT)
    bridge = Bridge(shared, imu_sender)

    app = create_app(shared, bridge)

    threading.Thread(target=bridge.imu_loop, daemon=True).start()
    threading.Thread(target=run_flask, args=(app,), daemon=True).start()

    webview.create_window("IMU Tool", f"http://{FLASK_HOST}:{FLASK_PORT}", width=900, height=650)
    webview.start()