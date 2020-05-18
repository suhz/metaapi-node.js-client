'use strict';

import MetatraderAccount from './metatraderAccount';

/**
 * Exposes MetaTrader account API logic to the consumers
 */
export default class MetatraderAccountApi {

  /**
   * Constructs a MetaTrader account API instance
   * @param {MetatraderAccountClient} metatraderAccountClient metatrader account REST API client
   */
  constructor(metatraderAccountClient) {
    this._metatraderAccountClient = metatraderAccountClient;
  }

  /**
   * Retrieves MetaTrader accounts
   * @param {String} provisioningProfileId provisioning profile id
   * @return {Promise<Array<MetatraderAccount>>} promise resolving with an array of MetaTrader account entities
   */
  async getAccounts(provisioningProfileId) {
    let accounts = await this._metatraderAccountClient.getAccounts(provisioningProfileId);
    return accounts.map(a => new MetatraderAccount(a, this._metatraderAccountClient));
  }

  /**
   * Retrieves a MetaTrader account by id
   * @param {String} accountId MetaTrader account id
   * @return {Promise<ProvisioningProfile>} promise resolving with MetaTrader account entity
   */
  async getAccount(accountId) {
    let account = await this._metatraderAccountClient.getAccount(accountId);
    return new MetatraderAccount(account, this._metatraderAccountClient);
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
