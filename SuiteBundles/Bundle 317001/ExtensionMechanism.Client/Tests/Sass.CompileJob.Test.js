define('Sass.CompileJob.Test'
,	[
		'Sass.CompileJob'
	,	'ExtensionMechanism.TestData'
	]
,	function (
		SassCompileJob
	,	TestData
	)
{
	'use strict';

	return describe('Sass.CompileJob.Test test', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;
		});

		describe('Compile sass', function ()
		{
			it('should compile sass', function (done)
			{
				var manifests = TestData.manifests
				,	compiled_css = TestData.compiled_sass
				,	compiled_css_ie = TestData.compiled_sass_ie
				,	ie_files_statement = TestData.ie_files_statement
				;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
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
						expect(result.files_extension).toBeDefined();
						expect(result.files.length).toEqual(3);
						expect(result.files_extension).toEqual('css');
						
						expect(percent).toEqual(100);
						expect(result.files[0].content.trim()).toEqual(compiled_css);
						expect(result.files[0].name).toEqual('shopping');
						expect(typeof result.files[0].content).toBe('string');

						expect(result.files[1].content.trim()).toEqual(compiled_css_ie);
						expect(result.files[1].name).toEqual('ie_shopping_0');

						expect(result.files[2].content.trim()).toEqual(ie_files_statement);
						expect(result.files[2].name).toEqual('IE_files');

						try
						{
							esprima.parse(result.files[2].content);
							done();
						}
						catch(error)
						{
							fail(error);
							console.error(error);
						}
					}
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile sass if manifests without folder are given', function (done)
			{
				var manifests = TestData.manifests_without_folder
				,	compiled_css = TestData.compiled_sass
				,	compiled_css_ie = TestData.compiled_sass_ie
				,	ie_files_statement = TestData.ie_files_statement
				;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
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
						expect(result.files_extension).toBeDefined();
						expect(result.files.length).toEqual(3);
						expect(result.files_extension).toEqual('css');
						
						expect(percent).toEqual(100);
						expect(result.files[0].content.trim()).toEqual(compiled_css);
						expect(result.files[0].name).toEqual('shopping');
						expect(typeof result.files[0].content).toBe('string');

						expect(result.files[1].content.trim()).toEqual(compiled_css_ie);
						expect(result.files[1].name).toEqual('ie_shopping_0');

						expect(result.files[2].content.trim()).toEqual(ie_files_statement);
						expect(result.files[2].name).toEqual('IE_files');

						try
						{
							esprima.parse(result.files[2].content);
							done();
						}
						catch(error)
						{
							fail(error);
							console.error(error);
						}
					}
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

		});
		
		describe('Compile overrides', function()
		{
			it('should compile overrides of the theme manifest', function (done)
			{
				var manifests = TestData.manifests_sass_override
				,	compiled_sass_override = TestData.compiled_sass_override
				;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}

					expect(result.files[0].name).toEqual('shopping');
					expect(result.files[0].content).toEqual(compiled_sass_override);
					expect(result.files[0].content).toContain('body nav ul{margin:0;padding:0;list-style:none;color:green}');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile overrides of a theme manifest without sass folder field', function (done)
			{
				var manifests = TestData.manifests_sass_override_folder_optional
				,	compiled_sass_override = TestData.compiled_sass_override_folder_optional
				;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}
					
					expect(result.files[0].name).toEqual('shopping');
					expect(result.files[0].content).toEqual(compiled_sass_override);
					expect(result.files[0].content).toContain('body nav ul{margin:0;padding:0;list-style:none;color:green}');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should throw error if dst file exists and src does not', function (done)
			{
				var manifests = TestData.manifests_sass_override_file_src_not_exist;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
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
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should not throw error if dst file not exists, or not activating that extension and compile without overrides', function (done)
			{
				var manifests = TestData.manifests_sass_override_file_dst_not_exist
				,	compiled_sass_override = TestData.compiled_sass_override_folder_optional
				;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	activation_id: '46'
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
				{
					if(result.error)
					{
						done(new Error(result.error));
						console.error(result.error);
						return;
					}
					
					expect(result.files[0].name).toEqual('shopping');
					expect(result.files[0].content).toEqual(compiled_sass_override);
					expect(result.files[0].content).toContain('body nav ul{margin:0;padding:0;list-style:none;color:green}');
					
					done();
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					
					data.percent && (percent += data.percent);
				};
				
				try
				{
					SassCompileJob.workerJob(input, sass_done, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should throw error if files that are not .scss are declared in the overriding of sass', function (done)
			{
				var manifests = TestData.manifests_sass_override_file_invalid_extension;
				
				expect(SassCompileJob.job_id).toBeDefined();
				expect(SassCompileJob.workerJob).toBeDefined();
				
				var input = {
					job_name: SassCompileJob.job_id
				,	url: url
				,	manifests: manifests
				};
				
				var percent = 0;
				
				var sass_done = function sassDone(result)
				{
					if(result.error)
					{
						expect(result.error).toBeDefined();
						expect(result.error).toContain('Error: You can only override .scss files in the sass override section');
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
					SassCompileJob.workerJob(input, sass_done, progress);
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