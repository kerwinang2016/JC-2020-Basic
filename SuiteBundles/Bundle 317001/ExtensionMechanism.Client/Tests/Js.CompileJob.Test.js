define('Js.CompileJob.Test', [
		'ExtensionMechanism.TestData'
	,	'Compiled.Javascript.TestData'
	,	'Js.CompileJob'
	]
,	function (
		TestData
	,	JavascriptExpected
	,	JsCompileJob
	)
{
	'use strict';

	return describe('Javascript CompileJob', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;
		});

		describe('load JsCompileJob', function ()
		{
			it('should have a method workerJob defined', function ()
			{
				expect(JsCompileJob.workerJob).toBeDefined();
				expect(JsCompileJob.job_id).toEqual('JavascriptJob');
			});

			it('should compile javascript if correct manifests and files are given', function (done)
			{
				var manifests = TestData.manifests;
				
				var input = {
					job_name: JsCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var javascriptDone = function javascriptDone(result)
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
						expect(result.files_extension).toEqual('js');

						//it should generate a file per ssp application

						var shopping_file = _.findWhere(result.files, { name: 'shopping'});
						var myaccount_file = _.findWhere(result.files, { name: 'myaccount'});
						var checkout_file = _.findWhere(result.files, { name: 'checkout'});
						
						expect(shopping_file).toBeDefined();
						expect(myaccount_file).toBeDefined();
						expect(checkout_file).toBeDefined();
						
						//it should generate default empty files if no javascript for an ssp application found
						expect(checkout_file.content).toEqual('');
						expect(shopping_file.content).toEqual(JavascriptExpected.compiled_javascript_shopping);
						expect(myaccount_file.content).toEqual(JavascriptExpected.compiled_javascript_myaccount);
						
						expect(parseInt(percent)).toEqual(100);

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
					JsCompileJob.workerJob(input, javascriptDone, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should compile javascript if manifests without folder are given', function (done)
			{
				var manifests = TestData.manifests_without_folder;
				
				var input = {
					job_name: JsCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var javascriptDone = function javascriptDone(result)
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
						expect(result.files_extension).toEqual('js');

						//it should generate a file per ssp application

						var shopping_file = _.findWhere(result.files, { name: 'shopping'});
						var myaccount_file = _.findWhere(result.files, { name: 'myaccount'});
						var checkout_file = _.findWhere(result.files, { name: 'checkout'});
						
						expect(shopping_file).toBeDefined();
						expect(myaccount_file).toBeDefined();
						expect(checkout_file).toBeDefined();
						
						//it should generate default empty files if no javascript for an ssp application found
						expect(checkout_file.content).toEqual('');
						expect(shopping_file.content).toEqual(JavascriptExpected.compiled_javascript_shopping);
						expect(myaccount_file.content).toEqual(JavascriptExpected.compiled_javascript_myaccount);
						
						expect(parseInt(percent)).toEqual(100);

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
					JsCompileJob.workerJob(input, javascriptDone, progress);
				}
				catch(error)
				{
					fail('Should not throw an error');
					console.error(error);
				}
			});

			it('should generate syntactically valid javascript files, given syntactically valid input files', function (done)
			{
				var manifests = TestData.manifests;
				
				var input = {
					job_name: JsCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var javascriptDone = function javascriptDone(result)
				{
					expect(result.files_extension).toEqual('js');

					//it should generate a file per ssp application

					var shopping_file = _.findWhere(result.files, { name: 'shopping'});
					var myaccount_file = _.findWhere(result.files, { name: 'myaccount'});
					var checkout_file = _.findWhere(result.files, { name: 'checkout'});
					
					try
					{
						esprima.parse(shopping_file.content);
						esprima.parse(myaccount_file.content);
						esprima.parse(checkout_file.content);
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
					JsCompileJob.workerJob(input, javascriptDone, progress);
				}
				catch(error)
				{
					fail(error);
					console.error(error);
				}
			});


			it('if no theme manifest is sent it will fail', function (done)
			{
				var manifests = TestData.manifests_without_theme;
				
				var input = {
					job_name: JsCompileJob.job_id
				,	url: url
				,	manifests: manifests
				,	extensions_folder: TestData.impact_changes_data.website.extensions_folder
				};
				
				var percent = 0;
				
				var javascriptDone = function javascriptDone()
				{
					fail('It should not continue if no theme manifest was sent');
				};
				
				var progress = function progress(data)
				{
					expect(data.percent || data.log).toBeDefined();
					data.percent && (percent += data.percent);
				};
				
				try
				{
					JsCompileJob.workerJob(input, javascriptDone, progress);
				}
				catch(error)
				{
					expect(error.message).toEqual('Theme manifest not found. Needed to get applications.');
					done();
				}
			});
		});
	});
});
