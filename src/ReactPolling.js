import React from 'react';
import PropTypes from 'prop-types';

/**
<ReactPolling 
  url={'url to poll'}
  interval= {3000} // in milliseconds(ms)
  retryCount={3} // this is optional
  onSuccess={() => console.log('handle success')}
  onFailure={() => console.log('handle failure')} // this is optional
  method={'GET'}
  headers={headers object} // this is optional
  body={JSON.stringify(data)} // data to send in a post call. Should be stringified always
  render={({ startPolling, stopPolling, isPolling }) => {
    if(isPolling) {
      return (
        <div>
          <p>Hello I am polling<p>
        </div>
      );
    } else {
      return (
        <div>Hello I stopped polling</div>
      );
    }
  }}
/>
*/

export class ReactPolling extends React.Component {
  /**
   * Initial config for setting up the polling service
   * @param {Object} options
   * For example:-
   * options = {
   *  url: 'api that we need to poll',
   *  interval: interval for polling
   *  retryCount: the no of times to retry when the api call fails
   *  -----------------------------------------
   *  onSuccess: what should happen on a successful response. This should either return a true to continue polling
   *  or false to stop polling
   *  -----------------------------------------
   *  onFailure: what should happen on a failure response, we can either garbage collect some variables. This is optional
   *  -----------------------------------------
   *  method: 'GET',
   *  headers: {
   *    Content-Type: 'application/json'
   *  },
   *  body: JSON.stringify(data) // in case of a post call
   * }
   */
  constructor(props) {
    super(props);
    this.state = {
      isPolling: false
    };
    this.initConfig(props);
  }
  /**
   * Function to setup the config object with default config or the config provided by the user
   * @param {Object} options
   */
  initConfig(options) {
    let { url, interval, retryCount, onSuccess, onFailure, promise, ...api } = options;
    interval = Number(interval);
    retryCount = Number(retryCount);
    this.config = {
      url,
      interval,
      shouldRetry: retryCount ? true : false,
      retryCount: retryCount,
      onSuccess,
      onFailure,
      promise,
      api
    };
  }
  /**
   * To be called by the user of this service or when the poll api fails.
   * It will set the isPolling to false and stop the timer
   */
  stopPolling() {
    if (this._ismounted) {
      const isPolling = false;
      if (this.poll) {
        clearTimeout(this.poll);
        this.poll = null;
      }
      this.setState({
        isPolling
      });
    }
  }
  /**
   * To be called manually by the user of this service.
   * This will call runPolling and start polling our api
   */
  startPolling() {
    // if no url specified, throw an error
    if (!this.config.url) {
      throw new Error('No url provided to poll. Please provide a config object with the url param set');
    }
    // set isPolling to true
    this.setState({
      isPolling: true
    });
    // call runPolling, which will start timer and call our api
    this.runPolling();
  }
  /**
   * start a timer with the interval specified by the user || default interval
   * we are using setTimeout and not setinterval because a slow back end server might take more time than our interval time and that would lead to
   * a queue of ajax requests with no response at all.
   * -----------------------------------------
   * This function would call the api first time and only on the success response of the api we would poll again after the interval
   */
  runPolling() {
    const { url, interval, onSuccess, onFailure, promise, api } = this.config;

    const pollingPromise = (promise && promise(url)) || fetch(url, api);

    const _this = this;
    this.poll = setTimeout(() => {
      /* onSuccess would be handled by the user of service which would either return true or false
       * true - This means we need to continue polling
       * false - This means we need to stop polling
       */
      pollingPromise
        .then(resp => {
          if (resp && resp.json) {
            return resp
              .json()
              .then(data => {
                if (resp.ok) {
                  return data;
                } else {
                  return Promise.reject({ status: resp.status, data });
                }
              })
              .catch(data => {
                if (resp.ok) {
                  return data;
                } else {
                  return Promise.reject({ status: resp.status, data });
                }
              });
          }
          return resp;
        })
        .then(onSuccess)
        .then(continuePolling => {
          _this.state.isPolling && continuePolling ? _this.runPolling() : _this.stopPolling();
        })
        .catch(error => {
          if (_this.config.shouldRetry && _this.config.retryCount > 0) {
            onFailure && onFailure(error);
            _this.config.retryCount--;
            _this.runPolling();
          } else {
            onFailure && onFailure(error);
            _this.stopPolling();
          }
        });
    }, interval);
  }
  componentDidMount() {
    // set _isMounted to true to check if our component is still mounted or the user re-directed to some other page
    this._ismounted = true;
    this.startPolling();
  }
  render() {
    if (this.props.render) {
      return this.props.render({
        startPolling: this.startPolling.bind(this),
        stopPolling: this.stopPolling.bind(this),
        isPolling: this.state.isPolling
      });
    }
    return this.props.children({
      startPolling: this.startPolling.bind(this),
      stopPolling: this.stopPolling.bind(this),
      isPolling: this.state.isPolling
    });
  }
  componentWillUnmount() {
    this.stopPolling();
    // set _isMounted to false so that we do no call setState on an unmouted component
    this._ismounted = false;
  }
}

// prop types check for dev environment
ReactPolling.propTypes = {
  url: PropTypes.string,
  interval: PropTypes.number,
  retryCount: PropTypes.number,
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func,
  headers: PropTypes.object,
  method: PropTypes.string,
  body: PropTypes.object,
  render: PropTypes.func,
  promise: PropTypes.func,
  children: PropTypes.func
};

// default props
ReactPolling.defaultProps = {
  interval: 3000,
  retryCount: 0,
  onFailure: () => {},
  method: 'GET'
};

export default ReactPolling;
