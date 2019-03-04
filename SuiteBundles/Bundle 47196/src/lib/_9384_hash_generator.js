/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */


if (!_9384) {
    var _9384 = {};
}
if (!_9384.hashgenerator) {
    _9384.hashgenerator = {};
}

_9384.hashgenerator.AbstractHashGenerator = function AbstractHashGenerator() {
    this.generateHash = function generateHash(inputString) {
        throw nlapiCreateError("PGP001", "Please use a subclass of AbstractHashGenerator");
    };
};

_9384.hashgenerator.SHA1 = function SHA1() {
    var baseHashGenerator = new _9384.hashgenerator.AbstractHashGenerator();
    
    baseHashGenerator.generateHash = function(inputString) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.hashgenerator.SHA1.generateHash");

        try {
            var hash = CryptoJS.SHA1(inputString);
            var hashStr = hash.toString(CryptoJS.enc.Hex);
        } catch (err) {
            throw (nlapiCreateError('PGP018', err.message));
        }
        return hashStr;
    };

    return baseHashGenerator;
};
