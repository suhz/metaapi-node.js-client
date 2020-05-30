'use strict';

import randomstring from 'randomstring';
import socketIO from 'socket.io-client';
import TimeoutError from './timeoutError';
import {ValidationError, NotFoundError, InternalError, UnauthorizedError} from './errorHandler';
import NotSynchronizedError from './notSynchronizedError';
import NotConnectedError from './notConnectedError';

/**
 * MetaApi websocket API client (see https://metaapi.cloud/docs/client/websocket/overview/)
 */
export default class MetaApiWebsocketClient {

  /**
   * Constructs MetaApi websocket API client instance
   * @param {String} token authorization token
   * @param {String} domain domain to connect to, default is agiliumtrade.agiliumtrade.ai
   */
  constructor(token, domain = 'agiliumtrade.agiliumtrade.ai') {
    this._url = `https://mt-client-api-v1.${domain}`;
    this._token = token;
    this._requestResolves = {};
    this._synchronizationListeners = {};
    this._reconnectListeners = {};
  }

  /**
   * Patch server URL for use in unit tests
   * @param {String} url patched server URL
   */
  set url(url) {
    this._url = url;
  }

  /**
   * Connects to MetaApi server via socket.io protocol
   * @returns {Promise} promise which resolves when connection is eatablished
   */
  connect() {
    if (!this._connected) {
      this._connected = true;
      this._requestResolves = {};
      let resolve, reject;
      let resolved = false;
      let result = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      let url = `${this._url}?auth-token=${this._token}`;
      this._socket = socketIO(url, {
        path: '/ws',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax : 5000,
        reconnectionAttempts: Infinity
      });
      this._socket.on('connect', async () => {
        // eslint-disable-next-line no-console
        console.log('[' + (new Date()).toISOString() + '] MetaApi websocket client connected to the MetaApi server');
        if (!resolved) {
          resolved = true;
          resolve();
        } else {
          await this._fireReconnected();
        }
        if (!this._connected) {
          this._socket.close();
        }
      });
      this._socket.on('reconnect', async () => {
        await this._fireReconnected();
      });
      this._socket.on('connect_error', (err) => {
        // eslint-disable-next-line no-console
        console.log('[' + (new Date()).toISOString() + '] MetaApi websocket client connection error', err);
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });
      this._socket.on('connect_timeout', (timeout) => {
        // eslint-disable-next-line no-console
        console.log('[' + (new Date()).toISOString() + '] MetaApi websocket client connection timeout');
        if (!resolved) {
          resolved = true;
          reject(new TimeoutError('MetaApi websocket client connection timed out'));
        }
      });
      this._socket.on('disconnect', async (reason) => {
        // eslint-disable-next-line no-console
        console.log('[' + (new Date()).toISOString() + '] MetaApi websocket client disconnected from the MetaApi ' +
          'server because of ' + reason);
        await this._reconnect();
      });
      this._socket.on('error', async (error) => {
        // eslint-disable-next-line no-console
        console.error('[' + (new Date()).toISOString() + '] MetaApi websocket client error', error);
        await this._reconnect();
      });
      this._socket.on('response', data => {
        let requestResolve = (this._requestResolves[data.requestId] || {resolve: () => {}, reject: () => {}});
        delete this._requestResolves[data.requestId];
        this._convertIsoTimeToDate(data);
        requestResolve.resolve(data);
      });
      this._socket.on('processingError', data => {
        let requestResolve = (this._requestResolves[data.requestId] || {resolve: () => {}, reject: () => {}});
        delete this._requestResolves[data.requestId];
        requestResolve.reject(this._convertError(data));
      });
      this._socket.on('synchronization', async data => {
        this._convertIsoTimeToDate(data);
        await this._processSynchronizationPacket(data);
      });
      return result;
    }
  }

  /**
   * Closes connection to MetaApi server
   */
  close() {
    if (this._connected) {
      this._connected = false;
      this._socket.close();
      for (let requestResolve of Object.values(this._requestResolves)) {
        requestResolve.reject(new Error('MetaApi connection closed'));
      }
      this._requestResolves = {};
      this._synchronizationListeners = {};
    }
  }

