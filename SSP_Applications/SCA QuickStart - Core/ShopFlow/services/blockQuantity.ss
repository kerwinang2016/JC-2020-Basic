/*exported service*/
// ----------------
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod();

		switch (method)
		{
			case 'GET':
				var ptype = request.getParameter('producttype');
				var ptypearr = []

				var columns = [], items = [], filters=[];
				columns.push(new nlobjSearchColumn('internalid'));
				columns.push(new nlobjSearchColumn('custrecord_bqm_block'));
				columns.push(new nlobjSearchColumn('custrecord_bqm_product'));
				columns.push(new nlobjSearchColumn('custrecord_bqm_quantity'));
				filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
				if(ptype){
					if(ptype == '2-Piece-Suit'){
						ptypearr = [10];
					}else if(ptype == '3-Piece-Suit'){
						ptypearr = [9];
					}else if(ptype == 'L-2PC-Skirt'){
							ptypearr = [17];
					}else if(ptype == 'L-2PC-Pants'){
							ptypearr = [19];
					}else if(ptype == 'L-3PC-Suit'){
							ptypearr = [18];
					}else{
						switch(ptype){
							case "Jacket": ptypearr = [3]; break;
							case "Trouser": ptypearr = [4]; break;
							case "Waistcoat": ptypearr = [6]; break;
							case "Overcoat": ptypearr = [8]; break;
							case "Shirt": ptypearr = [7]; break;
							case "Short-Sleeves-Shirt": ptypearr = [12]; break;
							case "Trenchcoat": ptypearr = [13]; break;
							case "Ladies-Jacket": ptypearr = [14]; break;
							case "Ladies-Pants": ptypearr = [15]; break;
							case "Ladies-Skirt": ptypearr = [16]; break;
							case "Shorts": ptypearr = [28]; break;
							case "Morning-Coat": ptypearr = [27]; break;
							case "Shirt-Jacket": ptypearr = [30]; break;
							case "Safari-Jacket": ptypearr = [31]; break;
							case "Camp-Shirt": ptypearr = [29]; break;
						}
					}
					filters.push(new nlobjSearchFilter('custrecord_bqm_product',null,'anyof',ptypearr));
				}
				var search = nlapiCreateSearch('customrecord_block_quantity_measurement',filters,columns);
				var resultSet = search.runSearch();
				var searchid = 0;
				var res,cols;
				do{
					res = resultSet.getResults(searchid,searchid+1000);
					if(res && res.length > 0){
						if(!cols)
						cols = res[0].getAllColumns();
						for(var i=0; i<res.length; i++){
							var itemdata = {};
							for(var j=0; j<cols.length; j++){
								var jointext= cols[j].join?cols[j].join+"_":'';
								itemdata[jointext+cols[j].name] = res[i].getValue(cols[j]);
								if(res[i].getText(cols[j]))
								itemdata[jointext+cols[j].name+"text"] = res[i].getText(cols[j]);
							}
							items.push(itemdata);
						}
						searchid+=1000;
					}
				}while(res && res.length == 1000);
				Application.sendContent(items);
			break;

			default:
				// methodNotAllowedError is defined in ssp library commons.js
				Application.sendError(methodNotAllowedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}
