export type TAttachmentPointRecord = {
    attachmentPointId: number;
    attachmentPoint: string;
};
export type TAttachmentPoint =
    | "Default"
    | "FrontLeft"
    | "FrontRight"
    | "RearLeft"
    | "RearRight"
    | "Left"
    | "Right"
    | "A"
    | "B"
    | "C"
    | "Front"
    | "Rear";
export declare const EAttachmentPoint: {
    Default: number;
    FrontLeft: number;
    FrontRight: number;
    RearLeft: number;
    RearRight: number;
    Left: number;
    Right: number;
    A: number;
    B: number;
    C: number;
    Front: number;
    Rear: number;
};
export declare const attachmentPoints: TAttachmentPointRecord[];
export declare function isValidAttachmentPoint(
    attachmentPoint: string,
): boolean;
export declare function getAttachmentPoint(
    attachmentPoint: TAttachmentPoint,
): number;
export declare function getAttachmentPointName(
    attachmentPointId: number,
): TAttachmentPoint | undefined;
