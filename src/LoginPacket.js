// struct LoginPacket
function LoginPacket(session, packet) {
    if (!(this instanceof LoginPacket)) {
        return new LoginPacket(session, packet)
    }

    this.opCode = packet.readInt16LE()

    const encryptedKeySetB64 = Buffer.from(
        packet.slice(52, -10).toString('utf8'),
        'hex'
    ).toString('base64')
    const decrypted = session.decrypt(encryptedKeySetB64, 'base64')
    this.sessionKey = Buffer.from(
        Buffer.from(decrypted, 'base64')
            .toString('hex')
            .substring(4, 68),
        'hex'
    )
}

module.exports = LoginPacket
