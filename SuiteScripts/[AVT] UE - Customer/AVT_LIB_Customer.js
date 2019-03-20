/**
 * Copyright (c) 2013  SuiteWerx Solutions.
 * San Pedro, Laguna, Philippines.
 * Quezon City, Philippines.
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * SuiteWerx Solutions ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with SuiteWerx Solutions.
 * 
 */

 /**
 * $Id$
 */
 
/**
 * 
 * Author: Daniel Arenas
 * Email: daniel.r.arenas@gmail.com
 * 
 */

// Prototype Utilities

// Function to check if array element exist
Array.prototype.inArray = function(valueStr)
{
	var convertedValueStr = valueStr.toString();
	
	for(var i = 0; i < this.length; i++)
	{
		if (this[i] === convertedValueStr)
		
		return true;
	
	}
	return false;
};

Object.size = function(obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
	var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Array.prototype.randomize = function()
{
	var i = this.length, j, temp;
	while ( --i )
	{
		j = Math.floor( Math.random() * (i - 1) );
		temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
}

// Custom utilities
function isNullOrEmpty(valueStr)
{
   return(valueStr == null || valueStr == "" || valueStr == undefined); 
}

function isNullOrEmptyObject(obj) 
{
   var hasOwnProperty = Object.prototype.hasOwnProperty;
   
   if (obj.length && obj.length > 0) { return false; }   
   for (var key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
   return true;
}

function isObjectExist(objFld)
{
   var isObjExist = (typeof objFld != "undefined") ? true : false;
   return isObjExist;
}


function forceParseFloat(stValue)
{
    var flValue = parseFloat(stValue);
    
    if (isFinite(flValue) == false)
    {
        return 0.00;        
    }
    
    if (isNaN(flValue))
    {
        return 0.00;
    }
    
    return flValue;
}

function cleanArray(dirtyArray)
{
	var newArray = [];
	
	for(var i = 0; i < dirtyArray.length; i++)
	{
		if (dirtyArray[i]) 
		{ 
			newArray.push(dirtyArray[i]);
		}
	}
	return newArray;
}

function removeDuplicateElement(arrayName)
{
	var newArray = [];
	label:for(var i = 0; i < arrayName.length;i++ )
	{  
		for(var j = 0; j < newArray.length;j++ )
		{
			if(newArray[j]==arrayName[i]) 
			continue label;
		}
		newArray[newArray.length] = arrayName[i];
	}
	return newArray;
}

function replaceChars(valusStr, out, add) 
{
	temp = '' + valusStr; // temporary holder
	
	while (temp.indexOf(out) > -1) 
	{
		pos= temp.indexOf(out);
		temp = "" + (temp.substring(0, pos) + add + 
		temp.substring((pos + out.length), temp.length));
	}
	return temp;
}

function getObjLogoBannerImageMapping(paramArrImgInternalids)
{
	var functionName = 'getObjLogoBannerImageMapping';
	var processStr = '';
	var objImageMapping = {};
	var arrImageIds = paramArrImgInternalids;
	var arrImageIdTotal = (!isNullOrEmpty(arrImageIds)) ? arrImageIds.length : 0;
	var hasArrImage = (arrImageIdTotal != 0) ? true : false;
	
	try
	{

		if (hasArrImage)
		{
			var arrFilters = [  new nlobjSearchFilter('internalid', null, 'anyof', arrImageIds) ];
			var arrColumns = [  new nlobjSearchColumn('url'), new nlobjSearchColumn('availablewithoutlogin') ];
			var searchResults = nlapiSearchRecord('file', null, arrFilters, arrColumns);
			var searchResultsTotal = (!isNullOrEmpty(searchResults)) ? searchResults.length : 0;
			var hasSearchResults = (searchResultsTotal != 0) ? true : false;
			
			if (hasSearchResults)
			{
				for (var xj = 0; xj < searchResultsTotal; xj++)
				{
					var searchResult = searchResults[xj];
					var imgId = searchResult.getId();
					var imgUrl = searchResult.getValue('url');
					var isImgAvailableWithOutLogin = searchResult.getValue('availablewithoutlogin');

					objImageMapping['' + imgId + ''] = {};
					objImageMapping['' + imgId + '']['url'] = imgUrl;
					objImageMapping['' + imgId + '']['availablewithoutlogin'] = (isImgAvailableWithOutLogin == 'T') ? true : false;

				}
			}
		}
		
	}
		catch(ex)
	{
		objImageMapping = {};
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	return objImageMapping;
	
}


function makeLogoBannerFileAvailableWithoutLogin(paramArrImages)
{

	var functionName = 'makeLogoBannerFileAvailableWithoutLogin';
	var processStr = '';
	var arrImages = paramArrImages;
	var arrImagesTotal = (!isNullOrEmpty(arrImages)) ? arrImages.length : 0;
	var hasArrImages = (arrImagesTotal != 0) ? true : false;
	
	try
	{
		if (hasArrImages)
		{
			for (var dx = 0; dx < arrImagesTotal; dx++)
			{
				var fileId = arrImages[dx];
				var fileRef = nlapiLoadFile(fileId);
				fileRef.setIsOnline(true);
				nlapiSubmitFile(fileRef)
			}
		}
	}
		catch(ex)
	{
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	return arrImages;
}


function getObjLogoBannerUrl(paramObjRec)
{
	var functionName = 'getObjLogoBannerUrl';
	var processStr = '';
	var objRec = paramObjRec;

	var retObj = {};
	retObj['logo'] = '';
	retObj['banner'] = '';
	
	try
	{
		var arrImages = [];
		var arrImagesNotAvailableExternally = [];
		
		var imgLogoId = objRec.getFieldValue(FLD_TAILOR_LOGO);
		var imgBannerId = objRec.getFieldValue(FLD_TAILOR_BANNER);
		
		var hasLogo = (!isNullOrEmpty(imgLogoId)) ? true : false;
		var hasBanner = (!isNullOrEmpty(imgBannerId)) ? true : false;
		
		var isPushArrImagesLogo = (hasLogo) ? arrImages.push(imgLogoId) : '';
		var isPushArrImagesBanner = (hasBanner) ? arrImages.push(imgBannerId) : '';
		
		var arrImagesTotal = (!isNullOrEmpty(arrImages)) ? arrImages.length : 0;
		var hasArrImages = (arrImagesTotal != 0) ? true : false;
		
		if (hasArrImages)
		{
			var objImgLogoBannerMapping = getObjLogoBannerImageMapping(arrImages);
			
			retObj['logo'] = (isObjectExist(objImgLogoBannerMapping['' + imgLogoId + ''])) ? objImgLogoBannerMapping['' + imgLogoId + '']['url'] : '';
			retObj['banner'] = (isObjectExist(objImgLogoBannerMapping['' + imgBannerId + ''])) ? objImgLogoBannerMapping['' + imgBannerId + '']['url'] : '';
		
			for (var dx in objImgLogoBannerMapping)
			{
				var isImageAvailableOnline = objImgLogoBannerMapping[dx]['availablewithoutlogin'];
				var isPushArrImagesNotAvailableExternally = (!isImageAvailableOnline) ? arrImagesNotAvailableExternally.push(dx) : '';
			}
			
			var arrImagesNotAvailableExternallyTotal = (!isNullOrEmpty(arrImagesNotAvailableExternally)) ? arrImagesNotAvailableExternally.length : 0;
			var hasArrImagesNotAvailableExternally = (arrImagesNotAvailableExternallyTotal != 0) ? true : false;
			
			if (hasArrImagesNotAvailableExternally)
			{
				var forceLogoBannerAvailableWithoutLogin = makeLogoBannerFileAvailableWithoutLogin(arrImagesNotAvailableExternally);
			}
		}
	}
		catch(ex)
	{
		retObj['logo'] = '';
		retObj['banner'] = '';
        var errorStr = (ex.getCode != null) ? ex.getCode() + '<br>' + ex.getDetails() + '<br>' + ex.getStackTrace().join('<br>') : ex.toString();
        nlapiLogExecution('debug', functionName, 'A problem occured whilst ' + processStr + ': ' + '<br>' + errorStr);
	}
	
	return retObj;
	
}
