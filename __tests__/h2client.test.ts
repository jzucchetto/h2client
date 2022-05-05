import {describe, expect, it, jest} from '@jest/globals'
import { ClientHttp2Session, createServer, ServerHttp2Stream } from 'http2';
import { Socket } from 'net';
import { connect } from '../src/h2client';

jest.setTimeout(30000);

describe('h2Client', () => {

    it('should reconnect', async () => {
        const fn = jest.fn();
        const client = connect('http://localhost:1111', { reconnect: true });
        client.on('reconnect', fn);
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(fn).toBeCalled();
        client.destroy();
    });
    it('should not reconnect', async () => {
        const fn = jest.fn();
        const client = connect('http://localhost:1111', { reconnect: false });
        client.on('reconnect', fn);
        await new Promise(resolve => setTimeout(resolve, 1000));
        expect(fn).not.toBeCalled();
        client.destroy();
    });
    
    it('request should wait for connect', async () => {
        const server = createServer();
        var socket: Socket = null;
        server.on('connection', (_socket) => {
            socket = _socket;
        });
        const client = connect('http://localhost:1111');
        const fn = jest.fn();
        await new Promise<void>(async resolve => {
            client.request({ ':method': 'GET' }).then(() => {
                fn();
                resolve();
            });
            expect(fn).not.toBeCalled();
            server.listen(1111);
        });
        expect(fn).toBeCalled();
        client.close();
        socket.end();
        server.close();
    });

    it('should emit disconnect', async () => {
        const server = createServer();
        server.listen(1112);
        var socket: Socket = null;
        server.on('connection', (_socket) => {
            socket = _socket;
        });
        const client = await new Promise<ClientHttp2Session>(resolve => connect('http://localhost:1112', { reconnect: true }, resolve));
        const result = await new Promise<boolean>(async resolve => {
            client.on('disconnect', () => resolve(true))
            socket.end();
            server.close();
        });
        expect(result).toBe(true);
    });
});