/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */


if (!_9384) {
    var _9384 = {};
}
if (!_9384.encoder) {
    _9384.encoder = {};
}

_9384.encoder.AbstractEncoder = function AbstractEncoder() {
    this.encode = function encode(inputString) {
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractEncoder");
    };
    
    this.decode = function decode(inputString) {
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractEncoder");
    };
};

_9384.encoder.Base64 = function Base64() {
    var baseEncoder = new _9384.encoder.AbstractEncoder();
    
    baseEncoder.encode = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.encoder.Base64.encode");

        try {
            var wordArray = CryptoJS.enc.Utf8.parse(inputString);
            var encodedStr = CryptoJS.enc.Base64.stringify(wordArray);
        } catch (err) {
            throw (nlapiCreateError('PGP014.A', err.message));
        }
        return encodedStr;
    };

    baseEncoder.decode = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.encoder.Base64.decode");

        try {
            var parsedWordArray = CryptoJS.enc.Base64.parse(inputString);
            var decodedStr = parsedWordArray.toString(CryptoJS.enc.Utf8);
        } catch (err) {
            throw (nlapiCreateError('PGP014.B', err.message));
        }
        return decodedStr;
    };

    return baseEncoder;
};

/*
 * Use this when we need to pass the base64 encoded value in the URL
 * 
 * Base64 valid characters are:
 * A-Za-z0-9+/=
 * 
 * Since +/= are not url friendly, we replace them with other characters
 * 
 * http://www.cs.berkeley.edu/~jonah/bc/org/bouncycastle/util/encoders/UrlBase64Encoder.html
 */

_9384.encoder.Base64URL = function Base64URL() {
    var baseEncoder = new _9384.encoder.AbstractEncoder();
    var base64Encoder = new _9384.encoder.Base64();

    baseEncoder.encode = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.encoder.Base64URL.encode");

        var encodedStr = base64Encoder.encode(inputString);

        encodedStr = encodedStr.replace(/\+/g, '-');
        encodedStr = encodedStr.replace(/\//g, '_');
        encodedStr = encodedStr.replace(/=/g, '.');

        return encodedStr;
    };

    baseEncoder.decode = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.encoder.Base64URL.decode");

        inputString = inputString.replace(/-/g, '+');
        inputString = inputString.replace(/_/g, '/');
        inputString = inputString.replace(/\./g, '=');

        var decodedStr = base64Encoder.decode(inputString);

        return decodedStr;
    };

    return baseEncoder;
};
