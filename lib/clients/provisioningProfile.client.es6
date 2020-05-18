'use strict';

import fs from 'fs';

/**
 * metaapi.cloud provisioning profile API client (see https://metaapi.cloud/docs/provisioning/)
 */
export default class ProvisioningProfileClient {

  /**
   * Constructs provisioning API client instance
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
   * Provisioning profile model
   * @typedef {Object} ProvisioningProfileDto
   * @property {String} _id provisioning profile unique identifier
   * @property {String} name provisioning profile name
   * @property {String} type provisioning profile type (allowed values are standard and advanced)
   * @property {Number} version MetaTrader version (allowed values are 4 and 5)
   * @property {String} status provisioning profile status (allowed values are new and active)
   */

  /**
   * Retrieves provisioning profiles owned by user
   * (see https://metaapi.cloud/docs/provisioning/api/provisioningProfile/readProvisioningProfiles/)
   * @param {Number} version optional version filter (allowed values are 4 and 5)
   * @param {String} status optional status filter (allowed values are new and active)
   * @return {Promise<Array<ProvisioningProfileDto>>} promise resolving with provisioning profiles found
   */
  getProvisioningProfiles(version, status) {
    let qs = {};
    if (version) {
      qs.version = version;
    }
    if (status) {
      qs.status = status;
    }
    const opts = {
      url: `${this._host}/users/current/provisioning-profiles`,
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
   * Retrieves a provisioning profile by id (see
   * https://metaapi.cloud/docs/provisioning/api/provisioningProfile/readProvisioningProfile/). Throws an error if
   * profile is not found.
   * @param {String} id provisioning profile id
   * @return {Promise<ProvisioningProfileDto>} promise resolving with provisioning profile found
   */
  getProvisioningProfile(id) {
    const opts = {
      url: `${this._host}/users/current/provisioning-profiles/${id}`,
      method: 'GET',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

  /**
   * New provisioning profile model
   * @typedef {Object} NewProvisioningProfileDto
   * @property {String} name provisioning profile name
   * @property {String} type provisioning profile type (allowed values are standard and advanced)
   * @property {Number} version MetaTrader version (allowed values are 4 and 5)
   */

  /**
   * Provisioning profile id model
   * @typedef {Object} ProvisioningProfileIdDto
   * @property {String} id provisioning profile unique identifier
   */

  /**
   * Creates a new provisioning profile (see
   * https://metaapi.cloud/docs/provisioning/api/provisioningProfile/createNewProvisioningProfile/). After creating a
   * provisioning profile you are required to upload extra files in order to activate the profile for further use.
   * @param {NewProvisioningProfileDto} provisioningProfile provisioning profile to create
   * @return {Promise<ProvisioningProfileIdDto>} promise resolving with an id of the provisioning profile created
   */
  createProvisioningProfile(provisioningProfile) {
    const opts = {
      url: `${this._host}/users/current/provisioning-profiles`,
      method: 'POST',
      headers: {
        'auth-token': this._token
      },
      json:true,
      body: provisioningProfile
    };
    return this._httpClient.request(opts);
  }

  /**
   * Uploads a file to a provisioning profile (see
   * https://metaapi.cloud/docs/provisioning/api/provisioningProfile/uploadFilesToProvisioningProfile/).
   * @param {String} provisioningProfileId provisioning profile id to upload file to
   * @param {String} fileName name of the file to upload. Allowed values are servers.dat for MT5 profile, broker.srv for
   * MT4 profile, profile.zip for advanced profile
   * @param {String|Buffer} file path to a file to upload or buffer containing file contents
   * @return {Promise} promise resolving when file upload is completed
   */
  uploadProvisioningProfileFile(provisioningProfileId, fileName, file) {
    if (typeof file === 'string') {
      file = fs.createReadStream(file);
    }
    const opts = {
      method: 'PUT',
      url: `${this._host}/users/current/provisioning-profiles/${provisioningProfileId}/${fileName}`,
      formData: {
        file
      },
      json: true,
      headers: {
        'auth-token': this._token
      }
    };
    return this._httpClient.request(opts);
  }

  /**
   * Deletes a provisioning profile (see
   * https://metaapi.cloud/docs/provisioning/api/provisioningProfile/deleteProvisioningProfile/). Please note that in
   * order to delete a provisioning profile you need to delete MT accounts connected to it first.
   * @param {String} id provisioning profile id
   * @return {Promise} promise resolving when provisioning profile is deleted
   */
  deleteProvisioningProfile(id) {
    const opts = {
      url: `${this._host}/users/current/provisioning-profiles/${id}`,
      method: 'DELETE',
      headers: {
        'auth-token': this._token
      },
      json:true
    };
    return this._httpClient.request(opts);
  }

}
