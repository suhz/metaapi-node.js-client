'use strict';

import should from 'should';
import sinon from 'sinon';
import MetatraderAccountApi from './metatraderAccountApi';
import MetatraderAccount from './metatraderAccount';
import {NotFoundError} from './clients/errorHandler';
import MetaApiConnection from './metaApiConnection';

/**
 * @test {MetatraderAccountApi}
 * @test {MetatraderAccount}
 */
describe('MetatraderAccountApi', () => {

  let sandbox;
  let api;
  let client = {
    getAccounts: () => {},
    getAccount: () => {},
    createAccount: () => {},
    deleteAccount: () => {},
    deployAccount: () => {},
    undeployAccount: () => {},
    redeployAccount: () => {}
  };
  let metaApiWebsocketClient = {
    addSynchronizationListener: () => {},
    synchronize: () => {}
  };

  before(() => {
    api = new MetatraderAccountApi(client, metaApiWebsocketClient);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * @test {MetatraderAccountApi#getAccounts}
   */
  it('should retrieve MT accounts', async () => {
    sandbox.stub(client, 'getAccounts').resolves([{_id: 'id'}]);
    let accounts = await api.getAccounts('profileId');
    accounts.map(a => a.id).should.match(['id']);
    accounts.forEach(a => (a instanceof MetatraderAccount).should.be.true());
    sinon.assert.calledWith(client.getAccounts, 'profileId');
  });

  /**
   * @test {MetatraderAccountApi#getAccount}
   */
  it('should retrieve MT account by id', async () => {
    sandbox.stub(client, 'getAccount').resolves({
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
    });
    let account = await api.getAccount('id');
    account.id.should.equal('id');
    account.login.should.equal('50194988');
    account.name.should.equal('mt5a');
    account.server.should.equal('ICMarketsSC-Demo');
    account.provisioningProfileId.should.equal('f9ce1f12-e720-4b9a-9477-c2d4cb25f076');
    account.magic.should.equal('123456');
    account.timeConverter.should.equal('icmarkets');
    account.application.should.equal('MetaApi');
    account.connectionStatus.should.equal('DISCONNECTED');
    account.state.should.equal('DEPLOYED');
    account.synchronizationMode.should.equal('automatic');
    account.type.should.equal('cloud');
    (account instanceof MetatraderAccount).should.be.true();
    sinon.assert.calledWith(client.getAccount, 'id');
  });

  /**
   * @test {MetatraderAccountApi#createAccount}
   */
  it('should create MT account', async () => {
    sandbox.stub(client, 'createAccount').resolves({id: 'id'});
    sandbox.stub(client, 'getAccount').resolves({
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
    });
    let newAccountData = {
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
    let account = await api.createAccount(newAccountData);
    account.id.should.equal('id');
    account.login.should.equal('50194988');
    account.name.should.equal('mt5a');
    account.server.should.equal('ICMarketsSC-Demo');
    account.provisioningProfileId.should.equal('f9ce1f12-e720-4b9a-9477-c2d4cb25f076');
    account.magic.should.equal('123456');
    account.timeConverter.should.equal('icmarkets');
    account.application.should.equal('MetaApi');
    account.connectionStatus.should.equal('DISCONNECTED');
    account.state.should.equal('DEPLOYED');
    account.synchronizationMode.should.equal('automatic');
    account.type.should.equal('cloud');
    (account instanceof MetatraderAccount).should.be.true();
    sinon.assert.calledWith(client.createAccount, newAccountData);
    sinon.assert.calledWith(client.getAccount, 'id');
  });

  /**
   * @test {MetatraderAccount#reload}
   */
  it('should reload MT account', async () => {
    sandbox.stub(client, 'getAccount')
      .onFirstCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'DEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      })
      .onSecondCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'DEPLOYED',
        synchronizationMode: 'automatic',
        type: 'cloud'
      });
    let account = await api.getAccount('id');
    await account.reload();
    account.connectionStatus.should.equal('CONNECTED');
    account.state.should.equal('DEPLOYED');
    sinon.assert.calledWith(client.getAccount, 'id');
    sinon.assert.calledTwice(client.getAccount);
  });

  /**
   * @test {MetatraderAccount#remove}
   */
  it('should remove MT account', async () => {
    sandbox.stub(client, 'getAccount')
      .onFirstCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'DEPLOYED',
        synchronizationMode: 'automatic',
        type: 'cloud'
      })
      .onSecondCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'DELETING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      });
    sandbox.stub(client, 'deleteAccount').resolves();
    let account = await api.getAccount('id');
    await account.remove();
    account.state.should.equal('DELETING');
    sinon.assert.calledWith(client.deleteAccount, 'id');
    sinon.assert.calledWith(client.getAccount, 'id');
    sinon.assert.calledTwice(client.getAccount);
  });

  /**
   * @test {MetatraderAccount#deploy}
   */
  it('should deploy MT account', async () => {
    sandbox.stub(client, 'getAccount')
      .onFirstCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'UNDEPLOYED',
        synchronizationMode: 'automatic',
        type: 'cloud'
      })
      .onSecondCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'DEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      });
    sandbox.stub(client, 'deployAccount').resolves();
    let account = await api.getAccount('id');
    await account.deploy();
    account.state.should.equal('DEPLOYING');
    sinon.assert.calledWith(client.deployAccount, 'id');
    sinon.assert.calledWith(client.getAccount, 'id');
    sinon.assert.calledTwice(client.getAccount);
  });

  /**
   * @test {MetatraderAccount#undeploy}
   */
  it('should undeploy MT account', async () => {
    sandbox.stub(client, 'getAccount')
      .onFirstCall().resolves({
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
      })
      .onSecondCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'UNDEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      });
    sandbox.stub(client, 'undeployAccount').resolves();
    let account = await api.getAccount('id');
    await account.undeploy();
    account.state.should.equal('UNDEPLOYING');
    sinon.assert.calledWith(client.undeployAccount, 'id');
    sinon.assert.calledWith(client.getAccount, 'id');
    sinon.assert.calledTwice(client.getAccount);
  });

  /**
   * @test {MetatraderAccount#redeploy}
   */
  it('should redeploy MT account', async () => {
    sandbox.stub(client, 'getAccount')
      .onFirstCall().resolves({
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
      })
      .onSecondCall().resolves({
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'CONNECTED',
        state: 'UNDEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      });
    sandbox.stub(client, 'redeployAccount').resolves();
    let account = await api.getAccount('id');
    await account.redeploy();
    account.state.should.equal('UNDEPLOYING');
    sinon.assert.calledWith(client.redeployAccount, 'id');
    sinon.assert.calledWith(client.getAccount, 'id');
    sinon.assert.calledTwice(client.getAccount);
  });

  describe('MetatraderAccount.waitDeployed', () => {

    /**
     * @test {MetatraderAccount#waitDeployed}
     */
    it('should wait for deployment', async () => {
      let deployingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'DEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .onFirstCall().resolves(deployingAccount)
        .onSecondCall().resolves(deployingAccount)
        .onThirdCall().resolves({
          _id: 'id',
          login: '50194988',
          name: 'mt5a',
          server: 'ICMarketsSC-Demo',
          provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
          magic: '123456',
          timeConverter: 'icmarkets',
          application: 'MetaApi',
          connectionStatus: 'CONNECTED',
          state: 'DEPLOYED',
          synchronizationMode: 'automatic',
          type: 'cloud'
        });
      let account = await api.getAccount('id');
      await account.waitDeployed(1, 50);
      account.state.should.equal('DEPLOYED');
      sinon.assert.calledWith(client.getAccount, 'id');
      sinon.assert.calledThrice(client.getAccount);
    });

    /**
     * @test {MetatraderAccount#waitDeployed}
     */
    it('should time out waiting for deployment', async () => {
      let deployingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'DEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .resolves(deployingAccount);
      let account = await api.getAccount('id');
      try {
        await account.waitDeployed(1, 50);
        throw new Error('TimeoutError is expected');
      } catch (err) {
        err.name.should.equal('TimeoutError');
        account.state.should.equal('DEPLOYING');
      }
      sinon.assert.calledWith(client.getAccount, 'id');
    });

  });

  describe('MetatraderAccount.waitUndeployed', () => {

    /**
     * @test {MetatraderAccount#waitUndeployed}
     */
    it('should wait for undeployment', async () => {
      let undeployingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'UNDEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .onFirstCall().resolves(undeployingAccount)
        .onSecondCall().resolves(undeployingAccount)
        .onThirdCall().resolves({
          _id: 'id',
          login: '50194988',
          name: 'mt5a',
          server: 'ICMarketsSC-Demo',
          provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
          magic: '123456',
          timeConverter: 'icmarkets',
          application: 'MetaApi',
          connectionStatus: 'CONNECTED',
          state: 'UNDEPLOYED',
          synchronizationMode: 'automatic',
          type: 'cloud'
        });
      let account = await api.getAccount('id');
      await account.waitUndeployed(1, 50);
      account.state.should.equal('UNDEPLOYED');
      sinon.assert.calledWith(client.getAccount, 'id');
      sinon.assert.calledThrice(client.getAccount);
    });

    /**
     * @test {MetatraderAccount#waitUndeployed}
     */
    it('should time out waiting for undeployment', async () => {
      let undeployingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'UNDEPLOYING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .resolves(undeployingAccount);
      let account = await api.getAccount('id');
      try {
        await account.waitUndeployed(1, 50);
        throw new Error('TimeoutError is expected');
      } catch (err) {
        err.name.should.equal('TimeoutError');
        account.state.should.equal('UNDEPLOYING');
      }
      sinon.assert.calledWith(client.getAccount, 'id');
    });

  });

  describe('MetatraderAccount.waitRemoved', () => {

    /**
     * @test {MetatraderAccount#waitRemoved}
     */
    it('should wait until removed', async () => {
      let deletingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'DELETING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .onFirstCall().resolves(deletingAccount)
        .onSecondCall().resolves(deletingAccount)
        .onThirdCall().throws(new NotFoundError());
      let account = await api.getAccount('id');
      await account.waitRemoved(1, 50);
      sinon.assert.calledWith(client.getAccount, 'id');
      sinon.assert.calledThrice(client.getAccount);
    });

    /**
     * @test {MetatraderAccount#waitRemoved}
     */
    it('should time out waiting until removed', async () => {
      let deletingAccount = {
        _id: 'id',
        login: '50194988',
        name: 'mt5a',
        server: 'ICMarketsSC-Demo',
        provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
        magic: '123456',
        timeConverter: 'icmarkets',
        application: 'MetaApi',
        connectionStatus: 'DISCONNECTED',
        state: 'DELETING',
        synchronizationMode: 'automatic',
        type: 'cloud'
      };
      sandbox.stub(client, 'getAccount')
        .resolves(deletingAccount);
      let account = await api.getAccount('id');
      try {
        await account.waitRemoved(1, 50);
        throw new Error('TimeoutError is expected');
      } catch (err) {
        err.name.should.equal('TimeoutError');
      }
      sinon.assert.calledWith(client.getAccount, 'id');
    });

  });

  describe('MetatraderAccount.waitConnected', () => {

    /**
     * @test {MetatraderAccount#waitConnected}
     */
    it('should wait util broker connection', async () => {
      let disconnectedAccount = {
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
      sandbox.stub(client, 'getAccount')
        .onFirstCall().resolves(disconnectedAccount)
        .onSecondCall().resolves(disconnectedAccount)
        .onThirdCall().resolves({
          _id: 'id',
          login: '50194988',
          name: 'mt5a',
          server: 'ICMarketsSC-Demo',
          provisioningProfileId: 'f9ce1f12-e720-4b9a-9477-c2d4cb25f076',
          magic: '123456',
          timeConverter: 'icmarkets',
          application: 'MetaApi',
          connectionStatus: 'CONNECTED',
          state: 'DEPLOYED',
          synchronizationMode: 'automatic',
          type: 'cloud'
        });
      let account = await api.getAccount('id');
      await account.waitConnected(1, 50);
      account.connectionStatus.should.equal('CONNECTED');
      sinon.assert.calledWith(client.getAccount, 'id');
      sinon.assert.calledThrice(client.getAccount);
    });

    /**
     * @test {MetatraderAccount#waitConnected}
     */
    it('should time out waiting for broker connection', async () => {
      let disconnectedAccount = {
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
      sandbox.stub(client, 'getAccount')
        .resolves(disconnectedAccount);
      let account = await api.getAccount('id');
      try {
        await account.waitConnected(1, 50);
        throw new Error('TimeoutError is expected');
      } catch (err) {
        err.name.should.equal('TimeoutError');
        account.connectionStatus.should.equal('DISCONNECTED');
      }
      sinon.assert.calledWith(client.getAccount, 'id');
    });

  });

  /**
   * @test {MetatraderAccount#connect}
   */
  it('should connect to an MT terminal', async () => {
    sandbox.stub(metaApiWebsocketClient, 'addSynchronizationListener').returns();
    sandbox.stub(metaApiWebsocketClient, 'synchronize').resolves();
    sandbox.stub(client, 'getAccount').resolves({_id: 'id', synchronizationMode: 'user'});
    let account = await api.getAccount();
    let storage = {
      lastHistoryOrderTime: () => new Date('2020-01-01T00:00:00.000Z'),
      lastDealTime: () => new Date('2020-01-02T00:00:00.000Z')
    };
    let connection = await account.connect(storage);
    (connection instanceof MetaApiConnection).should.be.true();
    connection.historyStorage.should.equal(storage);
    sinon.assert.calledWith(metaApiWebsocketClient.addSynchronizationListener, 'id', storage);
    sinon.assert.calledWith(metaApiWebsocketClient.synchronize, 'id', new Date('2020-01-01T00:00:00.000Z'),
      new Date('2020-01-02T00:00:00.000Z'));
  });

});
