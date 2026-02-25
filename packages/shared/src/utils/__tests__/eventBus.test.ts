import { eventBus } from '../eventBus';

describe('eventBus', () => {
  afterEach(() => {
    // The eventBus is a singleton so we need to clean up between tests.
    // There is no public reset method, so we just ensure no leaked subscriptions
    // by always unsubscribing in each test.
  });

  it('delivers events to subscribed callbacks', () => {
    const callback = jest.fn();
    const unsub = eventBus.subscribe('test:deliver', callback);

    eventBus.publish('test:deliver', { value: 42 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ value: 42 });

    unsub();
  });

  it('stops delivering events after unsubscribe', () => {
    const callback = jest.fn();
    const unsub = eventBus.subscribe('test:unsub', callback);

    eventBus.publish('test:unsub', 'first');
    expect(callback).toHaveBeenCalledTimes(1);

    unsub();

    eventBus.publish('test:unsub', 'second');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('delivers events to multiple subscribers', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();

    const unsub1 = eventBus.subscribe('test:multi', cb1);
    const unsub2 = eventBus.subscribe('test:multi', cb2);
    const unsub3 = eventBus.subscribe('test:multi', cb3);

    eventBus.publish('test:multi', 'hello');

    expect(cb1).toHaveBeenCalledWith('hello');
    expect(cb2).toHaveBeenCalledWith('hello');
    expect(cb3).toHaveBeenCalledWith('hello');

    unsub1();
    unsub2();
    unsub3();
  });

  it('does not block other subscribers when one throws', () => {
    const cb1 = jest.fn();
    const cbError = jest.fn(() => {
      throw new Error('subscriber error');
    });
    const cb2 = jest.fn();

    const unsub1 = eventBus.subscribe('test:error', cb1);
    const unsubErr = eventBus.subscribe('test:error', cbError);
    const unsub2 = eventBus.subscribe('test:error', cb2);

    // Suppress console.error from the eventBus error handler
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    eventBus.publish('test:error', 'data');

    expect(cb1).toHaveBeenCalledWith('data');
    expect(cbError).toHaveBeenCalledWith('data');
    expect(cb2).toHaveBeenCalledWith('data');

    spy.mockRestore();
    unsub1();
    unsubErr();
    unsub2();
  });

  it('does not throw when publishing with no subscribers', () => {
    expect(() => {
      eventBus.publish('test:no-subscribers', { any: 'data' });
    }).not.toThrow();
  });

  it('delivers events without data (undefined payload)', () => {
    const callback = jest.fn();
    const unsub = eventBus.subscribe('test:no-data', callback);

    eventBus.publish('test:no-data');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(undefined);

    unsub();
  });

  it('allows the same callback to subscribe to different events', () => {
    const callback = jest.fn();
    const unsub1 = eventBus.subscribe('test:event-a', callback);
    const unsub2 = eventBus.subscribe('test:event-b', callback);

    eventBus.publish('test:event-a', 'a');
    eventBus.publish('test:event-b', 'b');

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith('a');
    expect(callback).toHaveBeenCalledWith('b');

    unsub1();
    unsub2();
  });
});
