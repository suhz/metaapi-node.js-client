'use strict';

import fs from 'fs';

/**
 * metaapi.cloud MetaTrader account API client (see https://metaapi.cloud/docs/provisioning/)
 */
export default class MetatraderAccountClient {

  /**
   * Constructs MetaTrader account API client instance
   * @param {HttpClient} httpClient HTTP client
   * @param {String} token authorization token
   * @param {String} domain domain to connect to, default is agiliumtrade.agiliumtrade.ai
   */
  constructor(httpClient, token, domain = 'agiliumtrade.agiliumtrade.ai') {
    this._httpClient = httpClient;
    this._host = `https://mt-provisioning-api-v1.${domain}`;
    this._token = token;
  }

  /**
   * MetaTrader account model
   * @typedef {Object} MetatraderAccountDto
   * @property {String} _id account unique identifier
   * @property {String} name MetaTrader account human-readable name in the MetaApi app
   * @property {String} type account type, can be cloud or self-hosted
   * @property {String} login MetaTrader account number
   * @property {String} server MetaTrader server which hosts the account
   * @property {String} synchronizationMode synchronization mode, can be automatic or user. See
   * https://metaapi.cloud/docs/client/websocket/synchronizationMode/ for more details.
   * @property {String} provisioningProfileId id of the account's provisioning profile
   * @property {String} timeConverter algorithm used to parse your broker timezone. Supported values are icmarkets for
   * America/New_York DST switch and roboforex for EET DST switch (the values will be changed soon)
   * @property {String} application application name to connect the account to. Currently allowed values are MetaApi and
   * AgiliumTrade
   * @property {Number} magic MetaTrader magic to place trades using
   * @property {String} state account deployment state. One of CREATED, DEPLOYING, DEPLOYED, UNDEPLOYING, UNDEPLOYED,
   * DELETING
   * @property {String} connectionStatus terminal & broker connection status, one of CONNECTED, DISCONNECTED,
   * DISCONNECTED_FROM_BROKER
   */

  /**
   * Retrieves MetaTrader accounts owned by user (see https://metaapi.cloud/docs/provisioning/api/account/readAccounts/)
   * @param {String} provisioningProfileId optional provisioning profile id filter
   * @return {Promise<Array<MetatraderAccountDto>>} promise resolving with MetaTrader accounts found
   */
  getAccounts(provisioningProfileId) {
    let qs = {};
    if (provisioningProfileId) {
      qs.provisioningProfileId = provisioningProfileId;
    }
    const opts = {
      url: `${this._host}/users/current/accounts`,
      method: 'GET',
      qs,
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Retrieves a MetaTrader account by id (see https://metaapi.cloud/docs/provisioning/api/account/readAccount/). Throws
   * an error if account is not found.
   * @param {String} id MetaTrader account id
   * @return {Promise<MetatraderAccountDto>} promise resolving with MetaTrader account found
   */
  getAccount(id) {
    const opts = {
      url: `${this._host}/users/current/accounts/${id}`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * New MetaTrader account model
   * @typedef {Object} NewMetatraderAccountDto
   * @property {String} name MetaTrader account human-readable name in the MetaApi app
   * @property {String} type account type, can be cloud or self-hosted
   * @property {String} login MetaTrader account number
   * @property {String} password MetaTrader account password. The password can be either investor password for read-only
   * access or master password to enable trading features. Required for cloud account
   * @property {String} server MetaTrader server which hosts the account
   * @property {String} synchronizationMode synchronization mode, can be automatic or user. See
   * https://metaapi.cloud/docs/client/websocket/synchronizationMode/ for more details.
   * @property {String} provisioningProfileId id of the account's provisioning profile
   * @property {String} timeConverter algorithm used to parse your broker timezone. Supported values are icmarkets for
   * America/New_York DST switch and roboforex for EET DST switch (the values will be changed soon)
   * @property {String} application application name to connect the account to. Currently allowed values are MetaApi and
   * AgiliumTrade
   * @property {Number} magic MetaTrader magic to place trades using
   */

  /**
   * MetaTrader account id model
   * @typedef {Object} MetatraderAccountIdDto
   * @property {String} id MetaTrader account unique identifier
   */

  /**
   * Starts cloud API server for a MetaTrader account using specified provisioning profile (see
   * https://metaapi.cloud/docs/provisioning/api/account/createAccount/). It takes some time to launch the terminal and
   * connect the terminal to the broker, you can use the connectionStatus field to monitor the current status of the
   * terminal.
   * @param {NewMetatraderAccountDto} account MetaTrader account to create
   * @return {Promise<MetatraerAccountIdDto>} promise resolving with an id of the MetaTrader account created
   */
  createAccount(account) {
    const opts = {
      url: `${this._host}/users/current/accounts`,
      method: 'POST',
      headers: {
        'auth-token': this._token
      },
      json:true,
      body: account
    };
    return this._httpClient.request(opts);
  }

  /**
   * Starts API server for MetaTrader account. This request will be ignored if the account has already been deployed.
   * (see https://metaapi.cloud/docs/provisioning/api/account/deployAccount/)
   * @param {String} id MetaTrader account id to deploy
   * @return {Promise} promise resolving when MetaTrader account is scheduled for deployment
   */
  deployAccount(id) {
    const opts = {
      url: `${this._host}/users/current/accounts/${id}/deploy`,
      method: 'POST',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Stops API server for a MetaTrader account. Terminal data such as downloaded market history data will be preserved.
   * (see https://metaapi.cloud/docs/provisioning/api/account/undeployAccount/)
   * @param {String} id MetaTrader account id to undeploy
   * @return {Promise} promise resolving when MetaTrader account is scheduled for undeployment
   */
  undeployAccount(id) {
    const opts = {
      url: `${this._host}/users/current/accounts/${id}/undeploy`,
      method: 'POST',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Redeploys MetaTrader account. This is equivalent to undeploy immediately followed by deploy.
   * (see https://metaapi.cloud/docs/provisioning/api/account/deployAccount/)
   * @param {String} id MetaTrader account id to redeploy
   * @return {Promise} promise resolving when MetaTrader account is scheduled for redeployed
   */
  redeployAccount(id) {
    const opts = {
      url: `${this._host}/users/current/accounts/${id}/redeploy`,
      method: 'POST',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * Stops and deletes an API server for a specified MetaTrader account. The terminal state such as downloaded market
   * data history will be deleted as well when you delete the account. (see
   * https://metaapi.cloud/docs/provisioning/api/account/deleteAccount/)
   * @param {String} id MetaTrader account id
   * @return {Promise} promise resolving when MetaTrader account is scheduled for deletion
   */
  deleteAccount(id) {
    const opts = {
      url: `${this._host}/users/current/accounts/${id}`,
      method: 'DELETE',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

}
