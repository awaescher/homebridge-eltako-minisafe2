// run with 'ts-node test.ts'
// re-rerun homebridge with 'npm run build; homebridge -I -D' (-I for insecure to see the accessories)

import { MiniSafe2Api } from './src/MiniSafe2Api';

const miniSafe = new MiniSafe2Api('192.168.123.123', 'pass', 'accessToken');

miniSafe.getGateway().then(console.log);
miniSafe.getStates().then(console.log);
miniSafe.getState('15').then(console.log);
miniSafe.getSystems().then(console.log);