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

// Prototype Utilities

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

// Custom utilities
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

function getObjSoLineKey(paramObjRec)
{
	var functionName = 'getObjSoLineKey';
	var processStr = '';
	var objRec = paramObjRec;
	var objSoLineKeyRef = {};
	
	try
	{

		var sublistItemTotal = (!isNullOrEmpty(objRec.getLineItemCount('item'))) ? objRec.getLineItemCount('item') : 0;
		var hasSublistItem = (sublistItemTotal > 0) ? true : false;
		
		if (hasSublistItem)
		{
			for (var dx = 0; dx < sublistItemTotal; dx++)
			{
				var lineCtr = dx + 1
				var soLineKeyValue = objRec.getLineItemValue('item', 'custcol_avt_saleorder_line_key', lineCtr);
				var hasSoLineKey = (!isNullOrEmpty(soLineKeyValue)) ? true : false;
				
				if (hasSoLineKey)
				{
					var isObjKeySoLineKeyExist = (isObjectExist(objSoLineKeyRef['' + soLineKeyValue + ''])) ? true : false;
					
					if (!isObjKeySoLineKeyExist)
					{
						objSoLineKeyRef['' + soLineKeyValue + ''] = {};
						
						for (var xx = 0; xx < ARR_SUBLIST_ITEMS_IDS.length; xx++)
						{
							objSoLineKeyRef['' + soLineKeyValue + '']['' + ARR_SUBLIST_ITEMS_IDS[xx] + ''] = objRec.getLineItemValue('item', ARR_SUBLIST_ITEMS_IDS[xx], lineCtr);
						}
					}
				}
			}
		}
	}
		catch(ex)
	{
		objSoLineKeyRef = {};
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	return objSoLineKeyRef;
}

function updateSalesOrderLineKey(paramObjRec, paramObjSoLineKey)
{
	var functionName = 'updateSalesOrderLineKey';
	var processStr = '';
	var soId = '';
	var objRec = paramObjRec;
	var objSoLineMapping = paramObjSoLineKey;
	
	try
	{
		var hasObjSoLineMapping = (!isNullOrEmptyObject(objSoLineMapping)) ? true : false;
		var soRefId = objRec.getFieldValue('custbody_avt_salesorder_ref');
		var hasSoRefId = (!isNullOrEmpty(soRefId)) ? true : false;
		
		if (hasSoRefId && hasObjSoLineMapping)
		{
			var arrSublistLineItem = [];
			var objSalesOrder = nlapiLoadRecord('salesorder', soRefId);
			var arrSublistItemTotal = (!isNullOrEmpty(objSalesOrder.getLineItemCount('item'))) ? objSalesOrder.getLineItemCount('item') : 0;
			var hasArrSublistItem = (arrSublistItemTotal > 0) ? true : false;
			
			if (hasArrSublistItem)
			{
				for (var dx = 0; dx < arrSublistItemTotal; dx++)
				{
					var lineCtr = dx + 1;
					var soLineKeyValue = objSalesOrder.getLineItemValue('item', 'custcol_avt_saleorder_line_key', lineCtr);
					var hasSoLineKey = (!isNullOrEmpty(soLineKeyValue)) ? true : false;
					
					if (hasSoLineKey)
					{
						var isObjKeySoLineKeyExist = (isObjectExist(objSoLineMapping['' + soLineKeyValue + ''])) ? true : false;
						
						if (isObjKeySoLineKeyExist)
						{
							arrSublistLineItem.push(soLineKeyValue);
							objSalesOrder.selectLineItem('item', lineCtr);
							
							for (var xx = 0; xx < ARR_SUBLIST_ITEMS_IDS.length; xx++)
							{
								objSalesOrder.setCurrentLineItemValue('item', ARR_SUBLIST_ITEMS_IDS[xx], objSoLineMapping['' + soLineKeyValue + '']['' + ARR_SUBLIST_ITEMS_IDS[xx] + '']);
							}
							
							objSalesOrder.commitLineItem('item');
							
						}
					}
				}
				
				var arrSublistLineItemTotal = (!isNullOrEmpty(arrSublistLineItem)) ? arrSublistLineItem.length : 0;
				var isSubmitSalesOrder = (arrSublistLineItemTotal != 0) ? true : false;
				
				if (isSubmitSalesOrder)
				{
					soId = nlapiSubmitRecord(objSalesOrder, true)
				}
				
			}
		}
		
	}
		catch(ex)
	{
		soId = '';
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
		
	}
	return soId;
}
