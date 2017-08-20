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
"use strict";
const roleCtor = {
    /** @param {Creep} creep **/
    run: function(creep) {
        /* STATE MODULATION **************************************************/
    	if (creep.memory.building === false && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            getClosestCtionSite(creep);
        }
        else if (creep.memory.building === undefined || (creep.memory.building === true && creep.carry.energy === 0)) {
            creep.memory.building = false;
            getMatSource(creep);
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
                getMatSource(creep);
            }
            // Get energy to build with only if the room's energy budget is 50% full.
            if (creep.memory.matSourceId !== null && creep.room.energyAvailable >= (creep.room.energyCapacityAvailable / 2)) {
                if (creep.withdraw(Game.getObjectById(creep.memory.matSourceId), RESOURCE_ENERGY, creep.carryCapacity) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.matSourceId));
                }
                // If still not full,
                if (creep.carry.energy < creep.carryCapacity) {
                    // get another energy storage.
                    getMatSource(creep);
                }
            }
            else {
    	        // Stand by
                creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
            }
        }
    }
};

/**
 * Sets the closest energy bearing structure, with as much or more energy than the creep can carry, to the creep to
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