"use strict";
const roleCtor = {
    /** @param {Creep} creep */
    run: function(creep) {
        /* STATE MODULATION **************************************************/
    	if (creep.memory.building === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            getClosestCtionSite(creep);
        }
        else if (creep.memory.building === undefined || (creep.memory.building === true && creep.carry.energy === 0)) {
            creep.memory.building = false;
            roleCtor.getMatSource(creep);
        }
        /* STATE EXECUTION ***************************************************/
    	if (creep.memory.building === true) {
    	    // Retry finding a ction site if failed on state modulation
            if (creep.memory.ctionSiteId === null) {
                getClosestCtionSite(creep);
            }
    		if (creep.memory.ctionSiteId !== null) {
    			if (creep.build(Game.getObjectById(creep.memory.ctionSiteId)) === ERR_NOT_IN_RANGE) {
    				creep.moveTo(Game.getObjectById(creep.memory.ctionSiteId), {visualizePathStyle: {stroke: "#ffff00"}});
    			}
    			// If done (ConstructionSite no longer exists) but still holding spare energy (and thus cannot proc state change),
    			else if (Game.getObjectById(creep.memory.ctionSiteId) === null) {
    			    // seek another ction site.
                    getClosestCtionSite(creep);
                }
    			else {
                    creep.say("\u{1F6E0}", true);
				}
    		}
    		// If no construction sites are available,
    		else {
    			// stand by.
                creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
			}
    	}
    	else {
            if (creep.memory.matSourceId === null) {
                roleCtor.getMatSource(creep);
            }
            // Get energy to build with only if the room's energy budget is 50% full.
            if (creep.memory.matSourceId !== null && creep.room.energyAvailable >= (creep.room.energyCapacityAvailable / 2)) {
                if (creep.withdraw(Game.getObjectById(creep.memory.matSourceId), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.matSourceId));
                }
                // If still not full,
                if (creep.carry.energy < creep.carryCapacity) {
                    // get another energy storage.
                    roleCtor.getMatSource(creep);
                }
            }
            else {
    	        // Stand by
                creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
            }
        }
    },
    /**
     * Sets the closest energy bearing structure, with as much or more energy than the creep can carry, to the creep to
     * the creep's memory.matSourceId field, prioritizing storages and containers over extensions and spawns
     * @param {Creep} creep
     */
    getMatSource: function(creep) {
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
};

/**
 * Sets the closest construction site to the creep to the creep's memory.ctionSiteId field
 * @param {Creep} creep
 */
function getClosestCtionSite(creep) {
    creep.memory.ctionSiteId = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES);

    if (creep.memory.ctionSiteId !== null) {
        creep.memory.ctionSiteId = creep.memory.ctionSiteId.id;
    }
}

module.exports = roleCtor;