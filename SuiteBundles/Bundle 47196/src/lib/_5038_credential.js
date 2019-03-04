/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}
if (!_5038.credential) {
    _5038.credential = {};
}

_5038.credential.Credentials = (function Credentials(customRecord, id) {
    _5038.stacktrace.StackTrace.addLogEntry("_5038.credential.Credentials");
    
    var container = {};
    
    this.setValue = function setValue(field, value) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.setValue");
        
        container[field] = value;
    };
    
    this.getValue = function getValue(field) {
        return container[field] ? container[field] : "";
    };
    
    this.searchCredentials = function searchCredentials(id) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.searchCredentials");
        
        if (!id) {
            return [];
        }
        var columns = [
            new nlobjSearchColumn(customRecord.fields.id),
            new nlobjSearchColumn(customRecord.fields.name),
            new nlobjSearchColumn(customRecord.fields.value)];
        return nlapiSearchRecord(customRecord.id, null, new nlobjSearchFilter(customRecord.fields.id, null, "equalto", id), columns)
               || [];
        
    };
    
    this.load = function load(id) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.load");
        
        var savedCredentials = this.searchCredentials(id);
        for ( var i = 0; i < savedCredentials.length; i++) {
            var credential = savedCredentials[i];

            this
                .setValue(credential.getValue(customRecord.fields.name), credential
                    .getValue(customRecord.fields.value));
        }
    };
    
    this.updateCredentialRecords = function updateCredentialRecords() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.updateCredentialRecords");
        
        var existingRecords = [];
        var savedCredentials = this.searchCredentials(id);
        
        for ( var i = 0; i < savedCredentials.length; i++) {
            var credential = savedCredentials[i];
            var name = credential.getValue(customRecord.fields.name);
            if (credential.getValue(customRecord.fields.value) !== container[name]) {
                nlapiSubmitField(customRecord.id, credential.getId(), customRecord.fields.value, container[name]);
            }
            existingRecords.push(name);
        }
        return existingRecords;
    };
    
    this.createCredentialRecord = function createCredentialRecord(name, value) {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.createCredentialRecord");
        
        var rec = nlapiCreateRecord(customRecord.id);
        rec.setFieldValue(customRecord.fields.id, id);
        rec.setFieldValue(customRecord.fields.name, name);
        rec.setFieldValue(customRecord.fields.value, value);
        var newId = nlapiSubmitRecord(rec);
        if (!id) {
            id = newId;
            nlapiSubmitField(customRecord.id, id, customRecord.fields.id, id);
        }
    };
    
    this.save = function save() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.save");
        
        var existingRecords = this.updateCredentialRecords();
        
        for ( var i in container) {
            if (existingRecords.indexOf(i) === -1) {
                this.createCredentialRecord(i, container[i]);
            }
        }
        return id;
    };
    
    this.getAsObject = function getAsObject() {
        _5038.stacktrace.StackTrace
            .addLogEntry("_5038.credential.Credentials.getAsObject");
        
        return container;
    };
    
    this.getCredentialList = function getCredentialList() {
        var list = [];
        
        for (i in container) {
            list.push(container[i]);
        }
        
        return list;
    };
    
    if (!!id) {
        this.load(id);
    }
    
    return this;
});
