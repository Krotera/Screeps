"use strict";
const roleHauler = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /* STATE MODULATION **************************************************/
        if (creep.memory.pickingUp === undefined || (creep.memory.pickingUp === false && creep.carry.energy === 0)) {
        	creep.memory.pickingUp = true;
        	getRandomDroppedEnergy(creep);
		}
		else if (creep.memory.pickingUp === true && creep.carry.energy === creep.carryCapacity) {
        	creep.memory.pickingUp = false;
            creep.say("\u{1F69B}", true);
            getUncappedStruct(creep);
		}
        /* STATE EXECUTION ***************************************************/
        if (creep.memory.pickingUp === true) {
        	// If there's dropped energy in the room, pick it up,
        	if (creep.memory.pickupId !== null && creep.pickup(Game.getObjectById(creep.memory.pickupId)) === ERR_NOT_IN_RANGE) {
        		creep.moveTo(Game.getObjectById(creep.memory.pickupId), {visualizePathStyle: {stroke: "#ff0000"}});
			}
            // and, if still not at max carry capacity,
			else if (creep.carry.energy < creep.carryCapacity) {
                // get the nearest dropped energy.
                getNearestDroppedEnergy(creep);
            }
		}
        // If there are available dump sites, dump energy.
		else if (creep.memory.dropoffId !== null && creep.transfer(Game.getObjectById(creep.memory.dropoffId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(creep.memory.dropoffId), {visualizePathStyle: {stroke: "#0000ff"}});
        }
        // Otherwise,
		else {
            // stand by
        	creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
        	// and keep seeking dump sites.
            getUncappedStruct(creep);
		}
	}
};

/**
 * Assigns the ID of a random mass of dropped energy in the room to the creep's memory.pickupId field
 * @param {Creep} creep
 */
function getRandomDroppedEnergy(creep) {
    // Probe all dropped energy in the room.
    let droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource) => {
            return resource.resourceType === RESOURCE_ENERGY;
        }
    });

    // If there's dropped energy in the room,
    if (droppedEnergy !== null && droppedEnergy.length > 0) {
        // pick a random deposit.
        creep.memory.pickupId = droppedEnergy[Math.floor(Math.random() * droppedEnergy.length)].id;
    }
    // Otherwise,
    else {
        // set deliverId to null.
        creep.memory.pickupId = null;
    }
}

/**
 * Assigns the ID of the nearest mass of dropped energy in the room to the creep's memory.pickupId field
 * @param {Creep} creep
 */
function getNearestDroppedEnergy(creep) {
    creep.memory.pickupId = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
        filter: (resource) => {
            return resource.resourceType === RESOURCE_ENERGY;
        }
    });

    if (creep.memory.pickupId !== null) {
        creep.memory.pickupId = creep.memory.pickupId.id;
    }
}

/**
 * Sets the nearest energy bearing structure with as much or more energy than the creep can carry to
 * the creep's memory.dropoffId field, prioritizing extensions and spawns over containers and storages
 * @param {Creep} creep
 */
function getUncappedStruct(creep) {
    // Probe for available extensions and spawns.
    creep.memory.dropoffId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
                && structure.energy < structure.energyCapacity;
        }
    });
    if (creep.memory.dropoffId !== null) {
        creep.memory.dropoffId = creep.memory.dropoffId.id;
    }
    // If none,
    else {
        // probe for available containers and storages.
        creep.memory.dropoffId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE)
                    && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
            }
        });
        if (creep.memory.dropoffId !== null) {
            creep.memory.dropoffId = creep.memory.dropoffId.id;
        }
    }
}

module.exports = roleHauler;