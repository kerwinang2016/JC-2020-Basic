/**
 * Module Description
 * Version		Date			Author				Remarks
 *
 * 1.00       	29 Sep 2016     AVT
 * 2.00		  	08 Sep 2020	  	Kim Morfe			Optimized the nlapiLoadSearch to prevent multiple calls to NS server and speed up the loading of the page
 * 2.01			14 Sep 2020		Kim Morfe			Added Kerwin's code update from production script
 * 2.02  		15 Sep 2020		Kim Morfe			Modified and optimized the searchCMTPurchaseOrders, Form_Approval_POLineCMT_UK and generateCMTSublist functions
 * 2.03			16 Sep 2020		Kim Morfe			Modified the functions for UK, USA, Internal and Others functions
 * 3.00			21 Sep 2020		Kim Morfe			Modified the script to make the tailor list dynamic
 * 3.01			30 Sep 2020		Kim Morfe			Modified the Fabric PO Approval dashboards to make the tailor list dynamic
 * 3.02 		01 Oct 2020		Kim Morfe			Modified the Fabric PO Historical dashboards to make the tailor list dynamic
 * 3.03 		13 Oct 2020		Kim Morfe			Fixed issue on CMT PO Approval EU by adding a validation on generateCMTSublist
 * 3.04			16 Oct 2020		Kim Morfe			Copied the updated scripts in production with Kerwin's changes and added a hidden field on approval dashboards to store the tailor length for Save and Export buttons
 * 4.00 		20 Oct 2020		Kim Morfe			Added Delivery Factory column on Fabric PO Dashboards and modified the Save button functionality to commit the changes on PO and SO for Delivery Factory
 *
 */

 //Declare universal variables to be used on CMT PO Approval EU
var searchResultList = new Array();
var dataRetrieved = false;
var myListDataPopulated = false;
var soLinesList = null;
var createdFromMasterList = new Array();
var cmtList = new Array();
var cmtBilledList = new Array();
var tailorList = new Array();

var avt_post = function(datain){
	var returnObj = new Object();
	returnObj = datain;
	//nlapiLogExecution('audit','AVT_POST');
	//nlapiLogExecution('audit','POST Incoming JSON',JSON.stringify(datain));
	var action = datain.action;
	//returnObj.action = action;
	try{
		switch(action)
		{
			case "savefabric":
				returnObj = saveFabric(datain);
				//returnObj.status = "success";
				break;
			case "savecmt":
				returnObj = saveCMT(datain);
				//returnObj.status = "success";
				break;
			case "savelining":
				returnObj = saveLining(datain);
				break;
			default:
				//nlapiLogExecution('debug','Action Not Supported');
				returnObj.status = false;
		}
	}
	catch(ex){
		returnObj.status = false;
		nlapiLogExecution("error","Error status",ex);
	}
	//nlapiLogExecution("debug","Return JSON",JSON.stringify(returnObj));

	return returnObj;
}
function dashBoardRequest(request){
  nlapiLogExecution('audit','POST Incoming JSON',request.getBody());
	var datain = JSON.parse(request.getBody());
	var returnObj = new Object();
	//returnObj = datain;

	// nlapiLogExecution('debug','action',datain.action);
	var action = datain.action;
	//returnObj.action = action;
	try{
		switch(action)
		{
			case "savefabric":
				returnObj = saveFabric(datain);
				//returnObj.status = "success";
				break;
			case "savecmt":
				returnObj = saveCMT(datain);
				//returnObj.status = "success";
				break;
			case "savelining":
				returnObj = saveLining(datain);
				break;
      case "holdso":
				returnObj = holdSO(datain);
				break;
      case "holdsoline":
				returnObj = holdSOLine(datain);
				break;
      case "sendorderlinetoustyylit":
        returnObj = sendOrderLineToUstyylit(datain);
        break;
      case "sendordertoustyylit":
        returnObj = sendOrderToUstyylit(datain);
        break;
			default:{
				nlapiLogExecution('debug','Action Not Supported');
				returnObj.status = false;
				}
		}
	}
	catch(ex){
		returnObj.status = false;
		nlapiLogExecution("error","Error status",ex);
	}
	response.write(JSON.stringify(returnObj));
}
function sendOrderLineToUstyylit(data){
  // nlapiLogExecution('debug','data', data);
  nlapiScheduleScript('customscript_ss_createorderservice', 'customdeploy_dashboardtrigger1', data);
  return data;
}
function sendOrderToUstyylit(data){
  // nlapiLogExecution('debug','data', data);
  nlapiScheduleScript('customscript_ss_createorderservice', 'customdeploy_dashboardtrigger1', data);
  return data;
}
function holdSO(data){
  var returnObj = {};
	returnObj = data;
  for(var i=0; i<data.transactions.length; i++){
    var tran = data.transactions[i];
    try{
      nlapiSubmitField('salesorder',tran.internalid,'custbodycustbody_api_sales_ord_st_json','Hold Order');
      data.transactions[i].status = true;
    }catch(e){
      nlapiLogExecution('error','holdSO', e);
      data.transactions[i].status = false;
    }
  }
  return data;
}
function holdSOLine(data){
  var returnObj = {};
	returnObj = data;
  for(var i=0; i<data.transactions.length; i++){
    var tran = data.transactions[i];
    var so = nlapiLoadRecord('salesorder',tran.internalid);
    for(var i=1;i<=so.getLineItemCount('item');i++){
      if( so.getLineItemValue('item','custcol_so_id',i) == tran.soid ){
          so.setLineItemValue('item','custcolcustcol_api_status_fld',i,'Hold');
      }
    }
    tran.status = true;
    nlapiSubmitRecord(so);
  }
  return data
}
function saveLining(data){
	var returnObj = {};
	returnObj = data;
	for(var i=0; i<data.transactions.length; i++){
		var tran = data.transactions[i];
		try
		{
			var so = nlapiLoadRecord('purchaseorder', tran.internalid);
			var sorecord;
			if(so.getFieldValue( 'createdfrom'))
				sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
			else{
				data.transactions[i].status = false;
				continue;
			}
			var solinekey = [];
			if(so)
			{
				var count = so.getLineItemCount('item');
				for(var j=0;j<tran.items.length;j++){
					for( var x = 1;x<=count;x++){
						var object = tran.items[j];
						var line  =  so.getLineItemValue( 'item', 'lineuniquekey', x);
						if( line == object.lineno )
						{
							var text = "";
							solinekey.push(so.getLineItemValue('item','custcol_avt_saleorder_line_key',x));
							var lining_text = so.getLineItemValue('item', 'custcol_cmt_lining_text', x);
							var lining_arr = []
							if(!lining_text){
								lining_arr.push({
									name:object.name,
									datesent:object.custcol_cmt_lining_datesent,
									tracking:object.custcol_cmt_lining_tracking,
									status:object.custcol_cmt_lining_status,
									status_text:object.custcol_cmt_lining_status_text,
									bill:object.bill,
									quantity: object.quantity,
									code: object.code
								})
							}
							else{
								lining_arr = JSON.parse(lining_text);
								var custom = _.find(lining_arr,function(x){return x.name == object.name});
								if(custom){
									custom.name = object.name;
									custom.datesent = object.custcol_cmt_lining_datesent;
									custom.tracking = object.custcol_cmt_lining_tracking;
									custom.status = object.custcol_cmt_lining_status;
									custom.status_text = object.custcol_cmt_lining_status_text;
									custom.bill = object.bill;
								}
								else{
									lining_arr.push({
										name:object.name,
										datesent:object.custcol_cmt_lining_datesent,
										tracking:object.custcol_cmt_lining_tracking,
										status:object.custcol_cmt_lining_status,
										status_text:object.custcol_cmt_lining_status_text,
										bill:object.bill,
										quantity: object.quantity,
										code: object.code
									});
								}
							}
							so.setLineItemValue( 'item', 'custcol_cmt_lining_text', x, JSON.stringify(lining_arr));

							//Set Linked SO

							var lineKEY =  object.custcol_so_id;

							//log( "loading so record ",  so.getFieldValue( 'createdfrom'));

							var socount = sorecord.getLineItemCount('item');
							for( var y=1; y<=socount; y++)
							{
								var soline = sorecord.getLineItemValue( 'item', 'custcol_so_id', y);
								//log( "checking so line " + soline, object.item)
								if( lineKEY == soline)
								{
									//log( "SO line found")
									sorecord.setLineItemValue( 'item', 'custcol_cmt_lining_text', y, JSON.stringify(lining_arr));
								}
							}
						}
					}
				}
				//log( "approved");
				nlapiSubmitRecord( so, true, true);

				try
				{
					nlapiSubmitRecord( sorecord, true, true);
					//log( "SO record submitted..")

				}catch( Error )
				{
					log( "Error saving SO");
					loge(Error);

				}
			}
			//nlapiLogExecution('debug','Status',"success");
			data.transactions[i].status = true;
		}catch( Error1)
		{
			nlapiLogExecution('error','Something went wrong',Error1);
			log( "Error - saving PO", Error1)
			loge(Error);
			tran.status = false;
		}
	}
	return returnObj;
}
function saveCMT(data){
	for(var i=0; i<data.transactions.length; i++){
		var tran = data.transactions[i];
		var sorecord;
		try
		{
			var po = nlapiLoadRecord( 'purchaseorder', tran.internalid);
			if(po.getFieldValue('createdfrom'))
				sorecord = nlapiLoadRecord( 'salesorder', po.getFieldValue( 'createdfrom'));
			else{
				data.transactions[i].status = false;
				continue
			}
			var solinekey = [];
			if(po)
			{
				var count = po.getLineItemCount( 'item');

				for( var x = 1;x<=count;x++)
				{
					var line  =  po.getLineItemValue( 'item', 'lineuniquekey', x);
					for(var j=0;j<tran.items.length;j++){
						var object = tran.items[j];
						var text = "";
						if( line == object.lineno )
						{
							solinekey.push(po.getLineItemValue('item','custcol_avt_saleorder_line_key',x));
							//so.setLineItemValue( 'item', 'custcol_avt_tracking', x, object.tracking);
							//so.setLineItemValue( 'item', 'custcol_avt_date_sent', x, object.datesent);
							//so.selectLineItem('item',x);
							po.setLineItemValue( 'item', 'custcol_avt_cmt_status',x, object.cmtstatus);
							if(object.cmtstatus == '2' && !po.getLineItemValue('item','custcol_inproductiondate',x))
								po.setLineItemValue('item','custcol_inproductiondate',x, nlapiDateToString(new Date()));
							po.setLineItemValue( 'item', 'custcol_avt_cmt_date_sent',x, object.cmt_datesent);
							if(!po.getLineItemValue('item','custcol_confirmedshipping',x))
								po.setLineItemValue('item','custcol_confirmedshipping',x,object.cmt_datesent);
							po.setLineItemValue( 'item', 'custcol_avt_cmt_tracking',x, object.cmt_tracking);
							po.setLineItemValue('item','custcol_column_notes',x,object.notes);
							if(data.bill == true)
							po.setLineItemValue('item','custcol_po_line_status',x,'3');
							text  =  po.getLineItemText( 'item', 'custcol_avt_cmt_status', x);
							if(object.cmt_datesent  != null && object.cmt_datesent != '')
							{
								text += '-' + object.cmt_datesent;
							}
							else if(object.cmtdelivery != null && object.cmtdelivery != ''){
								text += '-' + object.cmtdelivery;
							}
							if( object.cmt_tracking  != null && object.cmt_tracking != '')
							{
								text += '-' + object.cmt_tracking;
							}

							po.setLineItemValue( 'item', 'custcol_avt_cmt_status_text',x, text);
							//so.commitLineItem('item');
							//Set Linked SO
							//var soline = object.soid;
							//if( soline != null && soline != '' )
							//{
							if(sorecord){

								//log( "loading so record ",  object.soid );
								//var sorecord = nlapiLoadRecord( 'salesorder', object.soid);
								var socount = sorecord.getLineItemCount('item');
								//var lineKEY = so.getLineItemValue('item','custcol_avt_saleorder_line_key',x)
								//var lineKEY = so.getLineItemValue('item','custcol_so_id',x)
								var lineKEY = object.custcol_so_id;
								for( var y=1; y<=socount; y++)
								{
									// var soline = sorecord.getLineItemValue( 'item', 'item', y);
									//var soline = sorecord.getLineItemValue( 'item', 'custcol_avt_saleorder_line_key', y);
									var soline = sorecord.getLineItemValue( 'item', 'custcol_so_id', y);
									if( lineKEY == soline )
									{
										//sorecord.selectLineItem('item',y);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_status',y, object.cmtstatus);
										if(object.cmtstatus == '2' && !sorecord.getLineItemValue('item','custcol_inproductiondate',y))
											sorecord.setLineItemValue('item','custcol_inproductiondate',y, nlapiDateToString(new Date()));
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_date_sent',y, object.cmt_datesent);
										if(!sorecord.getLineItemValue('item','custcol_confirmedshipping',y))
											sorecord.setLineItemValue('item','custcol_confirmedshipping',y,object.cmt_datesent);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_tracking',y, object.cmt_tracking);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_status_text',y, text);
									}
								}
							}
						}
					}
				}
				try
				{
					nlapiSubmitRecord( sorecord, true, true);
					// break;
				}catch( Error )
				{
					log( "Error saving SO");
					loge(Error);

				}
				nlapiSubmitRecord( po, true, true);
			}
			if( data.bill == true)
			{
				try
				{
					//var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					var vbrecord  = nlapiTransformRecord( 'purchaseorder', tran.internalid, 'vendorbill', {recordmode:'dynamic'});
					log( "Record transformed - going to submit...", JSON.stringify(vbrecord));
					for(var j=1; j<=vbrecord.getLineItemCount('item'); j++){
							if(solinekey.indexOf(vbrecord.getLineItemValue('item','custcol_avt_saleorder_line_key',j)) == -1){
								vbrecord.removeLineItem('item',j);
								j--;
							}
						}

					//vbrecord.setLineItemValue()
					if(vbrecord.getLineItemCount('item') >0)
					nlapiSubmitRecord( vbrecord, true, true);
				}catch( Error)
				{
					log( "Error - Transforming to vendorbill");
					if( Error instanceof nlobjError)
					{
						log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
					}
					loge(Error);
					tran.status = false;
				}
			}
			tran.status = true;
		}catch( Error)
		{
			tran.status = false;
			nlapiLogExecution('error','Error Saving PO',Error);
		}
	}
	return data;
}

function saveFabric(data){
	var returnObj = {};
	returnObj = data;
	for(var i=0; i<data.transactions.length; i++){
		var tran = data.transactions[i];
		try
		{
			var so = nlapiLoadRecord('purchaseorder', tran.internalid);
			var sorecord;
			if(so.getFieldValue( 'createdfrom'))
				sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
			else{
				data.transactions[i].status = false;
				continue;
			}
			var solinekey = [];
			if(so)
			{
				//so.setFieldValue( 'status', 'B');
				//nlapiSubmitRecord( so, true, true);
				var count = so.getLineItemCount('item');
				nlapiLogExecution('debug','PO Item Count', count + ' - tran.items.length: ' + tran.items.length);
				for( var x = 1;x<=count;x++)
				{
					for(var j=0;j<tran.items.length;j++){
						var object = tran.items[j];
						var line  =  so.getLineItemValue( 'item', 'lineuniquekey', x);
						nlapiLogExecution('debug', 'line', line + ' - object.lineno: ' + object.lineno);
						if( line == object.lineno )
						{
							nlapiLogExecution('debug', 'object.custcol_delivery_factory', object.custcol_delivery_factory + ' - object.fabstatus: ' + object.fabstatus);
							var text = "";
							solinekey.push(so.getLineItemValue('item','custcol_avt_saleorder_line_key',x));
							so.setLineItemValue( 'item', 'custcol_avt_tracking', x, object.tracking);
							so.setLineItemValue( 'item', 'custcol_avt_date_sent', x, object.datesent);
							so.setLineItemValue( 'item', 'custcol_avt_fabric_status', x, object.fabstatus);
							so.setLineItemValue( 'item', 'custcol_delivery_factory', x, object.custcol_delivery_factory);
							if( data.bill == true)
							so.setLineItemValue( 'item', 'custcol_po_line_status', x, '3');

							text  =  so.getLineItemText( 'item', 'custcol_avt_fabric_status', x);
							if(object.datesent  != null && object.datesent != '')
							{
								text += '-' + object.datesent;
							}
							if( object.tracking  != null && object.tracking != '')
							{
								text += '-' + object.tracking;
							}

							so.setLineItemValue( 'item', 'custcol_avt_fabric_text', x, text);

							//Set Linked SO

							var lineKEY =  object.custcol_so_id;

							// var sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
							var socount = sorecord.getLineItemCount('item');
							for( var y=1; y<=socount; y++)
							{
								//var soline = sorecord.getLineItemValue( 'item', 'item', y);
								//var soline = sorecord.getLineItemValue( 'item', 'custcol_avt_saleorder_line_key', y);
								var soline = sorecord.getLineItemValue( 'item', 'custcol_so_id', y);
								if( lineKEY == soline)
								{
									sorecord.setLineItemValue( 'item', 'custcol_avt_tracking', y, object.tracking);
									sorecord.setLineItemValue( 'item', 'custcol_avt_date_sent', y, object.datesent);
									sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_status', y, object.fabstatus);
									sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_text', y, text);
									sorecord.setLineItemValue( 'item', 'custcol_delivery_factory', y, object.custcol_delivery_factory);
									sorecord.commitLineItem('item');
								}

							}
							// break;
							so.commitLineItem('item');
						}
					}
				}
				nlapiSubmitRecord( so, true, true);

				try
				{
					nlapiSubmitRecord( sorecord, true, true);
					//break;
				}catch( Error )
				{
					log( "Errir saving SO");
					loge(Error);

				}
			}
			if( data.bill == true)
			{
				log( "convert to a bill" );
				try
				{
					//var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					var vbrecord  = nlapiTransformRecord( 'purchaseorder', tran.internalid, 'vendorbill', {recordmode:'dynamic'});
					log( "Record transformed - going to submit...", JSON.stringify(vbrecord));
					 var linecount = vbrecord.getLineItemCount('item');
						for(var j=1; j<=vbrecord.getLineItemCount('item'); j++){
							if(solinekey.indexOf(vbrecord.getLineItemValue('item','custcol_avt_saleorder_line_key',j)) == -1){
								vbrecord.removeLineItem('item',j);
								j--;
							}
						}

					//vbrecord.setLineItemValue()
					if(vbrecord.getLineItemCount('item') >0)
					nlapiSubmitRecord( vbrecord, true, true);
				}catch( Error)
				{
					log( "Error - Transforming to vendorbill");
					if( Error instanceof nlobjError)
					{
						log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
					}
					loge(Error);
					tran.status = false;
				}
			}
			//nlapiLogExecution('debug','Status',"success");
			data.transactions[i].status = true;
		}catch( Error1)
		{
			nlapiLogExecution('error','Something went wrong',Error1);
			log( "Error - saving PO", Error1)
			loge(Error);
			tran.status = false;
		}
	}
	return returnObj;
}

