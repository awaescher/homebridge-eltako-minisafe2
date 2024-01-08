import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';
import { IUpdatableAccessory } from './IUpdatableAccessory';

export class EltakoTemperatureAndHumiditySensorAccessory implements IUpdatableAccessory {
  private humidityService: Service;
  private temperatureService: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    public readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.info.vendor)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.info.data)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.info.address);

    // https://developers.homebridge.io/#/service/HumiditySensor
    const humidityServiceType = this.platform.Service.HumiditySensor;
    this.humidityService = this.accessory.getService(humidityServiceType) || this.accessory.addService(humidityServiceType);

    this.humidityService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getCurrentRelativeHumidity.bind(this));

    // https://developers.homebridge.io/#/service/TemperatureSensor
    const temperatureServiceType = this.platform.Service.TemperatureSensor;
    this.temperatureService = this.accessory.getService(temperatureServiceType) || this.accessory.addService(temperatureServiceType);

    this.temperatureService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));
  }

  getCurrentRelativeHumidity(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.humidity ?? 0;
  }

  getCurrentTemperature(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.temperature ?? 0;
  }

  update() {
    this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).updateValue(this.getCurrentRelativeHumidity());
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature).updateValue(this.getCurrentTemperature());
  }
}
