define('SspLibraries.CompileJob.Test'
,	[
		'SspLibraries.CompileJob'
	,	'ExtensionMechanism.TestData'
	]
,	function (
		SspLibrariesCompileJob
	,	TestData
	)
{
	'use strict';

	return describe('SspLibraries.CompileJob.Test test', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;
		});

		describe('Compile ssp libraries', function ()
		{
			it('should compile ssp libraries', function (done)
			{

				var extension1_manifest = TestData.getManifestByName('Extension1')
				,	extension2_manifest = TestData.getManifestByName('Extension2')
				;

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
							,	manifest: extension1_manifest
							}
						,	{
								extension_id: '23'
							,	priority: '4'
							,	manifest_id: '7'
							,	manifest: extension2_manifest
							}
						]
					}
				}
				,	compiled_ssp = TestData.compiled_ssp_libraries;
				
				expect(SspLibrariesCompileJob.job_id).toBeDefined();
				expect(SspLibrariesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SspLibrariesCompileJob.job_id
				,	url: url
				,	extensions: extensions
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var ssp_done = function sspDone(result)
				{
					if(result.error)
					{
						fail(new Error(result.error));
						console.error(result.error);
						done();
					}
					else
					{
						expect(result.error).toBeUndefined();
						expect(result.files).toBeDefined();
						expect(result.use_strict).toBeDefined();
						
						expect(result.use_strict).toBe(true);
						expect(result.files.length).toEqual(1);
						
						expect(percent).toEqual(100);
						
						expect(_.first(result.files).name).toEqual('ssp_libraries_ext.js');
						expect(_.first(result.files).content).toEqual(compiled_ssp);
						
						done();
					}	
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SspLibrariesCompileJob.workerJob(input, ssp_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile ssp libraries if manifests without folder are given', function (done)
			{

				var extension1_manifest = TestData.getManifestNoFolderByName('Extension1')
				,	extension2_manifest = TestData.getManifestNoFolderByName('Extension2')
				;

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
							,	manifest: extension1_manifest
							}
						,	{
								extension_id: '23'
							,	priority: '4'
							,	manifest_id: '7'
							,	manifest: extension2_manifest
							}
						]
					}
				}
				,	compiled_ssp = TestData.compiled_ssp_libraries;
				
				expect(SspLibrariesCompileJob.job_id).toBeDefined();
				expect(SspLibrariesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SspLibrariesCompileJob.job_id
				,	url: url
				,	extensions: extensions
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var ssp_done = function sspDone(result)
				{
					if(result.error)
					{
						fail(new Error(result.error));
						console.error(result.error);
						done();
					}
					else
					{
						expect(result.error).toBeUndefined();
						expect(result.files).toBeDefined();
						expect(result.use_strict).toBeDefined();
						
						expect(result.use_strict).toBe(true);
						expect(result.files.length).toEqual(1);
						
						expect(percent).toEqual(100);
						
						expect(_.first(result.files).name).toEqual('ssp_libraries_ext.js');
						expect(_.first(result.files).content).toEqual(compiled_ssp);
						
						done();
					}	
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SspLibrariesCompileJob.workerJob(input, ssp_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should generate syntactically valid javacript code', function (done)
			{

				var extension1_manifest = TestData.getManifestByName('Extension1')
				,	extension2_manifest = TestData.getManifestByName('Extension2')
				;

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
							,	manifest: extension1_manifest
							}
						,	{
								extension_id: '23'
							,	priority: '4'
							,	manifest_id: '7'
							,	manifest: extension2_manifest
							}
						]
					}
				};
				
				
				var input = {
					job_name: SspLibrariesCompileJob.job_id
				,	url: url
				,	extensions: extensions
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var ssp_done = function sspDone(result)
				{
					try
					{
						esprima.parse(_.first(result.files).content);
						done();
					}
					catch(error)
					{
						fail(error);
						console.error(error);
					}
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SspLibrariesCompileJob.workerJob(input, ssp_done, progress);
				}
				catch(error)
				{
					fail(error);
					console.error(error);
				}
			});

		});

	});
	
});