import { expect } from "chai";
import { EncryptionManager } from "../src/encryption-mgr.js";

describe("Excryption Manager in login", () => {
    it("should return an instance of itself when called", () => {
        // arrange
        const expectedClass = EncryptionManager;

        // act
        const manager = new EncryptionManager()

        // assert
        expect(manager).instanceOf(expectedClass)
    })

    describe("setEncryptionKey", () => {
        it("should set the key on the object and return a pair of encryptors", ()=> {
            // arrange
            const sessionkey = Buffer.from("ABABABAB")            
            const manager = new EncryptionManager()
            
            //act
            manager.setEncryptionKey(sessionkey)

            // assert
            expect(manager.getId()).to.be.not.equal("")
            expect(manager._getSessionKey()).to.be.equal(sessionkey.toString("hex"))
        })        
    })

    describe("decrypt() / encrypt() pair", () => {
        it("should be able to write and read encryptedText", () => {
            // arrange
            const plainText = Buffer.from("I am a test of the encryption pair")
            const manager1 = new EncryptionManager()
            manager1.setEncryptionKey(Buffer.from('decrypt test'))
            const manager2 = new EncryptionManager()
            manager2.setEncryptionKey(Buffer.from('decrypt test'))
            const ciphertext = manager1.encrypt(plainText)

            // act
            const result = manager2.decrypt(ciphertext)

            // assert
            expect(result).deep.equal(plainText)

        })
    })

    describe("decrypt()", () => {
        it("should throw when called with session key unset", () => {
            // arrange
            const encryptedText = Buffer.from("I am a test of the decrypt() throw")
            const manager = new EncryptionManager()

            // assert
            expect(() => manager.decrypt(encryptedText)).to.throw("No decryption manager found!")
        })
    })

    describe("encrypt()", () => {
        it("should throw when called with session key unset", () => {
            // arrange
            const plainText = Buffer.from("I am a test of the encrypt() throw")
            const manager = new EncryptionManager()

            // assert
            expect(() => manager.encrypt(plainText)).to.throw("No encryption manager found!")
        })
    })
})
