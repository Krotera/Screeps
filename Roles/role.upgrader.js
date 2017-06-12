// Room controller upgrade unit
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.upgrading && creep.carry.energy == 0 && creep.room.energyAvailable >= 300) {
            creep.memory.upgrading = false;
            creep.say('🔋', true);
	    }
	    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡++', true);
	    }
		// Use energy
	    if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
		// Get energy
        else {
    		// Withdraw energy from closest containers, or storages.
    		var matSource = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: function(struct) { 
                            return (struct.structureType == STRUCTURE_STORAGE || struct.structureType == STRUCTURE_CONTAINER) && (struct.store[RESOURCE_ENERGY] >= creep.carryCapacity);
                        }
                });
			// If none are available, probe closest spawns and extensions.
			if (!matSource) {
				matSource = creep.pos.findClosestByRange(FIND_STRUCTURES, {
					filter: function(struct) {
						return (struct.structureType == STRUCTURE_EXTENSION || struct.structureType == STRUCTURE_SPAWN) && (struct.energy >= creep.carryCapacity);
					}
			});
			}
			if (matSource) {
				if (creep.withdraw(matSource, RESOURCE_ENERGY, creep.carryCapacity) == ERR_NOT_IN_RANGE) {
					creep.moveTo(matSource);
				}
			}
    	}
	}
};

module.exports = roleUpgrader;