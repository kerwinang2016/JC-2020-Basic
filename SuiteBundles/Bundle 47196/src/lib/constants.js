/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
/**
 * Constants for All Credit Card Plugins
 * 
 * Version Date Author Remarks
 * 
 * 1.00 29 Aug 2013 aalcabasa
 * 
 */

if (!_CCP) {
    var _CCP = {};
}

// PREFIXES
_CCP.FORM_FIELD_PREFIX = 'custpage_ccp_';
_CCP.CUST_COLUMN_PREFIX = 'custcol_ccp_';
_CCP.CUST_ITEM_PREFIX = 'custitem_ccp_';
_CCP.CUST_RECORD_PREFIX = 'customrecord_ccp_';
_CCP.CUST_FIELD_PREFIX = 'custrecord_ccp_';
_CCP.CUST_SCRIPT_PREFIX = 'customscript_ccp_';
_CCP.CUST_DEPLOY_PREFIX = 'customdeploy_ccp_';
_CCP.CUST_ENTITY_PREFIX = 'custentity_ccp_';
_CCP.CUST_PARAM_PREFIX = 'custparam_ccp_';
_CCP.CUST_LIST_PREFIX = 'customlist_ccp_';
_CCP.CUST_REC_MACH_PREFIX = 'recmachcustrecord_ccp_';

// List Constants
_CCP.GATEWAY_MODE_PROD = "1";
_CCP.GATEWAY_MODE_TEST = "2";

_CCP.GATEWAY_OPERATION_AUTHORIZATION = "1";
_CCP.GATEWAY_OPERATION_CAPTURE = "2";
_CCP.GATEWAY_OPERATION_PAYMENT = "3";
_CCP.GATEWAY_OPERATION_REFUND = "4";
_CCP.GATEWAY_OPERATION_CREDIT = "5";

_CCP.GATEWAY_OPERATION_AUTH_CHKOUT_URLFETCH = "6";
_CCP.GATEWAY_OPERATION_AUTH_CHKOUT_RESULTFETCH = "7";

_CCP.GATEWAY_OPERATION_PAYMENT_CHKOUT_URLFETCH = "8";
_CCP.GATEWAY_OPERATION_PAYMENT_CHKOUT_RESULTFETCH = "9";

_CCP.GATEWAY_RESPONSE_XML = "1";
_CCP.GATEWAY_RESPONSE_JSON = "2";
_CCP.GATEWAY_RESPONSE_HTTP = "3";

_CCP.PGP_VARIABLE_ERROR = "ERROR";
_CCP.PGP_VARIABLE_OPERATION_TYPE_KEY = "OPERATION_TYPE_KEY";

_CCP.FORM_SUBMITTER_SCRIPT_ID = "customscript_ccp_form_submitter_su";
_CCP.FORM_SUBMITTER_DEPLOYMENT = "customdeploy_ccp_form_submitter_su";

_CCP.POSTBACK_TIMEOUT = 864000; // 10 days

_CCP.VALIDATE_POSTBACK_UNAUTHORIZE_CODE = "401";
_CCP.VALIDATE_POSTBACK_UNAUTHORIZE_MESSAGE = "Authorization failed";

_CCP.WEBSTORE_REJECT_MESSAGE = "Invalid credit card details. Please try again or choose a different payment method.";

//Payment Instrument Types
_CCP.EXTERNAL_CHECKOUT = 'external_checkout';
_CCP.PAYMENT_CARD = 'PAYMENT_CARD';