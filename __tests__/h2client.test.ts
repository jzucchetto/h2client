import { createServer, ClientHttp2Session } from 'http2';
import h2client from '../src/h2client';

describe('h2client', () => {
    it('should connect', async () => {
        const server = createServer();
        server.listen(8005);
        const client = await h2client('http://localhost:8005', { autoReconnect: false });
        expect(client.closed).toBe(false);
        server.close();
        await client.close();
    });

    it('should reconnect', async () => {
        const server = createServer();
        return await new Promise<void>(resolve => {
            const client = h2client('http://localhost:8003', { autoReconnect: true, onReconnect: () => {
                    server.listen(8003);
                }, onConnect: () => {
                    server.close();
                    client.then(c => c.close());
                    resolve();
                }
            });
        });
    });

    it('dispatches onDisconnect', async () => {
        const fn = jest.fn();
        const server = createServer();
        server.listen(8006);
        const client = await h2client('http://localhost:8006', { autoReconnect: false, onDisconnect: fn });
        client.close();
        await new Promise(resolve => { server.close(resolve); });
        expect(fn).toHaveBeenCalled();
    });

    it('dispatches onConnect', async () => {
        const fn = jest.fn();
        const server = createServer();
        server.listen(8006);
        const client = await h2client('http://localhost:8006', { autoReconnect: false, onConnect: fn });
        client.close();
        await new Promise(resolve => { server.close(resolve); });
        expect(fn).toHaveBeenCalled();
    });
});