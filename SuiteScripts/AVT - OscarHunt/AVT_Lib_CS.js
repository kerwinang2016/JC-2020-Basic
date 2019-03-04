/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Oct 2016     gauravsrivastava
 *
 */

var URL_ApproveSO = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=162&deploy=1';
var URL_ApproveSOLine = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=163&deploy=1';
var URL_ApproveSOLineList  = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=158&deploy=1';
var URL_SavePOCMT  = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=164&deploy=1';
var URL_SavePOFab = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=165&deploy=1';
var URL_DashboardRequest = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=179&deploy=1';
var DATA_Approve =  new Array();

var ApproveSO = function()
{
	console.log( "Approve SO");	
	
	var count = nlapiGetLineItemCount( 'custpage_subslist1');
	for( var x=1; x<=count;x++)
	{
		var isapp = nlapiGetLineItemValue( 'custpage_subslist1', 'custpage_choose', x);
		if( isapp == 'T')
		{
			var object = new Object();
			object.internalid  = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			object.id = x;
			DATA_Approve.push( object);
			console.log( "Added", JSON.stringify( object));
		}
	}
	
	nlapiDisableField( 'custpage_btapprve', true);
	
	Run_ApproveSO();
};

var SaveSO = function()
{
	console.log( "Save SO..");
	
	
	var count = nlapiGetLineItemCount( 'custpage_subslist_app');
	for( var x=1; x<=count; x++)
	{
		var isapp = nlapiGetLineItemValue( 'custpage_subslist_app', 'custpage_choose', x);
		if( isapp == 'T')
		{
			var obj = new Object();
			obj.internalid  = nlapiGetLineItemValue( 'custpage_subslist_app', 'internalid', x);
			//alert( obj.soid );
			obj.id = x; //nlapiGetLineItemValue( 'custpage_subslist1', '', x);
			obj.soid  = nlapiGetLineItemValue( 'custpage_subslist_app', 'formulatext', x );
			obj.lineno =  nlapiGetLineItemValue( 'custpage_subslist_app', 'lineuniquekey', x);
			obj.item =  nlapiGetLineItemValue( 'custpage_subslist_app', 'item', x);
			obj.cmtno =  nlapiGetLineItemValue( 'custpage_subslist_app', 'custcol_avt_cmtno', x);
			obj.save = true;
			
			DATA_Approve.push( obj);
			console.log( "Added", JSON.stringify( obj));
		}
	}
	
	nlapiDisableField( 'custpage_btsave', true);
	
	Run_SaveSO();
};


var ApproveSOLine = function()
{
	//alert( (new Date()).toString() );
	
	console.log( "Approve SOLine");
	var count = nlapiGetLineItemCount( 'custpage_subslist_app');
	for( var x=1; x<=count; x++)
	{
		var isapp = nlapiGetLineItemValue( 'custpage_subslist_app', 'custpage_choose', x);
		if( isapp == 'T')
		{
			var obj = new Object();
			obj.internalid  = nlapiGetLineItemValue( 'custpage_subslist_app', 'internalid', x);
			//alert( obj.soid );
			obj.id = x; //nlapiGetLineItemValue( 'custpage_subslist1', '', x);
			obj.soid  = nlapiGetLineItemValue( 'custpage_subslist_app', 'custcol_so_id', x );
			obj.lineno =  nlapiGetLineItemValue( 'custpage_subslist_app', 'lineuniquekey', x);
			obj.item =  nlapiGetLineItemValue( 'custpage_subslist_app', 'item', x);
			
			DATA_Approve.push( obj);
			console.log( "Added", JSON.stringify( obj));
		}
	}
	
	nlapiDisableField( 'custpage_btapprve', true);
	
	Run_ApproveSOLine();
};

var FilterSOLine = function()
{
	var itemid  = nlapiGetFieldValue( 'custpage_item');
	if( itemid == null || itemid  == '' )
	{
		alert( 'Please select an item to filter..');
		return;
	}else
	{
		window.onbeforeunload = null;
		var url = nlapiResolveURL('SUITELET','158','1')
		window.location.href = url + '&itemid=' + itemid;
	}
};

