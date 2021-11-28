export class MCOS {
  public static isMCOT(inputBuffer: Buffer) {
    return inputBuffer.toString("utf8", 2, 6) === "TOMC";
  }
}
