from communicator import setupController, sendCommand

controllerURL = "http://tisch-led-rasbi:1234/tisch_leds/"

setupController(controllerURL, "SUPERSECRETCODE", 120)
sendCommand(controllerURL + "api/animations/fade" ,{
	"token": "SUPERSECRETCODE",
	"animation": {
		"duration": 120,
		"smoothness": 5,
		"colors": [
			{"r": 253, "g": 106, "b": 2, "a":  0.75},
			{"r": 252, "g": 102, "b": 0, "a":  0.75},
			{"r": 255, "g": 191, "b": 0, "a":  0.75},
			{"r": 253, "g": 165, "b": 15, "a": 0.75}
		]
	}
})