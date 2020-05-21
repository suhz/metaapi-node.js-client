'use strict';

import HistoryStorage from './historyStorage';

/**
 * History storage which stores MetaTrader history in RAM
 */
export default class MemoryHistoryStorage extends HistoryStorage {

  /**
   * Constructs the in-memory history store instance
   */
  constructor() {
    super();
    this._deals = [];
    this._historyOrders = [];
  }

  /**
   * Resets the storage. Intended for use in tests
   */
  reset() {
    this._deals = [];
    this._historyOrders = [];
  }

  /**
   * Returns the time of the last history order record stored in the history storage
   * @returns {Date} the time of the last history order record stored in the history storage
   */
  get lastHistoryOrderTime() {
    return new Date(this._historyOrders.reduce((max, o) => Math.max(max, (o.doneTime || new Date(0)).getTime()), 0));
  }

  /**
   * Returns the time of the last history deal record stored in the history storage
   * @returns {Date} the time of the last history deal record stored in the history storage
   */
  get lastDealTime() {
    return new Date(this._deals.reduce((max, d) => Math.max(max, (d.time || new Date(0)).getTime()), 0));
  }

  /**
   * Returns all deals stored in history storage
   * @return {Array<MetatraderDeal>} all deals stored in history storage
   */
  get deals() {
    return this._deals;
  }

  /**
   * Invoked when a new MetaTrader history order is added
   * @param {MetatraderOrder} historyOrder new MetaTrader history order
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onHistoryOrderAdded(historyOrder) {
    this._historyOrders.push(historyOrder);
  }

  /**
   * Invoked when a new MetaTrader history deal is added
   * @param {MetatraderDeal} deal new MetaTrader history deal
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onDealAdded(deal) {
    this._deals.push(deal);
  }

  /**
   * Returns all history orders stored in history storage
   * @return {Array<MetatraderOrder>} all history orders stored in history storage
   */
  get historyOrders() {
    return this._historyOrders;
  }

}
