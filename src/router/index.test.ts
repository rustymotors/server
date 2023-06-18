import { Router } from './index.js';
import { describe } from 'mocha';
import { expect } from 'chai';
import { TServerConfiguration, TServerConfigurationFactory, TServerLogger, TServerLoggerFactory } from 'mcos/shared';

const fakeConfig = TServerConfigurationFactory();
const fakeLog = TServerLoggerFactory();


describe('Router', () => {

    beforeEach(() => {
        Router.instance = undefined;
    })
            

    describe('createPortRouter', () => {

        it('should return an object with the port and handler', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            const portRouter = router.createPortRouter(7003, async () => []);
            expect(portRouter.port).to.equal(7003);
            expect(portRouter.handler).to.be.an('object');
            expect(portRouter.handler.processData).to.be.a('function');
        })
    })

    describe('addPortRouter', () => {

        it('should add a port router', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            const portRouter = router.createPortRouter(7003, async () => []);
            const result = router.addPortRouter(portRouter);
            expect(result).to.equal(0);
        })

        it('should not add a port router if it already exists', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            const portRouter = router.createPortRouter(7003, async () => []);
            router.addPortRouter(portRouter);
            const result = router.addPortRouter(portRouter);
            expect(result).to.equal(1);
        })
    })

    describe('getPortRouter', () => {

        it('should return a port router', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            const portRouter = router.createPortRouter(7003, async () => []);
            router.addPortRouter(portRouter);
            const result = router.getPortRouter(7003);
            expect(result).to.equal(portRouter);
        })

        it('should should throw if the port router does not exist', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            expect(() => router.getPortRouter(7003)).to.throw();
        })
    })

    describe('getPortRouters', () => {

        it('should return an array of port routers', () => {
            const router = new Router({config: fakeConfig, log: fakeLog});
            const portRouter = router.createPortRouter(7003, async () => []);
            router.addPortRouter(portRouter);
            const result = router.getPortRouters();
            expect(result).to.be.an('array');
            expect(result[0]).to.equal(portRouter);
        })
    })

})
