define('ImpactChanges.CompileJob.Test'
,	[
		'ImpactChanges.CompileJob'
	,	'ExtensionMechanism.TestData'
	,	'FileServiceClient'
	,	'../../../../SuiteScripts/extension-mechanism/CommonUtilities/Utils'
	,	'BlockingMechanism'
	]
,	function (
		ImpactChangesCompileJob
	,	TestData
	,	FileServiceClient
	,	Utils
	,	BlockingMechanism
	)
{
	'use strict';

	return describe('ImpactChanges.CompileJob test', function ()
	{
		beforeEach(function()
		{
			Utils.log = function(){};
			Utils.files_api_url = this.file_reslet_url;

			this.file_service_client = FileServiceClient.getInstance();

			this.file_service_client.clearCache();

			BlockingMechanism.getInstance = function()
			{
				return {
					activation_record: {
						getId: function()
						{
							return 3;
						}
					}
				};
			};
		});

		describe('BackupFiles tests', function ()
		{
			it('should resolve doing nothing when it is a new activation', function (done)
			{
				var self = this;
				ImpactChangesCompileJob.blockingMechanism = {is_new_activation: true};

				spyOn(this.file_service_client, 'copyFiles');

				ImpactChangesCompileJob.backupFiles()
					.then(
						function()
						{
							expect(self.file_service_client.copyFiles).not.toHaveBeenCalled();
							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

			it('should reject on error', function (done)
			{
				var msg = 'Error 1';
				var self = this;

				Utils.log = function()
				{
					throw new Error(msg);
				};

				spyOn(this.file_service_client, 'copyFiles');

				ImpactChangesCompileJob.backupFiles()
					.then(
						function()
						{
							fail(new Error('It should not success'));
							done();
						}
					)
					.catch(
						function(error)
						{
							expect(self.file_service_client.copyFiles).not.toHaveBeenCalled();
							expect(error).toEqual(msg);
							done();
						}
					);
			});

			it('should resolve if copyFiles fails', function (done)
			{
				var self = this;
				var copyFiles = this.file_service_client.copyFiles;

				var files_to_write = {
					file1: {name: 'file1'}
				,	file2: {name: 'file2'}
				};

				var app_path = 'app_path';

				self.file_service_client.copyFiles = function copyFiles()
				{
					return Promise.reject('Error copying');
				};

				ImpactChangesCompileJob.blockingMechanism = {is_new_activation: false};
				ImpactChangesCompileJob.extensions_folder = TestData.impact_changes_data.website.extensions_folder;
				ImpactChangesCompileJob.files_to_write = files_to_write;
				ImpactChangesCompileJob.app_path = app_path;

				ImpactChangesCompileJob.backupFiles()
					.then(
						function()
						{
							expect(ImpactChangesCompileJob.blockingMechanism.is_new_activation).toEqual(true);

							self.file_service_client.copyFiles = copyFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

			it('should resolve if all went ok', function (done)
			{
				var msg = 'success';
				var self = this;

				var copyFiles = self.file_service_client.copyFiles;
				self.file_service_client.copyFiles = function copyFiles()
				{
					return Promise.resolve(msg);
				};

				ImpactChangesCompileJob.blockingMechanism = {is_new_activation: false};

				ImpactChangesCompileJob.backupFiles()
					.then(
						function(result)
						{
							expect(result).toEqual(msg);
							expect(ImpactChangesCompileJob.blockingMechanism.is_new_activation).toEqual(false);

							self.file_service_client.copyFiles = copyFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

			it('should resolve and add bkp prefix to all the files', function (done)
			{
				var self = this;

				var files_to_write = {
					file1: {name: 'file1'}
				,	file2: {name: 'file2'}
				};
				var app_path = 'app_path';

				var copyFiles = this.file_service_client.copyFiles;
				this.file_service_client.copyFiles = function copyFiles(url, files, dst_names)
				{
					return Promise.resolve({
						files: files
					,	dst_names: dst_names
					});
				};

				ImpactChangesCompileJob.files_to_write = files_to_write;
				ImpactChangesCompileJob.app_path = app_path;

				ImpactChangesCompileJob.backupFiles()
					.then(
						function(result)
						{
							expect(result.files).toBeDefined();
							expect(result.dst_names).toBeDefined();

							var files = result.files;
							var dst_names = result.dst_names;

							expect(files.length).toEqual(_.keys(files_to_write).length);
							expect(dst_names.length).toEqual(_.keys(files_to_write).length);

							_.map(dst_names, function(dst_name)
							{
								expect(dst_name.name.indexOf('bkp')).toEqual(0);
							});

							_.map(files, function(file)
							{
								expect(file.indexOf(app_path)).toEqual(0);
							});

							self.file_service_client.copyFiles = copyFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

		});

		describe('WriteTmpFiles tests', function ()
		{
			it('should reject on exception', function (done)
			{
				var msg = 'Error 1';
				Utils.log = function()
				{
					throw new Error(msg);
				};

				ImpactChangesCompileJob.writeTmpFiles()
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(error)
						{
							expect(error).toEqual(msg);
							done();
						}
					);
			});

			it('should reject on FileClient.writeFiles exception', function (done)
			{
				var msg = 'Error 1';
				var writeFiles = this.file_service_client.writeFiles;
				var self = this;

				self.file_service_client.writeFiles = function writeFiles()
				{
					return Promise.reject(msg);
				};

				ImpactChangesCompileJob.writeTmpFiles()
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(error)
						{
							expect(error).toEqual(msg);

							self.file_service_client.writeFiles = writeFiles;

							done();
						}
					);
			});

			it('should resolve if FileClient.writeFiles resolves', function (done)
			{
				var msg = 'success';
				var self = this;

				var writeFiles = this.file_service_client.writeFiles;
				self.file_service_client.writeFiles = function writeFiles()
				{
					return Promise.resolve(msg);
				};

				ImpactChangesCompileJob.writeTmpFiles()
					.then(
						function(result)
						{
							expect(result).toBeUndefined();

							self.file_service_client.writeFiles = writeFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

			it('should resolve and add tmp prefix to all the files', function (done)
			{
				var files = {
					file1: {name: 'file1'}
				,	file2: {name: 'file2'}
				};

				var impactFiles = ImpactChangesCompileJob.impactFiles;
				ImpactChangesCompileJob.impactFiles = function impactFiles(files)
				{
					return Promise.resolve(files);
				};

				ImpactChangesCompileJob.files_to_write = files;

				ImpactChangesCompileJob.writeTmpFiles()
					.then(
						function(results)
						{
							expect(results).toBeDefined();
							expect(results.length).toEqual(_.keys(files).length);

							_.map(results, function(result)
							{
								expect(result.name.indexOf('tmp_')).toEqual(0);
							});

							ImpactChangesCompileJob.impactFiles = impactFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

		});

		describe('RestoreBackupFiles tests', function ()
		{
			it('should reject if it is a new activation', function (done)
			{
				var msg = 'Error 1';

				ImpactChangesCompileJob.blockingMechanism = {is_new_activation: true};

				spyOn(ImpactChangesCompileJob, 'restoreFiles');

				ImpactChangesCompileJob.restoreBackupFiles(msg)
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(error)
						{
							expect(ImpactChangesCompileJob.restoreFiles).not.toHaveBeenCalled();
							expect(error).toEqual(msg);
							done();
						}
					);
			});

			it('should reject even when restoreFiles resolves', function (done)
			{
				var msg = 'success';

				var restoreFiles = ImpactChangesCompileJob.restoreFiles;
				ImpactChangesCompileJob.restoreFiles = function()
				{
					return Promise.resolve(msg);
				};

				ImpactChangesCompileJob.blockingMechanism = {is_new_activation: false};

				ImpactChangesCompileJob.restoreBackupFiles(msg)
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(result)
						{
							expect(result).toEqual(msg);

							ImpactChangesCompileJob.restoreFiles = restoreFiles;
							done();
						}
					);
			});

		});

		describe('RestoreFiles tests', function ()
		{
			it('should reject if it is a new activation', function (done)
			{
				var self = this;
				var app_path = 'app_path'
				,	prefix = 'prefix';

				var files_to_write = {
					file1: {name: 'file1'}
				,	file2: {name: 'file2'}
				};

				var extensions_folder = {
					name: 'extensions'
				,	folder_id: 4
				};

				var moveFiles = this.file_service_client.moveFiles;
				self.file_service_client.moveFiles = function moveFiles(url, files, dst_names)
				{
					return Promise.resolve({
						files: files
					,	dst_names: dst_names
					});
				};

				ImpactChangesCompileJob.files_to_write = files_to_write;
				ImpactChangesCompileJob.app_path = app_path;
				ImpactChangesCompileJob.extensions_folder = extensions_folder;

				ImpactChangesCompileJob.restoreFiles(prefix)
					.then(
						function(result)
						{
							expect(result.files).toBeDefined();
							expect(result.dst_names).toBeDefined();

							var files = result.files;
							var dst_names = result.dst_names;

							expect(files.length).toEqual(_.keys(files_to_write).length);
							expect(dst_names.length).toEqual(_.keys(files_to_write).length);

							expect(_.pluck(dst_names, 'name')).toEqual(_.pluck(files_to_write, 'name'));

							_.map(files, function(file)
							{
								expect(file.indexOf(app_path + '/' + extensions_folder.name + '/' +  prefix)).toEqual(0);
							});

							self.file_service_client.moveFiles = moveFiles;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

		});

		describe('GetFileToWrite tests', function ()
		{
			it('should generate the files to write collection', function (done)
			{
				var key = '3';
				var file_ext = 'js';
				var files = JSON.parse(JSON.stringify(TestData.impact_changes_data.result));

				ImpactChangesCompileJob.jobs_result = files;

				var files_to_write = ImpactChangesCompileJob.getFileToWrite(key);

				expect(_.keys(files_to_write).length).toEqual(2);
				expect(files_to_write['file1_'+key+'.'+file_ext]).toBeDefined();
				expect(files_to_write['file3.tpl']).toBeDefined();

				expect(files_to_write['file1_'+key+'.'+file_ext].content).toEqual('file1_content');
				expect(files_to_write['file3.tpl'].content).toEqual('file2_content\n\nfile3_content');

				done();
			});

		});

		describe('Impact tests', function ()
		{
			it('should resolve even if backupFiles rejects', function (done)
			{
				var self = this;
				var job_id = ImpactChangesCompileJob.job_id;
				var msg = 'Error 1';
				var copyFiles = this.file_service_client.copyFiles;
				var moveFiles = this.file_service_client.moveFiles;
				var writeFiles = this.file_service_client.writeFiles;
				var impactRecords = ImpactChangesCompileJob.impactRecords;
				var writeAssetsTmpFiles = ImpactChangesCompileJob.writeAssetsTmpFiles;

				this.file_service_client.copyFiles = function()
				{
					return Promise.reject(msg);
				};

				this.file_service_client.writeFiles = function()
				{
					return Promise.resolve();
				};

				this.file_service_client.moveFiles = function()
				{
					return Promise.resolve();
				};

				ImpactChangesCompileJob.impactRecords = function()
				{
					return Promise.resolve();
				};

				ImpactChangesCompileJob.writeAssetsTmpFiles = function()
				{
					return Promise.resolve();
				};

				var data = JSON.parse(JSON.stringify(TestData.impact_changes_data));

				ImpactChangesCompileJob.impact(data)
					.then(
						function(jobs_result)
						{
							expect(jobs_result[job_id].state).toEqual('done');

							self.file_service_client.copyFiles = copyFiles;
							self.file_service_client.moveFiles = moveFiles;
							self.file_service_client.writeFiles = writeFiles;
							ImpactChangesCompileJob.impactRecords = impactRecords;
							ImpactChangesCompileJob.writeAssetsTmpFiles = writeAssetsTmpFiles;
							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

			it('should reject if writeTmpFiles rejects', function (done)
			{
				var self = this;
				var job_id = ImpactChangesCompileJob.job_id;
				var msg = 'Error 1';
				var copyFiles = this.file_service_client.copyFiles;
				var writeFiles = this.file_service_client.writeFiles;
				this.file_service_client.copyFiles = function()
				{
					return Promise.resolve();
				};
				this.file_service_client.writeFiles = function()
				{
					return Promise.reject(msg);
				};

				var data = JSON.parse(JSON.stringify(TestData.impact_changes_data));

				ImpactChangesCompileJob.impact(data)
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(jobs_result)
						{
							expect(jobs_result[job_id].state).toEqual('error');
							expect(jobs_result[job_id].message).toEqual(msg);

							self.file_service_client.copyFiles = copyFiles;
							self.file_service_client.writeFiles = writeFiles;

							done();
						}
					);
			});

			it('should reject if impactRecords rejects', function (done)
			{
				var self = this;
				var job_id = ImpactChangesCompileJob.job_id;
				var msg = 'Error 1';
				var copyFiles = this.file_service_client.copyFiles;
				var writeFiles = this.file_service_client.writeFiles;
				var impactRecords = ImpactChangesCompileJob.impactRecords;

				self.file_service_client.copyFiles = function()
				{
					return Promise.resolve();
				};
				self.file_service_client.writeFiles = function()
				{
					return Promise.resolve();
				};
				ImpactChangesCompileJob.impactRecords = function()
				{
					return Promise.reject(msg);
				};

				var data = JSON.parse(JSON.stringify(TestData.impact_changes_data));

				ImpactChangesCompileJob.impact(data)
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(jobs_result)
						{
							expect(jobs_result[job_id].state).toEqual('error');
							expect(jobs_result[job_id].message).toEqual(msg);

							self.file_service_client.copyFiles = copyFiles;
							self.file_service_client.writeFiles = writeFiles;
							ImpactChangesCompileJob.impactRecords = impactRecords;

							done();
						}
					);
			});

			it('should reject and restore from backup if moveTmpFiles rejects', function (done)
			{
				var self = this;
				var job_id = ImpactChangesCompileJob.job_id;
				var msg = 'Error 1';
				var copyFiles = this.file_service_client.copyFiles;
				var writeFiles = this.file_service_client.writeFiles;
				var moveFiles = this.file_service_client.moveFiles;
				var impactRecords = ImpactChangesCompileJob.impactRecords;

				var data = JSON.parse(JSON.stringify(TestData.impact_changes_data));

				this.file_service_client.copyFiles = function()
				{
					return Promise.resolve();
				};
				this.file_service_client.writeFiles = function()
				{
					return Promise.resolve();
				};
				this.file_service_client.moveFiles = function(url, files)
				{
					//moveFiles is called by moveTmpFiles and restoreBackup.
					//Rejecs when it is called by moveTmpFiles and Resolve otherwise
					var is_tmp = _.every(files, function(file)
					{
						return file.indexOf(data.website.domains.folder + '/' + data.website.extensions_folder.name + '/tmp_') === 0;
					});
					return is_tmp ? Promise.reject(msg) : Promise.resolve();
				};
				ImpactChangesCompileJob.impactRecords = function()
				{
					return Promise.resolve();
				};

				ImpactChangesCompileJob.impact(data)
					.then(
						function()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function(jobs_result)
						{
							expect(jobs_result[job_id].state).toEqual('error');
							expect(jobs_result[job_id].message).toEqual(msg);

							self.file_service_client.copyFiles = copyFiles;
							self.file_service_client.writeFiles = writeFiles;
							self.file_service_client.moveFiles = moveFiles;
							ImpactChangesCompileJob.impactRecords = impactRecords;

							done();
						}
					);
			});

			it('should resolve if all went ok', function (done)
			{
				var self = this;

				var job_id = ImpactChangesCompileJob.job_id;
				var copyFiles = this.file_service_client.copyFiles;
				var writeFiles = this.file_service_client.writeFiles;
				var moveFiles = this.file_service_client.moveFiles;
				var impactRecords = ImpactChangesCompileJob.impactRecords;

				var data = JSON.parse(JSON.stringify(TestData.impact_changes_data));

				this.file_service_client.copyFiles = function()
				{
					return Promise.resolve();
				};
				this.file_service_client.writeFiles = function()
				{
					return Promise.resolve();
				};
				this.file_service_client.moveFiles = function()
				{
					return Promise.resolve();
				};
				ImpactChangesCompileJob.impactRecords = function()
				{
					return Promise.resolve();
				};

				ImpactChangesCompileJob.impact(data)
					.then(
						function(jobs_result)
						{
							expect(jobs_result[job_id].state).toEqual('done');

							self.file_service_client.copyFiles = copyFiles;
							self.file_service_client.writeFiles = writeFiles;
							self.file_service_client.moveFiles = moveFiles;
							ImpactChangesCompileJob.impactRecords = impactRecords;

							done();
						}
					)
					.catch(
						function(error)
						{
							fail(new Error(error));
							console.error(error);
							done();
						}
					);
			});

		});

	});

});
