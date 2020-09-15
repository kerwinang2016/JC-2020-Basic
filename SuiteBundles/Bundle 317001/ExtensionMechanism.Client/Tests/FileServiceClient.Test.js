define('FileServiceClient.Test', [
	'FileServiceClient.TestData'
,	'FileServiceClient'
,	'../../../../../DevTools/gulp/extension-mechanism/client-script/RequestHelper'
	]
,	function (
		TestData
	,	FileServiceClient
	,	RequestHelper
	)
{
	'use strict';

	return describe('FileServiceClient', function ()
	{
		var url;

		beforeEach(function ()
		{
			url = this.file_reslet_url;

			FileServiceClient.getInstance().clearCache();
		});

		describe('getPages', function ()
		{
			it('should split in pages correctly if files array is greater than page size', function(done)
			{
				var page_size = FileServiceClient.getInstance().PAGE_SIZE;

				FileServiceClient.getInstance().PAGE_SIZE = 3;

				var pages = [];
				pages[0] = TestData.files_list.slice(0,3);
				pages[1] = TestData.files_list.slice(3,6);
				pages[2] = TestData.files_list.slice(6);


				var paginated = FileServiceClient.getInstance().getPages(TestData.files_list);

				expect(paginated.length).toBe(3);
				expect(paginated[0].length).toEqual(pages[0].length);
				expect(paginated).toEqual(pages);

				FileServiceClient.getInstance().PAGE_SIZE = page_size;
				done();
			});

			it('should return one array if files array is less or equal than page size', function(done)
			{
				var page_size = FileServiceClient.getInstance().PAGE_SIZE;

				FileServiceClient.getInstance().PAGE_SIZE = 3;

				var files_list = TestData.files_list.slice(0,3);

				var pages = [files_list];

				var paginated = FileServiceClient.getInstance().getPages(files_list);

				expect(paginated.length).toBe(1);
				expect(paginated[0].length).toEqual(pages[0].length);
				expect(paginated).toEqual(pages);

				FileServiceClient.getInstance().PAGE_SIZE = page_size;
				done();
			});

			it('should empty array if empty array is given', function(done)
			{
				var page_size = FileServiceClient.getInstance().PAGE_SIZE;

				FileServiceClient.getInstance().PAGE_SIZE = 3;

				var paginated = FileServiceClient.getInstance().getPages([]);

				expect(paginated.length).toBe(0);
				expect(paginated).toEqual([]);

				FileServiceClient.getInstance().PAGE_SIZE = page_size;
				done();
			});

		});

		describe('createFolder', function()
		{
			it('should create a folder correctly if it can find the parent', function(done)
			{
				FileServiceClient.getInstance().createFolder(url, 'services_example_folder', '5547')
				.then(
					function(folder)
					{
						expect(folder).toBeDefined();
						expect(folder.result.folder_id).toBeDefined();
						expect(typeof folder.result.folder_id).toBe('string');
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

			it('should throw error if invalid parent is sent', function(done)
			{
				var promises = [];

				promises.push(FileServiceClient.getInstance().createFolder(url, 'services_example_folder', '')
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
						console.log(error);
						expect(error).toContain('folder_name and parent_id are required');
						done();
					}
				));

				promises.push(FileServiceClient.getInstance().createFolder(url, 'services_example_folder', null)
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
						console.log(error);
						expect(error).toContain('folder_name and parent_id are required');
						done();
					}
				));

				Promise.all(promises).then(done);
			});
		});

		describe('getFiles', function ()
		{
			it('should return an array of file objects with their content, name and folder_id and in the same order as the array requested', function(done)
			{
				FileServiceClient.getInstance().getFiles(url, TestData.files_list)
				.then(
					function(files)
					{
						expect(files).toBeDefined();
						expect(_.isArray(files)).toBe(true);
						expect(files.length).toEqual(TestData.files_list.length);

						_.each(files, function(file, i)
							{
								expect(file.content).toBeDefined();
								expect(file.folder_id).toBeDefined();
								expect(file.file).toBeDefined();
								expect(typeof file.content).toBe('string');
								expect(TestData.files_list[i]).toEqual(file.file);
							}
						);

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

			it('should fail if some files are not found in the file cabinet', function(done)
			{
				FileServiceClient.getInstance().getFiles(url, TestData.files_list_not_exist_all_cached)
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
						console.log(error);
						expect(error).toContain('That record does not exist. path: ');
						done();
					}
				);

			});

			it('should not fail if files are not found but were sent as optionals', function(done)
			{
				var promises = [];

				promises.push(FileServiceClient.getInstance().getFiles(url, TestData.files_list, TestData.files_list_optional)
				.then(
					function(files)
					{
						expect(files).toBeDefined();
						expect(_.isArray(files)).toBe(true);
						expect(files.length).toEqual(TestData.files_list.length);

						_.each(files, function(file)
							{
								expect(file).toBeDefined();
								expect(file.content).toBeDefined();
								expect(file.folder_id).toBeDefined();
								expect(file.file).toBeDefined();
								expect(typeof file.content).toBe('string');
							}
						);
					}
				)
				.catch(
					function(error)
					{
						fail(new Error(error));
						console.error(error);
						done();
					}
				));

				promises.push(FileServiceClient.getInstance().getFiles(url, TestData.files_list_not_exist_all_cached, TestData.files_list_optional)
				.then(
					function(files)
					{
						expect(files).toBeDefined();
						expect(_.isArray(files)).toBe(true);
						expect(files.length).toEqual(TestData.files_list_not_exist_all_cached.length - TestData.files_list_optional.length);

						_.each(files, function(file)
							{
								expect(file).toBeDefined();
								expect(file.content).toBeDefined();
								expect(file.folder_id).toBeDefined();
								expect(file.file).toBeDefined();
								expect(typeof file.content).toBe('string');
							}
						);
					}
				)
				.catch(
					function(error)
					{
						fail(new Error(error));
						console.error(error);
						done();
					}
				));

				promises.push(FileServiceClient.getInstance().getFiles(url, TestData.files_list_not_exist_cached_and_new, TestData.files_list_optional)
				.then(
					function(files)
					{
						expect(files).toBeDefined();
						expect(_.isArray(files)).toBe(true);
						expect(files.length).toEqual(TestData.files_list_not_exist_cached_and_new.length - TestData.files_list_optional.length);

						_.each(files, function(file)
							{
								expect(file).toBeDefined();
								expect(file.content).toBeDefined();
								expect(file.folder_id).toBeDefined();
								expect(file.file).toBeDefined();
								expect(typeof file.content).toBe('string');
							}
						);
					}
				)
				.catch(
					function(error)
					{
						fail(new Error(error));
						console.error(error);
						done();
					}
				));

				Promise.all(promises).then(done);

			});

			it('should paginate requests if the amount of files requested is greater than default page size', function(done)
			{
				var page_size = FileServiceClient.getInstance().PAGE_SIZE;

				FileServiceClient.getInstance().PAGE_SIZE = 3;

				var pages = [];
				pages[0] = TestData.files_list.slice(0,3);
				pages[1] = TestData.files_list.slice(3,6);
				pages[2] = TestData.files_list.slice(6);

				spyOn(RequestHelper, 'request').and.callThrough();

				FileServiceClient.getInstance().getFiles(url, TestData.files_list)
				.then(
					function(files)
					{
						expect(files).toBeDefined();

						var page1 = pages[0];
						var page2 = pages[1];
						var page3 = pages[2];

						expect(RequestHelper.request).toHaveBeenCalled();

						expect(RequestHelper.request).toHaveBeenCalledWith({
							url: url
						,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
						,	method: 'POST'
						,	data: JSON.stringify({
								operation: 'get_files'
							,	files: page1
							,	optional: []
							})
						});

						expect(RequestHelper.request).toHaveBeenCalledWith({
							url: url
						,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
						,	method: 'POST'
						,	data: JSON.stringify({
								operation: 'get_files'
							,	files: page2
							,	optional: []
							})
						});

						expect(RequestHelper.request).toHaveBeenCalledWith({
							url: url
						,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
						,	method: 'POST'
						,	data: JSON.stringify({
								operation: 'get_files'
							,	files: page3
							,	optional: []
							})
						});

						FileServiceClient.getInstance().PAGE_SIZE = page_size;

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

		describe('writeFiles', function ()
		{
			describe('with valid format sent', function()
			{
				it('should write correctly the files', function(done)
				{
					var promise = [];

					promise.push(FileServiceClient.getInstance().writeFiles(url, TestData.files_to_write)
					.then(
						function (result)
						{
							expect(result.header.status.message).toEqual('success');
						}
					)
					.catch(
						function (error)
						{
							throw error;
						}
					));

					Promise.all(promise).then(done);
				});
			});

			describe('with invalid format sent: name or folder id', function()
			{
				it('should throw error', function(done)
				{
					var promise = [];

					promise.push(FileServiceClient.getInstance().writeFiles(url, TestData.files_to_write_invalid)
					.then(
						function ()
						{
							fail(new Error('It should not sucess'));
							done();
						}
					)
					.catch(
						function (error)
						{
							console.log(error);
							expect(error).toContain('Invalid file name: ');
							done();
						}
					));

					Promise.all(promise).then(done);
				});
			});
		});

		describe('copyFiles', function ()
		{
			describe('with valid input data', function()
			{
				it('should copy correctly the files', function(done)
				{
					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst)
					.then(
						function(result)
						{
							expect(result.header.status.code).toEqual('SUCCESS');
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

				it('should paginate the files to copy if lenght is greater than the page size', function(done)
				{

					var page_size = FileServiceClient.getInstance().PAGE_SIZE;

					FileServiceClient.getInstance().PAGE_SIZE = 3;

					var pages_src = [];
					pages_src[0] = TestData.files_to_copy_src.slice(0,3);
					pages_src[1] = TestData.files_to_copy_src.slice(3);

					var pages_dst = [];
					pages_dst[0] = TestData.files_to_copy_dst.slice(0,3);
					pages_dst[1] = TestData.files_to_copy_dst.slice(3);

					spyOn(RequestHelper, 'request').and.callThrough();

					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst)
					.then(
						function(result)
						{
							expect(result.header.status.code).toEqual('SUCCESS');
							expect(RequestHelper.request).toHaveBeenCalled();

							expect(RequestHelper.request).toHaveBeenCalledWith({
								url: url
							,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
							,	method: 'PUT'
							,	data: JSON.stringify({
									operation: 'copy'
								,	src_paths: pages_src[0]
								,	dst_names: pages_dst[0]
								})
							});

							expect(RequestHelper.request).toHaveBeenCalledWith({
								url: url
							,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
							,	method: 'PUT'
							,	data: JSON.stringify({
									operation: 'copy'
								,	src_paths: pages_src[1]
								,	dst_names: pages_dst[1]
								})
							});

							FileServiceClient.getInstance().PAGE_SIZE = page_size;
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

			describe('with invalid input', function()
			{
				it('should throw error if no src_paths is sent', function(done)
				{
					FileServiceClient.getInstance().copyFiles(url, null, TestData.files_to_copy_dst)
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
							console.log(error);
							expect(error).toContain('Files must be a valid array of paths or files id');
							done();
						}
					);
				});

				it('should throw error if no dst_name is sent', function(done)
				{
					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src)
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
							console.log(error);
							expect(error).toContain('Files must be a valid array of paths or files id');
							done();
						}
					);
				});

				it('should throw error if dst_names have different length that the source files to copy', function(done)
				{
					var new_dest = TestData.files_to_copy_dst.slice(0,3);

					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src, new_dest)
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
							console.log(error);
							expect(error).toContain('You must provide a destination name for each source');
							done();
						}
					);
				});

				it('should throw error if dst_names objects does not have folder_id', function(done)
				{
					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst_without_folder)
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
							console.log(error);
							expect(error).toContain('You must provide a destination folder id');
							done();
						}
					);
				});

				it('should throw error if some src file does not exist', function(done)
				{
					FileServiceClient.getInstance().copyFiles(url, TestData.files_to_copy_src_not_exist, TestData.files_to_copy_dst)
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
							console.log(error);
							expect(error).toContain('That record does not exist. path: ');
							done();
						}
					);
				});
			});


		});

		describe('moveFiles', function ()
		{
			describe('with valid input data', function()
			{
				it('should move correctly the files', function(done)
				{
					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst)
					.then(
						function(result)
						{
							expect(result.header.status.code).toEqual('SUCCESS');
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

				it('should paginate the files to move if lenght is greater than the page size', function(done)
				{
					var page_size = FileServiceClient.getInstance().PAGE_SIZE;

					FileServiceClient.getInstance().PAGE_SIZE = 3;

					var pages_src = [];
					pages_src[0] = TestData.files_to_copy_src.slice(0,3);
					pages_src[1] = TestData.files_to_copy_src.slice(3);

					var pages_dst = [];
					pages_dst[0] = TestData.files_to_copy_dst.slice(0,3);
					pages_dst[1] = TestData.files_to_copy_dst.slice(3);

					spyOn(RequestHelper, 'request').and.callThrough();

					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst)
					.then(
						function(result)
						{
							expect(result.header.status.code).toEqual('SUCCESS');
							expect(RequestHelper.request).toHaveBeenCalled();

							expect(RequestHelper.request).toHaveBeenCalledWith({
								url: url
							,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
							,	method: 'PUT'
							,	data: JSON.stringify({
									operation: 'move'
								,	src_paths: pages_src[0]
								,	dst_names: pages_dst[0]
								})
							});

							expect(RequestHelper.request).toHaveBeenCalledWith({
								url: url
							,	timeout: FileServiceClient.getInstance().REQUEST_TIMEOUT
							,	method: 'PUT'
							,	data: JSON.stringify({
									operation: 'move'
								,	src_paths: pages_src[1]
								,	dst_names: pages_dst[1]
								})
							});

							FileServiceClient.getInstance().PAGE_SIZE = page_size;
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

			describe('with invalid input', function()
			{
				it('should throw error if no src_paths is sent', function(done)
				{
					FileServiceClient.getInstance().moveFiles(url, null, TestData.files_to_copy_dst)
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
							console.log(error);
							expect(error).toContain('Files must be a valid array of paths or files id');
							done();
						}
					);
				});

				it('should throw error if no dst_name is sent', function(done)
				{
					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src)
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
							console.log(error);
							expect(error).toContain('Files must be a valid array of paths or files id');
							done();
						}
					);
				});

				it('should throw error if dst_names have different length that the source files to move', function(done)
				{
					var new_dest = TestData.files_to_copy_dst.slice(0,3);

					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src, new_dest)
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
							console.log(error);
							expect(error).toContain('You must provide a destination name for each source');
							done();
						}
					);
				});

				it('should throw error if dst_names objects does not have folder_id', function(done)
				{
					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src, TestData.files_to_copy_dst_without_folder)
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
							console.log(error);
							expect(error).toContain('You must provide a destination folder id');
							done();
						}
					);
				});

				it('should throw error if some src file does not exist', function(done)
				{
					FileServiceClient.getInstance().moveFiles(url, TestData.files_to_copy_src_not_exist, TestData.files_to_copy_dst)
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
							console.log(error);
							expect(error).toContain('That record does not exist. path: ');
							done();
						}
					);
				});
			});

		});
	});

});
