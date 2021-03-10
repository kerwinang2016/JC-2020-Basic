/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/ui/message', 'N/url', 'N/https', 'N/format', 'N/search', 'N/currentRecord'], function(record, msg, url, https, format, search, currentRecord) {
	function sendEmail(){

		var cr = currentRecord.get();
		var period = cr.getValue('custpage_invoiceperiod');
		var tailor = cr.getValue('custpage_customer');
		if(cr.getValue('custpage_invoiceperiod') && cr.getValue('custpage_customer')){
			https.post({
				body: {tailor:tailor, period:period},
				url:'/app/site/hosting/scriptlet.nl?script=415&deploy=1'
			})

		}
	}
	function pageInit() {
  }
	return {
		pageInit : pageInit,
		sendEmail : sendEmail
	};
});
