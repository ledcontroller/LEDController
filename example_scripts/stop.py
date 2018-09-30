from communicator import setupController, sendCommand

controllerURL = "http://tisch-led-rasbi:1234/tisch_leds/"

sendCommand(controllerURL + "api/stop" ,{
	"token": "SUPERSECRETCODE"
})