  /**
   * MetaTrader account information (see https://metaapi.cloud/docs/client/models/metatraderAccountInformation/)
   * @typedef {Object} MetatraderAccountInformation
   * @property {String} broker broker name
   * @property {String} currency account base currency ISO code
   * @property {String} server broker server name
   * @property {Number} balance account balance
   * @property {Number} equity account liquidation value
   * @property {Number} margin used margin
   * @property {Number} freeMargin free margin
   * @property {Number} leverage account leverage coefficient
   * @property {Number} marginLevel margin level calculated as % of freeMargin/margin
   */

  /**
   * Returns account information for a specified MetaTrader account (see
   * https://metaapi.cloud/docs/client/websocket/api/readTradingTerminalState/readAccountInformation/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @returns {Promise<MetatraderAccountInformation>} promise resolving with account information
   */
  async getAccountInformation(accountId) {
    let response = await this._rpcRequest(accountId, {type: 'getAccountInformation'});
    return response.accountInformation;
  }

  /**
   * MetaTrader position
   * @typedef {Object} MetatraderPosition
   * @property {Number} id position id (ticket number)
   * @property {String} type position type (one of POSITION_TYPE_BUY, POSITION_TYPE_SELL)
   * @property {String} symbol position symbol
   * @property {Number} magic position magic number, identifies the EA which opened the position
   * @property {Date} time time position was opened at
   * @property {Date} updateTime last position modification time
   * @property {Number} openPrice position open price
   * @property {Number} currentPrice current price
   * @property {Number} currentTickValue current tick value
   * @property {Number} stopLoss optional position stop loss price
   * @property {Number} takeProfit optional position take profit price
   * @property {Number} volume position volume
   * @property {Number} swap position cumulative swap
   * @property {Number} profit position cumulative profit
   * @property {String} comment optional position comment. The sum of the line lengths of the comment and the clientId
   * must be less than or equal to 27. For more information see https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {String} clientId optional client-assigned id. The id value can be assigned when submitting a trade and
   * will be present on position, history orders and history deals related to the trade. You can use this field to bind
   * your trades to objects in your application and then track trade progress. The sum of the line lengths of the
   * comment and the clientId must be less than or equal to 27. For more information see
   * https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {Number} unrealizedProfit profit of the part of the position which is not yet closed, including swap
   * @property {Number} realizedProfit profit of the already closed part, including commissions and swap
   * @property {Number} commission optional position commission
   */

  /**
   * Returns positions for a specified MetaTrader account (see
   * https://metaapi.cloud/docs/client/websocket/api/readTradingTerminalState/readPositions/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @returns {Promise<Array<MetatraderPosition>} promise resolving with array of open positions
   */
  async getPositions(accountId) {
    let response = await this._rpcRequest(accountId, {type: 'getPositions'});
    return response.positions;
  }

  /**
   * Returns specific position for a MetaTrader account (see
   * https://metaapi.cloud/docs/client/websocket/api/readTradingTerminalState/readPosition/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} positionId position id
   * @return {Promise<MetatraderPosition>} promise resolving with MetaTrader position found
   */
  async getPosition(accountId, positionId) {
    let response = await this._rpcRequest(accountId, {type: 'getPosition', positionId});
    return response.position;
  }

