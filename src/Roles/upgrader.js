"use strict";
const roleUpgrader = {
    /** @param {Creep} creep */
    run: function(creep) {
        /* STATE MODULATION **************************************************/
        if (creep.memory.upgrading === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.upgrading = true;
        }
        else if (creep.memory.upgrading === undefined || (creep.memory.upgrading === true && creep.carry.energy === 0)) {
            creep.memory.upgrading = false;
            getMatSource(creep);
        }
        /* STATE EXECUTION ***************************************************/
        // Upgrade controller
	    if (creep.memory.upgrading === true) {
	    	// TODO: Add RCL pacing in here
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: "#ff00ff"}});
            }
            else {
            	creep.say("\u{1F53A}", true);
			}
        }
        // Get energy if enough in spawns and extensions
        else if (creep.memory.matSourceId !== null && creep.room.energyAvailable >= creep.carryCapacity) {
            if (creep.withdraw(Game.getObjectById(creep.memory.matSourceId), RESOURCE_ENERGY, creep.carryCapacity) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.matSourceId));
            }
    	}
        // Otherwise,
        else {
	        // stand by.
            creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
            // and keep seeking material sources.
            getMatSource(creep);
        }
    }
};

/**
 * Sets the nearest energy bearing structure with as much or more energy than the creep can carry to
 * the creep's memory.matSourceId field, prioritizing storages and containers over extensions and spawns
 * @param {Creep} creep
 */
function getMatSource(creep) {
    // Withdraw energy from closest containers or storages.
    creep.memory.matSourceId = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: function(struct) {
            return (struct.structureType === STRUCTURE_STORAGE || struct.structureType === STRUCTURE_CONTAINER)
                && (struct.store[RESOURCE_ENERGY] >= creep.carryCapacity);
        }
    });
    if (creep.memory.matSourceId !== null) {
        creep.memory.matSourceId = creep.memory.matSourceId.id;
    }
    // If none are available, probe closest spawns and extensions.
    else {
        creep.memory.matSourceId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function(struct) {
                return (struct.structureType === STRUCTURE_EXTENSION || struct.structureType === STRUCTURE_SPAWN)
                    && (struct.energy >= creep.carryCapacity);
            }
        });
        if (creep.memory.matSourceId !== null) {
            creep.memory.matSourceId = creep.memory.matSourceId.id;
        }
    }
}

module.exports = roleUpgrader;