/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */

if (!_7352) {
    var _7352 = {};
}

if (!_7352.signaturegenerator) {
    _7352.signaturegenerator = {};
}

_7352.signaturegenerator.SignatureGenerator = function SignatureGenerator(hashGenerator) {
    _5038.stacktrace.StackTrace.addLogEntry("_7352.signaturegenerator.SignatureGenerator");

    this.generateSignature = function generateSignature(template, obj) {
        _5038.stacktrace.StackTrace.addLogEntry("_7352.signaturegenerator.SignatureGenerator.generateSignature");

        var stringFormatter = new _5038.string.StringFormatter(template);

        if (obj != null) {
            stringFormatter.replaceParameters(obj);
        }

        var string = stringFormatter.toString();
        return hashGenerator.generateHash(string);
    };
};