  /**
   * MetaTrader order
   * @typedef {Object} MetatraderOrder
   * @property {Number} id order id (ticket number)
   * @property {String} type order type (one of ORDER_TYPE_SELL, ORDER_TYPE_BUY, ORDER_TYPE_BUY_LIMIT,
   * ORDER_TYPE_SELL_LIMIT, ORDER_TYPE_BUY_STOP, ORDER_TYPE_SELL_STOP). See
   * https://www.mql5.com/en/docs/constants/tradingconstants/orderproperties#enum_order_type
   * @property {String} state order state one of (ORDER_STATE_STARTED, ORDER_STATE_PLACED, ORDER_STATE_CANCELED,
   * ORDER_STATE_PARTIAL, ORDER_STATE_FILLED, ORDER_STATE_REJECTED, ORDER_STATE_EXPIRED, ORDER_STATE_REQUEST_ADD,
   * ORDER_STATE_REQUEST_MODIFY, ORDER_STATE_REQUEST_CANCEL). See
   * https://www.mql5.com/en/docs/constants/tradingconstants/orderproperties#enum_order_state
   * @property {Number} magic order magic number, identifies the EA which created the order
   * @property {Date} time time order was created at
   * @property {Date} doneTime optional time order was executed or canceled at. Will be specified for
   * completed orders only
   * @property {String} symbol order symbol
   * @property {Number} openPrice order open price (market price for market orders, limit price for limit orders or stop
   * price for stop orders)
   * @property {Number} currentPrice current price
   * @property {Number} stopLoss optional order stop loss price
   * @property {Number} takeProfit optional order take profit price
   * @property {Number} volume order requested quantity
   * @property {Number} currentVolume order remaining quantity, i.e. requested quantity - filled quantity
   * @property {String} positionId order position id. Present only if the order has a position attached to it
   * @property {String} comment optional order comment. The sum of the line lengths of the comment and the clientId
   * must be less than or equal to 27. For more information see https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {String} originalComment optional order original comment (present if possible to restore original comment
   * from history)
   * @property {String} clientId optional client-assigned id. The id value can be assigned when submitting a trade and
   * will be present on position, history orders and history deals related to the trade. You can use this field to bind
   * your trades to objects in your application and then track trade progress. The sum of the line lengths of the
   * comment and the clientId must be less than or equal to 27. For more information see
   * https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {String} platform platform id (mt4 or mt5)
   * @property {Boolean} updatePending optional flag indicating that order client id and original comment was not
   * identified yet and will be updated in a future synchronization packet
   */

  /**
   * Returns open orders for a specified MetaTrader account (see
   * https://metaapi.cloud/docs/client/websocket/api/readTradingTerminalState/readOrders/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @return {Promise<Array<MetatraderOrder>>} promise resolving with open MetaTrader orders
   */
  async getOrders(accountId) {
    let response = await this._rpcRequest(accountId, {type: 'getOrders'});
    return response.orders;
  }

  /**
   * Returns specific open order for a MetaTrader account (see
   * https://metaapi.cloud/docs/client/websocket/api/readTradingTerminalState/readOrder/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} orderId order id (ticket number)
   * @return {Promise<MetatraderOrder>} promise resolving with metatrader order found
   */
  async getOrder(accountId, orderId) {
    let response = await this._rpcRequest(accountId, {type: 'getOrder', orderId});
    return response.order;
  }

  /**
   * MetaTrader history orders search query response
   * @typedef {Object} MetatraderHistoryOrders
   * @property {Array<MetatraderOrder>} historyOrders array of history orders returned
   * @property {Boolean} synchronizing flag indicating that history order initial synchronization is still in progress
   * and thus search results may be incomplete
   */

  /**
   * Returns the history of completed orders for a specific ticket number (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readHistoryOrdersByTicket/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} ticket ticket number (order id)
   * @returns {Promise<MetatraderHistoryOrders>} promise resolving with request results containing history orders found
   */
  async getHistoryOrdersByTicket(accountId, ticket) {
    let response = await this._rpcRequest(accountId, {type: 'getHistoryOrdersByTicket', ticket});
    return {
      historyOrders: response.historyOrders,
      synchronizing: response.synchronizing
    };
  }

  /**
   * Returns the history of completed orders for a specific position id (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readHistoryOrdersByPosition/)
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} positionId position id
   * @returns {Promise<MetatraderHistoryOrders>} promise resolving with request results containing history orders found
   */
  async getHistoryOrdersByPosition(accountId, positionId) {
    let response = await this._rpcRequest(accountId, {type: 'getHistoryOrdersByPosition', positionId});
    return {
      historyOrders: response.historyOrders,
      synchronizing: response.synchronizing
    };
  }

  /**
   * Returns the history of completed orders for a specific time range (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readHistoryOrdersByTimeRange/)
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {Date} startTime start of time range, inclusive
   * @param {Date} endTime end of time range, exclusive
   * @param {Number} offset pagination offset, default is 0
   * @param {Number} limit pagination limit, default is 1000
   * @returns {Promise<MetatraderHistoryOrders>} promise resolving with request results containing history orders found
   */
  async getHistoryOrdersByTimeRange(accountId, startTime, endTime, offset = 0, limit = 1000) {
    let response = await this._rpcRequest(accountId, {type: 'getHistoryOrdersByTimeRange', startTime, endTime, offset,
      limit});
    return {
      historyOrders: response.historyOrders,
      synchronizing: response.synchronizing
    };
  }

