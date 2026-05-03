import RPi.GPIO as GPIO

NET_PIN = 27
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(NET_PIN, GPIO.OUT)

print("⚡ Turning Net ON...")
# Active LOW relay: LOW = ON
GPIO.output(NET_PIN, GPIO.LOW)
print("The net is now ON. Run 'python3 test_net_off.py' to turn it off.")
