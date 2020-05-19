'use strict';

import should from 'should';
import MetaApiWebsocketClient from './metaApiWebsocket.client';
import Server from 'socket.io';
import NotConnectedError from "./notConnectedError";
import {InternalError} from "./errorHandler";

const metaapiApiUrl = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai';

/**
 * @test {MetaApiWebsocketClient}
 */
describe('MetaApiWebsocketClient', () => {

  let io;
  let server;
  let client;

  before(() => {
    client = new MetaApiWebsocketClient('token');
    client.url = 'http://localhost:6784';
  });

  beforeEach(async () => {
    io = new Server(6784, {path: '/ws'});
    io.on('connect', socket => {
      server = socket;
      if (socket.request._query['auth-token'] !== 'token') {
        socket.emit({error: 'UnauthorizedError', message: 'Authorization token invalid'});
        socket.close();
      }
    });
    await client.connect();
  });

  afterEach(async () => {
    let resolve;
    let promise = new Promise(res => resolve = res);
    client.close();
    io.close(() => resolve());
    await promise;
  });

  /**
   * @test {MetaApiWebsocketClient#getAccountInformation}
   */
  it('should retrieve MetaTrader account information from API', async () => {
    let accountInformation = {
      broker: 'True ECN Trading Ltd',
      currency: 'USD',
      server: 'ICMarketsSC-Demo',
      balance: 7319.9,
      equity: 7306.649913200001,
      margin: 184.1,
      freeMargin: 7120.22,
      leverage: 100,
      marginLevel: 3967.58283542
    };
    server.on('request', data => {
      if (data.type === 'getAccountInformation' && data.accountId === 'accountId') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId,
          accountInformation});
      }
    });
    let actual = await client.getAccountInformation('accountId');
    actual.should.match(accountInformation);
  });

  /**
   * @test {MetaApiWebsocketClient#getPositions}
   */
  it('should retrieve MetaTrader positions from API', async () => {
    let positions = [{
      id: '46214692',
      type: 'POSITION_TYPE_BUY',
      symbol: 'GBPUSD',
      magic: 1000,
      time: new Date('2020-04-15T02:45:06.521Z'),
      openPrice: 1.26101,
      currentPrice: 1.24883,
      currentTickValue: 1,
      volume: 0.07,
      swap: 0,
      profit: -85.25999999999966,
      commission: -0.25,
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      stopLoss: 1.17721,
      unrealizedProfit: -85.25999999999901,
      realizedProfit: -6.536993168992922e-13
    }];
    server.on('request', data => {
      if (data.type === 'getPositions' && data.accountId === 'accountId') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, positions});
      }
    });
    let actual = await client.getPositions('accountId');
    actual.should.match(positions);
  });

  /**
   * @test {MetaApiWebsocketClient#getPosition}
   */
  it('should retrieve MetaTrader position from API by id', async () => {
    let position = {
      id: '46214692',
      type: 'POSITION_TYPE_BUY',
      symbol: 'GBPUSD',
      magic: 1000,
      time: new Date('2020-04-15T02:45:06.521Z'),
      openPrice: 1.26101,
      currentPrice: 1.24883,
      currentTickValue: 1,
      volume: 0.07,
      swap: 0,
      profit: -85.25999999999966,
      commission: -0.25,
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      stopLoss: 1.17721,
      unrealizedProfit: -85.25999999999901,
      realizedProfit: -6.536993168992922e-13
    };
    server.on('request', data => {
      if (data.type === 'getPosition' && data.accountId === 'accountId' && data.positionId === '46214692') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, position});
      }
    });
    let actual = await client.getPosition('accountId', '46214692');
    actual.should.match(position);
  });

  /**
   * @test {MetaApiWebsocketClient#getOrders}
   */
  it('should retrieve MetaTrader orders from API', async () => {
    let orders = [{
      id: '46871284',
      type: 'ORDER_TYPE_BUY_LIMIT',
      state: 'ORDER_STATE_PLACED',
      symbol: 'AUDNZD',
      magic: 123456,
      platform: 'mt5',
      time: new Date('2020-04-20T08:38:58.270Z'),
      openPrice: 1.03,
      currentPrice: 1.05206,
      volume: 0.01,
      currentVolume: 0.01,
      comment: 'COMMENT2'
    }];
    server.on('request', data => {
      if (data.type === 'getOrders' && data.accountId === 'accountId') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, orders});
      }
    });
    let actual = await client.getOrders('accountId');
    actual.should.match(orders);
  });

  /**
   * @test {MetaApiWebsocketClient#getOrder}
   */
  it('should retrieve MetaTrader order from API by id', async () => {
    let order = {
      id: '46871284',
      type: 'ORDER_TYPE_BUY_LIMIT',
      state: 'ORDER_STATE_PLACED',
      symbol: 'AUDNZD',
      magic: 123456,
      platform: 'mt5',
      time: new Date('2020-04-20T08:38:58.270Z'),
      openPrice: 1.03,
      currentPrice: 1.05206,
      volume: 0.01,
      currentVolume: 0.01,
      comment: 'COMMENT2'
    };
    server.on('request', data => {
      if (data.type === 'getOrder' && data.accountId === 'accountId' && data.orderId === '46871284') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, order});
      }
    });
    let actual = await client.getOrder('accountId', '46871284');
    actual.should.match(order);
  });

  /**
   * @test {MetaApiWebsocketClient#getHistoryOrdersByTicket}
   */
  it('should retrieve MetaTrader history orders from API by ticket', async () => {
    let historyOrders = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      currentPrice: 1.261,
      currentVolume: 0,
      doneTime: new Date('2020-04-15T02:45:06.521Z'),
      id: '46214692',
      magic: 1000,
      platform: 'mt5',
      positionId: '46214692',
      state: 'ORDER_STATE_FILLED',
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.260Z'),
      type: 'ORDER_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getHistoryOrdersByTicket' && data.accountId === 'accountId' && data.ticket === '46214692') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, historyOrders,
          synchronizing: false});
      }
    });
    let actual = await client.getHistoryOrdersByTicket('accountId', '46214692');
    actual.should.match({historyOrders, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#getHistoryOrdersByPosition}
   */
  it('should retrieve MetaTrader history orders from API by position', async () => {
    let historyOrders = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      currentPrice: 1.261,
      currentVolume: 0,
      doneTime: new Date('2020-04-15T02:45:06.521Z'),
      id: '46214692',
      magic: 1000,
      platform: 'mt5',
      positionId: '46214692',
      state: 'ORDER_STATE_FILLED',
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.260Z'),
      type: 'ORDER_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getHistoryOrdersByPosition' && data.accountId === 'accountId' &&
        data.positionId === '46214692') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, historyOrders,
          synchronizing: false});
      }
    });
    let actual = await client.getHistoryOrdersByPosition('accountId', '46214692');
    actual.should.match({historyOrders, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#getHistoryOrdersByTimeRange}
   */
  it('should retrieve MetaTrader history orders from API by time range', async () => {
    let historyOrders = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      currentPrice: 1.261,
      currentVolume: 0,
      doneTime: new Date('2020-04-15T02:45:06.521Z'),
      id: '46214692',
      magic: 1000,
      platform: 'mt5',
      positionId: '46214692',
      state: 'ORDER_STATE_FILLED',
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.260Z'),
      type: 'ORDER_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getHistoryOrdersByTimeRange' && data.accountId === 'accountId' &&
        data.startTime === '2020-04-15T02:45:00.000Z' && data.endTime === '2020-04-15T02:46:00.000Z' &&
        data.offset === 1 && data.limit === 100) {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, historyOrders,
          synchronizing: false});
      }
    });
    let actual = await client.getHistoryOrdersByTimeRange('accountId', new Date('2020-04-15T02:45:00.000Z'),
      new Date('2020-04-15T02:46:00.000Z'), 1, 100);
    actual.should.match({historyOrders, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#getDealsByTicket}
   */
  it('should retrieve MetaTrader deals from API by ticket', async () => {
    let deals = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      commission: -0.25,
      entryType: 'DEAL_ENTRY_IN',
      id: '33230099',
      magic: 1000,
      platform: 'mt5',
      orderId: '46214692',
      positionId: '46214692',
      price: 1.26101,
      profit: 0,
      swap: 0,
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.521Z'),
      type: 'DEAL_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getDealsByTicket' && data.accountId === 'accountId' && data.ticket === '46214692') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, deals,
          synchronizing: false});
      }
    });
    let actual = await client.getDealsByTicket('accountId', '46214692');
    actual.should.match({deals, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#getDealsByPosition}
   */
  it('should retrieve MetaTrader deals from API by position', async () => {
    let deals = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      commission: -0.25,
      entryType: 'DEAL_ENTRY_IN',
      id: '33230099',
      magic: 1000,
      platform: 'mt5',
      orderId: '46214692',
      positionId: '46214692',
      price: 1.26101,
      profit: 0,
      swap: 0,
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.521Z'),
      type: 'DEAL_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getDealsByPosition' && data.accountId === 'accountId' && data.positionId === '46214692') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, deals,
          synchronizing: false});
      }
    });
    let actual = await client.getDealsByPosition('accountId', '46214692');
    actual.should.match({deals, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#getDealsByTimeRange}
   */
  it('should retrieve MetaTrader deals from API by time range', async () => {
    let deals = [{
      clientId: 'TE_GBPUSD_7hyINWqAlE',
      commission: -0.25,
      entryType: 'DEAL_ENTRY_IN',
      id: '33230099',
      magic: 1000,
      platform: 'mt5',
      orderId: '46214692',
      positionId: '46214692',
      price: 1.26101,
      profit: 0,
      swap: 0,
      symbol: 'GBPUSD',
      time: new Date('2020-04-15T02:45:06.521Z'),
      type: 'DEAL_TYPE_BUY',
      volume: 0.07
    }];
    server.on('request', data => {
      if (data.type === 'getDealsByTimeRange' && data.accountId === 'accountId' &&
        data.startTime === '2020-04-15T02:45:00.000Z' && data.endTime === '2020-04-15T02:46:00.000Z' &&
        data.offset === 1 && data.limit === 100) {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, deals,
          synchronizing: false});
      }
    });
    let actual = await client.getDealsByTimeRange('accountId', new Date('2020-04-15T02:45:00.000Z'),
      new Date('2020-04-15T02:46:00.000Z'), 1, 100);
    actual.should.match({deals, synchronizing: false});
  });

  /**
   * @test {MetaApiWebsocketClient#removeHistory}
   */
  it('should remove history from API', async () => {
    let requestReceived = false;
    server.on('request', data => {
      if (data.type === 'removeHistory' && data.accountId === 'accountId') {
        requestReceived = true;
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId});
      }
    });
    await client.removeHistory('accountId');
    requestReceived.should.be.true();
  });

  /**
   * @test {MetaApiWebsocketClient#trade}
   */
  it('should execute a trade via API', async () => {
    let trade = {
      actionType: 'ORDER_TYPE_SELL',
      symbol: 'AUDNZD',
      volume: 0.07
    };
    let response = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    server.on('request', data => {
      data.trade.should.match(trade);
      if (data.type === 'trade' && data.accountId === 'accountId') {
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId, response});
      }
    });
    let actual = await client.trade('accountId', trade);
    actual.should.match(response);
  });

  /**
   * @test {MetaApiWebsocketClient#reconnect}
   */
  it('should reconnect to MetaTrader terminal', async () => {
    let requestReceived = false;
    server.on('request', data => {
      if (data.type === 'reconnect' && data.accountId === 'accountId') {
        requestReceived = true;
        server.emit('response', {type: 'response', accountId: data.accountId, requestId: data.requestId});
      }
    });
    await client.reconnect('accountId');
    requestReceived.should.be.true();
  });

  describe('error handling', () => {

    /**
     * @test {MetaApiWebsocketClient#trade}
     */
    it('should handle ValidationError', async () => {
      let trade = {
        actionType: 'ORDER_TYPE_SELL',
        symbol: 'AUDNZD'
      };
      server.on('request', data => {
        server.emit('processingError', {id: 1, error: 'ValidationError', message: 'Validation failed',
          details: [{parameter: 'volume', message: 'Required value.'}], requestId: data.requestId});
      });
      try {
        await client.trade('accountId', trade);
        throw new Error('ValidationError extected');
      } catch (err) {
        err.name.should.equal('ValidationError');
        err.details.should.match([{
          parameter: 'volume',
          message: 'Required value.'
        }]);
      }
    });

    /**
     * @test {MetaApiWebsocketClient#getPosition}
     */
    it('should handle NotFoundError', async () => {
      server.on('request', data => {
        server.emit('processingError', {id: 1, error: 'NotFoundError', message: 'Position id 1234 not found',
          requestId: data.requestId});
      });
      try {
        await client.getPosition('accountId', '1234');
        throw new Error('NotFoundError extected');
      } catch (err) {
        err.name.should.equal('NotFoundError');
      }
    });

    /**
     * @test {MetaApiWebsocketClient#getPosition}
     */
    it('should handle NotSynchronizedError', async () => {
      server.on('request', data => {
        server.emit('processingError', {id: 1, error: 'NotSynchronizedError', message: 'Error message',
          requestId: data.requestId});
      });
      try {
        await client.getPosition('accountId', '1234');
        throw new Error('NotSynchronizedError extected');
      } catch (err) {
        err.name.should.equal('NotSynchronizedError');
      }
    });

    /**
     * @test {MetaApiWebsocketClient#getPosition}
     */
    it('should handle NotConnectedError', async () => {
      server.on('request', data => {
        server.emit('processingError', {id: 1, error: 'NotAuthenticatedError', message: 'Error message',
          requestId: data.requestId});
      });
      try {
        await client.getPosition('accountId', '1234');
        throw new Error('NotConnectedError extected');
      } catch (err) {
        err.name.should.equal('NotConnectedError');
      }
    });

    /**
     * @test {MetaApiWebsocketClient#getPosition}
     */
    it('should handle other errors', async () => {
      server.on('request', data => {
        server.emit('processingError', {id: 1, error: 'Error', message: 'Error message',
          requestId: data.requestId});
      });
      try {
        await client.getPosition('accountId', '1234');
        throw new Error('InternalError extected');
      } catch (err) {
        err.name.should.equal('InternalError');
      }
    });

  });

});
