"use strict";
const roleForager = {
    /** @param {Creep} creep */
    run: function(creep) {
        /* GREETING **********************************************************/
        if (creep.ticksToLive === (CREEP_LIFE_TIME - 1)) {
            creep.say("Zug^2", true);
        }
        /* STATE MODULATION **************************************************/
	    if (creep.memory.foraging === undefined || (creep.memory.foraging === false && creep.carry.energy === 0)) {
            creep.memory.foraging = true;
            creep.say("\u{027A1}\u{1F356}", true);
            getClosestSource(creep); // Assign targets with expensive API calls seldomly, upon state change
        }
        else if (creep.memory.foraging === true && creep.carry.energy === creep.carryCapacity) {
            creep.memory.foraging = false;
            creep.say("\u{021A9}\u{1F356}", true);
            getUncappedStruct(creep);
        }
        /* STATE EXECUTION ***************************************************/
        if (creep.memory.foraging === true) {
            if (creep.memory.sourceId !== null) {
                let harvestAttempt = creep.harvest(Game.getObjectById(creep.memory.sourceId));

                if (harvestAttempt === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.sourceId), {visualizePathStyle: {stroke: "#ffffff"}});
                }
                // If the source was depleted in transit,
                else if (harvestAttempt === ERR_NOT_ENOUGH_RESOURCES) {
                    // find another source.
                    getClosestSource(creep);
                }
            }
            // Reassign targets as necessary if state change assignment returned null
            else {
                getClosestSource(creep);
                // This is useful in lieu of a "stand by" state
            }
        }
        else {
            if (creep.memory.dropoffId !== null) {
                let transferAttempt = creep.transfer(Game.getObjectById(creep.memory.dropoffId), RESOURCE_ENERGY);

                if (transferAttempt === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.dropoffId), {visualizePathStyle: {stroke: "#ffffff"}});
                }
                // If the dropoff structure got full in transit,
                else if (transferAttempt === ERR_FULL) {
                    // find another dropoff point.
                    getUncappedStruct(creep);
                }
            }
            else {
                getUncappedStruct(creep);
            }
        }
	}
};

/**
 * Assigns the ID of the nearest source to the creep's memory.sourceId field
 * @param {Creep} creep
 */
function getClosestSource(creep) {
    creep.memory.sourceId = creep.pos.findClosestByRange(FIND_SOURCES);
    
    if (creep.memory.sourceId !== null) {
        creep.memory.sourceId = creep.memory.sourceId.id;
    }
}

/**
 * Assigns the ID of the nearest structure that isn't at energy capacity to the creep's memory.dropoffId
 * field
 * @param {Creep} creep
 */
function getUncappedStruct(creep) {
    creep.memory.dropoffId = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                structure.energy < structure.energyCapacity;
        }
    });

    if (creep.memory.dropoffId !== null) {
        creep.memory.dropoffId = creep.memory.dropoffId.id;
    }
}

module.exports = roleForager;