var Run_ApproveSO = function()
{
	// console.log( 'url ' + URL_ApproveSO);
	// console.log( 'DATA ' + JSON.stringify(DATA_Approve));
	var url = nlapiResolveURL('SUITELET','162','1')
	if( DATA_Approve[0] != null )
	{
	  jQuery.ajax({
          type : 'POST',
          url : url,
          data : DATA_Approve[0],
          success : Run_ApproveSOResponse,
          error : Run_ApproveSOResponseError,
          dataType : 'json',
      });
	}else
	{
		console.log( "Nothing to send...All finished");
	}
};

var Run_ApproveSOLine = function()
{
	
	// console.log( 'url ' + URL_ApproveSOLine);
	// console.log( 'Sending ...DATA ' + JSON.stringify(DATA_Approve));
	var url = nlapiResolveURL('SUITELET','163','1');
	if( DATA_Approve[0] != null )
	{
	  jQuery.ajax({
          type : 'POST',
          url : url,
          data : DATA_Approve[0],
          success : Run_ApproveSOLineResponse,
          error : Run_ApproveSOLineResponseError,
          dataType : 'json',
      });
	}else
	{
		console.log( "Nothing to send...All finished");
	}
	
};


var Run_SaveSO = function()
{
	
	// console.log( 'url ' + URL_ApproveSOLine);
	// console.log( 'Sending ...DATA ' + JSON.stringify(DATA_Approve));
	var url = nlapiResolveURL('SUITELET','163','1');
	if( DATA_Approve[0] != null )
	{
	  jQuery.ajax({
          type : 'POST',
          url : url,
          data : DATA_Approve[0],
          success : Run_SaveSOResponse,
          error : Run_SaveSOResponseError,
          dataType : 'json',
      });
	}else
	{
		console.log( "Nothing to send...All finished");
	}
	
};

var Run_ApproveSOResponse = function(response, textStatus, jqXHR)
{
	if( response)
	{
		var data  =  response;
		if( data.status == false || data.status == 'false') 
		{
			nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.id, 'Error processing');
		}else
		{
			nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.id, 'Processed');
			//jQuery( '#item_' + data.id).attr('checked',false);
			//jQuery('html, body').animate({ scrollTop:  jQuery( '#item_' + data.id).offset().top - 50 }, 'slow');
			//jQuery( '#item_' + data.id).animate( { scrollTop: jQuerytarget.offset().top }, 1000 );

		}
		
	}

	DATA_Approve.shift();
	Run_ApproveSO();
};

var Run_ApproveSOResponseError = function(jqXHR, textStatus, errorThrown)
{
	console.error('Failed to import in ajax request: ' + textStatus + '  '
            + errorThrown + '\n[Response]\n' + jqXHR.responseText);
	DATA_Approve.shift();
	Run_ApproveSO();
};

var Run_ApproveSOLineResponse = function(response, textStatus, jqXHR)
{
	console.log( "Run_ApproveSOLineResponse... processing ");
	if( response)
	{
		var data  =  response;
		console.log( ' data.... ' + JSON.stringify( data ));
		
		if( data.status == false || data.status == 'false') 
		{
			nlapiSetLineItemValue( 'custpage_subslist_app', 'custpage_status', data.id, 'Error processing');
		}else
		{
			nlapiSetLineItemValue( 'custpage_subslist_app', 'custpage_status', data.id, 'Processed');
			//jQuery( '#item_' + data.id).attr('checked',false);
			//jQuery('html, body').animate({ scrollTop:  jQuery( '#item_' + data.id).offset().top - 50 }, 'slow');
			//jQuery( '#item_' + data.id).animate( { scrollTop: jQuerytarget.offset().top }, 1000 );

		}
		
	}

	DATA_Approve.shift();
	Run_ApproveSOLine();
};

