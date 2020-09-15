define('SuiteScriptMock', [
		'../../CommonUtilities/SuiteScript'
	,	'./SuiteScriptMock.TestData'
	]
,	function (
		SuiteScript
	,	TestData
	)
{
	'use strict';

	var suitescript_mock = {

		nlapiLoadFile: function nlapiLoadFile(path)
		{
			if(TestData.mock_files[path])
			{
				return TestData.mock_files[path];
			}
			else
			{
				throw new nlapiCreateError('RCRD_DSNT_EXIST', 'That record does not exist. path: ' + path);
			}
		}

	,	nlapiCreateFile: function nlapiCreateFile(name, type, content)
		{
			return {

				folder_id: ''

			,	name: name

			,	type: type

			,	content: content

			,	setFolder: function setFolder(folder_id)
				{
					this.folder_id = folder_id;
				}
			};


		}

	,	nlapiSubmitFile: function nlapiSubmitFile()
		{
			return '1356';
		}

	,	nlapiCreateRecord: function nlapiCreateRecord(type)
		{
			return {
				type: type

			,	setFieldValue: function setFieldValue(key, value)
				{
					this[key] = value;
				}
			};

		}

	,	nlapiSubmitRecord: function nlapiSubmitRecord()
		{
			return '234567';
		}

	,	nlapiDeleteFile: function nlapiDeleteFile()
		{
			return true;
		}
	};

	return _.extend(SuiteScript, suitescript_mock);
});
