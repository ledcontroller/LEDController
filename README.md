# LED-Controller,
is a restify-API, that can be used to control an Adafruit Dotstar LED-Strip.

It is build to run as a service on a Raspberry Pi Zero W. The `AnimationController` constantly updates an [Animation](#Animation). The complete `AnimationController` is designed to include [Notifications](#Notification) a Notification can be played at any time and pauses the current Aninmation. This allows your LEDs to Notify you eg. when you receive an E-Mail.

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
$ export NODE_ENV=production
# i don't want to edit the code (thus webpack is not required)
$ export NODE_ENV=development
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

## Dependencies

- Restify
- Dotstar
- pi-spi

# Editing the Code, what you need to know:

## Animation

An Animation is a class that implements the `IAnimation` interface. The interface requires an Animation to have a function called `update` that function is repeatedly called when the application is running. When the function is called, it gets an Dotstar-Object passed and an Array of LEDs. The Dotstar-Object is used to directly update the LEDs. The LED-Array is used for other Animations/Notifications to know what the Strip looks like. This means that you don't realy have to update the LEDs inside the LED-Array, but I recommed to do it anyways (At this point in time there is no Notification that actually uses the LED-Array, but some are planned).

## Notifiaction

A Notifiaction is an Animation with a limited runtime. A Nortification can be used to show that something happened. For example you could use IFTTT and create a trigger if you receive an E-Mail and if you have your [LED-Controller](#LED-Controller,) open to the internet (At your own risk) you could let your LEDs blink green once.

For the `Animation-Controller` to know whether an Notifiaction finished playing, an notification needs to implement the `INotifiaction` interface, which extends `IAnimation` the `INotification` interface requires the implementation of a function that takes a callback. This callback needs to be called when the Notification finished playing.

## Adding your own animation

> More to come
