/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 */


if (!_9384) {
    var _9384 = {};
};

_9384.formsubmitter = _9384.formsubmitter || {};
_9384.model = _9384.model || {};

_9384.formsubmitter.GatewayFormPageTemplateDAO = function GatewayFormPageTemplateDAO() {
    var RECORD_ID = 'customrecord_ccp_form_page_template';
    var FIELD_MAP = {
        'gatewayConfigId':'custrecord_ccp_form_page_gateway',
        'template':'custrecord_ccp_form_page_template',
        'testActionUrl':'custrecord_ccp_form_page_action_url_test',
        'liveActionUrl':'custrecord_ccp_form_page_action_url_live',
    };

    this.getTemplate = function getTemplate(gatewayConfigId) {
        _5038.stacktrace.StackTrace.addLogEntry("_9384.formsubmitter.GatewayFormPageTemplateDAO.getTemplate");

        var columns = [];
        var keys = Object.keys(FIELD_MAP);
        for (var i = 0; i < keys.length; i++) {
            columns.push(new nlobjSearchColumn(FIELD_MAP[keys[i]]));
        }
        var searchResult = nlapiSearchRecord(RECORD_ID, null, new nlobjSearchFilter(FIELD_MAP.gatewayConfigId, null, "is", gatewayConfigId), columns) || [];

        var template = null;
        if (searchResult.length == 0) {
            return template;
        } else if (searchResult.length > 1) {
            nlapiLogExecution('DEBUG', 'GatewayFormPageTemplateDAO searchResult', JSON.stringify(searchResult));
        }

        // There should only be one form page template per gateway
        template = createModel(searchResult[0]);

        return template;
    };

    function createModel(searchResult) {
        var model = new _9384.model.GatewayFormPageTemplate();

        var keys = Object.keys(FIELD_MAP);
        for (var i = 0; i < keys.length; i++) {
            var modelKey = keys[i];
            model[modelKey] = searchResult.getValue(FIELD_MAP[modelKey]);
        }

        return model;
    }
};

_9384.model.GatewayFormPageTemplate = function GatewayFormPageTemplate() {
    var obj = {
        'template':null,
        'testActionUrl':null,
        'liveActionUrl':null
    };

    Object.seal(obj);
    return obj;
};
