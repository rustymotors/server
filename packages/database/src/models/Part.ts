export type TPart = {
    part_id: number;
    parent_part_id: number | null;
    branded_part_id: number;
    percent_damage: number;
    item_wear: number;
    attachment_point_id: number | null;
    owner_id: number | null;
    part_name: string | null;
    repair_cost: number;
    scrap_value: number;
};