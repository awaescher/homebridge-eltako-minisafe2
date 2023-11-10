import { PlatformAccessory } from 'homebridge';

export interface IUpdatableAccessory {
    update(): void;
    accessory: PlatformAccessory;
}
