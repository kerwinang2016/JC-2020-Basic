function service (request)
{
  'use strict';
  nlapiLogExecution('debug','payment requestbody',request.getBody());
  var body = unescape(request.getBody()).split('&');
  var data = {};
  data.apiOperation = body[0].split('=')[1];
  
  data.order = {
    currency:body[1].split('=')[1],
    id:body[2].split('=')[1],
    amount:body[3].split('=')[1]
  }
  //var data = JSON.parse(request.getBody() || '{}');
  var method = request.getMethod()
  switch (method)
  {
    case 'POST':
    //userid netsuite pwd Jerome1234!
      var paymenturl = 'https://paymentgateway.commbank.com.au/api/rest/version/46/merchant/JERCLOMCC201/session';
      var response = nlapiRequestURL(paymenturl,JSON.stringify(data), {'Authorization':'Basic bWVyY2hhbnQuSkVSQ0xPTUNDMjAxOjhhYjUzNmQ2MjM0NDdhNzg0NmZiYjUzYzVhZDEyODFm'});
      Application.sendContent(response.getBody());
      break;
    default:
  }
}
