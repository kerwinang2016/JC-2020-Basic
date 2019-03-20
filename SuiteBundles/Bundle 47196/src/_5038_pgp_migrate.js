/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}

_5038.migration = {};


_5038.migration.migrate = function() {
    var migrationTool = new _4978.migration.SecurePayMigrateTool();
    migrationTool.migrate();
};