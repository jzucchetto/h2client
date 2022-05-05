"use strict";
exports.__esModule = true;
var h2client_1 = require("../src/h2client");
var net_1 = require("net");
var _a = process.argv, _ = _a[0], __ = _a[1], mode = _a[2];
switch (mode) {
    case 'server':
        var server = (0, net_1.createServer)();
        server.listen(1111, function () {
            console.log('[HTTP2 SERVER]', 'listening on port 1111');
        });
        server.on('connection', function (socket) {
            setTimeout(function () {
                socket.end();
                console.log('[HTTP2 SERVER] connection closed');
            }, 5000);
        });
        break;
    case 'client':
        var client = (0, h2client_1.connect)('http://localhost:1111', { reconnect: true });
        client.on('connect', function () { return console.log('[HTTP2]', 'connected'); });
        client.on('disconnect', function () { return console.log('[HTTP2]', 'disconnected'); });
        client.on('reconnect', function () { return console.log('[HTTP2]', 'reconnecting...'); });
        break;
    default:
        console.log('unknown mode');
        break;
}
