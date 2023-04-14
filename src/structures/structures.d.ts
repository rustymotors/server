/**
 * @module Structure
 * @exports TBaseStructure
 */

/**
 * @typedef 
 */
declare module "mcos/structures" {
    export type TBaseStructure = {
        deserialize: (inputBuffer: Buffer) => void,
        serialize: <T extends TBaseStructure>() => T
    }
}
