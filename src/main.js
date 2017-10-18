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
    // TODO: Set up RCL progression in here with switch, using the building caps constant and Room.createConstructionSite()
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
    // List object of population targets by role based on RCL
    if (!Memory.RCLPopTargs) {
        Memory.RCLPopTargs = {
            // RCLs 1 to 3
            "one_to_three": {
                "miner": 1,     // Miners per source
                "hauler": 2,    // Haulers per miner
                "ctor": 2,      // Ctors per room
                "upgrader": 1,  // Upgraders per room
                "engineer": 2   // Engineers per room
            },
            // RCLs 4 and above
            "four_to_eight": {
                "miner": 1,
                "hauler": 2,
                "ctor": 2,
                "upgrader": 2,
                "engineer": 6
            }
        };
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