/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/url'],
    function(url) {
      function onRequest(context) {
        var domain = url.resolveDomain({
          hostType: url.HostType.APPLICATION,
        });
        var domainText = '{"backendAccountDomain":"' + domain + '"}';
        context.response.setHeader('Content-Type', 'application/json');
        context.response.writeLine(domainText);
	  };
	  return {
        onRequest: onRequest
      };
    }
);