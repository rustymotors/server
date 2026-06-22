import { getServerLogger } from "rusty-motors-shared";

const DAMAGE_VERSION_DEBUG = 3;

export class DamageInfo { 
    // The MrC version number used. This is 3 in the debug version of the game.
    private _versionNumber: number = DAMAGE_VERSION_DEBUG; // 2 bytes
    private _compressed: boolean = false; // 2 bytes
    private _datasizeCompressed: number = 0; // 4 bytes
    private _datasizeUncompressed: number = 0; // 4 bytes
    private _governumber: number = 0; // 4 bytes
    private _numberVertices: number = 0; // 4 bytes
    private _decalFlags: number = 0; // 4 bytes

    private _compressedData: Buffer = Buffer.alloc(0); // buffer, max DAMAGE_INFO_SIZE

    compress() {
        this._compressed = true;
    }

    uncompress() {
        if (!this._compressed) {
            getServerLogger("transactions/CarInfoStruct").warn("DamageInfo is already uncompressed");
            return;
        }

        if (this!._versionNumber !== DAMAGE_VERSION_DEBUG) {
            getServerLogger("transactions/CarInfoStruct").warn("DamageInfo is not the debug version");
            return;
        }

        if  (this._compressedData.length !== this._datasizeCompressed) {
            getServerLogger("transactions/CarInfoStruct").warn("DamageInfo compressed data size does not match datasizeCompressed");
            return;
        }

        this._compressed = false;
    }

    serialize() {
        try {
            const buffer = Buffer.alloc(this.size());
            buffer.writeUInt16LE(this._versionNumber, 0); // offset 0
            buffer.writeInt16LE(this._compressed ? 1 : 0, 2); // offset 2
            buffer.writeInt32LE(this._datasizeCompressed, 4); // offset 4
            buffer.writeInt32LE(this._datasizeUncompressed, 8); // offset 8
            buffer.writeInt32LE(this._governumber, 12); // offset 12
            buffer.writeInt32LE(this._numberVertices, 16); // offset 16
            buffer.writeInt32LE(this._decalFlags, 20); // offset 20
            if (this._compressedData.length > 0) {
                this._compressedData.copy(buffer, 24); // offset 24
            }
            return buffer;
        } catch (error) {
            getServerLogger("transactions/CarInfoStruct").error(
                `Error in DamageInfo.serialize: ${error}`,
            );
            throw error;
        }
    }

    size() {
        return 24 + this._compressedData.length;
    }
 }