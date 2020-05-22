# metaapi.cloud SDK for node.js

MetaApi is a powerful API for MetaTrader 4 and MetaTrader 5 terminals.
MetaApi is available in cloud and self-hosted options.

Official documentation: (https://metaapi.cloud/docs/client/)[https://metaapi.cloud/docs/client/]

## Installation
```bash
npm install --save metaapi.cloud-sdk
```

## Obtaining MetaApi token
You can obtain MetaApi token via https://app.metaapi.cloud/token UI.

## Add MetaTrader account to MetaApi
You can use (https://app.metaapi.cloud/accounts)[https://app.metaapi.cloud/accounts] UI to add a MetaTrader
account to MetaApi application. Alternatively you can use API as
demonstrated below.

### Add MetaTrader account to MetaApi via API
```javascript
import MetaApi from 'metaapi.cloud-sdk';

const token = '...';
const api = new MetaApi(token);

// if you do not have created a provisioning profile for your broker,
// you should do it before creating an account
const provisioningProfile = await api.provisioningProfileApi.createProvisioningProfile({
  name: 'My profile',
  type: 'standard',
  version: 5
});
// servers.dat file is required for MT5 profile and can be found inside
// config directory of your MetaTrader terminal data folder. It contains
// information about available broker servers
await provisioningProfile.uploadFile('servers.dat', '/path/to/servers.dat');
// for MT4, you should upload an .srv file instead
// await provisioningProfile.uploadFile('broker.srv', '/path/to/broker.srv');

// Alternatively you can retrieve an existing profile from API
// const provisioningProfile = await api.provisioningProfileApi.getProvisioningProfile('profileId');

// if you have not yet added your MetaTrader account, then add it
const account = await api.metatraderAccountApi.createAccount({
  name: 'Trading account #1',
  type: 'cloud',
  login: '1234567',
  // password can be investor password for read-only access
  password: 'qwerty',
  server: 'ICMarketsSC-Demo',
  // synchronizationMode can be 'automatic' for RPC access or 'user' if you
  // want to keep track of terminal state in real-time (e.g. if you are
  // developing a EA or trading strategy)
  synchronizationMode: 'automatic',
  provisioningProfileId: provisioningProfile.id,
  //algorithm used to parse your broker timezone. Supported values are
  // icmarkets for America/New_York DST switch and roboforex for EET
  // DST switch (the values will be changed soon)
  timeConverter: 'roboforex',
  application: 'MetaApi',
  magic: '123456'
});

// Alternatively you can retrieve an existing account from API
// const account = await api.metatraderAccountApi.getAccount('accountId');
```

## Access MetaTrader account via RPC API
RPC API let you query the trading terminal state. You should use
automatic synchronization mode if all you need is the RPC API.

```javascript
import MetaApi from 'metaapi.cloud-sdk';

const token = '...';
const api = new MetaApi(token);

const account = await api.metatraderAccountApi.getAccount('accountId');

const connection = account.connect();

// retrieve balance and equity
console.log(await connection.getAccountInformation());
// retrieve open positions
console.log(await connection.getPositions());
// retrieve a position by id
console.log(await connection.getPosition('1234567');
// retrieve pending orders
console.log(await connection.getOrders());
// retrieve a pending order by id
console.log(await connection.getOrder('1234567');
// retrieve history orders by ticket
console.log(await connection.getHistoryOrdersByTicket('1234567');
// retrieve history orders by position id
console.log(await connection.getHistoryOrdersByPosition('1234567');
// retrieve history orders by time range
console.log(await connection.getHistoryOrdersByTimeRange(startTime, endTime));
// retrieve history deals by ticket
console.log(await connection.getDealsByTicket('1234567');
// retrieve history deals by position id
console.log(await connection.getDealsByPosition('1234567');
// retrieve history deals by time range
console.log(await connection.getDealsByTimeRange(startTime, endTime));

// trade
console.log(await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.createMarketSellOrder('GBPUSD', 0.07, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.createLimitSellOrder('GBPUSD', 0.07, 1.5, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.createStopBuyOrder('GBPUSD', 0.07, 1.5, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.createStopSellOrder('GBPUSD', 0.07, 1.0, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE'));
console.log(await connection.modifyPosition('46870472', 2.0, 0.9));
console.log(await connection.closePositionPartially('46870472', 0.9));
console.log(await connection.closePosition('46870472'));
// this trade type is available for MT5 netting accounts only
console.log(await connection.closePositionBySymbol('EURUSD'));
console.log(await connection.modifyOrder('46870472', 0.07, 1.0, 2.0, 0.9));
console.log(await connection.cancelOrder('46870472'));

// Note: trade methods do not throw an exception if terminal have refused
// the trade, thus you must check the returned value
const result = await connection.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE');
if (result.description !== 'TRADE_RETCODE_DONE') {
  console.error('Trade was rejected by MetaTrader terminal with ' + result.description + ' error');
}

// you can release all MetaApi resource when you done using it
api.close();
```

## Synchronize with MetaTrader terminal state in real-time
If you are developing applications like trading strategy or an EA then
you'll likely need a real-time view of the terminal state. If this is
the case, then you should set your account synchronization mode to
'user' and use API below to access terminal state.

```javascript
import {MetaApi, HistoryStorage, SynchronizationListener} from 'metaapi.cloud-sdk';

const token = '...';
const api = new MetaApi(token);

const account = await api.metatraderAccountApi.getAccount('accountId');

// account.synchronizationMode must be equal to 'user' at this point

class MongodbHistoryStorage extends HistoryStorage {
  // implement the abstract methods, see MemoryHistoryStorage for sample
  // implementation
}

const historyStorage = new MongodbHistoryStorage();

// Note: if you will not specify history storage, then in-memory storage
// will be used (instalce of MemoryHistoryStorage)
const connection = account.connect(historyStorage);

// access local copy of terminal state
const terminalState = connection.terminalState;

console.log(terminalState.connected);
console.log(terminalState.connectedToBroker);
console.log(terminalState.accountInformation);
console.log(terminalState.positions);
console.log(terminalState.orders);
// symbol specifications
console.log(terminalState.specifications);
console.log(terminalState.specification('EURUSD'));
console.log(terminalState.price('EURUSD'));

// access history storage
const historyStorage = account.historyStorage;

// both orderSynchronizationFinished and dealSynchronizationFinished
// should be true once history synchronization have finished
console.log(historyStorage.orderSynchronizationFinished);
console.log(historyStorage.dealSynchronizationFinished);
// invoke other methods provided by your history storage
console.log(await historyStorage.yourMethod());

// receive synchronization event notifications
// first, implement your listener
class MySynchronizationListener extends SynchronizationListener {
  // override abstract methods you want to receive notifications for
}
// now add the listener
const listener = new MySynchronizationListener();
connection.addSynchronizationListener(listener);
// remove the listener when no longer needed
connection.removeSynchronizationListener(listener);

// close the connection to clean up resources
connection.close();

// you can release all MetaApi resource when you done using it
api.close();
```

Keywords: MetaTrader API, MetaTrader REST API, MetaTrader websocket API,
MetaTrader 5 API, MetaTrader 5 REST API, MetaTrader 5 websocket API,
MetaTrader 4 API, MetaTrader 4 REST API, MetaTrader 4 websocket API,
MT5 API, MT5 REST API, MT5 websocket API, MT4 API, MT4 REST API,
MT4 websocket API, MetaTrader SDK, MetaTrader SDK, MT4 SDK, MT5 SDK,
MetaTrader 5 SDK, MetaTrader 4 SDK, MetaTrader node.js SDK, MetaTrader 5
node.js SDK, MetaTrader 4 node.js SDK, MT5 node.js SDK, MT4 node.js SDK,
FX REST API, Forex REST API, Forex websocket API, FX websocket API, FX
SDK, Forex SDK, FX node.js SDK, Forex node.js SDK, Trading API, Forex
API, FX API, Trading SDK, Trading REST API, Trading websocket API,
Trading SDK, Trading node.js SDK
