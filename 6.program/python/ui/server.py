# ui/server.py
from flask import Flask, jsonify, request
from protocol.codec import decode_cmd_text
from protocol.message import Command

def create_app(shared_state, bridge):
    app = Flask(__name__)

    @app.get("/favicon .ico")

    @app.get("/api/state")
    def api_state():
        return jsonify(shared_state.get_imu_dict())

    @app.post("/api/cmd")
    def api_cmd():
        data = request.get_json(force=True)
        cmd = Command((data.get("cmd") or "").strip().upper())
        msg = bridge.handle_command(cmd)
        ok = not msg.startswith("Unknown")
        return jsonify(ok=ok, msg=msg), (200 if ok else 400)

    @app.get("/")
    def index():
        return "UI는 여기서 템플릿/정적파일로 분리하면 됨"

    return app