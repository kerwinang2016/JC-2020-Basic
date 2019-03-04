/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.date) {
    _5038.date = {};
}

_5038.date.DateFormatter = function(date) {
    date = date || new Date();
    
    this.getGMT = function getGMT() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.date.DateFormatter.getGMT");
        
        var sFormatter = new _5038.string.StringFormatter();
        var str = "";
        str += sFormatter.setString(date.getUTCFullYear()).padLeft(4, "0")
            .toString();
        str += sFormatter.setString(date.getUTCMonth() + 1).padLeft(2, "0")
            .toString();
        str += sFormatter.setString(date.getUTCDate()).padLeft(2, "0")
            .toString();
        str += sFormatter.setString(date.getUTCHours()).padLeft(2, "0")
            .toString();
        str += sFormatter.setString(date.getUTCMinutes()).padLeft(2, "0")
            .toString();
        str += sFormatter.setString(date.getUTCSeconds()).padLeft(2, "0")
            .toString();
        str += sFormatter.setString(date.getUTCMilliseconds()).padLeft(3, "0")
            .toString();
        return str;
    };
    
    this.getDate = function() {
        return date;
    };
    
};