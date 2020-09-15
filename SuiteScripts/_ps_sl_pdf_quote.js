/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Apr 2016     kduran
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suiteletPdfQuote(request, response){
		
		var requestData = request.getParameter("data");
		
		nlapiLogExecution("DEBUG", "Test", requestData);
		
		
}
