#!/usr/bin/env python3
"""
================================================================
  Mosquito Controller System — Raspberry Pi 4 Hardware Backend
  File    : app.py
  Runs on : Raspberry Pi 4 (Raspbian Bookworm 12)
  Port    : 5001
  Author  : tharusha@raspberrypi
================================================================
  Controls:
    - Fan        → GPIO 17  (Relay 1)
    - Elec. Net  → GPIO 27  (Relay 2)
    - CO2 Valve  → GPIO 22  (Relay 3)
    - DHT22      → GPIO 4   (Sensor)
================================================================
  ⚠️  GPIO PINS: Change below if your wiring is different!
================================================================
"""

import time
import threading
import subprocess
import atexit

from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS

# ---------------------------------------------------------------
# GPIO + DHT22 — safely import (won't crash on non-Pi machine)
# ---------------------------------------------------------------
try:
    import RPi.GPIO as GPIO
    RPI_AVAILABLE = True
    print("[INFO] RPi.GPIO loaded ✅")
except ImportError:
    RPI_AVAILABLE = False
    print("[WARN] RPi.GPIO not found — running in MOCK mode (no real hardware)")

try:
    import Adafruit_DHT
    DHT_AVAILABLE = True
    print("[INFO] Adafruit_DHT loaded ✅")
except ImportError:
    DHT_AVAILABLE = False
    print("[WARN] Adafruit_DHT not found — sensor data will be mocked")

# ================================================================
# ⚙️  HARDWARE CONFIGURATION  — Edit these if your wiring differs
# ================================================================
FAN_PIN   = 17   # GPIO pin for Fan relay
NET_PIN   = 27   # GPIO pin for Electric Net relay
VALVE_PIN = 22   # GPIO pin for CO₂ Valve relay
DHT_PIN   = 4    # GPIO pin for DHT22 data wire
MOTION_PIN = 23  # GPIO pin for PIR Motion Sensor

DHT_SENSOR_TYPE = Adafruit_DHT.DHT22 if DHT_AVAILABLE else None

# Relay type: True = Active LOW (most 5V relay boards are active LOW)
ACTIVE_LOW = True

# ================================================================
# GPIO SETUP
# ================================================================
if RPI_AVAILABLE:
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)
    # Set all relay pins as OUTPUT, initial state = OFF
    for pin in [FAN_PIN, NET_PIN]:
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin, GPIO.HIGH if ACTIVE_LOW else GPIO.LOW)   # Start OFF
        
    # Set Valve to ALWAYS ON as requested
    GPIO.setup(VALVE_PIN, GPIO.OUT)
    GPIO.output(VALVE_PIN, GPIO.LOW if ACTIVE_LOW else GPIO.HIGH) # Start ON
    
    GPIO.setup(MOTION_PIN, GPIO.IN) # PIR Sensor Input
    print(f"[GPIO] Pins setup: Fan={FAN_PIN}, Net={NET_PIN}, Valve={VALVE_PIN} ( नेहमी ON), Motion={MOTION_PIN}")

# ================================================================
# STATE TRACKING
# ================================================================
component_states = {
    "fan":   False,
    "net":   False,
    "valve": True   # Always ON
}

# In-memory settings (same structure as your frontend expects)
settings = {
    "mode":                 "auto",   # Changed to auto by default so it works without the website
    "co2_enabled":          True,
    "co2_on_duration":      10,
    "co2_off_interval":     10,
    "net_duration":         5,
    "fan_duration":         5,
    "confidence_threshold": 0.5
}

# Detection Tracking
from datetime import datetime
detection_state = {
    "label": "none",
    "confidence": 0.0,
    "timestamp": "",
    "motion": True
}

# ================================================================
# FLASK APP
# ================================================================
app = Flask(__name__)
CORS(app, origins="*", supports_credentials=False)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# ================================================================
# CHROME PRIVATE NETWORK ACCESS FIX
# Chrome blocks localhost → private IP (192.168.x.x) unless this
# header is present on every response (including OPTIONS preflight)
# ================================================================
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"]          = "*"
    response.headers["Access-Control-Allow-Methods"]         = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"]         = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Private-Network"] = "true"  # ← Chrome PNA fix
    return response

@app.route("/", defaults={"path": ""}, methods=["OPTIONS"])
@app.route("/<path:path>", methods=["OPTIONS"])
def handle_options(path):
    """Handle CORS preflight (OPTIONS) for all routes — required by Chrome PNA"""
    response = app.make_response("")
    response.status_code = 204
    return response

# ================================================================
# HELPER — GPIO Control
# ================================================================
def set_gpio(pin, turn_on: bool):
    """
    turn_on=True  → activate relay (component ON)
    turn_on=False → deactivate relay (component OFF)
    """
    if not RPI_AVAILABLE:
        print(f"[MOCK] GPIO pin {pin} → {'ON' if turn_on else 'OFF'}")
        return
    if ACTIVE_LOW:
        GPIO.output(pin, GPIO.LOW if turn_on else GPIO.HIGH)
    else:
        GPIO.output(pin, GPIO.HIGH if turn_on else GPIO.LOW)

