// Associates with an energy source (and associates that source with it via the source list declared in main),
// goes to it, and mines it until death
var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
		// Pick a mining site.
		if (!creep.memory.miningSite) {
            for (var s in Memory.sourceIDs) {
                // If a site is free,
                if (!Memory.sourceIDs[s]) {
                    // pick it.
                    console.log(creep.name + " deploying to mine site " + s + ".");
                    creep.memory.miningSite = s; // Associate with this site,
                    Memory.sourceIDs[s] = creep.id; // associate this site with you,
                    break; // and seek no further sites.
                }
                // If no sites are free,
                else {
                    // stand by.
		            creep.moveTo(Game.flags["WorkerHub"]);
                }
            }
		}
		// If you have a mining site, mine it if it's in range.
		else if (creep.harvest(Game.getObjectById(creep.memory.miningSite)) == ERR_NOT_IN_RANGE) {
		    creep.moveTo(Game.getObjectById(creep.memory.miningSite), {visualizePathStyle: {stroke: '#ffffff'}});
		}
		else {
		    creep.say("⛏", true);
		}
		// If about to dissolve,
		if (creep.ticksToLive < 2 || creep.hits < creep.hitsMax) {
		    // disassociate the mining site with you, designating it as free for your replacement.
		    console.log("Marking mine site " + creep.memory.miningSite + " as available for other miners.");
		    Memory.sourceIDs[creep.memory.miningSite] = 0;
		    // Thank you for your service.
		}
	}
};

module.exports = roleMiner;