// Roles
var rolehunterGatherer = require('role.hunterGatherer');
var roleUpgrader = require('role.upgrader');
var roleCtor = require('role.ctor');
var roleMiner = require('role.miner');
var roleCargoTruck = require("role.cargoTruck");
// "Globals"
var sources = Game.spawns.Spawn1.room.find(FIND_SOURCES); // List of mining sites


module.exports.loop = function () {
    // Cleaning memory
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            console.log("Scrubbed " + i + "'s memory.");
            delete Memory.creeps[i];
        }
    }
    // Assigning roles to all creeps
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'hunterGatherer') {
            rolehunterGatherer.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'ctor') {
            roleCtor.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'cargoTruck') {
            roleCargoTruck.run(creep);
        }
    }
    
    // Keep list of mine sites (source IDs) in the room and their assigned miner
    if (!Memory.sourceIDs) {
        // Make new source ID list if necessary
        console.log("Making new source list to contain:");
        sources.forEach(function(s) {
           console.log(s.id); 
        });
        Memory.sourceIDs = {};
    }
    // Populate list
    _.each(sources, function(source) {
        // Add new source ID if necessary
        if (Memory.sourceIDs[source.id] === undefined) {
            Memory.sourceIDs[source.id] = 0;
            console.log("Created source entry for " + source.id + "; miners: " + Memory.sourceIDs[source.id]);
        }
        // DEBUG
        else {
            console.log(source.id + " already exists in the list; miners: " + Memory.sourceIDs[source.id]);
        }
    });
}