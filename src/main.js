// Roles
"use strict";
const roleRoomHomeostasis = require("Roles.roomHomeostasis");
const roleForager = require("Roles.forager");
const roleUpgrader = require("Roles.upgrader");
const roleCtor = require("Roles.ctor");
const roleMiner = require("Roles.miner");
const roleHauler = require("Roles.hauler");
const roleEngineer = require("Roles.engineer");
// Helper functions
// Global vars
// Module vars (always redeclared on script rebuild by the server)

module.exports.loop = function () {
	/*************************************************************************/
	/* Set up global memory                                                  */
	/*************************************************************************/
	// Creep roles
	if (!Memory.roles) {
		Memory.roles = {
			"forager": [MOVE, CARRY, WORK],
			"upgrader": [MOVE, CARRY, WORK],
			"ctor": [MOVE, CARRY, CARRY, CARRY, WORK],
			"miner": [MOVE, WORK, WORK],
			"hauler": [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
            "engineer": [MOVE, MOVE, CARRY, CARRY, WORK]
		}
	}
	// Creep role costs
	if (!Memory.roleCosts) {
		/*
		 * Part cost reference as of writing:
		 * 	Tough - 10
		 * 	Move - 50
		 * 	Carry - 50
		 * 	Attack - 80
		 *	Work - 100
		 * 	Ranged attack - 150
		 * 	Heal - 250
		 * 	Claim - 600
		 */
		Memory.roleCosts = {
			"forager": BODYPART_COST["move"] + BODYPART_COST["carry"] + BODYPART_COST["work"],
			"upgrader": BODYPART_COST["move"] + BODYPART_COST["carry"] + BODYPART_COST["work"],
			"ctor": BODYPART_COST["move"] + (3 * BODYPART_COST["carry"]) + BODYPART_COST["work"],
			"miner": BODYPART_COST["move"] + (2 * BODYPART_COST["work"]),
			"hauler": (3 * BODYPART_COST["move"]) + (3 * BODYPART_COST["carry"]),
            "engineer": (2 * BODYPART_COST["move"]) + (2 * BODYPART_COST["carry"]) + BODYPART_COST["work"]
		};
	}
	// List object of (rooms : (source IDs : miner ID))
	if (!Memory.sourceIDs) {
		Memory.sourceIDs = {};
	}

    /*************************************************************************/
    /* Assign room code to all owned rooms with a spawn                      */
    /*************************************************************************/
    for (let i = 0; i < Object.keys(Game.rooms).length; i++) {
        let room = Game.rooms[Object.keys(Game.rooms)[i]];

        if (room.controller && room.controller.my) {
            let spawns = room.find(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_SPAWN }
            });

            // Pass the array of spawns to roomHomeostasis
            if (spawns.length > 0) {
                roleRoomHomeostasis.run(room, spawns);
			}
        }
    }

    /*************************************************************************/
    /* Assign roles to all creeps                                            */
    /*************************************************************************/
    for (let i = 0; i < Object.keys(Game.creeps).length; i++) {
        let creep = Game.creeps[Object.keys(Game.creeps)[i]];

        switch (creep.memory.role) {
            case "upgrader":
                roleUpgrader.run(creep);
                break;
            case "ctor":
                roleCtor.run(creep);
                break;
            case "miner":
                roleMiner.run(creep);
                break;
            case "hauler":
                roleHauler.run(creep);
                break;
            case "engineer":
                roleEngineer.run(creep);
                break;
            default:
                roleForager.run(creep);
        }
    }
	
    /*************************************************************************/
	/* Reap the souls of dead creeps:                                        */
	/* Game.creeps is an object containing ONLY LIVING creeps, whereas       */
	/* Memory.creeps contains a historic record of ALL creeps and can be     */
	/* scrubbed of dead creeps' memory against Game.creeps.                  */
	/*************************************************************************/
	for (let i = 0; i < Object.keys(Memory.creeps).length; i++) {
		if (Game.creeps[Object.keys(Memory.creeps)[i]] === undefined) {
            delete Memory.creeps[Object.keys(Memory.creeps)[i]];
            console.log("Scrubbed " + Object.keys(Memory.creeps)[i] + "'s memory.");
		}
	}
	
	/*************************************************************************/
	/* Keep roster object of active creeps by "room_role"                    */
	/*************************************************************************/
	/* E.g., 
	 * {
	 *		W99N99_miner: [Creep1, Creep2],
	 *		W50N99_miner: [Creep3, Creep5],
	 *		W99N99_hauler: [Creep4, Creep6, Creep7],...
	 * }
	 */
	Memory.roster = _.groupBy(Memory.creeps, (creep, index) => Game.creeps[index].pos.roomName + "_" + creep.role);
};