var Run_ApproveSOLineResponseError = function(jqXHR, textStatus, errorThrown)
{
	console.error('Failed to import in ajax request: ' + textStatus + '  '
            + errorThrown + '\n[Response]\n' + jqXHR.responseText);
	DATA_Approve.shift();
	Run_ApproveSOLine();
};

var Run_SaveSOResponse = function(response, textStatus, jqXHR)
{
	console.log( "Run_SaveSOResponse... processing ");
	if( response)
	{
		var data  =  response;
		console.log( ' data.... ' + JSON.stringify( data ));
		
		if( data.status == false || data.status == 'false') 
		{
			nlapiSetLineItemValue( 'custpage_subslist_app', 'custpage_status', data.id, 'Error processing');
		}else
		{
			nlapiSetLineItemValue( 'custpage_subslist_app', 'custpage_status', data.id, 'Processed');
			//jQuery( '#item_' + data.id).attr('checked',false);
			//jQuery('html, body').animate({ scrollTop:  jQuery( '#item_' + data.id).offset().top - 50 }, 'slow');
			//jQuery( '#item_' + data.id).animate( { scrollTop: jQuerytarget.offset().top }, 1000 );

		}
		
	}

	DATA_Approve.shift();
	Run_SaveSO();
};

var Run_SaveSOResponseError = function(jqXHR, textStatus, errorThrown)
{
	console.error('Failed to import in ajax request: ' + textStatus + '  '
            + errorThrown + '\n[Response]\n' + jqXHR.responseText);
	DATA_Approve.shift();
	Run_SaveSO();
};

