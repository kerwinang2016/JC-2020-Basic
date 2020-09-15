/**
 *@NApiVersion 2.x
 */
define(
    [
	]
,	function (
	)
{
	var request_helper =  {

		reslet_mode: false
		
	,	MAX_RETRIES: 3
		
	,	credentials: null

	,	setCredentials: function setCredentials(credentials)
		{
			this.credentials = credentials;
		}

	, 	request: function request(options)
		{
			var self = this
			,	promise = new Promise(function(resolve, reject)
				{
					var	req = new XMLHttpRequest();

					if(options.timeout)
					{
						req.timeout = options.timeout * 1000;
					}
					
					req.open(options.method, options.url, true); 

					if(self.reslet_mode)
					{
						var auth_header = 'NLAuth nlauth_account=' + self.credentials.account + ', ' +
                            'nlauth_email=' + self.credentials.email + ', ' +
                            'nlauth_signature=' + encodeURIComponent(self.credentials.password) + ', ' +
                            'nlauth_role=' + self.credentials.roleId;

						req.setRequestHeader('Debug', 'true');
						req.setRequestHeader('Accept', '*/*');
						req.setRequestHeader('Accept-Language', 'en-us');
						req.setRequestHeader('Authorization', auth_header);
						req.setRequestHeader('Content-Type', 'application/json');
					}

					req.onload = function onLoad()
					{
						var response = '';
						try
						{
							response = JSON.parse(req.responseText);
							
							if(response.header.status.code !== 'SUCCESS')
							{
								console.log(response);
                                
                                var error; 
                                if(options.full_error_response)
                                {
                                    error = response.header.status.message || response;
                                }
                                else
                                {
                                    error = response.header.status.message || response.message;
                                }
                                
								return reject(error);
							}
						}
						catch(e)
						{
							response = req.responseText;
							return reject(response);
						}

						resolve(response);
					};

					req.onerror = function onError(e)
					{
						reject(e.type !== 'timeout' ? req.statusText: 'Request timeout');
					};

					req.onreadystatechange = function onreadystatechange() {
						if(req.readyState === 4  && req.status === 0 && req.response === '')
						{
							return reject('Network Error. Please, check your Internet connection.');
						}
						else if(req.readyState === 0 && req.status === 0 && req.response === '')
						{
							return reject('Network Error. Please, check your Internet connection.');
						}
                    };

					req.onabort = req.onerror;
					req.ontimeout = req.onerror;
					
					if(req.readyState === 0 && req.status === 0 && req.response === '')
					{
						return reject('Network Error. Please, check your Internet connection.');
					}
					else
					{
						req.send(options.data);
					}
				})
				.catch(function(error)
				{
					//HEADS UP! cannot use || here because options.retries could be 0
					options.retries = (_.isUndefined(options.retries) ? self.MAX_RETRIES : options.retries) - 1;
					if(options.retries > 0)
					{
						console.log('Retrying... ' + options.retries + ' left.');
						return self.request(options);
					}
			
					return Promise.reject(error);
				});

			return promise;
		}
	};

    return request_helper;
});
