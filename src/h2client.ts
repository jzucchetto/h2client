import { ClientHttp2Session, ClientSessionOptions, ClientSessionRequestOptions, connect as _connect, Http2Stream, OutgoingHttpHeaders, SecureClientSessionOptions } from "http2";
import { Socket } from "net";
import { TLSSocket } from "tls";

interface SessionOptions extends ClientSessionOptions {
    reconnect: boolean;
}
interface SecureSessionOptions extends SecureClientSessionOptions {
    reconnect: boolean;
}

interface Session extends Omit<ClientHttp2Session, 'request'> {
    request: (headers?: OutgoingHttpHeaders, options?: ClientSessionRequestOptions) => Promise<Http2Stream>;
    close: (cb?) => void;
}

const connect = (url: string, options?: SessionOptions | SecureSessionOptions, listener?: (session: ClientHttp2Session, socket: Socket | TLSSocket) => void): Session => {
    const { reconnect: _reconnect = true } = options || {};
    var ogRequest, ogclose, closed: boolean, session: Session, ready = null, t;
    var promise = new Promise<void>(resolve => { ready = resolve; });

    const getSession = () => {
        const reconnect = () => {
            if (!_reconnect) return;
            session.emit('reconnect');
            session.removeListener('connect', connectHandler);
            session.removeListener('error', reconnect);
            clearTimeout(t);
            t = setTimeout(() => getSession(), 1000);
            promise = new Promise<void>(resolve => { ready = resolve; });
        }
        const listeners = {};
        session?.eventNames().map(event => listeners[event] = session.listeners(event));
        delete listeners['newListener'];
        delete listeners['removeListener'];
        
        const connectHandler = (session) => {
            session.once('close', () => {
                session.emit('disconnect');
                reconnect()
            });
            
            ready();
        };
        session = _connect(url, options, listener)
            .once('error', reconnect)
            .once('connect', connectHandler) as unknown as Session;

        Object.keys(listeners).forEach(event => listeners[event].forEach(listener => session.on(event, listener)));
        ogRequest = session.request;
        ogclose = session.close;
        return session;
    };
    
    const request = async (headers?: OutgoingHttpHeaders, options?: ClientSessionRequestOptions) => {
        await promise; // wait for connection
        return ogRequest.bind(session)(headers, options);
    };

    const close = (cb?: () => void) => {
        closed = true;
        ogclose.bind(session)(cb);
    };


    return  Object.assign(getSession(), { request, close });
}

export { connect };