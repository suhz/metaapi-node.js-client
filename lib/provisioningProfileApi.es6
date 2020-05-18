'use strict';

import ProvisioningProfile from './provisioningProfile';

/**
 * Exposes provisioning profile API logic to the consumers
 */
export default class ProvisioningProfileApi {

  /**
   * Constructs a provisioning profile API instance
   * @param {ProvisioningProfileClient} provisioningProfileClient provisioning profile REST API client
   */
  constructor(provisioningProfileClient) {
    this._provisioningProfileClient = provisioningProfileClient;
  }

  /**
   * Retrieves provisioning profiles
   * @param {Number} version optional version filter (allowed values are 4 and 5)
   * @param {String} status optional status filter (allowed values are new and active)
   * @return {Promise<Array<ProvisioningProfile>>} promise resolving with an array of provisioning profile entities
   */
  async getProvisioningProfiles(version, status) {
    let profiles = await this._provisioningProfileClient.getProvisioningProfiles(version, status);
    return profiles.map(p => new ProvisioningProfile(p, this._provisioningProfileClient));
  }

  /**
   * Retrieves a provisioning profile by id
   * @param {String} provisioningProfileId provisioning profile id
   * @return {Promise<ProvisioningProfile>} promise resolving with provisioning profile entity
   */
  async getProvisioningProfile(provisioningProfileId) {
    let profile = await this._provisioningProfileClient.getProvisioningProfile(provisioningProfileId);
    return new ProvisioningProfile(profile, this._provisioningProfileClient);
  }

  /**
   * Creates a provisioning profile
   * @param {NewProvisioningProfileDto} profile provisioning profile data
   * @return {Promise<ProvisioningProfile>} promise resolving with provisioning profile entity
   */
  async createProvisioningProfile(profile) {
    let id = await this._provisioningProfileClient.createProvisioningProfile(profile);
    return new ProvisioningProfile(Object.assign({}, profile, {_id: id.id, status: 'new'}),
      this._provisioningProfileClient);
  }

}
