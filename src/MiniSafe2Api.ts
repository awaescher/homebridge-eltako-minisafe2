import { GatewayDetailInfo, SystemConfig, DeviceResponse, Device } from './models';

import axios from 'axios';

export class MiniSafe2Api {

  constructor(
    private readonly gatewayIp: string,
    private readonly gatewayPassword: string,
    private readonly gatewayAccessToken: string,
    private readonly gatewayUsername?: string,
  ) {
    if (!gatewayIp) {
      throw new Error('Gateway ip cannot be empty');
    }
    if (!gatewayPassword && !gatewayAccessToken) {
      throw new Error('Either password or accessToken has to be set');
    }
  }

  async getSystems(): Promise<SystemConfig> {

    const url = this.buildUrl('/file/config/iqpro/systems.json');

    const response = await axios.get<SystemConfig>(url);

    if (!Array.isArray(response.data?.devices)) {
      throw new Error('Gateway did not return the system configuration (devices missing). Raw response: '
        + this.describeResponse(response.data));
    }

    return response.data;
  }

  async getGateway(): Promise<GatewayDetailInfo> {

    const url = this.buildUrl('/info');

    const response = await axios.get<GatewayDetailInfo>(url);
    return response.data;

  }

  async getStates(): Promise<Device[]> {

    const url = this.buildUrl('/cmd?XC_FNC=GetStates');

    const response = await axios.get<DeviceResponse>(url, { timeout: 3000 });

    if (!Array.isArray(response.data?.XC_SUC)) {
      throw new Error('Gateway did not return device states (XC_SUC missing). Raw response: ' + this.describeResponse(response.data));
    }

    return response.data.XC_SUC;
  }

  private describeResponse(data: unknown): string {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      return (text ?? 'empty response').substring(0, 300);
    } catch {
      return 'unserializable response';
    }
  }


  async sendGenericCommand(sid: string, command: string) {

    const payload =
    {
      XC_FNC: 'SendGenericCmd',
      id: sid,
      data:
      {
        cmd: `${command}`,
      },
    };

    const url = this.buildUrl('/cmd');
    await axios.post(url, payload);
  }

  async sendGenericCommandWithValue(sid: string, command: string, value: string) {

    const payload =
    {
      XC_FNC: 'SendGenericCmd',
      id: sid,
      data:
      {
        cmd: `${command}`,
        value: `${value}`,
      },
    };

    const url = this.buildUrl('/cmd');
    await axios.post(url, payload);
  }

  buildUrl(route: string) {

    const separator = route.includes('?') ? '&' : '?';

    if (this.gatewayPassword) {
      // Newer firmwares with activated cloud access require XC_USER (the Eltako account e-mail) in addition to XC_PASS
      const user = this.gatewayUsername ? `XC_USER=${encodeURIComponent(this.gatewayUsername)}&` : '';
      return `http://${this.gatewayIp}${route}${separator}${user}XC_PASS=${encodeURIComponent(this.gatewayPassword)}`;
    }

    if (this.gatewayAccessToken) {
      return `http://${this.gatewayIp}${route}${separator}at=${encodeURIComponent(this.gatewayAccessToken)}`;
    }

    throw new Error('Neither the gateway password nor an alternative access token was given.');
  }
}