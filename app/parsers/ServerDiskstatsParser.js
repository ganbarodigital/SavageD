// Copyright (c) 2015-present Ganbaro Digital Ltd
// All rights reserved

// our built-in includes
var fs   = require("fs");
var util = require("util");

// our third-party includes
var _    = require("underscore");

function ServerDiskstatsParser(appServer) {
	// remember the appServer
	this.appServer = appServer;

	// our absolute disk stats
	this.diskStats = {};
}
module.exports = ServerDiskstatsParser;

ServerDiskstatsParser.prototype.retrieveStats = function(filename) {
	// get the current IO stats
	var stats = this.retrieveLatestStats(filename);
	//util.log(stats);

	// is this the first time?
	if (this.diskStats.ram0 === undefined) {
		// special case - first time we've grabbed the stats
		this.diskStats = stats;

		// nothing to report this time around, as we have no CPU stats
		// to compare against
		// this.logInfo("No disk stats to diff yet");
		return { raw: {}, diff: {} };
	}

	// if we get here, then we can diff the stats
	var diff = this.diffDiskStats(this.diskStats, stats);

	// remember these stats for next time
	this.diskStats = stats;

	// all done - return the results
	return { raw: this.diskStats, diff: diff };
};

ServerDiskstatsParser.prototype.retrieveLatestStats = function(filename) {
	// self-reference
	var self = this;

	// what are we doing?
	// this.logInfo("report server disk usage");

	// this will hold the processed contents of the stat file
	var results = {};

	// does the path exist?
	if (!fs.existsSync(filename)) {
		throw new Error("Cannot find file " + filename);
	}

	// this will hold the raw contents of the status file
	var content = fs.readFileSync(filename, "ascii");
	var parsed = null;

	_.each(content.split("\n"), function(line) {
		// skip blank lines
		if (line.length === 0) {
			return;
		}

		// get the individual fields
		parsed = line.split(/\s+/);

		// break them out
		results[parsed[3]] = {
			reads_successful:    parseInt(parsed[4], 10),
			reads_merged:        parseInt(parsed[5], 10),
			sectors_read:        parseInt(parsed[6], 10),
			read_time_ms:        parseInt(parsed[7], 10),
			writes_successful:   parseInt(parsed[8], 10),
			writes_merged:       parseInt(parsed[9], 10),
			sectors_written:     parseInt(parsed[10], 10),
			write_time_ms:       parseInt(parsed[11], 10),
			io_in_progress:      parseInt(parsed[12], 10),
			io_time_ms:          parseInt(parsed[13], 10),
			io_time_ms_weighted: parseInt(parsed[14], 10),

			// now, we need to add some inferred stats
			reads_total:         parseInt(parsed[4], 10) + parseInt(parsed[5], 10),
			writes_total:        parseInt(parsed[8], 10) + parseInt(parsed[9], 10),
		};

	});

	// all done
	return results;
};

ServerDiskstatsParser.prototype.diffDiskStats = function(oldStats, newStats) {
	var results = {};

	// work out the amount of IO that has occurred between our two sample
	// points
	_.each(oldStats, function(deviceStats, deviceName) {
		results[deviceName] = {};
		_.each(deviceStats, function(value, fieldName) {
			// do not diff io_in_progress; it is already a gauge not a counter
			if (fieldName !== 'io_in_progress') {
				results[deviceName][fieldName] = (newStats[deviceName][fieldName] - value);
			}
		});
	});

	// all done
	return results;
};