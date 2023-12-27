import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';
import { IUpdatableAccessory } from './IUpdatableAccessory';

export class EltakoDimmerAccessory implements IUpdatableAccessory {
  private service: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    public readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.info.vendor)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.info.data)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.info.address);

    // https://developers.homebridge.io/#/service/Lightbulb
    const serviceType = this.platform.Service.Lightbulb;

    this.service = this.accessory.getService(serviceType) || this.accessory.addService(serviceType);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setBrightness.bind(this))
      .onGet(this.getBrightness.bind(this));
  }

  async setOn(value: CharacteristicValue) {
    const command = value ? 'on' : 'off'; // valid commands: 'on' 'off' 'toggle'
    await this.platform.miniSafe.sendGenericCommand(this.accessory.context.device.info.sid, command);
  }

  getOn(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.state === 'on';
  }

  async setBrightness(value: CharacteristicValue) {
    await this.platform.miniSafe.sendGenericCommand(this.accessory.context.device.info.sid, `dimTo${Number(value)}`);
  }

  getBrightness(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.level ?? 0;
  }

  update() {
    this.service.getCharacteristic(this.platform.Characteristic.On).updateValue(this.getOn());
    this.service.getCharacteristic(this.platform.Characteristic.Brightness).updateValue(this.getBrightness());
  }
}
