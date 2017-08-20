"use strict";
require("Helper Functions.placeTavern");
const roomHomeostasis = {
    /**
     * Room code maintaining a regular base
     * @param {Room} room - A room whose controller is owned by the player and that has at least one
     *                      of the player's spawns
     * @param {array} spawns - The player's spawns in the room
     **/
    run: function(room, spawns) {
        let flagName = room.name + " Tavern";

        /*************************************************************************/
        /* List object of the room's source IDs and their assigned miner's ID    */
        /*************************************************************************/
        if (Memory.sourceIDs && !Memory.sourceIDs[room.name]) {
            // Make new source ID list for this room
            Memory.sourceIDs[room.name] = {};
            let roomSources = room.find(FIND_SOURCES);

            // Populate list
            for (let i = 0; i < roomSources.length; i++) {
                let source = roomSources[i];

                if (Memory.sourceIDs[room.name][source.id] === undefined) {
                    // Check this source for a keeper lair within 5 tiles (NOTE: this is only useful in sim)
                    let sourceArea = source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5);

                    // If there are hostile structures,
                    if (sourceArea.length > 0) {
                        for (let j = 0; j < sourceArea.length; j++) {
                            // and if none of those are a keeper lair,
                            if (!(sourceArea[j].structureType === "keeperLair")) {
                                // include it in the list of mineable sources.
                                Memory.sourceIDs[room.name][source.id] = 0;
                            }
                            // If there is a keeper lair,
                            else {
                                // exclude this source.
                                console.log("Keeper lair detected near source " + source.id + "! Excluding it from mining list.");
                            }
                        }
                    }
                    // If there are no hostile structures,
                    else {
                        // register this source as mineable.
                        Memory.sourceIDs[room.name][source.id] = 0;
                    }
                }
            }
        }

        /*************************************************************************/
        /* Maintain population                                                   */
        /*************************************************************************/
        for (let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];

            if (!spawn.spawning && Memory.roles && Memory.roleCosts) {
                // Early pioneers: spawn two foragers if < 2 active creeps
                if (Object.keys(Game.creeps).length < 2) {
                    if (room.energyAvailable >= Memory.roleCosts["forager"]) {
                        spawn.createCreep(Memory.roles["forager"], null, {role: "forager"});
                    }
                }
                // First miner
                else if (Memory.roster[room.name + "_miner"] === undefined) {
                    if (room.energyAvailable >= Memory.roleCosts["miner"]) {
                        spawn.createCreep(Memory.roles["miner"], null, {role: "miner"});
                    }
                }
                // First hauler
                else if (Memory.roster[room.name + "_hauler"] === undefined) {
                    if (room.energyAvailable >= Memory.roleCosts["hauler"]) {
                        spawn.createCreep(Memory.roles["hauler"], null, {role: "hauler"});
                    }
                }
                else {
                    // Miners (1 per source in room)
                    if (Memory.roster[room.name + "_miner"].length < Object.keys(Memory.sourceIDs[room.name]).length
                        && room.energyAvailable >= Memory.roleCosts["miner"]) {
                        spawn.createCreep(Memory.roles["miner"], null, {role: "miner"});
                    }
                    // Haulers (2 per miner in room)
                    else if (Memory.roster[room.name + "_hauler"].length < (2 * Memory.roster[room.name + "_miner"].length)
                        && room.energyAvailable >= Memory.roleCosts["hauler"]) {
                        spawn.createCreep(Memory.roles["hauler"], null, {role: "hauler"});
                    }
                    // Ctors
                    else if ((Memory.roster[room.name + "_ctor"] === undefined || Memory.roster[room.name + "_ctor"].length < 2)
                        && room.energyAvailable >= Memory.roleCosts["ctor"]) {
                        spawn.createCreep(Memory.roles["ctor"], null, {role: "ctor"});
                    }
                    // Upgrader
                    else if ((Memory.roster[room.name + "_upgrader"] === undefined || Memory.roster[room.name + "_upgrader"].length === 0)
                        && room.energyAvailable >= Memory.roleCosts["upgrader"]) {
                        spawn.createCreep(Memory.roles["upgrader"], null, {role: "upgrader"});
                    }
                }
            }
        }

        /* Debug printout per tick of the room's creep roster
        if (Memory.roster) {
            console.log("Roster:\n");
            if (Memory.roster[room.name + "_forager"] !== undefined) {
                console.log(room.name + "_forager: " + Memory.roster[room.name + "_forager"].length);
            }
            if (Memory.roster[room.name + "_hauler"] !== undefined) {
                console.log(room.name + "_hauler: " + Memory.roster[room.name + "_hauler"].length);
            }
            if (Memory.roster[room.name + "_upgrader"] !== undefined) {
                console.log(room.name + "_upgrader: " + Memory.roster[room.name + "_upgrader"].length);
            }
            if (Memory.roster[room.name + "_ctor"] !== undefined) {
                console.log(room.name + "_ctor: " + Memory.roster[room.name + "_ctor"].length);
            }
            if (Memory.roster[room.name + "_miner"] !== undefined) {
                console.log(room.name + "_miner: " + Memory.roster[room.name + "_miner"].length);
            }
        }
        */

        /*************************************************************************/
        /* Auto-place Tavern flag                                                */
        /*************************************************************************/
        if (!Game.flags[flagName]) {
            placeTavern(spawns[0], flagName);
        }

        // TODO: Set up RCL progression in here with switch, using the building caps constant and Room.createConstructionSite()

        /*
        Capacity for various structures at various RCLs (this is an API constant only here for reference)
        CONTROLLER_STRUCTURES: {
                "spawn": {0: 0, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 2, 8: 3},
                "extension": {0: 0, 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60},
                "link": {1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 3, 7: 4, 8: 6},
                "road": {0: 2500, 1: 2500, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
                "constructedWall": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
                "rampart": {1: 0, 2: 2500, 3: 2500, 4: 2500, 5: 2500, 6: 2500, 7: 2500, 8: 2500},
                "storage": {1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1},
                "tower": {1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6},
                "observer": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
                "powerSpawn": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1},
                "extractor": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
                "terminal": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 1, 7: 1, 8: 1},
                "lab": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 3, 7: 6, 8: 10},
                "container": {0: 5, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5},
                "nuker": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 1}
            }
        }
        */
    }
};

module.exports = roomHomeostasis;