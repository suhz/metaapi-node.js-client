'use strict';

import should from 'should';
import sinon from 'sinon';
import ProvisioningProfileApi from './provisioningProfileApi';
import ProvisioningProfile from './provisioningProfile';

/**
 * @test {ProvisioningProfileApi}
 * @test {ProvisioningProfile}
 */
describe('ProvisioningProfileApi', () => {

  let sandbox;
  let api;
  let client = {
    getProvisioningProfiles: () => {},
    getProvisioningProfile: () => {},
    createProvisioningProfile: () => {},
    deleteProvisioningProfile: () => {},
    uploadProvisioningProfileFile: () => {}
  };

  before(() => {
    api = new ProvisioningProfileApi(client);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * @test {ProvisioningProfileApi#getProvisioningProfiles}
   */
  it('should retrieve provisioning profiles', async () => {
    sandbox.stub(client, 'getProvisioningProfiles').resolves([{_id: 'id'}]);
    let profiles = await api.getProvisioningProfiles(4, 'new');
    profiles.map(p => p.id).should.match(['id']);
    profiles.forEach(p => (p instanceof ProvisioningProfile).should.be.true());
    sinon.assert.calledWith(client.getProvisioningProfiles, 4, 'new');
  });

  /**
   * @test {ProvisioningProfileApi#getProvisioningProfile}
   */
  it('should retrieve provisioning profile by id', async () => {
    sandbox.stub(client, 'getProvisioningProfile').resolves({_id: 'id', name: 'name', type: 'standard', version: 4,
      status: 'new'});
    let profile = await api.getProvisioningProfile('id');
    profile.id.should.equal('id');
    profile.name.should.equal('name');
    profile.type.should.equal('standard');
    profile.version.should.equal(4);
    profile.status.should.equal('new');
    (profile instanceof ProvisioningProfile).should.be.true();
    sinon.assert.calledWith(client.getProvisioningProfile, 'id');
  });

  /**
   * @test {ProvisioningProfileApi#createProvisioningProfiles}
   */
  it('should create provisioning profile', async () => {
    sandbox.stub(client, 'createProvisioningProfile').resolves({id: 'id'});
    let profile = await api.createProvisioningProfile({name: 'name', type: 'standard', version: 4});
    profile.id.should.equal('id');
    profile.name.should.equal('name');
    profile.type.should.equal('standard');
    profile.version.should.equal(4);
    profile.status.should.equal('new');
    (profile instanceof ProvisioningProfile).should.be.true();
    sinon.assert.calledWith(client.createProvisioningProfile, {name: 'name', type: 'standard', version: 4});
  });

  /**
   * @test {ProvisioningProfile#reload}
   */
  it('should reload provisioning profile', async () => {
    sandbox.stub(client, 'getProvisioningProfile')
      .onFirstCall().resolves({_id: 'id', name: 'name', type: 'standard', version: 4, status: 'new'})
      .onSecondCall().resolves({_id: 'id', name: 'name', type: 'standard', version: 4, status: 'active'});
    let profile = await api.getProvisioningProfile('id');
    await profile.reload();
    profile.status.should.equal('active');
    sinon.assert.calledWith(client.getProvisioningProfile, 'id');
    sinon.assert.calledTwice(client.getProvisioningProfile);
  });

  /**
   * @test {ProvisioningProfile#remove}
   */
  it('should remove provisioning profile', async () => {
    sandbox.stub(client, 'getProvisioningProfile')
      .resolves({_id: 'id', name: 'name', type: 'standard', version: 4, status: 'new'});
    sandbox.stub(client, 'deleteProvisioningProfile').resolves();
    let profile = await api.getProvisioningProfile('id');
    await profile.remove();
    sinon.assert.calledWith(client.deleteProvisioningProfile, 'id');
  });

  /**
   * @test {ProvisioningProfile#uploadFile}
   */
  it('should upload a file to provisioning profile', async () => {
    sandbox.stub(client, 'getProvisioningProfile')
      .resolves({_id: 'id', name: 'name', type: 'standard', version: 4, status: 'new'});
    sandbox.stub(client, 'uploadProvisioningProfileFile').resolves();
    let profile = await api.getProvisioningProfile('id');
    await profile.uploadFile('broker.srv', '/path/to/file.srv');
    sinon.assert.calledWith(client.uploadProvisioningProfileFile, 'id', 'broker.srv', '/path/to/file.srv');
  });

});