var Run_CMT_LiningsApproval = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_LiningsApprovalLine();
	}
};
var Run_CMT_LiningsHistorical = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_LiningsApprovalHistorical();
	}
};
var Run_DisplaySO = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval();
	}
};

var Run_DisplaySOLines = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_Line();
	}
};

var Run_POLinesFabric = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabric();
	}
};

var Run_POLinesFabricUSA = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricUSA();
	}
};
var Run_POLinesFabricUK = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricUK();
	}
};
var Run_POLinesFabricEurope = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricEurope();
	}
};
var Run_POLinesFabricBilled = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricBilled();
	}
};
var Run_POLinesFabricBilledEurope = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricBilledEurope();
	}
};
var Run_POLinesCMT = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT();
	}
};
var Run_POLinesCMT_USA = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_USA();
	}
};

var Run_POLinesCMT_NZ = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_NZ();
	}
};
var Run_POLinesCMT_Europe = function(request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_Europe();
	}else{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_Europe();
	}
};

var Run_POLinesCMT_UK = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_UK();
	}
};

var Run_POLinesCMTBilled = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMTBilled();
	}
};
var Run_POLinesCMTBilledEurope = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMTBilledEurope();
	}
};
var Run_POLinesCMTBilledUSA = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMTBilledUSA();
	}
};
var Run_POLinesCMTBilledUK = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMTBilledUK();
	}
};

var Run_POLinesFabricBilledUSA = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricBilledUSA();
	}
};
var Run_POLinesFabricBilledUK = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricBilledUK();
	}
};
var Run_ApproveSOTrigger = function( request, response )
{
	if( request.getMethod() == 'POST')
	{
		var obj = new MyObj( request, response );
		obj.ApproveSOTrigger();
	}
};

var Run_ApproveSOLineTrigger = function( request, response )
{
	if( request.getMethod() == 'POST')
	{
		var obj = new MyObj( request, response );
		obj.ApproveSOLineTrigger();
	}
};

var Run_SaveBillPOCMT = function( request, response )
{
	if( request.getMethod() == 'POST')
	{
		var obj = new MyObj( request, response );
		obj.SaveBillPOCMT();
	}
};

var Run_SaveBillPOFab = function( request, response )
{
	if( request.getMethod() == 'POST')
	{
		var obj = new MyObj( request, response );
		obj.SaveBillPOFab();
	}
};


//START

