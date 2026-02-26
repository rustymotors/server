import { expect, suite, test } from "vitest";
import {
    detectPacketLength,
    detectPacketStartIndex,
    ensureEnoughRemainingBytes,
    extractPacketBuffer,
    popPacketFromBuffer,
} from "../../src/network/packetDetectionHelpers.js";

suite("Packet Detection", () => {
    const testBuffer1 = Buffer.from(
        "110103f466f58437e18d203c45c8bda2917bbe3f8bf178a2ea603667d8582ace7b2423ab7a3ec5c1af41dca55d9d6c8617b386f6799340e29037280f73aaeacd07fdd50515a19e7a8eb6b9dfded26ab22aedc1c337c8d47bedd06b433ea9e04d35ef9d160dddb30a0926a7184001f6eab028260d76155ebabe90cee1d1bd9cbc0fd675e7f406a760283034a85c5ee1ddc032e8234c228a2a2fc2cd4cf214bfe14759099f04672a8daec4aca1f45b5858e8075fe71562c795d7b1da419d466681beb2155c19577db9efde8f04333624193434efdb553361b8b652a2596b7fdecea9f5e627e87a1696c8d8a72e1b5bdb719b6c13ad3c1e2de4fea9525c081c701ce531958a65d04722e6bc00654f3e95931ddde4323c3b7149ce4a23936312caf8a1e704d3745e48049aaeadae05918307873a30b28d0dae3015647e3f61a64cf99fba8eb199c7ae4579f3d95e48a4d780767b0af764afc517c1ce1003aac237ea65104def6058bd02661f87944fbd7788f3947c1e8efba313f4b7f519d7fe1585fc3acfcd91864be1fe25c6ec232cf3e096d8b9117a28c1803f409fba938bf01e4ebb09d6e5f30640e3c5fd2d97998689580f0b18dac34ec3e2ab0a4e2569b3a5caf0474b88bdd7d4999ce8552e44a1b7ba8f127c878d02af7ff34903e94f7ceb2182b538e445b0f90fd5254aedce7d892718552926f6c96501bb004016da1f4c9b23392b30ae67cdac396d2d0a243ffca96f7a9f6591d8fd3a063b2924af3810a0950989ecbd02ec4aa11e2b5797385960d660c7463be290137ba4ac2727d730959b9c351c473cc69b9f0ce993a319678b3625d8edd4f66f1668213d62b432e3a4076d880e9a3e784688fff5497b5549bdab9f5802756a056ad0b1a99fc6f9d4db177cdb50237c48bec6320e5fa73b82091aff801e4ffffac1c1516b649ba6d8bae9142f2fd37842a04139c324985ac3d42cd2e155781d72ab57d52e42834c10beb3975b72e0cbecfc1ea35ec043ccb58892f3ce0d0ecb8e5939863cdfbbc77f7142b0ab876456b5464b7ee08de78670e634099db18c6d8ceb8e389d80647ea56de6b2b307b6d58634fd03dbfc9394174108bc6736acb6cb154ae20306f3be8ccb052cf17a52b8f39f3db31331fb2d99e6438c9d26b9585292510fd771347dbd2e7a3bfa6b5e40b2c0dd01f23eca83ed59124003f3f4515a57fe145aacdd9080e03d34588d274d7dc02a12eb53b6b477f86a51845bf47fba59e73530066cc5338a43f88430991646e470973f7cd524baeaf1bf7a836dca08d5f95d2a9ec12183c89363e02a7d28b1fbef962827157d39f14600fbab34c38fbc226e532c4a240dbb608e47208f61d77624d5bcf0c453084fd60a9ad253413b2723cea82485730baffc9099962d59a91c28802e1509057185c7adbd",
        "hex",
    );
    const testBuffer2 = Buffer.from(
        "1101005cb423958bdf4bfc123b16447df35279c4b681efae35ff3a698b707f3414a9bd513f7cd21dd1a2a36d511fd11014d35db1a72b8fdcb00de7b6cd91e529d7c33e7bdaf6eece010554f4eaa6e1d563ae1ed98d5aaee9a5216532110101548a96f8b2e9e68b3fb91da30cb314d4320c9dd41e2279e128f8078d6b32548ac7f885fada5259e2f98995963542a6f4836ebb0dced7601234541e289b54a17ac14045d32ab34b9810e1094379bc42948824a8dff62eb67e4e43524f428096a982d62cb618d36dc9097c9f5b757101ccd133b993aeac3a3feaf7ca57c4fa0592ca10f9c99ec175c8a364af497ce3f90b7d7f99cde0204708947ee24801eaa89510648985f5d04b5cb57a56659b78c375e2b9b54e89d68643ac96b3c83eb0b3ff57edd067dc672ffdd01adfa43b2574510143f9237ba242cd0c4ae47a774c7b27c657c72b4938f69245dc09e566143a0363778f3c6b0a3dd16eeb2f57416d606f5f78f3f765b3f64ad0b381b64cd918711b152a3b068f81ba1a4a4e0fd64cfde0cc1e17dddcb9e90489fc6a687fd81e4444a4b40aef32f846f801d853dec4e5cfd55acf503dcb1c9eaea45c10ff14f9d0a7",
        "hex",
    );

    test("should correctly identify packet start", () => {
        const packetStartIndex = detectPacketStartIndex(testBuffer1, "1101");

        expect(packetStartIndex).toBe(0);
    });

    test("can detect packet length", () => {
        const packetLength = detectPacketLength(testBuffer1.subarray(0));

        expect(packetLength).toBe(1012);
    });

    test("that buffer has enough data for a full packet", () => {
        const packetLength = detectPacketLength(testBuffer1);

        expect(ensureEnoughRemainingBytes(testBuffer1, packetLength)).toBe(
            true,
        );
    });

    test("can cut buffer to packet length", () => {
        const packetBuffer = extractPacketBuffer(testBuffer1);

        expect(packetBuffer.length).toBe(1012);
    });

    test("that we can pop a packet off a buffer", () => {
        const { packet, remainingBuffer } =
            popPacketFromBuffer(testBuffer2);

        expect(packet.length).toBe(92);
    });
});

