import {API, Logger, PlatformAccessory, PlatformConfig} from 'homebridge';
import sinon from 'sinon';
import {Device} from '../models';
import {IUpdatableAccessory} from '../IUpdatableAccessory';


export function setupMocks() {

  const mockAccessories: PlatformAccessory[] = [];
  const PlatformAccessoryMock = class {

    constructor(displayName: string, uuid: string) {
      const accessory: PlatformAccessory = {
        UUID: uuid,
        displayName: displayName,
        context: {},
      } as unknown as PlatformAccessory;
      mockAccessories.push(accessory);
      return accessory as unknown as typeof PlatformAccessoryMock;
    }
  };
  const PlatformAccessoryClassMock = class {
    constructor(displayName: string, uuid: string) {
      const accessory: PlatformAccessory = {
        UUID: uuid,
        displayName: displayName,
        context: {},
        getService: sinon.stub(),
      } as unknown as PlatformAccessory;
      mockAccessories.push(accessory);
      return accessory;
    }
  };
  const registerPlatformAccessoriesMock = sinon.stub();
  const apiMock: API = {
    hap: {
      Service: {},
      Characteristic: {},
      uuid: {
        generate: sinon.stub().callsFake((input: string) => `mock-uuid-${input}`),
      },
    },
    platformAccessory: PlatformAccessoryClassMock,
    on: sinon.stub(),
    registerPlatformAccessories: registerPlatformAccessoriesMock,
  } as unknown as API;
  const mockLogger: Logger = {
    debug: sinon.stub(),
    info: sinon.stub(),
    warn: sinon.stub(),
    error: sinon.stub(),
  } as unknown as Logger;
  const mockConfig: PlatformConfig = {} as PlatformConfig;
  return {
    apiMock,
    mockLogger,
    mockConfig,
    registerPlatformAccessoriesMock,
    mockAccessories,
  };
}


export const NEW_DEVICE: Device = {
  name: 'Test Device',
  room: 1,
  info: {
    op: 1,
    sys: 'test',
    type: 'test',
    data: 'eltako_switch',
    vendor: 'Eltako',
    address: '12345',
    gateway: 1,
    virtual: false,
    sid: 'sid-123',
    _target: 'target',
  },
  index: 0,
  cloud: {
    enabled: false,
  },
} as unknown as Device;

export const EXISTING_ACCESSORY: PlatformAccessory = {
  UUID: 'mock-uuid-12345',
  displayName: 'Existing Test Device',
  context: {},
} as unknown as PlatformAccessory;

export const NEW_ACCESORY: IUpdatableAccessory = {
  update: () => {},
  accessory: {
    UUID: 'mock-uuid-12345',
    displayName: 'New Test Device',
    context: {},
  } as PlatformAccessory,
} as unknown as IUpdatableAccessory;

export const DEVICE_WITH_EMPTY_ADDRESS = {
  ...NEW_DEVICE,
  info: {
    ...NEW_DEVICE.info,
    address: '',
  },
};
export const DEVICE_WITH_EMPTY_TYPE = {
  ...NEW_DEVICE,
  info: {
    ...NEW_DEVICE.info,
    data: '',
  },
};
export const UNSUPPORTED_DEVICE = {
  ...NEW_DEVICE,
  info: {
    ...NEW_DEVICE.info,
    data: 'unsupported_device_type',
  },
};