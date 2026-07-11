# Softron Multicam Logger

This module will control the [Softron Multicam Logger](https://softron.tv/products/record/multicam-logger) application. To use this module the 'HTTP Remote Control' option must be ticked in the Multicam Logger application settings dialog.

## Configuration

You must enter the IP address (or hostname) of the computer running Multicam Logger in the module configuration. If it is running on the same computer as Companion use 127.0.0.1

Multicam Logger uses port 8888 for remote control, there is no need to change this setting unless you are using port forwarding.

If API authorization is enabled in Multicam Logger, enter your access token in the **Access Token** field. Leave it empty when authorization is disabled (the default).

To enable the continuous updating of variables and feedbacks use the Polling option (enabled by default). This will increase network traffic and the load on Companion and Multicam Logger. You may choose a polling interval, default is 1000ms.

The list of inputs shown in dropdowns is refreshed automatically every 10 seconds, so the module recovers by itself when Multicam Logger is started after Companion.

## Actions

- **Add Marker** add a text note to the log. This action will only work when logging is in the running state. The marker text supports Companion variables. A time reference can be chosen (Live, Playhead, In point, Out point or Absolute time) with an offset in seconds or timecode, which may be negative (e.g. -10 places the marker 10 seconds in the past).
- **Change Angle (Take)** Swap Program and Preview
- **Set Preview** Choose the angle for Preview. The list of available inputs updates automatically.
- **Set Program** Choose the angle for Program. The list of available inputs updates automatically.
- **Set Program & Preview** Set both angles with a single action.
- **Start Logging** Start the log.
- **Stop Logging** Stop the log.
- **Toggle Logging** Start or stop the log depending on the current state.
- **Update Input List** Update the list of inputs shown in the Program and Preview actions immediately.

## Feedbacks

Three feedback types are provided

- **Logging State** change background colour based on logging state
- **Preview Input** change background colour based on current preview input
- **Program Input** change background colour based on current program state

To ensure that the preview and program feedbacks update when changes are made outside of Companion polling must be enabled.

## Variables

Status information sent by the Multicam Logger application is stored in variables. If the polling config option is enabled then these variables are updated at the configured interval, otherwise they are updated only on startup and when a command is sent. The name of each input is also available as a variable.

## Presets

Ready made buttons are provided for logging (start / stop / toggle with timecode), markers, TAKE, program / preview angle selection with feedback, and timecode / document name displays.

## Version History

### 2.0.0

Updated for current Companion and Multicam Logger releases (tested with Multicam Logger 2.3).

- Fixed a crash when the status was received before a document was open
- The module now recovers automatically when Multicam Logger is started after Companion
- Marker text supports variables, time references (live, playhead, in point, out point, absolute) and offsets
- Optional access token for the API authorization feature of Multicam Logger
- New actions: Toggle Logging, Set Program & Preview
- Added presets and per input name variables
- Angle and marker commands are sent as POST requests with a JSON body
- Updated to @companion-module/base 1.14 on the node22 runtime, replaced 'got' with native fetch

### 1.0.0

First Release, tested with Multicam Logger version 2.2.7
