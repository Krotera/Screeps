## Background
This codebase attempts a fully autonomous Screeps AI (ideally functioning with zero console commands or user actions).

With [Node.js](https://nodejs.org/en/download/), run `npm install` after cloning to import node modules. One of these is
 [Grunt](https://gruntjs.com/), which allows you to use `grunt deploy` to automatically clean the `dist` directory, 
 flatten and copy all code from `src` to it, and push all code from it to Screeps!

### Roles
- **Ctor** &#x1F6E0; - Builder
- **Forager** &#x1F356; - Starter unit
- **Hauler** &#x1F69B; - Carries stuff around
- **Miner** &#x026CF; - [Static harvester](https://wiki.screepspl.us/index.php/Static_Harvesting); sits at a source and mines
- **Room Homeostasis** &#x1F3E0; - Room-based maintenance of creep population, flags, etc.
- **Upgrader** &#x1F53A; - 

### Helper Functions
- **isClearLine** - Checks for walls in a line from two pairs of coordinates
- **placeTavern** - Places a "tavern" flag around a spawn to which idle creeps congregate

## Done
- Generate and maintain a creep population
- Autoplace tavern flag

## To Do
- Buildings
- Roads based on paths
- RCL pacing (creep body plans and building limits)
- Creep awareness of being stuck and swapping places with others if applicable (might want to use `Creep.prototype`)
- Colonization of other rooms
- Defense

## License
[GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)