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


function afterSubmit_SalesOrderWebStore(type)
{
	var functionName = 'afterSubmit_SalesOrderWebStore';
	var processStr = '';
	var ctxObj = nlapiGetContext();
	var isExecutionCtxUserInterface = (!isNullOrEmpty(ctxObj.getExecutionContext()) && ctxObj.getExecutionContext() == 'userinterface') ? true : false;
	var isExecutionCtxUserEvent = (!isNullOrEmpty(ctxObj.getExecutionContext()) && ctxObj.getExecutionContext() == 'userevent') ? true : false;
	var isExecutionCtxWebstore = (!isNullOrEmpty(ctxObj.getExecutionContext()) && ctxObj.getExecutionContext() == 'webstore') ? true : false;

	var isSystemUser = (!isNullOrEmpty(ctxObj.getUser()) && ctxObj.getUser() == -4) ? true : false;

	var isCreateMode = (!isNullOrEmpty(type) && type == 'create') ? true : false;
	var isEditMode = (!isNullOrEmpty(type) && type == 'edit') ? true : false;
	var isViewMode = (!isNullOrEmpty(type) && type == 'view') ? true : false;
	var recType = nlapiGetRecordType();
	var recId = nlapiGetRecordId();
	var objSalesOrderRef = {};
	var sublistItemCountTotal = 0;
	var hasSublistItem = false;

	try
	{
		// Sales Order is created in web store.
		processStr = 'Sales Order is created in web store.';
		
		if (isExecutionCtxWebstore && isCreateMode)
		{
			objSalesOrderRef = nlapiLoadRecord(recType, recId);
			sublistItemCountTotal = (!isNullOrEmpty(objSalesOrderRef.getLineItemCount('item'))) ? objSalesOrderRef.getLineItemCount('item') : 0;
			hasSublistItem = (sublistItemCountTotal != 0) ? true : false;
			
			// Generate the Purchase Order object data
			processStr = 'Generate the Purchase Order object data';
			var objPurchaseOrderData = getObjPurchaseOrderData(objSalesOrderRef, recId);
			var arrPurchaseOrderIds = generatePurchaseOrder(objPurchaseOrderData);
			nlapiLogExecution('debug', functionName, JSON.stringify(arrPurchaseOrderIds))
		}
	
	}
		catch(ex)
	{
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
}
