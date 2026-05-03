import RPi.GPIO as GPIO

NET_PIN = 27
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(NET_PIN, GPIO.OUT)

print("🛑 Turning Net OFF...")
# Active LOW relay: HIGH = OFF
GPIO.output(NET_PIN, GPIO.HIGH)
GPIO.cleanup()
print("The net is now OFF.")
