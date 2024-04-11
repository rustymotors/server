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

export const EAttachmentPoint = {
    Default: 0,
    FrontLeft: 1,
    FrontRight: 2,
    RearLeft: 3,
    RearRight: 4,
    Left: 5,
    Right: 6,
    A: 7,
    B: 8,
    C: 9,
    Front: 10,
    Rear: 11,
};

export const attachmentPoints: TAttachmentPointRecord[] = [
    { attachmentPointId: EAttachmentPoint.Default, attachmentPoint: "Default" },
    {
        attachmentPointId: EAttachmentPoint.FrontLeft,
        attachmentPoint: "FrontLeft",
    },
    {
        attachmentPointId: EAttachmentPoint.FrontRight,
        attachmentPoint: "FrontRight",
    },
    {
        attachmentPointId: EAttachmentPoint.RearLeft,
        attachmentPoint: "RearLeft",
    },
    {
        attachmentPointId: EAttachmentPoint.RearRight,
        attachmentPoint: "RearRight",
    },
    { attachmentPointId: EAttachmentPoint.Left, attachmentPoint: "Left" },
    { attachmentPointId: EAttachmentPoint.Right, attachmentPoint: "Right" },
    { attachmentPointId: EAttachmentPoint.A, attachmentPoint: "A" },
    { attachmentPointId: EAttachmentPoint.B, attachmentPoint: "B" },
    { attachmentPointId: EAttachmentPoint.C, attachmentPoint: "C" },
    { attachmentPointId: EAttachmentPoint.Front, attachmentPoint: "Front" },
    { attachmentPointId: EAttachmentPoint.Rear, attachmentPoint: "Rear" },
];

export function isValidAttachmentPoint(attachmentPoint: string): boolean {
    return attachmentPoints.some(
        (ap) => ap.attachmentPoint === attachmentPoint,
    );
}

export function getAttachmentPoint(attachmentPoint: TAttachmentPoint): number {
    return EAttachmentPoint[attachmentPoint];
}

export function getAttachmentPointName(
    attachmentPointId: number,
): TAttachmentPoint | undefined {
    const attachmentPoint = attachmentPoints.find(
        (ap) => ap.attachmentPointId === attachmentPointId,
    );
    if (attachmentPoint) {
        return attachmentPoint.attachmentPoint as TAttachmentPoint;
    }
    return undefined;
}
