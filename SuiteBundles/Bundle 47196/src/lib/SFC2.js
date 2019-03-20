/**
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @author aalcabasa
 */
var NETSUITE_GLOBAL = this;
var SFC2 = SFC2 || new (function()
{
    //Dependencies
    var _Netsuite = NETSUITE_GLOBAL;
    this.SetNetsuite = function(value) { _Netsuite = value; };

    this.ApplyTemplate = _ApplyTemplate;
    this.IsEqualStrings = _IsEqualStrings;
    this.CloneObject = _CloneObject;
    this.Pad = _Pad;



    function _ApplyTemplate(data, sTemplate)
    {
        var sContent = sTemplate;

        for (var i in data)
        {
            var re = new RegExp("\\{" + i + "\\}", "g");
            sContent = sContent.replace(re, data[i]);
        }

        return sContent;
    }



    function _IsEqualStrings(s1, s2)
    {
        return s1.toString() == s2.toString();
    }



    function _Pad(n, length)
    {
        for (var s = n.toString(); s.length < length; s = "0" + s) /*empty*/;
        return s;
    }



    function _CloneObject(obj)
    {
        if (obj === null || typeof obj !== "object")
            return obj;

        var copyObj = obj.constructor();

        for (var i in obj)
        {
            if (obj.hasOwnProperty(i))
                copyObj[i] = obj[i];
        }

        return copyObj;
    }


    //==============================================================================
    this.Application = function(appGuid)
    {
        var _AppGuid = appGuid;
        var _AppFolderId = null;

        this.GetFileId = GetFileId;
        this.GetFileContent = GetFileContent;



        //--------------------------------------------------------------------------
        function _GetFolderIdByGUID(guid)
        {
            if (_AppFolderId == null)  //Lazy load folder id
            {
                //Find folder id using GUID file
                var filters = [new _Netsuite.nlobjSearchFilter("name", null, "is", guid)];
                var rs = _Netsuite.nlapiSearchRecord("file", null, filters, [new _Netsuite.nlobjSearchColumn("folder")]);
                _AppFolderId = rs[0].getValue("folder");
            }

            return _AppFolderId;
        }



        function GetFileId(fileName)
        {
            //Find file internalid using filename and folder id
            var filters = [
                new _Netsuite.nlobjSearchFilter("name", null, "is", fileName),
                new _Netsuite.nlobjSearchFilter("folder", null, "is", _GetFolderIdByGUID(_AppGuid))
            ];

            var rs = _Netsuite.nlapiSearchRecord("file", null, filters);
            return (rs == null) ? null : rs[0].getId();
        }



        function GetFileContent(fileName)
        {
            var fileId = GetFileId(fileName);
            if (fileId == null)
                return null;

            var file = _Netsuite.nlapiLoadFile(fileId);

            return file.getValue();
        }
    }
})();


