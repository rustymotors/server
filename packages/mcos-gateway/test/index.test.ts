import sinon from "sinon";
import sinonChai from "sinon-chai";
import chai, { expect } from "chai";
import { describe, it } from "mocha";
import {
    ISocket,
    ISocketTestFactory,
    TServerLogger,
} from "mcos/shared";
import { ServerError } from "../../../src/rebirth/ServerError.js";
import { onSocketError } from "../src/index.js";

chai.use(sinonChai);

describe("onSocketError", () => {

    it("should log an error", () => {
        // Arrange
        
        const log: TServerLogger = (level, msg) => {
            console.log(level, msg);
        };
        const fakeSocket: ISocket = ISocketTestFactory();
        const error = new ServerError("ECONNRESET");
        const logSpy = sinon.spy(log);

        // Act

        onSocketError(fakeSocket, error, logSpy);

        // Assert
        expect(logSpy).to.have.been.calledOnce;
        expect(logSpy).not.throw;
        expect(logSpy).to.have.been.calledWith("debug", "Connection was reset");
    });

    it("should throw an error", () => {
        // Arrange
        
        const log: TServerLogger = (level, msg) => {
            console.log(level, msg);
        };
        const fakeSocket: ISocket = ISocketTestFactory();
        const error = new ServerError("EERROR");
        const logSpy = sinon.spy(log);

        // Act

        

        // Assert
        expect(() => onSocketError(fakeSocket, error, logSpy)).to.throw(
            "EERROR"
        );
    });
});