  /**
   * MetaTrader history deals search query response
   * @typedef {Object} MetatraderDeals
   * @property {Array<MetatraderDeal>} deals array of history deals returned
   * @property {Boolean} synchronizing flag indicating that deal initial synchronization is still in progress
   * and thus search results may be incomplete
   */

  /**
   * MetaTrader deal
   * @typedef {Object} MetatraderDeal
   * @property {String} id deal id (ticket number)
   * @property {String} type deal type (one of DEAL_TYPE_BUY, DEAL_TYPE_SELL, DEAL_TYPE_BALANCE, DEAL_TYPE_CREDIT,
   * DEAL_TYPE_CHARGE, DEAL_TYPE_CORRECTION, DEAL_TYPE_BONUS, DEAL_TYPE_COMMISSION, DEAL_TYPE_COMMISSION_DAILY,
   * DEAL_TYPE_COMMISSION_MONTHLY, DEAL_TYPE_COMMISSION_AGENT_DAILY, DEAL_TYPE_COMMISSION_AGENT_MONTHLY,
   * DEAL_TYPE_INTEREST, DEAL_TYPE_BUY_CANCELED, DEAL_TYPE_SELL_CANCELED, DEAL_DIVIDEND, DEAL_DIVIDEND_FRANKED,
   * DEAL_TAX). See https://www.mql5.com/en/docs/constants/tradingconstants/dealproperties#enum_deal_type
   * @property {String} entryType deal entry type (one of DEAL_ENTRY_IN, DEAL_ENTRY_OUT, DEAL_ENTRY_INOUT,
   * DEAL_ENTRY_OUT_BY). See https://www.mql5.com/en/docs/constants/tradingconstants/dealproperties#enum_deal_entry
   * @property {String} symbol optional symbol deal relates to
   * @property {Number} magic optional deal magic number, identifies the EA which initiated the deal
   * @property {Date} time time the deal was conducted at
   * @property {Number} volume optional deal volume
   * @property {Number} price optional, the price the deal was conducted at
   * @property {Number} commission optional deal commission
   * @property {Number} swap optional deal swap
   * @property {Number} profit deal profit
   * @property {String} positionId optional id of position the deal relates to
   * @property {String} orderId optional id of order the deal relates to
   * @property {String} comment optional deal comment. The sum of the line lengths of the comment and the clientId
   * must be less than or equal to 27. For more information see https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {String} originalComment optional deal original comment (present if possible to restore original comment
   * from history)
   * @property {String} clientId optional client-assigned id. The id value can be assigned when submitting a trade and
   * will be present on position, history orders and history deals related to the trade. You can use this field to bind
   * your trades to objects in your application and then track trade progress. The sum of the line lengths of the
   * comment and the clientId must be less than or equal to 27. For more information see
   * https://metaapi.cloud/docs/client/clientIdUsage/
   * @property {String} platform platform id (mt4 or mt5)
   * @property {Boolean} updatePending optional flag indicating that deal client id and original comment was not
   * identified yet and will be updated in a future synchronization packet
   */

  /**
   * Returns history deals with a specific ticket number (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readDealsByTicket/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} ticket ticket number (deal id for MT5 or order id for MT4)
   * @returns {Promise<MetatraderDeals>} promise resolving with request results containing deals found
   */
  async getDealsByTicket(accountId, ticket) {
    let response = await this._rpcRequest(accountId, {type: 'getDealsByTicket', ticket});
    return {
      deals: response.deals,
      synchronizing: response.synchronizing
    };
  }

  /**
   * Returns history deals for a specific position id (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readDealsByPosition/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {String} positionId position id
   * @returns {Promise<MetatraderDeals>} promise resolving with request results containing deals found
   */
  async getDealsByPosition(accountId, positionId) {
    let response = await this._rpcRequest(accountId, {type: 'getDealsByPosition', positionId});
    return {
      deals: response.deals,
      synchronizing: response.synchronizing
    };
  }

