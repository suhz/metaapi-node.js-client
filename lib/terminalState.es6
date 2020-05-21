'use strict';

import SynchronizationListener from './clients/synchronizationListener';

/**
 * Responsible for storing a local copy of remote terminal state. Intended to be used with accounts which have user
 * synchronization mode configured.
 */
export default class TerminalState extends SynchronizationListener {

  /**
   * Constructs the instance of terminal state class
   */
  constructor() {
    super();
    this._connected = false;
    this._connectedToBroker = false;
    this._positions = [];
    this._orders = [];
    this._specifications = [];
    this._specificationsBySymbol = {};
    this._pricesBySymbol = {};
  }

  /**
   * Returns true if MetaApi have connected to MetaTrader terminal
   * @return {Boolean} true if MetaApi have connected to MetaTrader terminal
   */
  get connected() {
    return this._connected;
  }

  /**
   * Returns true if MetaApi have connected to MetaTrader terminal and MetaTrader terminal is connected to broker
   * @return {Boolean} true if MetaApi have connected to MetaTrader terminal and MetaTrader terminal is connected to
   * broker
   */
  get connectedToBroker() {
    return this._connectedToBroker;
  }

  /**
   * Returns a local copy of account information
   * @returns {MetatraderAccountInformation} local copy of account information
   */
  get accountInformation() {
    return this._accountInformation;
  }

  /**
   * Returns a local copy of MetaTrader positions opened
   * @returns {Array<MetatraderPosition>} a local copy of MetaTrader positions opened
   */
  get positions() {
    return this._positions;
  }

  /**
   * Returns a local copy of MetaTrader orders opened
   * @returns {Array<MetatraderOrder>} a local copy of MetaTrader orders opened
   */
  get orders() {
    return this._orders;
  }

  /**
   * Returns a local copy of symbol specifications available in MetaTrader trading terminal
   * @returns {Array<MetatraderSymbolSpecification>} a local copy of symbol specifications available in MetaTrader
   * trading terminal
   */
  get specifications() {
    return this._specifications;
  }

  /**
   * Returns MetaTrader symbol specification by symbol
   * @param {String} symbol symbol (e.g. currency pair or an index)
   * @return {MetatraderSymbolSpecification} MetatraderSymbolSpecification found or undefined if specification for a
   * symbol is not found
   */
  specification(symbol) {
    return this._specificationsBySymbol[symbol];
  }

  /**
   * Returns MetaTrader symbol price by symbol
   * @param {String} symbol symbol (e.g. currency pair or an index)
   * @return {MetatraderSymbolPrice} MetatraderSymbolPrice found or undefined if price for a symbol is not found
   */
  price(symbol) {
    return this._pricesBySymbol[symbol];
  }

  /**
   * Invoked when connection to MetaTrader terminal established
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onConnected() {
    this._connected = true;
    this._accountInformation = undefined;
    this._positions = [];
    this._orders = [];
    this._specifications = [];
    this._specificationsBySymbol = {};
    this._pricesBySymbol = {};
  }

  /**
   * Invoked when connection to MetaTrader terminal terminated
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onDisconnected() {
    this._connected = false;
    this._connectedToBroker = false;
  }

  /**
   * Invoked when broker connection satus have changed
   * @param {Boolean} connected is MetaTrader terminal is connected to broker
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onBrokerConnectionStatusChanged(connected) {
    this._connectedToBroker = connected;
  }

  /**
   * Invoked when MetaTrader account information is updated
   * @param {MetatraderAccountInformation} accountInformation updated MetaTrader account information
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onAccountInformationUpdated(accountInformation) {
    this._accountInformation = accountInformation;
  }

  /**
   * Invoked when MetaTrader position is updated
   * @param {MetatraderPosition} position updated MetaTrader position
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onPositionUpdated(position) {
    let index = this._positions.findIndex(p => p.id === position.id);
    if (index !== -1) {
      this._positions[index] = position;
    } else {
      this._positions.push(position);
    }
  }

  /**
   * Invoked when MetaTrader position is removed
   * @param {String} positionId removed MetaTrader position id
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onPositionRemoved(positionId) {
    this._positions = this._positions.filter(p => p.id !== positionId);
  }

  /**
   * Invoked when MetaTrader order is updated
   * @param {MetatraderOrder} order updated MetaTrader order
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onOrderUpdated(order) {
    let index = this._orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this._orders[index] = order;
    } else {
      this._orders.push(order);
    }
  }

  /**
   * Invoked when MetaTrader order is completed (executed or canceled)
   * @param {String} orderId completed MetaTrader order id
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onOrderCompleted(orderId) {
    this._orders = this._orders.filter(o => o.id !== orderId);
  }

  /**
   * Invoked when a symbol specification was updated
   * @param {MetatraderSymbolSpecification} specification updated MetaTrader symbol specification
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onSymbolSpecificationUpdated(specification) {
    let index = this._specifications.findIndex(s => s.symbol === specification.symbol);
    if (index !== -1) {
      this._specifications[index] = specification;
    } else {
      this._specifications.push(specification);
    }
    this._specificationsBySymbol[specification.symbol] = specification;
  }

  /**
   * Invoked when a symbol price was updated
   * @param {MetatraderSymbolPrice} price updated MetaTrader symbol price
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  // eslint-disable-next-line complexity
  onSymbolPriceUpdated(price) {
    this._pricesBySymbol[price.symbol] = price;
    let positions = this._positions.filter(p => p.symbol === price.symbol);
    let specification = this.specification(price.symbol);
    if (specification) {
      for (let position of positions) {
        if (!position.unrealizedProfit || !position.realizedProfit) {
          position.unrealizedProfit = (position.type === 'POSITION_TYPE_BUY' ? 1 : -1) *
            (position.currentPrice - position.openPrice) * position.currentTickValue *
            position.volume / specification.tickSize;
          position.realizedProfit = position.profit - position.unrealizedProfit;
        }
        let newPositionPrice = position.type === 'POSITION_TYPE_BUY' ? price.bid : price.ask;
        let isProfitable = (position.type === 'POSITION_TYPE_BUY' ? 1 : -1) * (newPositionPrice - position.openPrice);
        let currentTickValue = (isProfitable > 0 ? price.profitTickValue : price.lossTickValue);
        let unrealizedProfit = (position.type === 'POSITION_TYPE_BUY' ? 1 : -1) *
          (newPositionPrice - position.openPrice) * currentTickValue *
          position.volume / specification.tickSize;
        let increment = unrealizedProfit - position.unrealizedProfit;
        position.unrealizedProfit = unrealizedProfit;
        position.profit = position.unrealizedProfit + position.realizedProfit;
        position.currentPrice = newPositionPrice;
        position.currentTickValue = currentTickValue;
        if (this._accountInformation) {
          this._accountInformation.equity += increment;
          this._accountInformation.updateCount = (this._accountInformation.updateCount || 0) + 1;
        }
      }
      if ((this._accountInformation || {}).updateCount > 100) {
        this._accountInformation.equity = this._accountInformation.balance +
          this._positions.reduce((acc, p) => acc + p.profit, 0);
        this._accountInformation.updateCount = 0;
      }
    }
  }

}
