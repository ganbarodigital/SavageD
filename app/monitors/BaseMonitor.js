// Copyright (c) 2015-present Ganbaro Digital Ltd
// All rights reserved

function BaseMonitor(appServer, options) {
    // call our parent constructor
    BaseMonitor.super_.call(this, appServer, options);
}
module.exports = BaseMonitor;

// ========================================================================
//
// Logging support
//
// ------------------------------------------------------------------------

BaseMonitor.prototype.logRequest = function(req) {
    this.logInfo("HTTP " + req.method + "  " + req.url);
}