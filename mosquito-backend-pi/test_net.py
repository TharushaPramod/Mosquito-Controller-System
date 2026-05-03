import RPi.GPIO as GPIO
import time
import sys

NET_PIN = 27

# Setup
GPIO.setwarnings(False)
# We set mode to BCM, which matches app.py that uses BCM
GPIO.setmode(GPIO.BCM)
GPIO.setup(NET_PIN, GPIO.OUT)

print(f"Turning NET (GPIO {NET_PIN}) ON for 5 seconds...")
# Relay logic depending on high/low trigger.
# Assuming active LOW from standard relay or active HIGH.
# In app.py: set_gpio(pump, state) does GPIO.output(pin, not state) if active low,
# but app.py line 60 says `active_low = True`.

# We will just write LOW (ON) then wait then HIGH (OFF)
# If active low:
GPIO.output(NET_PIN, GPIO.LOW)  # ON
print("Net should be ON now.")
time.sleep(5)

print("Turning NET OFF...")
GPIO.output(NET_PIN, GPIO.HIGH) # OFF
print("Net should be OFF now.")

# Optionally cleanup. However cleanup might reset other pins used by the main app,
# so we avoid GPIO.cleanup() to not break the background running app.py
print("Done. Check if the net triggered!")
