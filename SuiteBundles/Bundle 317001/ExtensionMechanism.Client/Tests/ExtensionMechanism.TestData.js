define(
	'ExtensionMechanism.TestData'
,	[
		'Compiled.SspLibraries.TestData'
	,	'Compiled.Sass.TestData'
	,	'Compiled.Templates.TestData'
	,	'Compiled.Configuration.TestData'
	,	'Compiled.ConfigurationManifest.TestData'
	]
,	function (
		compiled_ssp_libraries
	,	sass_test_data
	,	compiled_tpl
	,	compiled_configuration
	,	compiled_configuration_manifest
	)
{
	'use strict';

	var manifests = [
		{
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',
			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
				'folder': 'Sass'
			}
		}
	,	{
			'name': 'Extension1',
			'type': 'extension',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension1',

			'ssp-libraries': {
				'folder': 'suitescript',
				'entry_point': 'MyExamplePDPExtension1/Extension1.Other.Model.js',
				'files': [
					'MyExamplePDPExtension1/Extension1.Model.js',
					'MyExamplePDPExtension1/Extension1.Other.Model.js'
				]
			},

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'Header/header.tpl'
						]
					}
				 }
			},

			'sass': {
				'folder': 'sass',
				'entry_points': {
					'shopping': 'MyExamplePDPExtension1/shopping.scss'
				},

				'files': [
					'MyExamplePDPExtension1/shopping.scss',
					'MyExamplePDPExtension1/_my-extension-1-error.scss',
					'MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				]
			},

			'javascript': {
				'folder': 'javascript',
				'entry_points': {
					'shopping': 'MyExamplePDPExtension1/MyExamplePDPExtension1.js',
					'myaccount': 'MyExamplePDPExtension1/MyExamplePDPExtension1.js'
				},
				'application': {
					
					'shopping': {
						'files': [
							'MyExamplePDPExtension1/MyExamplePDPExtension1.js',
							'MyExamplePDPExtension1/MyProductPrice.View.js',
							'MyExamplePDPExtension1/MyError.View.js'
						]
					},

					'myaccount': {
						'files': [
							'MyExamplePDPExtension1/MyExamplePDPExtension1.js',
							'MyExamplePDPExtension1/MyProductPrice.View.js',
							'MyExamplePDPExtension1/MyError.View.js'
						]
					}
				}
			}

		,	'configuration': {
				'folder': 'configuration'
			,	'files': [
					'Extension1.json'
				,	'Extension1-extra.json'
				]
			}
		}
	,	{
			'name': 'Extension2',
			'type': 'extension',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension2',

			'ssp-libraries': {
				'folder': 'suitescript',
				'entry_point': 'MyExamplePDPExtension2/Extension2.Other.Model.js',

				'files': [
					'MyExamplePDPExtension2/Extension2.Model.js',
					'MyExamplePDPExtension2/Extension2.Other.Model.js'
				]
			},

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension1/my_extension_1_product_price.tpl'
						]
					}
				}
			},

			'javascript': {
				'folder': 'javascript',
				'entry_points': {
					'shopping': 'MyExamplePDPExtension2/MyExamplePDPExtension2.js'
				},
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension2/MyExamplePDPExtension2.js',
							'MyExamplePDPExtension2/MyExtension2.View.js',
						]
					}
				}
			}
		}

	,	{
			'name': 'Extension3',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension3',

			'sass': {
				'folder': 'sass',
				'entry_points': {
					'shopping': 'SassFiles/shopping_extension3.scss'
				},

				'files': [
					'SassFiles/shopping_extension3.scss',
					'SassFiles/file_1.scss',
					'SassFiles/file_2.scss'
				]
			}
		,	'configuration': {
				'folder': 'configuration'
			,	'files': [
					'Extension3.json'
				]
			}
		}
	];

	var manifests_without_folder = [
		{
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',
			'templates': {
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
			}
		}
	,	{
			'name': 'Extension1',
			'type': 'extension',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension1',

			'ssp-libraries': {
				'entry_point': 'MyExamplePDPExtension1/Extension1.Other.Model.js',
				'files': [
					'suitescript/MyExamplePDPExtension1/Extension1.Model.js',
					'suitescript/MyExamplePDPExtension1/Extension1.Other.Model.js'
				]
			},

			'templates': {
				'application': {
					'shopping': {
						'files': [
							'templates/Header/header.tpl'
						]
					}
				 }
			},

			'sass': {
				'entry_points': {
					'shopping': 'sass/MyExamplePDPExtension1/shopping.scss'
				},

				'files': [
					'sass/MyExamplePDPExtension1/shopping.scss',
					'sass/MyExamplePDPExtension1/_my-extension-1-error.scss',
					'sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				]
			},

			'javascript': {
				'entry_points': {
					'shopping': 'javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js',
					'myaccount': 'javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js'
				},
				'application': {
					
					'shopping': {
						'files': [
							'javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js',
							'javascript/MyExamplePDPExtension1/MyProductPrice.View.js',
							'javascript/MyExamplePDPExtension1/MyError.View.js'
						]
					},

					'myaccount': {
						'files': [
							'javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js',
							'javascript/MyExamplePDPExtension1/MyProductPrice.View.js',
							'javascript/MyExamplePDPExtension1/MyError.View.js'
						]
					}
				}
			}

		,	'configuration': {
				'files': [
					'configuration/Extension1.json'
				,	'configuration/Extension1-extra.json'
				]
			}
		}
	,	{
			'name': 'Extension2',
			'type': 'extension',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension2',

			'ssp-libraries': {
				'entry_point': 'suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js',

				'files': [
					'suitescript/MyExamplePDPExtension2/Extension2.Model.js',
					'suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js'
				]
			},

			'templates': {
				'application': {
					'shopping': {
						'files': [
							'templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl'
						]
					}
				}
			},

			'javascript': {
				'entry_points': {
					'shopping': 'javascript/MyExamplePDPExtension2/MyExamplePDPExtension2.js'
				},
				'application': {
					'shopping': {
						'files': [
							'javascript/MyExamplePDPExtension2/MyExamplePDPExtension2.js',
							'javascript/MyExamplePDPExtension2/MyExtension2.View.js',
						]
					}
				}
			}
		}

	,	{
			'name': 'Extension3',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension3',

			'sass': {
				'entry_points': {
					'shopping': 'sass/SassFiles/shopping_extension3.scss'
				},

				'files': [
					'sass/SassFiles/shopping_extension3.scss',
					'sass/SassFiles/file_1.scss',
					'sass/SassFiles/file_2.scss'
				]
			}
		,	'configuration': {
				'files': [
					'configuration/Extension3.json'
				]
			}
		}
	];

	var manifests_file_not_exist = [

		{
			'name': 'Extension1',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension1',

			'ssp-libraries': {
				'folder': 'lala',
				'entry_point': 'EntryPoint1.js',
				'files': [
					'FileNotExist.js'
				]
			},

			'sass': {
				'folder': 'sass',
				'entry_points': {
					'malformed': 'MyExamplePDPExtension1/entry_point_not_exist.scss'
				},

				'files': [
					'file_bad_path.scss',
					'file_other_bad_path.scss',
					'MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				]
			}
		}

	,	{
			'name': 'Extension1',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'Extension1',

			'ssp-libraries': {
				'folder': 'lala',
				'entry_point': 'EntryPoint1.js',
				'files': [
					'FileNotExist.js'
				]
			},

			'sass': {
				'key_invalid': 'x',
				'files': 'other'
			}
		}
	];

	var manifests_optional_folder = [
		{
			'name': 'Extension2',
			'version': '2.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension2',

			'ssp-libraries': {
				'folder': undefined,
				'entry_point': 'EntryPoint1.js',
				'files': [
					'SuiteScript/file_absolute_path.js'
				]
			},

			'sass': {
			}
		}
	];

	var manifests_without_path = [
		{
			'name': 'Extension1',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',

			'ssp-libraries': {
				'folder':'',
				'entry_point': 'EntryPoint1.js',
				'files': [
					'Folder1/Folder2/file_without_manifest_path.js'
				]
			},

			'sass': {
			}

		,	'javscript': {
				'files': [
					'file1.js'
				,	'file2.js'
				]
			}
		}	
	];

	var manifests_without_theme = manifests.slice(1, manifests.lenght);

	var manifests_by_file_id = [
		{
			'name': 'Extension4',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Extension4',

			'ssp-libraries': {
				'folder': 'lala',
				'entry_point': 'EntryPoint1.js',
				'files': [
					'53'
				]
			}
		}
	];
	
	var impact_changes_data = {
		result: {
			JavascriptJob: {
				result: {
					files_extension: 'js'
				,	files: [
						{
							name: 'file1'
						,	folder_id: 1
						,	content: 'file1_content'
						}
					,	{
							name: 'file2'
						,	content: 'file2_content'
						,	concat_with: 'file3.tpl'
						}
					]
				}
			}
		,	TemplatesJob: {
				result: {
					use_strict: true
				,	files: [
						{
							name: 'file3.tpl'	
						,	content: 'file3_content'
						,	folder_id: 1
						}
					]
				}
			}
		}
	,	website: {
			domains: {
				folder: 'app_path'
			,	folder_id: 3
			}
		,	extensions_folder: {
				name: 'extensions'
			,	folder_id: 4
			}
		}
	};

	var manifests_sass_override = _.toArray(manifests);
	manifests_sass_override[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss',
					'dst': 'Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
				'folder': 'sass',
				'files': [
					'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss'
				]
			}
		};

	var manifests_sass_override_folder_optional = _.toArray(manifests);
	manifests_sass_override_folder_optional[0] =  {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss',
					'dst': 'Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		,	'sass': {
				
				'files': [
					'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss'
				]
			}
		};

	var manifests_sass_override_file_src_not_exist = _.toArray(manifests);
	manifests_sass_override_file_src_not_exist[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'ExtensionNotExist/MyExamplePDPExtension1/my_extension_1_product_price_custom.scss',
					'dst': 'Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
				'files': [
					'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss'
				]
			}
		};

	var manifests_sass_override_file_dst_not_exist = _.toArray(manifests);
	manifests_sass_override_file_dst_not_exist[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss',
					'dst': 'ExtensionNotExistInvalid/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				}
			],
			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
				'files': [
					'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss'
				]
			}
		};

	var manifests_sass_override_file_invalid_extension = _.toArray(manifests);
	manifests_sass_override_file_invalid_extension[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'ExtensionSource/Extension1/MyExamplePDPExtension1/MyExamplePDPExtension1.js',
					'dst': 'ExtensionSource/Extension1/templates/Header/header.tpl'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}

		,	'sass': {
				'files': [
					'sass/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.scss'
				]
			}
		};

		var manifests_templates_override = _.toArray(manifests);
		manifests_templates_override[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl',
					'dst': 'Extension2/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl'
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		};

	var manifests_templates_override_folder_optional = _.toArray(manifests);
	manifests_templates_override_folder_optional[0] =  {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',

			'override': [
				{
					'src': 'templates/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl',
					'dst': 'Extension2/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl'
				}
			],

			'templates': {
				'application': {
					'shopping': {
						'files': [
							'templates/MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl'
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		};

	var manifests_templates_override_file_src_not_exist = _.toArray(manifests);
	manifests_templates_override_file_src_not_exist[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',
			'override': [
				{
					'src': 'NotExistentModule/my_extension_1_product_price_custom.tpl',
					'dst': 'Extension2/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl'
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		};

	var manifests_templates_override_file_dst_not_exist = _.toArray(manifests);
	manifests_templates_override_file_dst_not_exist[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',
			'override': [
				{
					'src': 'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl',
					'dst': 'DstNotExistFolder/templates/MyExamplePDPExtension1/my_extension_1_product_price.tpl'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl'
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		};

	var manifests_templates_override_file_invalid_extension = _.toArray(manifests);
	manifests_templates_override_file_invalid_extension[0] = {
			'name': 'Theme1',
			'type': 'theme',
			'version': '1.0.0',
			'vendor': 'SuiteCommerce',
			'path': 'ExtensionSource/Theme1',
			'override': [
				{
					'src': 'ExtensionSource/Extension1/MyExamplePDPExtension1/MyExamplePDPExtension1.js',
					'dst': 'Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
				}
			],

			'templates': {
				'folder': 'templates',
				'application': {
					'shopping': {
						'files': [
							'MyExamplePDPExtension1_Override/my_extension_1_product_price_custom.tpl'
						]
					},
					'checkout': {
						'files': [
						]
					},
					'myaccount': {
						'files': [
						]
					}
				}
			}
		};

	return {
		manifests: manifests
	,	manifests_without_folder: manifests_without_folder
	,	manifests_without_theme: manifests_without_theme
	,	manifests_optional_folder: manifests_optional_folder
	,	manifests_without_path: manifests_without_path
	,	manifests_by_file_id: manifests_by_file_id
	,	manifests_file_not_exist: manifests_file_not_exist
	
	,	manifests_sass_override: manifests_sass_override
	,	manifests_sass_override_folder_optional: manifests_sass_override_folder_optional
	,	manifests_sass_override_file_src_not_exist: manifests_sass_override_file_src_not_exist
	,	manifests_sass_override_file_dst_not_exist: manifests_sass_override_file_dst_not_exist
	,	manifests_sass_override_file_invalid_extension: manifests_sass_override_file_invalid_extension
	,	compiled_sass: sass_test_data.compiled_sass
	,	compiled_sass_override: sass_test_data.compiled_sass_override
	,	compiled_sass_override_folder_optional: sass_test_data.compiled_sass_override_folder_optional
	,	compiled_sass_ie: sass_test_data.compiled_sass_ie
	,	ie_files_statement: sass_test_data.ie_files_statement
	
	,	compiled_ssp_libraries: compiled_ssp_libraries
	
	,	compiled_shopping_tpl: compiled_tpl.compiled_shopping_tpl
	,	compiled_default_tpl: compiled_tpl.default_tpl
	,	compiled_templates_override: compiled_tpl.compiled_templates_override
	,	compiled_templates_override_folder_optional: compiled_tpl.compiled_templates_override_folder_optional
	,	manifests_templates_override: manifests_templates_override
	,	manifests_templates_override_folder_optional: manifests_templates_override_folder_optional
	,	manifests_templates_override_file_src_not_exist: manifests_templates_override_file_src_not_exist
	,	manifests_templates_override_file_dst_not_exist: manifests_templates_override_file_dst_not_exist
	,	manifests_templates_override_file_invalid_extension: manifests_templates_override_file_invalid_extension
	
	,	compiled_configuration: compiled_configuration
	,	compiled_configuration_manifest: compiled_configuration_manifest
	
	,	impact_changes_data: impact_changes_data
	,	getManifestByName: function getManifestByName(name)
		{
			return _.findWhere(manifests, { name: name });
		}
	,	getManifestNoFolderByName: function  getManifestNoFolderByName(name)
		{
			return _.findWhere(manifests_without_folder, { name: name });
		}
	};
});