var POFilter = function()
{
	var vendor =  nlapiGetFieldValue( 'custpage_vendor');
	vendor == null? vendor =  '': null;
	{
		var url = "";
		if(window.location.search.indexOf('script=159') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_avt_po_approval_fabric', '1');
		else if(window.location.search.indexOf('script=184') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinesfabricusa', '1');
		else if(window.location.search.indexOf('script=214') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinesfabricuk', '1');
		else
		url = window.location.href;
		url = url +='&vendor='+vendor;
		window.onbeforeunload = null;
		window.location.href= url;
	}
};

var POCMTFilter = function()
{
	var url = '';
	if(window.location.search.indexOf('script=160') != -1)
	url =  nlapiResolveURL( 'SUITELET', 'customscript_avt_po_approval_cmt', '1');
	else if(window.location.search.indexOf('script=185') != -1)	
	url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinescmt_usa', '1');
	else if(window.location.search.indexOf('script=215') != -1)
	url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinescmt_uk', '1');
	else
	url = window.location.href;
	var expdate =  nlapiGetFieldValue( 'custpage_expecteddatesent');
	var cmtstatus =  nlapiGetFieldValues( 'custpage_cmtstatus');
	var parameters = "";
	if(expdate)
	parameters +='&expecteddatesent='+escape(expdate);
	if(cmtstatus.length>0)
	parameters += '&cmtstatus='+cmtstatus.toString();
			
		url = url +parameters;
		window.onbeforeunload = null;
		window.location.href= url;	
};

var POCMTBilledFilter = function()
{
	var url = '';
	if(window.location.search.indexOf('script=176') != -1)
	url =  nlapiResolveURL( 'SUITELET', 'customscript_avt_cmt_pos_billed', '1');
	else if(window.location.search.indexOf('script=188') != -1)
	url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinescmtbilledusa', '1');
	else if(window.location.search.indexOf('script=216') != -1)
	url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinescmtbilleduk', '1');
	else
	url = window.location.href;
	var expdate =  nlapiGetFieldValue( 'custpage_expecteddatesent');	
	var parameters = "";
	if(expdate)
	parameters +='&expecteddatesent='+escape(expdate);
			
		url = url +parameters;
		window.onbeforeunload = null;
		window.location.href= url;	
};

var POFilterBilled = function()
{
	var vendor =  nlapiGetFieldValue( 'custpage_vendor');
	vendor == null? vendor =  '': null;
	
	{
		var url = '';
		if(window.location.search.indexOf('script=175') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_avt_pos_billed_fab', '1');
		else if(window.location.search.indexOf('script=186') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinesbilledusa', '1');
		else if(window.location.search.indexOf('script=217') != -1)
		url =  nlapiResolveURL( 'SUITELET', 'customscript_run_polinesfabricbilleduk', '1');
		else
		url = window.location.href;
		
		url = url +='&vendor='+vendor;
		window.onbeforeunload = null;
		window.location.href= url;
	}
};
var getCMTLines = function(line, data , arg){
	var count = nlapiGetLineItemCount(line);
	for( var x=1; x<=count;x++)
	{
		var isapp = nlapiGetLineItemValue( line, 'custpage_choose', x);
		if( isapp == 'T')
		{
			var internalid = nlapiGetLineItemValue( line, 'internalid', x);
			var index = data.transactions.map(function(y) {return y.internalid; }).indexOf(internalid);
			if(index == -1){
			var transactionAdd = {};
			transactionAdd.internalid = nlapiGetLineItemValue( line, 'internalid', x);
			transactionAdd.items = [];
			}
			var object = new Object();
			object.internalid  = nlapiGetLineItemValue( line, 'internalid', x);
			object.id = x;
			object.lineno = nlapiGetLineItemValue( line, 'lineuniquekey', x);
			object.cmtstatus = nlapiGetLineItemValue( line, 'custcol_avt_cmt_status', x);
			object.item  =  nlapiGetLineItemValue( line, 'item', x);
			object.fab_item  =  nlapiGetLineItemValue( line, 'custpage_fab_item', x);
			object.cmt_datesent  =  nlapiGetLineItemValue( line, 'custcol_avt_cmt_date_sent', x);
			object.cmt_tracking  =  nlapiGetLineItemValue( line, 'custcol_avt_cmt_tracking', x);
			object.soid  = nlapiGetLineItemValue( line, 'createdfrom', x);
			object.notes = nlapiGetLineItemValue(line, 'custcol_column_notes',x)
			object.cmtdelivery = nlapiGetLineItemValue(line, 'date_sent',x);
			object.sublist = line;
			object.bill = false;
			object.custcol_so_id = nlapiGetLineItemValue(line,'custcol_so_id',x);
			if( arg == true)
			{
				object.bill = true;
				//nlapiDisableButton( '')
			}
			// DATA_Approve.push( object);
			if(index == -1){
				//new
				transactionAdd.items.push(object);
				data.transactions.push(transactionAdd);
			}
			else{
				//not new
				data.transactions[index].items.push(object);
			}
			if(data.transactions.length%10 == 0 && data.transactions.length>0){
			DATA_Approve.push(data);
			data = {};
			if(arg) data.bill = true;
			data.transactions = [];
			data.action = "savecmt";
			}
		}
		
	}
	return data;
}
var SavePOCMT = function( arg)
{
	//console.log( "Save PO CMT");
	var data = {};
	if(arg) data.bill = true;
	data.transactions = [];
	data.action = "savecmt";
	data = getCMTLines('custpage_subslist1', data, arg);
	data = getCMTLines('custpage_subslist2', data, arg);
	data = getCMTLines('custpage_subslist3', data, arg);
	data = getCMTLines('custpage_subslist4', data, arg);
	data = getCMTLines('custpage_subslist5', data, arg);
	data = getCMTLines('custpage_subslist6', data, arg);
	data = getCMTLines('custpage_subslist7', data, arg);
	data = getCMTLines('custpage_subslist8', data, arg);
	data = getCMTLines('custpage_subslist9', data, arg);
	data = getCMTLines('custpage_subslist10', data, arg);
	data = getCMTLines('custpage_subslist11', data, arg);
	data = getCMTLines('custpage_subslist12', data, arg);
	data = getCMTLines('custpage_subslist13', data, arg);
	data = getCMTLines('custpage_subslist14', data, arg);
	if( arg ==  true )
	{
		nlapiDisableField( 'custpage_btapprve_bill', true);	
	}else
	{
		nlapiDisableField( 'custpage_btapprve', true);
	}
	//console.log(data)
	if(data.transactions.length!= 0)
		DATA_Approve.push(data);
	Run_SavePOCMT();
	
};

var SavePOFab = function(arg)
{
	console.log( "Save PO Fab");
	var count = nlapiGetLineItemCount( 'custpage_subslist1');
	var data = {};
	if(arg) data.bill = true;
	data.transactions = [];
	data.action = "savefabric";
	if(data.bill){
		for( var x=1; x<=count;x++)
		{
			var isapp = nlapiGetLineItemValue( 'custpage_subslist1', 'custpage_choose', x);
			if( isapp == 'T')
			{
				if(nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_avt_fabric_status', x)!= '3'){
					alert('You cannot bill orders unless the status is set to shipped');
					return;
				}
				if(!nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_avt_tracking', x)){
					alert('You cannot bill orders unless the tracking is set"');
					return;
				}
			}
		}
	}
	for( var x=1; x<=count;x++)
	{
		var isapp = nlapiGetLineItemValue( 'custpage_subslist1', 'custpage_choose', x);
		if( isapp == 'T')
		{
			//SearchTransactions if there is already an internalid for that po
			var internalid = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			var index = data.transactions.map(function(y) {return y.internalid; }).indexOf(internalid);
			if(index == -1){
			var transactionAdd = {};
			transactionAdd.internalid = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			transactionAdd.items = [];
			}
			//objToSend.transactions.push(transactionAdd);			
			
			var object = new Object();
			object.internalid  = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			object.id = x;
			object.lineno = nlapiGetLineItemValue( 'custpage_subslist1', 'lineuniquekey', x);
			object.item = nlapiGetLineItemValue( 'custpage_subslist1', 'item', x);
			object.datesent = nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_avt_date_sent', x);
			object.fabstatus = nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_avt_fabric_status', x);
			object.tracking = nlapiGetLineItemValue('custpage_subslist1', 'custcol_avt_tracking', x);
			object.custcol_so_id = nlapiGetLineItemValue('custpage_subslist1','custcol_so_id',x);
			if(arg == true)
			{
				object.bill = true;
			}
			//DATA_Approve.push(object);
			if(index == -1){
				//new
				transactionAdd.items.push(object);
				data.transactions.push(transactionAdd);
			}
			else{
				//not new
				data.transactions[index].items.push(object);
			}
			console.log("Added", JSON.stringify( object));
			if(data.transactions.length%10 == 0 && data.transactions.length>0){
			DATA_Approve.push(data);
			data = {};
			if(arg) data.bill = true;
			data.transactions = [];
			data.action = "savefabric";
		}
		}
		
	}
	if( arg ==  true )
	{
		nlapiDisableField( 'custpage_btapprve_bill', true);	
	}else
	{
		nlapiDisableField( 'custpage_btapprve', true);
	}
	if(data.transactions.length != 0)
		DATA_Approve.push( data);
	Run_SavePOFab();
};

var SavePOLining = function(arg)
{	
	var count = nlapiGetLineItemCount( 'custpage_subslist1');
	var data = {};
	if(arg) data.bill = true;
	else data.bill = false;
	data.transactions = [];
	data.action = "savelining";
	if(data.bill){
		for( var x=1; x<=count;x++)
		{
			var isapp = nlapiGetLineItemValue( 'custpage_subslist1', 'custpage_choose', x);
			if( isapp == 'T')
			{
				if(nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_cmt_lining_status', x)!= '3'){
					alert('You cannot bill orders unless the status is set to shipped');
					return;
				}
				if(!nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_cmt_lining_tracking', x)){
					alert('You cannot bill orders unless the tracking is set"');
					return;
				}
			}
		}
	}
	for( var x=1; x<=count;x++)
	{
		var isapp = nlapiGetLineItemValue( 'custpage_subslist1', 'custpage_choose', x);
		if( isapp == 'T')
		{
			//SearchTransactions if there is already an internalid for that po
			var internalid = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			var index = data.transactions.map(function(y) {return y.internalid; }).indexOf(internalid);
			if(index == -1){
			var transactionAdd = {};
			transactionAdd.internalid = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			transactionAdd.items = [];
			}
			var object = new Object();
			object.internalid  = nlapiGetLineItemValue( 'custpage_subslist1', 'internalid', x);
			object.id = x;
			object.lineno = nlapiGetLineItemValue( 'custpage_subslist1', 'lineuniquekey', x);
			object.item = nlapiGetLineItemValue( 'custpage_subslist1', 'item', x);			
			object.custcol_cmt_lining_datesent = nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_cmt_lining_datesent', x);
			object.custcol_cmt_lining_status = nlapiGetLineItemValue( 'custpage_subslist1', 'custcol_cmt_lining_status', x);
			object.custcol_cmt_lining_status_text = nlapiGetLineItemText( 'custpage_subslist1', 'custcol_cmt_lining_status', x);
			object.custcol_cmt_lining_tracking = nlapiGetLineItemValue('custpage_subslist1', 'custcol_cmt_lining_tracking', x);
			object.custcol_so_id = nlapiGetLineItemValue('custpage_subslist1','custcol_so_id',x);
			object.name = nlapiGetLineItemValue('custpage_subslist1','clothtype',x);
			object.quantity = nlapiGetLineItemValue('custpage_subslist1','lining_quantity',x);
			object.code = nlapiGetLineItemValue('custpage_subslist1','lining_code',x);
			if(arg == true)
			{
				object.bill = true;
			}
			else{
				object.bill = false;
			}
			if(index == -1){
				transactionAdd.items.push(object);
				data.transactions.push(transactionAdd);
			}
			else{
				data.transactions[index].items.push(object);
			}
			if(data.transactions.length%10 == 0 && data.transactions.length>0){
			DATA_Approve.push(data);
			data = {};
			if(arg) data.bill = true;
			else data.bill = false;
			data.transactions = [];
			data.action = "savelining";
		}
		}
		
	}
	if( arg ==  true )
	{
		nlapiDisableField( 'custpage_btapprve_bill', true);	
	}else
	{
		nlapiDisableField( 'custpage_btapprve', true);
	}
	if(data.transactions.length != 0)
		DATA_Approve.push( data);
	Run_SavePOLining();
};
var Run_SavePOLining = function()
{
	if( DATA_Approve[0] != null )
	{
		console.log(DATA_Approve[0]);
		var url = nlapiResolveURL('SUITELET','179','1')
		var xhr = new XMLHttpRequest();
		xhr.open('POST',url);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.send(JSON.stringify(DATA_Approve[0]));
		xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
				Run_SavePOLiningResponse_rest(xhr);
			}
		}
	}else
	{
		console.log( "Nothing to send...All finished");
	}
};
var Run_SavePOLiningResponse_rest = function(response){
	
	if(response)
	{
		var data  = JSON.parse(response.responseText);
		
		for(var i =0; i<data.transactions.length; i++){
			if( data.transactions[i].status == false || data.transactions[i].status == 'false')
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].items[j].id, 'Error processing');
				}
			}else
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].items[j].id, 'Processed');
				}
			}
		}
	}
	DATA_Approve.shift();
	Run_SavePOLining();
}

