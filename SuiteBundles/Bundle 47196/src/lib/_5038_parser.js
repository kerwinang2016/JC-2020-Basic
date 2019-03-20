/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.parser) {
    _5038.parser = {};
}

_5038.parser.AbstractParser = function AbstractParser() {
    this.parse = function parse(inputString) {
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractParser");
    };
};

_5038.parser.XMLParser = function XMLParser() {
    var baseParser = new _5038.parser.AbstractParser();
    
    baseParser.parse = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_5038.parser.XMLParser.parse");
        
        var parser = new _5038.xmlparser.XMLParser();
        var obj = parser.parseXML(inputString);
        return obj;
    };
    return baseParser;
};

_5038.parser.JSONParser = function JSONParser() {
    var baseParser = new _5038.parser.AbstractParser();
    
    baseParser.parse = function(inputString) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.parser.JSONParser.parse");
        
        try {
            var obj = JSON.parse(inputString);
        } catch (err) {
            throw (nlapiCreateError('PGP015', err.message));
        }

        return obj;
    };
    return baseParser;
};

_5038.parser.URLStringParser = function URLStringParser() {
    var baseParser = new _5038.parser.AbstractParser();
    
    baseParser.parse = function(inputString) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.parser.URLStringParser.parse");
        
        var formatter = new _5038.string.StringFormatter();
        var valuePairs = inputString.split("&");
        var obj = {};
        for ( var i = 0; i < valuePairs.length; ++i) {
            var currPai = formatter.setString(valuePairs[i]).decodeHTML()
                .toString().split("=");
            obj[currPai[0]] = currPai[1];
        }
        return obj;
    };
    return baseParser;
};
