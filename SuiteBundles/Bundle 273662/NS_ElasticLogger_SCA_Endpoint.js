/**
 * A suitelet for logging data on Elasticsearch
 *
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/internal/elasticLogger']
	, function (loggerFactory)
	{
		'use strict';

		function onRequest(context)
		{
			try
			{
				var data = JSON.parse(context.request.body);

				if (!data)
				{
					throw 'No data on body request';
				}

				LogData(data, function () {
					ResolveRequest(context, {}, 200);
				});
			}
			catch (e)
			{
				ResolveRequest(context, e, 500);
			}
		}

		function LogData(data, cb)
		{
			var logger
			,	application_type
			,	logger_return_data = {
					notifications: []
				,	response: {}
				};

			if (data.type === 'SCA') {
				application_type = loggerFactory.Type.SCA;
			}
			else if (data.type === 'SCS')
			{
				application_type = loggerFactory.Type.SCS;
			}
			else
			{
				application_type = loggerFactory.Type.SCIS;
			}

			logger = loggerFactory.create({
				'type': application_type
			});

			if (data.info)
			{
				for (var i = 0; i < data.info.length; i++)
				{
					logger.info(data.info[i]);
				}
			}

			if (data.error)
			{
				for (var i = 0; i < data.error.length; i++)
				{
					logger.error(data.error[i]);
				}
			}

			cb();
		}

		function ResolveRequest(context, options, status_code)
		{
			context.response.setHeader(
			{
				name: 'Content-Type'
			,	value: 'application/json'
			});

			context.response.setHeader(
			{
				name: 'Custom-Header-Status'
			,	value: status_code
			});

			context.response.write(JSON.stringify(options));
		}

		return {
			onRequest: onRequest
		};
	}
);