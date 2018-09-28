# 🔔 react-ping

Easy to use polling service built with react that follows the render props pattern.

**Note: Read more about render props here  [Render Props Pattern](https://reactjs.org/docs/render-props.html)**

### 🚚 Installation

```
yarn add react-ping
```

or

```
npm i react-ping --save
```

### ⚡️ Usage

```javascript
import React from 'react';

<ReactPing 
  interval= {3000}, // in milliseconds(ms)
  retryCount={3} // this is optional
  onSuccess={() => console.log('handle success')}
  onFailure={() => console.log('handle failure')} // this is optional
  method={'GET'},
  headers={headers object} // this is optional
  body={JSON.stringify(data)} // data to send in a post call. Should be stringified always
  render={({ startPolling, stopPolling, isPolling }) => {
    if(isPolling) {
      return (
        <div> Hello I am polling</div>
      );
    } else {
      return (
        <div> Hello I stopped polling</div>
      );
    }
  }}
/>
```

## 📦 Api

### 🔔 react-ping

| Props                   | Type                   | Default   | Description                                                                                         |
|-------------------------|------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| url                     | string                 | null      | url/api to poll                                                                                     |
| interval                | number                 | 3000      | Interval of polling                                                                                 |
| retryCount              | number                 | 0         | Number of times to retry when an api polling call fails                                             |
| onSuccess               | function               | -         | Callback function on successful polling. This should return true to continue polling                |
| onFailure               | function               | () => {}  | Callback function on failed polling or api failure                                                  |
| method                  | string                 | GET       | HTTP Method of the api to call                                                                      |
| headers                 | object                 | -         | Any specific http headers that need to be sent with the request                                     |
| body                    | object                 | -         | The data that need to be sent in a post/put call                                                    |
| render                  | function               | -         | Render function to render the ui                                                                    |
| children                | function               | -         | React children function based on child props pattern                                                |

#### onSuccess (required)

This function will be called every time the polling service gets a successful response.
You should return true to continue polling and false to stop polling. It has the following signature:

```javascript
function onSuccess(response) {
  // You can do anything with this response, may be add to an array of some state of your react component
  // return true to continue polling
  // return false to stop polling
}
```

#### onFailure (not compulsory field)

This function will be called every time the polling service gets a failure response from the api, it can be 401 or 500 or any failure status code.
You can do some cleaning up of your variables or reseting the state here.

```javascript
function onFailure(error) {
  // You can log this error to some logging service
  // clean up some state and variables.
}
```

## 👍 Contribute

Show your ❤️ and support by giving a ⭐. Any suggestions and pull request are welcome !

### 📝 License

MIT © [viveknayyar](https://github.com/vivek12345)

## 👷 TODO

- [x] Complete README
- [ ] Add Examples and Demo
- [ ] Test Suite