var Run_SavePOFabResponse_rest = function(response){
	
	if(response)
	{
		var data  = JSON.parse(response.responseText);
		
		for(var i =0; i<data.transactions.length; i++){
			if( data.transactions[i].status == false || data.transactions[i].status == 'false')
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].items[j].id, 'Error processing');
				}
			}else
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].items[j].id, 'Processed');
				}
			}
		}
	}
	DATA_Approve.shift();
	Run_SavePOFab();
}


var Run_SavePOCMT = function()
{
	// console.log( 'url ' + URL_SavePOCMT);
	// console.log( 'DATA ' + JSON.stringify(DATA_Approve));
	
	if( DATA_Approve[0] != null )
	{
	  var url = nlapiResolveURL('SUITELET','179','1')
	  var xhr = new XMLHttpRequest();
		xhr.open('POST',url);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.send(JSON.stringify(DATA_Approve[0]));
		xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
				Run_SavePOCMTResponse_rest(xhr);
				// console.log(xhr);
				// console.log(xhr.responseText);
			}
		}
	}else
	{
		console.log( "Nothing to send...All finished");
	}
};

var Run_SavePOCMTResponse = function(response, textStatus, jqXHR)
{
	if( response)
	{
		var data  =  response;
		if( data.status == false || data.status == 'false') 
		{
			nlapiSetLineItemValue( data.sublist, 'custpage_status', data.id, 'Error processing');
		}else
		{
			nlapiSetLineItemValue( data.sublist, 'custpage_status', data.id, 'Processed');
			//jQuery( '#item_' + data.id).attr('checked',false);
			//jQuery('html, body').animate({ scrollTop:  jQuery( '#item_' + data.id).offset().top - 50 }, 'slow');
			//jQuery( '#item_' + data.id).animate( { scrollTop: jQuerytarget.offset().top }, 1000 );

		}
		
	}

	DATA_Approve.shift();
	Run_SavePOCMT();
};

