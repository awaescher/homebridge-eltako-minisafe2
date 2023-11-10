import { GatewayDetailInfo, SystemConfig, DeviceResponse, Device } from './models';

import axios from 'axios';

export class MiniSafe2Api {

  constructor(
    private readonly gatewayIp: string,
    private readonly gatewayPassword: string,
    private readonly gatewayAccessToken: string,
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
    return response.data.XC_SUC;
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

  buildUrl(route: string) {

    const separator = route.includes('?') ? '&' : '?';

    if (this.gatewayPassword) {
      return `http://${this.gatewayIp}${route}${separator}XC_PASS=${this.gatewayPassword}`;
    }

    if (this.gatewayAccessToken) {
      return `http://${this.gatewayIp}${route}${separator}at=${this.gatewayAccessToken}`;
    }

    throw new Error('Neither the gateway password nor an alternative access token was given.');
  }
}