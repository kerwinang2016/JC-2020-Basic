/*
 * Author: kmorfe
 * Date Created: 8 Oct 2020
 */

/* ---- GLOBAL VARIABLES ---- */
var log = new Logger(false); //Always include a Logger object. Set parameter to true on Client Side script implementations.
var context = nlapiGetContext(); //Always include an nlobjContext object.

/* ---- ERROR HANDLING CONSTANTS ---- */
var SCRIPT_NAME = 'JC Assign Case to Sales Order UES';
var FROM_EMAIL = -5; //Default Administrator
var TO_EMAIL = 'kim.morfe@gmail.com';
var CC_EMAILS = null;
var CLIENT_NAME = 'Jerome Clothiers';
var SCRIPT_FILE_NAME = 'KM_UE_AssignCaseToOrder.js';

/* ---- CONSTANTS ---- */
//TODO: Add your constants here, if any.
//Sample
//var PI = 3.1416;

/**
 * Replace with Record Type Name/ID for Client and User Event scripts,
 * Suitelet Name, RESTlet name, Portlet Name, Scheduled Script Name, and Mass Update Script Name
 * for Suitelets, RESTlets, Portlets, Scheduled Scripts and Mass Update Scripts,
 * Bundle Name for Bundle Installation scripts, and SSP Application name for SSP and SS.
 */
