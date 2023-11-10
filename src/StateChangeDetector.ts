
import { Device } from './models';

export function* getChangedDeviceAddresses(oldDevices: Device[], newDevices: Device[]): Generator<string> {

  for (const newDevice of newDevices) {

    const oldDevice = oldDevices.find(old => old.adr === newDevice.adr);

    const isNew = oldDevice === null || oldDevice === undefined;

    // state.state for switches
    // state.pos for blinds
    const isChanged = !isNew &&
              (
                (oldDevice?.state?.state !== newDevice.state?.state)
                  || (oldDevice?.state?.pos !== newDevice.state?.pos)
              );

    if (isNew || isChanged) {
      yield newDevice.adr;
    }
  }
}