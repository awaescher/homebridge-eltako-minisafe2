<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

# Homebridge Eltako for MiniSafe2

This plugin adds the devices from your [Eltako MiniSafe2](https://www.eltako.com/en/product/professional-smart-home-en/controllers-and-gateways-enocean-zigbee-knx-dali-mqtt-and-much-more/minisafe2/) to Apple HomeKit.

![GFA5 app and the Eltako MiniSafe2](docs/GFA5+MiniSafe2.png)
 Image by [Eltako GmbH](https://www.eltako.com/)

# Requirements

If you have your home setup up and running in the [Eltako GFA5](https://apps.apple.com/app/eltako-gfa5/id1555852467) app and you want to control these devices with Apple HomeKit, you came to the right place.

If you are not sure yet, here's what you need:
 - Your network needs to host an [Eltako MiniSafe2](https://www.eltako.com/en/product/professional-smart-home-en/controllers-and-gateways-enocean-zigbee-knx-dali-mqtt-and-much-more/minisafe2/) which is the bridge for the GFA5 app
   - You'll need it's IP address and the password to access it
 - The devices you want to control need to be pre-configured and ready to use in the GFA5 app

# Supported devices

Right now, the following devices are supported.

 - Switches (Switch or Light depending on their `target`)
 - Blinds

 I don't have any other devices to test. Donations welcome :)

# Limitations

 - The MiniSafe2 does not support change notifications, that's why values have to be polled in a loop. Also, the MiniSafe2 does not allow to poll the state of specific devices but returns the state of every device in your home. That's why calls might take up to 2 seconds or more which leads to a small delay to recognize state changes from outside HomeKit.
 - Blinds will only report their absolute position after they stopped in their target position. They won't provide any target values or their current state (going up, going down, stopped).

 # Disclaimer

 This plugin brings inofficial HomeKit support for some Eltako devices. It is not affiliated with Eltako GmbH or any other person except myself. I wrote this plugin for fun, use it at your own risk.