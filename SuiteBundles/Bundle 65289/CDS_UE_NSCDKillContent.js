function afterSubmit(){


	var websiteIds = nlapiGetContext().getSetting('SCRIPT', 'custscript_cds_ue_kill_website_ids');
	var relSvcPath = nlapiGetContext().getSetting('SCRIPT', 'custscript_cds_ue_kill_service');
	var contentId = nlapiGetNewRecord().getId();
	var websiteIdsArray = websiteIds.split(',');
	
	for (var i=0; i< websiteIdsArray.length; i++){
	
		try {
			var site = nlapiLoadRecord('website',websiteIdsArray[i]);
			var domainCount = site.getLineItemCount('shoppingdomain');
				
			if( domainCount > 0 ){
			
				for(var j=1; j<= domainCount; j++){
					var domain = site.getLineItemValue('shoppingdomain', 'domain', j);
					var svcRoute = 'http://' + domain + relSvcPath;
					
					svcRoute+= (svcRoute.indexOf('?')!==-1 ? '&': '?') + ('content_id=' + contentId);
					try {
						var response = nlapiRequestURL( svcRoute );
					} catch(e) {
						nlapiLogExecution('DEBUG','Route:' + svcRoute + ' Content:' + contentId, e);
					}
					
					nlapiLogExecution('DEBUG','Route:' + svcRoute + ' Content:' + contentId, response);
				}
				
			} else {
				break;
			}
		} catch (e){
			nlapiLogExecution('ERROR','Content:' + contentId + ' + siteId:' + websiteIdsArray[i] , e);
		} 
		
	}

}
