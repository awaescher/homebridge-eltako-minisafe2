import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { EltakoMiniSafe2Platform } from './platform';
import { IUpdatableAccessory } from './IUpdatableAccessory';

export class EltakoThermostatAccessory implements IUpdatableAccessory {
  private service: Service;

  constructor(
    private readonly platform: EltakoMiniSafe2Platform,
    public readonly accessory: PlatformAccessory,
  ) {

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.info.vendor)
      .setCharacteristic(this.platform.Characteristic.Model, accessory.context.device.info.data)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.info.address);

    // https://developers.homebridge.io/#/service/Thermostat
    const serviceType = this.platform.Service.Thermostat;
    this.service = this.accessory.getService(serviceType) || this.accessory.addService(serviceType);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.getCurrentHeatingCoolingState.bind(this))
      .onSet(this.setCurrentHeatingCoolingState.bind(this))
      .setProps({
        validValues: [
          this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
          this.platform.Characteristic.CurrentHeatingCoolingState.HEAT,
        ],
        maxValue: this.platform.Characteristic.CurrentHeatingCoolingState.HEAT,
      });

    this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(this.getTargetHeatingCoolingState.bind(this))
      .onSet(this.setTargetHeatingCoolingState.bind(this))
      .setProps({
        validValues: [
          this.platform.Characteristic.TargetHeatingCoolingState.OFF,
          this.platform.Characteristic.TargetHeatingCoolingState.HEAT,
        ],
        maxValue: this.platform.Characteristic.TargetHeatingCoolingState.HEAT,
      });

    this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(this.getTargetTemperature.bind(this))
      .onSet(this.setTargetTemperature.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.getTemperatureDisplayUnits.bind(this));
  }

  getCurrentTemperature(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.temperature ?? 0;
  }

  getCurrentHeatingCoolingState(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    const mode = state?.state?.operation_mode ?? '';

    if (mode === 'off') {
      return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
    }

    return this.platform.Characteristic.CurrentHeatingCoolingState.HEAT;
  }

  async setCurrentHeatingCoolingState(value: CharacteristicValue) {
    const operationMode = value === this.platform.Characteristic.CurrentHeatingCoolingState.OFF ? 'off' : 'on';
    await this.platform.miniSafe.sendGenericCommandWithValue(this.accessory.context.device.info.sid, 'operation_mode', operationMode);
  }

  getTargetHeatingCoolingState(): CharacteristicValue {
    return this.getCurrentHeatingCoolingState();
  }

  async setTargetHeatingCoolingState(value: CharacteristicValue) {
    this.setCurrentHeatingCoolingState(value);
  }

  getTargetTemperature(): CharacteristicValue {
    const state = this.platform.deviceStateCache.find(s => s.sid === this.accessory.context.device.info.sid);
    return state?.state?.setpoint ?? 0;
  }

  async setTargetTemperature(value: CharacteristicValue) {
    const command = `tempTo${value}`;
    this.platform.log.debug(`Set ${this.accessory.context.device.info.sid} Target Temperature to ${value} with command ` + command);
    await this.platform.miniSafe.sendGenericCommand(this.accessory.context.device.info.sid, command);
  }

  getTemperatureDisplayUnits(): CharacteristicValue {
    return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  update() {
    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .updateValue(this.getCurrentTemperature());

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .updateValue(this.getCurrentHeatingCoolingState());

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .updateValue(this.getTargetHeatingCoolingState());

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .updateValue(this.getTargetTemperature());

    this.service
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .updateValue(this.getTemperatureDisplayUnits());
  }
}
