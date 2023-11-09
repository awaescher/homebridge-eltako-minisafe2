import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EltakoBlindsAccessory {
  private service: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.info.vendor)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.info.data)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.info.address);

    const serviceType = this.platform.Service.WindowCovering;

    // get the switch service if it exists, otherwise create a new switch service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(serviceType) || this.accessory.addService(serviceType);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onSet(this.setCurrentPosition.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getCurrentPosition.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.PositionState)
      .onSet(this.setPositionState.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getPositionState.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onSet(this.setTargetPosition.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getTargetPosition.bind(this));               // GET - bind to the `getOn` method below

  }

  async setCurrentPosition(value: CharacteristicValue) {
    this.platform.log.debug('Set ' + this.accessory.context.device.info.sid + ' Characteristic Current Position ->', value);
    //await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getCurrentPosition(): CharacteristicValue {

    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    console.log(state);
    const position = state?.state?.pos ?? 0;

    this.platform.log.debug('Get ' + this.accessory.context.device.info.sid + ' Characteristic Current Position ->', position);

    return position;
  }


  async setPositionState(value: CharacteristicValue) {
    this.platform.log.debug('Set ' + this.accessory.context.device.info.sid + ' Characteristic Position State ->', value);
    //await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getPositionState(): CharacteristicValue {

    // DECREASING	Characteristic.PositionState.DECREASING	0
    // INCREASING	Characteristic.PositionState.INCREASING	1
    // STOPPED	Characteristic.PositionState.STOPPED	2

    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    console.log(state);
    const position = state?.state?.pos ?? 0;

    this.platform.log.debug('Get ' + this.accessory.context.device.info.sid + ' Characteristic Position State ->', position);

    return position;
  }


  async setTargetPosition(value: CharacteristicValue) {
    this.platform.log.debug('Set ' + this.accessory.context.device.info.sid + ' Characteristic Target Position ->', value);
    //await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getTargetPosition(): CharacteristicValue {

    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    console.log(state);
    const position = state?.state?.pos ?? 0;

    this.platform.log.debug('Get ' + this.accessory.context.device.info.sid + ' Characteristic Target Position ->', position);

    return position;
  }
}