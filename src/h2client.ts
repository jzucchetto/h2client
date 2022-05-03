import { ClientHttp2Session, connect } from "http2";

interface H2ClientOptions {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onReconnect?: () => void;
    autoReconnect?: boolean;
}

const h2Client = async (url: string, options?: H2ClientOptions) => {
    const { onConnect, onDisconnect, onReconnect, autoReconnect = true } = options || {};
    var _client: ClientHttp2Session = null;
    var t = null;
    const client = async () => {
        if (_client) return Promise.resolve(_client);
        return _client = await new Promise<ClientHttp2Session>(resolve => {
            const reconnect = (_) => {
                if (!autoReconnect) return;
                _client = null;
                onReconnect && onReconnect();
                clearTimeout(t);
                t = setTimeout(async () => await client(), 1000);
            }
            _client = connect(url)
                .once('error', reconnect)
                .once('connect', (session) => session.once('close', reconnect).once('close', () => onDisconnect && onDisconnect()))
                .once('connect', () => { onConnect && onConnect(); resolve(_client); });
            const ogClose = _client.close.bind(_client);
            _client.close = async (cb) => {
                clearTimeout(t);
                await ogClose(cb);
            }
        });
    };
    return client();
};

export default h2Client;