# react-ping

Easy to use polling service with this react component that follows the render props pattern

**Note: Read more about render props here  [Render Props Pattern](https://reactjs.org/docs/render-props.html)**

### Install

```
yarn add react-ping
```

or

```
npm i react-ping --save
```

### Usage

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
`;
```

## Api

### react-ping

| Props                   | Type                   | Default   | Description                                                                                         |
|-------------------------|------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| url                     | string                 | null      | url/api to poll                                                                                     |
| interval                | number                 | 3000      | Interval of polling                                                                                 |
| retryCount              | number                 | 0         | Number of times to retry when an api polling call fails                                             |
| onSuccess               | function               | -         | Callback function on successful polling. This should true to continue polling                       |
| onFailure               | function               | () => {}  | Callback function on failed polling or api failure                                                  |
| method                  | string                 | get       | HTTP Method of the api to call                                                                      |
| headers                 | object                 | -         | Any specific http headers that need to be sent with the request                                     |
| body                    | object                 | -         | The data that need to be sent in a post/put call                                                    |
| render                  | function               | -         | function to render jsx                                                                              |
| children                | function               | -         | React children function based on chil props pattern                                                 |
## Contribute

Show your ❤️ and support by giving a ⭐. Any suggestions and pull request are welcome !

#### license

MIT © [viveknayyar](https://github.com/vivek12345)

## TODO

- [ ] Complete README
- [ ] Test Suite