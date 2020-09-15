define('Templates.CompileJob.Test'
,	[
		'Templates.CompileJob'
	,	'ExtensionMechanism.TestData'
	,	'FileServiceClient'
	]
,	function (
		TemplatesCompileJob
	,	TestData
	,	FileServiceClient
	)
{
	'use strict';

	return describe('Templates.CompileJob test', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;

			FileServiceClient.getInstance().clearCache();
		});

		describe('Compile templates files', function ()
		{
			it('should compile templates files', function (done)
			{
				var manifests = TestData.manifests
				,	compiled_tpl = TestData.compiled_shopping_tpl;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tplDone(result)
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
						
						expect(result.files_extension).toEqual('js');
						expect(result.files.length).toEqual(3);

						expect(percent).toEqual(100);
						expect(_.first(result.files).content.trim()).toEqual(compiled_tpl);
						expect(result.files[1].content).toEqual(TestData.compiled_default_tpl);
						expect(result.files[2].content).toEqual(TestData.compiled_default_tpl);
						
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
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile templates files if manifests without folder are given', function (done)
			{
				var manifests = TestData.manifests_without_folder
				,	compiled_tpl = TestData.compiled_shopping_tpl;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tplDone(result)
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
						
						expect(result.files_extension).toEqual('js');
						expect(result.files.length).toEqual(3);

						expect(percent).toEqual(100);
						expect(_.first(result.files).content.trim()).toEqual(compiled_tpl);
						expect(result.files[1].content).toEqual(TestData.compiled_default_tpl);
						expect(result.files[2].content).toEqual(TestData.compiled_default_tpl);
						
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
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should fail if no javascript-libs.js file found', function (done)
			{
				var manifests = TestData.manifests;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/NoJs_libs'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tplDone(result)
				{
					expect(result.error).toBeDefined();
					expect(result.error).toEqual('MySSPApplication/NoJs_libs/javascript-libs.js not found');
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should generate syntactically valid javacript code', function (done)
			{

				var manifests = TestData.manifests;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
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
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail(error);
					console.error(error);
				}
			});

		});

		describe('Compile overrides', function ()
		{
			it('should compile overrides of the theme manifest', function (done)
			{
				var manifests = TestData.manifests_templates_override
				,	compiled_templates_override = TestData.compiled_templates_override
				;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}

					expect(result.files.length).toEqual(3);
					expect(result.files[0].name).toEqual('shopping-templates');
					expect(result.files[0].content).toEqual(compiled_templates_override);
					expect(result.files[0].content).toContain('IS LESS THAN $0');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile overrides of a theme manifest without template folder field', function (done)
			{
				var manifests = TestData.manifests_templates_override_folder_optional
				,	compiled_templates_override_folder_optional = TestData.compiled_templates_override_folder_optional
				;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}
					
					expect(result.files[0].name).toEqual('shopping-templates');
					expect(result.files[0].content).toEqual(compiled_templates_override_folder_optional);
					expect(result.files[0].content).toContain('IS LESS THAN $0');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should throw error if dst file exists and src does not', function (done)
			{
				var manifests = TestData.manifests_templates_override_file_src_not_exist;
				
				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
				{
					if(result.error)
					{
						expect(result.error).toBeDefined();
						expect(result.error).toContain('Could not find overriding file ');
						done();
						return;
					}

					done(new Error('It should not finish compilation successfully'));
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should not throw error if dst file not exists, or not activating that extension and compile without overrides', function (done)
			{
				var manifests = TestData.manifests_templates_override_file_dst_not_exist
				,	compiled_tpl = TestData.compiled_shopping_tpl
				;

				expect(TemplatesCompileJob.job_id).toBeDefined();
				expect(TemplatesCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}
					
					expect(result.files[0].name).toEqual('shopping-templates');
					expect(_.first(result.files).content.trim()).toEqual(compiled_tpl);
					expect(result.files[0].content).toContain('IS LESS THAN $100');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should throw error if files that are not .tpl are declared in the overriding of templates', function (done)
			{
				var manifests = TestData.manifests_templates_override_file_invalid_extension;
				
				var input = {
					job_name: TemplatesCompileJob.job_id
				,	url: url
				,	folder: 'MySSPApplication/KilimanjaroTest'
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var tpl_done = function tpl_done(result)
				{
					if(result.error)
					{
						expect(result.error).toBeDefined();
						expect(result.error).toContain('Error: You can only override .tpl files in the templates override section');
						done();
						return;
					}

					done(new Error('It should not finish compilation successfully'));
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					TemplatesCompileJob.workerJob(input, tpl_done, progress);
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