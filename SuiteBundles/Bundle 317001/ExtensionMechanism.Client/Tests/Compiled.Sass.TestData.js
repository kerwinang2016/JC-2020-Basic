define('Compiled.Sass.TestData', [], function(){
	
	var compiled_sass = '.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}body nav ul{margin:0;padding:0;list-style:none;color:red}body nav li{display:inline-block}body nav a{display:block;padding:6px 12px;text-decoration:none}body{background:#ccc}p{color:#ecf}.container{width:100%}.col-4{width:25%}';
	var compiled_sass_ie = '.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}body nav ul{margin:0;padding:0;list-style:none;color:red}body nav li{display:inline-block}body nav a{display:block;padding:6px 12px;text-decoration:none}body{background:#ccc}p{color:#ecf}.container{width:100%}.col-4{width:25%}';
	var ie_files_statement = 'var ie_css = {"46":{"shopping":1}};';
	var compiled_sass_override = '.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}.my-extension-1-error-content{font:100% Helvetica,sans-serif;color:red}body nav ul{margin:0;padding:0;list-style:none;color:green}body nav li{display:inline-block}body nav a{display:block;padding:6px 12px;text-decoration:none}body{background:#ccc}p{color:#ecf}.container{width:100%}.col-4{width:25%}\n';
	var compiled_sass_override_folder_optional = compiled_sass_override;
	
	return {
		compiled_sass: compiled_sass
	,	compiled_sass_ie: compiled_sass_ie
	,	ie_files_statement: ie_files_statement
	,	compiled_sass_override: compiled_sass_override
	,	compiled_sass_override_folder_optional: compiled_sass_override_folder_optional
	}; 
});