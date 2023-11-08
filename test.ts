// run with 'ts-node test.ts'

import { GatewayDetailInfo, SystemConfig, DeviceResponse, Device } from './src/models';

import axios from 'axios';

const accessToken = 'XXX'; // works with password too http://X.X.X.X/info?XC_PASS=XXXX
const gatewayIp = '192.168.123.123';

getGateway(gatewayIp, accessToken).then(console.log);
getStates(gatewayIp, accessToken).then(console.log);
getSystems(gatewayIp, accessToken).then(console.log);

async function getSystems(gatewayIp: string, accessToken: string): Promise<SystemConfig> {

  const url = `http://${gatewayIp}/file/config/iqpro/systems.json?at=${accessToken}`;

  const response = await axios.get<SystemConfig>(url);
  return response.data;
}


async function getGateway(gatewayIp: string, accessToken: string): Promise<GatewayDetailInfo> {

  const url = `http://${gatewayIp}/info?at=${accessToken}`;

  const response = await axios.get<GatewayDetailInfo>(url);
  return response.data;

}

async function getStates(gatewayIp: string, accessToken: string): Promise<Device[]> {

  const url = `http://${gatewayIp}/cmd?XC_FNC=GetStates&at=${accessToken}`;
  const response = await axios.get<DeviceResponse>(url);
  return response.data.XC_SUC;
}