var Run_POLinesFabricNZ = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricNZ();
	}
};
var Run_POLinesFabricBilledNZ = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineFabricBilledNZ();
	}
};
var Run_POLinesCMT_NZ = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMT_NZ();
	}
};
var Run_POLinesCMTBilledNZ = function( request, response)
{
	if( request.getMethod() == 'GET')
	{
		var obj = new MyObj( request, response);
		obj.Form_Approval_POLineCMTBilledNZ();
	}
};
//END
var MyObj = function( request, response )
{
	this.request =  request;
	this.response  =  response;
	this.Form_LiningsApprovalLine = function(){
		var form =  nlapiCreateForm( 'Lining Orders Items To Approve');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOLining()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOLining(true)');

		form.setScript( 'customscript_cmt_linings_approval_line');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
		//filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'noneof', ['84','107','@NONE@']);

		var searchid = 'customsearch_avt_cmt_linings_to_approve';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_cmt_lining_text');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		//cols[ cols.length ] = new nlobjSearchColumn('custitem_clothing_type','item');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_jacket');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_waistcoat');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_trenchcoat');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_ladiesjacket');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);
					var clothingtype, producttype  = sr[x].getValue('custcol_producttype');
					if(producttype == '2-Piece-Suit'){
						clothingtype = "Jacket,Trouser";
					}
					else if(producttype == '3-Piece-Suit'){
						clothingtype = "Jacket,Trouser,Waistcoat";
					}
					else if(producttype == 'L-2PC-Pants'){
						clothingtype = "Ladies-Jacket,Ladies-Pants";
					}
					else if(producttype == 'L-2PC-Skirt'){
						clothingtype = "Ladies-Jacket,Ladies-Skirt";
					}
					else if(producttype == 'L-3PC-Suit'){
						clothingtype = "Ladies-Jacket,Ladies-Pants,Ladies-Skirt";
					}
					else{
						clothingtype = producttype;
					}
					var clothtypes = clothingtype.split(',');
					nlapiLogExecution('debug','tranid',sr[x].getValue('tranid'));
					var lining_text = sr[x].getValue("custcol_cmt_lining_text")!=""?JSON.parse(sr[x].getValue("custcol_cmt_lining_text")):null;
					for(var i=0; i<clothtypes.length; i++){
						var lining_code = "", lining_quantity = "";
						var custom = lining_text?_.find(lining_text,function(y){return y.name == clothtypes[i]}):null;
						if(!custom) continue;
						if(custom && custom.bill == true) continue;
						switch(clothtypes[i]){
							case 'Jacket':
							case 'Waistcoat':
							case 'Overcoat':
							case 'Trenchcoat':
							case 'Ladies-Jacket':
							mylist.push({
								lineuniquekey:sr[x].getValue('lineuniquekey'),
								trandate:sr[x].getValue('trandate'),
								createdfrom:sr[x].getValue('createdfrom'),
								internalid:sr[x].getValue('internalid'),
								entity:sr[x].getValue('entity'),
								vendorid:sr[x].getValue('internalid','vendor'),
								vendorname:sr[x].getText('entityid','vendor'),
								custcol_so_id:sr[x].getValue('custcol_so_id'),
								custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
								item:sr[x].getValue('item'),
								quantity:sr[x].getValue('quantity'),
								custcol_cmt_lining_status:custom.status?custom.status:2,
								custcol_cmt_lining_datesent:custom?custom.datesent:'',
								custcol_cmt_lining_tracking:custom?custom.tracking:'',
								billed:custom?custom.bill:'',
								lining_code: custom?custom.code:'',
								lining_quantity: custom?custom.quantity:'',
								lining_vendor: custom?custom.vendor:'',
								clothtype: clothtypes[i]
							});
							break;

						}
					}
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');
		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_clothtype = sublist.addField( 'clothtype', 'text', 'Type');
		sublist.addField( 'lining_vendor', 'text', 'Lining Vendor');
		sublist.addField( 'lining_code', 'text', 'Lining Code');
		sublist.addField( 'lining_quantity', 'text', 'Lining Quantity');
		sublist.addField( 'custcol_cmt_lining_status', 'select', 'Lining Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_cmt_lining_datesent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_cmt_lining_tracking', 'text', 'Tracking');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		//var fld_ven = sublist.addField( 'othervendor_item', 'select', 'Vendor', 'vendor');
		fld_item.setDisplayType( 'inline');
		fld_vendor.setDisplayType( 'hidden');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		fld_status.setDisplayType( 'entry');
		fld_clothtype.setDisplayType('inline');
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_LiningsApprovalHistorical = function(){
		var form =  nlapiCreateForm( 'Lining Orders Items To Historical');

		form.setScript( 'customscript_cmt_linings_approval_line');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
		//filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'noneof', ['84','107','@NONE@']);

		var searchid = 'customsearch_avt_cmt_linings_billed';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_cmt_lining_text');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		//cols[ cols.length ] = new nlobjSearchColumn('custitem_clothing_type','item');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_jacket');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_waistcoat');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_trenchcoat');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_designoptions_ladiesjacket');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');

		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);
					var clothingtype, producttype  = sr[x].getValue('custcol_producttype');
					if(producttype == '2-Piece-Suit'){
						clothingtype = "Jacket,Trouser";
					}
					else if(producttype == '3-Piece-Suit'){
						clothingtype = "Jacket,Trouser,Waistcoat";
					}
					else if(producttype == 'L-2PC-Pants'){
						clothingtype = "Ladies-Jacket,Ladies-Pants";
					}
					else if(producttype == 'L-2PC-Skirt'){
						clothingtype = "Ladies-Jacket,Ladies-Skirt";
					}
					else if(producttype == 'L-3PC-Suit'){
						clothingtype = "Ladies-Jacket,Ladies-Pants,Ladies-Skirt";
					}
					else{
						clothingtype = producttype;
					}
					var clothtypes = clothingtype.split(',');
					// var clothtypes = sr[x].getText('custitem_clothing_type','item').split(',');
					var lining_text = sr[x].getValue("custcol_cmt_lining_text")?JSON.parse(sr[x].getValue("custcol_cmt_lining_text")):[];
					for(var i=0; i<clothtypes.length; i++){
						var lining_code = "", lining_quantity = "";
						var custom = lining_text?_.find(lining_text,function(y){return y.name == clothtypes[i]}):null;
						if(!custom) continue;
						if((custom && custom.bill == false) || !custom) continue;
						switch(clothtypes[i]){
							case 'Jacket':
							case 'Waistcoat':
							case 'Overcoat':
							case 'Ladies-Jacket':
							case 'Trenchcoat':
							mylist.push({
								lineuniquekey:sr[x].getValue('lineuniquekey'),
								trandate:sr[x].getValue('trandate'),
								createdfrom:sr[x].getValue('createdfrom'),
								internalid:sr[x].getValue('internalid'),
								entity:sr[x].getValue('entity'),
								vendorid:sr[x].getValue('internalid','vendor'),
								vendorname:sr[x].getText('entityid','vendor'),
								custcol_so_id:sr[x].getValue('custcol_so_id'),
								custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
								item:sr[x].getValue('item'),
								quantity:sr[x].getValue('quantity'),
								custcol_cmt_lining_status:custom?custom.status:'',
								custcol_cmt_lining_datesent:custom?custom.datesent:'',
								custcol_cmt_lining_tracking:custom?custom.tracking:'',
								billed:custom?custom.billed:'',
								lining_code: custom?custom.code:'',
								lining_quantity: custom?custom.quantity:'',
								clothtype: clothtypes[i]
							});
							break;
						}

					}
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addField( 'trandate', 'date', 'Date');
		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_clothtype = sublist.addField( 'clothtype', 'text', 'Type');
		sublist.addField( 'lining_vendor', 'text', 'Lining Vendor');
		sublist.addField( 'lining_code', 'text', 'Lining Code');
		sublist.addField( 'lining_quantity', 'text', 'Lining Quantity');
		var fld_lining_status = sublist.addField( 'custcol_cmt_lining_status', 'select', 'Lining Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_cmt_lining_datesent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_cmt_lining_tracking', 'text', 'Tracking');
		fld_lining_status.setDisplayType('inline');
		fld_item.setDisplayType('inline');
		fld_vendor.setDisplayType('hidden');
		fld_line.setDisplayType('hidden');
		fld_soid.setDisplayType('inline');
		fld_so.setDisplayType('hidden');
		fld_po.setDisplayType('hidden');
		fld_cust.setDisplayType('inline');
		fld_dates.setDisplayType('inline');
		fld_track.setDisplayType('inline');
		fld_clothtype.setDisplayType('inline');
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_Approval = function()
	{
		var form =  nlapiCreateForm( 'Sales Orders To Approve');
		form.addButton( 'custpage_btapprve', 'Approve Now', 'ApproveSO()');
    form.addButton( 'custpage_btnhold', 'Hold Orders', 'HoldSO()');
    form.addButton( 'custpage_btnsend', 'Send to Ustyylit', 'SendToUstyylit()');
    form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'T');
		//filter[ filter.length ] = new nlobjSearchFilter( 'status', null, 'anyof', 'pendingApproval');

		var searchid = 'customsearch_avt_so_to_approve';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'memo');

		var sr = nlapiSearchRecord( 'salesorder', searchid, filter, cols);

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Orders To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');
		var fld_so = sublist.addField( 'internalid', 'select', 'Order', 'salesorder' );
		var fld_name = sublist.addField( 'entity', 'select', 'Name', 'customer');
		var fld_memo = sublist.addField( 'memo', 'text', 'Confirmation Numer');
		fld_memo.setDisplayType( 'inline');
		fld_so.setDisplayType( 'inline');
		fld_name.setDisplayType( 'inline');
		var fld_status  =  sublist.addField( 'custpage_status', 'text', 'Status');
		fld_status.setDisplayType( 'entry');

		if( sr != null && sr.length > 0 )
		{
			//log( "total resulsts found ", sr.length);
		}
		sublist.setLineItemValues( sr );

		this.response.writePage( form);

	};


	this.Form_Approval_Line = function()
	{
		var form =  nlapiCreateForm( 'Sales Orders Items To Approve');
		form.addButton( 'custpage_btapprve', 'Approve Now', 'ApproveSOLine()');
		form.addButton( 'custpage_filter', 'Filter', 'FilterSOLine()');
		form.addButton( 'custpage_btsave', 'Save', 'SaveSO');
    form.addButton( 'custpage_btnhold', 'Hold', 'HoldSOLine()');
    form.addButton( 'custpage_btnsend', 'Send to Ustyylit', 'SendLineToUstyylit()');
		var fld_itemselect  = form.addField( 'custpage_item', 'select', 'Filter Item', 'item');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
		var itemid  =  this.request.getParameter( 'itemid');
		if( itemid  != null && itemid != '' ){
			filter[ filter.length ] = new nlobjSearchFilter( 'item', null, 'anyof', itemid);
			fld_itemselect.setDefaultValue(itemid);
		}
		//filter[ filter.length ] = new nlobjSearchFilter( 'status', null, 'anyof', 'pendingApproval');

		var searchid = 'customsearch_avt_so_to_approve_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_fabric_quantity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] = new nlobjSearchColumn( 'othervendor', 'item');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_avt_so_line_approved');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_tailor_client_name');
		cols[ cols.length ] = new nlobjSearchColumn( 'formulatext');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmtno');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcolcustcol_api_status_fld');


		var sr = nlapiSearchRecord( 'salesorder', searchid, filter, cols);

		var sublist = form.addSubList( 'custpage_subslist_app', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');
		var fld_soid = sublist.addField( 'custcol_so_id', 'textarea', 'SO ID');
		var fld_soline = sublist.addField( 'lineuniquekey', 'text', 'SO Line ID');
		var fld_so = sublist.addField( 'internalid', 'select', 'Order', 'salesorder' );
		var fld_cmno =  sublist.addField( 'custcol_avt_cmtno', 'text', 'CMT Order #');
		var fld_api =  sublist.addField( 'custcolcustcol_api_status_fld', 'text', 'API Status');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		sublist.addField( 'custcol_fabric_quantity', 'text', 'Meters');
		var fld_ven = sublist.addField( 'vendor', 'text', 'Vendor');
		fld_item.setDisplayType( 'inline');
		var fld_status  = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_status.setDisplayType( 'entry');
		sublist.addField( 'custcol_avt_so_line_approved', 'checkbox', 'Is Approved');

		fld_soid.setDisplayType( 'inline');
		fld_cmno.setDisplayType( 'hidden');
		fld_api.setDisplayType( 'inline');
		fld_soline.setDisplayType( 'hidden');
		fld_so.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_ven.setDisplayType( 'inline');

		if( sr != null && sr.length > 0 )
		{
			//log( "toal resulsts found ", sr.length);
		}
		var mylist = [];
		if(sr){
		for(var i=0;i<sr.length; i++){
			mylist.push({
				trandate: sr[i].getValue('trandate'),
				custcol_so_id: sr[i].getValue('custcol_so_id'),
				lineuniquekey: sr[i].getValue('lineuniquekey'),
				internalid: sr[i].getValue('internalid'),
				custcol_avt_cmtno: sr[i].getValue('custcol_avt_cmtno') ,
				custcolcustcol_api_status_fld: sr[i].getValue('custcolcustcol_api_status_fld'),
				entity: sr[i].getValue('entity'),
				custcol_tailor_client_name: sr[i].getValue('custcol_tailor_client_name'),
				item: sr[i].getValue('item'),
				custcol_fabric_quantity: sr[i].getValue('custcol_fabric_quantity'),
				vendor: sr[i].getValue('custcol_vendorpicked')?sr[i].getText('custcol_vendorpicked'):sr[i].getText('othervendor','item'),
				custcol_avt_so_line_approved: sr[i].getValue('custcol_avt_so_line_approved')
			});
		}
		}
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};

	this.Form_Approval_POLineFabricUK = function()
	{
		var form =  nlapiCreateForm( 'Fabric Purchase Order Items To Manage UK');
		//var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor', 'vendor');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOFab()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOFab(true)');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilter()');
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');

			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(4);	//Internal ID of Region: UK
			log('tailorList', tailorList);
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			log('uniqueTailorIDs', uniqueTailorIDs);
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['961','706','932','958','605','947','921','600','840','848','844','813','801','728','562','587','627','685','716','772','854']);
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_delivery_factory');
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var light ="";
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);

					if(sr[x].getValue('custcol_avt_fabric_status') == '1' || trandate<currentDateToday)
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">';
					else
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">';
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						vendorid:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						itemtext: itemtext,
						item:sr[x].getValue('item'),

						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_delivery_factory:sr[x].getValue('custcol_delivery_factory'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking'),
						light:light,
						custcol_custom_fabric_details:fabdet
					});
					//mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		var fld_light = sublist.addField( 'light', 'text', 'Status');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_deliveryfactory = sublist.addField('custcol_delivery_factory', 'select' , 'Delivery Factory', 'customlist_delivery_factory_options');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_fabdet = sublist.addField('custcol_custom_fabric_details','text', 'Custom Fabric');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_vendor.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_fabdet.setDisplayType('inline');
		fld_status.setDisplayType( 'entry');
		fld_deliveryfactory.setDisplayType('entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		// for(var i=0; i<mylist.length;i++){
			// sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
		// }
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabricUSA = function()
	{
		var form =  nlapiCreateForm( 'Fabric Purchase Order Items To Manage NA');
		//var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor', 'vendor');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOFab()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOFab(true)');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilter()');
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(5);	//Internal ID of Region: NA
			log('tailorList', tailorList);
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			log('uniqueTailorIDs', uniqueTailorIDs);
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['914','84','118','758']);
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_delivery_factory');
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var light ="";
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);

					if(sr[x].getValue('custcol_avt_fabric_status') == '1' || trandate<currentDateToday)
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">';
					else
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">';
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';
					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}

					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						vendorid:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						itemtext: itemtext,
						item:sr[x].getValue('item'),
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_delivery_factory:sr[x].getValue('custcol_delivery_factory'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking'),
						light:light,
						custcol_custom_fabric_details:fabdet
					});
					//mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		var fld_light = sublist.addField( 'light', 'text', 'Status');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_deliveryfactory = sublist.addField('custcol_delivery_factory', 'select' , 'Delivery Factory', 'customlist_delivery_factory_options');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_fabdet = sublist.addField('custcol_custom_fabric_details','text', 'Custom Fabric');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_vendor.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_fabdet.setDisplayType('inline');
		fld_status.setDisplayType( 'entry');
		fld_deliveryfactory.setDisplayType('entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		// for(var i=0; i<mylist.length;i++){
			// sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
		// }
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabric = function()
	{
		var form =  nlapiCreateForm( 'Fabric Purchase Order Items To Manage Internal');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOFab()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOFab(true)');

		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();
		//log( "role", context.getRoleId() );
		//log( "urer", context.getUser() );

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				if(user == '78')
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', 15);
				else
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilter()');
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(2);	//Internal ID of Region: Internal
			log('tailorList', tailorList);
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			log('uniqueTailorIDs', uniqueTailorIDs);
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['75','5','669','708']);
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}

		var searchid = 'customsearch_avt_so_to_approve_2_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_delivery_factory');
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var light ="";
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);

					if(sr[x].getValue('custcol_avt_fabric_status') == '1' || trandate<currentDateToday)
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">';
					else
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">';
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						vendorid:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_delivery_factory:sr[x].getValue('custcol_delivery_factory'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking'),
						light:light
					});
					//mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		var fld_light = sublist.addField( 'light', 'text', 'Status');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_deliveryfactory = sublist.addField('custcol_delivery_factory', 'select' , 'Delivery Factory', 'customlist_delivery_factory_options');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');

		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_vendor.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		fld_status.setDisplayType( 'entry');
		fld_deliveryfactory.setDisplayType('entry');

		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};


	this.Form_Approval_POLineFabricBilled = function()
	{
		var form =  nlapiCreateForm( 'Fabric Purchase Order Billed Internal');

		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();
		//log( "role", context.getRoleId() );
		//log( "urer", context.getUser() );

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilterBilled()');
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(2);	//Internal ID of Region: Internal
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['75','5','669','708']);//Filter Dayan
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}

		var searchid = 'customsearch_avt_so_to_approve_2_2_3';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var mylist = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						internalid_vendor:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						itemtext: itemtext,
						item:sr[x].getValue('item'),

						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking')
					});
					// mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		// sublist.addMarkAllButtons();
		// sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor = sublist.addField( 'internalid_vendor', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');

		fld_vendor.setDisplayType( 'inline');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_status.setDisplayType( 'entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		sublist.setLineItemValues(mylist);

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabricBilledUSA = function()
	{

		var form =  nlapiCreateForm( 'Fabric Purchase Order Billed NA');
		form.addButton( 'custpage_btfilter', 'Filter', 'POFilterBilled()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}
		else{
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(5);	//Internal ID of Region: NA
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['914','84','118','758']);//Filter Dayan
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2_3';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var mylist = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						internalid_vendor:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking')
					});
					// mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		// sublist.addMarkAllButtons();
		// sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_ven = sublist.addField( 'internalid_vendor', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_ven.setDisplayType('inline');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_status.setDisplayType( 'entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		sublist.setLineItemValues(mylist);

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabricBilledUK = function()
	{

		var form =  nlapiCreateForm( 'Fabric Purchase Order Billed UK');
		form.addButton( 'custpage_btfilter', 'Filter', 'POFilterBilled()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}
		else{
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(4);	//Internal ID of Region: UK
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['961','706','932','958','605','947','921','600','840','848','844','813','801','728','562','587','627','685','716','772','854']);//Filter Dayan
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2_3';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var mylist = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					// mylist.push(sr[x]);
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}

					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						internalid_vendor:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking')
					});
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		// sublist.addMarkAllButtons();
		// sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_ven = sublist.addField( 'internalid_vendor', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_ven.setDisplayType('inline');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_status.setDisplayType( 'entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		sublist.setLineItemValues(mylist);

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMT_UK = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var cmtstatus = this.request.getParameter('cmtstatus');

		var form =  nlapiCreateForm( 'CMT Purchase Order Items To Manage UK');
		form.addButton( 'custpage_btapprve', 'Save', 'SavePOCMT()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOCMT(true)');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTFilter()');
		form.addButton( 'custpage_btexport', 'Export', 'ExportCMT()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_cmtstatus = form.addField( 'custpage_cmtstatus', 'multiselect', 'CMT Stage');
		fld_cmtstatus.addSelectOption('8','Confirmed');
		fld_cmtstatus.addSelectOption('4','Error');
		fld_cmtstatus.setDisplaySize('150', '2')

		// form.addTab('custpage_jeromeuk','Jerome UK');
		// form.addTab('custpage_jackdavidson','40 JEI_Jack Davidson');

		// form.addTab('custpage_josephdarcy','52 JEI_Joseph Darcy');

		// form.addTab('custpage_jonathanquearney','75 JEI_Jonathan Quearney');
		// form.addTab('custpage_abrahams','88 JEI_Abrahams Tailoring');
		// form.addTab('custpage_sobespoke','93 JEI_So Bespoke');
		// form.addTab('custpage_madebyeveryone','108 JEI_Made by Everyone');
		// form.addTab('custpage_george','112 JEI_Richard George');
		// form.addTab('custpage_masonandsons','114 JEI_Mason & Sons');
		// form.addTab('custpage_bosiandcharles','125 JEI_Bosi and Charles');
		// form.addTab('custpage_mensfinest',"128 JEI_Men's Finest");
		// form.addTab('custpage_ldc_satorial',"126 JEI_LDC Sartorial");
		// form.addTab('custpage_colmore',"123 JEI_Colmore Tailors");
		// form.addTab('custpage_clementsandchurch',"44 JEI_Clements and Church UK");


		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Expected Shipping');

		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		if(cmtstatus){
			fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		}

		var context = nlapiGetContext();
		var tailorRegion = context.getSetting('SCRIPT', 'custscript_cmt_tailor_region_uk');	//Retrieve the Tailor Region from the script parameter

		//Perform a Tailor search filtered by UK region
		searchTailors(tailorRegion);

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
		log('uniqueTailorIDs UK', uniqueTailorIDs);

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrders({'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';
		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		}

		//Create a hidden field to hold the value of total tailors
		var totalTailors = form.addField('custpage_total_tailors', 'text', 'Total Tailors');
		totalTailors.setDisplayType('hidden');

		//Populate the Total Tailors field
		if (tailorList != null && tailorList != ''){
			totalTailors.setDefaultValue(tailorList.length);
		} else {
			totalTailors.setDefaultValue(0);
		}

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMT_USA = function()
	{
		var form =  nlapiCreateForm( 'CMT Purchase Order Items To Manage NA');
		form.addButton( 'custpage_btapprve', 'Save', 'SavePOCMT()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOCMT(true)');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTFilter()');
		form.addButton( 'custpage_btexport', 'Export', 'ExportCMT()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_cmtstatus = form.addField( 'custpage_cmtstatus', 'multiselect', 'CMT Stage');
		fld_cmtstatus.addSelectOption('8','Confirmed');
		fld_cmtstatus.addSelectOption('4','Error');
		fld_cmtstatus.setDisplaySize('150', '2')

		var dateval = this.request.getParameter('expecteddatesent');
		var cmtstatus = this.request.getParameter('cmtstatus');

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Expected Shipping');

		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		if(cmtstatus){
			fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		}

		var context = nlapiGetContext();
		var tailorRegion = context.getSetting('SCRIPT', 'custscript_cmt_tailor_region_us');	//Retrieve the Tailor Region from the script parameter

		//Perform a Tailor search filtered by EU region
		searchTailors(tailorRegion);

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrders({'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';
		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		}

		//Create a hidden field to hold the value of total tailors
		var totalTailors = form.addField('custpage_total_tailors', 'text', 'Total Tailors');
		totalTailors.setDisplayType('hidden');

		//Populate the Total Tailors field
		if (tailorList != null && tailorList != ''){
			totalTailors.setDefaultValue(tailorList.length);
		} else {
			totalTailors.setDefaultValue(0);
		}

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMT = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var cmtstatus = this.request.getParameter('cmtstatus');

		var form =  nlapiCreateForm( 'CMT Purchase Order Items To Manage (Internal)');
		form.addButton( 'custpage_btapprve', 'Save', 'SavePOCMT()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOCMT(true)');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTFilter()');
		form.addButton( 'custpage_btexport', 'Export', 'ExportCMT()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_cmtstatus = form.addField( 'custpage_cmtstatus', 'multiselect', 'CMT Stage');
		fld_cmtstatus.addSelectOption('8','Confirmed');
		fld_cmtstatus.addSelectOption('4','Error');
		fld_cmtstatus.setDisplaySize('150', '2')

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Expected Shipping');

		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		if(cmtstatus){
			fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		}

		var context = nlapiGetContext();
		var tailorRegion = context.getSetting('SCRIPT', 'custscript_cmt_tailor_region_au');	//Retrieve the Tailor Region from the script parameter

		//Perform a Tailor search filtered by EU region
		searchTailors(tailorRegion);

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrders({'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';
		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		}

		//Create a hidden field to hold the value of total tailors
		var totalTailors = form.addField('custpage_total_tailors', 'text', 'Total Tailors');
		totalTailors.setDisplayType('hidden');

		//Populate the Total Tailors field
		if (tailorList != null && tailorList != ''){
			totalTailors.setDefaultValue(tailorList.length);
		} else {
			totalTailors.setDefaultValue(0);
		}

		this.response.writePage( form);

	};
	this.generateCMTSublist = function(sublist, parameters, tailorsIDs){

		//log('this.searchResultList', searchResultList + ' - sublist: ' + sublist);

		var createdFromList = new Array();
		var mylist = new Array();
		var getSOLines  =  null;

		if (searchResultList != null && searchResultList != ''){	//Proceed with getting the fields from the saved search result if searchResultList is not empty
			//log('searchResultList is not empty');
			var searchid = 0;
			//log('dataRetrieved', dataRetrieved);
			if (!dataRetrieved){
				log('retrieving data from search');
				do{
					var sr = searchResultList.getResults(searchid,searchid+1000);
					if(sr){
						for( var x in sr )
						{
							var object = new Object();
							object.trandate = sr[x].getValue('trandate');
							object.soid  =  sr[x].getValue( 'custcol_so_id');
							object.line  =  sr[x].getValue( 'lineuniquekey');
							object.createdfrom =  sr[x].getValue( 'custbody_avt_salesorder_ref');
							object.createdfrom == null || object.createdfrom == ''? object.createdfrom = sr[x].getValue('createdfrom'): null;
							object.internalid  =  sr[x].getValue( 'internalid');
							object.entity  =  sr[x].getValue( 'entity');
							object.item =  sr[x].getValue( 'item');
							object.fab_text  = '';
							object.fab_item = null;
							object.fab_itemtext = '';
							object.fab_status = '';// sr[x].getValue( 'custcol_avt_fabric_status');
							object.cmt_status  = sr[x].getValue( 'custcol_avt_cmt_status');
							object.cmt_status_text  = sr[x].getText( 'custcol_avt_cmt_status');
							object.cmt_datesent = sr[x].getValue( 'custcol_avt_cmt_date_sent');
							object.cmt_tracking = sr[x].getValue( 'custcol_avt_cmt_tracking');
							object.notes = sr[x].getValue('custcol_column_notes');

							if( createdFromList[ object.createdfrom ] ==  null)
							{
								createdFromList[ object.createdfrom ] = object.createdfrom;
							}
							object.clientname  = sr[x].getValue( 'custcol_tailor_client_name');
							object.fab_vendor  = ""//sr[x].getValue( 'entityid','vendor');
							mylist.push( object);
						}
						searchid+= 1000;
					}
				}while(sr.length == 1000);
				dataRetrieved = true;

				//Populate the createdFromMasterList and cmtList
				createdFromMasterList = createdFromList;
				cmtList = mylist;

			} else {
				createdFromList	= createdFromMasterList;	//Get the value of createdFromList from createdFromMasterList
				mylist = cmtList;	//Get the value of mylist from cmtList

			}
			//return;

			if(createdFromList.length > 0 )
			{
				if (!soLinesList){
					//log('soLinesList is empty');
					getSOLines = this.getAllSOLineJoin( createdFromList, tailorsIDs);
				} else {
					//log('soLinesList is not empty');
					getSOLines = soLinesList;
				}

			}


		} else {	//Perform a search if the searchResultList is empty

			var filter = new Array();
			filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

			if(parameters.dateval){
				filter[ filter.length ] = new nlobjSearchFilter( 'custcol_avt_cmt_date_sent', null, 'on', parameters.dateval);
			}
			if(parameters.cmtstatus){
				filter[ filter.length ] = new nlobjSearchFilter( 'custcol_avt_cmt_status', null, 'anyof', parameters.cmtstatus.split(','));
			}
			filter[ filter.length ] = new nlobjSearchFilter('entity','createdfrom','is',parameters.entity);
			var context = nlapiGetContext();

			var searchid = 'customsearch_avt_so_to_approve_2_2_2';

			var search = nlapiLoadSearch('purchaseorder', searchid);
			search.addFilters(filter);

			var resultSet = search.runSearch();
			var searchid = 0;


			do{
				var sr = resultSet.getResults(searchid,searchid+1000);
				if(sr){
					for( var x in sr )
					{
						var object = new Object();
						object.trandate = sr[x].getValue('trandate');
						object.soid  =  sr[x].getValue( 'custcol_so_id');
						object.line  =  sr[x].getValue( 'lineuniquekey');
						object.createdfrom =  sr[x].getValue( 'custbody_avt_salesorder_ref');
						object.createdfrom == null || object.createdfrom == ''? object.createdfrom = sr[x].getValue('createdfrom'): null;
						object.internalid  =  sr[x].getValue( 'internalid');
						object.entity  =  sr[x].getValue( 'entity');
						object.item =  sr[x].getValue( 'item');
						object.fab_text  = '';
						object.fab_item = null;
						object.fab_itemtext = '';
						object.fab_status = '';// sr[x].getValue( 'custcol_avt_fabric_status');
						object.cmt_status  = sr[x].getValue( 'custcol_avt_cmt_status');
						object.cmt_status_text  = sr[x].getText( 'custcol_avt_cmt_status');
						object.cmt_datesent = sr[x].getValue( 'custcol_avt_cmt_date_sent');
						object.cmt_tracking = sr[x].getValue( 'custcol_avt_cmt_tracking');
						object.notes = sr[x].getValue('custcol_column_notes');

						if( createdFromList[ object.createdfrom ] ==  null)
						{
							createdFromList[ object.createdfrom ] = object.createdfrom;
						}
						object.clientname  = sr[x].getValue( 'custcol_tailor_client_name');
						object.fab_vendor  = ""//sr[x].getValue( 'entityid','vendor');
						mylist.push( object);
					}
					searchid+= 1000;
				}
			}while(sr.length == 1000);

			if(createdFromList.length > 0 )
			{
				getSOLines = this.getSOLineJoin( createdFromList, parameters.entity);
			}

		}



		if( getSOLines != null && !myListDataPopulated)
		{
			for(var x in mylist)
			{
				for( var k in getSOLines)
				{
					var id = mylist[x].soid.split( '-');

					if( mylist[x].createdfrom ==  getSOLines[k].internalid  &&
							mylist[x].item !=  getSOLines[k].item && id[1] == getSOLines[k].line)
					{

						mylist[x].fab_status = getSOLines[k].fab_status;
						//mylist[x].fab_datesent = getSOLines[k].fab_datesent;
						//mylist[x].fab_tracking = getSOLines[k].fab_tracking;
						mylist[x].fab_item = getSOLines[k].item;
						mylist[x].fab_itemtext = getSOLines[k].itemtext;
						mylist[x].fab_vendor  = getSOLines[k].fab_vendor;
						mylist[x].fab_text  =  getSOLines[k].fab_text;
						mylist[x].expsentdate = getSOLines[k].expsentdate;
						mylist[x].tailor  =  getSOLines[k].entity;
						mylist[x].tailorid = getSOLines[k].entityid;
						//mylist[x].custcol_expected_date_needed = getSOLines[k].custcol_expected_date_needed;
						mylist[x].custcol_avt_date_needed = getSOLines[k].custcol_avt_date_needed;
						mylist[x].custcol_tailor_delivery_days = getSOLines[k].custcol_tailor_delivery_days;
						mylist[x].custcol_expected_production_date = getSOLines[k].custcol_expected_production_date;
						mylist[x].custcol_cmt_production_time = getSOLines[k].custcol_cmt_production_time;
						mylist[x].custcol_cmt_lining_text = getSOLines[k].custcol_cmt_lining_text;
						mylist[x].custcol_confirmedshipping = getSOLines[k].custcol_confirmedshipping;
						mylist[x].custcol_inproductiondate = getSOLines[k].custcol_inproductiondate;
						break;
					}
				}
			}
			myListDataPopulated = true;
		}
		// var fld_expdatesent = form.addField( 'custpage_expecteddatesent2', 'date', 'Expected Date Sent',null,'custpage_oscarhuntsydney');
		// var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID');
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_cust = sublist.addField( 'custpage_entity', 'text', 'Tailor');
		var fld_soineid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		var fld_item = sublist.addField( 'item', 'select', 'CMT Item', 'item');
		var fld_client = sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item_fab = sublist.addField( 'custpage_fab_item', 'select', 'Item', 'item');
		var fld_item_fab_text = sublist.addField( 'custpage_fab_item_text', 'text', 'Item');
		sublist.addField( 'custpage_fabvendor', 'text', 'Fabric Vendor');
		//var fld_fabs = sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		if(parameters.entity != '5' && parameters.entity != '75'){
		var fld_custcol_cmt_lining_text = sublist.addField('custcol_cmt_lining_text','text','Lining Status');
		fld_custcol_cmt_lining_text.setDisplayType('inline');
		}
		var fld_fabs = sublist.addField( 'custpage_fabric_status', 'text', 'Fabric Detail');
		var fld_fabs_image = sublist.addField( 'fabric_status_image', 'text', 'Fabric Status');

		var fld_cmts = sublist.addField( 'custcol_avt_cmt_status','select', 'CMT Stage', 'customlist_avt_cmt_status_list');
		var fld_cmts_text = sublist.addField( 'custcol_avt_cmt_status_text','text', 'CMT Stage');
		var fld_inproductiondate = sublist.addField( 'custcol_inproductiondate','date', 'In Production Date');
		var fld_dates_exp = sublist.addField( 'date_sent', 'date', 'Expected Shipping');

		//var fld_exp  = sublist.addField( 'custpage_expsentdate', 'date', 'Expected Date');
		var fld_confirmedshipping = sublist.addField( 'custcol_confirmedshipping', 'date', 'Confirmed Shipping');
		var fld_dates = sublist.addField( 'custcol_avt_cmt_date_sent', 'date', 'Current Shipping');
		var fld_track = sublist.addField( 'custcol_avt_cmt_tracking', 'text', 'Tracking');
		var fld_date_needed = sublist.addField( 'date_needed', 'date', 'Date Needed');
		var fld_cmt_image = sublist.addField( 'cmt_status_image', 'text', 'CMT Status');
		var fld_notes = sublist.addField('custcol_column_notes', 'text', 'Notes');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_cmts_text.setDisplayType('hidden');
		fld_confirmedshipping.setDisplayType('inline');
		fld_inproductiondate.setDisplayType('inline');
		fld_item_fab_text.setDisplayType('inline');
		fld_soineid.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_item.setDisplayType( 'hidden');
		fld_item_fab.setDisplayType( 'hidden');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'hidden');
		fld_fabs.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		fld_cmts.setDisplayType( 'entry');
		fld_status.setDisplayType( 'entry');
		fld_notes.setDisplayType('entry');

		if (sr != null) log('sr length', sr.length);
		//log('mylist length', mylist.length);
		//if( sr != null && sr.length > 0 )
		if( mylist != null && mylist.length > 0 )
		{
			var count =1 ;
			var today = new Date();
			for( var x in mylist)
			{
				if(parameters.dateval){
					if(!mylist[x].cmt_datesent)
					continue;
				}
				if(parameters.entity){
					if(mylist[x].tailorid != parameters.entity)
					continue;
				}
				var expFabDateNeeded = null,dateNeeded = null,confirmedDate = null;
				sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
				sublist.setLineItemValue( 'custcol_so_id', count, mylist[x].soid );
				sublist.setLineItemValue( 'lineuniquekey', count, mylist[x].line );
				sublist.setLineItemValue( 'createdfrom', count, mylist[x].createdfrom );
				sublist.setLineItemValue( 'internalid', count, mylist[x].internalid );
				sublist.setLineItemValue( 'custpage_entity', count, mylist[x].tailor );
				sublist.setLineItemValue( 'item', count, mylist[x].item );
				sublist.setLineItemValue( 'custpage_fab_item', count, mylist[x].fab_item );
				sublist.setLineItemValue( 'custpage_fab_item_text', count, mylist[x].fab_itemtext );
				sublist.setLineItemValue( 'custpage_fabric_status', count, mylist[x].fab_text );
				sublist.setLineItemValue( 'custcol_tailor_client_name',count, mylist[x].clientname );
				sublist.setLineItemValue( 'custcol_avt_cmt_status', count, mylist[x].cmt_status );
				sublist.setLineItemValue( 'custcol_avt_cmt_status_text', count, mylist[x].cmt_status_text );
				sublist.setLineItemValue( 'custcol_avt_cmt_date_sent', count, mylist[x].cmt_datesent );
				sublist.setLineItemValue( 'custcol_avt_cmt_tracking', count, mylist[x].cmt_tracking );
				sublist.setLineItemValue( 'custpage_fabvendor', count, mylist[x].fab_vendor);
				sublist.setLineItemValue('custcol_column_notes',count, mylist[x].notes);
				sublist.setLineItemValue('date_sent',count, mylist[x].custcol_expected_production_date);
				sublist.setLineItemValue('date_needed',count, mylist[x].custcol_avt_date_needed);
				sublist.setLineItemValue('custcol_cmt_lining_text',count,mylist[x].custcol_cmt_lining_text);
				sublist.setLineItemValue('custcol_inproductiondate',count,mylist[x].custcol_inproductiondate);
				sublist.setLineItemValue('custcol_confirmedshipping',count,mylist[x].custcol_confirmedshipping);
				if((mylist[x].cmt_status == '7' || mylist[x].cmt_status == '8' || !mylist[x].cmt_status) && mylist[x].fab_status != '1'){
					//check the dates of the fabric should be sent vs today
					if(mylist[x].custcol_expected_production_date){
						expFabDateNeeded = nlapiStringToDate(mylist[x].custcol_expected_production_date);
						expFabDateNeeded.setDate(expFabDateNeeded.getDate()-parseFloat(mylist[x].custcol_cmt_production_time));
						if(expFabDateNeeded < today)
							sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
						else
							sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}
					else{
						sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}
				}
				else if(mylist[x].fab_status == '1'){
					sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
				}
				else{
					sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
				}

				if(mylist[x].cmt_status == '4'){
					sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
				}else if (mylist[x].custcol_avt_date_needed){
					dateNeeded = nlapiStringToDate(mylist[x].custcol_avt_date_needed)
					if(mylist[x].cmt_datesent){
						confirmedDate = nlapiStringToDate(mylist[x].cmt_datesent);
						confirmedDate.setDate(confirmedDate.getDate()+ parseFloat(mylist[x].custcol_tailor_delivery_days?mylist[x].custcol_tailor_delivery_days:0));
					}
					else if(mylist[x].custcol_expected_production_date){
						confirmedDate = nlapiStringToDate(mylist[x].custcol_expected_production_date);
						confirmedDate.setDate(confirmedDate.getDate()+ parseFloat(mylist[x].custcol_tailor_delivery_days?mylist[x].custcol_tailor_delivery_days:0));
					}

					if(confirmedDate){
						if(confirmedDate > dateNeeded)
							sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
						else
							sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}else{
						sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}

				}else
					sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');

				//sublist.setLineItemValue( 'custpage_expsentdate', count, mylist[x].expsentdate);
				count++;
			}
		}
	};
	this.generateCMTBilledSublist = function(sublist, parameters, tailorsIDs){

		var createdFromList = new Array();
		var mylist = new Array();
		var getSOLines  =  null;

		if (searchResultList != null && searchResultList != ''){	//Proceed with getting the fields from the saved search result if searchResultList is not empty
			//log('searchResultList is not empty');
			var searchid = 0;
			//log('dataRetrieved', dataRetrieved);
			if (!dataRetrieved){
				log('retrieving data from search');
				do{
					var sr = searchResultList.getResults(searchid,searchid+1000);
					if(sr){
						for( var x=0; x<sr.length;x++ )
						{
							var object = new Object();
							object.trandate = sr[x].getValue('trandate');
							object.soid  =  sr[x].getValue( 'custcol_so_id');
							object.line  =  sr[x].getValue( 'lineuniquekey');
							object.createdfrom =  sr[x].getValue( 'custbody_avt_salesorder_ref');
							object.createdfrom == null || object.createdfrom == ''? object.createdfrom = sr[x].getValue('createdfrom'): null;
							object.internalid  =  sr[x].getValue( 'internalid');
							object.entity  =  sr[x].getValue( 'entity');
							object.item =  sr[x].getValue( 'item');
							object.fab_text  = '';
							object.fab_item = null;
							object.fab_itemtext = '';
							object.fab_status = '';// sr[x].getValue( 'custcol_avt_fabric_status');
							object.cmt_status  = sr[x].getValue( 'custcol_avt_cmt_status');
							object.cmt_datesent = sr[x].getValue( 'custcol_avt_cmt_date_sent');
							object.cmt_tracking = sr[x].getValue( 'custcol_avt_cmt_tracking');
							object.notes = sr[x].getValue('custcol_column_notes');
							if( createdFromList[ object.createdfrom ] ==  null)
							{
								createdFromList[ object.createdfrom ] = object.createdfrom;
							}
							object.clientname  = sr[x].getValue( 'custcol_tailor_client_name');
							object.fab_vendor  = '';
							mylist.push( object);
						}
						searchid += sr.length;
					}
				}while(sr.length == 1000);
				dataRetrieved = true;

				//Populate the createdFromMasterList and cmtBilledList
				createdFromMasterList = createdFromList;
				cmtBilledList = mylist;

			} else {
				//log('retrieving from createdFromMasterList', createdFromMasterList);
				createdFromList	= createdFromMasterList;	//Get the value of createdFromList from createdFromMasterList
				mylist = cmtBilledList;	//Get the value of mylist from cmtBilledList

			}
			//return;
			//log('createdFromList : ', createdFromList);
			if(createdFromList.length > 0 )
			{

				//log('createdFromList length: ' + createdFromList.length);
				if (!soLinesList){
					//log('soLinesList is empty');
					getSOLines = this.getAllSOLineJoin( createdFromList, tailorsIDs);
				} else {
					//log('soLinesList is not empty');
					getSOLines = soLinesList;
				}

			}


		} else {

			var filter = new Array();
			filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
			if(parameters.dateval){
				filter[ filter.length ] = new nlobjSearchFilter( 'custcol_avt_cmt_date_sent', null, 'on', parameters.dateval);
			}
			//filter[ filter.length ] = new nlobjSearchFilter( 'internalid', null, 'anyof', '4562');
			/*var role  = nlapiGetRole();
			var id = nlapiGetRecordId();
			if( role == '1008' || role == '1009' || role == '1010' || role == '1011' || role == '1012'  || role == '1013') // if role is any of the roles filter by vendor
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', id );
			}*/

			//filter[ filter.length ] = new nlobjSearchFilter( 'itemtype', 'item', 'text', 'service');
			var context = nlapiGetContext();

			var searchid = 'customsearch_avt_so_to_approve_2_2_2_2';

			var cols = new Array();
			cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
			cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
			//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
			cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
			cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
			cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
			cols[ cols.length ] =  new nlobjSearchColumn( 'custbody_avt_salesorder_ref');
			cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
			cols[ cols.length ] =  new nlobjSearchColumn( 'item');
			cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_tracking');
			cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_date_sent');
			cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_status');
			cols[ cols.length ] = new nlobjSearchColumn( 'lineuniquekey');
			cols[ cols.length ] = new nlobjSearchColumn( 'custcol_tailor_client_name');
			cols[ cols.length ] = new nlobjSearchColumn('custcol_column_notes');

			//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);

			var search = nlapiLoadSearch('purchaseorder', searchid);
			search.addFilters(filter);
			search.addColumns(cols);
			var searchid = 0;
			var createdFromList = new Array();
			var mylist = new Array();

			var resultSet = search.runSearch();
			do{
				var sr = resultSet.getResults(searchid,searchid+1000);
				if(sr){
					for( var x=0; x<sr.length;x++ )
					{
						var object = new Object();
						object.trandate = sr[x].getValue('trandate');
						object.soid  =  sr[x].getValue( 'custcol_so_id');
						object.line  =  sr[x].getValue( 'lineuniquekey');
						object.createdfrom =  sr[x].getValue( 'custbody_avt_salesorder_ref');
						object.createdfrom == null || object.createdfrom == ''? object.createdfrom = sr[x].getValue('createdfrom'): null;
						object.internalid  =  sr[x].getValue( 'internalid');
						object.entity  =  sr[x].getValue( 'entity');
						object.item =  sr[x].getValue( 'item');
						object.fab_text  = '';
						object.fab_item = null;
						object.fab_itemtext = '';
						object.fab_status = '';// sr[x].getValue( 'custcol_avt_fabric_status');
						object.cmt_status  = sr[x].getValue( 'custcol_avt_cmt_status');
						object.cmt_datesent = sr[x].getValue( 'custcol_avt_cmt_date_sent');
						object.cmt_tracking = sr[x].getValue( 'custcol_avt_cmt_tracking');
						object.notes = sr[x].getValue('custcol_column_notes');
						if( createdFromList[ object.createdfrom ] ==  null)
						{
							createdFromList[ object.createdfrom ] = object.createdfrom;
						}
						object.clientname  = sr[x].getValue( 'custcol_tailor_client_name');
						object.fab_vendor  = '';
						mylist.push( object);
					}
					searchid += sr.length;
				}
			}while(sr.length == 1000);

			var getSOLines  =  null;
			if(createdFromList.length > 0 )
			{
				getSOLines = this.getSOLineJoin( createdFromList, parameters.entity );
			}

			/*if( getSOLines != null)
			{
				for(var x in mylist)
				{
					for( var k in getSOLines)
					{
						var id = mylist[x].soid.split( '-');
						if( mylist[x].createdfrom ==  getSOLines[k].internalid  &&
								mylist[x].item !=  getSOLines[k].item && id[1] == getSOLines[k].line)
						{

							mylist[x].fab_status = getSOLines[k].fab_status;
							//mylist[x].fab_datesent = getSOLines[k].fab_datesent;
							//mylist[x].fab_tracking = getSOLines[k].fab_tracking;
							mylist[x].fab_item = getSOLines[k].item;
							mylist[x].fab_itemtext = getSOLines[k].itemtext;
							mylist[x].fab_vendor  = getSOLines[k].fab_vendor;
							mylist[x].fab_text  =  getSOLines[k].fab_text;
							mylist[x].expsentdate = getSOLines[k].expsentdate;
							mylist[x].tailor  =  getSOLines[k].entity;
							mylist[x].tailorid = getSOLines[k].entityid;
							//mylist[x].custcol_expected_date_needed = getSOLines[k].custcol_expected_date_needed;
							mylist[x].custcol_avt_date_needed = getSOLines[k].custcol_avt_date_needed;
							mylist[x].custcol_tailor_delivery_days = getSOLines[k].custcol_tailor_delivery_days;
							mylist[x].custcol_expected_production_date = getSOLines[k].custcol_expected_production_date;
							mylist[x].custcol_cmt_production_time = getSOLines[k].custcol_cmt_production_time;
							mylist[x].custcol_cmt_lining_text = getSOLines[k].custcol_cmt_lining_text;
							break;
						}
						else{
							//nlapiLogExecution('audit','Something got removed',JSON.stringify(mylist[x]))
						}
					}
				}
			}
			*/
		}

		if( getSOLines != null && !myListDataPopulated)
		{
			log('mylist length', mylist.length + ' - getSOLines length: ' + getSOLines.length);
			for(var x in mylist)
			{
				for( var k in getSOLines)
				{
					var id = mylist[x].soid.split( '-');
					if( mylist[x].createdfrom ==  getSOLines[k].internalid  &&
							mylist[x].item !=  getSOLines[k].item && id[1] == getSOLines[k].line)
					{

						mylist[x].fab_status = getSOLines[k].fab_status;
						//mylist[x].fab_datesent = getSOLines[k].fab_datesent;
						//mylist[x].fab_tracking = getSOLines[k].fab_tracking;
						mylist[x].fab_item = getSOLines[k].item;
						mylist[x].fab_itemtext = getSOLines[k].itemtext;
						mylist[x].fab_vendor  = getSOLines[k].fab_vendor;
						mylist[x].fab_text  =  getSOLines[k].fab_text;
						mylist[x].expsentdate = getSOLines[k].expsentdate;
						mylist[x].tailor  =  getSOLines[k].entity;
						mylist[x].tailorid = getSOLines[k].entityid;
						//mylist[x].custcol_expected_date_needed = getSOLines[k].custcol_expected_date_needed;
						mylist[x].custcol_avt_date_needed = getSOLines[k].custcol_avt_date_needed;
						mylist[x].custcol_tailor_delivery_days = getSOLines[k].custcol_tailor_delivery_days;
						mylist[x].custcol_expected_production_date = getSOLines[k].custcol_expected_production_date;
						mylist[x].custcol_cmt_production_time = getSOLines[k].custcol_cmt_production_time;
						mylist[x].custcol_cmt_lining_text = getSOLines[k].custcol_cmt_lining_text;
						break;
					}
					else{
						//nlapiLogExecution('audit','Something got removed',JSON.stringify(mylist[x]))
					}
				}
			}
			myListDataPopulated = true;
		}


		// var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		//sublist.addMarkAllButtons();
		//sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID');
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_cust = sublist.addField( 'custpage_entity', 'text', 'Tailor');
		var fld_soineid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		var fld_item = sublist.addField( 'item', 'select', 'CMT Item', 'item');
		var fld_client = sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item_fab = sublist.addField( 'custpage_fab_item', 'select', 'Item', 'item');
		var fld_item_fab_text = sublist.addField( 'custpage_fab_item_text', 'text', 'Item');
		sublist.addField( 'custpage_fabvendor', 'text', 'Fabric Vendor');
		//var fld_fabs = sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		if(parameters.entity != '5' && parameters.entity != '75'){
			var fld_custcol_cmt_lining_text = sublist.addField('custcol_cmt_lining_text','text','Lining Status');
			fld_custcol_cmt_lining_text.setDisplayType('inline');
		}
		var fld_fabs = sublist.addField( 'custpage_fabric_status', 'text', 'Fabric Detail');
		var fld_fabs_image = sublist.addField( 'fabric_status_image', 'text', 'Fabric Status');
		var fld_cmts = sublist.addField( 'custcol_avt_cmt_status','select', 'CMT Stage', 'customlist_avt_cmt_status_list');
		var fld_dates_exp = sublist.addField( 'date_sent', 'date', 'Expected Shipping');
		var fld_dates = sublist.addField( 'custcol_avt_cmt_date_sent', 'date', 'Confirmed Shipping');
		//var fld_exp  = sublist.addField( 'custpage_expsentdate', 'date', 'Expected Date');
		var fld_track = sublist.addField( 'custcol_avt_cmt_tracking', 'text', 'Tracking');
		var fld_date_needed = sublist.addField( 'date_needed', 'date', 'Date Needed');
		var fld_cmt_image = sublist.addField( 'cmt_status_image', 'text', 'CMT Status');
		//Added Notes Column
		var fld_notes = sublist.addField('custcol_column_notes', 'text', 'Notes');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_item_fab_text.setDisplayType('inline');
		fld_soineid.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_item.setDisplayType( 'hidden');
		fld_item_fab.setDisplayType( 'hidden');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'hidden');
		fld_fabs.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		fld_cmts.setDisplayType( 'entry');
		fld_status.setDisplayType( 'entry');
		fld_notes.setDisplayType('entry');


		//if( sr != null && sr.length > 0 )
		if( mylist != null && mylist.length > 0 )
		{
			//log('mylist: ' + mylist.length);
			var count =1 ;
			var today = new Date();
			for( var x in mylist)
			{
				if(parameters.dateval){
					if(!mylist[x].cmt_datesent)
					continue;
				}
				if(parameters.entity){
					if(mylist[x].tailorid != parameters.entity)
					continue;
				}
				var expFabDateNeeded = null,dateNeeded = null,confirmedDate = null;
				sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
				sublist.setLineItemValue( 'custcol_so_id', count, mylist[x].soid );
				sublist.setLineItemValue( 'lineuniquekey', count, mylist[x].line );
				sublist.setLineItemValue( 'createdfrom', count, mylist[x].createdfrom );
				sublist.setLineItemValue( 'internalid', count, mylist[x].internalid );
				sublist.setLineItemValue( 'custpage_entity', count, mylist[x].tailor );
				sublist.setLineItemValue( 'item', count, mylist[x].item );
				sublist.setLineItemValue( 'custpage_fab_item', count, mylist[x].fab_item );
				sublist.setLineItemValue( 'custpage_fab_item_text', count, mylist[x].fab_itemtext );
				sublist.setLineItemValue( 'custpage_fabric_status', count, mylist[x].fab_text );
				sublist.setLineItemValue( 'custcol_tailor_client_name',count, mylist[x].clientname );
				sublist.setLineItemValue( 'custcol_avt_cmt_status', count, mylist[x].cmt_status );
				sublist.setLineItemValue( 'custcol_avt_cmt_date_sent', count, mylist[x].cmt_datesent );
				sublist.setLineItemValue( 'custcol_avt_cmt_tracking', count, mylist[x].cmt_tracking );
				sublist.setLineItemValue( 'custpage_fabvendor', count, mylist[x].fab_vendor);
				sublist.setLineItemValue( 'custcol_column_notes', count, mylist[x].notes);
				sublist.setLineItemValue('date_sent',count, mylist[x].custcol_expected_production_date);
				sublist.setLineItemValue('date_needed',count, mylist[x].custcol_avt_date_needed);
				sublist.setLineItemValue('custcol_cmt_lining_text',count,mylist[x].custcol_cmt_lining_text);
				//sublist.setLineItemValue( 'custpage_expsentdate', count, mylist[x].expsentdate);custcol_tailor_delivery_days 4  error
				//log('mylist[x].cmt_status' + mylist[x].cmt_status + ' - mylist[x].fab_status: ' + mylist[x].fab_status);
				if((mylist[x].cmt_status == '7' || mylist[x].cmt_status == '8' || !mylist[x].cmt_status) && mylist[x].fab_status != '1'){
					//check the dates of the fabric should be sent vs today
					if(mylist[x].custcol_expected_production_date){
						expFabDateNeeded = nlapiStringToDate(mylist[x].custcol_expected_production_date);
						expFabDateNeeded.setDate(expFabDateNeeded.getDate()-parseFloat(mylist[x].custcol_cmt_production_time));
						if(expFabDateNeeded < today)
							sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
						else
							sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}
					else{
						sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}
				}
				else if(mylist[x].fab_status == '1'){
					sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
				}
				else{
					sublist.setLineItemValue('fabric_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
				}

				if(mylist[x].cmt_status == '4'){
					sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
				}else if (mylist[x].custcol_avt_date_needed){
					dateNeeded = nlapiStringToDate(mylist[x].custcol_avt_date_needed)
					if(mylist[x].cmt_datesent){
						confirmedDate = nlapiStringToDate(mylist[x].cmt_datesent);
						confirmedDate.setDate(confirmedDate.getDate()+ parseFloat(mylist[x].custcol_tailor_delivery_days?mylist[x].custcol_tailor_delivery_days:0));
					}
					else if(mylist[x].custcol_expected_production_date){
						confirmedDate = nlapiStringToDate(mylist[x].custcol_expected_production_date);
						confirmedDate.setDate(confirmedDate.getDate()+ parseFloat(mylist[x].custcol_tailor_delivery_days?mylist[x].custcol_tailor_delivery_days:0));
					}

					if(confirmedDate){
						if(confirmedDate > dateNeeded)
							sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">');
						else
							sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}else{
						sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');
					}

				}else
					sublist.setLineItemValue('cmt_status_image',count,'<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">');

				count++;
			}
		}
	};
	this.Form_Approval_POLineCMTBilled = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var form =  nlapiCreateForm( 'CMT Purchase Order Items Billed Internal');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTBilledFilter()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		//Perform a Tailor search filtered by Tailor region
		searchTailors(2);	//Tailor Region: Internal

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));	//tailorList is a universal variable that is populated on searchTailors
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrdersBilled({'dateval':dateval}, uniqueTailorIDs);

		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTBilledSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval}, uniqueTailorIDs);
		}


		/*
		form.addTab('custpage_oscarhunt','Oscar Hunt Pty Ltd');
		form.addTab('custpage_oscarhuntsydney','Oscar Hunt Sydney Pty Ltd');
		form.addTab('custpage_gcmenswear','70 GC Menswear');
		form.addTab('custpage_adelaide','83 Oscar Hunt Adelaide Pty Ltd');
		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'CMT Purchase Order Lines','custpage_oscarhunt');
		var sublist2 = form.addSubList( 'custpage_subslist2', 'list', 'CMT Purchase Order Lines','custpage_oscarhuntsydney');
		var sublist3 = form.addSubList( 'custpage_subslist3', 'list', 'CMT Purchase Order Lines','custpage_gcmenswear');
		var sublist4 = form.addSubList( 'custpage_subslist4', 'list', 'CMT Purchase Order Lines','custpage_adelaide');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		// if(cmtstatus){
			// fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		// }
		this.generateCMTBilledSublist(sublist,{'entity':'5','dateval':dateval});
		//For Sydney
		this.generateCMTBilledSublist(sublist2,{'entity':'75','dateval':dateval});
		this.generateCMTBilledSublist(sublist3,{'entity':'669','dateval':dateval});
		this.generateCMTBilledSublist(sublist4,{'entity':'708','dateval':dateval});
		*/

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMTBilledUK = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var form =  nlapiCreateForm( 'CMT Purchase Order Items Billed UK');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTBilledFilter()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		//Perform a Tailor search filtered by Tailor region
		searchTailors(4);	//Tailor Region: UK

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));	//tailorList is a universal variable that is populated on searchTailors
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrdersBilled({'dateval':dateval}, uniqueTailorIDs);

		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTBilledSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval}, uniqueTailorIDs);
		}

		/*
		// form.addTab('custpage_jeromeuk','Jerome UK');
		// form.addTab('custpage_jackdavidson','40 JEI_Jack Davidson');

		// form.addTab('custpage_josephdarcy','52 JEI_Joseph Darcy');

		// form.addTab('custpage_jonathanquearney','75 JEI_Jonathan Quearney');
		// form.addTab('custpage_abrahams','88 JEI_Abrahams Tailoring');
		// form.addTab('custpage_sobespoke','93 JEI_So Bespoke');
		// form.addTab('custpage_madebyeveryone','108 JEI_Made by Everyone');
		// form.addTab('custpage_george','112 JEI_Richard George');
		// form.addTab('custpage_masonandsons','114 JEI_Mason & Sons');
		// form.addTab('custpage_bosiandcharles','125 JEI_Bosi and Charles');
		// form.addTab('custpage_mensfinest',"128 JEI_Men's Finest");
		// form.addTab('custpage_colmore',"123 JEI_Colmore Tailors");
		// form.addTab('custpage_ldc_satorial',"126 JEI_LDC Sartorial");
		// form.addTab('custpage_clementsandchurch',"44 JEI_Clements and Church UK");
		form.addTab('custpage_tab1','Tab1');
		form.addTab('custpage_tab2','Tab2');
		form.addTab('custpage_tab3','Tab3');
		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Jerome UK','custpage_tab1');
		var sublist2 = form.addSubList( 'custpage_subslist2', 'list', '40 JEI_Jack Davidson','custpage_tab1');
		var sublist17 = form.addSubList( 'custpage_subslist17', 'list', '47 JEI_Faustus','custpage_tab1');
		var sublist3 = form.addSubList( 'custpage_subslist3', 'list', '52 JEI_Joseph Darcy','custpage_tab1');

		var sublist4 = form.addSubList( 'custpage_subslist4', 'list', '75 JEI_Jonathan Quearney','custpage_tab1');
		var sublist20 = form.addSubList( 'custpage_subslist20', 'list', '82 JEI_Hackett Limited','custpage_tab1');
		var sublist5 = form.addSubList( 'custpage_subslist5', 'list', '88 JEI_Abrahams Tailoring','custpage_tab1');
		var sublist7 = form.addSubList( 'custpage_subslist7', 'list', '93 JEI_So Bespoke','custpage_tab1');
		var sublist6 = form.addSubList( 'custpage_subslist6', 'list', '108 JEI_Made by Everyone','custpage_tab1');

		var sublist8 = form.addSubList( 'custpage_subslist8', 'list', '112 JEI_Richard George','custpage_tab2');
		var sublist9 = form.addSubList( 'custpage_subslist9', 'list', '114 JEI_Mason & Sons','custpage_tab2');
		var sublist10 = form.addSubList( 'custpage_subslist10', 'list', '125 JEI_Bosi and Charles','custpage_tab2');
		var sublist11 = form.addSubList( 'custpage_subslist11', 'list', '128 JEI_Mens Finest','custpage_tab2');
		var sublist12 = form.addSubList( 'custpage_subslist12', 'list', '126 JEI_LDC Sartorial','custpage_tab2');
		var sublist13 = form.addSubList( 'custpage_subslist13', 'list', '123 JEI_Colmore Tailors','custpage_tab2');
		var sublist14 = form.addSubList( 'custpage_subslist14', 'list', '44 JEI_Clements and Church UK','custpage_tab2');
		var sublist15 = form.addSubList( 'custpage_subslist15', 'list', '151 JEI_The Bespoke Tailor','custpage_tab2');
		var sublist19 = form.addSubList( 'custpage_subslist19', 'list', '154 JEI_Michelsberg Tailoring','custpage_tab2');
		var sublist16 = form.addSubList( 'custpage_subslist16', 'list', '158 JEI_The Chapar','custpage_tab2');
		var sublist18 = form.addSubList( 'custpage_subslist18', 'list', '161 JEI_Sarto Luxury Tailoring','custpage_tab2');
		var sublist21 = form.addSubList( 'custpage_subslist21', 'list', '162 JEI_Acre & Row','custpage_tab3');



		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		this.generateCMTBilledSublist(sublist,{'entity':'562','dateval':dateval});
		this.generateCMTBilledSublist(sublist2,{'entity':'587','dateval':dateval});

		this.generateCMTBilledSublist(sublist3,{'entity':'627','dateval':dateval});

		this.generateCMTBilledSublist(sublist4,{'entity':'685','dateval':dateval});
		this.generateCMTBilledSublist(sublist5,{'entity':'716','dateval':dateval});

		this.generateCMTBilledSublist(sublist6,{'entity':'772','dateval':dateval});
		this.generateCMTBilledSublist(sublist7,{'entity':'728','dateval':dateval});
		this.generateCMTBilledSublist(sublist8,{'entity':'801','dateval':dateval});
		this.generateCMTBilledSublist(sublist9,{'entity':'813','dateval':dateval});
		this.generateCMTBilledSublist(sublist10,{'entity':'844','dateval':dateval});
		this.generateCMTBilledSublist(sublist11,{'entity':'854','dateval':dateval});
		this.generateCMTBilledSublist(sublist12,{'entity':'848','dateval':dateval});
		this.generateCMTBilledSublist(sublist13,{'entity':'840','dateval':dateval});
		this.generateCMTBilledSublist(sublist14,{'entity':'600','dateval':dateval});
		this.generateCMTBilledSublist(sublist15,{'entity':'921','dateval':dateval});
		this.generateCMTBilledSublist(sublist16,{'entity':'947','dateval':dateval});
		this.generateCMTBilledSublist(sublist17,{'entity':'605','dateval':dateval});
		this.generateCMTBilledSublist(sublist18,{'entity':'958','dateval':dateval});
		this.generateCMTBilledSublist(sublist19,{'entity':'932','dateval':dateval});
		this.generateCMTBilledSublist(sublist20,{'entity':'706','dateval':dateval});
		this.generateCMTBilledSublist(sublist21,{'entity':'961','dateval':dateval});
		*/
		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMTBilledUSA = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var form =  nlapiCreateForm( 'CMT Purchase Order Items Billed NA');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTBilledFilter()');
		form.setScript( 'customscript_avt_so_approval_cs');


		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		//Perform a Tailor search filtered by Tailor region
		searchTailors(5);	//Tailor Region: NA

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));	//tailorList is a universal variable that is populated on searchTailors
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrdersBilled({'dateval':dateval}, uniqueTailorIDs);

		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTBilledSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval}, uniqueTailorIDs);
		}

		/*
		form.addTab('custpage_bespokedetroit','1701 Bespoke Detroit');
		form.addTab('custpage_oscarhuntjerome','20 Jerome Clothiers');
		form.addTab('custpage_hedricks',"21 Hedrick's");
		form.addTab('custpage_harrison','103 JEI_Harrison & Hines');
		form.addTab('custpage_clementsandchurchusa','148 JEI_Clements and Church USA');
		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'CMT Purchase Order Lines','custpage_bespokedetroit');
		var sublist2 = form.addSubList( 'custpage_subslist2', 'list', 'CMT Purchase Order Lines','custpage_oscarhuntjerome');
		var sublist3 = form.addSubList( 'custpage_subslist3', 'list', 'CMT Purchase Order Lines','custpage_harrison');
		var sublist4 = form.addSubList( 'custpage_subslist4', 'list', 'CMT Purchase Order Lines','custpage_clementsandchurchusa');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		// if(cmtstatus){
			// fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		// }
		this.generateCMTBilledSublist(sublist,{'entity':'84','dateval':dateval});
		this.generateCMTBilledSublist(sublist2,{'entity':'118','dateval':dateval});
		this.generateCMTBilledSublist(sublist3,{'entity':'758','dateval':dateval});
		this.generateCMTBilledSublist(sublist4,{'entity':'914','dateval':dateval});
		*/
		this.response.writePage( form);

	};
	//START NZ
	this.Form_Approval_POLineFabricNZ = function()
	{
		var form =  nlapiCreateForm( 'PO Current Dashboard "other"');
		//var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor', 'vendor');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOFab()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOFab(true)');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilter()');
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(3);	//Internal ID of Region: Other
			log('tailorList', tailorList);
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			log('uniqueTailorIDs', uniqueTailorIDs);
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['987','646','726','700','780','786']);
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_delivery_factory');

		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var light ="";
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);

					if(sr[x].getValue('custcol_avt_fabric_status') == '1' || trandate<currentDateToday)
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">';
					else
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">';
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}

					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						vendorid:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_delivery_factory:sr[x].getValue('custcol_delivery_factory'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking'),
						light:light,
						custcol_custom_fabric_details:fabdet
					});
					//mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		var fld_light = sublist.addField( 'light', 'text', 'Status');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_deliveryfactory = sublist.addField('custcol_delivery_factory', 'select' , 'Delivery Factory', 'customlist_delivery_factory_options');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		//var fld_fabdet = sublist.addField('custcol_custom_fabric_details','text', 'Custom Fabric');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_vendor.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		//fld_fabdet.setDisplayType('inline');
		fld_status.setDisplayType( 'entry');
		fld_deliveryfactory.setDisplayType('entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		// for(var i=0; i<mylist.length;i++){
			// sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
		// }
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabricBilledNZ = function()
	{

		var form =  nlapiCreateForm( 'PO Billed Dashboard "other"');
		form.addButton( 'custpage_btfilter', 'Filter', 'POFilterBilled()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}
		else{
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(3);	//Internal ID of Region: Other
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['987','646','726','700','780','786']);//Filter Dayan
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2_3';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');

		//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var mylist = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						internalid_vendor:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking')
					});
					// mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		// sublist.addMarkAllButtons();
		// sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_ven = sublist.addField( 'internalid_vendor', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		// var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_ven.setDisplayType('inline');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		// fld_status.setDisplayType( 'entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		sublist.setLineItemValues(mylist);

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMT_NZ = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var cmtstatus = this.request.getParameter('cmtstatus');

		var form =  nlapiCreateForm( 'CMT Dashboard "other"');
		form.addButton( 'custpage_btapprve', 'Save', 'SavePOCMT()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOCMT(true)');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTFilter()');
		form.addButton( 'custpage_btexport', 'Export', 'ExportCMT()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_cmtstatus = form.addField( 'custpage_cmtstatus', 'multiselect', 'CMT Stage');
		fld_cmtstatus.addSelectOption('8','Confirmed');
		fld_cmtstatus.addSelectOption('4','Error');
		fld_cmtstatus.setDisplaySize('150', '2')

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Expected Shipping');

		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		if(cmtstatus){
			fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		}

		var context = nlapiGetContext();
		var tailorRegion = context.getSetting('SCRIPT', 'custscript_cmt_tailor_region_others');	//Retrieve the Tailor Region from the script parameter

		//Perform a Tailor search filtered by EU region
		searchTailors(tailorRegion);

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrders({'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';
		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		}

		//Create a hidden field to hold the value of total tailors
		var totalTailors = form.addField('custpage_total_tailors', 'text', 'Total Tailors');
		totalTailors.setDisplayType('hidden');

		//Populate the Total Tailors field
		if (tailorList != null && tailorList != ''){
			totalTailors.setDefaultValue(tailorList.length);
		} else {
			totalTailors.setDefaultValue(0);
		}

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMTBilledNZ = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var form =  nlapiCreateForm( 'CMT Billed Dashboard "other"');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTBilledFilter()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		//Perform a Tailor search filtered by Tailor region
		searchTailors(3);	//Tailor Region: Other

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));	//tailorList is a universal variable that is populated on searchTailors
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrdersBilled({'dateval':dateval}, uniqueTailorIDs);

		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTBilledSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval}, uniqueTailorIDs);
		}

		/*
		form.addTab('custpage_kale','60 JEI_Kale & Co Bespoke');
		form.addTab('custpage_henrybucks','92 JEI_Henry Bucks');
		form.addTab('custpage_mexico','79 JEI_Rooks & Rocks Mexico');
		form.addTab('custpage_henrybuckssydney','110 JEI_Henry Bucks SYDNEY');
		form.addTab('custpage_mitchell','111 JEI_Mitchell Ogilvie');
		form.addTab('custpage_governor','170 JEI_Governor Apparel');
		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'CMT Purchase Order Lines','custpage_kale');
		var sublist1 = form.addSubList( 'custpage_subslist2', 'list', 'CMT Purchase Order Lines','custpage_henrybucks');

		var sublist2 = form.addSubList( 'custpage_subslist3', 'list', 'CMT Purchase Order Lines','custpage_mexico');
		var sublist3 = form.addSubList( 'custpage_subslist4', 'list', 'CMT Purchase Order Lines','custpage_henrybuckssydney');
		var sublist4 = form.addSubList( 'custpage_subslist5', 'list', 'CMT Purchase Order Lines','custpage_mitchell');
		var sublist5 = form.addSubList( 'custpage_subslist6', 'list', 'CMT Purchase Order Lines','custpage_governor');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		this.generateCMTBilledSublist(sublist,{'entity':'646','dateval':dateval});
		this.generateCMTBilledSublist(sublist1,{'entity':'726','dateval':dateval});

		this.generateCMTBilledSublist(sublist2,{'entity':'700','dateval':dateval});
		this.generateCMTBilledSublist(sublist3,{'entity':'780','dateval':dateval});
		this.generateCMTBilledSublist(sublist4,{'entity':'786','dateval':dateval});
		this.generateCMTBilledSublist(sublist5,{'entity':'987','dateval':dateval});
		*/
		this.response.writePage( form);

	};
	//END NZ
	/*
	 START BATCH
	*/
	this.Form_Approval_POLineFabricEurope = function()
	{
		var form =  nlapiCreateForm( 'Fabric Purchase Order Items To Manage Europe');
		//var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor', 'vendor');

		form.addButton( 'custpage_btapprve', 'Save', 'SavePOFab()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOFab(true)');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}else{
			form.addButton( 'custpage_btfilter', 'Filter', 'POFilter()');
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(1);	//Internal ID of Region: EU
			log('tailorList', tailorList);
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			log('uniqueTailorIDs', uniqueTailorIDs);
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['1010','993','966','980','978','963','970','951','934','953','891','927','911','925','919','889','881','909','877','885','852','835','842','815','837','761','594','613','604','617','624','644','640','639','677','667','673','732','734','730','654','776','750']);
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_delivery_factory');

		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var mylist = new Array();
		var resultSet = search.runSearch();
		var searchid = 0;
		var currentDateToday = new Date();
		currentDateToday.setHours(0,0,0,0);
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var light ="";
					var trandate = nlapiStringToDate(sr[x].getValue('trandate'));
					trandate.setDate(trandate.getDate()+3);

					if(sr[x].getValue('custcol_avt_fabric_status') == '1' || trandate<currentDateToday)
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14614&c=3857857&h=1ac2e5e39db11d5bf832">';
					else
						light = '<img style="margin-left: auto;margin-right: auto;display: table-cell;" src="https://3857857.app.netsuite.com/core/media/media.nl?id=14615&c=3857857&h=ebc8e4566b0ebc538eb9">';
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						vendorid:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_delivery_factory:sr[x].getValue('custcol_delivery_factory'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking'),
						light:light,
						custcol_custom_fabric_details:fabdet
					});
					//mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)
		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		sublist.addMarkAllButtons();
		sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_vendor =  sublist.addField( 'vendorid', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		var fld_light = sublist.addField( 'light', 'text', 'Status');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_deliveryfactory = sublist.addField('custcol_delivery_factory', 'select' , 'Delivery Factory', 'customlist_delivery_factory_options');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		// var fld_fabdet = sublist.addField('custcol_custom_fabric_details','text', 'Custom Fabric');
		var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_vendor.setDisplayType( 'inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		// fld_fabdet.setDisplayType('inline');
		fld_status.setDisplayType( 'entry');
		fld_deliveryfactory.setDisplayType('entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		// for(var i=0; i<mylist.length;i++){
			// sublist.setLineItemValue( 'trandate', count, mylist[x].trandate );
		// }
		sublist.setLineItemValues( mylist );

		this.response.writePage( form);

	};
	this.Form_Approval_POLineFabricBilledEurope = function()
	{

		var form =  nlapiCreateForm( 'Fabric Purchase Order Billed Europe');
		form.addButton( 'custpage_btfilter', 'Filter', 'POFilterBilled()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');

		var context = nlapiGetContext();

		if( context.getRoleId() == 'customrole1008' ||
				context.getRoleId() == 'customrole1009' ||
				context.getRoleId() == 'customrole1010' ||
				context.getRoleId() == 'customrole1011' ||
				context.getRoleId() == 'customrole1012' ||
				context.getRoleId() == 'customrole1013'
				)
		{

			var user =  context.getUser();
			if( user != null && user != '' )
			{
				filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', user);
			}
		}
		else{
			var fld_vendor = form.addField( 'custpage_vendor', 'select', 'Vendor');
			fld_vendor.addSelectOption('689','AC Shirt');
			fld_vendor.addSelectOption('88','Ariston');
			fld_vendor.addSelectOption('599','Bateman Ogden');
			fld_vendor.addSelectOption('596','Carnet');
			fld_vendor.addSelectOption('113','Cerruti');
			fld_vendor.addSelectOption('15','Dormeuil');
			fld_vendor.addSelectOption('123','Dormeuil USA');
			fld_vendor.addSelectOption('79','Dugdale Bros');
			fld_vendor.addSelectOption('672','Drago');
			fld_vendor.addSelectOption('675','Filarte');
			fld_vendor.addSelectOption('87','Gladson');
			fld_vendor.addSelectOption('54','Harrisons');
			fld_vendor.addSelectOption('121','Holland and Sherry');
			fld_vendor.addSelectOption('10','Huddersfield Cloth');
			fld_vendor.addSelectOption('17','Jerome Clothiers');
			fld_vendor.addSelectOption('59','Loro Piana');
			fld_vendor.addSelectOption('630','Martin Savile');
			fld_vendor.addSelectOption('63','Molloy and Sons');
			fld_vendor.addSelectOption('122','Scabal');
			fld_vendor.addSelectOption('568','Terio Fabrics');
			fld_vendor.addSelectOption('61','Tessitura Monti');
			fld_vendor.addSelectOption('92','Thomas Mason');
			fld_vendor.addSelectOption('120','Zegna');
			var vendorval = this.request.getParameter( 'vendor');
			if(vendorval != null && vendorval != '' )
			{
				fld_vendor.setDefaultValue(vendorval );
			}
			//Perform a Tailor search filtered by Tailor Region
			searchTailors(1);	//Internal ID of Region: EU
			var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', uniqueTailorIDs);
			//KM 15Sep2020 - Added Kerwin's update in production
			//filter[ filter.length ] = new nlobjSearchFilter( 'entity', 'createdfrom', 'anyof', ['1010','993','966','980','978','963','970','951','934','953','891','927','911','925','919','889','881','909','877','885','852','835','842','815','837','761','594','613','604','617','624','644','640','639','677','667','673','732','734','730','654','776','750']);//Filter Dayan
			vendorval != null && vendorval !=''? filter[ filter.length ] = new nlobjSearchFilter( 'internalid', 'vendor', 'anyof', vendorval): null;
		}
		var searchid = 'customsearch_avt_so_to_approve_2_2_3';

		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_fabric_status');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] =  new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'quantity');
		cols[ cols.length ] = new nlobjSearchColumn( 'internalid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'entityid','vendor');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_custom_fabric_details');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_vendorpicked');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_producttype');

		//var sr = nlapiSearchRecord( 'purchaseorder', searchid, filter, cols);
		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var mylist = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for(var x=0; x < sr.length; x++){
					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if( fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}
					mylist.push({
						lineuniquekey:sr[x].getValue('lineuniquekey'),
						trandate:sr[x].getValue('trandate'),
						createdfrom:sr[x].getValue('createdfrom'),
						internalid:sr[x].getValue('internalid'),
						entity:sr[x].getValue('entity'),
						internalid_vendor:sr[x].getValue('internalid','vendor'),
						vendorname:sr[x].getText('entityid','vendor'),
						custcol_so_id:sr[x].getValue('custcol_so_id'),
						custcol_tailor_client_name:sr[x].getValue('custcol_tailor_client_name'),
						item:sr[x].getValue('item'),
						itemtext: itemtext,
						quantity:sr[x].getValue('quantity'),
						custcol_avt_fabric_status:sr[x].getValue('custcol_avt_fabric_status'),
						custcol_avt_date_sent:sr[x].getValue('custcol_avt_date_sent'),
						custcol_avt_tracking:sr[x].getValue('custcol_avt_tracking')
					});
					// mylist.push(sr[x]);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000)

		var sublist = form.addSubList( 'custpage_subslist1', 'list', 'Order Lines To Approve');
		// sublist.addMarkAllButtons();
		// sublist.addField( 'custpage_choose', 'checkbox');
		sublist.addField( 'trandate', 'date', 'Date');

		var fld_line = sublist.addField( 'lineuniquekey', 'text', 'Line ID' );
		var fld_so = sublist.addField( 'createdfrom', 'select', 'Order', 'salesorder' );
		var fld_po =  sublist.addField( 'internalid', 'select', 'PO', 'purchaseorder');
		var fld_ven = sublist.addField( 'internalid_vendor', 'select', 'Vendor', 'vendor');
		var fld_cust = sublist.addField( 'entity', 'select', 'Tailor', 'customer');
		var fld_soid = sublist.addField( 'custcol_so_id', 'text', 'SO ID');
		sublist.addField( 'custcol_tailor_client_name', 'text', 'Client Name');
		var fld_item = sublist.addField( 'item', 'select', 'Item', 'item');
		var fld_itemtext = sublist.addField( 'itemtext', 'text', 'Item');
		sublist.addField( 'quantity', 'text', 'Meters');
		sublist.addField( 'custcol_avt_fabric_status', 'select', 'Fabric Status',  'customlist_avt_fabric_status_list');
		var fld_dates = sublist.addField( 'custcol_avt_date_sent', 'date', 'Date Sent');
		var fld_track = sublist.addField( 'custcol_avt_tracking', 'text', 'Tracking');
		// var fld_status = sublist.addField( 'custpage_status', 'text', 'Status');
		fld_ven.setDisplayType('inline');
		fld_item.setDisplayType( 'hidden');
		fld_itemtext.setDisplayType('inline');
		fld_line.setDisplayType( 'hidden');
		fld_soid.setDisplayType( 'inline');
		fld_so.setDisplayType( 'hidden');
		fld_po.setDisplayType( 'hidden');
		fld_cust.setDisplayType( 'inline');
		//fld_ven.setDisplayType( 'inline');
		fld_dates.setDisplayType( 'entry');
		fld_track.setDisplayType( 'entry');
		// fld_status.setDisplayType( 'entry');

		// if( sr != null && sr.length > 0 )
		// {
			// log( "toal resulsts found ", sr.length);
		// }
		sublist.setLineItemValues(mylist);

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMT_Europe = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var cmtstatus = this.request.getParameter('cmtstatus');

		var form =  nlapiCreateForm( 'CMT Purchase Order Items To Manage');
		form.addButton( 'custpage_btapprve', 'Save', 'SavePOCMT()');
		form.addButton( 'custpage_btapprve_bill', 'Bill', 'SavePOCMT(true)');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTFilter()');
		form.addButton( 'custpage_btexport', 'Export', 'ExportCMT()');
		form.setScript( 'customscript_avt_so_approval_cs');

		var fld_cmtstatus = form.addField( 'custpage_cmtstatus', 'multiselect', 'CMT Stage');
		fld_cmtstatus.addSelectOption('8','Confirmed');
		fld_cmtstatus.addSelectOption('4','Error');
		fld_cmtstatus.setDisplaySize('150', '2');


		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Expected Shipping');

		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		if(cmtstatus){
			fld_cmtstatus.setDefaultValue(cmtstatus.split(','));
		}

		var context = nlapiGetContext();
		var tailorRegion = context.getSetting('SCRIPT', 'custscript_cmt_tailor_region_eu');	//Retrieve the Tailor Region from the script parameter

		//Perform a Tailor search filtered by EU region
		searchTailors(tailorRegion);

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrders({'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';
		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval,'cmtstatus':cmtstatus}, uniqueTailorIDs);

		}

		//Create a hidden field to hold the value of total tailors
		var totalTailors = form.addField('custpage_total_tailors', 'text', 'Total Tailors');
		totalTailors.setDisplayType('hidden');

		//Populate the Total Tailors field
		if (tailorList != null && tailorList != ''){
			totalTailors.setDefaultValue(tailorList.length);
		} else {
			totalTailors.setDefaultValue(0);
		}

		this.response.writePage( form);

	};
	this.Form_Approval_POLineCMTBilledEurope = function()
	{
		var dateval = this.request.getParameter('expecteddatesent');
		var form =  nlapiCreateForm( 'CMT Purchase Order Items Billed');
		form.addButton( 'custpage_btfilter', 'Filter', 'POCMTBilledFilter()');
		form.setScript( 'customscript_avt_so_approval_cs');


		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}

		//Perform a Tailor search filtered by Tailor region
		searchTailors(1);	//Tailor Region: EU

		var uniqueTailorIDs = _.uniq(_.pluck(tailorList, 'id'));	//tailorList is a universal variable that is populated on searchTailors
		log('uniqueTailorIDs', uniqueTailorIDs);

		//Create tabs in multiples of 10
		var tabIndex = 0;
		var tabID = '';

		//Perform a Purchase Order Search to retrieve the data to populate the sublist
		searchCMTPurchaseOrdersBilled({'dateval':dateval}, uniqueTailorIDs);

		for (var tailorIndex = 0; tailorIndex < tailorList.length; tailorIndex++){	//Loop through the TailorList to build a tab and sublist for each tailor

			if (tailorIndex % 10 == 0){	//Create a new tab for tailors divisible by 10
				tabID = 'custpage_page'+tabIndex;
				tabID = tabID.toString();
				var tabFirstLetter = tailorList[tailorIndex].name.substring(0,1);
				var tabMaxIndex = tailorIndex + 9;
				log('tabMaxIndex', tabMaxIndex + ' - tailorList.length: ' + tailorList.length);
				if (tabMaxIndex >= tailorList.length){
					tabMaxIndex = tailorList.length - 1;
				}
				log('tabMaxIndex after', tabMaxIndex);
				var tabLastLetter = tailorList[tabMaxIndex].name.substring(0,1);

				var tabName = tabFirstLetter + ' - ' + tabLastLetter;
				//tabName = tabName.toString();
				form.addTab(tabID, tabName);
				tabIndex++;
			}

			//Create a sublist for each tailor and use the tailorIndex as the sublist ID
			var sublistID = 'custpage_subslist'+tailorIndex;
			sublistID = sublistID.toString();
			var tailorSublist = form.addSubList(sublistID, 'list', tailorList[tailorIndex].name, tabID);

			this.generateCMTBilledSublist(tailorSublist,{'entity':tailorList[tailorIndex].id,'dateval':dateval}, uniqueTailorIDs);
		}

		/*
		form.addTab('custpage_page1','1-69');
		form.addTab('custpage_page2','71-118');
		form.addTab('custpage_page3','119-140');
		form.addTab('custpage_page4','146-166');
		form.addTab('custpage_page5','167+');
		var fld_expdatesent = form.addField( 'custpage_expecteddatesent', 'date', 'Confirmed Shipping');
		var sublist = form.addSubList( 'custpage_subslist1', 'list', '43 Jerome NL','custpage_page1');
		var sublist2 = form.addSubList( 'custpage_subslist3', 'list', '46 JEI_Spreng Menswear','custpage_page1');
		var sublist1 = form.addSubList( 'custpage_subslist2', 'list', '48 JEI_O Maggio B.V','custpage_page1');
		var sublist3 = form.addSubList( 'custpage_subslist4', 'list', '49 JEI_GORUNN','custpage_page1');
		var sublist4 = form.addSubList( 'custpage_subslist5', 'list', '51 JEI_O Maggio B.V-Hayo','custpage_page1');
		var sublist5 = form.addSubList( 'custpage_subslist6', 'list', '57 JEI_Victor Giglio','custpage_page1');
		var sublist6 = form.addSubList( 'custpage_subslist7', 'list', '58 JEI_OJK BV','custpage_page1');
		var sublist7 = form.addSubList( 'custpage_subslist8', 'list', '59 JEI_Rooks & Rocks','custpage_page1');
		var sublist14 = form.addSubList( 'custpage_subslist15', 'list', '64 JEI_Michael & Giso AMSTERDAM','custpage_page1');
		var sublist8 = form.addSubList( 'custpage_subslist9', 'list', '69 JEI_Caine Clothiers','custpage_page1');
		var sublist9 = form.addSubList( 'custpage_subslist10', 'list', '71 JEI_Bespoke Athens','custpage_page2');
		var sublist10 = form.addSubList( 'custpage_subslist11', 'list', '72 JEI_Willem Marten','custpage_page2');
		var sublist11 = form.addSubList( 'custpage_subslist12', 'list', '94 JEI_The Wardrobe','custpage_page2');
		var sublist12 = form.addSubList( 'custpage_subslist13', 'list', '95 JEI_Caccia Uomo','custpage_page2');
		var sublist13 = form.addSubList( 'custpage_subslist14', 'list', '96 JEI_Senso','custpage_page2');

		var sublist15 = form.addSubList( 'custpage_subslist16', 'list', '109 JEI_Micheal & Giso BREDA','custpage_page2');
		var sublist16 = form.addSubList( 'custpage_subslist17', 'list', '102 JEI_Emanuel Berg','custpage_page2');
		var sublist18 = form.addSubList( 'custpage_subslist19', 'list', '104 JEI_Mond of Copenhagen','custpage_page2');
		var sublist21 = form.addSubList( 'custpage_subslist22', 'list', '115 JEI_I AM LUIGI','custpage_page2');
		//var sublist17 = form.addSubList( 'custpage_subslist18', 'list', '118 JEI_Glenn Ross Puro Gusto','custpage_page2');

		//var sublist19 = form.addSubList( 'custpage_subslist20', 'list', '119 JEI_Engelska Herr','custpage_page3');
		var sublist23 = form.addSubList( 'custpage_subslist24', 'list', '121 JEI_Le Premier','custpage_page3');
		var sublist20 = form.addSubList( 'custpage_subslist21', 'list', '122 JEI_Mill Tailoring','custpage_page3');

		var sublist22 = form.addSubList( 'custpage_subslist23', 'list', '124 JEI_Thom Lisser','custpage_page3');
		var sublist24 = form.addSubList( 'custpage_subslist25', 'list', '127 JEI_Oger','custpage_page3');

		var sublist27 = form.addSubList( 'custpage_subslist28', 'list', '133 JEI_I Am Luigi Corporate','custpage_page3');
		var sublist29 = form.addSubList( 'custpage_subslist30', 'list', '136 JEI_Suitery','custpage_page3');
		var sublist25 = form.addSubList( 'custpage_subslist26', 'list', '138 JEI_ORGANIC FOREST SRL','custpage_page3');
		var sublist30 = form.addSubList( 'custpage_subslist31', 'list', '140 JEI_Tod-B Tailoring','custpage_page3');
		var sublist35 = form.addSubList( 'custpage_subslist36', 'list', '141 JEI_Atelier Wiberg','custpage_page4');
		var sublist28 = form.addSubList( 'custpage_subslist29', 'list', '146 JEI_Atelier Vinkenoog','custpage_page4');

		var sublist33 = form.addSubList( 'custpage_subslist34', 'list', '147 JEI_Max Vela','custpage_page4');
		var sublist31 = form.addSubList( 'custpage_subslist32', 'list', '150 JEI_Suittruck','custpage_page4');
		var sublist32 = form.addSubList( 'custpage_subslist33', 'list', '152 JEI_Edel Bespoke','custpage_page4');
		var sublist34 = form.addSubList( 'custpage_subslist35', 'list', '153 JEI_Mastro Sarto','custpage_page4');
		var sublist36 = form.addSubList( 'custpage_subslist37', 'list', '155 JEI_Herrenstolz','custpage_page4');
		var sublist39 = form.addSubList( 'custpage_subslist40', 'list', '159 JEI_KingsmanHouse','custpage_page4');
		var sublist37 = form.addSubList( 'custpage_subslist38', 'list', '160 JEI_Vestiti del Capo','custpage_page4');
		var sublist40 = form.addSubList( 'custpage_subslist41', 'list', '163 JEI_Crema Tailoring','custpage_page4');
		var sublist26 = form.addSubList( 'custpage_subslist27', 'list', '164 JEI_Birkhoven GmbH','custpage_page4');
		var sublist38 = form.addSubList( 'custpage_subslist39', 'list', '165 JEI_Butch Tailors','custpage_page4');
		var sublist41 = form.addSubList( 'custpage_subslist42', 'list', '167 JEI_Atelier Ruperti','custpage_page5');
		var sublist42 = form.addSubList( 'custpage_subslist43', 'list', '168 JEI_Atelier Ruperti Corporate','custpage_page5');
		var sublist43 = form.addSubList( 'custpage_subslist44', 'list', '172 JEI_Tudor Personal Tailor','custpage_page5');	//KM 15Sep2020 - Added Kerwin's update in production
		var sublist44 = form.addSubList( 'custpage_subslist45', 'list', '180 JEI_Zano Clothing','custpage_page5');	//KM 15Sep2020 - Added Kerwin's update in production



		if(dateval){
			fld_expdatesent.setDefaultValue(dateval);
		}
		this.generateCMTBilledSublist(sublist,{'entity':'594','dateval':dateval});
		this.generateCMTBilledSublist(sublist1,{'entity':'613','dateval':dateval});
		this.generateCMTBilledSublist(sublist2,{'entity':'604','dateval':dateval});

		this.generateCMTBilledSublist(sublist3,{'entity':'617','dateval':dateval});
		this.generateCMTBilledSublist(sublist4,{'entity':'624','dateval':dateval});

		this.generateCMTBilledSublist(sublist5,{'entity':'639','dateval':dateval});
		this.generateCMTBilledSublist(sublist6,{'entity':'640','dateval':dateval});
		this.generateCMTBilledSublist(sublist7,{'entity':'644','dateval':dateval});
		this.generateCMTBilledSublist(sublist8,{'entity':'667','dateval':dateval});
		this.generateCMTBilledSublist(sublist9,{'entity':'673','dateval':dateval});
		this.generateCMTBilledSublist(sublist10,{'entity':'677','dateval':dateval});
		this.generateCMTBilledSublist(sublist11,{'entity':'730','dateval':dateval});
		this.generateCMTBilledSublist(sublist12,{'entity':'732','dateval':dateval});
		this.generateCMTBilledSublist(sublist13,{'entity':'734','dateval':dateval});

		this.generateCMTBilledSublist(sublist14,{'entity':'654','dateval':dateval});
		this.generateCMTBilledSublist(sublist15,{'entity':'776','dateval':dateval});
		this.generateCMTBilledSublist(sublist16,{'entity':'750','dateval':dateval});
		//this.generateCMTBilledSublist(sublist17,{'entity':'828','dateval':dateval});
		this.generateCMTBilledSublist(sublist18,{'entity':'761','dateval':dateval});
		//this.generateCMTBilledSublist(sublist19,{'entity':'830','dateval':dateval});
		this.generateCMTBilledSublist(sublist20,{'entity':'837','dateval':dateval});
		this.generateCMTBilledSublist(sublist21,{'entity':'815','dateval':dateval});
		this.generateCMTBilledSublist(sublist22,{'entity':'842','dateval':dateval});
		this.generateCMTBilledSublist(sublist23,{'entity':'835','dateval':dateval});
		this.generateCMTBilledSublist(sublist24,{'entity':'852','dateval':dateval});
		this.generateCMTBilledSublist(sublist25,{'entity':'885','dateval':dateval});

		this.generateCMTBilledSublist(sublist27,{'entity':'877','dateval':dateval});
		this.generateCMTBilledSublist(sublist28,{'entity':'909','dateval':dateval});
		this.generateCMTBilledSublist(sublist29,{'entity':'881','dateval':dateval});
		this.generateCMTBilledSublist(sublist30,{'entity':'889','dateval':dateval});
		this.generateCMTBilledSublist(sublist31,{'entity':'919','dateval':dateval});
		this.generateCMTBilledSublist(sublist32,{'entity':'925','dateval':dateval});
		this.generateCMTBilledSublist(sublist33,{'entity':'911','dateval':dateval});
		this.generateCMTBilledSublist(sublist34,{'entity':'927','dateval':dateval});
		this.generateCMTBilledSublist(sublist35,{'entity':'891','dateval':dateval});
		this.generateCMTBilledSublist(sublist36,{'entity':'934','dateval':dateval});
		this.generateCMTBilledSublist(sublist37,{'entity':'953','dateval':dateval});
		this.generateCMTBilledSublist(sublist38,{'entity':'970','dateval':dateval});
		this.generateCMTBilledSublist(sublist39,{'entity':'951','dateval':dateval});
		this.generateCMTBilledSublist(sublist40,{'entity':'963','dateval':dateval});
		this.generateCMTBilledSublist(sublist41,{'entity':'978','dateval':dateval});
		this.generateCMTBilledSublist(sublist42,{'entity':'980','dateval':dateval});
		this.generateCMTBilledSublist(sublist26,{'entity':'966','dateval':dateval});
		this.generateCMTBilledSublist(sublist43,{'entity':'993','dateval':dateval});	//KM 15Sep2020 - Added Kerwin's update in production
		this.generateCMTBilledSublist(sublist44,{'entity':'1010','dateval':dateval});	//KM 15Sep2020 - Added Kerwin's update in production
		*/
		this.response.writePage( form);

	};
	/*
	ENDBATCH
	*/
	this.getSOLineJoin = function( createdfrom, tailor)
	{

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
		filter[ filter.length ] = new nlobjSearchFilter( 'internalid', null, 'anyof', createdfrom );
		// if(expdateval && expdateval != "")
		// filter[ filter.length ] = new nlobjSearchFilter( 'custcol_avt_expected_sent_date', null, 'within', expdateval );

		if(tailor){
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', tailor);
		}
		var cols = [];
		// cols[ cols.length ] = new nlobjSearchColumn('custitem_clothing_type','item');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_producttype');
		var search = nlapiLoadSearch('salesorder', 'customsearch_avt_so_to_approve_2_3');
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var list = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for( var x in sr )
				{
					var liningtext = sr[x].getValue('custcol_cmt_lining_text');
					var d_jacket = sr[x].getValue('custcol_designoptions_jacket'),
						d_waistcoat = sr[x].getValue('custcol_designoptions_waistcoat'),
						d_ladiesjacket = sr[x].getValue('custcol_designoptions_ladiesjacket'),
						d_trenchcoat = sr[x].getValue('custcol_designoptions_trenchcoat');
					if((d_jacket && d_jacket.indexOf('CMT Lining') != -1 )|| (d_waistcoat && d_waistcoat.indexOf('CMT Lining') != -1) ||
						(d_ladiesjacket && d_ladiesjacket.indexOf('CMT Lining') != -1 )|| (d_trenchcoat && d_trenchcoat.indexOf('CMT Lining') != -1)){

						if(liningtext && liningtext != ''){
							var liningjson = JSON.parse(liningtext);
							liningtext = "";
							for(var i=0; i<liningjson.length; i++){
								if(liningjson[i].status_text)
									liningtext+= liningjson[i].status_text;
								else
									liningtext+= 'Preparing';
								if(liningjson[i].datesent)
									liningtext+= '-'+liningjson[i].datesent;
								if(liningjson[i].tracking)
									liningtext+= '-'+liningjson[i].tracking;
								liningtext+='\n';
							}
						}
						else
							liningtext = "";
					}
					else{
						liningtext = "N/A";
					}

					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if(fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}

					var object = new Object();
					object.fab_status  = sr[x].getValue( 'custcol_avt_fabric_status');
					object.fab_datesent  = sr[x].getValue( 'custcol_avt_date_sent');
					object.fab_tracking = sr[x].getValue( 'custcol_avt_tracking');
					object.internalid  = sr[x].getValue( 'internalid');
					object.line =  sr[x].getValue( 'custcol_so_id');
					object.fab_text =  sr[x].getValue(  'custcol_avt_fabric_text');
					try{
						var line  = object.line.split('-');
						object.line = line[1];
					}catch( Error){nlapiLogExecution('error','In Line',Error);}
					object.tranid = sr[x].getValue( 'tranid');
					object.item =  sr[x].getValue( 'item');
					object.itemtext = itemtext;
					object.fab_vendor = sr[x].getText( 'mainname', 'purchaseOrder');
					object.expsentdate =  sr[x].getValue( 'custcol_avt_expected_sent_date');
					object.entity =  sr[x].getText( 'entity');
					object.entityid = sr[x].getValue('entity');
					object.custcol_avt_date_needed = sr[x].getValue('custcol_avt_date_needed');
					object.custcol_tailor_delivery_days = sr[x].getValue('custcol_tailor_delivery_days');
					object.custcol_expected_production_date = sr[x].getValue('custcol_expected_production_date');
					object.custcol_cmt_production_time = sr[x].getValue('custcol_cmt_production_time');
					object.custcol_cmt_lining_text = liningtext;
					object.custcol_confirmedshipping = sr[x].getValue('custcol_confirmedshipping');
					object.custcol_inproductiondate = sr[x].getValue('custcol_inproductiondate');
					list.push( object);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000);

		return list;
	};

	this.getAllSOLineJoin = function( createdfrom, tailorsIDs)
	{

		var filter = new Array();
		filter[ filter.length ] = new nlobjSearchFilter( 'mainline', null, 'is', 'F');
		filter[ filter.length ] = new nlobjSearchFilter( 'internalid', null, 'anyof', createdfrom );
		// if(expdateval && expdateval != "")
		// filter[ filter.length ] = new nlobjSearchFilter( 'custcol_avt_expected_sent_date', null, 'within', expdateval );

		if(tailorsIDs){
			filter[ filter.length ] = new nlobjSearchFilter( 'entity', null, 'anyof', tailorsIDs);
		}
		var cols = [];
		// cols[ cols.length ] = new nlobjSearchColumn('custitem_clothing_type','item');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_producttype');
		var search = nlapiLoadSearch('salesorder', 'customsearch_avt_so_to_approve_2_3');
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();
		var searchid = 0;
		var list = new Array();
		do{
			var sr = resultSet.getResults(searchid,searchid+1000);
			if(sr){
				for( var x in sr )
				{
					var liningtext = sr[x].getValue('custcol_cmt_lining_text');
					var d_jacket = sr[x].getValue('custcol_designoptions_jacket'),
						d_waistcoat = sr[x].getValue('custcol_designoptions_waistcoat'),
						d_ladiesjacket = sr[x].getValue('custcol_designoptions_ladiesjacket'),
						d_trenchcoat = sr[x].getValue('custcol_designoptions_trenchcoat');
					if((d_jacket && d_jacket.indexOf('CMT Lining') != -1 )|| (d_waistcoat && d_waistcoat.indexOf('CMT Lining') != -1) ||
						(d_ladiesjacket && d_ladiesjacket.indexOf('CMT Lining') != -1 )|| (d_trenchcoat && d_trenchcoat.indexOf('CMT Lining') != -1)){

						if(liningtext && liningtext != ''){
							var liningjson = JSON.parse(liningtext);
							liningtext = "";
							for(var i=0; i<liningjson.length; i++){
								if(liningjson[i].status_text)
									liningtext+= liningjson[i].status_text;
								else
									liningtext+= 'Preparing';
								if(liningjson[i].datesent)
									liningtext+= '-'+liningjson[i].datesent;
								if(liningjson[i].tracking)
									liningtext+= '-'+liningjson[i].tracking;
								liningtext+='\n';
							}
						}
						else
							liningtext = "";
					}
					else{
						liningtext = "N/A";
					}

					var fabdetjson = sr[x].getValue('custcol_custom_fabric_details')?JSON.parse(sr[x].getValue('custcol_custom_fabric_details')):'';
					var fabdet = '';

					var itemtext = sr[x].getText('item');
					if(fabdetjson){
						fabdet = 'code:'+fabdetjson.code+'<br/>collection:'+fabdetjson.collection+'<br/>vendor:'+sr[x].getText('custcol_vendorpicked');
						if(sr[x].getValue('item') == '28035' || sr[x].getValue('item') == '28034' || sr[x].getValue('item') == '28033' || sr[x].getValue('item') == '28030' ||
							sr[x].getValue('item') == '28036' || sr[x].getValue('item') == '28031' || sr[x].getValue('item') == '28032' || sr[x].getValue('item') == '253776'){
								itemtext = itemtext.replace('CMT Item',fabdetjson.collection + ' - ' + fabdetjson.code);
						}
					}
					if(sr[x].getValue('custcol_producttype') && itemtext.indexOf(sr[x].getValue('custcol_producttype')) == -1){
						itemtext += '-' + sr[x].getValue('custcol_producttype');
					}

					var object = new Object();
					object.fab_status  = sr[x].getValue( 'custcol_avt_fabric_status');
					object.fab_datesent  = sr[x].getValue( 'custcol_avt_date_sent');
					object.fab_tracking = sr[x].getValue( 'custcol_avt_tracking');
					object.internalid  = sr[x].getValue( 'internalid');
					object.line =  sr[x].getValue( 'custcol_so_id');
					object.fab_text =  sr[x].getValue(  'custcol_avt_fabric_text');
					try{
						var line  = object.line.split('-');
						object.line = line[1];
					}catch( Error){nlapiLogExecution('error','In Line',Error);}
					object.tranid = sr[x].getValue( 'tranid');
					object.item =  sr[x].getValue( 'item');
					object.itemtext = itemtext;
					object.fab_vendor = sr[x].getText( 'mainname', 'purchaseOrder');
					object.expsentdate =  sr[x].getValue( 'custcol_avt_expected_sent_date');
					object.entity =  sr[x].getText( 'entity');
					object.entityid = sr[x].getValue('entity');
					object.custcol_avt_date_needed = sr[x].getValue('custcol_avt_date_needed');
					object.custcol_tailor_delivery_days = sr[x].getValue('custcol_tailor_delivery_days');
					object.custcol_expected_production_date = sr[x].getValue('custcol_expected_production_date');
					object.custcol_cmt_production_time = sr[x].getValue('custcol_cmt_production_time');
					object.custcol_cmt_lining_text = liningtext;
					object.custcol_confirmedshipping = sr[x].getValue('custcol_confirmedshipping');
					object.custcol_inproductiondate = sr[x].getValue('custcol_inproductiondate');
					list.push( object);
				}
				searchid += sr.length;
			}
		}while(sr.length == 1000);

		soLinesList = list;

		return list;
	};

	this.ApproveSOTrigger = function()
	{

		var object = new Object();
		object.internalid  = this.request.getParameter( 'internalid');
		object.id =  this.request.getParameter(  'id');
		object.status = false;

		try
		{

			var so = nlapiLoadRecord( 'salesorder', object.internalid);
			if( so)
			{
				so.setFieldValue( 'orderstatus', 'B' );
				var context =  nlapiGetContext();
				var vendorLeadDays,monday,tuesday,wednesday,thursday,friday,saturday,sunday;
				var fabricdefault = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_default'));
				monday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_monday'));
				tuesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_tuesday'));
				wednesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_wednesday'));
				thursday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_thursday'));
				friday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_friday'));
				saturday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_saturday'));
				sunday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_sunday'));

				var itemCount = so.getLineItemCount('item');
				for (var ii=1; ii<=itemCount; ii++){
					var fabdelivery = 0;
					if(so.getLineItemValue('item','povendor',ii))
						fabdelivery = nlapiLookupField('vendor',so.getLineItemValue('item','povendor',ii),'custentity_fabric_delivery_days');
					else
						fabdelivery = fabricdefault;
					if(!fabdelivery) fabdelivery = fabricdefault;
					var receivedays = 0;
					var cmtdate = 0;
					var today = new Date();
					today.setDate(today.getDate()+1);
					today.setDate(today.getDate()+parseFloat(fabdelivery));
					switch(today.getDay().toString()){
						case '1': receivedays = monday; break;
						case '2': receivedays = tuesday; break;
						case '3': receivedays = wednesday; break;
						case '4': receivedays = thursday; break;
						case '5': receivedays = friday; break;
						case '6': receivedays = saturday; break;
						case '0': receivedays = sunday; break;
						default: 0;
					}

					today.setDate(today.getDate()+parseFloat(receivedays));
					var fabDelivered = nlapiDateToString(today);
					cmtdate = nlapiLookupField('customer',so.getFieldValue('entity'),'custentity_delivery_days');

					if(!cmtdate) cmtdate = 4;

					today.setDate(today.getDate()+parseFloat(cmtdate));
					if(today.getDay() == 6)
					today.setDate(today.getDate() + 2)
					if(today.getDay() == 0)
					today.setDate(today.getDate() + 1)
					if(so.getLineItemValue('item','povendor',ii) != '21' && so.getLineItemValue('item','povendor',ii) != '35'){
						so.selectLineItem('item', ii);
						so.setCurrentLineItemValue('item', 'custcol_fabric_delivery_days',  fabdelivery);
						so.setCurrentLineItemValue('item', 'custcol_cmt_production_time',  receivedays);
						so.setCurrentLineItemValue('item','custcol_expected_production_date', fabDelivered)
						so.setCurrentLineItemValue('item', 'custcol_expected_delivery_date',  nlapiDateToString(today));
						so.setCurrentLineItemValue('item', 'custcol_tailor_delivery_days',  cmtdate);

						so.commitLineItem('item');
					}
				}
				nlapiSubmitRecord( so, true, true);
				object.status = true;

			}
		}catch( Error)
		{
			log( "error - approving salesorder")
			if( Error instanceof nlobjError)
			{
				log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
			}
		}
		this.response.write( JSON.stringify( object));
	};

	this.ApproveSOLineTrigger = function()
	{
		var object = new Object();
		object.internalid  = this.request.getParameter( 'internalid');
		object.id =  this.request.getParameter(  'id');
		object.soid  = this.request.getParameter( 'soid');
		object.item = this.request.getParameter( 'item');
		object.lineno  = this.request.getParameter( 'lineno');
		object.status = false;
		object.save  =  this.request.getParameter( 'save');
		object.cmtno = this.request.getParameter( 'cmtno');

		var allowapproval =  true;

		if( object.save  == 'true')
		{
			try
			{
				var so = nlapiLoadRecord( 'salesorder', object.internalid);
				var allowsave  = false;
				if( so)
				{
					var count = so.getLineItemCount( 'item');
					for( var x = 1;x<=count;x++)
					{
						var line  =  so.getLineItemValue( 'item', 'custcol_so_id', x);
						var item = so.getLineItemValue( 'item', 'item', x);
						if( line == object.soid && object.item == item )
						{	so.setLineItemValue( 'item', 'custcol_avt_cmtno', x, object.cmtno);
							allowsave = true;
						}
					}
					if( allowsave)
					{
						nlapiSubmitRecord( so, true, true);
						object.status = true;
					}else
					{
						log( "unapproved");
					}

				}
			}catch( Error)
			{
				log( "Error approving line -- and approving sales order")
			}

		}
		else
		{
			try
			{

				var so = nlapiLoadRecord( 'salesorder', object.internalid);
				var allowsave  = false;
				if( so)
				{
					var count = so.getLineItemCount( 'item');
					for( var x = 1;x<=count;x++)
					{
						var line  =  so.getLineItemValue( 'item', 'custcol_so_id', x);
						var item = so.getLineItemValue( 'item', 'item', x);
						if( line == object.soid && object.item == item )
						{
							//so.setLineItemValue( 'item', 'custcol_avt_tracking', x, object.tracking);
							//so.setLineItemValue( 'item', 'custcol_avt_date_sent', x, object.datesent);
							so.setLineItemValue( 'item', 'custcol_avt_so_line_approved', x, 'T');
							allowsave = true;
						}else
						{
							if(  so.getLineItemValue( 'item', 'createpo', x) == 'Special Order' &&  so.getLineItemValue( 'item', 'custcol_avt_so_line_approved', x) == 'F' ||
									so.getLineItemValue( 'item', 'custcol_avt_so_line_approved', x) == null )
							{
								allowapproval = false;
								log( "don't allow approval", line);
							}
						}
					}
					if( allowapproval )
					{
						so.setFieldValue( 'orderstatus', 'B' );
							var context =  nlapiGetContext();
							var vendorLeadDays,monday,tuesday,wednesday,thursday,friday,saturday,sunday;
							var fabricdefault = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_default'));
							monday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_monday'));
							tuesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_tuesday'));
							wednesday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_wednesday'));
							thursday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_thursday'));
							friday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_friday'));
							saturday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_saturday'));
							sunday = parseFloat(context.getSetting('SCRIPT', 'custscript_fabric_sunday'));
							var itemCount = so.getLineItemCount('item');
							for (var ii=1; ii<=itemCount; ii++){
								var fabdelivery = 0;
								if(so.getLineItemValue('item','povendor',ii))
									fabdelivery = nlapiLookupField('vendor',so.getLineItemValue('item','povendor',ii),'custentity_fabric_delivery_days');
								else
									fabdelivery = fabricdefault;
								if(!fabdelivery) fabdelivery = fabricdefault;
								var receivedays = 0;
								var cmtdate = 0;
								var today = new Date();
								today.setDate(today.getDate()+1);
								today.setDate(today.getDate()+parseFloat(fabdelivery));
								switch(today.getDay().toString()){
									case '1': receivedays = monday; break;
									case '2': receivedays = tuesday; break;
									case '3': receivedays = wednesday; break;
									case '4': receivedays = thursday; break;
									case '5': receivedays = friday; break;
									case '6': receivedays = saturday; break;
									case '0': receivedays = sunday; break;
									default: 0;
								}

								today.setDate(today.getDate()+parseFloat(receivedays));
								var fabDelivered = nlapiDateToString(today);
								cmtdate = nlapiLookupField('customer',so.getFieldValue('entity'),'custentity_delivery_days');

								if(!cmtdate) cmtdate = 4;

								today.setDate(today.getDate()+parseFloat(cmtdate));
								if(today.getDay() == 6)
								today.setDate(today.getDate() + 2)
								if(today.getDay() == 0)
								today.setDate(today.getDate() + 1)
								if(so.getLineItemValue('item','povendor',ii) != '21' && so.getLineItemValue('item','povendor',ii) != '35'){
									so.selectLineItem('item', ii);
									so.setCurrentLineItemValue('item', 'custcol_fabric_delivery_days',  fabdelivery);
									so.setCurrentLineItemValue('item', 'custcol_cmt_production_time',  receivedays);
									so.setCurrentLineItemValue('item','custcol_expected_production_date', fabDelivered)
									so.setCurrentLineItemValue('item', 'custcol_expected_delivery_date',  nlapiDateToString(today));
									so.setCurrentLineItemValue('item', 'custcol_tailor_delivery_days',  cmtdate);

									so.commitLineItem('item');
								}
							}

					}
					if( allowsave)
					{
						nlapiSubmitRecord( so, true, true);
						object.status = true;
					}else
					{
						log( "unapproved");
					}


				}
			}catch( Error)
			{
				log( "Error approving line -- and approving sales order")
			}
		}
		this.response.write( JSON.stringify( object));
	};

	this.SaveBillPOCMT = function()
	{
		var object = new Object();
		object.internalid  = this.request.getParameter( 'internalid');
		object.id =  this.request.getParameter(  'id');
		object.lineno  = this.request.getParameter( 'lineno');
		object.cmt_datesent =  this.request.getParameter( 'cmt_datesent');
		object.cmt_tracking =  this.request.getParameter( 'cmt_tracking');
		object.item =  this.request.getParameter( 'item');
		object.fab_item =  this.request.getParameter( 'fab_item');
		object.bill = this.request.getParameter( 'bill');
		object.cmtstatus = this.request.getParameter( 'cmtstatus');
		object.soid =   this.request.getParameter( 'soid');
		object.status = false;
		object.notes = this.request.getParameter('notes');
		object.sublist = this.request.getParameter('sublist');

		try
		{

			var so = nlapiLoadRecord( 'purchaseorder', object.internalid);
			var solinekey = [];
			if( so)
			{
				var count = so.getLineItemCount( 'item');

				for( var x = 1;x<=count;x++)
				{
					var line  =  so.getLineItemValue( 'item', 'lineuniquekey', x);

					if( line == object.lineno )
					{
						solinekey.push(so.getLineItemValue('item','custcol_avt_saleorder_line_key',x));
						//so.setLineItemValue( 'item', 'custcol_avt_tracking', x, object.tracking);
						//so.setLineItemValue( 'item', 'custcol_avt_date_sent', x, object.datesent);
						//so.selectLineItem('item',x);
						so.setLineItemValue( 'item', 'custcol_avt_cmt_status',x, object.cmtstatus);
						if(object.cmtstatus == '2' && !so.getLineItemValue('item','custcol_inproductiondate',x))
							so.setLineItemValue('item','custcol_inproductiondate',x, nlapiDateToString(new Date()));
						so.setLineItemValue( 'item', 'custcol_avt_cmt_date_sent',x, object.cmt_datesent);
						if(!so.getLineItemValue('item','custcol_confirmedshipping',x))
							so.setLineItemValue('item','custcol_confirmedshipping',x,object.cmt_datesent);
						so.setLineItemValue( 'item', 'custcol_avt_cmt_tracking',x, object.cmt_tracking);
						so.setLineItemValue('item','custcol_column_notes',x,object.notes);
						if(object.bill == 'true')
						so.setLineItemValue('item','custcol_po_line_status',x,'3');
						object.text  =  so.getLineItemText( 'item', 'custcol_avt_cmt_status', x);
						if(object.cmt_datesent  != null && object.cmt_datesent != '')
						{
							object.text += '-' + object.cmt_datesent;
						}
						if( object.cmt_tracking  != null && object.cmt_tracking != '')
						{
							object.text += '-' + object.cmt_tracking;
						}

						so.setLineItemValue( 'item', 'custcol_avt_cmt_status_text',x, object.text);
						//so.commitLineItem('item');
						//Set Linked SO
						var soline = object.soid;
						if( soline != null && soline != '' )
						{
							if( true)
							{
								var sorecord = nlapiLoadRecord( 'salesorder', object.soid);
								var socount = sorecord.getLineItemCount( 'item');
								for( var y=1; y<=socount; y++)
								{
									var soline = sorecord.getLineItemValue( 'item', 'item', y);
									if( object.fab_item == soline )
									{
										//sorecord.selectLineItem('item',y);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_status',y, object.cmtstatus);
										if(object.cmtstatus == '2' && !sorecord.getLineItemValue('item','custcol_inproductiondate',y))
											sorecord.setLineItemValue('item','custcol_inproductiondate',y, nlapiDateToString(new Date()));
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_date_sent',y, object.cmt_datesent);
										if(!sorecord.getLineItemValue('item','custcol_confirmedshipping',y))
											sorecord.setLineItemValue('item','custcol_confirmedshipping',y,object.cmt_datesent);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_tracking',y, object.cmt_tracking);
										sorecord.setLineItemValue( 'item', 'custcol_avt_cmt_status_text',y, object.text);
										//sorecord.commitLineItem('item');
										try
										{
											nlapiSubmitRecord( sorecord, true, true);
											break;
										}catch( Error )
										{
											log( "Errir saving SO");
											loge(Error);

										}
									}
								}
							}
						}
						break;
					}

				}

				nlapiSubmitRecord( so, true, true);
				object.status = true;

			}
			if( object.bill == "true")
			{
				try
				{
					//var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					log( "Record transformed - going to submit...", JSON.stringify(vbrecord));
					for(var j=1; j<=vbrecord.getLineItemCount('item'); j++){
							if(solinekey.indexOf(vbrecord.getLineItemValue('item','custcol_avt_saleorder_line_key',j)) == -1)
							vbrecord.removeLineItem('item',j);
						}

					//vbrecord.setLineItemValue()
					if(vbrecord.getLineItemCount('item') >0)
					nlapiSubmitRecord( vbrecord, true, true);
				}catch( Error)
				{
					log( "Error - Transforming to vendorbill");
					if( Error instanceof nlobjError)
					{
						log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
					}
					loge(Error);
					object.status = false;
				}
			}
		}catch( Error)
		{

		}
		this.response.write( JSON.stringify( object));
	};

	this.SaveBillPOFab = function()
	{
		var object = new Object();

		object.internalid  = this.request.getParameter('internalid');
		object.item = this.request.getParameter('item');
		object.id =  this.request.getParameter('id');
		object.lineno  = this.request.getParameter('lineno');
		object.bill = this.request.getParameter('bill');
		object.tracking = this.request.getParameter('tracking');
		object.datesent = this.request.getParameter('datesent');
		object.fabstatus = this.request.getParameter('fabstatus');
		object.status = false;
		//object.notes = this.request.getParameter('notes');

		try
		{
			var so = nlapiLoadRecord('purchaseorder', object.internalid);
			var solinekey = [];
			if( so)
			{
				//so.setFieldValue( 'status', 'B');
				//nlapiSubmitRecord( so, true, true);
				var count = so.getLineItemCount('item');
				for( var x = 1;x<=count;x++)
				{
					var line  =  so.getLineItemValue( 'item', 'lineuniquekey', x);
					if( line == object.lineno )
					{
						solinekey.push(so.getLineItemValue('item','custcol_avt_saleorder_line_key',x));
						so.setLineItemValue( 'item', 'custcol_avt_tracking', x, object.tracking);
						so.setLineItemValue( 'item', 'custcol_avt_date_sent', x, object.datesent);
						so.setLineItemValue( 'item', 'custcol_avt_fabric_status', x, object.fabstatus);
						if( object.bill == "true")
						so.setLineItemValue( 'item', 'custcol_po_line_status', x, '3');
						//so.setLineItemValue('item','custcol_column_notes',x,object.notes);
						//var text  = so.getLineItemText( 'item', 'custcol_avt_fabric_status', x) +'-' +
						//so.getLineItemValue( 'item', 'custcol_avt_date_sent', x) + '-' +
						//so.getLineItemValue( 'item', 'custcol_avt_tracking', x) + '-' +

						object.text  =  so.getLineItemText( 'item', 'custcol_avt_fabric_status', x);
						if(object.datesent  != null && object.datesent != '')
						{
							object.text += '-' + object.datesent;
						}
						if( object.tracking  != null && object.tracking != '')
						{
							object.text += '-' + object.tracking;
						}


						so.setLineItemValue( 'item', 'custcol_avt_fabric_text', x, object.text);

						//Set Linked SO
						var soline =  so.getLineItemValue( 'item', 'custcol_so_id', x);
						if( soline != null && soline != '' )
						{
							var id  = soline.split( '-');
							if( id != null && id.length > 0)
							{
								var sorecord = nlapiLoadRecord( 'salesorder', so.getFieldValue( 'createdfrom'));
								var socount = sorecord.getLineItemCount('item');
								for( var y=1; y<=socount; y++)
								{
									var soline = sorecord.getLineItemValue( 'item', 'item', y);
									if( object.item == soline)
									{
										sorecord.setLineItemValue( 'item', 'custcol_avt_tracking', y, object.tracking);
										sorecord.setLineItemValue( 'item', 'custcol_avt_date_sent', y, object.datesent);
										sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_status', y, object.fabstatus);
										sorecord.setLineItemValue( 'item', 'custcol_avt_fabric_text', y, object.text);

										try
										{
											nlapiSubmitRecord( sorecord, true, true);
											break;
										}catch( Error )
										{
											log( "Errir saving SO");
											loge(Error);

										}
									}
								}
							}
						}
						break;

					}
				}

				nlapiSubmitRecord( so, true, true);
				object.status = true;

			}
			if( object.bill == "true")
			{
				try
				{
					//var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					var vbrecord  = nlapiTransformRecord( 'purchaseorder', object.internalid, 'vendorbill', {recordmode:'dynamic'});
					log( "Record transformed - going to submit...", JSON.stringify(vbrecord));
					//log('sokey',solinekey.toString());
						for(var j=1; j<=vbrecord.getLineItemCount('item'); j++){
							if(solinekey.indexOf(vbrecord.getLineItemValue('item','custcol_avt_saleorder_line_key',j)) == -1)
							vbrecord.removeLineItem('item',j);
						}

					//vbrecord.setLineItemValue()
					if(vbrecord.getLineItemCount('item') >0)
					nlapiSubmitRecord( vbrecord, true, true);
				}catch( Error)
				{
					log( "Error - Transforming to vendorbill");
					if( Error instanceof nlobjError)
					{
						log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
					}
					loge(Error);
					object.status = false;
				}
			}
		}catch( Error)
		{
			log( "Error - saving PO")
			loge(Error);
		}
		this.response.write( JSON.stringify( object));
	};


};