var Run_SavePOCMTResponseError = function(jqXHR, textStatus, errorThrown)
{
	console.error('Failed to import in ajax request: ' + textStatus + '  '
            + errorThrown + '\n[Response]\n' + jqXHR.responseText);
	DATA_Approve.shift();
	Run_SavePOCMT();
};



var Run_SavePOFab = function()
{
	// console.log( 'url ' + URL_SavePOFab);
	// console.log( 'DATA ' + JSON.stringify(DATA_Approve));
	
	if( DATA_Approve[0] != null )
	{
	  // jQuery.ajax({
          // type : 'POST',
          // url : URL_SavePOFab,
          // data : DATA_Approve[0],
          // success : Run_SavePOFabResponse,
          // error : Run_SavePOFabResponseError,
          // dataType : 'json',
      // });
		var xhr = new XMLHttpRequest();
		var url = nlapiResolveURL('SUITELET','179','1')
		xhr.open('POST',url);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.send(JSON.stringify(DATA_Approve[0]));
		xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
				Run_SavePOFabResponse_rest(xhr);
				// console.log(xhr);
				// console.log(xhr.responseText);
			}
		}
	}else
	{
		console.log( "Nothing to send...All finished");
	}
};
var Run_SavePOCMTResponse_rest = function(response){
	
	if( response)
	{
		var data  = JSON.parse(response.responseText);
		
		for(var i =0; i<data.transactions.length; i++){
			if( data.transactions[i].status == false || data.transactions[i].status == 'false')
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( data.transactions[i].items[j].sublist, 'custpage_status', data.transactions[i].items[j].id, 'Error processing');
				}
			}else
			{
				for(var j=0; j<data.transactions[i].items.length;j++){
					nlapiSetLineItemValue( data.transactions[i].items[j].sublist, 'custpage_status', data.transactions[i].items[j].id, 'Processed');
				}
				//jQuery( '#item_' + data.id).attr('checked',false);
				//jQuery('html, body').animate({ scrollTop:  jQuery( '#item_' + data.id).offset().top - 50 }, 'slow');
				//jQuery( '#item_' + data.id).animate( { scrollTop: jQuerytarget.offset().top }, 1000 );
			}
		}
	}
	DATA_Approve.shift();
	Run_SavePOCMT();
}
var Run_SavePOFabResponse = function(response, textStatus, jqXHR)
{
	if( response)
	{
		var data  =  response;
		nlapiLogExecution('audit','data response',data);
		for(var i =0; i<data.transactions.length; i++){
			if( data.transactions[i].status == false || data.transactions[i].status == 'false')
			{
				nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].id, 'Error processing');
			}else
			{
				nlapiSetLineItemValue( 'custpage_subslist1', 'custpage_status', data.transactions[i].id, 'Processed');
			}
		}
	}

	DATA_Approve.shift();
	Run_SavePOFab();
};

