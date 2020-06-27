import React from 'react';
import ReactPolling from './ReactPolling';
import { shallow } from 'enzyme';

import * as mockData from '../__mock_data__/data';

describe('<ReactPolling />', () => {
  let onSuccess = jest.fn(),
    onFailure = jest.fn,
    url = 'http://localhost/session/status';
  describe('success test cases', () => {
    beforeAll(() => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => {
            return new Promise(resolve => {
              resolve(mockData.continuePollingResponse);
            });
          },
          ok: true
        })
      );
    });
    test('should render properly with render props', () => {
      const wrapper = shallow(
        <ReactPolling
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id="isPolling"> I am polling</div> : <div id="isNotPolling"> I am not polling </div>}
              </div>
            );
          }}
        />
      );
      expect(wrapper.find('p').length).toBe(1);
      expect(wrapper.find('#isPolling').length).toBe(1);
    });
    test('should render properly with children props', () => {
      const wrapper = shallow(
        <ReactPolling url={url} onSuccess={onSuccess} onFailure={onFailure}>
          {({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id="isPolling"> I am polling</div> : <div id="isNotPolling"> I am not polling </div>}
              </div>
            );
          }}
        </ReactPolling>
      );
      expect(wrapper.find('p').length).toBe(1);
      expect(wrapper.find('#isPolling').length).toBe(1);
    });
    describe('initial tests for checking initial variables before we start polling', () => {
      let wrapper, mockedComponentDidMount;
      beforeEach(() => {
        mockedComponentDidMount = jest.spyOn(ReactPolling.prototype, 'componentDidMount');
        mockedComponentDidMount.mockImplementation();
        wrapper = shallow(
          <ReactPolling
            url={url}
            onSuccess={onSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
      });
      afterEach(() => {
        wrapper = null;
        mockedComponentDidMount.mockRestore();
      });
      test('should have right initial state', () => {
        const expectedState = {
          isPolling: false
        };
        expect(wrapper.state()).toEqual(expectedState);
      });
      test('should have right initial config', () => {
        const expectedConfig = {
          url,
          interval: 3000,
          shouldRetry: false,
          retryCount: 0,
          onSuccess,
          onFailure,
          api: {
            method: 'GET'
          }
        };
        expect(wrapper.instance().config).toMatchObject(expectedConfig);
      });
      test('should have all the function defined', () => {
        expect(wrapper.instance().initConfig).toBeDefined();
        expect(wrapper.instance().config).toBeDefined();
        expect(wrapper.instance().startPolling).toBeDefined();
        expect(wrapper.instance().stopPolling).toBeDefined();
        expect(wrapper.instance().runPolling).toBeDefined();
      });
    });
    describe('tests with polling started', () => {
      test('startPolling function to have been called', () => {
        const mockedStartPolling = jest.spyOn(ReactPolling.prototype, 'startPolling');
        mockedStartPolling.mockImplementation();
        shallow(
          <ReactPolling
            url={url}
            onSuccess={onSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        expect(mockedStartPolling).toHaveBeenCalledTimes(1);
        mockedStartPolling.mockRestore();
      });
      test('startPolling function to throw an error when no url provided', () => {
        expect(() => {
          shallow(
            <ReactPolling
              url={null}
              onSuccess={onSuccess}
              onFailure={onFailure}
              render={({ isPolling }) => {
                return (
                  <div>
                    <p>Polling Component</p>
                    {isPolling ? (
                      <div id="isPolling"> I am polling</div>
                    ) : (
                      <div id="isNotPolling"> I am not polling </div>
                    )}
                  </div>
                );
              }}
            />
          );
        }).toThrowError();
      });
      test('startPolling should set isPolling state to true, _ismounted to true and call runPolling function', () => {
        const mockedRunPolling = jest.spyOn(ReactPolling.prototype, 'runPolling');
        mockedRunPolling.mockImplementation();
        const wrapper = shallow(
          <ReactPolling
            url={url}
            onSuccess={onSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        wrapper.update();
        expect(wrapper.state().isPolling).toBeTruthy();
        expect(wrapper.instance()._ismounted).toBeTruthy();
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
        mockedRunPolling.mockRestore();
        mockedRunPolling.mockClear();
      });
      test('stopPolling should set isPolling to false, _ismounted to false and poll to null', () => {
        const wrapper = shallow(
          <ReactPolling
            url={url}
            onSuccess={onSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        wrapper.instance().stopPolling();
        wrapper.update();
        expect(wrapper.state().isPolling).toBeFalsy();
        expect(wrapper.instance()._ismounted).toBeTruthy();
        expect(wrapper.instance().poll).toBeNull();
      });
    });
    describe('timer events', () => {
      let mockedRunPolling, mockedOnSuccess;
      beforeEach(() => {
        jest.useFakeTimers();
        mockedRunPolling = jest.spyOn(ReactPolling.prototype, 'runPolling');
        mockedOnSuccess = jest.fn(() => {
          return true;
        });
      });
      afterEach(() => {
        jest.clearAllTimers();
        mockedRunPolling.mockClear();
        mockedOnSuccess.mockClear();
      });
      test('run Polling should call setTimeout and make api calls at every interval', async () => {
        shallow(
          <ReactPolling
            url={url}
            onSuccess={mockedOnSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
        await Promise.resolve();
        expect(mockedRunPolling).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
      });
      test('onSuccess and run Polling should get called when response from api is empty', async () => {
        global.fetch = jest.fn().mockImplementation(() =>
          Promise.resolve({
            json: () => {
              return new Promise((resolve, reject) => {
                reject(mockData.continuePollingResponse);
              });
            },
            ok: true
          })
        );
        shallow(
          <ReactPolling
            url={url}
            onSuccess={mockedOnSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
        await Promise.resolve();
        expect(mockedRunPolling).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
      });
      test('onSuccess and run Polling should get called using a custom promise', async () => {
        const data = [{ id: 1 }, { id: 2 }];
        const fetchData = () => {
          return new Promise(resolve => {
            resolve({
              data
            });
          });
        };
        shallow(
          <ReactPolling
            url={url}
            onSuccess={mockedOnSuccess}
            onFailure={onFailure}
            promise={fetchData}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
        expect(mockedOnSuccess).toHaveBeenCalledWith({ data: data });
        await Promise.resolve();
        expect(mockedRunPolling).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
      });
      test('run Polling should call setTimeout and make api calls at every interval with backOffFactor', async () => {
        shallow(
          <ReactPolling
            url={url}
            onSuccess={mockedOnSuccess}
            onFailure={onFailure}
            backOffFactor={2}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id="isPolling"> I am polling</div>
                  ) : (
                    <div id="isNotPolling"> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
        await Promise.resolve();
        expect(mockedRunPolling).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 6000);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
      });
    });
  });
  describe('error test cases', () => {
    beforeAll(() => {
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          reject(true);
        });
      });
    });
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.clearAllTimers();
    });
    test('onFailure should retry equal to config.retryTimes', async () => {
      const mockedRunPolling = jest.spyOn(ReactPolling.prototype, 'runPolling');
      const mockedStopPolling = jest.spyOn(ReactPolling.prototype, 'stopPolling');
      const retryCount = 4;
      const wrapper = shallow(
        <ReactPolling
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          retryCount={retryCount}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id="isPolling"> I am polling</div> : <div id="isNotPolling"> I am not polling </div>}
              </div>
            );
          }}
        />
      );
      expect(mockedRunPolling).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(1);
      for (let i = 0; i < retryCount; i++) {
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalledTimes(i + 1);
        for (let i = 0; i < retryCount + 1; i++) {
          await Promise.resolve(true);
        }
        expect(mockedRunPolling).toHaveBeenCalledTimes(i + 2);
        expect(mockedStopPolling).toHaveBeenCalledTimes(0);
        expect(wrapper.state().isPolling).toBeTruthy();
      }
      jest.runAllTimers();
      for (let i = 0; i < retryCount + 1; i++) {
        await Promise.resolve(true);
      }
      expect(mockedStopPolling).toHaveBeenCalledTimes(1);
      expect(wrapper.instance().config._ismounted).toBeFalsy();
      expect(wrapper.state().isPolling).toBeFalsy();
      mockedRunPolling.mockRestore();
      mockedRunPolling.mockClear();
    });
  });
});
