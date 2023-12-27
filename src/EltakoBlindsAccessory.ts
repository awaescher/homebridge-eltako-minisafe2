import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';
import { IUpdatableAccessory } from './IUpdatableAccessory';

export class EltakoBlindsAccessory implements IUpdatableAccessory {
  private service: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    public readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.info.vendor)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.info.data)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.info.address);

    // https://developers.homebridge.io/#/service/WindowCovering
    const serviceType = this.platform.Service.WindowCovering;

    this.service = this.accessory.getService(serviceType) || this.accessory.addService(serviceType);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onSet(this.setCurrentPosition.bind(this))
      .onGet(this.getCurrentPosition.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onSet(this.setTargetPosition.bind(this))
      .onGet(this.getTargetPosition.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.PositionState)
      .onSet(this.setPositionState.bind(this))
      .onGet(this.getPositionState.bind(this));
  }

  async setCurrentPosition(value: CharacteristicValue) {
    const eltakoValue = this.transformToEltako(value);
    this.platform.log.debug(`Set ${this.accessory.context.device.info.sid} Current Position ${value} (Eltako ${eltakoValue})`);
    //unused: await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getCurrentPosition(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);

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
    // unused: await this.platform.miniSafe.setState(this.accessory.context.device.info.sid, 'on');
  }

  getPositionState(): CharacteristicValue {
    return this.platform.Characteristic.PositionState.STOPPED; // DECREASING 0, INCREASING 1, STOPPED 2
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