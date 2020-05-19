'use strict';

/**
 * Error which indicates that MetaApi MetaTrader account was not synchronized yet. See
 * https://metaapi.cloud/docs/client/websocket/synchronizationMode/ for more details
 */
export default class NotSynchronizedError extends Error {

  /**
   * Constructs the error
   * @param {String} message error message
   */
  constructor(message) {
    super(message + '. See https://metaapi.cloud/docs/client/websocket/synchronizationMode/ for more details');
    this.name = 'NotSynchronizedError';
  }

}
