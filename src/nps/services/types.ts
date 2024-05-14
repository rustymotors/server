export interface Part {
  PartID: number;
  ParentPartID: number;
  BrandedPartID: number;
  RepairPrice: number;
  JunkPrice: number;
  Wear: number;
  AttachmentPoint: number;
  Damage: number;
}

export interface Vehicle {
  VehicleID: number;
  SkinID: number;
  Flags: number;
  Delta: number;
  Damage: number;
}
