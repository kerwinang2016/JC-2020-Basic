/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
if (!_4978) {
    var _4978 = {};
}

_4978.migration = {};

_4978.migration.NLUpdateRecord = function NLRecord(type, id) {
    
    var values = {};
    var updatedFields = [];
    
    function getUpdatedFields() {
        return updatedFields;
    }
    
    function setValue(field, value) {
        if (updatedFields.indexOf(field) === -1) {
            updatedFields.push(field);
        }
        values[field] = value;
    }
    
    function getValue(field) {
        return values[field];
    }
    
    function setUpdateRecords(record) {
        for ( var i in values) {
            record.setFieldValue(i, values[i]);
        }
    }
    
    function updateRecord() {
        var updatedFields = getUpdatedFields();
        if (updatedFields.length == 0) {
            // do nothing
        } else
            if (updatedFields.length == 1) {
                var field = updatedFields[0];
                nlapiSubmitField(type, id, field, values[field]);
            } else {
                var record = loadRecord();
                setUpdateRecords(record);
                nlapiSubmitRecord(record);
            }
    }
    
    function createRecord() {
        var record = nlapiCreateRecord(type);
        setUpdateRecords(record);
        return nlapiSubmitRecord(record);
    }
    
    function saveRecord() {
        if (id && ((id > 0) || (String(id).length != 0))) {
            updateRecord();
        } else {
            id = createRecord();
        }
    }
    
    function loadRecord() {
        return nlapiLoadRecord(type, id);
    }
    
    function loadValues() {
        var rec = loadRecord();
        var fields = rec.getAllFields();
        for ( var i = 0; i < fields.length; i++) {
            var field = fields[i];
            values[field] = rec.getFieldValue(field);
        }
    }
    
    this.loadValues = loadValues;
    this.saveRecord = saveRecord;
    this.getValue = getValue;
    this.setValue = setValue;
    return this;
};

_4978.migration.SecurePayMigrateTool = function() {
    var MIGRATION_MAP = {
        MerchantId: "ccp_api_key",
        Password: "ccp_api_pass"
    };
    
    function migrate() {
        var recordType = "customrecord_ccp_securepay";
        var updateField = "custrecord_pgprofile_name";
        var credentialList = (nlapiSearchRecord(recordType, null, [
            [updateField, "is", "MerchantId"],
            'OR',
            [updateField, "is", "Password"]], new nlobjSearchColumn(updateField)) || [])
            .map(function(res) {
                var record = new _4978.migration.NLUpdateRecord(recordType, res
                    .getId());
                var newValue = MIGRATION_MAP[res.getValue(updateField)];
                if (newValue) {
                    record.setValue(updateField, newValue);
                }
                return record;
            });
        for ( var i = 0; i < credentialList.length; i++) {
            credentialList[i].saveRecord();
        }
    }
    
    this.migrate = migrate;
    
    return this;
};