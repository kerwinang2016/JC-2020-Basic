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

/** start Prototype Utilities **/

// Function to check if array element exist
Array.prototype.inArray = function(valueStr)
{
	var convertedValueStr = valueStr.toString();
	
	for(var i = 0; i < this.length; i++)
	{
		if (this[i] === convertedValueStr)
		
		return true;
	
	}
	return false;
};

Object.size = function(obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
	var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.randomize = function()
{
	var i = this.length, j, temp;
	while ( --i )
	{
		j = Math.floor( Math.random() * (i - 1) );
		temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
}

/** end Prototype Utilities **/

/** start Custom Netsuite Helper Utilities **/



function isNullOrEmpty(valueStr)
{
   return(valueStr == null || valueStr == "" || valueStr == undefined); 
}

function isNullOrEmptyObject(obj) 
{
   var hasOwnProperty = Object.prototype.hasOwnProperty;
   
   if (obj.length && obj.length > 0) { return false; }   
   for (var key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
   return true;
}

function isObjectExist(objFld)
{
   var isObjExist = (typeof objFld != "undefined") ? true : false;
   return isObjExist;
}

function replaceChars(valusStr, out, add) 
{
	temp = '' + valusStr; // temporary holder
	
	while (temp.indexOf(out) > -1) 
	{
		pos= temp.indexOf(out);
		temp = "" + (temp.substring(0, pos) + add + 
		temp.substring((pos + out.length), temp.length));
	}
	return temp;
}

function forceParseFloat(stValue)
{
    var flValue = parseFloat(stValue);
    
    if (isFinite(flValue) == false)
    {
        return 0.00;        
    }
    
    if (isNaN(flValue))
    {
        return 0.00;
    }
    
    return flValue;
}

function cleanArray(dirtyArray)
{
	var newArray = [];
	
	for(var i = 0; i < dirtyArray.length; i++)
	{
		if (dirtyArray[i]) 
		{ 
			newArray.push(dirtyArray[i]);
		}
	}
	return newArray;
}

function removeDuplicateElement(arrayName)
{
	var newArray = [];
	label:for(var i = 0; i < arrayName.length;i++ )
	{  
		for(var j = 0; j < newArray.length;j++ )
		{
			if(newArray[j]==arrayName[i]) 
			continue label;
		}
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
}

function getArrLimitCount(paramArrRef, paramLimitCount)
{
   var arrNew = [];
   var paramArrRefTotal = (!isNullOrEmpty(paramArrRef)) ? paramArrRef.length : 0;
   var isParamArrRefTotalLessThanLimitCount = (paramArrRefTotal < paramLimitCount) ? true : false;
   var loopTotal = (isParamArrRefTotalLessThanLimitCount) ? paramArrRefTotal : paramLimitCount;
   
   for (var dx = 0; dx < loopTotal; dx++)
   {
	  arrNew.push(paramArrRef[dx])
   }

   return arrNew;
}

function getArrRandomNumbers(paramRefMaxNumber, paramArrTotalNumber)
{
	var arrRandomRef = [];
	var arrTotalRef = (paramRefMaxNumber < paramArrTotalNumber) ? paramRefMaxNumber : paramArrTotalNumber;
	var intArrCtr = 0
	
	while (intArrCtr != arrTotalRef)
	{
		var randomNumber = parseInt(Math.floor(Math.random() * paramRefMaxNumber)).toFixed(0);
		var isRandomNumberInArrRandomRef = arrRandomRef.inArray(randomNumber) ? true : false;
		
		if (!isRandomNumberInArrRandomRef)
		{
			arrRandomRef.push(randomNumber);
			intArrCtr++;
		}
	}
	return arrRandomRef;
}

function stripHtml(paramValueStr)
{
	var newStr = paramValueStr.replace(/(<([^>]+)>)/ig,"");
	return newStr;
}


function getRestletResponse(paramRestUrl, paramNsAcctId, paramEmail, paramPwd, paramObj)
{
	var functionName = 'getRestletResponse';
	var processStr = '';
	var retResponse = {};

	try
	{
		var headers = [];
		headers['User-Agent-x'] = 'SuiteScript-Call';
		headers['Content-Type'] = 'application/json';
		headers['Authorization'] = 'NLAuth nlauth_account=' + paramNsAcctId + ',nlauth_email=' + paramEmail + ',nlauth_signature=' + paramPwd + ',nlauth_role=3';
		
		//var objJson = {'entityid' : '803'};
		var objJson = paramObj;
		var stJson = JSON.stringify(objJson);
		
		var response = nlapiRequestURL(paramRestUrl, stJson, headers);
		var responseCode = response.getCode();
		var isSuccessResponseCode = (responseCode == 200) ? true : false;
		
		if (isSuccessResponseCode)
		{
			var responseBody = response.getBody();
			retResponse = JSON.parse(responseBody);
		}
		
	}
		catch(ex)
	{
		retResponse = {};

		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);

	}
	
	return retResponse;
}


function getObjFromSuitelet(paramSuiteletScriptId, paramSuiteletDeploymentId, paramFunctionName, paramObjInputData)
{
   var functionName = 'getObjFromSuitelet';
   var processStr = '';
   var ctxObj = nlapiGetContext();
   var bodyValue = '';
   var objResponse = {};
   
   try
   {
	  
	  var dateRef = new Date();
	  var urlSuitelet = nlapiResolveURL('suitelet', paramSuiteletScriptId, paramSuiteletDeploymentId, true);
	  urlSuitelet = urlSuitelet + '&t=' + new Date().getTime() + Math.floor(Math.random()*999999999999999999);
	  
      var headers = [];
      headers['User-Agent-x'] = 'SuiteScript-Call';
      headers['Content-Type'] = 'application/json';
      
      var jsonObj = {'func': paramFunctionName, 'data' : paramObjInputData};
      var jsonTxt = JSON.stringify(jsonObj);
      
      var suiteletRequestURL = nlapiRequestURL(urlSuitelet, jsonTxt, headers);
      var responseCode = suiteletRequestURL.getCode();
      var isSuccessResponse = (!isNullOrEmpty(responseCode) && responseCode == 200) ? true : false;
      
	  nlapiLogExecution('debug', functionName, 'isSuccessResponse: ' + isSuccessResponse);
	  
      if (isSuccessResponse)
      {
         nlapiLogExecution('debug', functionName, 'Response Code: ' + responseCode + '<br>' + 'Response Body: ' + suiteletRequestURL.getBody());
         bodyValue = suiteletRequestURL.getBody();
         objResponse = JSON.parse(bodyValue);
      }
   }
      catch(ex)
   {
      var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
      nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
      
   }
   //objResponse = JSON.stringify(objResponse);
   return objResponse;
}


function getOrderHistoryInternalIds(paramCustomerInternalId, paramTailorClientInternalId)
{
	var functionName = 'getOrderHistoryInternalIds';
	var processStr = '';
	var retArrInternalId = [];
	var arrCustomer = [];
	var arrTranType = ['SalesOrd'];
	var customerInternalId = paramCustomerInternalId;
	var tailorClientInternalId = paramTailorClientInternalId;
	
	var hasCustomerInternalId = (!isNullOrEmpty(customerInternalId)) ? true : false;
	var hasTailorClientInternalId = (!isNullOrEmpty(tailorClientInternalId)) ? true : false;
	var isSearchOrderHistory = (hasCustomerInternalId && hasTailorClientInternalId) ? true : false;

	try
	{
		if (isSearchOrderHistory)
		{
			customerInternalId = parseInt(customerInternalId).toFixed(0);
			customerInternalId = customerInternalId.toString();
			arrCustomer.push(customerInternalId)
			tailorClientInternalId = parseInt(tailorClientInternalId).toFixed(0);
			tailorClientInternalId = tailorClientInternalId.toString();
			
			var arrFilters = [   new nlobjSearchFilter('type', null, 'anyof', arrTranType)
							   , new nlobjSearchFilter('mainline', null, 'is', 'F')
							   , new nlobjSearchFilter('custcol_tailor_client', null, 'is', tailorClientInternalId)
							   , new nlobjSearchFilter('internalid', 'customer', 'anyof', arrCustomer)
							 ];
			
			var arrColumns = [   new nlobjSearchColumn('internalid', null, 'group')
							   , new nlobjSearchColumn('amount', null, 'sum')
							 ];
			
			var searchResults = nlapiSearchRecord('transaction', null, arrFilters, arrColumns);
			var searchResultsTotal = (!isNullOrEmpty(searchResults)) ? searchResults.length : 0;
			var hasSearchResults = (searchResultsTotal != 0) ? true : false;
			
			if (hasSearchResults)
			{
				for (var dx = 0; dx < searchResultsTotal; dx++)
				{
					var searchResult = searchResults[dx];
					var orderHistoryInternalId = searchResult.getValue('internalid', null, 'group');
					orderHistoryInternalId = parseInt(orderHistoryInternalId).toFixed(0);
					retArrInternalId.push(orderHistoryInternalId.toString())
				}
			}
		}
	}
		catch(ex)
	{
		retArrInternalId = [];
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	return retArrInternalId
}


function searchOrderHistory(paramCustomerInternalId, paramTailorClientInternalId)
{
	var functionName = 'getOrderHistoryInternalIds';
	var processStr = '';
	var retArrObj = [];
	var arrCustomer = [];
	var arrTranType = ['SalesOrd'];
	var customerInternalId = paramCustomerInternalId;
	var tailorClientInternalId = paramTailorClientInternalId;
	
	var hasCustomerInternalId = (!isNullOrEmpty(customerInternalId)) ? true : false;
	var hasTailorClientInternalId = (!isNullOrEmpty(tailorClientInternalId)) ? true : false;
	var isSearchOrderHistory = (hasCustomerInternalId && hasTailorClientInternalId) ? true : false;

	try
	{
		if (isSearchOrderHistory)
		{
			var arrOrderHistoryInternalIds = getOrderHistoryInternalIds(customerInternalId, tailorClientInternalId);
			var arrOrderHistoryInternalIdsTotal = (!isNullOrEmpty(arrOrderHistoryInternalIds)) ? arrOrderHistoryInternalIds.length : 0;
			var hasArrOrderHistoryInternalIds = (arrOrderHistoryInternalIdsTotal != 0) ? true : false;
			
			if (hasArrOrderHistoryInternalIds)
			{
				var arrFilters = [   new nlobjSearchFilter('type', null, 'anyof', arrTranType)
								   , new nlobjSearchFilter('mainline', null, 'is', 'F')
								   , new nlobjSearchFilter('internalid', null, 'anyof', arrOrderHistoryInternalIds)
								   //, new nlobjSearchFilter('custcol_tailor_client', null, 'is', tailorClientInternalId)
								   //, new nlobjSearchFilter('internalid', 'customer', 'anyof', arrCustomer)
								   , new nlobjSearchFilter('custcol_itm_category_url', null, 'isnotempty')
								 ];
				
				var arrColumns = [   new nlobjSearchColumn('internalid').setSort(true)
								   , new nlobjSearchColumn('totalamount')
								   , new nlobjSearchColumn('status')
								   , new nlobjSearchColumn('trandate')
								   , new nlobjSearchColumn('tranid')
								   , new nlobjSearchColumn('custbody_total_tailor_price')
								   , new nlobjSearchColumn('custbody_customer_name')
								   , new nlobjSearchColumn('custcol_so_id')
								   , new nlobjSearchColumn('item')
								   , new nlobjSearchColumn('custcol_avt_date_needed')
								   //, new nlobjSearchColumn('custcol_avt_fabric_status')
								   //, new nlobjSearchColumn('custcol_avt_cmt_status')

								   , new nlobjSearchColumn('custcol_avt_fabric_text')
								   , new nlobjSearchColumn('custcol_avt_cmt_status_text')

								   , new nlobjSearchColumn('custcol_avt_solinestatus')

								 ];
				
				var searchResults = nlapiSearchRecord('transaction', null, arrFilters, arrColumns);
				var searchResultsTotal = (!isNullOrEmpty(searchResults)) ? searchResults.length : 0;
				var hasSearchResults = (searchResultsTotal != 0) ? true : false;
				
				if (hasSearchResults)
				{
					var tailorClientLookUp = nlapiLookupField('customrecord_sc_tailor_client', tailorClientInternalId, ['custrecord_tc_first_name', 'custrecord_tc_last_name'])
					var tailorClientName = tailorClientLookUp.custrecord_tc_first_name + ' ' + tailorClientLookUp.custrecord_tc_last_name
					
					for (var dx = 0; dx < searchResultsTotal; dx++)
					{
						var searchResult = searchResults[dx];
						var objRef = {};
						objRef['internalid'] = searchResult.getValue('internalid');
						objRef['orderdate'] = searchResult.getValue('trandate');
						objRef['ordernumber'] = searchResult.getValue('tranid');
						//objRef['clientname'] = tailorClientName;
						objRef['clientname'] = searchResult.getValue('custbody_customer_name');
						objRef['ordertotal'] = searchResult.getValue('custbody_total_tailor_price');
						objRef['status'] = searchResult.getText('status');

						objRef['so_id'] = searchResult.getValue('custcol_so_id');
						objRef['item'] = searchResult.getText('item');
						//objRef['fabricstatus'] = searchResult.getText('custcol_avt_fabric_status');
						//objRef['cmtstatus'] = searchResult.getText('custcol_avt_cmt_status');
						objRef['dateneeded'] = searchResult.getValue('custcol_avt_date_needed');

						objRef['fabricstatus'] = searchResult.getValue('custcol_avt_fabric_text');
						objRef['cmtstatus'] = searchResult.getValue('custcol_avt_cmt_status_text');

						objRef['tranline_status'] = searchResult.getText('custcol_avt_solinestatus');


						retArrObj.push(objRef);
						
					}
				}
			}
		}
	}
		catch(ex)
	{
		retArrObj = [];
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	return retArrObj;
}

/** end Custom Netsuite Helper Utilities **/


