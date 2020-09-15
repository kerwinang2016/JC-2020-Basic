/**
 *@NApiVersion 2.x
 *@NModuleScope TargetAccount
 */
define(
	[
		'../../CommonUtilities/CommonHelper'
	,	'../../CommonUtilities/UtilsSS2'
	,	'N/runtime'
	,	'N/sassCompiler'
	,	'N/file'
	,	'N/util'
	,	'N/error'
    ,   '../Helpers/JobToProcessHelperSS2'
	,	'../../third_parties/bless'
	]
,	function(
		common_helper
	,	Utils
	,	runtime
	,	sassCompiler
	,	file_module
	,	util
	,	error_module
    ,   JobToProcessHelper
	,	bless
	)
	{
		var sass_compiler = {

            writeFiles: function writeFiles(files_to_write)
			{
                util.each(files_to_write, function(file_data)
                {
                    var newFile = file_module.create({
                        name: file_data.name
                    ,   fileType: file_data.fileType
                    ,   contents: file_data.content
                    ,   folder: file_data.folder_id
                    ,   isOnline: true
                    });
					newFile && newFile.save();
                });
			}

		,	generateBless: function generateBless(css_file)
			{
				var parser = bless.Parser({
					output: 'blessed.css'
				,	options: {}
				})
				,	files_to_write = [];

				parser.parse(css_file.content, function(error, files)
				{
					if(error)
					{
                        common_helper.throwError('SCE_ERROR_GENERATING_IE_CSS', JSON.stringify(error));
					}

					util.each(files, function(blessed_file, index)
					{
						var ie_css_file = {
							name: css_file.output_prefix + 'ie_' + css_file.app + '_' + index + '_' + css_file.activation_id + '.css'
						,	folder_id: css_file.folder_id
						,	fileType: file_module.Type.PLAINTEXT
						,	content: blessed_file.content
						};

						files_to_write.push(ie_css_file);
					});
				});

				return files_to_write;
			}

		,	addHelpers: function addHelpers(manifest)
			{
				var content = '';
				var	assets_paths = [
						'.'
						,	manifest.vendor
						,	manifest.name
						,	manifest.version
						,	''
					].join('/');

				if(manifest.type === 'theme')
				{
					content += '@function getThemeAssetsPath($asset){\n';
					content += '@return \'' + assets_paths + '\' + $asset;\n';
					content += '}\n\n';
				}

				content += '@function getExtensionAssetsPath($asset){\n';
                content += '@return \'' + assets_paths + '\' + $asset;\n';
				content += '}\n\n';

				return '\n\n' + content;
			}

        ,   createMetaEntrypoints: function createMetaEntrypoints(manifests, activation_id, custom_skin, extensions_folder_id, save) {
                var self = this,
                    meta_entrypoints = {};

                var executeCopier = JobToProcessHelper.needsExecuteSassCopierJob(manifests);

				util.each(manifests, function(manifest) {
					if(manifest.sass && _.isEmpty(manifest.sass.entry_points) && !_.isEmpty(manifest.sass.files)) {
                        throw error_module.create({
                            name: 'SASS_COMPILER_ERROR',
                            message: 'Missing entrypoint'
                        });
                    }

                    var sass_entry = manifest.sass || {},
                        entry_points = sass_entry.entry_points || {};


					manifest.path = (manifest.path.indexOf('/') !== 0) ? '/' + manifest.path : manifest.path;

                    util.each(entry_points, function(entrypoint, app) {
                        meta_entrypoints[app] = meta_entrypoints[app] || '';

                        var current_entrypoint = self.addHelpers(manifest) + '@import "';
						if(executeCopier) {
                            var emb_path = Utils.getEMBFolderPath() + '/overrides/activation ' + activation_id;
                            current_entrypoint += emb_path + '/' + manifest.vendor + '/' + manifest.name;
                        } else {
							current_entrypoint += manifest.path;
						}
                        current_entrypoint += '/' + entrypoint + '";';

                        if(manifest.type === 'theme') {
                            meta_entrypoints[app] = current_entrypoint + meta_entrypoints[app];
                        } else {
                            meta_entrypoints[app] += current_entrypoint;
                        }
                    });
				});

                var unique_id = !save ? '_' + (util.nanoTime() + Math.floor(Math.random() * 100)) : '';

                var result = {};
                util.each(meta_entrypoints, function(meta_entrypoint, app)
				{
					meta_entrypoint = (custom_skin ? custom_skin : '') + meta_entrypoint;

					var meta_entrypoint_file = file_module.create({
						name: 'meta_' + app + '_' + activation_id + unique_id + '.scss'
					,	folder: extensions_folder_id
					,	fileType: file_module.Type.PLAINTEXT
					,	contents: meta_entrypoint
					});

					var file_id = meta_entrypoint_file.save();

                    //This is needed because otherwise the path attr is not complete
                    meta_entrypoint_file = file_module.load({id: file_id});

                    result[app] = {
                        id: file_id
                    ,   name: meta_entrypoint_file.name
                    ,   path: meta_entrypoint_file.path
                    };

                });

                return result;
            }

		,	compile: function compile(compile_options)
			{
				var domain = compile_options.domain
				,	manifests = compile_options.manifests
				,	compiled_apps = compile_options.compiled_apps || {}
				,	app_to_return = compile_options.app
				,	save = compile_options.save
				,	output_prefix = compile_options.output_prefix || ''
				,	custom_skin = compile_options.custom_skin
				,	activation = common_helper.getActivation(domain)
				,	activation_id = activation.activation_id
				,	extensions_folder_id = common_helper.getExtensionsFolderId(domain)
				,	files_paths = []
				,	to_return
				,	self = this;

				if(!custom_skin)
				{
					var theme = common_helper.getThemeManifest(manifests)
					,	theme_name = theme ? theme.vendor + '/' + theme.name : '';

					custom_skin = common_helper.getCustomSkin(theme_name, domain);
					custom_skin = custom_skin ? custom_skin.sass : null;
				}

                var meta_entrypoints = this.createMetaEntrypoints(manifests, activation_id, custom_skin, extensions_folder_id, save);

				var files_to_write = []
				,	generated_files = [];

                var compiled_app;

				util.each(meta_entrypoints, function(meta_entrypoint, app)
				{
                    if(compiled_apps[app] || compiled_app)
                    {
                       //If the app was already compiled or other was already compiled do nothing
                       return;
                    }

					var output_path = meta_entrypoint.path.replace(/[^\/]+$/, '');
					output_path += output_prefix;

                    var output_filename = meta_entrypoint.name.replace('meta_', 'smt_');
                    output_filename = output_filename.replace('.scss', '.css');

					var	options = {
						inputPath: '/' + meta_entrypoint.path
					,	outputPath: '/' + output_path + output_filename
					,	settings: {
							outputStyle: sassCompiler.OutputStyle.EXPANDED
						,	preProcessingEnabled: true
						}
					};

					if(app === app_to_return)
					{
                        to_return = options.outputPath;
					}

					if(save || app === app_to_return)
					{
						compiled_app = app;
						sassCompiler.compile(options);
						save && files_paths.push(options.outputPath);
						generated_files.push('smt_' + app);
					}

					if(save)
					{
                        output_filename = output_filename.replace('smt_', '');

						options = {
							inputPath: '/' + meta_entrypoint.path
						,	outputPath: '/' + output_path + output_filename
						,	settings: {
								outputStyle: sassCompiler.OutputStyle.COMPRESSED
							,	preProcessingEnabled : true
							}
						};

						files_paths.push(options.outputPath);
						sassCompiler.compile(options);
						generated_files.push(app);

						var css_file = file_module.load({id: options.outputPath});

						var ie_files = self.generateBless({
							app: app
						,	activation_id: activation_id
						,	content: css_file.getContents()
						,	folder_id: extensions_folder_id
						,	output_prefix: output_prefix
						});

						var basepath_ie_file = options.outputPath.split(output_prefix)[0];

						var bless_file_paths = ie_files.map(function(e) {
							return basepath_ie_file + e.name;
						  });

						files_paths = files_paths.concat(bless_file_paths);

						files_to_write = files_to_write.concat(ie_files);
                        ie_files.length && self.writeFiles(ie_files);
					}

					file_module.delete({id: meta_entrypoint.id});
				});

				util.each(files_to_write, function(ie_file)
				{
					var ie_file_name = ie_file.name.replace(output_prefix, '');
					ie_file_name = ie_file_name.replace('_' + activation_id + '.css', '');

					generated_files.push(ie_file_name);
				});

				if(to_return)
				{
					var css_file = file_module.load({id: to_return});
					to_return = css_file.getContents();

					!save && file_module.delete({id: css_file.id});
				}

				var total_apps = save ? Object.keys(meta_entrypoints).length : 1;

				return {
					css: to_return
				,	files: generated_files
                ,   compiled_app: compiled_app
				,   total_apps: total_apps
				,	files_paths : files_paths
				};
			}

		};

		return sass_compiler;

	}
);
