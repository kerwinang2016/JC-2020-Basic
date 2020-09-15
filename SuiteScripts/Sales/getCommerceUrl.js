/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NAmdConfig /SuiteScripts/amd-config.json
 */
 define(['N/record', 'N/search', 'N/log', 'N/format', 'N/file', 'N/email', 'ustyylit/integration'], 
	function runScheduledScript(record, search, log, format, file, nlemail, ustyylit){
		
		function execute(){
			//Search all orders that are pending approval
			 var responseData = "";
			  responseData = ustyylit.getStyylcartUrl();
			  			log.debug('responseData', responseData);
			// nlemail.send({
				// author: 97,
				// recipients: 97,
				// subject: 'JSON DATA for Response:',
				// body: "Response Data returned from Ustyylit \n" + responseData + "\n "
			// });
			
		}
			
		return {
		   execute:execute
		}
	}
 );

 