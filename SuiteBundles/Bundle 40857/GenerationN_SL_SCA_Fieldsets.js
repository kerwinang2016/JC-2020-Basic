/**
 * SuiteCommerce: Building Web Stores Part 1
 * Exercise 02-01
 *
 * This is a Suitelet used to generate a default set of
 * fieldsets for a SuiteCommerce Advanced Web Site
 * 
 * This version currently supports the setup requirements
 * of ShopFlow 1.03.0 and My Account 1.03.0
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function configureFieldSets(request, response){

	var form;
	
	if (request.getMethod() == 'GET'){

		form = nlapiCreateForm('Fieldset Generator', false);
		
        var fldHelp = form.addField('custpage_help', 'inlinehtml');
		fldHelp.setDefaultValue(
            '<span style="color:darkred">Open the SuiteCommerce Advanced ' +
		    'Web Site Setup record. Find the <b>id</b> parameter in the url. ' +
		    'Take the value and place into the <b>Site ID</b> field below. Click ' +
		    '<b>Generate Field Sets</b> to configure data for items on the shopping ' +
		    'page. <b>Note:</b> You may need to wait about 5 minutes before ' +
		    'data displays for the items. Refresh the shopping site by re-entering ' +
		    'the url without <b>#search</b>. Just enter ' +
		    '<b>http://your.domain/ShopFlow/index.ssp</b>' +
			'<br><br><br></span>'); 		

		// set help text to top left above other fields
        fldHelp.setLayoutType('outsideabove', 'startrow');
		
		form.addField('custpage_siteid', 'integer','Site ID');
		
		form.addSubmitButton('Generate Field Sets');
		
		response.writePage(form);
	} else {
		try{
			var context = nlapiGetContext();
			var siteID = request.getParameter('custpage_siteid');
			
			// rename or delete same named fieldsets already on web site setup record,
			// or you will get a duplicate error
			var siteRecord = nlapiLoadRecord('website', siteID);
			
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'search');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'search');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'itemimages_detail,itemoptions_detail,internalid,onlinecustomerprice,onlinecustomerprice_detail,onlinecustomerprice_formatted,onlinematrixpricerange,onlinematrixpricerange_formatted,displayname,itemid,outofstockmessage,stockdescription,storedisplayname2,isinstock,isbackorderable,ispurchasable,showoutofstockmessage');
			siteRecord.commitLineItem('fieldset');
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'details');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'details');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'itemimages_detail,itemoptions_detail,internalid,matrixchilditems_detail,onlinecustomerprice_detail,quantityavailable,displayname,itemtype,itemid,outofstockmessage,pagetitle,rate,rate_formatted,relateditemsdescription,stockdescription,storedetaileddescription,storedisplayname2,isinstock,isbackorderable,ispurchasable,showoutofstockmessage,correlateditems_detail,relateditems_detail');
			siteRecord.commitLineItem('fieldset');
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'matrixchilditems');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'matrixchilditems');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'onlinecustomerprice_detail,internalid,quantityavailable,outofstockbehavior,outofstockmessage,isinstock,isbackorderable,ispurchasable');
			siteRecord.commitLineItem('fieldset');
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'order');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'order');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'itemimages_detail,itemoptions_detail,onlinecustomerprice_detail,displayname,internalid,itemid,storedisplayname2,urlcomponent,outofstockmessage,showoutofstockmessage,isinstock,isbackorderable,ispurchasable,pricelevel1,pricelevel1_formatted,stockdescription,matrixchilditems_detail,itemtype,minimumquantity,isonline,isinactive');
			siteRecord.commitLineItem('fieldset');
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'Correlated Items');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'correlateditems');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'itemimages_detail,itemoptions_detail,internalid,onlinecustomerprice,onlinecustomerprice_detail,onlinecustomerprice_formatted,onlinematrixpricerange,onlinematrixpricerange_formatted,quantityavailable,displayname,itemid,outofstockbehavior,outofstockmessage,stockdescription,storedescription,storedisplaythumbnail,storedisplayname2,isinstock,isbackorderable,ispurchasable,showoutofstockmessage');
			siteRecord.commitLineItem('fieldset');
			siteRecord.selectNewLineItem('fieldset');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetname', 'Related Items');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetid', 'relateditems');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetrecordtype', 'ITEM');
			siteRecord.setCurrentLineItemValue('fieldset', 'fieldsetfields', 'itemimages_detail,itemoptions_detail,internalid,onlinecustomerprice,onlinecustomerprice_detail,onlinecustomerprice_formatted,onlinematrixpricerange,onlinematrixpricerange_formatted,quantityavailable,displayname,itemid,outofstockbehavior,outofstockmessage,stockdescription,storedescription,storedisplaythumbnail,storedisplayname2,isinstock,isbackorderable,ispurchasable,showoutofstockmessage');
			siteRecord.commitLineItem('fieldset');			
			
			recId = nlapiSubmitRecord(siteRecord);		
		} catch (e){
			throw nlapiCreateError('ERROR01','error generating fieldset', true);
		}
		
		form = nlapiCreateForm('Fieldset Generator', false);
		form.addField('custpage_message', 'help',
				      'SCA fieldsets created. Re-executing will cause a duplicate error');
		
		response.writePage(form);
	}
	
}
