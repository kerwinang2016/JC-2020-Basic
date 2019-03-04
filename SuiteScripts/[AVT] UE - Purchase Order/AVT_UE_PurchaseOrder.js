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


function afterSubmit_PurchaseOrder(type)
{
	var functionName = 'afterSubmit_PurchaseOrder';
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

	try
	{
		if (isExecutionCtxUserInterface && isEditMode)
		{
			var objRec = nlapiLoadRecord(recType, recId);
			var objSoLineMapping = getObjSoLineKey(objRec);
			var updateSoLineKey = updateSalesOrderLineKey(objRec, objSoLineMapping)
		}
	
	}
		catch(ex)
	{
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
}
