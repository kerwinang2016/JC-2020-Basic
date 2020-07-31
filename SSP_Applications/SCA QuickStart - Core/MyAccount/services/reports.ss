function service (request)
{
  'use strict';
  var method = request.getMethod()
  switch (method)
  {
    case 'GET':
      var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
      var action = request.getParameter('action');
      var tailor = request.getParameter('tailor');
      if(action){
        switch(request.getParameter('action')){
          case "marginreport":
            var response = nlapiRequestURL(url+"&action="+action+"&page=0&tailor="+tailor);
    				//var result = JSON.parse(response.getBody());
            Application.sendContent(response.getBody());
          break;
          case "lineordertypereport":
            var response = nlapiRequestURL(url+"&action="+action+"&page=0&tailor="+tailor);
            //var result = JSON.parse(response.getBody());
            Application.sendContent(response.getBody());
          break;
        }
      }
      //page,parent
      //Date, Order Number, Client Name, Item, Retail Price, Fabric Cogs, CMT COGS, Shipping, Duties, Total Margin, Margin%
      break;
    case 'PUT':
      var action = request.getParameter('action');
      if(action){
        switch(action){
          case "updatelineordertype":
            var url = nlapiResolveURL('SUITELET','customscript_myaccountsuitelet',1,true);
            var data = {
              internalid: request.getParameter('internalid'),
              ordertypeid: request.getParameter('ordertypeid'),
              soid: request.getParameter('soid')
            };
            //nlapiLogExecution('debug','data',JSON.stringify(data));
            var tailor = request.getParameter('tailor');
            var response = nlapiRequestURL(url+"&action="+action,data,null,'PUT');
            //var result = JSON.parse(response.getBody());
            Application.sendContent(response.getBody());
          break;
          default:
        }
      }
      break;
    default:
  }
}
