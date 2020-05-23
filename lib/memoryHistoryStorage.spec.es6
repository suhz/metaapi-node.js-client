'use strict';

import should from 'should';
import MemoryHistoryStorage from './memoryHistoryStorage';

/**
 * @test {MemoryHistoryStorage}
 */
describe('MemoryHistoryStorage', () => {

  let storage;

  before(() => {
    storage = new MemoryHistoryStorage();
  });

  beforeEach(() => {
    storage.reset();
    storage.onConnected();
  });

  /**
   * @test {MemoryHistoryStorage#lastHistoryOrderTime}
   */
  it('should return last history order time', () => {
    storage.onHistoryOrderAdded({});
    storage.onHistoryOrderAdded({doneTime: new Date('2020-01-01T00:00:00.000Z')});
    storage.onHistoryOrderAdded({doneTime: new Date('2020-01-02T00:00:00.000Z')});
    storage.lastHistoryOrderTime().should.match(new Date('2020-01-02T00:00:00.000Z'));
  });

  /**
   * @test {MemoryHistoryStorage#lastDealTime}
   */
  it('should return last history deal time', () => {
    storage.onDealAdded({});
    storage.onDealAdded({time: new Date('2020-01-01T00:00:00.000Z')});
    storage.onDealAdded({time: new Date('2020-01-02T00:00:00.000Z')});
    storage.lastDealTime().should.match(new Date('2020-01-02T00:00:00.000Z'));
  });

  /**
   * @test {MemoryHistoryStorage#deals}
   */
  it('should return saved deals', () => {
    storage.onDealAdded({id: '1', time: new Date('2020-01-01T00:00:00.000Z')});
    storage.onDealAdded({id: '3', time: new Date('2020-01-03T00:00:00.000Z')});
    storage.onDealAdded({id: '2', time: new Date('2020-01-02T00:00:00.000Z')});
    storage.deals.should.match([
      {id: '1', time: new Date('2020-01-01T00:00:00.000Z')},
      {id: '2', time: new Date('2020-01-02T00:00:00.000Z')},
      {id: '3', time: new Date('2020-01-03T00:00:00.000Z')}
    ]);
  });

  /**
   * @test {MemoryHistoryStorage#historyOrders}
   */
  it('should return saved historyOrders', () => {
    storage.onHistoryOrderAdded({id: '1', doneTime: new Date('2020-01-01T00:00:00.000Z')});
    storage.onHistoryOrderAdded({id: '3', doneTime: new Date('2020-01-03T00:00:00.000Z')});
    storage.onHistoryOrderAdded({id: '2', doneTime: new Date('2020-01-02T00:00:00.000Z')});
    storage.historyOrders.should.match([
      {id: '1', doneTime: new Date('2020-01-01T00:00:00.000Z')},
      {id: '2', doneTime: new Date('2020-01-02T00:00:00.000Z')},
      {id: '3', doneTime: new Date('2020-01-03T00:00:00.000Z')}
    ]);
  });

  /**
   * @test {MemoryHistoryStorage#orderSynchronizationFinished}
   */
  it('should return saved order synchronization status', () => {
    storage.orderSynchronizationFinished.should.be.false();
    storage.onOrderSynchronizationFinished();
    storage.orderSynchronizationFinished.should.be.true();
  });

  /**
   * @test {MemoryHistoryStorage#dealSynchronizationFinished}
   */
  it('should return saved deal synchronization status', () => {
    storage.dealSynchronizationFinished.should.be.false();
    storage.onDealSynchronizationFinished();
    storage.dealSynchronizationFinished.should.be.true();
  });

});
