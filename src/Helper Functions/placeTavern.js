/**
 * Places the Tavern flag around the first spawn in the specified room
 * @param {StructureSpawn} spawn
 * @param {string} flagName - "room.name_Tavern"
 */
"use strict";
require("Helper Functions.isClearLine");
global.placeTavern = function(spawn, flagName) {
    // Assure space 5 tiles SE of spawn
    if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x + 5, spawn.pos.y + 5)) {
        spawn.room.createFlag(spawn.pos.x + 5, spawn.pos.y + 5, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 5 tiles SW
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x - 5, spawn.pos.y + 5)) {
        spawn.room.createFlag(spawn.pos.x - 5, spawn.pos.y + 5, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 5 tiles NW
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x - 5, spawn.pos.y - 5)) {
        spawn.room.createFlag(spawn.pos.x - 5, spawn.pos.y - 5, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 5 tiles NE
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x + 5, spawn.pos.y - 5)) {
        spawn.room.createFlag(spawn.pos.x + 5, spawn.pos.y - 5, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 7 tiles E
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x + 7, spawn.pos.y)) {
        spawn.room.createFlag(spawn.pos.x + 7, spawn.pos.y, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 7 tiles S
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x, spawn.pos.y + 7)) {
        spawn.room.createFlag(spawn.pos.x, spawn.pos.y + 7, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 7 tiles W
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x - 7, spawn.pos.y)) {
        spawn.room.createFlag(spawn.pos.x - 7, spawn.pos.y, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Try 7 tiles N
    else if (isClearLine(spawn.room.name, spawn.pos.x, spawn.pos.y, spawn.pos.x, spawn.pos.y - 7)) {
        spawn.room.createFlag(spawn.pos.x, spawn.pos.y - 7, flagName, COLOR_GREEN, COLOR_RED);
    }
    // Alert that no space was found at desired range
    else {
        console.error("ERROR: Not enough space was found around " + spawn.room.name + " controller to place the " + flagName + "!"
        + "Please place Tavern flag manually.");
    }
};