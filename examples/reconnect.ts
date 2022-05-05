import { connect } from '../src/h2client';
import { createServer } from 'net';

const [_, __, mode] = process.argv;

switch (mode) {
    case 'server':
        const server = createServer();
        server.listen(1111, () => {
            console.log('[HTTP2 SERVER]', 'listening on port 1111');
        });
        server.on('connection', (socket) => {
            setTimeout(() => {
                socket.end();
                console.log('[HTTP2 SERVER] connection closed');
            }, 5000);
        });
        break;
    case 'client':
        const client = connect('http://localhost:1111', { reconnect: true });
        client.on('connect', () => console.log('[HTTP2]', 'connected'));
        client.on('disconnect', () => console.log('[HTTP2]', 'disconnected'));
        client.on('reconnect', () => console.log('[HTTP2]', 'reconnecting...'));
        break;
    default:
        console.log('unknown mode');
        break;
}
