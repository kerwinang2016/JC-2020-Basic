/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.message) {
    _5038.message = {};
}

_5038.message.MessageHandler = function MessageHandler() {
    
    this.sendMessage = function(request, output) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.message.MessageHandler.sendMessage");
        
        return output.requestPaymentGateway(request.getCredentials(), request.getURL(), request.getPost(), request.getHeader());
    };
    
    return this;
};