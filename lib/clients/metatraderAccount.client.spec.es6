'use strict';

import should from 'should';
import {HttpClientMock} from './httpClient';
import MetatraderAccountClient from './metatraderAccount.client';
import fs from 'fs';

const provisioningApiUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';

/**
 * @test {MetatraderAccountClient}
 */
describe('MetatraderAccountClient', () => {

  let provisioningClient;
  let httpClient = new HttpClientMock(() => 'empty');

  before(() => {
    provisioningClient = new MetatraderAccountClient(httpClient, 'token');
  });

  /**
   * @test {MetatraderAccountClient#getAccounts}
   */
  it('should retrieve MetaTrader accounts from API', async () => {
    let expected = [{
      _id: '1eda642a-a9a3-457c-99af-3bc5e8d5c4c9',
      login: '50194988',
      name: 'mt5a',
      server: 'ICMarketsSC-Demo',
      provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
      magic: '123456',
      timeConverter: 'icmarkets',
      application: 'MetaApi',
      connectionStatus: 'DISCONNECTED',
      state: 'DEPLOYED',
      synchronizationMode: 'automatic',
      type: 'cloud'
    }];
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts`,
            method: 'GET',
            qs: {
              provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076'
            },
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let accounts = await provisioningClient.getAccounts('f9ce1f12-e720-4b9a-9477-c2d4cb25f076');
    accounts.should.equal(expected);
  });

  /**
   * @test {MetatraderAccountClient#getAccount}
   */
  it('should retrieve MetaTrader account from API', async () => {
    let expected = {
      _id: 'id',
      login: '50194988',
      name: 'mt5a',
      server: 'ICMarketsSC-Demo',
      provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
      magic: '123456',
      timeConverter: 'icmarkets',
      application: 'MetaApi',
      connectionStatus: 'DISCONNECTED',
      state: 'DEPLOYED',
      synchronizationMode: 'automatic',
      type: 'cloud'
    };
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts/id`,
            method: 'GET',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let account = await provisioningClient.getAccount('id');
    account.should.equal(expected);
  });

  /**
   * @test {MetatraderAccountClient#createAccount}
   */
  it('should create MetaTrader account via API', async () => {
    let expected = {
      id: 'id'
    };
    let account = {
      login: '50194988',
      password: 'Test1234',
      name: 'mt5a',
      server: 'ICMarketsSC-Demo',
      provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
      magic: '123456',
      timeConverter: 'icmarkets',
      application: 'MetaApi',
      synchronizationMode: 'automatic',
      type: 'cloud'
    };
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts`,
            method: 'POST',
            body: account,
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let id = await provisioningClient.createAccount(account);
    id.should.equal(expected);
  });

  /**
   * @test {MetatraderAccountClient#deployAccount}
   */
  it('should deploy MetaTrader account via API', async () => {
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts/id/deploy`,
            method: 'POST',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.deployAccount('id');
  });

  /**
   * @test {MetatraderAccountClient#undeployAccount}
   */
  it('should undeploy MetaTrader account via API', async () => {
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts/id/undeploy`,
            method: 'POST',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.undeployAccount('id');
  });

  /**
   * @test {MetatraderAccountClient#redeployAccount}
   */
  it('should redeploy MetaTrader account via API', async () => {
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts/id/redeploy`,
            method: 'POST',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.redeployAccount('id');
  });

  /**
   * @test {MetatraderAccountClient#deleteAccount}
   */
  it('should delete MetaTrader account via API', async () => {
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/accounts/id`,
            method: 'DELETE',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.deleteAccount('id');
  });

});
