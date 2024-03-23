import { ShardEntry } from "./shard-entry.js";

/**
 * Generate a shard list web document
 *
 * @param {string} shardHost
 */
export function generateShardList(shardHost: string) {
    const shardClockTower = new ShardEntry(
        "The Clocktower",
        "The Clocktower",
        44,
        shardHost,
        8226,
        shardHost,
        7003,
        shardHost,
        0,
        "",
        "Group-1",
        88,
        2,
        shardHost,
        80,
    );

    let _possibleShards = [];
    _possibleShards.push(shardClockTower.formatForShardList());

    const shardTwinPinesMall = new ShardEntry(
        "Twin Pines Mall",
        "Twin Pines Mall",
        88,
        shardHost,
        8226,
        shardHost,
        7003,
        shardHost,
        0,
        "",
        "Group-1",
        88,
        2,
        shardHost,
        80,
    );

    _possibleShards.push(shardTwinPinesMall.formatForShardList());

    /** @type {string[]} */
    const activeShardList: string[] = [];
    if (typeof _possibleShards[0] !== "undefined") {
        activeShardList.push(_possibleShards[0]);
    }

    return activeShardList.join("\n");
}
