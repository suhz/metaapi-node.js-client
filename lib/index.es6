'use strict';

import MetaApiWebsocketClient from './clients/metaApiWebsocket.client';
import ProvisioningProfileApi from './provisioningProfileApi';
import ProvisioningProfileClient from './clients/provisioningProfile.client';
import HttpClient from './clients/httpClient';
import MetatraderAccountClient from './clients/metatraderAccount.client';
import MetatraderAccountApi from './metatraderAccountApi';

/**
 * MetaApi MetaTrader API SDK
 */
export default class MetaApi {

  /**
   * Constructs MetaApi class instance
   * @param {String} token authorization token
   * @param {String} domain domain to connect to
   */
  constructor(token, domain = 'agiliumtrade.agiliumtrade.ai') {
    let httpClient = new HttpClient();
    this._provisioningProfileApi = new ProvisioningProfileApi(new ProvisioningProfileClient(httpClient, token, domain));
    this._metatraderAccountApi = new MetatraderAccountApi(new MetatraderAccountClient(httpClient, token, domain),
      new MetaApiWebsocketClient(token, domain));
  }

  get provisioningProfileApi() {
    return this._provisioningProfileApi;
  }

  get metatraderAccountApi() {
    return this._metatraderAccountApi;
  }
  
}
