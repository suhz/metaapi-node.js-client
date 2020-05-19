'use strict';

/**
 * Error which indicates that MetaTrader terminal did not start yet. You need to wait until account is connected and
 * retry.
 */
export default class NotConnectedError extends Error {

  /**
   * Constructs the error
   * @param {String} message error message
   */
  constructor(message) {
    super(message);
    this.name = 'NotConnectedError';
  }

}
