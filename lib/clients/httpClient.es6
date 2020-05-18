'use strict';

import request from 'request-promise-any';
import {UnauthorizedError, ForbiddenError, ApiError, ConflictError,
  ValidationError, InternalError, NotFoundError} from './errorHandler';

/**
 * HTTP client library based on request-promise
 */
export default class HttpClient {

  /**
   * Performs a request. Response errors are returned as ApiError or subclasses.
   * @param {Object} options request options
   * @returns {Promise} promise returning request results
   */
  request(options) {
    return this._makeRequest(options)
      .catch((err) => {
        throw this._convertError(err);
      });
  }

  _makeRequest(options) {
    return request(options);
  }

  // eslint-disable-next-line complexity
  _convertError(err) {
    let error;
    err.error = err.error || {};
    let status = err.statusCode || err.status;
    switch (status) {
    case 400:
      return new ValidationError(err.error.message || err.message, err.error.details || err.details);
    case 401:
      return new UnauthorizedError(err.error.message || err.message);
    case 403:
      return new ForbiddenError(err.error.message || err.message);
    case 404:
      return new NotFoundError(err.error.message || err.message);
    case 409:
      return new ConflictError(err.error.message || err.message);
    case 500:
      return new InternalError(err.error.message || err.message);
    default:
      return new ApiError(ApiError, err.error.message || err.message, status);
    }
  }

}

/**
 * HTTP client service mock for tests
 */
export class HttpClientMock extends HttpClient {

  /**
   * Constructs HTTP client mock
   * @param {Function(options:Object):Promise} requestFn mocked request function
   */
  constructor(requestFn) {
    super();
    this._requestFn = requestFn;
  }

  _makeRequest() {
    return this._requestFn.apply(this, arguments);
  }

  /**
   * Set request mock function
   * @param {Function} requestFn mock function
   */
  set requestFn(requestFn) {
    this._requestFn = requestFn;
  }

  /**
   * Return request mock function
   * @returns {Function} request mock function
   */
  get requestFn() {
    return this._requestFn;
  }

}
