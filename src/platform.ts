import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { EltakoSwitchAccessory } from './EltakoSwitchAccessory';
import { EltakoBlindsAccessory } from './EltakoBlindsAccessory';
import { MiniSafe2Api } from './MiniSafe2Api';
import { Device } from './models';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class EltakoMiniSafe2Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  public miniSafe!: MiniSafe2Api;
  public deviceStateCache: Device[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {

    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {

      this.log.info('Connecting to Eltako MiniSafe2 on ' + this.config.ip);

      try {
        this.miniSafe = new MiniSafe2Api(this.config.ip, this.config.password, this.config.accessToken);
        await this.updateDeviceStateCache();
        await this.discoverDevices();
      } catch (e) {
        if (typeof e === 'string') {
          this.log.error(e);
        } else if (e instanceof Error) {
          this.log.error(e.message);
        }
      }

      while (this.miniSafe) {
        try {
          await this.updateDeviceStateCache();
        } catch (e) {
          if (typeof e === 'string') {
            this.log.error(e);
          } else if (e instanceof Error) {
            this.log.error(e.message);
          }
        }
      }
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  async updateDeviceStateCache() {
    this.log.info('Updating device state cache ...');
    this.deviceStateCache = await this.miniSafe.getStates();
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async discoverDevices() {

    this.log.info('Discovering devices ...');

    let systemConfig;

    try {
      systemConfig = await this.miniSafe.getSystems();
    } catch (e) {
      if (typeof e === 'string') {
        this.log.error(e);
      } else if (e instanceof Error) {
        this.log.error(e.message);
      }
    }

    if (!systemConfig) {
      return;
    }

    this.log.info('Found ' + systemConfig.devices.length + ' device(s)');

    // loop over the discovered devices and register each one if it has not already been registered
    for (const device of systemConfig.devices) {

      const deviceType = device.info.data;

      if (device.info.address === '' || deviceType === '') {
        this.log.warn('Could not find the unique address or device type for device: ' + JSON.stringify(device));
        break;
      }

      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(device.info.address);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

      if (existingAccessory) {

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`
        switch (deviceType) {
          case 'eltako_blind': {
            new EltakoBlindsAccessory(this, existingAccessory);
            break;
          }
          case 'eltako_switch': {
            new EltakoSwitchAccessory(this, existingAccessory);
            break;
          }
          case 'eltako_weather': {
            //new EltakoSwitchAccessory(this, existingAccessory);
            //break;
            continue;
          }
        }

        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // create a new accessory
        const accessory = new this.api.platformAccessory(device.name, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        switch (deviceType) {
          case 'eltako_blind': {
            new EltakoBlindsAccessory(this, accessory);
            break;
          }
          case 'eltako_switch': {
            new EltakoSwitchAccessory(this, accessory);
            break;
          }
          case 'eltako_weather': {
            //new EltakoSwitchAccessory(this, accessory);
            //break;
            continue;
          }
        }

        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.name);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    }
  }
}
