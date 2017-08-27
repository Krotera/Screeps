const roleCtor = require("Roles.ctor"); // Called to use the module's exported getMatSource() function
"use strict";
const roleEngineer = {
    /** @param {Creep} creep */
    run: function(creep) {
        /* STATE MODULATION **************************************************/
        if (creep.memory.repairing === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.repairing = true;
            getMostDecayedStructure(creep);
        }
        else if (creep.memory.repairing === undefined || (creep.memory.repairing === true && creep.carry.energy === 0)) {
            creep.memory.repairing = false;
            roleCtor.getMatSource(creep);
        }
        /* STATE EXECUTION ***************************************************/
        if (creep.memory.repairing === true) {
            if (creep.memory.maintId === null) {
                getMostDecayedStructure(creep);
            }
            if (creep.memory.maintId !== null) {
                if (creep.repair(Game.getObjectById(creep.memory.maintId)) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.maintId), {visualizePathStyle: {stroke: "#ffdd00"}});
                }
                else if (Game.getObjectById(creep.memory.maintId) === null) {
                    getMostDecayedStructure(creep);
                }
                else {
                    creep.say("\u{1F527}", true);
                    // If the present maintenance target is repaired,
                    if (Game.getObjectById(creep.memory.maintId).hits === Game.getObjectById(creep.memory.maintId).hitsMax) {
                        // and if this creep still has spare energy,
                        if (creep.carry.energy > 0) {
                            // find a new maintenance target.
                            getMostDecayedStructure(creep);
                        }
                    }
                }
            }
            else {
                creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
            }
        }
        else {
            if (creep.memory.matSourceId === null) {
                roleCtor.getMatSource(creep);
            }
            if (creep.memory.matSourceId !== null && creep.room.energyAvailable >= (creep.room.energyCapacityAvailable / 2)) {
                if (creep.withdraw(Game.getObjectById(creep.memory.matSourceId), RESOURCE_ENERGY, creep.carryCapacity) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.matSourceId));
                }
                if (creep.carry.energy < creep.carryCapacity) {
                    roleCtor.getMatSource(creep);
                }
            }
            else {
                creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
            }
        }
    }
};

/**
 * Assigns the ID of the most decayed (damaged) structure in the room to the creep's memory.maintId field
 * @param creep
 */
function getMostDecayedStructure(creep) {
    let structs = creep.room.find(FIND_STRUCTURES);

    if (structs !== null && structs.length > 0) {
        // Assign the structure with the lowest hitpoints in the room to maintId.
        creep.memory.maintId = _.min(structs, function(struct) {
            return (struct.hits / struct.hitsMax);
        });
    }
    if (creep.memory.maintId !== null && creep.memory.maintId.hits < creep.memory.maintId.hitsMax) {
        creep.memory.maintId = creep.memory.maintId.id;
    }
    else {
        creep.memory.maintId = null;
    }
}

module.exports = roleEngineer;