var Run_SavePOFabResponseError = function(jqXHR, textStatus, errorThrown)
{
	console.error('Failed to import in ajax request: ' + textStatus + '  '
            + errorThrown + '\n[Response]\n' + jqXHR.responseText);
	DATA_Approve.shift();
	Run_SavePOCMT();
};


function fieldchanged(type, name, line){
	if(type == 'custpage_subslist1' || type == 'custpage_subslist2' || type == 'custpage_subslist3' || 
	type == 'custpage_subslist4' || type == 'custpage_subslist5' || type == 'custpage_subslist6' || type == 'custpage_subslist7' || type == 'custpage_subslist8'){
		if(name == 'custcol_avt_cmt_date_sent'){
			var sentdate = nlapiGetLineItemValue(type,name,line);
			var dayOfWeek = 5;//Friday
			var date = nlapiStringToDate(sentdate);
			if(date.getDay() == 6 || date.getDay() == 0 || date.getDay() == 1 || date.getDay() == 2) dayOfWeek = 2;
			var diff = date.getDay() - dayOfWeek;
			if (diff > 0){
				date.setDate(date.getDate() + diff-1);
			}
			else if (diff < 0) {
				date.setDate(date.getDate() + ((-1) * diff))
			}
			//console.log(date);
			nlapiSetLineItemValue(type,name,line,nlapiDateToString(date));
		}
	}
}
var ExportCMT = function(){
	var data = {};	
	
	data.contents = "data:text/csv;charset=utf-8,Date,SO-ID,ClientName,Item,FabricVendor,FabricDetail,FabricStatus,CMTStage,ExpectedShipping,ConfirmedShipping,Tracking,DateNeeded,CMTStatus,Notes\n";
	data.action = 'downloadccsv';
	data = generateExport(data , 'custpage_subslist1');
	data = generateExport(data, 'custpage_subslist2');	
	data = generateExport(data, 'custpage_subslist3');	
	data = generateExport(data, 'custpage_subslist4');	
	data = generateExport(data, 'custpage_subslist5');	
	data = generateExport(data, 'custpage_subslist6');	
	data = generateExport(data, 'custpage_subslist7');	
	data = generateExport(data, 'custpage_subslist8');	
	data = generateExport(data, 'custpage_subslist9');	
	data = generateExport(data, 'custpage_subslist10');	
	data = generateExport(data, 'custpage_subslist11');	
	data = generateExport(data, 'custpage_subslist12');	
	data = generateExport(data, 'custpage_subslist13');	
	data = generateExport(data, 'custpage_subslist14');	
	var encodedUri = encodeURI(data.contents);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "OrderDetails.csv");
	document.body.appendChild(link); 
	link.click();
}
function generateExport(data, sublist){
	var replace = new Array("\r", ",", "\n");
	var count = nlapiGetLineItemCount(sublist);	
	for( var x=1; x<=count;x++)
	{
		var isapp = nlapiGetLineItemValue(sublist, 'custpage_choose', x);
		if(isapp == 'T'){
			var fabstat = 'Green', cmtstat = 'Green';
			if(nlapiGetLineItemValue(sublist, 'fabric_status_image', x).indexOf('14614') != -1)
			fabstat = 'Red';
			if(nlapiGetLineItemValue(sublist, 'cmt_status_image', x).indexOf('14614') != -1)
			cmtstat = 'Red';
			data.contents += nlapiGetLineItemValue(sublist, 'trandate', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custcol_so_id', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custcol_tailor_client_name', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custpage_fab_item_text', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custpage_fabvendor', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custpage_fabric_status', x) +',';	
			data.contents +=fabstat+',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custcol_avt_cmt_status_text', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'date_sent', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist,'custcol_avt_cmt_date_sent',x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'custcol_avt_cmt_tracking', x) +',';
			data.contents +=nlapiGetLineItemValue(sublist, 'date_needed', x) +',';			
			data.contents +=cmtstat+',';
			data.contents +=nlapiGetLineItemValue(sublist,'custcol_column_notes',x) +'\n';
		}
	}
	return data;
}