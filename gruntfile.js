module.exports = function(grunt) {
 
    grunt.loadNpmTasks('grunt-screeps');
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-contrib-clean");
	
	// Pull default configs from .screepsAccountInfo.json
	try {
		var config = require("./.screepsAccountInfo.json");
	} catch (error) {
		console.log("Config file '.screepsAccountInfo.json' not found! Make one containing:");
		console.log(
		"\t\t{\n\
		 \"email\": \"(your Screeps email)\",\n \
		 \"password\": \"(your Screeps password)\",\n \
		 \"branch\": \"default\",\n \
		 \"ptr\": false\n \
		}"
		);
	}
	var branch = config.branch;
	var email = config.email;
	var password = config.password;
	var ptr = config.ptr;
 
    grunt.initConfig({
		// Push all files in dist/ to Screeps.
		screeps: {
		  options: {
			email: email,
			password: password,
			branch: branch,
			ptr: ptr
		  },
		  dist: {
			src: ["dist/*.js"]
		  }
		},
		
		// Flatten and copy all src files into the dist folder
		copy: {
		  // Copies code to the dist folder as a buffer before being sent to Screeps
		  screeps: {
			files: [
				{
				  expand: true,
				  cwd: "src/",
				  src: ["**/*.js", "!**/node_modules/**"],
				  dest: "dist/",
				  filter: "isFile",
				  rename: function(dest, src) {
					// Flatten files, replacing dir delimiters with periods
					return dest + src.replace(/\//g, ".");
				  }
				}
			]
		  }
		},
		
		// Remove all files from the dist folder.
		clean: {
		  "dist": ["dist"]
		},
    });
	
	// Combine the above into a default task
	grunt.registerTask("deploy", ["clean", "copy:screeps", "screeps"]);
}