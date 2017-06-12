// Fast courier unit to carry resources from miners to structures
var roleCargoTruck = {

    /** @param {Creep} creep **/
    run: function(creep) {
		// Transport
		if (creep.carry.energy < creep.carryCapacity) {
		    var res = creep.room.find(FIND_DROPPED_RESOURCES);
		    
		    if (res.length) {
		        if (creep.pickup(res[0]) == ERR_NOT_IN_RANGE) {
		            creep.moveTo(res[0], {visualizePathStyle: {stroke: '#ff5555'}});
		        }
		        else {
		            creep.say("??", true);
		        }
		    }
		}
		// Return
		else {
		    // Probe for available extensions and spawns.
            var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
				}
            });
            // If none,
            if (!targets.length) {
                // probe for available containers and storages.
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
					    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] < structure.storeCapacity;
                    }
                });
            }
            // If there are available dump sites,
            if (targets.length) {
                // dump energy.
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#5555ff'}});
                }
            }
            // Otherwise, stand by.
		    else {
		        creep.moveTo(Game.flags.WorkerHub);
		    }
        }
	}
};

module.exports = roleCargoTruck;