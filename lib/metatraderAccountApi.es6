'use strict';

import MetatraderAccount from './metatraderAccount';

/**
 * Exposes MetaTrader account API logic to the consumers
 */
export default class MetatraderAccountApi {

  /**
   * Constructs a MetaTrader account API instance
   * @param {MetatraderAccountClient} metatraderAccountClient MetaTrader account REST API client
   * @param {MetaApiWebsocketClient} metaApiWebsocketClient MetaApi websocket client
   */
  constructor(metatraderAccountClient, metaApiWebsocketClient) {
    this._metatraderAccountClient = metatraderAccountClient;
    this._metaApiWebsocketClient = metaApiWebsocketClient;
  }

  /**
   * Retrieves MetaTrader accounts
   * @param {String} provisioningProfileId provisioning profile id
   * @return {Promise<Array<MetatraderAccount>>} promise resolving with an array of MetaTrader account entities
   */
  async getAccounts(provisioningProfileId) {
    let accounts = await this._metatraderAccountClient.getAccounts(provisioningProfileId);
    return accounts.map(a => new MetatraderAccount(a, this._metatraderAccountClient, this._metaApiWebsocketClient));
  }

  /**
   * Retrieves a MetaTrader account by id
   * @param {String} accountId MetaTrader account id
   * @return {Promise<ProvisioningProfile>} promise resolving with MetaTrader account entity
   */
  async getAccount(accountId) {
    let account = await this._metatraderAccountClient.getAccount(accountId);
    return new MetatraderAccount(account, this._metatraderAccountClient, this._metaApiWebsocketClient);
  }

  /**
   * Creates a MetaTrader account
   * @param {NewMetatraderAccountDto} account MetaTrader account data
   * @return {Promise<MetatraderAccount>} promise resolving with MetaTrader account entity
   */
  async createAccount(account) {
    let id = await this._metatraderAccountClient.createAccount(account);
    return this.getAccount(id.id);
  }

}
