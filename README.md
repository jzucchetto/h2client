# h2client
## A lightweight node js http2 (h2) client with automatic reconnection.

## Installation
`npm install h2client`

## Usage

```ts
import { connect } from 'h2client';

const client = connect('http://localhost:10000', { reconnect: true });
client.on('connect', () => console.log('[HTTP2]', 'connected'));
client.on('disconnect', () => console.log('[HTTP2]', 'disconnected'));
client.on('reconnect', () => console.log('[HTTP2]', 'reconnecting...'));
```

## Demo
![demo](https://github.com/jzucchetto/h2client/raw/main/img/demo.gif)