  /**
   * Returns history deals with for a specific time range (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveHistoricalData/readDealsByTimeRange/).
   * @param {String} accountId id of the MetaTrader account to return information for
   * @param {Date} startTime start of time range, inclusive
   * @param {Date} endTime end of time range, exclusive
   * @param {Number} offset pagination offset, default is 0
   * @param {Number} limit pagination limit, default is 1000
   * @returns {Promise<MetatraderDeals>} promise resolving with request results containing deals found
   */
  async getDealsByTimeRange(accountId, startTime, endTime, offset = 0, limit = 1000) {
    let response = await this._rpcRequest(accountId, {type: 'getDealsByTimeRange', startTime, endTime, offset, limit});
    return {
      deals: response.deals,
      synchronizing: response.synchronizing
    };
  }

  /**
   * Clears the order and transaction history of a specified account so that it can be synchronized from scratch (see
   * https://metaapi.cloud/docs/client/websocket/api/removeHistory/).
   * @param {String} accountId id of the MetaTrader account to remove history for
   * @return {Promise} promise resolving when the history is cleared
   */
  removeHistory(accountId) {
    return this._rpcRequest(accountId, {type: 'removeHistory'});
  }

  /**
   * Execute a trade on a connected MetaTrader account (see https://metaapi.cloud/docs/client/websocket/api/trade/).
   * @param {String} accountId id of the MetaTrader account to execute trade for
   * @param {MetatraderTrade} trade trade to execute (see docs for possible trade types)
   * @returns {Promise<TradeResponse>} promise resolving with trade result
   */
  async trade(accountId, trade) {
    let response = await this._rpcRequest(accountId, {type: 'trade', trade});
    return response.response;
  }

  /**
   * Subscribes to the Metatrader terminal events (see https://metaapi.cloud/docs/client/websocket/api/subscribe/).
   * @param {String} accountId id of the MetaTrader account to subscribe to
   * @returns {Promise} promise which resolves when subscription started
   */
  subscribe(accountId) {
    return this._rpcRequest(accountId, {type: 'subscribe'});
  }

  /**
   * Reconnects to the Metatrader terminal (see https://metaapi.cloud/docs/client/websocket/api/reconnect/).
   * @param {String} accountId id of the MetaTrader account to reconnect
   * @returns {Promise} promise which resolves when reconnection started
   */
  reconnect(accountId) {
    return this._rpcRequest(accountId, {type: 'reconnect'});
  }

  /**
   * Requests the terminal to start synchronization process. Use it if user synchronization mode is set to user for the
   * account (see https://metaapi.cloud/docs/client/websocket/synchronizing/synchronize/).
   * @param {String} accountId id of the MetaTrader account to synchronize
   * @param {Date} startingHistoryOrderTime from what date to start synchronizing history orders from. If not specified,
   * the entire order history will be downloaded.
   * @param {Date} startingDealTime from what date to start deal synchronization from. If not specified, then all
   * history deals will be downloaded.
   * @returns {Promise} promise which resolves when synchronization started
   */
  synchronize(accountId, startingHistoryOrderTime, startingDealTime) {
    return this._rpcRequest(accountId, {type: 'synchronize', startingHistoryOrderTime, startingDealTime});
  }

  /**
   * Subscribes on market data of specified symbol (see
   * https://metaapi.cloud/docs/client/websocket/marketDataStreaming/subscribeToMarketData/).
   * @param {String} accountId id of the MetaTrader account
   * @param {String} symbol symbol (e.g. currency pair or an index)
   * @returns {Promise} promise which resolves when subscription request was processed
   */
  subscribeToMarketData(accountId, symbol) {
    return this._rpcRequest(accountId, {type: 'subscribeToMarketData', symbol});
  }

  /**
   * Retrieves specification for a symbol (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveMarketData/getSymbolSpecification/).
   * @param {String} accountId id of the MetaTrader account to retrieve symbol specification for
   * @param {String} symbol symbol to retrieve specification for
   * @returns {Promise} promise which resolves when specification is retrieved
   */
  async getSymbolSpecification(accountId, symbol) {
    let response = await this._rpcRequest(accountId, {type: 'getSymbolSpecification', symbol});
    return response.specification;
  }

