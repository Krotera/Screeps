// Construction unit
var roleCtor = {

    /** @param {Creep} creep **/
    run: function(creep) {
    	if (creep.memory.building && creep.carry.energy == 0 && creep.room.energyAvailable >= 300) {
    		creep.memory.building = false;
    		creep.say('🔋', true);
    	}
    	if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
    	    creep.say("🛠", true);
    		creep.memory.building = true;
    	}
		// Use energy
    	if (creep.memory.building) {
    		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    		if (targets.length) {
    			if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
    				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
    			}
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

module.exports = roleCtor;