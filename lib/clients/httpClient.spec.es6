'use strict';

import should from 'should';
import assert from 'assert';
import sinon  from 'sinon';
import HttpClient from './httpClient';

/**
 * @test {HttpClient}
 */
describe('HttpClient', () => {

  let httpClient;

  before(() => {
    httpClient = new HttpClient();
  });

  /**
   * @test {HttpClient#request}
   */
  it('should load HTML page from example.com', (done) => {
    let opts = {
      url: 'http://example.com'
    };
    httpClient.request(opts)
      .then((body) => {
        body.should.match(/doctype html/);
      })
      .then(done, done);
  }).timeout(10000);

  /**
   * @test {HttpClient#request}
   */
  it('should return NotFound error if server returns 404', (done) => {
    let opts = {
      url: 'http://example.com/not-found'
    };
    httpClient.request(opts)
      .catch((err) => {
        err.name.should.eql('NotFoundError');
      })
      .then(done, done);
  }).timeout(10000);

});
