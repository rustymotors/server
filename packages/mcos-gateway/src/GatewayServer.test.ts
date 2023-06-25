import { expect } from "chai";
import { GatewayServer } from "./GatewayServer.js";

describe("GatewayServer", () => {
    it("should throw an error if no config is provided", () => {
        expect(() => new GatewayServer({})).to.throw();
    });

    it("should throw an error if no log is provided", () => {
        expect(() => new GatewayServer({})).to.throw();
    });

    it("should throw an error if no listeningPortList is provided", () => {
        expect(() => new GatewayServer({})).to.throw();
    });
});
