"use strict";
const roleMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
		if (!creep.spawning) {
            // Pick a mining site if not assigned to one.
            if (!creep.memory.miningSite) {
                for (let i = 0; i < Object.keys(Memory.sourceIDs[creep.room.name]).length; i++) {
                    let site = Object.keys(Memory.sourceIDs[creep.room.name])[i];
                    // If a site is free (recall, only one miner per site),
                    if (Memory.sourceIDs[creep.room.name][site] === 0) {
                        // pick it.
                        creep.memory.miningSite = site; // Associate with this site,
                        Memory.sourceIDs[creep.room.name][site] = creep.id; // associate this site with you,
                        break; // and seek no further sites.
                    }
                    // If no sites are free,
                    else {
                        // stand by.
                        creep.moveTo(Game.flags[creep.room.name + " Tavern"]);
                    }
                }
            }
            // If you have a mining site, mine it if it's in range.
            else if (creep.harvest(Game.getObjectById(creep.memory.miningSite)) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.miningSite), {visualizePathStyle: {stroke: "#ff8800"}});
            }
            else {
                creep.say("\u{026CF}", true);
            }
            // If about to expire or under attack,
            if (creep.ticksToLive < 2 || creep.hits < creep.hitsMax) {
                // disassociate with your mining site, designating it as free.
                console.log(creep.name + " marking mine site " + creep.memory.miningSite + " as available.");
                Memory.sourceIDs[creep.room.name][creep.memory.miningSite] = 0;
                // Thank you for your service.
            }
		}
	}
};

module.exports = roleMiner;