PIN_MAP = {
    "fan":   FAN_PIN,
    "net":   NET_PIN,
    "valve": VALVE_PIN
}

# ================================================================
# HELPER — Sensor Reads
# ================================================================
def read_cpu_temp() -> float:
    try:
        result = subprocess.run(
            ["vcgencmd", "measure_temp"],
            capture_output=True, text=True, timeout=3
        )
        # Output looks like: temp=47.8'C
        temp_str = result.stdout.strip().replace("temp=", "").replace("'C", "")
        return float(temp_str)
    except Exception:
        return 42.0   # mock fallback


def read_dht22():
    if DHT_AVAILABLE:
        humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR_TYPE, DHT_PIN)
        if humidity is not None and temperature is not None:
            return round(temperature, 1), round(humidity, 1)
    # Mock fallback
    return 28.5, 65.0

# ================================================================
# API ROUTES
# ================================================================

@app.route("/")
def index():
    return jsonify({
        "status":  "running",
        "message": "Mosquito Pi Backend is live 🦟",
        "gpio":    RPI_AVAILABLE,
        "dht22":   DHT_AVAILABLE
    })


# ─── Component Control ──────────────────────────────────────────
@app.route("/control", methods=["POST"])
def control_component():
    """
    POST /control
    Body: { "component": "fan"|"net"|"valve", "action": "on"|"off" }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    component = data.get("component", "").lower()
    action    = data.get("action", "").lower()

    if component not in PIN_MAP:
        return jsonify({"error": f"Unknown component '{component}'"}), 400
    if action not in ("on", "off"):
        return jsonify({"error": f"Invalid action '{action}'"}), 400

    turn_on = (action == "on")
    set_gpio(PIN_MAP[component], turn_on)
    component_states[component] = turn_on

    print(f"[CTRL] {component.upper()} → {action.upper()}")

    # Push live state update to all WebSocket clients
    socketio.emit("component_update", component_states)

    return jsonify({
        "status":    "ok",
        "component": component,
        "state":     action
    })

# ─── Detection & Logic Handling ─────────────────────────────────

def handle_mosquito_detected():
    """Mosquito detected → Electric Net ON for net_duration seconds"""
    print("[AUTO] Mosquito detected! Turning ON Net.")
    set_gpio(NET_PIN, True)
    component_states["net"] = True
    socketio.emit("component_update", component_states)
    
    def turn_off_net():
        time.sleep(settings.get("net_duration", 5))
        set_gpio(NET_PIN, False)
        component_states["net"] = False
        socketio.emit("component_update", component_states)
        print("[AUTO] Net turned OFF after duration.")
    
    threading.Thread(target=turn_off_net, daemon=True).start()

def handle_non_mosquito_detected():
    """Non-mosquito detected → Net OFF, Fan ON for fan_duration seconds"""
    print("[AUTO] Other creature detected! Ejecting...")
    # Safety: turn off net
    set_gpio(NET_PIN, False)
    component_states["net"] = False
    
    # Fan ON to eject
    set_gpio(FAN_PIN, True)
    component_states["fan"] = True
    socketio.emit("component_update", component_states)
    
    def turn_off_fan():
        time.sleep(settings.get("fan_duration", 5))
        set_gpio(FAN_PIN, False)
        component_states["fan"] = False
        socketio.emit("component_update", component_states)
        print("[AUTO] Fan turned OFF after ejection.")
    
    threading.Thread(target=turn_off_fan, daemon=True).start()

@app.route("/detection-event", methods=["POST"])
def detection_event():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON"}), 400

    label = data.get("label", "none")
    confidence = data.get("confidence", 0.0)
    
    detection_state.update({
        "label": label,
        "confidence": confidence,
        "timestamp": datetime.now().isoformat()
    })
    
    # Run logic only if in Auto mode
    if settings.get("mode") == "auto":
        if label == "mosquito" and confidence >= settings.get("confidence_threshold", 0.5):
            handle_mosquito_detected()
        elif label == "other":
            handle_non_mosquito_detected()
            
    socketio.emit("detection_update", detection_state)
    return jsonify({"status": "ok"})

@app.route("/motion", methods=["POST"])
def update_motion():
    data = request.get_json()
    has_motion = data.get("motion", True)
    detection_state["motion"] = has_motion
    
    if settings.get("mode") == "auto" and not has_motion:
        # No motion → Turn off net for safety
        if component_states["net"]:
            set_gpio(NET_PIN, False)
            component_states["net"] = False
            socketio.emit("component_update", component_states)
            print("[AUTO] No motion detected. Safety: Net OFF.")
    
    return jsonify({"status": "ok", "motion": has_motion})

@app.route("/detection-status", methods=["GET"])
def get_detection_status():
    return jsonify(detection_state)

# ─── Settings ───────────────────────────────────────────────────
@app.route("/settings", methods=["GET"])
def get_settings():
    return jsonify(settings)


@app.route("/settings", methods=["POST"])
def update_settings():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400
    settings.update(data)
    print(f"[SETTINGS] Updated: {data}")
    return jsonify({"status": "ok", "settings": settings})


# ─── Sensor Data ────────────────────────────────────────────────
@app.route("/sensor", methods=["GET"])
def get_sensor():
    """Returns real DHT22 data (or mock if sensor not available)"""
    temperature, humidity = read_dht22()
    return jsonify({
        "status": "success",
        "data": {
            "temperature":   temperature,
            "humidity":      humidity,
            "sensor_type":   "DHT22" if DHT_AVAILABLE else "DHT22 (Mock)"
        }
    })


# ─── System Status (CPU Temp) ────────────────────────────────────
@app.route("/status", methods=["GET"])
def get_status():
    """Returns CPU temperature and system health"""
    cpu_temp = read_cpu_temp()
    if cpu_temp > 80:
        status = "critical"
    elif cpu_temp > 70:
        status = "warning"
    else:
        status = "normal"
    return jsonify({
        "cpu_temp": cpu_temp,
        "status":   status
    })


# ─── Live Component States ───────────────────────────────────────
@app.route("/states", methods=["GET"])
def get_states():
    """Returns current ON/OFF state of all components"""
    return jsonify(component_states)


# ================================================================
# WEBSOCKET — Real-time sensor push thread
# ================================================================
def sensor_broadcast_loop():
    """
    Background thread: pushes sensor + CPU temp data to all
    connected WebSocket clients every 2 seconds.
    """
    while True:
        try:
            temperature, humidity = read_dht22()
            cpu_temp = read_cpu_temp()
            payload = {
                "temperature":      temperature,
                "humidity":         humidity,
                "cpu_temp":         cpu_temp,
                "component_states": component_states
            }
            socketio.emit("sensor_data", payload)
        except Exception as e:
            print(f"[Sensor Thread Error] {e}")
        time.sleep(2)

def motion_sensor_loop():
    """Polls PIR sensor and updates motion state - DISABLED TEMPORARILY"""
    while True:
        # if RPI_AVAILABLE:
        #     motion = GPIO.input(MOTION_PIN)  # Assuming 1 = motion, 0 = no motion
        #     detection_state["motion"] = bool(motion)
        #     
        #     if settings.get("mode") == "auto" and not motion:
        #         # No motion detected -> safety turn off
        #         if component_states["net"]:
        #             set_gpio(NET_PIN, False)
        #             component_states["net"] = False
        #             socketio.emit("component_update", component_states)
        #             print("[AUTO] No motion reading. Net OFF.")
        #     
        #     socketio.emit("motion_update", {"motion": bool(motion)})
        time.sleep(1)


@socketio.on("connect")
def on_connect():
    print(f"[WS] Client connected")
    # Send current states immediately on connect
    socketio.emit("component_update", component_states)


@socketio.on("disconnect")
def on_disconnect():
    print(f"[WS] Client disconnected")


# ================================================================
# CLEANUP on exit
# ================================================================
@atexit.register
def cleanup():
    print("[GPIO] Cleaning up GPIO pins...")
    if RPI_AVAILABLE:
        # Turn off all components before cleanup
        for pin in [FAN_PIN, NET_PIN, VALVE_PIN]:
            GPIO.output(pin, GPIO.HIGH if ACTIVE_LOW else GPIO.LOW)
        GPIO.cleanup()
    print("[GPIO] Done. Bye! 👋")


# ================================================================
# MAIN
# ================================================================
if __name__ == "__main__":
    print("=" * 55)
    print("  🦟  Mosquito Pi Backend")
    print(f"  GPIO:  {'REAL (RPi.GPIO)' if RPI_AVAILABLE else 'MOCK MODE'}")
    print(f"  DHT22: {'REAL sensor' if DHT_AVAILABLE else 'Mock data'}")
    print(f"  Fan  → GPIO {FAN_PIN}")
    print(f"  Net  → GPIO {NET_PIN}")
    print(f"  CO₂  → GPIO {VALVE_PIN}")
    print(f"  DHT  → GPIO {DHT_PIN}")
    print(f"  PIR  → GPIO {MOTION_PIN}")
    print("  Starting server on http://0.0.0.0:5001")
    print("=" * 55)

    # Start background sensor push thread
    sensor_thread = threading.Thread(
        target=sensor_broadcast_loop, daemon=True
    )
    sensor_thread.start()

    # Start motion sensor thread
    motion_thread = threading.Thread(
        target=motion_sensor_loop, daemon=True
    )
    motion_thread.start()

    # Start Flask-SocketIO server (accessible from all network interfaces)
    socketio.run(
        app,
        host="0.0.0.0",
        port=5001,
        debug=False,
        use_reloader=False,
        allow_unsafe_werkzeug=True   # ✅ Required for non-browser server environments
    )
