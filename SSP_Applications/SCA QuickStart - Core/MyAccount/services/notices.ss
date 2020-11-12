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
				var id = request.getParameter('internalid');
				var page = request.getParameter('page');

				if(!id){
					var noticesList = recordFunctions.getNoticesList(null, page);
					Application.sendContent(noticesList);
				}else{
					var noticesDetails = recordFunctions.getNoticesList(id);
					Application.sendContent(noticesDetails);
				}
			break;
			case 'PUT':
				var id = request.getParameter('internalid');
				var data = JSON.parse(request.getBody() || '{}');
				if(id){
					recordFunctions.updateNoticesBoardActivities(id, data);
					var noticesDetails = recordFunctions.getNoticesList(data.custrecord_nba_noticeboard_internalid);
					Application.sendContent(noticesDetails);
				}
				break;
			default:
				Application.sendError(methodNotAllowedError);
		}
	}
	catch (e)
	{
		nlapiLogExecution('debug','error',e.message);
		Application.sendError(e);
	}
}

var recordFunctions = {
	updateNoticesBoardActivities: function(id, data){
		// delete data.internalid;
		// var keys = Object.keys(data);
		// //var values = Object.values(data);
		// var vals = [];
		// for(var i=0;i<keys.length;i++){
			// vals.push(data[keys[i]]);
		// }
		nlapiLogExecution('debug','data',JSON.stringify(data));
		var keys = [
			'custrecord_nba_read_notice'
		];
		var vals = [
			data.custrecord_nba_noticeboard_custrecord_nba_read_notice
		];
		nlapiSubmitField('customrecord_noticeboard_activities',data.custrecord_nba_noticeboard_internalid, keys, vals);
	},
	getNoticesList: function(id, page){
		var columns = [], filters=[];
		columns.push(new nlobjSearchColumn('internalid'));
		columns.push(new nlobjSearchColumn('custrecord_nb_header'));
		columns.push(new nlobjSearchColumn('custrecord_nb_message'));
		columns.push(new nlobjSearchColumn('custrecord_nb_date'));
		columns.push(new nlobjSearchColumn('custrecord_nb_highimportance'));
		columns.push(new nlobjSearchColumn('custrecord_nb_attachmentfile'));
		columns.push(new nlobjSearchColumn('custrecord_nb_fileurl'));
		columns.push(new nlobjSearchColumn('custrecord_nb_hide'));
		columns.push(new nlobjSearchColumn('custrecord_nb_tailors'));
		columns.push(new nlobjSearchColumn('internalid','custrecord_nba_noticeboard'));
		columns.push(new nlobjSearchColumn('custrecord_nb_filename'));
		columns.push(new nlobjSearchColumn('custrecord_nba_downloaded_content','custrecord_nba_noticeboard'));
		columns.push(new nlobjSearchColumn('custrecord_nba_read_notice','custrecord_nba_noticeboard'));
		columns.push(new nlobjSearchColumn('custrecord_nba_tailor','custrecord_nba_noticeboard'));
		columns.push(new nlobjSearchColumn('custrecord_nba_hidenotice','custrecord_nba_noticeboard'));
		if(id){
			filters.push(new nlobjSearchFilter('internalid','custrecord_nba_noticeboard','anyof',id));
		}

		filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
		filters.push(new nlobjSearchFilter('custrecord_nba_tailor','custrecord_nba_noticeboard','anyof', nlapiGetUser()));
		filters.push(new nlobjSearchFilter('custrecord_nb_hide',null,'is','F'));

		var search = nlapiCreateSearch('customrecord_notice_board',filters,columns);
		var resultSet = search.runSearch();
		var searchid = 0, resultsperpage = 20;
		var res,cols, notices = [];

		do{
			res = resultSet.getResults(searchid,searchid+1000);
			if(res && res.length > 0){
				if(!cols)
				cols = res[0].getAllColumns();
				for(var i=0; i<res.length; i++){
					var noticesdata = {};
					for(var j=0; j<cols.length; j++){
						var jointext= cols[j].join?cols[j].join+"_":'';
						noticesdata[jointext+cols[j].name] = res[i].getValue(cols[j]);
						if(res[i].getText(cols[j]))
						noticesdata[jointext+cols[j].name+"text"] = res[i].getText(cols[j]);
					}
					notices.push(noticesdata);
				}
				searchid += res.length;
			}
		}while(res && res.length == 1000);

		if(!id){
			var page = page ? page:1;
			var range_start = ((page-1) * resultsperpage)
			,	range_end = (page * resultsperpage);
			notices = notices.slice(range_start, range_end);
			returnObj = {
				records: notices,
				page: page,
				recordsPerPage: resultsperpage,
				totalRecordsFound: searchid
			}
			return returnObj;
		}else{
			return notices[0];
		}
	}
}
