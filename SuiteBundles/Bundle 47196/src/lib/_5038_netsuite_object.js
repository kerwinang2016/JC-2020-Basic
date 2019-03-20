/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_5038) {
    var _5038 = {};
}

if (!_5038.netsuite) {
    _5038.netsuite = {};
}

/**
 * Encapsulates an nlobjRecord; No need to implement more functions for now.
 */
_5038.netsuite.NetSuiteObject = function NetSuiteObject(type, id) {
    
    if (!type) {
        throw nlapiCreateError("PGP007", "Record Type must be passed to the NetSuiteObject constructor.");
    }
    
    var record = id ? nlapiLoadRecord(type, id) : nlapiCreateRecord(type);
    
    this.getFieldValue = function getFieldValue(field) {
        return record.getFieldValue(field);
    };
    
    this.getField = function getField(field) {
        return record.getField(field);
    };
    
    this.setFieldValue = function setFieldValue(field, value) {
        return record.setFieldValue(field, value);
    };
    
    this.getId = function getId() {
        return record.getId();
    };
    
    this.getAsRecord = function getAsRecord() {
        return record;
    };
    
    this.getOptionsAsMap = function getOptionsAsMap(type) {
        var field = record.getField(type);
        var map = {};
        var options = [];
        
        if (field) {
            options = field.getSelectOptions();
        }
        
        for ( var i = 0; i < options.length; i++) {
            map[options[i].getId()] = options[i].getText();
        }
        
        return map;
    };
    
    this.load = function load(id) {
        record = nlapiLoadRecord(type, id);
    };
    
    this.save = function save() {
        var id = nlapiSubmitRecord(record);
        this.load(id);
    };
    
    return this;
};