/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2015     rvindal
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getBrandLogo(request, response){
	try {
		var custID = request.getParameter('id'),
			result = new Object(), 
			imageRec = nlapiLoadFile(nlapiLookupField("customer", custID, "custentity_taylor_logo")),
			imageURL = imageRec.getURL(),
			currency = nlapiLookupField("customer", custID, "custentity_cust_currency");
			
		
		nlapiLogExecution('DEBUG', 'ID', custID);
      nlapiLogExecution('DEBUG', 'currency', currency);

		result.cur = currency;

		if(imageURL && custID !== "undefined"){
			result.status = true;
			result.url = imageURL;
			
			try	{
				var bannerImageRec = nlapiLoadFile(nlapiLookupField("customer", custID, "custentity_tailor_banner"))
				,	bannerImageURL = bannerImageRec.getURL();

				if(bannerImageURL) {
					result.bnrUrl = bannerImageURL;
				} else {
					result.bnrUrl = "";
				}
				nlapiLogExecution('DEBUG', 'Banner', bannerImageRec);
			} catch (ex) {
				result.bnrUrl = "";
				var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
       			nlapiLogExecution('Debug', 'Error encountered', 'Error: ' + errorStr);
			}

		} else {
			result.status = false;
			result.url = "";
		}

		
		response.setContentType("JAVASCRIPT");
		response.write(JSON.stringify(result));
	} catch(ex) {
		var errorStr = (ex.getCode != null) ? ex.getCode() + '\n' + ex.getDetails() + '\n' : ex.toString();
        nlapiLogExecution('Debug', 'Error encountered', 'Error: ' + errorStr);
	}
}