function searchCMTPurchaseOrders(parameters, tailorsIDs){
	try {

		log('parameters.dateval', parameters.dateval + ' - parameters.cmtstatus: ' + parameters.cmtstatus);

		var filter = new Array();
		filter.push(new nlobjSearchFilter( 'mainline', null, 'is', 'F'));

		if(parameters.dateval){
			filter.push(new nlobjSearchFilter( 'custcol_avt_cmt_date_sent', null, 'on', parameters.dateval));
		}
		if(parameters.cmtstatus){
			filter.push(new nlobjSearchFilter( 'custcol_avt_cmt_status', null, 'anyof', parameters.cmtstatus.split(',')));
		}
		filter.push(new nlobjSearchFilter('entity','createdfrom','anyof',tailorsIDs));

		var searchid = 'customsearch_avt_so_to_approve_2_2_2';

		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);

		var resultSet = search.runSearch();

		searchResultList = resultSet;
		log('resultSet', resultSet);


	} catch (e){
		log('An error occurred on searchCMTPurchaseOrders()', e);
	}
}

function searchCMTPurchaseOrdersBilled(parameters, tailorsIDs){
	try {

		log('parameters.dateval', parameters.dateval);

		var filter = new Array();
		filter.push(new nlobjSearchFilter( 'mainline', null, 'is', 'F'));

		if(parameters.dateval){
			filter.push(new nlobjSearchFilter( 'custcol_avt_cmt_date_sent', null, 'on', parameters.dateval));
		}
		/*if(parameters.cmtstatus){
			filter.push(new nlobjSearchFilter( 'custcol_avt_cmt_status', null, 'anyof', parameters.cmtstatus.split(',')));
		}*/
		filter.push(new nlobjSearchFilter('entity','createdfrom','anyof',tailorsIDs));

		var searchid = 'customsearch_avt_so_to_approve_2_2_2_2';
		var cols = new Array();
		cols[ cols.length ] =  new nlobjSearchColumn( 'trandate');
		cols[ cols.length ] =  new nlobjSearchColumn( 'tranid');
		//cols[ cols.length ] =  new nlobjSearchColumn( 'period');
		cols[ cols.length ] =  new nlobjSearchColumn( 'entity');
		cols[ cols.length ] =  new nlobjSearchColumn( 'internalid');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_so_id');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custbody_avt_salesorder_ref');
		cols[ cols.length ] =  new nlobjSearchColumn( 'createdfrom');
		cols[ cols.length ] =  new nlobjSearchColumn( 'item');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_tracking');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_date_sent');
		cols[ cols.length ] =  new nlobjSearchColumn( 'custcol_avt_cmt_status');
		cols[ cols.length ] = new nlobjSearchColumn( 'lineuniquekey');
		cols[ cols.length ] = new nlobjSearchColumn( 'custcol_tailor_client_name');
		cols[ cols.length ] = new nlobjSearchColumn('custcol_column_notes');

		var search = nlapiLoadSearch('purchaseorder', searchid);
		search.addFilters(filter);
		search.addColumns(cols);
		var resultSet = search.runSearch();

		searchResultList = resultSet;
		log('resultSet', resultSet);


	} catch (e){
		log('An error occurred on searchCMTPurchaseOrders()', e);
	}
}

