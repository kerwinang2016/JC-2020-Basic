define('FileServiceClient.TestData', 
	[]
,	function(){
	
	var files_list = [
		'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js'
	,	'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyError.View.js'
	,	'ExtensionSource/Extension1/templates/Header/header.tpl'
	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Model.js'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price.scss'
	,	'ExtensionSource/Extension1/configuration/Extension1.json'
	];

	var files_list_not_exist_all_cached = [
		'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js'
	,	'ExtensionSource/ExtensionNotExist/javascript/MyExamplePDPExtension1/MyError.View.js'
	,	'ExtensionSource/Extension1/templates/Header/header.tpl'
	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Model.js'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price_xml-not-exist.scss'
	,	'ExtensionSource/Extension1/configuration/Extension1.lala'
	];

	var files_list_not_exist_cached_and_new = [
		'ExtensionSource/Extension1/javascript/MyExamplePDPExtension1/MyExamplePDPExtension1.js'
	,	'ExtensionSource/ExtensionNotExist/javascript/MyExamplePDPExtension1/MyError.View.js'
	,	'ExtensionSource/Extension1/templates/Header/header.tpl'
	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Model.js'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price_xml-not-exist.scss'
	,	'ExtensionSource/Extension1/configuration/Extension1.lala'
	,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js'

	];

	var files_list_optional = [
		'ExtensionSource/ExtensionNotExist/javascript/MyExamplePDPExtension1/MyError.View.js'
	,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/_my-extension-1-product-price_xml-not-exist.scss'
	,	'ExtensionSource/Extension1/configuration/Extension1.lala'
	];

	var files_to_write = [
		{
			name: 'configurationManifest_16.json'
		,	content: 'default'
		,	folder_id: '5547'
		}
	,	{
			name: 'shopping_16.js'
		,	content: 'alert("Testing javascript");'
		,	folder_id : '5547'
		}
	,	{
			name: 'shopping_16.css'
		,	content: 'body { background-color: red; }'
		,	folder_id: '5547'
		}
	];

	var files_to_write_invalid = [
		{
			name: ''
		,	content: 'default'
		,	folder_id: '5547'
		}
	,	{
			name: null
		,	content: 'alert("Testing javascript");'
		,	folder_id : '5547'
		}
	,	{
			name: 'shopping_16.css'
		,	content: 'body { background-color: red; }'
		}
	];

	var files_to_copy_src = [
			'ExtensionSource/Extension1/templates/Header/header.tpl'
		,	'ExtensionSource/Extension3/sass/SassFiles/file_1.scss'
		,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping.scss'
		,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js'
	];

	var files_to_copy_src_not_exist = [
			'ExtensionSource/Extension1/templates/Header/header.tpl'
		,	'ExtensionSource/Extension3/sass/SassFiles/file_1.scss'
		,	'ExtensionSource/Extension1/sass/MyExamplePDPExtension1/shopping_NOT_EXIST.scss'
		,	'ExtensionSource/Extension2/suitescript/MyExamplePDPExtension2/Extension2.Other.Model.js'
	];

	var files_to_copy_dst = [
		{
			name: 'header_copy.tpl'
		,	folder_id: '5547'
		}
	,	{
			name: 'file_1_copy.scss'
		,	folder_id: '5547'
		}
	,	{
			name: 'shopping_copy.scss'
		,	folder_id: '5547'
		}
	,	{
			name: 'Extension2.Other.Model_copy.js'
		,	folder_id: '5547'
		}
	];

	var files_to_copy_dst_without_folder = [
		{
			name: 'header_copy.tpl'
		}
	,	{
			name: 'file_1_copy.scss'
		}
	,	{
			name: 'shopping_copy.scss'
		}
	,	{
			name: 'Extension2.Other.Model_copy.js'
		}
	];


	return {
		files_list: files_list
	,	files_list_not_exist_all_cached: files_list_not_exist_all_cached
	,	files_list_not_exist_cached_and_new: files_list_not_exist_cached_and_new
	,	files_list_optional: files_list_optional
	,	files_to_write: files_to_write
	,	files_to_write_invalid: files_to_write_invalid
	,	files_to_copy_src: files_to_copy_src
	,	files_to_copy_dst: files_to_copy_dst
	,	files_to_copy_src_not_exist: files_to_copy_src_not_exist
	,	files_to_copy_dst_without_folder: files_to_copy_dst_without_folder
	};

});