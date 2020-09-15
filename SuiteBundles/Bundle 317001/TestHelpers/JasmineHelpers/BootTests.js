var BootTests = {

	initRequestHelper: function initRequestHelper(done)
	{
		var RequestHelper = require('../../../../../DevTools/gulp/extension-mechanism/client-script/RequestHelper');
		RequestHelper.setCredentials(TestConfiguration.credentials);
		RequestHelper.reslet_mode = true;

		this.file_reslet_url = BootTests.getServiceUrl('230','1');
		this.website_reslet_url = '';
		done();
	}

,	getServiceUrl: function getServiceUrl(script_id, deploy_num)
	{
		return 'http://localhost:8888/proxy/https://rest.netsuite.com/app/site/hosting/restlet.nl?script=' + script_id + '&deploy=' + deploy_num;
	}
};

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
beforeEach(BootTests.initRequestHelper);