  /**
   * Retrieves price for a symbol (see
   * https://metaapi.cloud/docs/client/websocket/api/retrieveMarketData/getSymbolPrice/).
   * @param {String} accountId id of the MetaTrader account to retrieve symbol price for
   * @param {String} symbol symbol to retrieve price for
   * @returns {Promise} promise which resolves when price is retrieved
   */
  async getSymbolPrice(accountId, symbol) {
    let response = await this._rpcRequest(accountId, {type: 'getSymbolPrice', symbol});
    return response.price;
  }

  /**
   * Adds synchronization listener for specific account
   * @param {String} accountId account id
   * @param {SynchronizationListener} listener synchronization listener to add
   */
  addSynchronizationListener(accountId, listener) {
    let listeners = this._synchronizationListeners[accountId];
    if (!listeners) {
      listeners = [];
      this._synchronizationListeners[accountId] = listeners;
    }
    listeners.push(listener);
  }

  /**
   * Removes synchronization listener for specific account
   * @param {String} accountId account id
   * @param {SynchronizationListener} listener synchronization listener to remove
   */
  removeSynchronizationListener(accountId, listener) {
    let listeners = this._synchronizationListeners[accountId];
    if (!listeners) {
      listeners = [];
    }
    listeners = listeners.filter(l => l !== listener);
    this._synchronizationListeners[accountId] = listeners;
  }

  /**
   * Adds reconnect listener
   * @param {ReconnectListener} listener reconnect listener to add
   */
  addReconnectListener(listener) {
    this._reconnectListeners.push(listener);
  }

  /**
   * Removes reconnect listener
   * @param {ReconnectListener} listener listener to remove
   */
  removeReconnectListener(listener) {
    this._reconnectListeners = this._reconnectListeners.filter(l => l !== listener);
  }

  /**
   * Removes all listeners. Intended for use in unit tests.
   */
  removeAllListeners() {
    this._synchronizationListeners = {};
    this._reconnectListeners = {};
  }

  async _reconnect() {
    while(!this._socket.connected && !this._socket.connecting && this._connected) {
      await this._tryReconnect();
    }
  }

  _tryReconnect() {
    return new Promise((resolve) => setTimeout(() => {
      if (!this._socket.connected && !this._socket.connecting && this._connected) {
        this._socket.connect();
      }
      resolve();
    }, 1000));
  }

  async _rpcRequest(accountId, request) {
    if (!this._connected) {
      await this.connect();
    }
    let requestId = randomstring.generate(32);
    let result = new Promise((resolve, reject) => this._requestResolves[requestId] = {resolve, reject});
    request.accountId = accountId;
    request.requestId = requestId;
    this._socket.emit('request', request);
    return result;
  }

  _convertError(data) {
    if (data.error === 'ValidationError') {
      return new ValidationError(data.message, data.details);
    } else if (data.error === 'NotFoundError') {
      return new NotFoundError(data.message);
    } else if (data.error === 'NotSynchronizedError') {
      return new NotSynchronizedError(data.message);
    } else if (data.error === 'NotAuthenticatedError') {
      return new NotConnectedError(data.message);
    } else if (data.error === 'UnauthorizedError') {
      this.close();
      return new UnauthorizedError(data.message);
    } else {
      return new InternalError(data.message);
    }
  }

  _convertIsoTimeToDate(packet) {
    // eslint-disable-next-line guard-for-in
    for (let field in packet) {
      let value = packet[field];
      if (typeof value === 'string' && field.match(/time|Time/)) {
        packet[field] = new Date(value);
      }
      if (Array.isArray(value)) {
        for (let item of value) {
          this._convertIsoTimeToDate(item);
        }
      }
      if (typeof value === 'object') {
        this._convertIsoTimeToDate(value);
      }
    }
  }

  /**
   * MetaTrader symbol specification. Contains symbol specification (see
   * https://metaapi.cloud/docs/client/models/metatraderSymbolSpecification/)
   * @typedef {Object} MetatraderSymbolSpecification
   * @property {String} symbol symbol (e.g. a currency pair or an index)
   * @property {Number} tickSize tick size
   * @property {Number} minVolume minimum order volume for the symbol
   * @property {Number} maxVolume maximum order volume for the symbol
   * @property {Number} volumeStep order volume step for the symbol
   */

