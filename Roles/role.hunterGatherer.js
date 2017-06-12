// Early game unit meant to get the ball rolling until miners and cargoTrucks become available
var rolehunterGatherer = {
	
    /** @param {Creep} creep **/
    run: function(creep) {
        // Greeting
        if (creep.ticksToLive == 1499) {
            creep.say("Zug zug", true);
        }
		// Hunt and gather
	    if (creep.carry.energy < creep.carryCapacity) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        // Return
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // Stand by
            else {
                creep.moveTo(Game.flags["WorkerHub"]);
            }
        }
	}
};

module.exports = rolehunterGatherer;