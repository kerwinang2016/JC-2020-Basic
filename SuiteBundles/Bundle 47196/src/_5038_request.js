/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.request) {
    _5038.request = {};
}

_5038.request.Request = function() {
    var URL = "";
    var post = "";
    var header = "";
    var credentials = [];
    var operationType = "";
    var container = {};
    
    this.getURL = function getURL() {
        _5038.stacktrace.StackTrace.addLogEntry("_5038.request.Request.getURL");
        
        return URL;
    };
    
    this.getPost = function getPost() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.getPost");
        
        return post;
    };
    
    this.getHeader = function getHeader() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.getHeader");
        
        return header;
    };
    
    this.getCredentials = function getCredentials() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.getCredentials");
        
        return credentials;
    };
    
    this.getOperationType = function getOperationType() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.getOperationType");
        
        return operationType;
    };
    
    this.getVariable = function getVariable(key) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.getVariable");
        return container[key];
    };
    
    this.setURL = function setURL(newURL) {
        _5038.stacktrace.StackTrace.addLogEntry("_5038.request.Request.setURL");
        
        URL = newURL;
        return this;
    };
    
    this.setPost = function setPost(newPost) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.setPost");
        
        post = newPost;
        return this;
    };
    
    this.setHeader = function setCredentials(newHeader) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.setHeader");
        
        header = newHeader;
        return this;
    };
    
    this.setCredentials = function setCredentials(newCredentials) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.setCredentials");
        
        credentials = newCredentials;
        return this;
    };
    
    this.setOperationType = function setOperationType(newOperationType) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.setOperationType");
        
        operationType = newOperationType;
        return this;
    };
    
    this.setVariable = function setVariable(key, value) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.request.Request.setVariable");
        container[key] = value;
    };
    
    return this;
};