/** Returns true if there are no walls between the start coordinate and end coordinate;
 * returns false otherwise. */
"use strict";
global.isClearLine = function(roomName, startX, startY, endX, endY) {
    // Determine direction from start coord to end coord;
    // dX and dY will be positive (easterly/southerly on the room grid), 0 for null (same x or y),
    // or negative (westerly/northerly)
    let dX = endX - startX;
    let dY = endY - startY;

    while ((startX !== endX) || (startY !== endY)) {
        // Step startX
        if (dX !== 0) {
            // Stop stepping a coord if it's matched
            if (startX === endX) {
                dX = 0;
            }
            else if (dX > 0) {
                startX++;
            }
            else {
                startX--;
            }
        }
        // Step startY
        if (dY !== 0) {
            if (startY === endY) {
                dY = 0;
            }
            else if (dY > 0) {
                startY++;
            }
            else {
                startY--;
            }
        }
        // Check tile for a wall
        if (Game.map.getTerrainAt(startX, startY, roomName) === "wall") {
            new RoomVisual(roomName).rect(startX, startY, 1, 1, {fill: "#ff0000", opacity: "0.2"});
            return false;
        }
        else {
            new RoomVisual(roomName).rect(startX, startY, 1, 1, {fill: "#00ff00", opacity: "0.1"});
        }
    }
    // No walls detected in line segment between (startX,startY) and (endX, endY)
    return true;
};