import React from 'react';
import ReactPing from './ReactPing';
import { shallow } from 'enzyme';

import * as mockData from '../__mock_data__/data';

describe('<ReactPing />', () => {
  let onSuccess = jest.fn(),
    onFailure = jest.fn,
    url = '/session/status';
  beforeEach(() => {
    fetch.mockResponseOnce(JSON.stringify(mockData.continuePollingResponse));
  });
  test('should render properly with render props', () => {
    const wrapper = shallow(
      <ReactPing
        url={url}
        onSuccess={onSuccess}
        onFailure={onFailure}
        render={({ isPolling }) => {
          return (
            <div>
              <p>Polling Component</p>
              {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
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
      <ReactPing url={url} onSuccess={onSuccess} onFailure={onFailure}>
        {({ isPolling }) => {
          return (
            <div>
              <p>Polling Component</p>
              {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
            </div>
          );
        }}
      </ReactPing>
    );
    expect(wrapper.find('p').length).toBe(1);
    expect(wrapper.find('#isPolling').length).toBe(1);
  });
  describe('initial tests for checking initial variables before we start polling', () => {
    let wrapper, mockedComponentDidMount;
    beforeEach(() => {
      mockedComponentDidMount = jest.spyOn(ReactPing.prototype, 'componentDidMount');
      mockedComponentDidMount.mockImplementation();
      wrapper = shallow(
        <ReactPing
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
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
      const mockedStartPolling = jest.spyOn(ReactPing.prototype, 'startPolling');
      mockedStartPolling.mockImplementation();
      shallow(
        <ReactPing
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
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
          <ReactPing
            url={null}
            onSuccess={onSuccess}
            onFailure={onFailure}
            render={({ isPolling }) => {
              return (
                <div>
                  <p>Polling Component</p>
                  {isPolling ? (
                    <div id='isPolling'> I am polling</div>
                  ) : (
                    <div id='isNotPolling'> I am not polling </div>
                  )}
                </div>
              );
            }}
          />
        );
      }).toThrowError();
    });
    test('startPolling should set isPolling state to true, _ismounted to true and call runPolling function', () => {
      const mockedRunPolling = jest.spyOn(ReactPing.prototype, 'runPolling');
      mockedRunPolling.mockImplementation();
      const wrapper = shallow(
        <ReactPing
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
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
    });
    test('stopPolling should set isPolling to false, _ismounted to false and poll to null', () => {
      const wrapper = shallow(
        <ReactPing
          url={url}
          onSuccess={onSuccess}
          onFailure={onFailure}
          render={({ isPolling }) => {
            return (
              <div>
                <p>Polling Component</p>
                {isPolling ? <div id='isPolling'> I am polling</div> : <div id='isNotPolling'> I am not polling </div>}
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
});
