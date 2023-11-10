import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';
import { IUpdatableAccessory } from './IUpdatableAccessory';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class EltakoBlindsAccessory implements IUpdatableAccessory {
  private service: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    public readonly accessory: PlatformAccessory,
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
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onSet(this.setTargetPosition.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getTargetPosition.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.PositionState)
      .onSet(this.setPositionState.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getPositionState.bind(this));               // GET - bind to the `getOn` method below
  }

  async setCurrentPosition(value: CharacteristicValue) {
    const eltakoValue = this.transformToEltako(value);
    this.platform.log.debug(`Set ${this.accessory.context.device.info.sid} Current Position ${value} (Eltako ${eltakoValue})`);
    //await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getCurrentPosition(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);

    if (this.accessory.context.device.info.sid === '0D'){
      this.platform.log.info(`${this.accessory.context.device.info.sid} has ${state?.state?.pos}`);
    }

    const value = state?.state?.pos ?? 0;
    const eltakoValue = this.transformToEltako(value);

    return eltakoValue;
  }

  async setTargetPosition(value: CharacteristicValue) {
    const eltakoValue = this.transformToEltako(value);
    this.platform.log.debug(`Set ${this.accessory.context.device.info.sid} Target Position ${value} (Eltako ${eltakoValue})`);
    await this.platform.miniSafe.sendGenericCommand(this.accessory.context.device.info.sid, `moveTo${eltakoValue}`);
  }

  getTargetPosition(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    const value = state?.state?.pos ?? 0;
    const eltakoValue = this.transformToEltako(value);
    return eltakoValue;
  }

  async setPositionState(value: CharacteristicValue) {
    this.platform.log.debug('Set ' + this.accessory.context.device.info.sid + ' Position State ->', value);
    //await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getPositionState(): CharacteristicValue {
    // Characteristic.PositionState.DECREASING	0
    // Characteristic.PositionState.INCREASING	1
    // Characteristic.PositionState.STOPPED	2
    return this.platform.Characteristic.PositionState.STOPPED;
  }

  update() {
    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition).updateValue(this.getCurrentPosition());
    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition).updateValue(this.getTargetPosition());
    this.service.getCharacteristic(this.platform.Characteristic.PositionState).updateValue(this.getPositionState());
  }

  transformToEltako(value: CharacteristicValue) : number {
    // 10% open in Homebridge means 90% open in Eltako
    return 100 - Number(value);
  }
}