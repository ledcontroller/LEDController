# LED-Controller,
is a restify-API, that can be used to control an Adafruit Dotstar LED-Strip.

It is build to run as a service on a Raspberry Pi Zero W. The `AnimationController` constantly updates an [Animation](#Animation). The complete `AnimationController` is designed to include [Notifications](#Notification), a Notification can be played at any time and pauses the current Aninmation. This allows your LEDs to Notify you eg. when you receive an E-Mail.

<p align="center">
  <img src="./img/Notification.gif" alt="Notifiaction"
       width="654" height="450">
</p>

## Installation

First, clone the repo:
```bash
$ git clone https://github.com/Lucarus/LEDController.git
```

Set your NODE_ENV:
```bash
# i want to edit the code
$ export NODE_ENV=development
# i don't want to edit the code (thus webpack is not required)
$ export NODE_ENV=production
```

Install all the dependencies using `npm` or [yarn](https://yarnpkg.com/lang/en/)
```bash
$ yarn install
# OR
$ npm insall
```

If you changed some of the code you'll need to run webpack
```bash
$ yarn webpack
# OR (does the same)
$ npm run build
```

Make it executable
```bash
# this requires root
$ chmod +X ./LED-Controller.js
```

Create the service for systemd (I don't know how to do this for systems that don't use systemd). Name it the way you want to call it form systemctl later. The file must end with: `.service`
```ini
[Unit]
Description=LED Controller

[Service]
ExecStart=/led/js/LED-Controller.js
Restart=always
WorkingDirectory=/led/js/

[Install]
WantedBy=multi-user.target
```
Or you can directly edit `LED-Controller.service` from the repo and change your path to the application.

Now that you created or updated the service file, you need to copy it to the right place
```bash
# this might also require root (not sure tho)
$ cp ./LED-Controller.service /etc/systemd/system/
```

Now reload `systemctl`
```bash
$ systemctl daemon-reload
```

And finally start the whole thing :)
```bash
$ systemctl start LED-Controller
# if you named your service file different you need to use your filename (this time without .service)
```

## Start Parameters

LED-Controller can be configuered using some parameters at startup.
- **token:** sets the Token, that will be checked for access to the API. (There is nothing spezial to it, just a string that has to be preset in all requests to the API). Defaults to `SUPERSECRETCODE` (PLS change that).
- **port:** sets the Port restify will be listening at. Defaults to 1234. (thanks mom)
- **ups:** sets the updates per second, determines how fast/smooth your animations will look. (This can later be changed by restarting the Application via the API). Defaults to 120.
- **ledcount:** the number of LEDs your strip uses. Defaults to 182.
- **spi:** the path to the SPI-Bus the strip is attached to (remember to use a logic shifter for the 5v) Defaults to `/dev/spidev0.0`.

Example:
```bash
$ node ./LED-Controller -token="This is so secret, it can access the API" -ups=60 -ledcount=60
```
Also works inside the `.service` file


# API how it works

> more to come

# Editing the Code, what you need to know:

## Animation

An Animation is a class that implements the `IAnimation` interface. The interface requires an Animation to have a function called `update` that function is repeatedly called when the application is running. When the function is called, it gets an Dotstar-Object passed and an Array of LEDs. The Dotstar-Object is used to directly update the LEDs. The LED-Array is used for other Animations/Notifications to know what the Strip looks like. This means that you don't realy have to update the LEDs inside the LED-Array, but I recommed to do it anyways (At this point in time there is no Notification that actually uses the LED-Array, but some are planned).

## Notifiaction

A Notifiaction is an Animation with a limited runtime. A Notification can be used to show that something happened. For example you could use IFTTT and create a trigger if you receive an E-Mail and if you have your [LED-Controller](#LED-Controller,) open to the internet (At your own risk) you could let your LEDs blink green once.

For the `Animation-Controller` to know whether an Notifiaction finished playing, an notification needs to implement the `INotifiaction` interface, which extends `IAnimation` the `INotification` interface requires the implementation of a function that takes a callback. This callback needs to be called when the Notification finished playing.

## Adding your own animation

> More to come

## Final words

This application was my first take on using Typescript, I learned many cool things in the process. I hope you have much fun looking at my code and testing it youself :)

If you find any inconvenient parts in my code, please don't hasitate to tell me :) 
