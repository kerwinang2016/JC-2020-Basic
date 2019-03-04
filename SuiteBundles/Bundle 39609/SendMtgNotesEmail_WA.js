/**
 * Copyright NetSuite, Inc. 2014 All rights reserved. 
 * The following code is a demo prototype. Due to time constraints of a demo,
 * the code may contain bugs, may not accurately reflect user requirements 
 * and may not be the best approach. Actual implementation should not reuse 
 * this code without due verification.
 * 
 * (Module description here. Whole header length should not exceed 
 * 100 characters in width. Use another line if needed.)
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Mar 2014     rfalcunit
 * 
 */
/*
 * Global Variables
 */
{	
	var FLD_MN_ATTENDEES = 'custrecord_ns_ps_attendees';
	var FLD_MN_TOPIC = 'custrecord_ns_ps_meeting_topic';
	var FLD_MN_MEETING_DATE = 'custrecord_ns_ps_meeting_date';
	var FLD_MN_MEETING_SUMMARY = 'custrecord_ns_ps_meeting_summary';
	var FLD_MN_NEXT_MTG_DATE = 'custrecord_ns_ps_next_meeting_date';
	var FLD_MN_NEXT_MTG_TOPICS = 'custrecord_ns_ps_next_meeting_topics';
	var FLD_MN_CC_ON_EMAIL = 'custrecord_ns_ps_meeting_note_cc_email';
	
	var SL_ACTION_ITEMS = 'recmachcustrecord_ns_ps_meeting_notes_record';
	var COL_AI_ASSIGNED_TO = 'custrecord_ns_ps_assigned_to';
	var COL_AI_ACTION_ITEM = 'custrecord_ns_ps_action_item';
	
	var REC_EMPLOYEE = 'employee';
	var FLD_EMP_EMAIL = 'email';
	
	var CONF_COMPANY_INFO = 'companyinformation';
	var FLD_CI_COMPANY_NAME = 'companyname';
	
	
}

/**
 * @return {String|Number|Object|void} Any or no return value
 */
function sendMtgNotesEmail()
{	
	// load the NetSuite configuration page
	var companyInfo = nlapiLoadConfiguration(CONF_COMPANY_INFO);
	var sCompanyName = companyInfo.getFieldValue(FLD_CI_COMPANY_NAME);
	var sMsgHtml	 = '';
    sMsgHtml		+= '<div style="font-size: 8pt arial,Verdana, sans-serif;">';
    sMsgHtml		+= 		'<span style="text-decoration:underline;font-weight:bold;color:#0000ff;">Meeting Notes Information</span><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Meeting Date:</span><br/>';
    sMsgHtml		+= 		'<span>' + nlapiGetFieldValue(FLD_MN_MEETING_DATE) + '</span><br/><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Topic:</span><br/>';
    sMsgHtml		+= 		'<span>' + nlapiGetFieldValue(FLD_MN_TOPIC) + '</span><br/><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Attendees:</span><br/>';
    sMsgHtml		+= 		'<span>' + writeAttendees(nlapiGetFieldTexts(FLD_MN_ATTENDEES)) + '</span><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Meeting Summary:</span><br/>';
    sMsgHtml		+= 		'<div>';
    sMsgHtml		+= 			nlapiGetFieldValue(FLD_MN_MEETING_SUMMARY);
    sMsgHtml		+= 			writeActionItems();    
    sMsgHtml		+= 		'</div>';
    sMsgHtml		+= 		'<span style="text-decoration:underline;font-weight:bold;color:#0000ff;">Next Meeting Information</span><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Next Meeting Date:</span><br/>';
    sMsgHtml		+= 		'<span>' + nlapiGetFieldValue(FLD_MN_NEXT_MTG_DATE) + '</span><br/><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;">Next Meeting Agenda/Topics:</span><br/>';
    sMsgHtml		+= 		'<span>' + nlapiGetFieldValue(FLD_MN_NEXT_MTG_TOPICS) + '</span><br/><br/>';
    sMsgHtml		+= 		'<span style="font-weight:bold;color:#ff0000;">Please be sure to review and complete any action items that have been assigned.<br/><br/>Please do not respond to this email. <br/></span><br/>';
    
    var aAttendeesEmail = getAttendeesEmail(nlapiGetFieldValues(FLD_MN_ATTENDEES));
    
    
    
    if(aAttendeesEmail && aAttendeesEmail.length > 0)
    {		    	
    	var objRecordToAttach =  new Object();
    	objRecordToAttach['record'] = nlapiGetRecordId();
    	objRecordToAttach['recordtype'] = nlapiGetRecordType();
    	//Send Email to Attendees
    	nlapiSendEmail(nlapiGetUser(), aAttendeesEmail, sCompanyName + ' | Meeting Notes Summary', sMsgHtml, null, null, objRecordToAttach, null);
    	
    	//Send Email to CC on Email since CC recepients are not captured on the Mail Merge record
    	var aCCOnEmail = getAttendeesEmail(nlapiGetFieldValues(FLD_MN_CC_ON_EMAIL));
    	if(aCCOnEmail && aCCOnEmail.length > 0)
    	{
    		nlapiSendEmail(nlapiGetUser(), aCCOnEmail, 'CC::'+ sCompanyName + ' | Meeting Notes Summary', sMsgHtml, null, null, objRecordToAttach, null);
    	}
    		    	
    }    
}

function getAttendeesEmail(aAttendees)
{
	var aAttendeesEmail = new Array();
	for(var i=0; aAttendees && i < aAttendees.length; i++)
	{
		var sEmail = nlapiLookupField(REC_EMPLOYEE, aAttendees[i], FLD_EMP_EMAIL);
		
		if(sEmail)
		{
			aAttendeesEmail.push(sEmail);
		}
	}
	
	return aAttendeesEmail;
	
}

function writeAttendees(aAttendees)
{
	var sHtml = '';
	for(var i=0; aAttendees && i < aAttendees.length; i++)
	{
		sHtml += aAttendees[i] + '<br/>';
	}
	
	return sHtml;
}

function writeActionItems()
{
	var sHtml = '';
	
	var nActionItemsCount = nlapiGetLineItemCount(SL_ACTION_ITEMS);
	sHtml += (nActionItemsCount > 0) ? '<span style="font-weight:bold;"><br/><br/>Action Items</span><br/>-------------------<br/>' : '';
	for(var i = 1; i <= nActionItemsCount; i++)
	{
		var sAssignedTo = nlapiGetLineItemText(SL_ACTION_ITEMS, COL_AI_ASSIGNED_TO, i);		
		var sActionItem = nlapiGetLineItemValue(SL_ACTION_ITEMS, COL_AI_ACTION_ITEM, i);
		sHtml	+=	'<span style="text-decoration:underline;">' + sAssignedTo + '</span><br/>';
		if(sActionItem)
		{
			sHtml	+=	'<span>' + sActionItem + '</span><br/><br/>';
		}
		
		
	}
	
	sHtml += '<br/><br/>';
	
	return sHtml;
}
