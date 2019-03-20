/**
 * Copyright (c) 2013  SuiteWerx Solutions.
 * San Pedro, Laguna, Philippines.
 * Quezon City, Philippines.
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * SuiteWerx Solutions ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with SuiteWerx Solutions.
 * 
 */

 /**
 * $Id$
 */
 
/**
 * 
 * Author: Daniel Arenas
 * Email: daniel.r.arenas@gmail.com
 * 
 */

function xyla(objInputData)
{
    var functionName = 'xyla';
    var processStr = '';
    var ctxObj = nlapiGetContext();
    var responseObj = {};
    responseObj['dxj'] = 'ayuz!!'
	nlapiLogExecution('debug', functionName, objInputData);

    try
    {
		/**
		for (var dx in JSON.parse(objInputData))
		{
			nlapiLogExecution('debug', functionName, objInputData[dx]);
		}
		**/
        //var recType = objInputData['recType'];
		//var recId = objInputData['recId'];
    }
        catch(ex)
    {
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
    }

   //responseObj = JSON.stringify(responseObj);
   return responseObj;
}


function getClientProfileOrderHistory(objInputData)
{
    var functionName = 'getClientProfileOrderHistory';
    var processStr = '';
    var ctxObj = nlapiGetContext();
    var responseObj = [];

    try
    {
		var customerId = objInputData['customerid'];
		var clientProfileId = objInputData['clientprofileid'];
		//nlapiLogExecution('debug', functionName, 'customerId: ' + customerId + ', ' + 'clientProfileId: ' + clientProfileId);
		responseObj = searchOrderHistory(customerId, clientProfileId)

    }
        catch(ex)
    {
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
    }

   return responseObj;
}

function getVendorName(internalId) {

        var itemSearch = nlapiSearchRecord('Item', "customsearch183",new nlobjSearchFilter('internalId', null, 'is', internalId), null);
        return itemSearch[0].getText('othervendor');
        
}

function getVendorLink(internalId) {

    var vendorName = getVendorName(internalId);

    //return vendorName;

    var searchresults = nlapiSearchRecord('Vendor', //Search Record/table
        "customsearch182", null, null)//Search Column
    var returnVal = "";
    for (var i = 0; searchresults != null && i < searchresults.length; i++) {
        var customerrecord = searchresults[i];

        if (customerrecord.getValue('companyname') == vendorName) {
            nlapiLogExecution('debug', "getVendorLink", 'Found vendorname ' + vendorName);
            //if (customerrecord.getValue('custentitycustentity_jerome_vendor_link')) {
                //returnVal = { vendorName: customerrecord.getValue('companyname'), vendorLink: customerrecord.getValue('custentitycustentity_jerome_vendor_link') };
                //break;
                         var vendorFileBaseUrl = 'https://checkout.na2.netsuite.com/c.3857857/assets/images/products/';
                returnVal = { vendorName: customerrecord.getValue('companyname'), vendorLink: customerrecord.getValue('custentitycustentity_jerome_vendor_link'),vendorFile: vendorFileBaseUrl+ customerrecord.getText('custentity_vendor_link_file'),vendorFileName:customerrecord.getText('custentity_vendor_link_file') };
                break;
            //}
        }
    }
    nlapiLogExecution('debug', "getVendorLink", JSON.stringify(searchresults));
    return returnVal;
}


