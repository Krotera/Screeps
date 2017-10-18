## Background
This codebase attempts a fully autonomous Screeps AI (ideally functioning with zero console commands or user actions).

With [Node.js](https://nodejs.org/en/download/), run `npm install` after cloning to import node modules. One of these is
 [Grunt](https://gruntjs.com/), which lets you use `grunt deploy` to automatically clean the `dist` directory, 
 flatten and copy all code from `src` to it, and push all its code to Screeps  in one command (thanks, [Lexx](https://github.com/Lexxicon))!

### Roles
- &#x1F6E0; **Ctor** - Builds
- &#x1F527; **Engineer** - Repairs
- &#x1F356; **Forager** - Starter unit
- &#x1F69B; **Hauler** - Carries stuff around
- &#x026CF; **Miner** - [Static harvester](https://wiki.screepspl.us/index.php/Static_Harvesting); sits at a source and mines
- &#x1F3E0; **Room Homeostasis** - Room-based maintenance of creep population, flags, etc.
- &#x1F53A; **Upgrader** - Upgrades controller

### Helper Functions
- **isClearLine** - Checks for walls in a line from two pairs of coordinates
- **placeTavern** - Places a "tavern" flag around a spawn to which idle creeps congregate

## Done
- Generate and maintain a creep population
- Autoplace tavern flag
- Repairer role
- Tower defense
- RCL-paced creep population targets

## To Do
- Buildings
- Roads based on paths
- RCL-paced creep body plans and building limits
- Creep awareness of being stuck and swapping places with others if applicable (might want to use `Creep.prototype`)
- Colonization of other rooms
- Militarized creeps
- Defense routines

## License
[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)