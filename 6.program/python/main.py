if __name__ == "__main__":
    import threading
import time
import math
import socket
from dataclasses import dataclass, asdict

from flask import Flask, jsonify, request
import webview

# -----------------------------
# Shared state (IMU data)
# -----------------------------
@dataclass
class ImuState:
    roll: float = 0.0
    pitch: float = 0.0
    yaw: float = 0.0
    hz: float = 0.0
    connected: bool = True
    last_update_ms: int = 0

state = ImuState()
state_lock = threading.Lock()

# -----------------------------
# (Optional) UDP broadcast to Unity later
# -----------------------------
UDP_ENABLE = True
UDP_TARGET_IP = "127.0.0.1"
UDP_TARGET_PORT = 5005
udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def udp_send(msg: str):
    if not UDP_ENABLE:
        return
    udp_sock.sendto(msg.encode("utf-8"), (UDP_TARGET_IP, UDP_TARGET_PORT))

# -----------------------------
# Bridge thread (replace with Serial/BLE later)
# -----------------------------
def imu_loop():
    t = 0.0
    last = time.time()
    count = 0

    while True:
        # demo: fake IMU motion
        roll = 30.0 * math.sin(t)
        pitch = 15.0 * math.sin(t * 0.7)
        yaw = 60.0 * math.sin(t * 0.3)

        now = time.time()
        count += 1
        if now - last >= 1.0:
            hz = count / (now - last)
            last = now
            count = 0
        else:
            hz = None

        with state_lock:
            state.roll = roll
            state.pitch = pitch
            state.yaw = yaw
            if hz is not None:
                state.hz = hz
            state.connected = True
            state.last_update_ms = int(now * 1000)

        # Unity 확장용: UDP로도 쏴주기 (CSV)
        udp_send(f"{roll:.2f},{pitch:.2f},{yaw:.2f}")

        t += 0.05
        time.sleep(0.02)  # 50 Hz

# -----------------------------
# Flask API
# -----------------------------
app = Flask(__name__)

@app.get("/api/state")
def api_state():
    with state_lock:
        return jsonify(asdict(state))

@app.post("/api/cmd")
def api_cmd():
    data = request.get_json(force=True)
    cmd = (data.get("cmd") or "").strip().upper()

    # 여기서 실제로는: 시리얼로 장비에 명령 보내기 / 상태머신 변경 등
    if cmd == "RESET":
        # demo action
        return jsonify(ok=True, msg="RESET accepted")
    elif cmd == "CALIB_START":
        return jsonify(ok=True, msg="CALIB_START accepted")
    else:
        return jsonify(ok=False, msg=f"Unknown cmd: {cmd}"), 400

@app.get("/")
def index():
    # 최소 UI (CDN 없이, 한 페이지)
    return """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>IMU Viewer</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 18px; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 14px; max-width: 520px; }
    .row { display:flex; gap:14px; flex-wrap:wrap; }
    .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#f3f3f3; }
    button { padding:10px 12px; border-radius:10px; border:1px solid #ccc; cursor:pointer; }
    button:hover { background:#f7f7f7; }
    pre { background:#fafafa; padding:10px; border-radius:10px; border:1px solid #eee; }
  </style>
</head>
<body>
  <h2>IMU Local Tool</h2>
  <div class="card">
    <div class="row">
      <div class="pill" id="conn">connected: ?</div>
      <div class="pill" id="hz">Hz: ?</div>
      <div class="pill" id="ts">last: ?</div>
    </div>

    <h3>Attitude</h3>
    <pre id="att">roll: ?\npitch: ?\nyaw: ?</pre>

    <div class="row">
      <button onclick="sendCmd('RESET')">RESET</button>
      <button onclick="sendCmd('CALIB_START')">CALIB_START</button>
    </div>
  </div>

<script>
async function refresh(){
  const r = await fetch('/api/state');
  const s = await r.json();

  document.getElementById('conn').textContent = 'connected: ' + s.connected;
  document.getElementById('hz').textContent = 'Hz: ' + (s.hz?.toFixed ? s.hz.toFixed(1) : s.hz);
  document.getElementById('ts').textContent = 'last: ' + s.last_update_ms;

  document.getElementById('att').textContent =
    'roll:  ' + s.roll.toFixed(2) + '\\n' +
    'pitch: ' + s.pitch.toFixed(2) + '\\n' +
    'yaw:   ' + s.yaw.toFixed(2);
}

async function sendCmd(cmd){
  const r = await fetch('/api/cmd', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({cmd})
  });
  const j = await r.json();
  alert(j.msg);
}

setInterval(refresh, 100);
refresh();
</script>
</body>
</html>
"""

def run_flask():
    # reloader 끄기: pywebview랑 같이 쓸 때 안정적
    app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)

if __name__ == "__main__":
    threading.Thread(target=imu_loop, daemon=True).start()
    threading.Thread(target=run_flask, daemon=True).start()

    # pywebview app window
    webview.create_window("IMU Tool", "http://127.0.0.1:5000", width=900, height=650)
    webview.start()