var AssignCaseToOrderUES = {

};
/**
 * Insert function description here.
 * @appliedtorecord recordType The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
AssignCaseToOrderUES.onAfterSubmit = function(type) {
    try {
        //nlapiLogExecution('debug', 'type', type);
        if (type != 'create' && type != 'edit') return;

        var rectype = nlapiGetRecordType();
        var recid = nlapiGetRecordId();
        var rec = nlapiLoadRecord(rectype, recid); //Load case record
        var relatedSO = rec.getFieldValue('custevent_related_sales_order');
        var casesoid = rec.getFieldValue('custevent_so_id');
        var requesttext = rec.getFieldText('issue');
        //nlapiLogExecution('debug', 'Sales Order', relatedSO);
        if (StringUtils.isNotEmpty(relatedSO)) {

            //Load sales order record
            var soRec = nlapiLoadRecord('salesorder', relatedSO);
            var supportCases = soRec.getFieldValue('custbody_support_cases');
            //nlapiLogExecution('debug','supportCases',supportCases);
            if (StringUtils.isEmpty(supportCases)) {
                //nlapiLogExecution('debug','test');
                soRec.setFieldValue('custbody_support_cases', recid);
            } else {
                //nlapiLogExecution('debug','e')
                supportCases = supportCases.split(',');
                if (supportCases.indexOf(recid) != -1)
                    supportCases.push(recid);
                soRec.setFieldValues('custbody_support_cases', supportCases);
            }
            //Only for Pending Approval
            //nlapiLogExecution('debug','soRec.getFieldValue("status")',soRec.getFieldValue('status'))
            if (rec.getFieldValue('issue') == '4' || rec.getFieldValue('issue') == '5') {
                if (soRec.getFieldValue('status') == 'Pending Approval') {
                    for (var i = 1; i <= soRec.getLineItemCount('item'); i++) {
                        var soid = soRec.getLineItemValue('item', 'custcol_so_id', i);
                        if (casesoid == soid) {
                            if (rec.getFieldValue('status') == '6') {
                                //Approved
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, requesttext);
                                soRec.setLineItemValue('item', 'isclosed', i, "T");
                                soRec.setLineItemValue('item', 'custcol_avt_fabric_text', i, 'Cancelled');
                                soRec.setLineItemValue('item', 'custcol_avt_fabric_status', i, '6');
                                soRec.setLineItemValue('item', 'custcol_avt_cmt_status', i, '11');
                                soRec.setLineItemValue('item', 'custcol_avt_cmt_status_text', i, 'Cancelled');
                            } else if (rec.getFieldValue('status') == '7') {
                                //Denied
                                soRec.setLineItemValue('item', 'isclosed', i, "F");
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, "");
                            } else {
                                //if (soRec.getLineItemValue('item', 'custcolcustcol_api_status_fld', i) != "") {
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, requesttext);
                                //}
                            }
                        }
                    }
                    nlapiSubmitRecord(soRec, true, true);
                } else if (soRec.getFieldValue('status') == 'Billed' || soRec.getFieldValue('status') == 'Pending Billing') {
                    for (var i = 1; i <= soRec.getLineItemCount('item'); i++) {
                        var soid = soRec.getLineItemValue('item', 'custcol_so_id', i);
                        if (casesoid == soid) {
                            if (rec.getFieldValue('status') == '6') {
                                //Approved
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, requesttext);
                                soRec.setLineItemValue('item', 'isclosed', i, "T");
                                soRec.setLineItemValue('item', 'custcol_avt_fabric_text', i, 'Cancelled');
                                soRec.setLineItemValue('item', 'custcol_avt_fabric_status', i, '6');
                                soRec.setLineItemValue('item', 'custcol_avt_cmt_status', i, '11');
                                soRec.setLineItemValue('item', 'custcol_avt_cmt_status_text', i, 'Cancelled');

                            } else if (rec.getFieldValue('status') == '7') {
                                //Denied
                                soRec.setLineItemValue('item', 'isclosed', i, "F");
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, "");
                            } else {
                                //if (soRec.getLineItemValue('item', 'custcolcustcol_api_status_fld', i) != "") {
                                soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', i, requesttext);
                                //}
                            }
                        }
                    }
                    nlapiSubmitRecord(soRec, true, true);
                    nlapiLogExecution('debug','TEST', relatedSO);
                    //Update PO and Invoice Lines
                    var filters = [
                        ['mainline', 'is', 'T'], "AND",
                        ["createdfrom", "anyof", relatedSO]
                    ]
                    var sr = nlapiSearchRecord('transaction', null, filters);
                    var relatedRecs = [];
                    if (sr && sr.length > 0) {
                        for (var i = 0; i < sr.length; i++) {
                            var found = _.find(relatedRecs, function(obj) {
                                return obj.id == sr[i].id;
                            });
                            if (!found) {
                              nlapiLogExecution('debug','id type',sr[i].id + " " + sr[i].type)
                                relatedRecs.push({
                                    id: sr[i].id,
                                    type: sr[i].getRecordType()
                                });
                            }
                        }
                    }
                    nlapiLogExecution('debug', 'related ',  JSON.stringify(relatedRecs));
                    try {
                        for (var i = 0; i < relatedRecs.length; i++) {
                            var relatedRec = nlapiLoadRecord(relatedRecs[i].type, relatedRecs[i].id);
                            nlapiLogExecution('debug', 'linecount', relatedRec.getLineItemCount('item'))
                            // if (relatedRec.getLineItemCount('item') == 1) {
                            //     nlapiLogExecution('debug', 'Has 1 item')
                            //     nlapiDeleteRecord(relatedRecs[i].type, relatedRecs[i].id);
                            //     continue;
                            // } else {
                                for (var j = 1; j <= relatedRec.getLineItemCount('item'); j++) {
                                    var soid = relatedRec.getLineItemValue('item', 'custcol_so_id', j);
                                    if (casesoid == soid) {
                                        if (rec.getFieldValue('status') == '6') {
                                            //Approved
                                            relatedRec.removeLineItem('item', j);
                                            j--;
                                        }
                                        //  else if (rec.getFieldValue('status') == '7') {
                                        //     //Denied
                                        //     soRec.setLineItemValue('item', 'isclosed', j, "F");
                                        //     soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', j, "");
                                        // } else {
                                        //     //if (soRec.getLineItemValue('item', 'custcolcustcol_api_status_fld', i) != "") {
                                        //     soRec.setLineItemValue('item', 'custcolcustcol_api_status_fld', j, requesttext);
                                        //     //}
                                        // }
                                    }
                                }
                                nlapiLogExecution('debug', 'linecount end', relatedRec.getLineItemCount('item'))
                                if(relatedRec.getLineItemCount('item') >0 )
                                  nlapiSubmitRecord(relatedRec)
                                else
                                    nlapiDeleteRecord(relatedRecs[i].type, relatedRecs[i].id);
                            // }
                        }
                    } catch (e) {
                        nlapiLogExecution('error', 'failed to remove lines', e.message)
                        throw e.message;
                    }
                }
            }
        }
    } catch (e) {
        //Log Error and Send Error Notification Email
        var errorMessage = 'Unexpected Error';
        nlapiLogExecution('error', 'An error occurred AssignCaseToOrderUES.onAfterSubmit', e.message)
        //log.debug('An error occurred AssignCaseToOrderUES.onAfterSubmit', e);
        //logEmailError('onBeforeLoad - ' + errorMessage, e);
    }
};
