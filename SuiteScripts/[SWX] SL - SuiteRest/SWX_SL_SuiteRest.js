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

function main(request, response)
{
    var objOutputData = {};
    var objRequestData = {};
	nlapiLogExecution('debug', 'main', 'request.getParameter(\'inputJson\'): ' + request.getParameter('inputJson'));
	nlapiLogExecution('debug', 'main', 'request.getBody(): ' + request.getBody());

	try
    {
		/**
		if (request.getBody() == undefined) return true;
		eval('objRequestData = '+ request.getBody() + ';');
		**/
	
		if (request.getParameter('inputJson') == undefined) return true;
		eval('objRequestData = '+ request.getParameter('inputJson') + ';');
	
		
		if (objRequestData == undefined) 
		{
			 stErrMsg = 'Invalid JSON Input Data';
			 throw nlapiCreateError('Error', stErrMsg);
		}
		
		// determine which function to call
		if (objRequestData.func == undefined) 
		{
			 stErrMsg = 'You did not specified a function to call';
			 throw nlapiCreateError('Error', stErrMsg);
		}
		
		if (eval("typeof " + objRequestData.func + " == 'function'")) 
		{
			 // call function
			 try 
			 {
				eval('objOutputData = ' + objRequestData.func + '(objRequestData.data);');
			 } 
				catch (e) 
			 {
				var stErrMsg = '';
				if (e.getDetails != undefined) 
				{
					stErrMsg = e.getCode() + e.getDetails();
				}
					else 
				{
					stErrMsg = e.toString();
				}
				//throw nlapiCreateError('Error','Function "'+objRequestData.func +'" Error: ' + stErrMsg);
				objOutputData.error = stErrMsg;
			 }
		}
			else 
		{
			 stErrMsg = 'Function "' + objRequestData.func + '" does not exists!';
			 
			 //throw nlapiCreateError('Error', stErrMsg);
			 objOutputData.error = stErrMsg;
		}
	   
    }
		catch(e)
    {
		var stErrMsg = '';
		if (e.getDetails != undefined) 
		{
			stErrMsg = e.getCode() + e.getDetails();
		}
			else 
		{
			stErrMsg = e.toString();
		}
		//throw nlapiCreateError('Error','Function "'+objRequestData.func+'" Error: ' + stErrMsg);
		objOutputData.error = stErrMsg;
    }
    
	//Stringify JSON
	var jsonOut = JSON.stringify(objOutputData);
	
	
	// Send Response
	response.setContentType('JSON');
	response.write(jsonOut);    

}