  /**
   * MetaTrader symbol price. Contains current price for a symbol (see
   * https://metaapi.cloud/docs/client/models/metatraderSymbolPrice/)
   * @typedef {Object} MetatraderSymbolPrice
   * @property {String} symbol symbol (e.g. a currency pair or an index)
   * @property {Number} bid bid price
   * @property {Number} ask ask price
   * @property {Number} profitTickValue tick value for a profitable position
   * @property {Number} lossTickValue tick value for a loosing position
   */

  // eslint-disable-next-line complexity,max-statements
  async _processSynchronizationPacket(data) {
    try {
      if (data.type === 'authenticated') {
        for (let listener of this._synchronizationListeners[data.accountId]) {
          try {
            await listener.onConnected();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to notify listener about connected event', err);
          }
        }
      } else if (data.type === 'disconnected') {
        for (let listener of this._synchronizationListeners[data.accountId]) {
          try {
            await listener.onDisconnected();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to notify listener about disconnected event', err);
          }
        }
      } else if (data.type === 'accountInformation') {
        if (data.accountInformation) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onAccountInformationUpdated(data.accountInformation);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about accountInformation event', err);
            }
          }
        }
      } else if (data.type === 'deals') {
        for (let deal of (data.deals || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onDealAdded(deal);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about deals event', err);
            }
          }
        }
      } else if (data.type === 'orders') {
        for (let order of (data.orders || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onOrderUpdated(order);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about orders event', err);
            }
          }
        }
      } else if (data.type === 'historyOrders') {
        for (let historyOrder of (data.historyOrders || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onHistoryOrderAdded(historyOrder);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about historyOrders event', err);
            }
          }
        }
      } else if (data.type === 'positions') {
        for (let position of (data.positions || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onPositionUpdated(position);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about positions event', err);
            }
          }
        }
      } else if (data.type === 'update') {
        if (data.accountInformation) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onAccountInformationUpdated(data.accountInformation);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let position of (data.updatedPositions || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onPositionUpdated(position);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let positionId of (data.removedPositionIds || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onPositionRemoved(positionId);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let order of (data.updatedOrders || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onOrderUpdated(order);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let orderId of (data.completedOrderIds || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onOrderCompleted(orderId);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let historyOrder of (data.historyOrders || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onHistoryOrderAdded(historyOrder);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
        for (let deal of (data.deals || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onDealAdded(deal);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about update event', err);
            }
          }
        }
      } else if (data.type === 'dealSynchronizationFinished') {
        for (let listener of this._synchronizationListeners[data.accountId]) {
          try {
            await listener.onDealSynchronizationFinished();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to notify listener about dealSynchronizationFinished event', err);
          }
        }
      } else if (data.type === 'orderSynchronizationFinished') {
        for (let listener of this._synchronizationListeners[data.accountId]) {
          try {
            await listener.onOrderSynchronizationFinished();
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to notify listener about orderSynchronizationFinished event', err);
          }
        }
      } else if (data.type === 'status') {
        for (let listener of this._synchronizationListeners[data.accountId]) {
          try {
            await listener.onBrokerConnectionStatusChanged(!!data.connected);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to notify listener about brokerConnectionStatusChanged event', err);
          }
        }
      } else if (data.type === 'specifications') {
        for (let specification of (data.specifications || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onSymbolSpecificationUpdated(specification);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about specifications event', err);
            }
          }
        }
      } else if (data.type === 'prices') {
        for (let price of (data.prices || [])) {
          for (let listener of this._synchronizationListeners[data.accountId]) {
            try {
              await listener.onSymbolPriceUpdated(price);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to notify listener about prices event', err);
            }
          }
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to process incoming synchronization packet', err);
    }
  }

  async _fireReconnected() {
    for (let listener of this._reconnectListeners) {
      try {
        await listener.onReconnected();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[' + (new Date()).toISOString() + '] Failed to notify reconnect listener', err);
      }
    }
  }

}
