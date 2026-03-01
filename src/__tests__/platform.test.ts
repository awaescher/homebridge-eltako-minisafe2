import {API, Logger, PlatformAccessory, PlatformConfig} from 'homebridge';
import {expect} from 'chai';
import sinon from 'sinon';
import {EltakoMiniSafe2Platform} from '../platform';
import {
  DEVICE_WITH_EMPTY_ADDRESS,
  DEVICE_WITH_EMPTY_TYPE,
  EXISTING_ACCESSORY,
  NEW_ACCESORY,
  NEW_DEVICE,
  setupMocks,
  UNSUPPORTED_DEVICE,
} from './platform.test.data';

let mockAccessories: PlatformAccessory[];
let registerPlatformAccessoriesMock: sinon.SinonStub;
let apiMock: API;
let mockLogger: Logger;
let mockConfig: PlatformConfig;
let platform: EltakoMiniSafe2Platform;

describe('Platform class related tests', () => {
  beforeEach(() => {
    ({mockAccessories, registerPlatformAccessoriesMock, apiMock, mockConfig, mockLogger} = setupMocks());
  });
  describe('instantiateAccessory related tests', () => {
    let platform: EltakoMiniSafe2Platform;
    const homebridgeAccessory: PlatformAccessory = {} as PlatformAccessory;
    beforeEach(() => {
      platform = new EltakoMiniSafe2Platform(mockLogger, mockConfig, apiMock);
    });
    it('should return null for an unknown device', () => {
      const result = platform.instantiateAccessory('Not a valid device id', homebridgeAccessory);
      expect(result).to.be.null;
    });
  });

  describe('registerDiscoveredDevice related tests', () => {
    beforeEach(() => {
      platform = new EltakoMiniSafe2Platform(mockLogger, mockConfig, apiMock);
    });

    it('should warn and return early for device with empty address', () => {

      // Given / When
      platform.registerDiscoveredDevice(DEVICE_WITH_EMPTY_ADDRESS);

      // Then
      expect(platform.accessories.length).to.equal(0);
      expect(registerPlatformAccessoriesMock.callCount).to.equal(0);
    });

    it('should warn and return early for device with empty device type', () => {

      // Given / When
      platform.registerDiscoveredDevice(DEVICE_WITH_EMPTY_TYPE);

      // Then
      expect(platform.accessories.length).to.equal(0);
      expect(registerPlatformAccessoriesMock.callCount).to.equal(0);
    });

    it('should create new accessory when device is not already registered', () => {
      // Given
      sinon.stub(platform, 'instantiateAccessory').returns(NEW_ACCESORY);

      // When
      platform.registerDiscoveredDevice(NEW_DEVICE);

      // Then
      expect(registerPlatformAccessoriesMock.callCount).to.equal(1);
      expect(platform.accessoryInstances.length).to.equal(1);

    });

    it('should restore existing accessory when device is already registered', () => {
      // Given
      platform.accessories.push(EXISTING_ACCESSORY);
      sinon.stub(platform, 'instantiateAccessory').returns(NEW_ACCESORY);

      // When
      platform.registerDiscoveredDevice(NEW_DEVICE);

      // Then
      expect(registerPlatformAccessoriesMock.callCount).to.equal(0);
      expect(platform.accessoryInstances.length).to.equal(1);

    });

    it('should handle unsupported device types gracefully', () => {
      // Given / When
      platform.registerDiscoveredDevice(UNSUPPORTED_DEVICE);

      // Then
      expect(registerPlatformAccessoriesMock.callCount).to.equal(0);
      expect(platform.accessoryInstances.length).to.equal(0);
    });
  });
});
