/// <reference types="node" />
export default class MsgHead {
    length: number;
    mcosig: string;
    constructor(header: Buffer);
}
