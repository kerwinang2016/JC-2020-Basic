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

function getObjPurchaseOrderData(paramObjSalesOrder, paramSalesOrderInternalId)
{
	var functionName = 'getObjPurchaseOrderData';
	var processStr = '';
	var objPoRec = {};
	var objSalesOrder = paramObjSalesOrder;
	
	try
	{
		var sublistItemCountTotal = (!isNullOrEmpty(objSalesOrder.getLineItemCount('item'))) ? objSalesOrder.getLineItemCount('item') : 0;
		var hasSublistItem = (sublistItemCountTotal != 0) ? true : false;
		
		if (hasSublistItem)
		{
			for (var dx = 0; dx < sublistItemCountTotal; dx++)
			{
				var lineCtr = dx + 1;
				var vendorRef = objSalesOrder.getLineItemValue('item', 'povendor', lineCtr);
				var hasVendorRef = (!isNullOrEmpty(vendorRef)) ? true : false;
				
				if (hasVendorRef)
				{
					vendorRef = vendorRef.toString();
					
					var objRef = {};
					
					for (var xx = 0; xx < ARR_SUBLIST_ITEMS_IDS.length; xx++)
					{
						objRef['' + ARR_SUBLIST_ITEMS_IDS[xx] + ''] = objSalesOrder.getLineItemValue('item', ARR_SUBLIST_ITEMS_IDS[xx], lineCtr);
					}
					
					var isObjVendorRefExist = (isObjectExist(objPoRec['' + vendorRef + ''])) ? true : false;
					
					if (!isObjVendorRefExist)
					{
						objPoRec['' + vendorRef + ''] = {};
						objPoRec['' + vendorRef + '']['bodyfields'] = {};
						objPoRec['' + vendorRef + '']['bodyfields']['entity'] = vendorRef;
						objPoRec['' + vendorRef + '']['bodyfields']['custbody_avt_salesorder_ref'] = paramSalesOrderInternalId;
						objPoRec['' + vendorRef + '']['items'] = [];
						objPoRec['' + vendorRef + '']['items'].push(objRef)
					}
			
					if (isObjVendorRefExist)
					{
						objPoRec['' + vendorRef + '']['items'].push(objRef)
					}
				}
			}
		}
	}
		catch(ex)
	{
		objPoRec = {};
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	
	return objPoRec;
}

function generatePurchaseOrder(paramObjPurchaseOrderData)
{
	var functionName = 'generatePurchaseOrder';
	var processStr = '';
	var arrPurchaseOrderId = [];
	var objPurchaseOrderData = paramObjPurchaseOrderData
	
	try
	{
		var hasObjPurchaseOrderData = (!isNullOrEmptyObject(objPurchaseOrderData)) ? true : false;
		
		if (hasObjPurchaseOrderData)
		{
			
			for (var dx in objPurchaseOrderData)
			{
				var recPurchaseOrder = nlapiCreateRecord('purchaseorder');
				var objBodyFlds = objPurchaseOrderData[dx]['bodyfields'];
				
				for (var xj in objBodyFlds)
				{
					recPurchaseOrder.setFieldValue(xj, objBodyFlds[xj])
				}
		
				var arrObjSublistItems = objPurchaseOrderData[dx]['items'];
				var arrObjSublistItemsTotal = (!isNullOrEmpty(arrObjSublistItems)) ? arrObjSublistItems.length : 0;
				var hasSusblistItems = (arrObjSublistItemsTotal > 0) ? true : false;
				
				if (hasSusblistItems)
				{
					for (var xx = 0; xx < arrObjSublistItemsTotal; xx++)
					{
						var lineCtr = xx + 1;

						for (var jj = 0; jj < ARR_SUBLIST_ITEMS_IDS.length; jj++)
						{
							recPurchaseOrder.setLineItemValue('item', ARR_SUBLIST_ITEMS_IDS[jj], lineCtr, arrObjSublistItems[xx]['' + ARR_SUBLIST_ITEMS_IDS[jj] + '']);
						}
						
					}
					
					var recPoId = nlapiSubmitRecord(recPurchaseOrder, true);
					arrPurchaseOrderId.push(recPoId)
				}
			}
		}
		
	}
		catch(ex)
	{
		arrPurchaseOrderId = [];
		var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
		nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	
	return arrPurchaseOrderId;
}
