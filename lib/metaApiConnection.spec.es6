'use strict';

import should from 'should';
import sinon from 'sinon';
import MetaApiConnection from './metaApiConnection';

/**
 * @test {MetaApiConnection}
 */
describe('MetaApiConnection', () => {

  let sandbox;
  let api;
  let client = {
    getAccountInformation: () => {},
    getPositions: () => {},
    getPosition: () => {},
    getOrders: () => {},
    getOrder: () => {},
    getHistoryOrdersByTicket: () => {},
    getHistoryOrdersByPosition: () => {},
    getHistoryOrdersByTimeRange: () => {},
    getDealsByTicket: () => {},
    getDealsByPosition: () => {},
    getDealsByTimeRange: () => {},
    removeHistory: () => {},
    trade: () => {},
    reconnect: () => {},
    synchronize: () => {},
    subscribeToMarketData: () => {},
    addSynchronizationListener: () => {},
    removeSynchronizationListener: () => {}
  };

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    api = new MetaApiConnection(client, {id: 'accountId'});
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * @test {MetaApiConnection#getAccountInformation}
   */
  it('should retrieve account information', async () => {
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
    sandbox.stub(client, 'getAccountInformation').resolves(accountInformation);
    let actual = await api.getAccountInformation();
    actual.should.match(accountInformation);
    sinon.assert.calledWith(client.getAccountInformation, 'accountId');
  });

  /**
   * @test {MetaApiConnection#getPositions}
   */
  it('should retrieve positions', async () => {
    let positions = [{
      id: '46214692',
      type: 'POSITION_TYPE_BUY',
      symbol: 'GBPUSD',
      magic: 1000,
      time: new Date('2020-04-15T02:45:06.521Z'),
      updateTime: new Date('2020-04-15T02:45:06.521Z'),
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
    sandbox.stub(client, 'getPositions').resolves(positions);
    let actual = await api.getPositions();
    actual.should.match(positions);
    sinon.assert.calledWith(client.getPositions, 'accountId');
  });

  /**
   * @test {MetaApiConnection#getPosition}
   */
  it('should retrieve position by id', async () => {
    let position = {
      id: '46214692',
      type: 'POSITION_TYPE_BUY',
      symbol: 'GBPUSD',
      magic: 1000,
      time: new Date('2020-04-15T02:45:06.521Z'),
      updateTime: new Date('2020-04-15T02:45:06.521Z'),
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
    sandbox.stub(client, 'getPosition').resolves(position);
    let actual = await api.getPosition('46214692');
    actual.should.match(position);
    sinon.assert.calledWith(client.getPosition, 'accountId', '46214692');
  });

  /**
   * @test {MetaApiConnection#getOrders}
   */
  it('should retrieve orders', async () => {
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
    sandbox.stub(client, 'getOrders').resolves(orders);
    let actual = await api.getOrders();
    actual.should.match(orders);
    sinon.assert.calledWith(client.getOrders, 'accountId');
  });

  /**
   * @test {MetaApiConnection#getOrder}
   */
  it('should retrieve order by id', async () => {
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
    sandbox.stub(client, 'getOrder').resolves(order);
    let actual = await api.getOrder('46871284');
    actual.should.match(order);
    sinon.assert.calledWith(client.getOrder, 'accountId', '46871284');
  });

  /**
   * @test {MetaApiConnection#getHistoryOrdersByTicket}
   */
  it('should retrieve history orders by ticket', async () => {
    let historyOrders = {
      historyOrders: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getHistoryOrdersByTicket').resolves(historyOrders);
    let actual = await api.getHistoryOrdersByTicket('46214692');
    actual.should.match(historyOrders);
    sinon.assert.calledWith(client.getHistoryOrdersByTicket, 'accountId', '46214692');
  });

  /**
   * @test {MetaApiConnection#getHistoryOrdersByPosition}
   */
  it('should retrieve history orders by position', async () => {
    let historyOrders = {
      historyOrders: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getHistoryOrdersByPosition').resolves(historyOrders);
    let actual = await api.getHistoryOrdersByPosition('46214692');
    actual.should.match(historyOrders);
    sinon.assert.calledWith(client.getHistoryOrdersByPosition, 'accountId', '46214692');
  });

  /**
   * @test {MetaApiConnection#getHistoryOrdersByTimeRange}
   */
  it('should retrieve history orders by time range', async () => {
    let historyOrders = {
      historyOrders: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getHistoryOrdersByTimeRange').resolves(historyOrders);
    let startTime = new Date(Date.now() - 1000);
    let endTime = new Date();
    let actual = await api.getHistoryOrdersByTimeRange(startTime, endTime, 1, 100);
    actual.should.match(historyOrders);
    sinon.assert.calledWith(client.getHistoryOrdersByTimeRange, 'accountId', startTime, endTime, 1, 100);
  });

  /**
   * @test {MetaApiConnection#getDealsByTicket}
   */
  it('should retrieve history deals by ticket', async () => {
    let deals = {
      deals: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getDealsByTicket').resolves(deals);
    let actual = await api.getDealsByTicket('46214692');
    actual.should.match(deals);
    sinon.assert.calledWith(client.getDealsByTicket, 'accountId', '46214692');
  });

  /**
   * @test {MetaApiConnection#getDealsByPosition}
   */
  it('should retrieve history deals by position', async () => {
    let deals = {
      deals: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getDealsByPosition').resolves(deals);
    let actual = await api.getDealsByPosition('46214692');
    actual.should.match(deals);
    sinon.assert.calledWith(client.getDealsByPosition, 'accountId', '46214692');
  });

  /**
   * @test {MetaApiConnection#getDealsByTimeRange}
   */
  it('should retrieve history deals by time range', async () => {
    let deals = {
      deals: [{
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
      }],
      synchronizing: false
    };
    sandbox.stub(client, 'getDealsByTimeRange').resolves(deals);
    let startTime = new Date(Date.now() - 1000);
    let endTime = new Date();
    let actual = await api.getDealsByTimeRange(startTime, endTime, 1, 100);
    actual.should.match(deals);
    sinon.assert.calledWith(client.getDealsByTimeRange, 'accountId', startTime, endTime, 1, 100);
  });

  /**
   * @test {MetaApiConnection#removeHistory}
   */
  it('should remove history', async () => {
    sandbox.stub(client, 'removeHistory').resolves();
    await api.removeHistory();
    sinon.assert.calledWith(client.removeHistory, 'accountId');
  });

  /**
   * @test {MetaApiConnection#createMarketBuyOrder}
   */
  it('should create market buy order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createMarketBuyOrder('GBPUSD', 0.07, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_BUY', symbol: 'GBPUSD',
      volume: 0.07, stopLoss: 0.9, takeProfit: 2.0, comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#createMarketSellOrder}
   */
  it('should create market sell order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createMarketSellOrder('GBPUSD', 0.07, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_SELL', symbol: 'GBPUSD',
      volume: 0.07, stopLoss: 2.0, takeProfit: 0.9, comment: 'comment', clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#createLimitBuyOrder}
   */
  it('should create limit buy order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_BUY_LIMIT',
      symbol: 'GBPUSD', volume: 0.07, openPrice: 1.0, stopLoss: 0.9, takeProfit: 2.0, comment: 'comment',
      clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#createLimitSellOrder}
   */
  it('should create limit sell order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createLimitSellOrder('GBPUSD', 0.07, 1.5, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_SELL_LIMIT',
      symbol: 'GBPUSD', volume: 0.07, openPrice: 1.5, stopLoss: 2.0, takeProfit: 0.9, comment: 'comment',
      clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#createStopBuyOrder}
   */
  it('should create stop buy order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: 46870472
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createStopBuyOrder('GBPUSD', 0.07, 1.5, 0.9, 2.0, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_BUY_STOP',
      symbol: 'GBPUSD', volume: 0.07, openPrice: 1.5, stopLoss: 0.9, takeProfit: 2.0, comment: 'comment',
      clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#createStopSellOrder}
   */
  it('should create stop sell order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.createStopSellOrder('GBPUSD', 0.07, 1.0, 2.0, 0.9, 'comment', 'TE_GBPUSD_7hyINWqAlE');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_TYPE_SELL_STOP',
      symbol: 'GBPUSD', volume: 0.07, openPrice: 1.0, stopLoss: 2.0, takeProfit: 0.9, comment: 'comment',
      clientId: 'TE_GBPUSD_7hyINWqAlE'}));
  });

  /**
   * @test {MetaApiConnection#modifyPosition}
   */
  it('should modify position', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      positionId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.modifyPosition('46870472', 2.0, 0.9);
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'POSITION_MODIFY',
      positionId: '46870472', stopLoss: 2.0, takeProfit: 0.9}));
  });

  /**
   * @test {MetaApiConnection#closePositionPartially}
   */
  it('should close position partially', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      positionId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.closePositionPartially('46870472', 0.9);
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'POSITION_PARTIAL',
      positionId: '46870472', volume: 0.9}));
  });

  /**
   * @test {MetaApiConnection#closePosition}
   */
  it('should close position', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      positionId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.closePosition('46870472');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'POSITION_CLOSE_ID',
      positionId: '46870472'}));
  });

  /**
   * @test {MetaApiConnection#closePositionBySymbol}
   */
  it('should close position by symbol', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      positionId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.closePositionBySymbol('EURUSD');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'POSITION_CLOSE_SYMBOL',
      symbol: 'EURUSD'}));
  });

  /**
   * @test {MetaApiConnection#modifyOrder}
   */
  it('should modify order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.modifyOrder('46870472', 0.07, 1.0, 2.0, 0.9);
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_MODIFY', orderId: '46870472',
      volume: 0.07, openPrice: 1.0, stopLoss: 2.0, takeProfit: 0.9}));
  });

  /**
   * @test {MetaApiConnection#cancelOrder}
   */
  it('should cancel order', async () => {
    let tradeResult = {
      error: 10009,
      description: 'TRADE_RETCODE_DONE',
      orderId: '46870472'
    };
    sandbox.stub(client, 'trade').resolves(tradeResult);
    let actual = await api.cancelOrder('46870472');
    actual.should.match(tradeResult);
    sinon.assert.calledWith(client.trade, 'accountId', sinon.match({actionType: 'ORDER_CANCEL', orderId: '46870472'}));
  });

  /**
   * @test {MetaApiConnection#reconnect}
   */
  it('should reconnect terminal', async () => {
    sandbox.stub(client, 'reconnect').resolves();
    await api.reconnect();
    sinon.assert.calledWith(client.reconnect, 'accountId');
  });

  /**
   * @test {MetaApiConnection#synchronize}
   */
  it('should synchronize state with terminal', async () => {
    sandbox.stub(client, 'synchronize').resolves();
    let historyOrderStartTime = new Date(Date.now() - 1000);
    let dealStartTime = new Date();
    await api.synchronize(historyOrderStartTime, dealStartTime);
    sinon.assert.calledWith(client.synchronize, 'accountId', historyOrderStartTime, dealStartTime);
  });

  /**
   * @test {MetaApiConnection#subscribeToMarketData}
   */
  it('should subscribe to market data', async () => {
    sandbox.stub(client, 'subscribeToMarketData').resolves();
    await api.subscribeToMarketData('EURUSD');
    sinon.assert.calledWith(client.subscribeToMarketData, 'accountId', 'EURUSD');
  });

  /**
   * @test {MetaApiConnection#terminalState}
   * @test {MetaApiConnection#historyStorage}
   */
  it('should initialize listeners, terminal state and history storage for accounts with user synch mode', async () => {
    sandbox.stub(client, 'addSynchronizationListener').returns();
    api = new MetaApiConnection(client, {id: 'accountId', synchronizationMode: 'user'});
    should.exist(api.terminalState);
    should.exist(api.historyStorage);
    sinon.assert.calledWith(client.addSynchronizationListener, 'accountId', api);
    sinon.assert.calledWith(client.addSynchronizationListener, 'accountId', api.terminalState);
    sinon.assert.calledWith(client.addSynchronizationListener, 'accountId', api.historyStorage);
  });

  /**
   * @test {MetaApiConnection#addSynchronizationListener}
   */
  it('should add synchronization listeners for account with user synchronization mode', async () => {
    sandbox.stub(client, 'addSynchronizationListener').returns();
    api = new MetaApiConnection(client, {id: 'accountId', synchronizationMode: 'user'});
    let listener = {};
    api.addSynchronizationListener(listener);
    sinon.assert.calledWith(client.addSynchronizationListener, 'accountId', listener);
  });

  /**
   * @test {MetaApiConnection#removeSynchronizationListener}
   */
  it('should remove synchronization listeners for account with user synchronization mode', async () => {
    sandbox.stub(client, 'removeSynchronizationListener').returns();
    api = new MetaApiConnection(client, {id: 'accountId', synchronizationMode: 'user'});
    let listener = {};
    api.removeSynchronizationListener(listener);
    sinon.assert.calledWith(client.removeSynchronizationListener, 'accountId', listener);
  });

  /**
   * @test {MetaApiConnection#onConnected}
   */
  it('should sychronize on connection', async () => {
    sandbox.stub(client, 'synchronize').resolves();
    api = new MetaApiConnection(client, {id: 'accountId', synchronizationMode: 'user'});
    api.historyStorage.onHistoryOrderAdded({doneTime: new Date('2020-01-01T00:00:00.000Z')});
    api.historyStorage.onDealAdded({time: new Date('2020-01-02T00:00:00.000Z')});
    await api.onConnected();
    sinon.assert.calledWith(client.synchronize, 'accountId', new Date('2020-01-01T00:00:00.000Z'),
      new Date('2020-01-02T00:00:00.000Z'));
  });

  /**
   * @test {MetaApiConnection#close}
   */
  it('should unsubscribe from events on cloes', async () => {
    sandbox.stub(client, 'addSynchronizationListener').returns();
    sandbox.stub(client, 'removeSynchronizationListener').returns();
    api = new MetaApiConnection(client, {id: 'accountId', synchronizationMode: 'user'});
    api.close();
    sinon.assert.calledWith(client.removeSynchronizationListener, 'accountId', api);
    sinon.assert.calledWith(client.removeSynchronizationListener, 'accountId', api.terminalState);
    sinon.assert.calledWith(client.removeSynchronizationListener, 'accountId', api.historyStorage);
  });

});
