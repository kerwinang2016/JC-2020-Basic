define('Configuration.CompileJob.Test'
,	[
		'Configuration.CompileJob'
	,	'ExtensionMechanism.TestData'
	]
,	function (
		ConfigurationCompileJob
	,	TestData
	)
{
	'use strict';

	return describe('Configuration.CompileJob.Test test', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;
		});

		describe('Compile configuration', function ()
		{
			it('should compile configuration', function (done)
			{
				var extensions = {
					'3': {
						activation_id: '3'
					,	domain: 'domain1.com.uy'
					,	website_id: '8'
					,	extensions: [
							{
								extension_id: '22'
							,	priority: '1'
							,	manifest_id: '6'
							,	manifest: TestData.getManifestByName('Extension1')
							}
						,	{
								extension_id: '23'
							,	priority: '4'
							,	manifest_id: '7'
							,	manifest: TestData.getManifestByName('Extension3')
							}
						]
					}
				}
				,	compiled_configuration = TestData.compiled_configuration
				,	compiled_configuration_manifest = TestData.compiled_configuration_manifest;

				expect(ConfigurationCompileJob.job_id).toBeDefined();
				expect(ConfigurationCompileJob.workerJob).toBeDefined();

				var manifests = TestData.manifests;

				var input = {
					job_name: ConfigurationCompileJob.job_id
				,	url: url
				,	extensions: extensions
				,	manifests: manifests
				,	folder: 'MySSPApplication/MountainX'
				,	domain: 'domain1.com.uy'
				};

				var percent = 0;

				var configuration_done = function configuration_done(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}

					expect(result.error).toBeUndefined();
					expect(result.files).toBeDefined();
					expect(result.use_strict).toBeDefined();

					expect(result.use_strict).toBe(true);
					expect(result.files.length).toEqual(2);

					expect(percent).toEqual(100);

					expect(result.files[0].name).toEqual('configurationManifest-domain1.com.uy.json');
					expect(result.files[1].name).toEqual('defaultValues');
					expect(result.files[1].concat_with).toEqual('ssp_libraries_ext.js');

					expect(result.files[0].content).toEqual(compiled_configuration_manifest);
					expect(result.files[1].content.replace(/\r\n/g, '\n')).toEqual(compiled_configuration);

					done();
				};

				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();

					data.percent && (percent += data.percent);
				};

				try
				{
					ConfigurationCompileJob.workerJob(input, configuration_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});
		});

	});

});
