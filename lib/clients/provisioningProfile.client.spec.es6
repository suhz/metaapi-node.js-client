'use strict';

import should from 'should';
import {HttpClientMock} from './httpClient';
import ProvisioningProfileClient from './provisioningProfile.client';
import fs from 'fs';

const provisioningApiUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';

/**
 * @test {ProvisioningProfileClient}
 */
describe('ProvisioningProfileClient', () => {

  let provisioningClient;
  let httpClient = new HttpClientMock(() => 'empty');

  before(() => {
    provisioningClient = new ProvisioningProfileClient(httpClient, 'token');
  });

  /**
   * @test {ProvisioningProfileClient#getProvisioningProfiles}
   */
  it('should retrieve provisioning profiles from API', async () => {
    let expected = [{
      _id: 'id',
      name: 'name',
      type: 'standard',
      version: 4,
      status: 'active'
    }];
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/provisioning-profiles`,
            method: 'GET',
            qs: {
              version: 5,
              status: 'active'
            },
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let profiles = await provisioningClient.getProvisioningProfiles(5, 'active');
    profiles.should.equal(expected);
  });

  /**
   * @test {ProvisioningProfileClient#getProvisioningProfile}
   */
  it('should retrieve provisioning profile from API', async () => {
    let expected = {
      _id: 'id',
      name: 'name',
      type: 'standard',
      version: 4,
      status: 'active'
    };
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/provisioning-profiles/id`,
            method: 'GET',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let profile = await provisioningClient.getProvisioningProfile('id');
    profile.should.equal(expected);
  });

  /**
   * @test {ProvisioningProfileClient#createProvisioningProfile}
   */
  it('should create provisioning profile via API', async () => {
    let expected = {
      id: 'id'
    };
    let profile = {
      _id: 'id',
      name: 'name',
      type: 'standard',
      version: 4,
      status: 'active'
    };
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/provisioning-profiles`,
            method: 'POST',
            body: profile,
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return expected;
        });
    };
    let id = await provisioningClient.createProvisioningProfile(profile);
    id.should.equal(expected);
  });

  /**
   * @test {ProvisioningProfileClient#uploadProvisioningProfileFile}
   */
  it('should upload file to a provisioning profile via API', async () => {
    let file = Buffer.from('test', 'utf8');
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.match({
            url: `${provisioningApiUrl}/users/current/provisioning-profiles/id/servers.dat`,
            method: 'PUT',
            headers: {
              'auth-token': 'token'
            },
            formData: {
              file
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.uploadProvisioningProfileFile('id', 'servers.dat', file);
  });

  /**
   * @test {ProvisioningProfileClient#deleteProvisioningProfile}
   */
  it('should delete provisioning profile via API', async () => {
    httpClient.requestFn = (opts) => {
      return Promise
        .resolve()
        .then(() => {
          opts.should.eql({
            url: `${provisioningApiUrl}/users/current/provisioning-profiles/id`,
            method: 'DELETE',
            headers: {
              'auth-token': 'token'
            },
            json: true
          });
          return;
        });
    };
    await provisioningClient.deleteProvisioningProfile('id');
  });

});
