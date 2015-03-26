// Copyright (c) 2013 Mediasift Ltd
// All rights reserved

// our built-in includes
var fs   = require("fs");
var util = require("util");

// our third-party includes
var _        = require("underscore");
var dsCommon = require("dsCommon");

// our parser
var ServerDiskstatsParser = require("../parsers/ServerDiskstatsParser");

function ServerIO(appServer) {
	// call our parent constructor
	ServerIO.super_.call(this, appServer, {
		name: "ServerIO"
	});

	// this is the file that we want to monitor
	this.filename = "/proc/diskstats";

	// add ourselves to the list of available plugins
	appServer.serverMonitor.addPlugin("diskstats", this);
}
module.exports = ServerIO;
util.inherits(ServerIO, dsCommon.dsFeature);

ServerIO.prototype.getFilenamesToMonitor = function() {
	return [
		{
			filename: this.filename,
			parser:   new ServerDiskstatsParser()
		}
	];
};

ServerIO.prototype.reportUsage = function(alias) {
	// self-reference
	var self = this;

	// get the parsed stats
	var stats = self.appServer.getLatestDataFor(self.filename);
	//util.log(stats.raw);

	// do we have anything to report?
	//
	// the stats are calculated by sampling; we need at least
	// two data points to achieve this
	if (stats.diff.length === 0) {
		// nothing to report this time
		return;
	}

	// at this point, we have data to send to statsd
	_.each(stats.diff, function(deviceStats, deviceName) {
		_.each(deviceStats, function(value, fieldName) {
			self.appServer.statsManager.gauge(alias + ".diskstats." + deviceName + "." + fieldName, value);
		});
	});
};