'use strict';

import SynchronizationListener from './clients/synchronizationListener';

/**
 * Abstract class which defines MetaTrader history storage interface.
 *
 * This class is intended to be used when account synchronization mode is set to user. In this case the consumer is
 * responsible for locally maintaining a copy of MetaTrader terminal history, and the API will send only history changes
 * to the consumer.
 */
export default class HistoryStorage extends SynchronizationListener {

  /**
   * Constructs the history storage
   */
  constructor() {
    super();
    this._orderSynchronizationFinished = false;
    this._dealSynchronizationFinished = false;
  }

  /**
   * Returns flag indicating wether order history synchronization have finished
   * @return {Boolean} flag indicating wether order history synchronization have finished
   */
  get orderSynchronizationFinished() {
    return this._orderSynchronizationFinished;
  }

  /**
   * Returns flag indicating wether deal history synchronization have finished
   * @return {Boolean} flag indicating wether deal history synchronization have finished
   */
  get dealSynchronizationFinished() {
    return this._dealSynchronizationFinished;
  }

  /**
   * Returns the time of the last history order record stored in the history storage
   * @returns {Date} the time of the last history order record stored in the history storage
   */
  get lastHistoryOrderTime() {}

  /**
   * Returns the time of the last history deal record stored in the history storage
   * @returns {Date} the time of the last history deal record stored in the history storage
   */
  get lastDealTime() {}

  /**
   * Invoked when a new MetaTrader history order is added
   * @param {MetatraderOrder} historyOrder new MetaTrader history order
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  async onHistoryOrderAdded(historyOrder) {}

  /**
   * Invoked when a new MetaTrader history deal is added
   * @param {MetatraderDeal} deal new MetaTrader history deal
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  async onDealAdded(deal) {}

  /**
   * Invoked when a synchronization of history deals on a MetaTrader account have finished
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onDealSynchronizationFinished() {
    this._dealSynchronizationFinished = true;
  }

  /**
   * Invoked when a synchronization of history orders on a MetaTrader account have finished
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onOrderSynchronizationFinished() {
    this._orderSynchronizationFinished = true;
  }

  /**
   * Invoked when connection to MetaTrader terminal terminated
   * @return {Promise} promise which resolves when the asynchronous event is processed
   */
  onConnected() {
    this._orderSynchronizationFinished = false;
    this._dealSynchronizationFinished = false;
  }

}
