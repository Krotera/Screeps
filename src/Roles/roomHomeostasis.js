"use strict";
require("Helper Functions.placeTavern");
const roomHomeostasis = {
    /**
     * Room code maintaining a regular base
     * @param {Room} room - A room whose controller is owned by the player and that has at least one
     *                      of the player's spawns
     * @param {array} spawns - The player's spawns in the room
     */
    run: function(room, spawns) {
        let flagName = room.name + " Tavern";
        let popTarg;
        // Choose population target based on RCL
        switch (room.controller.level) {
            case 1:
            case 2:
            case 3:
                popTarg = Memory.RCLPopTargs["one_to_three"];
                break;
            case 4:
                popTarg = Memory.RCLPopTargs["four_to_eight"];
                break;
            default:
                popTarg = Memory.RCLPopTargs["one_to_three"];
        }

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
        /* Maintain population with all spawns in room                           */
        /*************************************************************************/
        for (let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];

            if (!spawn.spawning && Memory.roles && Memory.roleCosts && Memory.RCLPopTargs) {
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
                    if (Memory.roster[room.name + "_miner"].length < (popTarg["miner"] * Object.keys(Memory.sourceIDs[room.name]).length)
                        && room.energyAvailable >= Memory.roleCosts["miner"]) {
                        spawn.createCreep(Memory.roles["miner"], null, {role: "miner"});
                    }
                    // Haulers (2 per miner in room)
                    else if (Memory.roster[room.name + "_hauler"].length < (popTarg["hauler"] * Memory.roster[room.name + "_miner"].length)
                        && room.energyAvailable >= Memory.roleCosts["hauler"]) {
                        spawn.createCreep(Memory.roles["hauler"], null, {role: "hauler"});
                    }
                    // Ctors (2 per room)
                    else if ((Memory.roster[room.name + "_ctor"] === undefined || Memory.roster[room.name + "_ctor"].length < popTarg["ctor"])
                        && room.energyAvailable >= Memory.roleCosts["ctor"]) {
                        spawn.createCreep(Memory.roles["ctor"], null, {role: "ctor"});
                    }
                    // Upgrader (1 per room)
                    else if ((Memory.roster[room.name + "_upgrader"] === undefined
                            || Memory.roster[room.name + "_upgrader"].length < popTarg["upgrader"])
                        && room.energyAvailable >= Memory.roleCosts["upgrader"]) {
                        spawn.createCreep(Memory.roles["upgrader"], null, {role: "upgrader"});
                    }
                    // Engineers (2 per room)
                    else if ((Memory.roster[room.name + "_engineer"] === undefined
                            || Memory.roster[room.name + "_engineer"].length < popTarg["engineer"])
                        && room.energyAvailable >= Memory.roleCosts["engineer"]) {
                        spawn.createCreep(Memory.roles["engineer"], null, {role: "engineer"});
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
            if (Memory.roster[room.name + "_engineer"] !== undefined) {
                console.log(room.name + "_engineer: " + Memory.roster[room.name + "_engineer"].length);
            }
        }
        */

        /*************************************************************************/
        /* Auto-place Tavern flag                                                */
        /*************************************************************************/
        if (!Game.flags[flagName]) {
            placeTavern(spawns[0], flagName);
        }

        /*************************************************************************/
        /* Tower defense                                                         */
        /*************************************************************************/
        towersDefendRoom(room.name);
    }
};

/**
 * Default tower defense function
 * @param roomName
 */
function towersDefendRoom(roomName) {
    var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

module.exports = roomHomeostasis;