function searchTailors(tailorRegion){
	try {

		var customerSearch = nlapiSearchRecord("customer",null,
			[
			   ["isperson","is","F"],
			   "AND",
			   ["parent","anyof","@NONE@"],
			   "AND",
			   ["custentity_cmt_tailor_region","anyof",tailorRegion],
			   "AND",
			   ["isinactive","is","F"]
			],
			[
			   new nlobjSearchColumn("entityid"),
			   new nlobjSearchColumn("isperson"),
			   new nlobjSearchColumn("altname"),
			   new nlobjSearchColumn("companyname"),
			   new nlobjSearchColumn("custentity_cmt_dashboard_name").setSort(false),
			   new nlobjSearchColumn("shipaddress"),
			   new nlobjSearchColumn("shipcountry"),
			   new nlobjSearchColumn("custentity_cmt_tailor_region")
			]
		);


		if (customerSearch != null && customerSearch.length > 0){
			log('customerSearch length', customerSearch.length);
			for (var i = 0; i < customerSearch.length; i++){
				tailorList.push({
					id: customerSearch[i].id,
					name: customerSearch[i].getValue('custentity_cmt_dashboard_name')
				});
			}
		}


	} catch (e){
		log('An error occurred on searchTailors()', e);
	}
};

var log  = function(  param1, param2 )
{
	try{
		nlapiLogExecution( 'Debug', param1,param2);
	}catch( Error){}

};

var loge  =function( Error)
{
	if( Error instanceof nlobjError)
	{
		log( "error", Error.getStackTrace() + ' ' + Error.getDetails() );
	}else
	{
		log( "error object not found");
	}
};
