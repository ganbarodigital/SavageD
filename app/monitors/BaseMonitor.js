// Copyright (c) 2015-present Ganbaro Digital Ltd
// All rights reserved

// our third-party includes
var util     = require("util");
var dsCommon = require("dsCommon");

function BaseMonitor(appServer, options) {
    // call our parent constructor
    BaseMonitor.super_.call(this, appServer, options);
}
module.exports = BaseMonitor;
util.inherits(BaseMonitor, dsCommon.dsFeature);

// ========================================================================
//
// Logging support
//
// ------------------------------------------------------------------------

BaseMonitor.prototype.logRequest = function(req) {
    this.logInfo("HTTP " + req.method + "  " + req.url);
};