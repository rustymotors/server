import { Socket as SocketTCP } from 'node:net';
import { Socket as SocketUDP } from 'node:dgram';

export function createMockTcpSocket(options: { remoteAddress?: string; localPort?: number } = {}): SocketTCP {
    const socket = new SocketTCP();
    Object.defineProperty(socket, 'remoteAddress', { value: options.remoteAddress || '127.0.0.1' });
    Object.defineProperty(socket, 'localPort', { value: options.localPort || 12345 });
    return socket;
}

export function createMockUdpSocket(options: { address?: string; port?: number; family?: string } = {}): SocketUDP {
    // We can't easily instantiate SocketUDP directly without createSocket, 
    // but for testing we often just need an object that looks like it or a real one with mocked methods.
    // Since we are using real sockets in the tests but mocking properties, let's stick to that pattern 
    // but wrap it in a factory.
    // However, creating a real UDP socket requires 'node:dgram'. 
    // Let's return a partial mock or a real socket if possible. 
    // Given the previous test used createSocket('udp4'), we should probably do the same if we want it to be an instance of SocketUDP.
    
    // Ideally we inject the dependency, but here we are just creating a helper.
    // Let's assume the caller might want a real socket but configured.
    // Actually, to avoid side effects of real sockets (binding ports etc), 
    // we might want to return a pure mock if the code under test allows it.
    // The code checks `instanceof SocketUDP`. So we must return a real instance or a class that extends it.
    
    const dgram = require('node:dgram');
    const socket = dgram.createSocket('udp4');
    
    socket.address = () => ({
        address: options.address || '127.0.0.1',
        port: options.port || 12345,
        family: options.family || 'IPv4'
    });
    
    return socket;
}
