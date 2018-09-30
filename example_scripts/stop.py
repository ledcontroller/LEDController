from communicator import setupController, sendCommand

controllerURL = "http://tisch-led-rasbi:1234/tisch_leds/"


sendCommand(controllerURL + "api/animations/blink" ,{
	"token": "SUPERSECRETCODE",
	"animation": {
		"duration": 1000,
		"colors": [
			{"r": 0, "g": 0, "b": 0, "a": 1}
		]
	}
})


sendCommand(controllerURL + "api/stop" ,{
	"token": "SUPERSECRETCODE"
})