function getitemfields() {
    return [
        'urlcomponent', 'displayname', 'type', 'internalid', 'itemid', 'minimumquantity', 'outofstockmessage', 'stockdescription', 'storedisplayimage', 'storedisplaythumbnail', 'storedisplayname', 'custitem_ftstatus'
    ];
}

function MyAccountPOST(request, response) {
    var action = request.getParameter('action');
    var user = request.getParameter('user');
    //nlapiLogExecution('debug','user',request.getParameter('user'));
    //nlapiLogExecution('debug','action',action);
    var returnObj = "";
    switch (action) {
        case "getsubtailors":
            returnObj = getSubtailors(user);
            break;
        case "getcmtandstockedfabric":
            returnObj = getCMTandStockedFabric(user);
            break;
        case "getsurchargesformakeandtrim":
            returnObj = getSurchargesForMakeAndTrim(user);
            break;
        case "getcutlengthfabricvendors":
            returnObj = getCutLengthFabricVendors(user);
            break;
        case "getfabriccmtdescriptions":
            returnObj = getFabricCMTDescriptions(request.getParameter('user'), request.getParameter('item'), request.getParameter('currency'), request.getParameter('pricelevel'));
            break;
        case "getitemfields":
            returnObj = getItemFields(request.getParameter('item'), request.getParameter('currency'), request.getParameter('pricelevel'));
            break;
        case "getserviceitemfields":
            returnObj = nlapiLookupField('noninventoryitem', request.getParameter('item'), ['custitem_jerome_cmt_basic_price']);
            break;
        case "getcustomerdetails":
            returnObj = getCustomerDetails(request.getParameter('user'));
            break;

        case "getprice":
            returnObj = getPrice(request.getParameter('item'), request.getParameter('pricelevel'), request.getParameter('currency'), request.getParameter('customerpricelevel'));
            break;
        case "getparent":
            returnObj = getParent(user);
            break;
        case "getchildren":
            returnObj = getChildren(user);
            break;
        case "getorders":
            returnObj = getOrders(request);
            break;
        case "getordersV2":
            returnObj = getOrdersV2(request);
            break;
        case "getorder":
            if (!request.getParameter('user')) returnObj = {};
            else returnObj = getOrder(request.getParameter('id'), request.getParameter('user'));
            break;
        case "getorderV2":
            if (!request.getParameter('user')) returnObj = {};
            else returnObj = getOrderV2(request.getParameter('id'), request.getParameter('user'));
            break;

        case "createproductlist":
            returnObj = createProductList(request.getParameter('user'), JSON.parse(request.getBody()));
            break;
        case "getstocklist":
            returnObj = getStockList();
            break;
        case "getclientname":
            returnObj = getClientName(request.getParameter('tailorid'), request.getParameter('clientid'));
            break;
        case "downloadstocklist": {
            if (request.getParameter('id')) {
                var file = nlapiLoadFile(request.getParameter('id'));
                var ext = "xls"
                switch (file.getType()) {
                    case "EXCEL":
                        ext = "xls";
                        break;
                    case "CSV":
                        ext = "csv";
                        break;
                    case "PDF":
                        ext = "pdf";
                        break;
                }
                response.setContentType(file.getType(), file.getName() + "." + ext)
                response.write(file.getValue());
                break;
            }
        }
        case "createpayment":
            var data = JSON.parse(request.getBody());
            //nlapiLogExecution('debug','requestJSON',JSON.stringify(request.getBody()));
            // update record
            var payment_record = updatePayment(createPayment(user, data), data)
                // save record.
                ,
                payment_record_id = nlapiSubmitRecord(payment_record)
            returnObj = payment_record_id;
            break;
        case "getvatreversecharge":
            if (user) {
                var vatListId = nlapiLookupField('customer', user, 'custentity_vat_reverse_charge_message');
                if (vatListId) {
                    var vatreversecharge = nlapiLookupField('customlist_vat_reverse_charge', vatListId, 'name');
                    returnObj = vatreversecharge ? vatreversecharge : '';
                }
            }
            break;
        case "updatelineordertype":

            var orderid = request.getParameter('internalid');
            var ordertypeid = request.getParameter('ordertypeid');
            var soid = request.getParameter('soid');
            returnObj = updateLineOrderType(orderid, soid, ordertypeid);
            break;
        case "marginreport":
            var tailor = request.getParameter('tailor');
            var page = request.getParameter('page');
            returnObj = getMarginReport(tailor, page);
            break;
        case "lineordertypereport":
            var tailor = request.getParameter('tailor');
            var page = request.getParameter('page');
            returnObj = getLineOrderTypeReport(tailor, page);
            break;
    }
    if (action == 'downloadstocklist') {} else {
        //nlapiLogExecution('debug','ReturnJSON',JSON.stringify(returnObj));
        response.write(JSON.stringify(returnObj));
    }
}
function getSubtailors(user){
	var filters = [], subtailors = [];
    filters.push(new nlobjSearchFilter('parent', null, 'anyof', user));
    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    var cols = [];
    cols.push(new nlobjSearchColumn('internalid'));
    cols.push(new nlobjSearchColumn('altname'));
    var dpl_results = nlapiSearchRecord('customer', null, filters, cols);
    if (dpl_results) {
        for (var i = 0; i < dpl_results.length; i++) {
            subtailors.push({
                internalid: dpl_results[i].getValue('internalid'),
                name: dpl_results[i].getValue('altname')
            });
        }
    }
	return subtailors;

}
function getCMTandStockedFabric(user) {
    var returnObj = {},
        dayangPrices = [],
        shippingcharges = [];
    var customerfields = getCustomerDetails(user);
    var currentPricelevel = customerfields.custentity_dayang_pricelevel ? customerfields.custentity_dayang_pricelevel : customerfields.pricelevel;
    var discountPercentages = {
        threepc: 'custentity_cmt_discount_3pc',
        twopc: 'custentity_cmt_discount_2pc',
        jacket: 'custentity_cmt_discount_jacket',
        trouser: 'custentity_cmt_discount_trouser',
        waistcoat: 'custentity_cmt_discount_waistcoat',
        shirt: 'custentity_cmt_discount_shirt',
        overcoat: 'custentity_cmt_discount_overcoat',
        trenchcoat: 'custentity_cmt_discount_trenchcoat',
        ladiesthreepc: 'custentity_cmt_discount_l3pc_suit',
        twopcpants: 'custentity_cmt_discount_l2pc_pants',
        twopcskirt: 'custentity_cmt_discount_l2pc_skirt',
        ladiesjacket: 'custentity_cmt_discount_ladies_jacket',
        ladiespants: 'custentity_cmt_discount_ladies_pants',
        ladiesskirt: 'custentity_cmt_discount_ladies_skirt',
        shortsleeve: 'custentity_cmt_discount_ss_shirt',
        shorts: 'custentity_cmt_discount_shorts',
        morningcoat: 'custentity_cmt_discount_morning_coat',
        shirtjacket: 'custentity_cmt_discount_shirt_jacket',
        campshirt: 'custentity_cmt_discount_camp_shirt',
        safarijacket: 'custentity_cmt_discount_safari_jacket'
    };

    var filters = [];
    filters.push(new nlobjSearchFilter('custrecord_dtp_pricelevel', null, 'anyof', currentPricelevel));
    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    var cols = [];
    cols.push(new nlobjSearchColumn('custrecord_dtp_fab_collection').setSort(false));
    cols.push(new nlobjSearchColumn('custrecord_dtp_producttype'));
    cols.push(new nlobjSearchColumn('custrecord_dtp_price'));
    var dpl_results = nlapiSearchRecord('customrecord_dayang_pricing', null, filters, cols);
    if (dpl_results) {
        for (var i = 0; i < dpl_results.length; i++) {
            dayangPrices.push({
                fabriccollection: dpl_results[i].getValue('custrecord_dtp_fab_collection'),
                producttype: dpl_results[i].getText('custrecord_dtp_producttype'),
                price: dpl_results[i].getValue('custrecord_dtp_price')
            });
        }
    }

    var allCMT = [];
    var productTypes = {
        "3-Piece-Suit": {
            id: "9904",
            name: "threepc"
        },
        "2-Piece-Suit": {
            id: "9903",
            name: "twopc"
        },
        "Jacket": {
            id: "9898",
            name: "jacket"
        },
        "Trouser": {
            id: "9899",
            name: "trouser"
        },
        "Waistcoat": {
            id: "9900",
            name: "waistcoat"
        },
        "Shirt": {
            id: "9902",
            name: "shirt"
        },
        "Overcoat": {
            id: "9901",
            name: "overcoat"
        },
        "Trenchcoat": {
            id: "292321",
            name: "trenchcoat"
        },
        "L-3PC-Suit": {
            id: "292332",
            name: "ladiesthreepc"
        },
        "L-2PC-Pants": {
            id: "292331",
            name: "twopcpants"
        },
        "L-2PC-Skirt": {
            id: "292330",
            name: "twopcskirt"
        },
        "Ladies-Jacket": {
            id: "292328",
            name: "ladiesjacket"
        },
        "Ladies-Pants": {
            id: "292327",
            name: "ladiespants"
        },
        "Ladies-Skirt": {
            id: "292326",
            name: "ladiesskirt"
        },
        "Short-Sleeves-Shirt": {
            id: "292329",
            name: "shortsleeve"
        },
        "Shorts": {
            id: "296338",
            name: "shorts"
        },
        "Morning-Coat": {
            id: "296339",
            name: "morningcoat"
        },
        "Safari-Jacket": {
            id: "296340",
            name: "safarijacket"
        },
        "Shirt-Jacket": {
            id: "296341",
            name: "shirtjacket"
        },
        "Camp-Shirt": {
            id: "296342",
            name: "campshirt"
        }
    };
    var products = Object.keys(productTypes);
    //Build the CMT
    allCMT.push(buildCMTPrices(productTypes, customerfields, discountPercentages));
    //Build the Dayang Prices
    var tempObj = {}
    if (dayangPrices.length > 0) {
        for (var i = 0; i < dayangPrices.length; i++) {
            if (!tempObj[dayangPrices[i].fabriccollection])
                tempObj[dayangPrices[i].fabriccollection] = {};
            tempObj[dayangPrices[i].fabriccollection][productTypes[dayangPrices[i].producttype].name] = dayangPrices[i].price;
        }
        var collections = Object.keys(tempObj);
        for (var i = 0; i < collections.length; i++) {
            var tempObj2 = {};
            tempObj2.collection = collections[i];
            var collection_products = Object.keys(tempObj[collections[i]]);
            for (var j = 0; j < collection_products.length; j++) {
                //collection_products[j] shortcut producttype = Value
                var productPrice = tempObj[collections[i]][collection_products[j]] ? parseFloat(tempObj[collections[i]][collection_products[j]]) : 0;
                // if(customerfields[discountPercentages[collection_products[j]]]){
                // productPrice = productPrice;
                // }
                if (collection_products[j] == 'trenchcoat') {
                    tempObj2[collection_products[j]] = Math.round(parseFloat(allCMT[0][collection_products[j]]) + productPrice);
                    tempObj2[collection_products[j] + "fivebtn"] = Math.round(parseFloat(allCMT[0][collection_products[j] + "fivebtn"]) + (productPrice * 1.2));
                    tempObj2[collection_products[j] + "tenbtn"] = Math.round(parseFloat(allCMT[0][collection_products[j] + "tenbtn"]) + (productPrice * 1.3));
                } else {
                    tempObj2[collection_products[j]] = Math.round(parseFloat(allCMT[0][collection_products[j]]) + productPrice);
                }
            }
            var collections2 = Object.keys(tempObj2);
            var allZeros = true;
            for (var j = 0; j < collections2.length; j++) {
                if (tempObj2[collections2[j]] != 0) {
                    allZeros = false;
                    break;
                }
            }
            if (!allZeros)
                allCMT.push(tempObj2);
        }
    } else {
        //Dont send anything except CMT
        //setup dummy table
        // var fabriccollection = ["A","AA","B","BB","C","D","DA","DAA","DB","DBB","DC","DD","DE","DF","DFA",
        // "DFAA","DFB","DFBB","DH","E","F","G","H","I","J","K","L","M","O","P","Q","TB","WP"];
        // for(var i=0;i<fabriccollection.length;i++){
        // var tempObj2 = {};
        // tempObj2.collection = fabriccollection[i];
        // for(var j=0;j<products.length;j++){
        // if(productTypes[products[j]].name == "trenchcoat"){
        // tempObj2[productTypes[products[j]].name] = 0;
        // tempObj2[productTypes[products[j]].name+"fivebtn"] = 0;
        // tempObj2[productTypes[products[j]].name+"tenbtn"] = 0;
        // }else{
        // tempObj2[productTypes[products[j]].name] = 0;
        // }
        // }
        // allCMT.push(tempObj2);
        // }

    }


    //Build the Shipping Prices
    var allshipping = [];
    shippingcharges = getShippingCharges(user);
    if (shippingcharges.length == 0) {
        // let tempObj2 = {};
        // for(var i=0;i<products.length;i++){
        // tempObj2[productTypes[products[i]].name] = 0;
        // }
        // allshipping.push(tempObj2);
    } else {
        var tempObj2 = {};
        for (var i = 0; i < shippingcharges.length; i++) {
            var rate = shippingcharges[i].rate ? parseFloat(shippingcharges[i].rate) : 0
            tempObj2[productTypes[shippingcharges[i].producttype].name] = rate;
        }
        allshipping.push(tempObj2);
    }
    returnObj.allCMT = allCMT;
    returnObj.allShipping = allshipping;
    return returnObj;
}

function buildCMTPrices(productTypes, customerfields, discountPercentages) {
    var products = Object.keys(productTypes);
    var tempObj = {};
    tempObj.collection = "CMT";
    for (var i = 0; i < products.length; i++) {
        var cmtServiceItem = productTypes[products[i]].id;
        var cmtServicePrice = nlapiLookupField('noninventoryitem', cmtServiceItem, 'custitem_jerome_cmt_basic_price', false);

        if (customerfields[discountPercentages[productTypes[products[i]].name]])
            cmtServicePrice = parseFloat(cmtServicePrice) + (parseFloat(cmtServicePrice) * (parseFloat(customerfields[discountPercentages[productTypes[products[i]].name]]) / 100));
        if (productTypes[products[i]].name == "trenchcoat") {
            tempObj[productTypes[products[i]].name] = cmtServicePrice ? Math.round(cmtServicePrice) : 0;
            tempObj[productTypes[products[i]].name + "fivebtn"] = cmtServicePrice ? Math.round(cmtServicePrice) : 0;
            tempObj[productTypes[products[i]].name + "tenbtn"] = cmtServicePrice ? Math.round(cmtServicePrice) : 0;
        } else {
            tempObj[productTypes[products[i]].name] = cmtServicePrice ? Math.round(cmtServicePrice) : 0;
        }
    }
    return tempObj;

}

function getSurchargesForMakeAndTrim(user) {
    var returnObj = {};
    var surchargeOrder = [
      "Lining Surcharges",
      "Make Surcharges",
      "Formal Surcharges",
      "Other Surcharges",
      "Button Surcharges",
      "Other Shirt Surcharges"
    ];
    if (user) {
        var customerfields = getCustomerDetails(user);
        var surchargediscount = customerfields.custentity_surcharge_discount?parseFloat(customerfields.custentity_surcharge_discount):0;
        //customrecord_design_options_surcharge_we
        var cols = [];
        cols.push(new nlobjSearchColumn('custrecord_dow_description'));
        cols.push(new nlobjSearchColumn('custrecord_dow_surcharge_category'));
        cols.push(new nlobjSearchColumn('custrecord_dow_order'));
        cols.push(new nlobjSearchColumn('custrecord_dow_product_type'));
        cols.push(new nlobjSearchColumn('custrecord_dow_surcharge_amount'));

        var results = nlapiSearchRecord('customrecord_design_options_surcharge_we', null,
          [new nlobjSearchFilter('isinactive', null, 'is', 'F')],
          cols);
        var designOptions = [];
        if (results && results.length > 0) {
          for(var i=0; i<results.length; i++){
            var amt = parseFloat(results[i].getValue('custrecord_dow_surcharge_amount'));
            var amount = amt + (amt*surchargediscount/100);
            designOptions.push({
              description: results[i].getValue('custrecord_dow_description'),
              category: results[i].getValue('custrecord_dow_surcharge_category'),
              categorytext: results[i].getText('custrecord_dow_surcharge_category'),
              order: results[i].getValue('custrecord_dow_order'),
              producttype: results[i].getValue('custrecord_dow_product_type'),
              producttypetext: results[i].getText('custrecord_dow_product_type'),
              amount: amount
            });
          }
        }

      //Arrange the output by category and also product type
      for(var i=0; i<surchargeOrder.length;i++){
        // var data = {};
        var design = _.filter(designOptions,function(o){
          return o.categorytext == surchargeOrder[i];
        });
        design.sort(function(a,b){
          if(parseFloat(a.order) > parseFloat(b.order)) return 1;
          if(parseFloat(a.order) < parseFloat(b.order)) return -1;
          if(parseFloat(a.order) == parseFloat(b.order)) return 0;
        });
        // var temp1 = design.map(function(a) {return a.prodycttypetext;});
        // temp1 = _.uniq(temp1);
        //Now that we sorted it out.. we need to place them in an array of object per product type
        // {
        //   LiningSurcharge: [{
        //     L1:{
        //       2Piece: 10,
        //       3Piece: 20}
        //   }]
        // }
        var surchargeData = [], currentOrder = "", data = {},currentData = {}, description = "";

        for(var j=0; j<design.length; j++){

          if(currentOrder != design[j].order){
            if(!currentOrder){
              currentOrder = design[j].order;
              description = design[j].description;
            }else{
              // if(design[j].description == description){
                data[description] = currentData;
                surchargeData.push(data);
                currentOrder = design[j].order;
              // }
              currentData = {};
              data = {};
              description = design[j].description;
            }
          }
          currentData[design[j].producttypetext] = design[j].amount;
          if(j == design.length -1){
            data[description] = currentData;
            surchargeData.push(data);
            currentData = {};
            data = {};
          }
        }
        returnObj[surchargeOrder[i]] = surchargeData;
      }
    }
    return returnObj;
}

function getCutLengthFabricVendors(user) {
    var returnObj = [];
    if (user) {

        //Get first the customer's price level
        var customerFields = nlapiLookupField('customer', user, ['currency', 'pricelevel', 'custentity_acshirt_pricelevel',
            'custentity_ariston_pricelevel', 'custentity_carnet_pricelevel', 'custentity_dormeuil_pricelevel', 'custentity_drago_pricelevel',
            'custentity_dugdale_pricelevel', 'custentity_filarte_pricelevel', 'custentity_loropiana_pricelevel', 'custentity_thomasmason_pricelevel',
            'custentity_harrisons_pricelevel'
        ], true);
        var vendors = [{
                id: 689,
                name: 'AC Shirt',
                field: 'custentity_acshirt_pricelevel'
            },
            {
                id: 88,
                name: 'Ariston',
                field: 'custentity_ariston_pricelevel'
            },
            {
                id: 596,
                name: 'Carnet',
                field: 'custentity_carnet_pricelevel'
            },
            {
                id: 15,
                name: 'Dormeuil',
                field: 'custentity_dormeuil_pricelevel'
            },
            {
                id: 672,
                name: 'Drago',
                field: 'custentity_drago_pricelevel'
            },
            {
                id: 79,
                name: 'Dugdage Bros',
                field: 'custentity_dugdale_pricelevel'
            },
            {
                id: 675,
                name: 'Filarte',
                field: 'custentity_filarte_pricelevel'
            },
            {
                id: 54,
                name: 'Harrisons',
                field: 'custentity_harrisons_pricelevel'
            },
            {
                id: 59,
                name: 'Loro Piana',
                field: 'custentity_loropiana_pricelevel'
            },
            {
                id: 92,
                name: 'Thomas Mason',
                field: 'custentity_thomasmason_pricelevel'
            }
        ];
        var clfields = {
            'USD Price List': 'custentity_cl_price_usdprice',
            'USD Zero': 'custentity_cl_price_usdzero',
            'GBP Price List': 'custentity_cl_price_gbpprice',
            'GBP Zero': 'custentity_cl_price_gbpzero',
            'EUR Price List': 'custentity_cl_price_europrice',
            'EUR Zero': 'custentity_cl_price_eurozero',
            'US Dollar': 'custentity_cl_price_usdprice',
            'Euro': 'custentity_cl_price_europrice',
            'British Pounds': 'custentity_cl_price_gbpprice'
        };
        var cols = [];
        cols.push(new nlobjSearchColumn('name'));
        cols.push(new nlobjSearchColumn('url'));
        cols.push(new nlobjSearchColumn('modified'));
        for (var i = 0; i < vendors.length; i++) {
            var customVendorPriceLevel = customerFields[vendors[i].field];
            if (customVendorPriceLevel) {
                //Means the tailor field vendor has been set to a custom price..
                var vendorFileId = nlapiLookupField('vendor', vendors[i].id, clfields[customVendorPriceLevel]);
                if (vendorFileId) {
                    //Get the associated file of the vendor if exists
                    var results = nlapiSearchRecord('file', null, [new nlobjSearchFilter('internalid', null, 'is', vendorFileId)], cols);
                    if (results && results.length > 0) {
                        returnObj.push({
                            name: vendors[i].name,
                            filename: results[0].getValue('name'),
                            url: results[0].getValue('url'),
                            lastupdated: results[0].getValue('modified')
                        });
                    }
                } else {
                    if (clfields[customerFields.currency]) {
                        vendorFileId = nlapiLookupField('vendor', vendors[i].id, clfields[customerFields.currency]);
                        if (vendorFileId) {
                            //Get the associated file of the vendor if exists
                            var results = nlapiSearchRecord('file', null, [new nlobjSearchFilter('internalid', null, 'is', vendorFileId)], cols);
                            if (results && results.length > 0) {
                                returnObj.push({
                                    name: vendors[i].name,
                                    filename: results[0].getValue('name'),
                                    url: results[0].getValue('url'),
                                    lastupdated: results[0].getValue('modified')
                                });
                            }
                        }
                    }
                }
            } else {
                if (clfields[customerFields.currency]) {
                    var vendorFileId = nlapiLookupField('vendor', vendors[i].id, clfields[customerFields.currency]);
                    if (vendorFileId) {
                        //Get the associated file of the vendor if exists
                        var results = nlapiSearchRecord('file', null, [new nlobjSearchFilter('internalid', null, 'is', vendorFileId)], cols);
                        if (results && results.length > 0) {
                            returnObj.push({
                                name: vendors[i].name,
                                filename: results[0].getValue('name'),
                                url: results[0].getValue('url'),
                                lastupdated: results[0].getValue('modified')
                            });
                        }
                    }
                }
            }
        }
    }
    return returnObj;
}

function updateLineOrderType(orderid, soid, ordertypeid) {
    var returnObj = {};
    var record = nlapiLoadRecord('salesorder', orderid);
    for (var i = 1; i <= record.getLineItemCount('item'); i++) {
        if (record.getLineItemValue('item', 'custcol_so_id', i) == soid) {
            record.setLineItemValue('item', 'custcol_sale_item_type', i, ordertypeid);
        }
    }
    var id = nlapiSubmitRecord(record, true, true);
    returnObj.id = id;
    returnObj.status = 'success';
    return returnObj;
}

function getOrderCount(tailor) {
    var filters = [],
        columns = [];
    filters.push(new nlobjSearchFilter('name', null, 'anyof', tailor));
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
    filters.push(new nlobjSearchFilter("memo", null, "isnotempty"));
    filters.push(new nlobjSearchFilter("source", null, "anyof", 'NLWebStore'));
    var search = nlapiCreateSearch('salesorder', filters, columns).runSearch();
    return search.getResults(0, 500).length;
}

function getMarginReport(tailor, page) {
    //customrecord_item_shipping_charges
    //customrecord_dutiescost
    var shippingcharges = getShippingCharges();
    var duetiescosts = getDutiesCosts();
    var totalrecords = getOrderCount(tailor);
    var returnObj = [];
    var filters = [],
        columns = [];
    filters.push(new nlobjSearchFilter('name', null, 'anyof', tailor));
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
    filters.push(new nlobjSearchFilter("custcol_so_id", null, "isnotempty"));
    filters.push(new nlobjSearchFilter("taxline", null, "is", 'F'));
    filters.push(new nlobjSearchFilter("shipping", null, "is", 'F'));
    columns = [
        new nlobjSearchColumn('internalid').setSort(true), new nlobjSearchColumn('custcol_so_id'), new nlobjSearchColumn('custbody_customer_name'), new nlobjSearchColumn('item'), new nlobjSearchColumn("custitem_jerome_cmt_serviceitem", 'item'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('status'), new nlobjSearchColumn('fxamount'), new nlobjSearchColumn('custcol_tailor_cust_pricing'), new nlobjSearchColumn('custcol_sale_item_type'), new nlobjSearchColumn('custcol_producttype'), new nlobjSearchColumn('custitem_jerome_cmt_serviceitem', 'item')
    ];
    var search = nlapiCreateSearch('salesorder', filters, columns).runSearch();

    var searchindex = 0;
    var results = search.getResults(page * 50, (page + 1) * 50);
    // var results = nlapiSearchRecord('salesorder',null, filters, columns);
    if (results) {
        for (var i = 0; i < results.length; i++) {
            var found = _.find(returnObj, function(o) {
                return o.soid == results[i].getValue('custcol_so_id');
            });
            if (found) {
                if (results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'T') {
                    found.cmtamount == results[i].getValue('fxamount');
                } else {
                    found.fabricamount == results[i].getValue('fxamount');
                }
                totalcogs = found.fabricamount + found.cmtamount + found.shipping + found.duties;
                margin = parseFloat(found.tailorprice) - totalcogs;

            } else {
                var shipping = 0,
                    duties = 0,
                    margin = 0,
                    marginpercent = 0,
                    totalcogs = 0;
                var found = _.find(shippingcharges, function(d) {
                    return d.tailor == tailor && d.producttype == results[i].getValue('custcol_producttype')
                });
                if (found) {
                    shipping = found.rate ? parseFloat(found.rate) : 0;
                }
                var found = _.find(duetiescosts, function(d) {
                    return d.producttype == results[i].getValue('custcol_producttype')
                });
                if (found) {
                    if (found.exempt.indexOf(tailor) != -1)
                        duties = found.rate ? parseFloat(found.rate) : 0;
                }
                var fabricamount = results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'F' ? parseFloat(results[i].getValue('fxamount')) : 0;
                var cmtamount = results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'T' ? parseFloat(results[i].getValue('fxamount')) : 0;
                var tailorprice = results[i].getValue('custcol_tailor_cust_pricing') ? parseFloat(results[i].getValue('custcol_tailor_cust_pricing')) : 0;
                totalcogs = fabricamount + cmtamount + shipping + duties;
                margin = parseFloat(tailorprice) - totalcogs;
                returnObj.push({
                    internalid: results[i].getValue('internalid'),
                    soid: results[i].getValue('custcol_so_id'),
                    customer: results[i].getValue('custbody_customer_name'),
                    item: results[i].getText('item'),
                    trandate: results[i].getValue('trandate'),
                    transtatus: results[i].getValue('status'),
                    fabricamount: fabricamount,
                    cmtamount: cmtamount,
                    tailorprice: tailorprice,
                    saleitemtypeid: results[i].getValue('custcol_sale_item_type'),
                    salesitemtype: results[i].getText('custcol_sale_item_type'),
                    producttype: results[i].getValue('custcol_producttype'),
                    isservice: results[i].getValue('custitem_jerome_cmt_serviceitem', 'item'),
                    shipping: shipping,
                    duties: duties,
                    margin: margin,
                    marginpercent: marginpercent
                });
            }
        }
    }

    return {
        totalrecords: totalrecords,
        records: returnObj
    };
}

function getLineOrderTypeReport(tailor, page) {
    var totalrecords = getOrderCount(tailor);
    var returnObj = [];
    var filters = [],
        columns = [];
    filters.push(new nlobjSearchFilter('name', null, 'anyof', tailor));
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));

    filters.push(new nlobjSearchFilter("custcol_so_id", null, "isnotempty"));
    filters.push(new nlobjSearchFilter("taxline", null, "is", 'F'));
    filters.push(new nlobjSearchFilter("shipping", null, "is", 'F'));
    columns = [
        new nlobjSearchColumn('internalid').setSort(true), new nlobjSearchColumn('custcol_so_id'), new nlobjSearchColumn('custbody_customer_name'), new nlobjSearchColumn('item'), new nlobjSearchColumn("custitem_jerome_cmt_serviceitem", 'item'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('status'), new nlobjSearchColumn('fxamount'), new nlobjSearchColumn('custcol_tailor_cust_pricing'), new nlobjSearchColumn('custcol_sale_item_type'), new nlobjSearchColumn('custcol_producttype'), new nlobjSearchColumn('custitem_jerome_cmt_serviceitem', 'item')
    ];

    var search = nlapiCreateSearch('salesorder', filters, columns).runSearch();
    var searchindex = 0;
    var results = search.getResults(page * 50, (page + 1) * 50);

    //var results = nlapiSearchRecord('salesorder',null, filters, columns);
    if (results) {
        for (var i = 0; i < results.length; i++) {
            var found = _.find(returnObj, function(o) {
                return o.soid == results[i].getValue('custcol_so_id');
            });
            if (found) {
                if (results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'T') {
                    found.cmtamount == results[i].getValue('fxamount');
                } else {
                    found.fabricamount == results[i].getValue('fxamount');
                }
            } else {
                returnObj.push({
                    internalid: results[i].getValue('internalid'),
                    soid: results[i].getValue('custcol_so_id'),
                    customer: results[i].getValue('custbody_customer_name'),
                    item: results[i].getText('item'),
                    trandate: results[i].getValue('trandate'),
                    transtatus: results[i].getValue('status'),
                    fabricamount: results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'F' ? results[i].getValue('fxamount') : 0,
                    cmtamount: results[i].getValue('custitem_jerome_cmt_serviceitem', 'item') == 'T' ? results[i].getValue('fxamount') : 0,
                    tailorprice: results[i].getValue('custcol_tailor_cust_pricing'),
                    saleitemtypeid: results[i].getValue('custcol_sale_item_type'),
                    salesitemtype: results[i].getText('custcol_sale_item_type'),
                    producttype: results[i].getValue('custcol_producttype'),
                    isservice: results[i].getValue('custitem_jerome_cmt_serviceitem', 'item')
                });
            }
        }
    }
    return {
        totalrecords: totalrecords,
        records: returnObj
    };
}

function getClientName(tailorID, clientID) {
    if (clientID) {
        var tailor = nlapiLookupField('customer', tailorID, 'parent');
        var filters = [
                new nlobjSearchFilter('custrecord_tc_tailor', null, 'is', tailor ? tailor : tailorID),
                new nlobjSearchFilter('internalid', null, 'anyof', clientID)
            ]

            ,
            columns = [
                new nlobjSearchColumn('custrecord_tc_first_name'), new nlobjSearchColumn('custrecord_tc_last_name')
            ]

            ,
            profiles = nlapiSearchRecord('customrecord_sc_tailor_client', null, filters, columns);

        var clientName = null;
        for (index in profiles) {
            if (profiles[index].id == clientID) {
                clientName = profiles[index].getValue("custrecord_tc_first_name") + " " + profiles[index].getValue("custrecord_tc_last_name");
                break;
            }
        }
    }
    return clientName ? clientName.toString() : null;
}

function getItemFields(item, currency, pricelevel) {

    var returnObj = {};
    var filters = [
        new nlobjSearchFilter('currency', 'pricing', 'anyof', [currency]),
        new nlobjSearchFilter('pricelevel', 'pricing', 'anyof', [pricelevel]),
        new nlobjSearchFilter('internalid', null, 'anyof', [item])
    ];
    var columns = [new nlobjSearchColumn('unitprice', 'pricing'), new nlobjSearchColumn('vendor'), new nlobjSearchColumn('itemid')];
    var result = nlapiSearchRecord('item', null, filters, columns);
    var price = "",
        vendor = "",
        itemname = "";
    if (result && result.length > 0) {
        price = result[0].getValue('unitprice', 'pricing');
        vendor = result[0].getValue('vendor');
        itemname = result[0].getValue('itemid');
    } else {
        var filters = [
            new nlobjSearchFilter('internalid', null, 'anyof', [item])
        ];
        var columns = [new nlobjSearchColumn('vendor'), new nlobjSearchColumn('itemid')];
        var result = nlapiSearchRecord('item', null, filters, columns);
        if (result && result.length > 0) {
            price = 0
            vendor = result[0].getValue('vendor');
            itemname = result[0].getValue('itemid');
        }
    }
    returnObj.custitem_fabric_collection = nlapiLookupField('item', item, 'custitem_fabric_collection', true);
    returnObj.price = price;
    returnObj.vendor = vendor;
    returnObj.item = itemname;
    return returnObj;
}

function getFabricCMTDescriptions(tailorID, item, currency, pricelevel) {
    //Get the vendor of the item first.
    var customerfields = getCustomerDetails(tailorID);
    if (customerfields) {
        if (item != '253776') {
            var vendor = nlapiLookupField('item', item, 'vendor');

            //689 AC Shirt, 88 Ariston, 785 Artextile, 596 Carnet, 15 Dormeuil, 672 Drago, 79 Dugdale, 675 Filarte, 784 hudders, 59 Loro, 92 Thomas
            if (vendor == '689' || vendor == '88' || vendor == '785' || vendor == '596' || vendor == '15' ||
                vendor == '672' || vendor == '79' || vendor == '675' || vendor == '784' || vendor == '59' || vendor == '92' || vendor == '17' || vendor == '671' ||
                vendor == '54') {

                switch (vendor) {
                    case '689':
                        if (customerfields.custentity_acshirt_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_acshirt_pricelevel;
                        break;
                    case '88':
                        if (customerfields.custentity_ariston_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_ariston_pricelevel;
                        break;
                    case '785':
                        if (customerfields.custentity_artextile_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_artextile_pricelevel;
                        break;
                    case '596':
                        if (customerfields.custentity_carnet_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_carnet_pricelevel;
                        break;
                    case '15':
                        if (customerfields.custentity_dormeuil_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_dormeuil_pricelevel;
                        break;
                    case '672':
                        if (customerfields.custentity_drago_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_drago_pricelevel;
                        break;
                    case '79':
                        if (customerfields.custentity_dugdale_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_dugdale_pricelevel;
                        break;
                    case '675':
                        if (customerfields.custentity_filarte_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_filarte_pricelevel;
                        break;
                    case '784':
                        if (customerfields.custentity_huddersfield_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_huddersfield_pricelevel;
                        break;
                    case '59':
                        if (customerfields.custentity_loropiana_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_loropiana_pricelevel;
                        break;
                    case '92':
                        if (customerfields.custentity_thomasmason_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_thomasmason_pricelevel;
                        break;
                    case '54':
                        if (customerfields.custentity_harrisons_pricelevel)
                            customerfields.pricelevel = customerfields.custentity_harrisons_pricelevel;
                        break;
                    case '671':
                    case '17':
                        if (customerfields.custentity_dayang_pricelevel) {
                            customerfields.pricelevel = customerfields.custentity_dayang_pricelevel;
                        }
                        break;

                    default:
                }
            }
        }
    }
    //nlapiLogExecution('debug','Customer Fields', customerfields);
    returnObj = {
        customerfields: customerfields,
        itemfields: getItemFields(item, currency, customerfields ? customerfields.pricelevel : 1)
    }
    return returnObj;
}

function getCustomerDetails(tailorID) {

    return nlapiLookupField('customer', tailorID,
        ['custentity_hide_billingandcogs', 'custentity_dayang_pricelevel', 'custentity_thomasmason_pricelevel', 'custentity_loropiana_pricelevel', 'custentity_huddersfield_pricelevel', 'custentity_filarte_pricelevel',
            'custentity_dugdale_pricelevel', 'custentity_drago_pricelevel', 'custentity_dormeuil_pricelevel', 'custentity_carnet_pricelevel',
            'custentity_artextile_pricelevel', 'custentity_ariston_pricelevel', 'custentity_acshirt_pricelevel',
            'custentity_harrisons_pricelevel',
            'custentity_jerome_cmt_service_preference', 'currency', 'pricelevel', 'custentity_surcharge_discount', 'custentity_cmt_discount_jacket', 'custentity_cmt_discount_waistcoat', 'custentity_cmt_discount_trouser', 'custentity_cmt_discount_shirt', 'custentity_cmt_discount_overcoat', 'custentity_cmt_discount_2pc', 'custentity_cmt_discount_3pc',
            'custentity_cmt_discount_ss_shirt', 'custentity_cmt_discount_ladies_skirt', 'custentity_cmt_discount_ladies_pants', 'custentity_cmt_discount_ladies_jacket', 'custentity_cmt_discount_trenchcoat',
            'custentity_cmt_discount_l2pc_skirt', 'custentity_cmt_discount_l3pc_suit', 'custentity_cmt_discount_l2pc_pants', 'terms',
            'custentity_cmt_discount_shorts', 'custentity_cmt_discount_morning_coat', 'custentity_cmt_discount_shirt_jacket', 'custentity_cmt_discount_camp_shirt', 'custentity_cmt_discount_safari_jacket'
        ]);
}

function getPrice(item, pricelevel, currency, customerpricelevel) {
    var filters = [],
        returnObj = {};
    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', item));
    filters.push(new nlobjSearchFilter('currency', 'pricing', 'anyof', currency));
    filters.push(new nlobjSearchFilter('pricelevel', 'pricing', 'anyof', pricelevel));
    var results = nlapiSearchRecord('item', 'customsearch_pricelevelprice', filters);
    if (results) {
        returnObj = {
            'price': results[0].getValue('unitprice', 'pricing')
        };
    } else {
        returnObj = {
            'price': 0
        };
    }
    var vendorname = nlapiLookupField('item', item, 'vendorname');
    if (vendorname == 'Jerome Clothiers' || vendorname == 'Jerome Clothiers Cut Length') {
        returnObj.pricenotset = 'F';
    } else {
        if (customerpricelevel) {
            var filters = [];
            filters.push(new nlobjSearchFilter('internalid', null, 'anyof', item));
            filters.push(new nlobjSearchFilter('currency', 'pricing', 'anyof', currency));
            filters.push(new nlobjSearchFilter('pricelevel', 'pricing', 'anyof', customerpricelevel));
            var results = nlapiSearchRecord('item', 'customsearch_pricelevelprice', filters);
            if (results) {
                returnObj.pricenotset = 'F';
            } else {
                returnObj.pricenotset = 'T';
            }
        }
    }
    return returnObj;
}

function updatePayment(payment_record, data) {
    'use strict';

    var invoices = data.invoices,
        credits = data.credits,
        deposits = data.deposits;
    // , credit_card = data.paymentmethods && data.paymentmethods[0] && data.paymentmethods[0].creditcard;

    // invoices
    for (var i = 1; i <= payment_record.getLineItemCount('apply'); i++) {
        var invoice = _.findWhere(invoices, {
            internalid: payment_record.getLineItemValue('apply', 'internalid', i)
        });

        if (invoice && invoice.apply) {
            payment_record.setLineItemValue('apply', 'apply', i, 'T');
            payment_record.setLineItemValue('apply', 'amount', i, invoice.amount);

            invoice.due = payment_record.getLineItemValue('apply', 'due', i);
            invoice.total = payment_record.getLineItemValue('apply', 'total', i);
            invoice.discdate = payment_record.getLineItemValue('apply', 'discdate', i);
            invoice.discamt = payment_record.getLineItemValue('apply', 'discamt', i);
            invoice.discountapplies = (invoice.due === invoice.total) && (invoice.discdate && stringtodate(invoice.discdate) >= new Date());
            invoice.duewithdiscount = BigNumber(invoice.due).minus(invoice.discountapplies ? invoice.discamt : 0).toNumber();

            if (isPayFull(invoice) && invoice.discountapplies && invoice.discamt) {
                payment_record.setLineItemValue('apply', 'disc', i, invoice.discamt);
            }
        }
    }

    // deposits

    for (i = 1; i <= payment_record.getLineItemCount('deposit'); i++) {
        var deposit = _.findWhere(deposits, {
            internalid: payment_record.getLineItemValue('deposit', 'doc', i)
        });

        if (deposit && deposit.apply) {
            payment_record.setLineItemValue('deposit', 'apply', i, 'T');
            payment_record.setLineItemValue('deposit', 'amount', i, deposit.amount);
        }
    }

    // credits

    for (i = 1; i <= payment_record.getLineItemCount('credit'); i++) {
        var credit = _.findWhere(credits, {
            internalid: payment_record.getLineItemValue('credit', 'internalid', i)
        });

        if (credit && credit.apply) {
            payment_record.setLineItemValue('credit', 'apply', i, 'T');
            payment_record.setLineItemValue('credit', 'amount', i, credit.amount);
        }
    }

    if (payment_record.getFieldValue('currency') == '2') { //USD
        payment_record.setFieldValue('paymentmethod', 9);
        payment_record.setFieldValue('undepfunds', 'F');
        payment_record.setFieldValue('account', '856');
    } else if (payment_record.getFieldValue('currency') == '2') { //AUD
        payment_record.setFieldValue('paymentmethod', 7);
        payment_record.setFieldValue('undepfunds', 'F');
        payment_record.setFieldValue('account', '854');

    } else if (payment_record.getFieldValue('currency') == '4') { //EURO
        payment_record.setFieldValue('paymentmethod', 10);
        payment_record.setFieldValue('undepfunds', 'F');
        payment_record.setFieldValue('account', '857');
    } else if (payment_record.getFieldValue('currency') == '4') { //GBP
        payment_record.setFieldValue('paymentmethod', 8);
        payment_record.setFieldValue('undepfunds', 'F');
        payment_record.setFieldValue('account', '855');
    }
    payment_record.setFieldValue('ccapproved', 'T');
    payment_record.setFieldValue('payment', data.payment);


    return payment_record;
}

function isPayFull(invoice) {
    'use strict';

    if (invoice.discountapplies) {
        return invoice.amount === invoice.duewithdiscount;
    } else {
        return invoice.amount === invoice.due;
    }
}

function createPayment(user, data) {
    'use strict';
    var customer_payment = nlapiCreateRecord('customerpayment', {
        recordmode: 'dynamic',
        entity: user
    });

    //customer_payment.setFieldValue('customer', user);
    customer_payment.setFieldValue('autoapply', 'F');
    //customer_payment.setFieldValue('payment', data.payment);
    //var id = nlapiSubmitRecord(customer_payment);

    return customer_payment //nlapiLoadRecord('customerpayment',id);
}

function getStockList() {
    var search = nlapiSearchRecord('vendor', 'customsearch_vendor_stock_list');
    var returnObj = [];
    if (search && search.length > 0) {
        for (var i = 0; i < search.length; i++) {
            returnObj.push({
                vendor: search[i].getValue('entityid'),
                stocklink: search[i].getValue("custentitycustentity_jerome_vendor_link"),
                file: search[i].getValue('custentity_vendor_link_file'),
                text: search[i].getText('custentity_vendor_link_file')
            })
        }

    }
    return returnObj;
}

function createProductList(parent, data) {

    var productList = nlapiCreateRecord('customrecord_ns_pl_productlist');

    data.templateid && productList.setFieldValue('custrecord_ns_pl_pl_templateid', data.templateid);
    data.scope && data.scope.id && productList.setFieldValue('custrecord_ns_pl_pl_scope', data.scope.id);
    data.type && data.type.id && productList.setFieldValue('custrecord_ns_pl_pl_type', data.type.id);
    data.name && productList.setFieldValue('name', sanitize(data.name));
    data.description && productList.setFieldValue('custrecord_ns_pl_pl_description', sanitize(data.description));

    productList.setFieldValue('custrecord_ns_pl_pl_owner', parent);

    return nlapiSubmitRecord(productList);
}

function sanitize(text) {
    'use strict';

    return text ? text.replace(/<br>/g, '\n').replace(/</g, '&lt;').replace(/\>/g, '&gt;') : '';
}

function getParent(user) {
    var id = nlapiLookupField('customer', user, 'parent');
    if (id) {
        var name = nlapiLoadRecord('customer', id).getFieldValue('entityid')
        return [id, name]
    }
    return "";

}

function getChildren(user) {
    var id = nlapiLookupField('customer', user, 'parent');
    var search = nlapiSearchRecord('customer', null, [new nlobjSearchFilter('internalid', 'parentcustomer', 'anyof', id)]);
    var entity = [];
    entity.push(id);
    if (search && search.length > 0) {
        for (var i = 0; i < search.length; i++) {
            entity.push(search[i].getId())
        }
    }
    return entity;
}

function getOrdersV2(request) {
    var id = request.getParameter('id'),
        page = request.getParameter('page') ? request.getParameter('page') : 1,
        clientName = request.getParameter('clientname') ? request.getParameter('clientname') : '',
        soid = request.getParameter('soid') ? request.getParameter('soid') : '',
        sort = request.getParameter('sort') == 'true' ? true : false,
        clientId = request.getParameter('clientid') ? request.getParameter('clientid') : null,
        user = request.getParameter('user'),
        startdate = request.getParameter('startdate') == 'null' ? '' : request.getParameter('startdate'),
        enddate = request.getParameter('enddate') == 'null' ? '' : request.getParameter('enddate'),
        cmtstatus = request.getParameter('cmtstatus') == 'null' ? '' : request.getParameter('cmtstatus'),
        subtailor = request.getParameter('subtailor') ? request.getParameter('subtailor').split(','): "",
        cmtdate = request.getParameter('cmtdate') == 'null' ? '' : request.getParameter('cmtdate');
    var total_field = 'custbody_total_tailor_price',
        filters = [
            //new nlobjSearchFilter('custcol_itm_category_url', null, 'isnotempty')
            new nlobjSearchFilter('custitem_jerome_cmt_serviceitem', 'item', 'is', 'F'), new nlobjSearchFilter('isspecialorderitem', 'item', 'is', 'T')
        ],
        columns = [
            new nlobjSearchColumn('internalid').setSort(true), new nlobjSearchColumn('trackingnumbers'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('status'), new nlobjSearchColumn(total_field), new nlobjSearchColumn('custbody_customer_name')
        ];
    if (user && user != "") {
        filters.push(new nlobjSearchFilter('entity', null, 'is', user));
    }
    if ((startdate) && !enddate) {
        nlapiLogExecution('debug', '1');
        var startdateFilter = new nlobjSearchFilter('trandate', null, 'onorafter', startdate)
        filters.push(startdateFilter);
    } else if (!startdate && enddate) {
        nlapiLogExecution('debug', '2');
        var enddateFilter = new nlobjSearchFilter('trandate', null, 'onorbefore', enddate)
        filters.push(enddateFilter);
    } else if (startdate && enddate) {
        nlapiLogExecution('debug', '3');
        var enddateFilter = new nlobjSearchFilter('trandate', null, 'within', [startdate, enddate])
        filters.push(enddateFilter);
    }
    if (cmtstatus) {
        nlapiLogExecution('debug', '4');
        var cmtstatusFilter = new nlobjSearchFilter('custcol_avt_cmt_status', null, 'anyof', JSON.parse(cmtstatus));
        filters.push(cmtstatusFilter);
    }
    if (cmtdate) {
        nlapiLogExecution('debug', '6');
        var cmtdateFilter = new nlobjSearchFilter('custcol_avt_cmt_date_sent', null, 'on', cmtdate);
        filters.push(cmtdateFilter);
    }
    if (subtailor) {
        nlapiLogExecution('debug', '5');
        var subtailorFilter = new nlobjSearchFilter('custbody_so_created_by', null, 'anyof', subtailor)
        filters.push(subtailorFilter);
    }
    columns.push(new nlobjSearchColumn('custcol_expected_production_date'))
    columns.push(new nlobjSearchColumn('custcol_tailor_delivery_days'))
    columns.push(new nlobjSearchColumn('custcol_so_id'))
    columns.push(new nlobjSearchColumn('item'))
    columns.push(new nlobjSearchColumn('custcol_avt_date_needed')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_fabric_status')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_date_sent'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_status')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_date_sent')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_fabric_text'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_status_text'))
    columns.push(new nlobjSearchColumn('custcol_cmt_production_time'))
    columns.push(new nlobjSearchColumn('custcol_avt_tracking'))
    columns.push(new nlobjSearchColumn('custcol_avt_solinestatus'))
    columns.push(new nlobjSearchColumn('custcol_avt_saleorder_line_key'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_tracking'))
    columns.push(new nlobjSearchColumn('custcol_fabric_delivery_days'))
    columns.push(new nlobjSearchColumn('custcol_flag'))
    columns.push(new nlobjSearchColumn('custcol_flag_comment'))
    columns.push(new nlobjSearchColumn('custcol_custom_fabric_details'))
    columns.push(new nlobjSearchColumn('custcol_producttype'))
    columns.push(new nlobjSearchColumn('custcol_tailor_client'))
    columns.push(new nlobjSearchColumn('currency'))
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
    if (sort && sort == 'true') {
        filters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F', 'SalesOrd:B']));
    }
    if (clientId) {
        filters.push(new nlobjSearchFilter('custcol_tailor_client', null, 'is', clientId));
    }
    if (soid) {
        filters.push(new nlobjSearchFilter('custcol_so_id', null, 'startswith', soid));
    }
    if (clientName) {
        filters.push(new nlobjSearchFilter('custcol_tailor_client_name', null, 'contains', clientName));
    }
    var result = getAllSalesOrderPaginatedSearchResults({
        record_type: 'salesorder',
        filters: filters,
        columns: columns,
        page: page
    });

    result.records = _.map(result.records || [], function(record) {
        var dateneeded = record.getValue('custcol_avt_date_needed'); //this
        var expdeliverydate = record.getValue('custcol_expected_delivery_date');
        var fabricstatus = record.getValue('custcol_avt_fabric_status');
        var cmtstatus = record.getValue('custcol_avt_cmt_status');
        var datesent = record.getValue('custcol_avt_cmt_date_sent');
        var custcol_flag_comment = record.getValue('custcol_flag_comment');
        var custcol_flag = record.getValue('custcol_flag');
        var custcol_expected_production_date = record.getValue('custcol_expected_production_date'); //this
        var cmtstatuscheck = false,
            fabstatuscheck = false,
            expFabDateNeeded, dateNeeded, confirmedDate;
        var custcol_tailor_delivery_days = record.getValue('custcol_tailor_delivery_days');
        var today = new Date();
        var cmtstatustext = "";
        var customitemtext = record.getText('item');
        var custcol_custom_fabric_details = record.getValue('custcol_custom_fabric_details');
        if (record.getValue('item') == '28034' ||
            record.getValue('item') == '28035' ||
            record.getValue('item') == '28030' ||
            record.getValue('item') == '28033' ||
            record.getValue('item') == '28036' ||
            record.getValue('item') == '28031' ||
            record.getValue('item') == '28032' ||
            record.getValue('item') == '253776') {
            if (custcol_custom_fabric_details)
                var custcol_custom_fabric_details_json = JSON.parse(custcol_custom_fabric_details);
            if (custcol_custom_fabric_details_json)
                customitemtext = customitemtext.replace('CMT Item', custcol_custom_fabric_details_json.collection + '-' + custcol_custom_fabric_details_json.code);

        }
        if (record.getValue('custcol_producttype')) {
            customitemtext += '-' + record.getValue('custcol_producttype');
        }
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        if (cmtstatus) {
            cmtstatustext += record.getText('custcol_avt_cmt_status');
        }
        var morethan10days = false,
            clearstatus = false;
        if (datesent) {
            if (cmtstatustext != "") cmtstatustext += '-';
            var cDate = nlapiStringToDate(datesent);
            cDate.setDate(cDate.getDate());
            datesent = nlapiDateToString(cDate);
            cmtstatustext += datesent;

            if ((today - cDate) > 863999146) {
                morethan10days = true;
            }
        } else if (custcol_expected_production_date) {
            if (cmtstatustext != "") cmtstatustext += '-';
            cmtstatustext += custcol_expected_production_date;
            var cmtstatdate = nlapiStringToDate(custcol_expected_production_date);
            if ((today - cmtstatdate) > 863999146) {
                morethan10days = true;
            }
        }
        if (record.getValue('custcol_avt_cmt_tracking')) {
            if (cmtstatustext != "") cmtstatustext += '-';
            cmtstatustext += record.getValue('custcol_avt_cmt_tracking');
        }
        if ((record.getText('status') == 'Cancelled' || record.getText('status') == 'Closed') ||
            ((record.getText('custcol_avt_cmt_status') == 'Delivered' ||
                record.getText('custcol_avt_cmt_status') == 'Left factory') && morethan10days)) {
            clearstatus = true;
        }
        if ((cmtstatus == 7 || cmtstatus == 8) && fabricstatus != 1) {
            //check the dates of the fabric should be sent vs today
            if (custcol_expected_production_date) {
                expFabDateNeeded = nlapiStringToDate(custcol_expected_production_date);
                expFabDateNeeded.setDate(expFabDateNeeded.getDate() - parseFloat(record.getValue('custcol_cmt_production_time')))
                if (expFabDateNeeded < today)
                    fabstatuscheck = true;
                else
                    fabstatuscheck = false;
            } else {
                fabstatuscheck = false;
            }
        } else if (fabricstatus == 1) {
            fabstatuscheck = true;
        } else {
            fabstatuscheck = false;
        }
        if (cmtstatus == 4) {
            cmtstatuscheck = true;
        } else if (dateneeded) {
            dateNeeded = nlapiStringToDate(dateneeded)
            if (datesent) {
                confirmedDate = nlapiStringToDate(datesent);
                confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
            } else if (custcol_expected_production_date) {
                confirmedDate = nlapiStringToDate(custcol_expected_production_date);
                confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
            }

            if (confirmedDate) {
                if (confirmedDate > dateNeeded) {
                    cmtstatuscheck = true;
                } else
                    cmtstatuscheck = false;
            } else {
                cmtstatuscheck = false
            }

        } else {
            cmtstatuscheck = false;
        }
        var newdateneeded = "";
        if (record.getValue('custcol_avt_date_needed')) {
            var dneeded = nlapiStringToDate(record.getValue('custcol_avt_date_needed'));
            dateneeded = dneeded.getFullYear() + '-' + ('0' + (dneeded.getMonth() + 1)).slice(-2) + '-' +
                ('0' + dneeded.getDate()).slice(-2);
            newdateneeded = ('0' + dneeded.getDate()).slice(-2) + '/' + ('0' + (dneeded.getMonth() + 1)).slice(-2) + '/' + dneeded.getFullYear();
        }
        var status = true;

        return {
            internalid: new Date().getTime() + Math.floor(Math.random() * 999999999999999999) + '_' + record.getValue('internalid'),
            date: record.getValue('trandate'),
            trandate: record.getValue('trandate'),
            order_number: record.getValue('tranid'),
            tranid: record.getValue('tranid'),
            status: record.getText('status'),
            clearstatus: clearstatus,
            summary: {
                total: toCurrency(record.getValue(total_field)),
                total_formatted: formatCurrency(record.getValue(total_field))
            },
            amount: toCurrency(record.getValue(total_field)),
            amount_formatted: formatCurrency(record.getValue(total_field)),
            status: record.getText('status')

                ,
            customer_name: record.getValue('custbody_customer_name'),
            currency: {
                internalid: record.getValue('currency'),
                name: record.getText('currency')
            },
            trackingnumbers: record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null,
            type: record.getRecordType(),
            recordtype: record.getRecordType(),
            client_name: record.getValue('custbody_customer_name'),
            so_id: record.getValue('custcol_so_id'),
            item: customitemtext,
            date_needed: newdateneeded,
            dateneeded: dateneeded,
            fabric_status: record.getValue('custcol_avt_fabric_text'),
            cmt_status: cmtstatustext,
            flag: custcol_flag,
            custcol_flag: custcol_flag,
            custcol_flag_comment: custcol_flag_comment,
            custcol_avt_date_needed: dateneeded,
            tranline_status: cmtstatuscheck || fabstatuscheck,
            fabricstatus: record.getValue('custcol_avt_fabric_text'),
            cmtstatus: cmtstatustext,
            solinekey: record.getValue('custcol_avt_saleorder_line_key'),
            expdeliverydate: expdeliverydate,
            datesent: datesent,
            custcol_expected_production_date: custcol_expected_production_date,
            custcol_tailor_delivery_days: custcol_tailor_delivery_days,
            customitemtext: customitemtext,
            custcol_custom_fabric_details: custcol_custom_fabric_details,
            dateNeeded: dateNeeded,
            internalid1: record.getValue('internalid'),
            tailor_client: record.getValue('custcol_tailor_client')
        };
    });
    var results_per_page = 20;

    if (sort == true) {

        result.records.sort(function(a, b) {
            return (a.tranline_status === b.tranline_status) ? 0 : a.tranline_status ? -1 : 1;
        });
        result.records.sort(function(a, b) {
            return (a.clearstatus === b.clearstatus) ? 0 : a.clearstatus ? 1 : -1;
        })
        result.records.sort(function(a, b) {
            return (a.custcol_flag === b.custcol_flag) ? 0 : a.custcol_flag == 'F' ? 1 : -1
        });
    }
    if (page != 'all') {
        var range_start = (page * results_per_page) - results_per_page,
            range_end = page * results_per_page;
        if (page != -1) {
            result.records = result.records.slice(range_start, range_end);
        }
    }
    return result;
}

function getOrders(request) {
    var id = request.getParameter('id'),
        page = request.getParameter('page') ? request.getParameter('page') : 1,
        clientName = request.getParameter('clientname') ? request.getParameter('clientname') : '',
        soid = request.getParameter('soid') ? request.getParameter('soid') : '',
        sort = request.getParameter('sort') == 'true' ? true : false,
        clientId = request.getParameter('clientid') ? request.getParameter('clientid') : null,
        user = request.getParameter('user');
    startdate = request.getParameter('startdate') == 'null' ? '' : request.getParameter('startdate'),
        enddate = request.getParameter('enddate') == 'null' ? '' : request.getParameter('enddate'),
        cmtstatus = request.getParameter('cmtstatus') == 'null' ? '' : request.getParameter('cmtstatus'),
        subtailor = request.getParameter('subtailor') ? request.getParameter('subtailor').split(',') : "",
        cmtdate = request.getParameter('cmtdate') == 'null' ? '' : request.getParameter('cmtdate');
    nlapiLogExecution('debug','PARAMETERS', request.getParameter('clientid'));
    var total_field = 'custbody_total_tailor_price',
        filters = [
            //new nlobjSearchFilter('custcol_itm_category_url', null, 'isnotempty')
            new nlobjSearchFilter('custitem_jerome_cmt_serviceitem', 'item', 'is', 'F'), new nlobjSearchFilter('isspecialorderitem', 'item', 'is', 'T')
        ],
        columns = [
            new nlobjSearchColumn('internalid').setSort(true), new nlobjSearchColumn('trackingnumbers'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('status'), new nlobjSearchColumn(total_field), new nlobjSearchColumn('custbody_customer_name')
        ];
    if (user && user != "") {
        filters.push(new nlobjSearchFilter('entity', null, 'is', user));
    }
    columns.push(new nlobjSearchColumn('custcol_expected_production_date'))
    columns.push(new nlobjSearchColumn('custcol_tailor_delivery_days'))
    columns.push(new nlobjSearchColumn('custcol_so_id'))
    columns.push(new nlobjSearchColumn('item'))
    columns.push(new nlobjSearchColumn('custcol_avt_date_needed')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_fabric_status')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_date_sent'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_status')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_date_sent')) //This
    columns.push(new nlobjSearchColumn('custcol_avt_fabric_text'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_status_text'))
    columns.push(new nlobjSearchColumn('custcol_cmt_production_time'))
    columns.push(new nlobjSearchColumn('custcol_avt_tracking'))
    columns.push(new nlobjSearchColumn('custcol_avt_solinestatus'))
    columns.push(new nlobjSearchColumn('custcol_avt_saleorder_line_key'))
    columns.push(new nlobjSearchColumn('custcol_avt_cmt_tracking'))
    columns.push(new nlobjSearchColumn('custcol_fabric_delivery_days'))
    columns.push(new nlobjSearchColumn('custcol_flag'))
    columns.push(new nlobjSearchColumn('custcol_flag_comment'))
    columns.push(new nlobjSearchColumn('custcol_custom_fabric_details'))
    columns.push(new nlobjSearchColumn('custcol_producttype'))
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
    if (sort && sort == 'true') {
        filters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:D', 'SalesOrd:E', 'SalesOrd:F', 'SalesOrd:B']));
    }
    if (clientId) {
        filters.push(new nlobjSearchFilter('custcol_tailor_client', null, 'is', clientId));
    }
    if (soid) {
        filters.push(new nlobjSearchFilter('custcol_so_id', null, 'startswith', soid));
    }
    if (clientName) {
        filters.push(new nlobjSearchFilter('custcol_tailor_client_name', null, 'contains', clientName));
    }
    if ((startdate) && !enddate) {
        //nlapiLogExecution('debug','1');
        var startdateFilter = new nlobjSearchFilter('trandate', null, 'onorafter', startdate)
        filters.push(startdateFilter);
    } else if (!startdate && enddate) {
        //nlapiLogExecution('debug','2');
        var enddateFilter = new nlobjSearchFilter('trandate', null, 'onorbefore', enddate)
        filters.push(enddateFilter);
    } else if (startdate && enddate) {
        //nlapiLogExecution('debug','3');
        var enddateFilter = new nlobjSearchFilter('trandate', null, 'within', [startdate, enddate])
        filters.push(enddateFilter);
    }
    if (cmtstatus) {
        //nlapiLogExecution('debug','4');
        var cmtstatusFilter = new nlobjSearchFilter('custcol_avt_cmt_status', null, 'anyof', JSON.parse(cmtstatus));
        filters.push(cmtstatusFilter);
    }
    if (cmtdate) {
        //nlapiLogExecution('debug','6');
        var cmtdateFilter = new nlobjSearchFilter('custcol_avt_cmt_date_sent', null, 'on', cmtdate);
        filters.push(cmtdateFilter);
    }
    if (subtailor) {
        //nlapiLogExecution('debug','5');
        var subtailorFilter = new nlobjSearchFilter('custbody_so_created_by', null, 'anyof', subtailor)
        filters.push(subtailorFilter);
    }
    var result = getAllSalesOrderPaginatedSearchResults({
        record_type: 'salesorder',
        filters: filters,
        columns: columns,
        page: page
    });
    //nlapiLogExecution('debug','results',result.records.length);
    result.records = _.map(result.records || [], function(record) {
        var dateneeded = record.getValue('custcol_avt_date_needed'); //this
        var expdeliverydate = record.getValue('custcol_expected_delivery_date');
        var fabricstatus = record.getValue('custcol_avt_fabric_status');
        var cmtstatus = record.getValue('custcol_avt_cmt_status');
        var datesent = record.getValue('custcol_avt_cmt_date_sent');
        var custcol_flag_comment = record.getValue('custcol_flag_comment');
        var custcol_flag = record.getValue('custcol_flag');
        var custcol_expected_production_date = record.getValue('custcol_expected_production_date'); //this
        var cmtstatuscheck = false,
            fabstatuscheck = false,
            expFabDateNeeded, dateNeeded, confirmedDate;
        var custcol_tailor_delivery_days = record.getValue('custcol_tailor_delivery_days');
        var today = new Date();
        var cmtstatustext = "";
        var customitemtext = record.getText('item');
        var custcol_custom_fabric_details = record.getValue('custcol_custom_fabric_details');
        if (record.getValue('item') == '28034' ||
            record.getValue('item') == '28035' ||
            record.getValue('item') == '28030' ||
            record.getValue('item') == '28033' ||
            record.getValue('item') == '28036' ||
            record.getValue('item') == '28031' ||
            record.getValue('item') == '28032' ||
            record.getValue('item') == '253776') {
            if (custcol_custom_fabric_details)
                var custcol_custom_fabric_details_json = JSON.parse(custcol_custom_fabric_details);
            if (custcol_custom_fabric_details_json)
                customitemtext = customitemtext.replace('CMT Item', custcol_custom_fabric_details_json.collection + '-' + custcol_custom_fabric_details_json.code);

        }
        if (record.getValue('custcol_producttype')) {
            customitemtext += '-' + record.getValue('custcol_producttype');
        }
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        if (cmtstatus) {
            cmtstatustext += record.getText('custcol_avt_cmt_status');
        }
        var morethan10days = false,
            clearstatus = false;
        if (datesent) {
            if (cmtstatustext != "") cmtstatustext += '-';
            var cDate = nlapiStringToDate(datesent);
            cDate.setDate(cDate.getDate());
            datesent = nlapiDateToString(cDate);
            cmtstatustext += datesent;

            if ((today - cDate) > 863999146) {
                morethan10days = true;
            }
        } else if (custcol_expected_production_date) {
            if (cmtstatustext != "") cmtstatustext += '-';
            cmtstatustext += custcol_expected_production_date;
            var cmtstatdate = nlapiStringToDate(custcol_expected_production_date);
            if ((today - cmtstatdate) > 863999146) {
                morethan10days = true;
            }
        }
        if (record.getValue('custcol_avt_cmt_tracking')) {
            if (cmtstatustext != "") cmtstatustext += '-';
            cmtstatustext += record.getValue('custcol_avt_cmt_tracking');
        }
        if ((record.getText('status') == 'Cancelled' || record.getText('status') == 'Closed') ||
            ((record.getText('custcol_avt_cmt_status') == 'Delivered' ||
                record.getText('custcol_avt_cmt_status') == 'Left factory') && morethan10days)) {
            clearstatus = true;
        }
        if ((cmtstatus == 7 || cmtstatus == 8) && fabricstatus != 1) {
            //check the dates of the fabric should be sent vs today
            if (custcol_expected_production_date) {
                expFabDateNeeded = nlapiStringToDate(custcol_expected_production_date);
                expFabDateNeeded.setDate(expFabDateNeeded.getDate() - parseFloat(record.getValue('custcol_cmt_production_time')))
                if (expFabDateNeeded < today)
                    fabstatuscheck = true;
                else
                    fabstatuscheck = false;
            } else {
                fabstatuscheck = false;
            }
        } else if (fabricstatus == 1) {
            fabstatuscheck = true;
        } else {
            fabstatuscheck = false;
        }
        if (cmtstatus == 4) {
            cmtstatuscheck = true;
        } else if (dateneeded) {
            dateNeeded = nlapiStringToDate(dateneeded)
            if (datesent) {
                confirmedDate = nlapiStringToDate(datesent);
                confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
            } else if (custcol_expected_production_date) {
                confirmedDate = nlapiStringToDate(custcol_expected_production_date);
                confirmedDate.setDate(confirmedDate.getDate() + parseFloat(custcol_tailor_delivery_days ? custcol_tailor_delivery_days : 0));
            }

            if (confirmedDate) {
                if (confirmedDate > dateNeeded) {
                    cmtstatuscheck = true;
                } else
                    cmtstatuscheck = false;
            } else {
                cmtstatuscheck = false
            }

        } else {
            cmtstatuscheck = false;
        }
        var newdateneeded = "";
        if (record.getValue('custcol_avt_date_needed')) {
            var dneeded = nlapiStringToDate(record.getValue('custcol_avt_date_needed'));
            dateneeded = dneeded.getFullYear() + '-' + ('0' + (dneeded.getMonth() + 1)).slice(-2) + '-' +
                ('0' + dneeded.getDate()).slice(-2);
            newdateneeded = dneeded.getFullYear() + '/' + ('0' + (dneeded.getMonth() + 1)).slice(-2) + '/' +
                ('0' + dneeded.getDate()).slice(-2);
        }
        var status = true;

        return {
            internalid: new Date().getTime() + Math.floor(Math.random() * 999999999999999999) + '_' + record.getValue('internalid'),
            date: record.getValue('trandate'),
            trandate: record.getValue('trandate'),
            order_number: record.getValue('tranid'),
            tranid: record.getValue('tranid'),
            status: record.getText('status'),
            clearstatus: clearstatus,
            summary: {
                total: toCurrency(record.getValue(total_field)),
                total_formatted: formatCurrency(record.getValue(total_field))
            },
            status: {
                internalid: record.getValue('status'),
                name: record.getText('status')
            },
            customer_name: record.getValue('custbody_customer_name'),
            currency: {
                internalid: record.getValue('currency'),
                name: record.getText('currency')
            },
            trackingnumbers: record.getValue('trackingnumbers') ? record.getValue('trackingnumbers').split('<BR>') : null,
            type: record.getRecordType(),
            recordtype: record.getRecordType(),
            client_name: record.getValue('custbody_customer_name'),
            so_id: record.getValue('custcol_so_id'),
            item: customitemtext,
            dateneeded: newdateneeded,
            fabric_status: record.getValue('custcol_avt_fabric_text'),
            cmt_status: cmtstatustext,
            flag: custcol_flag,
            custcol_flag: custcol_flag,
            custcol_flag_comment: custcol_flag_comment,
            custcol_avt_date_needed: dateneeded,
            tranline_status: cmtstatuscheck || fabstatuscheck,
            fabricstatus: record.getValue('custcol_avt_fabric_text'),
            cmtstatus: cmtstatustext,
            solinekey: record.getValue('custcol_avt_saleorder_line_key')
        };
    });
    var results_per_page = 20;

    if (sort == true) {

        result.records.sort(function(a, b) {
            return (a.tranline_status === b.tranline_status) ? 0 : a.tranline_status ? -1 : 1;
        });
        result.records.sort(function(a, b) {
            return (a.clearstatus === b.clearstatus) ? 0 : a.clearstatus ? 1 : -1;
        })
        result.records.sort(function(a, b) {
            return (a.custcol_flag === b.custcol_flag) ? 0 : a.custcol_flag == 'F' ? 1 : -1
        });
    }
    if (page != 'all') {
        var range_start = (page * results_per_page) - results_per_page,
            range_end = page * results_per_page;
        result.records = result.records.slice(range_start, range_end);
    }
    return result;
}

function getAllSalesOrderPaginatedSearchResults(options) {
    options = options || {};

    var results_per_page = options.results_per_page || 20,
        page = options.page || 1,
        columns = options.columns || [],
        filters = options.filters || [],
        record_type = options.record_type
        //,	range_start = (page * results_per_page) - results_per_page
        //,	range_end = page * results_per_page
        ,
        result = {
            page: page,
            recordsPerPage: results_per_page,
            records: [],
            totalRecordsFound: 0
        };

    var search = nlapiCreateSearch(record_type, filters, columns).runSearch();
    var searchindex = 0;

    var searchresults = search.getResults(searchindex, searchindex + 500);
    result.records = result.records.concat(searchresults);
    result.totalRecordsFound += searchresults.length; //search.getResults(0, 1000).length;
    searchindex += 500;

    return result;
}

function getOrder(id, user) {
    //nlapiLogExecution('debug','getOrder',user + " " + id);
    var placed_order = nlapiLoadRecord('salesorder', id),
        result = createResult(placed_order);

    setAddresses(placed_order, result);
    setShippingMethods(placed_order, result);
    setLines(placed_order, result, user);
    setFulfillments(result);
    setPaymentMethod(placed_order, result);
    setReceipts(result, placed_order, user);
    setReturnAuthorizations(result, placed_order, user);
    setCases(result, placed_order, user);
    result.promocode = (placed_order.getFieldValue('promocode')) ? {
        internalid: placed_order.getFieldValue('promocode'),
        name: placed_order.getFieldText('promocode'),
        code: placed_order.getFieldText('couponcode')
    } : null;

    // convert the obejcts to arrays
    result.addresses = _.values(result.addresses);
    result.shipmethods = _.values(result.shipmethods);
    result.lines = _.values(result.lines);
    result.fulfillments = _.values(result.fulfillments);
    result.receipts = _.values(result.receipts);
    result.cases = _.values(result.cases);
    //nlapiLogExecution('debug','getOrder done', JSON.stringify(result));
    return result;

}

function getOrderV2(id, user) {
    var placed_order = nlapiLoadRecord('salesorder', id),
        result = createResultV2(placed_order);

    setAddresses(placed_order, result);
    setShippingMethods(placed_order, result);
    setLinesV2(placed_order, result, user);
    setFulfillments(result);
    setPaymentMethod(placed_order, result);
    setReceipts(result, placed_order, user);
    setReturnAuthorizations(result, placed_order, user);

    result.promocode = (placed_order.getFieldValue('promocode')) ? {
        internalid: placed_order.getFieldValue('promocode'),
        name: placed_order.getFieldText('promocode'),
        code: placed_order.getFieldText('couponcode')
    } : [];

    // convert the obejcts to arrays
    result.addresses = _.values(result.addresses);
    result.shipmethods = _.values(result.shipmethods);
    result.lines = _.values(result.lines);
    result.fulfillments = _.values(result.fulfillments);
    result.receipts = _.values(result.receipts);

    return result;

}

function toCurrency(amount) {
    'use strict';

    var r = parseFloat(amount);

    return isNaN(r) ? 0 : r;
}

function formatCurrency(value, symbol) {
    'use strict';
    var value_float = parseFloat(value);

    if (isNaN(value_float)) {
        value_float = parseFloat(0); //return value;
    }

    var negative = value_float < 0;
    value_float = Math.abs(value_float);
    value_float = parseInt((value_float + 0.005) * 100, 10) / 100;

    var value_string = value_float.toString()

        ,
        groupseparator = ',',
        decimalseparator = '.',
        negativeprefix = '(',
        negativesuffix = ')';

    value_string = value_string.replace('.', decimalseparator);
    var decimal_position = value_string.indexOf(decimalseparator);

    // if the string doesn't contains a .
    if (!~decimal_position) {
        value_string += decimalseparator + '00';
        decimal_position = value_string.indexOf(decimalseparator);
    }
    // if it only contains one number after the .
    else if (value_string.indexOf(decimalseparator) === (value_string.length - 2)) {
        value_string += '0';
    }

    var thousand_string = '';
    for (var i = value_string.length - 1; i >= 0; i--) {
        //If the distance to the left of the decimal separator is a multiple of 3 you need to add the group separator
        thousand_string = (i > 0 && i < decimal_position && (((decimal_position - i) % 3) === 0) ? groupseparator : '') + value_string[i] + thousand_string;
    }

    if (!symbol) {
        symbol = '$';
    }

    value_string = symbol + thousand_string;

    return negative ? (negativeprefix + value_string + negativesuffix) : value_string;
}

function setAddresses(placed_order, result) {
    // TODO: normalize addresses, remove <br> and \r\n

    result.addresses = {};
    result.listAddresseByIdTmp = {};
    for (var i = 1; i <= placed_order.getLineItemCount('iladdrbook'); i++) {
        // Adds all the addresses in the address book
        result.listAddresseByIdTmp[placed_order.getLineItemValue('iladdrbook', 'iladdrinternalid', i)] = addAddress({
            internalid: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr', i),
            country: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcountry', i),
            state: placed_order.getLineItemValue('iladdrbook', 'iladdrshipstate', i),
            city: placed_order.getLineItemValue('iladdrbook', 'iladdrshipcity', i),
            zip: placed_order.getLineItemValue('iladdrbook', 'iladdrshipzip', i),
            addr1: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr1', i),
            addr2: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddr2', i),
            attention: placed_order.getLineItemValue('iladdrbook', 'iladdrshipattention', i),
            addressee: placed_order.getLineItemValue('iladdrbook', 'iladdrshipaddressee', i)
        }, result);
    }

    // Adds Bill Address
    result.billaddress = addAddress({
        internalid: placed_order.getFieldValue('billaddress'),
        country: placed_order.getFieldValue('billcountry'),
        state: placed_order.getFieldValue('billstate'),
        city: placed_order.getFieldValue('billcity'),
        zip: placed_order.getFieldValue('billzip'),
        addr1: placed_order.getFieldValue('billaddr1'),
        addr2: placed_order.getFieldValue('billaddr2'),
        attention: placed_order.getFieldValue('billattention'),
        addressee: placed_order.getFieldValue('billaddressee')
    }, result);

    // Adds Shipping Address
    result.shipaddress = (placed_order.getFieldValue('shipaddress')) ? addAddress({
        internalid: placed_order.getFieldValue('shipaddress'),
        country: placed_order.getFieldValue('shipcountry'),
        state: placed_order.getFieldValue('shipstate'),
        city: placed_order.getFieldValue('shipcity'),
        zip: placed_order.getFieldValue('shipzip'),
        addr1: placed_order.getFieldValue('shipaddr1'),
        addr2: placed_order.getFieldValue('shipaddr2'),
        attention: placed_order.getFieldValue('shipattention'),
        addressee: placed_order.getFieldValue('shipaddressee')
    }, result) : null;
}

function addAddress(address, result) {
    'use strict';
    result.addresses = result.addresses || {};

    address.fullname = (address.attention) ? address.attention : address.addressee;
    address.company = (address.attention) ? address.addressee : null;

    delete address.attention;
    delete address.addressee;

    address.internalid = (address.country || '') + '-' +
        (address.state || '') + '-' +
        (address.city || '') + '-' +
        (address.zip || '') + '-' +
        (address.addr1 || '') + '-' +
        (address.addr2 || '') + '-' +
        (address.fullname || '') + '-' +
        (address.company || '');

    address.internalid = address.internalid.replace(/\s/g, '-');

    if (!result.addresses[address.internalid]) {
        result.addresses[address.internalid] = address;
    }

    return address.internalid;
}

function setShippingMethods(placed_order, result) {
    result.shipmethods = {};

    if (placed_order.getLineItemCount('shipgroup') <= 0) {
        result.shipmethods[placed_order.getFieldValue('shipmethod')] = {
            internalid: placed_order.getFieldValue('shipmethod'),
            name: placed_order.getFieldText('shipmethod'),
            rate: toCurrency(placed_order.getFieldValue('shipping_rate')),
            rate_formatted: formatCurrency(placed_order.getFieldValue('shipping_rate')),
            shipcarrier: placed_order.getFieldValue('carrier')
        };
    }

    for (var i = 1; i <= placed_order.getLineItemCount('shipgroup'); i++) {
        result.shipmethods[placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i)] = {
            internalid: placed_order.getLineItemValue('shipgroup', 'shippingmethodref', i),
            name: placed_order.getLineItemValue('shipgroup', 'shippingmethod', i),
            rate: toCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i)),
            rate_formatted: formatCurrency(placed_order.getLineItemValue('shipgroup', 'shippingrate', i)),
            shipcarrier: placed_order.getLineItemValue('shipgroup', 'shippingcarrier', i)
        };
    }

    result.shipmethod = placed_order.getFieldValue('shipmethod');
}

function createResultV2(placed_order) {
    'use strict';
    var currency = [];
    currency['USD'] = '$';
    currency['AUD'] = '$';
    currency['GBP'] = '£';
    currency['EUR'] = '€';
    return {
        internalid: placed_order.getId(),
        recordtype: placed_order.getRecordType(),
        trantype: placed_order.getFieldValue('type'),
        tranid: placed_order.getFieldValue('tranid'),
        purchasenumber: placed_order.getFieldValue('otherrefnum'),
        dueDate: placed_order.getFieldValue('duedate'),
        amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox')),
        amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox')),
        memo: placed_order.getFieldValue('memo'),
        trandate: placed_order.getFieldValue('trandate'),
        createdfrom: {
            internalid: "",
            name: "",
            recordtype: ""
        },
        status: {
            internalid: placed_order.getFieldValue('statusRef'),
            name: placed_order.getFieldValue('status')
        },
        selected_currency: {
            internalid: placed_order.getFieldValue('currency'),
            symbol: currency[placed_order.getFieldValue('currencysymbol')],
            code: placed_order.getFieldValue('currencysymbol'),
            name: placed_order.getFieldValue('currencyname'),
            currencyname: placed_order.getFieldValue('currencyname'),
            isdefault: "T",
            symbolplacement: 1
        },
        isReturnable: isReturnable(placed_order),
        custbody_so_created_by: placed_order.getFieldText('custbody_so_created_by'),
        origin: 2,
        ismultishipto: false,
        paymentevent: {},
        isCancelable: false,
        options: {},
        summary: {
            subtotal: toCurrency(placed_order.getFieldValue('custbody_total_tailor_price')),
            subtotal_formatted: formatCurrency(placed_order.getFieldValue('custbody_total_tailor_price'))

                ,
            taxtotal: toCurrency(0) //toCurrency(placed_order.getFieldValue('taxtotal'))
                ,
            taxtotal_formatted: formatCurrency(0) //formatCurrency(placed_order.getFieldValue('taxtotal'))

                ,
            tax2total: toCurrency(0),
            tax2total_formatted: formatCurrency(0)

                ,
            shippingcost: toCurrency(placed_order.getFieldValue('shippingcost')),
            shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

                ,
            handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost')),
            handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

                ,
            estimatedshipping: 0,
            estimatedshipping_formatted: formatCurrency(0)

                ,
            taxonshipping: toCurrency(0),
            taxonshipping_formatted: formatCurrency(0)

                ,
            discounttotal: toCurrency(placed_order.getFieldValue('discounttotal')),
            discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

                ,
            taxondiscount: toCurrency(0),
            taxondiscount_formatted: formatCurrency(0)

                ,
            discountrate: toCurrency(0),
            discountrate_formatted: formatCurrency(0)

                ,
            discountedsubtotal: toCurrency(0),
            discountedsubtotal_formatted: formatCurrency(0)

                ,
            giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied')),
            giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

                ,
            total: toCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost'))),
            total_formatted: formatCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost')))
        }

        ,
        currency: {
            internalid: placed_order.getFieldValue('currency'),
            name: placed_order.getFieldValue('currencyname')
        }
    };
}

function createResult(placed_order) {
    'use strict';

    return {
        internalid: placed_order.getId(),
        type: placed_order.getRecordType(),
        trantype: placed_order.getFieldValue('type'),
        order_number: placed_order.getFieldValue('tranid'),
        purchasenumber: placed_order.getFieldValue('otherrefnum'),
        dueDate: placed_order.getFieldValue('duedate'),
        amountDue: toCurrency(placed_order.getFieldValue('amountremainingtotalbox')),
        amountDue_formatted: formatCurrency(placed_order.getFieldValue('amountremainingtotalbox')),
        memo: placed_order.getFieldValue('memo'),
        date: placed_order.getFieldValue('trandate'),
        status: placed_order.getFieldValue('status'),
        isReturnable: isReturnable(placed_order),
        createdby: placed_order.getFieldText('custbody_so_created_by'),
        summary: {
            subtotal: toCurrency(placed_order.getFieldValue('custbody_total_tailor_price')),
            subtotal_formatted: formatCurrency(placed_order.getFieldValue('custbody_total_tailor_price'))

                ,
            taxtotal: toCurrency(0) //toCurrency(placed_order.getFieldValue('taxtotal'))
                ,
            taxtotal_formatted: formatCurrency(0) //formatCurrency(placed_order.getFieldValue('taxtotal'))

                ,
            tax2total: toCurrency(0),
            tax2total_formatted: formatCurrency(0)

                ,
            shippingcost: toCurrency(placed_order.getFieldValue('shippingcost')),
            shippingcost_formatted: formatCurrency(placed_order.getFieldValue('shippingcost'))

                ,
            handlingcost: toCurrency(placed_order.getFieldValue('althandlingcost')),
            handlingcost_formatted: formatCurrency(placed_order.getFieldValue('althandlingcost'))

                ,
            estimatedshipping: 0,
            estimatedshipping_formatted: formatCurrency(0)

                ,
            taxonshipping: toCurrency(0),
            taxonshipping_formatted: formatCurrency(0)

                ,
            discounttotal: toCurrency(placed_order.getFieldValue('discounttotal')),
            discounttotal_formatted: formatCurrency(placed_order.getFieldValue('discounttotal'))

                ,
            taxondiscount: toCurrency(0),
            taxondiscount_formatted: formatCurrency(0)

                ,
            discountrate: toCurrency(0),
            discountrate_formatted: formatCurrency(0)

                ,
            discountedsubtotal: toCurrency(0),
            discountedsubtotal_formatted: formatCurrency(0)

                ,
            giftcertapplied: toCurrency(placed_order.getFieldValue('giftcertapplied')),
            giftcertapplied_formatted: formatCurrency(placed_order.getFieldValue('giftcertapplied'))

                ,
            total: toCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost'))),
            total_formatted: formatCurrency(parseFloat(placed_order.getFieldValue('custbody_total_tailor_price')) + parseFloat(placed_order.getFieldValue('shippingcost')))
        }

        ,
        currency: {
            internalid: placed_order.getFieldValue('currency'),
            name: placed_order.getFieldValue('currencyname')
        }
    };
}

function setLinesV2(placed_order, result, user) {
    'use strict';

    result.lines = {};
    var items_to_preload = [],
        amount, preloadedItems;

    // load clients for this record since result doesn't include first name & last name
    var customer_id = placed_order.getFieldValue('entity');
    var profile_filters = [
            new nlobjSearchFilter('custrecord_tc_tailor', null, 'is', customer_id)
        ]

        ,
        profile_columns = [
            new nlobjSearchColumn('custrecord_tc_first_name'), new nlobjSearchColumn('custrecord_tc_last_name')
        ]

        ,
        profiles = nlapiSearchRecord('customrecord_sc_tailor_client', null, profile_filters, profile_columns);

    // special function for retrieving client name

    var getClientName = function(clientId) {
        var result = null;
        for (index in profiles) {
            if (profiles[index].id == clientId) {
                result = profiles[index].getValue("custrecord_tc_first_name") + " " + profiles[index].getValue("custrecord_tc_last_name");
                break;
            }
        }
        return result;
    }

    for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

        if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i)) {
            var discline = placed_order.getLineItemValue('item', 'discline', i);

            amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

            result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
            result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
        } else {
            var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i)),
                item_id = placed_order.getLineItemValue('item', 'item', i),
                item_type = placed_order.getLineItemValue('item', 'itemtype', i);

            amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));

            var tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0,
                total = amount + tax_amount;

            var lineOption = [];
            if (placed_order.getLineItemValue('item', 'custcol_flag_comment', i)) {
                lineOption.push({
                    id: 'custcol_flag_comment',
                    cartOptionId: 'custcol_flag_comment',
                    label: 'Flag Comment',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_flag_comment', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_flag', i)) {
                lineOption.push({
                    id: 'custcol_flag',
                    cartOptionId: 'custcol_flag',
                    label: 'Flag',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_flag', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoption_message', i)) {
                lineOption.push({
                    id: 'custcol_designoption_message',
                    cartOptionId: 'custcol_designoption_message',
                    label: 'Design Options - Message',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoption_message', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_jacket',
                    cartOptionId: 'custcol_designoptions_jacket',
                    label: 'Design Options - Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)
                    },
                    ismandatory: false
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_designoptions_sneakers', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_sneakers',
                    cartOptionId: 'custcol_designoptions_sneakers',
                    label: 'Design Options - Sneakers',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_sneakers', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_overcoat',
                    cartOptionId: 'custcol_designoptions_overcoat',
                    label: 'Design Options - Overcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shirt',
                    cartOptionId: 'custcol_designoptions_shirt',
                    label: 'Design Options - Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_trouser',
                    cartOptionId: 'custcol_designoptions_trouser',
                    label: 'Design Options - Trouser',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_waistcoat',
                    cartOptionId: 'custcol_designoptions_waistcoat',
                    label: 'Design Options - Waistcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_trenchcoat',
                    cartOptionId: 'custcol_designoptions_trenchcoat',
                    label: 'Design Options - Trenchcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ssshirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ssshirt',
                    cartOptionId: 'custcol_designoptions_ssshirt',
                    label: 'Design Options - Short Sleeves Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_ssshirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiesskirt',
                    cartOptionId: 'custcol_designoptions_ladiesskirt',
                    label: 'Design Options - Ladies Skirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiespants', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiespants',
                    cartOptionId: 'custcol_designoptions_ladiespants',
                    label: 'Design Options - Ladies Pants',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiespants', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiesjacket',
                    cartOptionId: 'custcol_designoptions_ladiesjacket',
                    label: 'Design Options - Ladies Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_safari_jacket',
                    cartOptionId: 'custcol_designoptions_safari_jacket',
                    label: 'Design Options - Safari Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_camp_shirt',
                    cartOptionId: 'custcol_designoptions_camp_shirt',
                    label: 'Design Options - Camp Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shirt_jacket',
                    cartOptionId: 'custcol_designoptions_shirt_jacket',
                    label: 'Design Options - Shirt Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_morning_coat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_morning_coat',
                    cartOptionId: 'custcol_designoptions_morning_coat',
                    label: 'Design Options - Morning Coat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_morning_coat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shorts', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shorts',
                    cartOptionId: 'custcol_designoptions_shorts',
                    label: 'Design Options - Shorts',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_designoptions_shorts', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_summary',
                    cartOptionId: 'custcol_fitprofile_summary',
                    label: 'Fit Profile Summary',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_message',
                    cartOptionId: 'custcol_fitprofile_message',
                    label: 'Fit Profile - Message',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)
                    },
                    ismandatory: false
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)) {
                lineOption.push({
                    id: 'custcol_tailor_cust_pricing',
                    cartOptionId: 'custcol_tailor_cust_pricing',
                    label: 'Tailor Pricing',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_tailor_client', i)) {
                var clientId = placed_order.getLineItemValue('item', 'custcol_tailor_client', i);
                if (clientId) {
                    lineOption.push({
                        id: 'custcol_tailor_client',
                        cartOptionId: 'custcol_tailor_client',
                        label: 'Tailor Client',
                        value: {
                            internalid: clientId
                        },
                        ismandatory: false
                    });
                    lineOption.push({
                        id: 'custcol_tailor_client_name',
                        cartOptionId: 'custcol_tailor_client_name',
                        label: 'Client Name',
                        value: {
                            internalid: placed_order.getFieldValue('custbody_customer_name')
                        } //getClientName(clientId)
                        ,
                        ismandatory: false
                    });
                }
            }
            if (placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)) {
                lineOption.push({
                    id: 'custcol_itm_category_url',
                    cartOptionId: 'custcol_itm_category_url',
                    label: 'Category URL',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)) {
                lineOption.push({
                    id: 'custcol_fabric_quantity',
                    cartOptionId: 'custcol_fabric_quantity',
                    label: 'Fabric Quantity',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)
                    },
                    ismandatory: false
                });
            }

            /** start date needed, hold fabric, hold production **/
            if (placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i)) {
                lineOption.push({
                    id: 'custcol_avt_date_needed',
                    cartOptionId: 'custcol_avt_date_needed',
                    label: 'Date Needed',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i) || '1/1/1900'
                    },
                    ismandatory: false
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_avt_hold_fabric', i)) {
                lineOption.push({
                    id: 'custcol_avt_hold_fabric',
                    cartOptionId: 'custcol_avt_hold_fabric',
                    label: 'Hold Fabric',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_avt_hold_fabric', i) || 'F'
                    },
                    ismandatory: false
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_avt_hold_production', i)) {
                lineOption.push({
                    id: 'custcol_avt_hold_production',
                    cartOptionId: 'custcol_avt_hold_production',
                    label: 'Hold Production',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_avt_hold_production', i) || 'F'
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)) {
                lineOption.push({
                    id: 'custcol_custom_fabric_details',
                    cartOptionId: 'custcol_custom_fabric_details',
                    label: 'Custom Fabric Details',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_producttype', i)) {
                lineOption.push({
                    id: 'custcol_producttype',
                    cartOptionId: 'custcol_producttype',
                    label: 'Product Type',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_producttype', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)) {
                lineOption.push({
                    id: 'custcol_vendorpicked',
                    cartOptionId: 'custcol_vendorpicked',
                    label: 'CMT Vendor',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_avt_wbs_copy_key', i)) {
                lineOption.push({
                    id: 'custcol_avt_wbs_copy_key',
                    cartOptionId: 'custcol_avt_wbs_copy_key',
                    label: 'Copy Key',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_avt_wbs_copy_key', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_shirt', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_shirt',
                    cartOptionId: 'custcol_fitprofile_shirt',
                    label: 'Fit Profile - Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_shirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_jacket', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_jacket',
                    cartOptionId: 'custcol_fitprofile_jacket',
                    label: 'Fit Profile - Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_jacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiesjacket', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_ladiesjacket',
                    cartOptionId: 'custcol_fitprofile_ladiesjacket',
                    label: 'Fit Profile - Ladies Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiesjacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_waistcoat', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_waistcoat',
                    cartOptionId: 'custcol_fitprofile_waistcoat',
                    label: 'Fit Profile - Waistcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_waistcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiesskirt', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_ladiesskirt',
                    cartOptionId: 'custcol_fitprofile_ladiesskirt',
                    label: 'Fit Profile - Ladies Skirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiesskirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiespants', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_ladiespants',
                    cartOptionId: 'custcol_fitprofile_ladiespants',
                    label: 'Fit Profile - Ladies Pants',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_ladiespants', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_overcoat', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_overcoat',
                    cartOptionId: 'custcol_fitprofile_overcoat',
                    label: 'Fit Profile - Overcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_overcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_ssshirt', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_ssshirt',
                    cartOptionId: 'custcol_fitprofile_ssshirt',
                    label: 'Fit Profile - Short Sleeves Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_ssshirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_trenchcoat', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_trenchcoat',
                    cartOptionId: 'custcol_fitprofile_trenchcoat',
                    label: 'Fit Profile - Trenchcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_trenchcoat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_trouser', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_trouser',
                    cartOptionId: 'custcol_fitprofile_trouser',
                    label: 'Fit Profile - Trenchcoat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_trouser', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_shorts', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_shorts',
                    cartOptionId: 'custcol_fitprofile_shorts',
                    label: 'Fit Profile - Shorts',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_shorts', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_morning_coat', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_morning_coat',
                    cartOptionId: 'custcol_fitprofile_morning_coat',
                    label: 'Fit Profile - Morning Coat',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_morning_coat', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_shirt_jacket', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_shirt_jacket',
                    cartOptionId: 'custcol_fitprofile_shirt_jacket',
                    label: 'Fit Profile - Shirt Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_shirt_jacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_camp_shirt', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_camp_shirt',
                    cartOptionId: 'custcol_fitprofile_camp_shirt',
                    label: 'Fit Profile - Camp Shirt',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_camp_shirt', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_safari_jacket', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_safari_jacket',
                    cartOptionId: 'custcol_fitprofile_safari_jacket',
                    label: 'Fit Profile - Safari Jacket',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_fitprofile_safari_jacket', i)
                    },
                    ismandatory: false
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)) {
                lineOption.push({
                    id: 'custcol_custom_fabric_details',
                    cartOptionId: 'custcol_custom_fabric_details',
                    label: 'Custom Fabric Details',
                    value: {
                        internalid: placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)
                    },
                    ismandatory: false
                });
            }
            lineOption.push({
                id: 'custcol_othervendorname',
                cartOptionId: 'custcol_othervendorname',
                label: 'Other Vendor Name',
                value: {
                    internalid: placed_order.getLineItemValue('item', 'custcol_othervendorname', i)
                },
                ismandatory: false
            });
            lineOption.push({
                id: 'custcol_site_cogs',
                cartOptionId: 'custcol_site_cogs',
                label: 'COGS',
                value: {
                    internalid: placed_order.getLineItemValue('item', 'custcol_site_cogs', i) ? escape(placed_order.getLineItemValue('item', 'custcol_site_cogs', i)) : ""
                },
                ismandatory: false
            });
            lineOption.push({
                id: 'custcol_fabric_extra',
                cartOptionId: 'custcol_fabric_extra',
                label: 'Extra',
                value: {
                    internalid: placed_order.getLineItemValue('item', 'custcol_fabric_extra', i) ? escape(placed_order.getLineItemValue('item', 'custcol_fabric_extra', i)) : ""
                },
                ismandatory: false
            });
            /** end date needed, hold fabric, hold production **/

            if (item_type != 'Markup') {
                result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
                    internalid: placed_order.getLineItemValue('item', 'id', i),
                    quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

                        ,
                    rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    tax_amount: 0,
                    tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i),
                    tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

                        ,
                    discount: 0

                        ,
                    total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    item: item_id,
                    type: item_type,
                    options: lineOption,
                    shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null,
                    shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null,
                    linegroup: "nonshippable"
                };

                items_to_preload[item_id] = {
                    id: item_id,
                    type: item_type
                };
            } else {
                result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
                    internalid: placed_order.getLineItemValue('item', 'id', i),
                    quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

                        ,
                    rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    tax_amount: 0,
                    tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i),
                    tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

                        ,
                    discount: 0

                        ,
                    total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i),
                    item: {
                        storedisplayname2: placed_order.getLineItemValue('item', 'description', i),
                        displayname: placed_order.getLineItemText('item', 'item', i),
                        internalid: placed_order.getLineItemValue('item', 'id', i)
                    },
                    type: item_type,
                    options: lineOption,
                    shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null,
                    shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
                };
            }
        }
    }

    // Preloads info about the item

    // items_to_preload = _.values(items_to_preload);
    // preloadedItems = preloadItems(items_to_preload, preloadedItems);
    // nlapiLogExecution('debug','preloadedItems',JSON.stringify(preloadedItems));

    result.lines = _.values(result.lines);

    result.lines.forEach(function(line) {
        line.rate_formatted = formatCurrency(line.rate);
        line.amount_formatted = formatCurrency(line.amount);
        line.tax_amount_formatted = formatCurrency(line.tax_amount);
        line.discount_formatted = formatCurrency(line.discount);
        line.total_formatted = formatCurrency(line.total);
        // line.item = line.type != 'Markup' ? _.find(preloadedItems, function (preloadedItem) {
        // return preloadedItem.internalid == line.item;}) :lline.item;
        line.item = line.item;
    });

    // remove the temporary address list by id
    delete result.listAddresseByIdTmp;
}

function setLines(placed_order, result, user) {
    'use strict';

    result.lines = {};
    var items_to_preload = [],
        amount, preloadedItems;

    // load clients for this record since result doesn't include first name & last name
    var customer_id = placed_order.getFieldValue('entity');
    var profile_filters = [
            new nlobjSearchFilter('custrecord_tc_tailor', null, 'is', customer_id)
        ]

        ,
        profile_columns = [
            new nlobjSearchColumn('custrecord_tc_first_name'), new nlobjSearchColumn('custrecord_tc_last_name')
        ]

        ,
        profiles = nlapiSearchRecord('customrecord_sc_tailor_client', null, profile_filters, profile_columns);

    // special function for retrieving client name

    var getClientName = function(clientId) {
        var result = null;
        for (index in profiles) {
            if (profiles[index].id == clientId) {
                result = profiles[index].getValue("custrecord_tc_first_name") + " " + profiles[index].getValue("custrecord_tc_last_name");
                break;
            }
        }
        return result;
    }

    for (var i = 1; i <= placed_order.getLineItemCount('item'); i++) {

        if (placed_order.getLineItemValue('item', 'itemtype', i) === 'Discount' && placed_order.getLineItemValue('item', 'discline', i)) {
            var discline = placed_order.getLineItemValue('item', 'discline', i);

            amount = Math.abs(parseFloat(placed_order.getLineItemValue('item', 'amount', i)));

            result.lines[discline].discount = (result.lines[discline].discount) ? result.lines[discline].discount + amount : amount;
            result.lines[discline].total = result.lines[discline].amount + result.lines[discline].tax_amount - result.lines[discline].discount;
        } else {
            var rate = toCurrency(placed_order.getLineItemValue('item', 'rate', i)),
                item_id = placed_order.getLineItemValue('item', 'item', i),
                item_type = placed_order.getLineItemValue('item', 'itemtype', i);

            amount = toCurrency(placed_order.getLineItemValue('item', 'amount', i));

            var tax_amount = toCurrency(placed_order.getLineItemValue('item', 'tax1amt', i)) || 0,
                total = amount + tax_amount;

            var lineOption = [];
            if (placed_order.getLineItemValue('item', 'custcol_flag_comment', i)) {
                lineOption.push({
                    id: 'custcol_flag_comment',
                    cartOptionId: 'custcol_flag_comment',
                    name: 'Flag Comment',
                    value: placed_order.getLineItemValue('item', 'custcol_flag_comment', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_flag', i)) {
                lineOption.push({
                    id: 'custcol_flag',
                    cartOptionId: 'custcol_flag',
                    name: 'Flag',
                    value: placed_order.getLineItemValue('item', 'custcol_flag', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoption_message', i)) {
                lineOption.push({
                    id: 'custcol_designoption_message',
                    cartOptionId: 'custcol_designoption_message',
                    name: 'Design Options - Message',
                    value: placed_order.getLineItemValue('item', 'custcol_designoption_message', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_jacket',
                    cartOptionId: 'custcol_designoptions_jacket',
                    name: 'Design Options - Jacket',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_jacket', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_sneakers', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_sneakers',
                    cartOptionId: 'custcol_designoptions_sneakers',
                    name: 'Design Options - Sneakers',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_sneakers', i)
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_order_block_size', i)) {
                lineOption.push({
                    id: 'custcol_order_block_size',
                    cartOptionId: 'custcol_order_block_size',
                    name: 'Product Size',
                    value: placed_order.getLineItemValue('item', 'custcol_order_block_size', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_overcoat',
                    cartOptionId: 'custcol_designoptions_overcoat',
                    name: 'Design Options - Overcoat',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_overcoat', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shirt',
                    cartOptionId: 'custcol_designoptions_shirt',
                    name: 'Design Options - Shirt',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_shirt', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_trouser',
                    cartOptionId: 'custcol_designoptions_trouser',
                    name: 'Design Options - Trouser',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_trouser', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_waistcoat',
                    cartOptionId: 'custcol_designoptions_waistcoat',
                    name: 'Design Options - Waistcoat',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_waistcoat', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_trenchcoat',
                    cartOptionId: 'custcol_designoptions_trenchcoat',
                    name: 'Design Options - Trenchcoat',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_trenchcoat', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ssshirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ssshirt',
                    cartOptionId: 'custcol_designoptions_ssshirt',
                    name: 'Design Options - Short Sleeves Shirt',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_ssshirt', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiesskirt',
                    cartOptionId: 'custcol_designoptions_ladiesskirt',
                    name: 'Design Options - Ladies Skirt',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesskirt', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiespants', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiespants',
                    cartOptionId: 'custcol_designoptions_ladiespants',
                    name: 'Design Options - Ladies Pants',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiespants', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_ladiesjacket',
                    cartOptionId: 'custcol_designoptions_ladiesjacket',
                    name: 'Design Options - Ladies Jacket',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_ladiesjacket', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shorts', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shorts',
                    cartOptionId: 'custcol_designoptions_shorts',
                    name: 'Design Options - Shorts',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_shorts', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_morning_coat', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_morning_coat',
                    cartOptionId: 'custcol_designoptions_morning_coat',
                    name: 'Design Options - Morning Coat',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_morning_coat', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_shirt_jacket',
                    cartOptionId: 'custcol_designoptions_shirt_jacket',
                    name: 'Design Options - Shirt Jacket',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_shirt_jacket', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_camp_shirt',
                    cartOptionId: 'custcol_designoptions_camp_shirt',
                    name: 'Design Options - Camp Shirt',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_camp_shirt', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', i)) {
                lineOption.push({
                    id: 'custcol_designoptions_safari_jacket',
                    cartOptionId: 'custcol_designoptions_safari_jacket',
                    name: 'Design Options - Safari Jacket',
                    value: placed_order.getLineItemValue('item', 'custcol_designoptions_safari_jacket', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_summary',
                    cartOptionId: 'custcol_fitprofile_summary',
                    name: 'Fit Profile Summary',
                    value: placed_order.getLineItemValue('item', 'custcol_fitprofile_summary', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)) {
                lineOption.push({
                    id: 'custcol_fitprofile_message',
                    cartOptionId: 'custcol_fitprofile_message',
                    name: 'Fit Profile - Message',
                    value: placed_order.getLineItemValue('item', 'custcol_fitprofile_message', i)
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)) {
                lineOption.push({
                    id: 'custcol_tailor_cust_pricing',
                    cartOptionId: 'custcol_tailor_cust_pricing',
                    name: 'Tailor Pricing',
                    value: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_tailor_client', i)) {
                var clientId = placed_order.getLineItemValue('item', 'custcol_tailor_client', i);
                if (clientId) {
                    lineOption.push({
                        id: 'custcol_tailor_client',
                        cartOptionId: 'custcol_tailor_client',
                        name: 'Tailor Client',
                        value: clientId
                    });
                    lineOption.push({
                        id: 'custcol_tailor_client_name',
                        cartOptionId: 'custcol_tailor_client_name',
                        name: 'Client Name',
                        value: placed_order.getFieldValue('custbody_customer_name') //getClientName(clientId)
                    });
                }
            }
            if (placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)) {
                lineOption.push({
                    id: 'custcol_itm_category_url',
                    cartOptionId: 'custcol_itm_category_url',
                    name: 'Category URL',
                    value: placed_order.getLineItemValue('item', 'custcol_itm_category_url', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)) {
                lineOption.push({
                    id: 'custcol_fabric_quantity',
                    cartOptionId: 'custcol_fabric_quantity',
                    name: 'Fabric Quantity',
                    value: placed_order.getLineItemValue('item', 'custcol_fabric_quantity', i)
                });
            }

            /** start date needed, hold fabric, hold production **/
            if (placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i)) {
                lineOption.push({
                    id: 'custcol_avt_date_needed',
                    cartOptionId: 'custcol_avt_date_needed',
                    name: 'Date Needed',
                    value: placed_order.getLineItemValue('item', 'custcol_avt_date_needed', i) || '1/1/1900'
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_avt_hold_fabric', i)) {
                lineOption.push({
                    id: 'custcol_avt_hold_fabric',
                    cartOptionId: 'custcol_avt_hold_fabric',
                    name: 'Hold Fabric',
                    value: placed_order.getLineItemValue('item', 'custcol_avt_hold_fabric', i) || 'F'
                });
            }

            if (placed_order.getLineItemValue('item', 'custcol_avt_hold_production', i)) {
                lineOption.push({
                    id: 'custcol_avt_hold_production',
                    cartOptionId: 'custcol_avt_hold_production',
                    name: 'Hold Production',
                    value: placed_order.getLineItemValue('item', 'custcol_avt_hold_production', i) || 'F'
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)) {
                lineOption.push({
                    id: 'custcol_custom_fabric_details',
                    cartOptionId: 'custcol_custom_fabric_details',
                    name: 'Custom Fabric Details',
                    value: placed_order.getLineItemValue('item', 'custcol_custom_fabric_details', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_producttype', i)) {
                lineOption.push({
                    id: 'custcol_producttype',
                    cartOptionId: 'custcol_producttype',
                    name: 'Product Type',
                    value: placed_order.getLineItemValue('item', 'custcol_producttype', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)) {
                lineOption.push({
                    id: 'custcol_vendorpicked',
                    cartOptionId: 'custcol_vendorpicked',
                    name: 'CMT Vendor',
                    value: placed_order.getLineItemValue('item', 'custcol_vendorpicked', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_avt_wbs_copy_key', i)) {
                lineOption.push({
                    id: 'custcol_avt_wbs_copy_key',
                    cartOptionId: 'custcol_avt_wbs_copy_key',
                    name: 'Copy Key',
                    value: placed_order.getLineItemValue('item', 'custcol_avt_wbs_copy_key', i)
                });
            }
            if (placed_order.getLineItemValue('item', 'custcol_avt_modified_date_needed', i)) {
                lineOption.push({
                    id: 'custcol_avt_modified_date_needed',
                    cartOptionId: 'custcol_avt_modified_date_needed',
                    name: 'Modified Date Needed',
                    value: placed_order.getLineItemValue('item', 'custcol_avt_modified_date_needed', i)
                });
            }
            lineOption.push({
                id: 'custcol_othervendorname',
                cartOptionId: 'custcol_othervendorname',
                name: 'Other Vendor Name',
                value: placed_order.getLineItemValue('item', 'custcol_othervendorname', i)
            });
            lineOption.push({
                id: 'custcol_site_cogs',
                cartOptionId: 'custcol_site_cogs',
                name: 'COGS',
                value: placed_order.getLineItemValue('item', 'custcol_site_cogs', i) ? escape(placed_order.getLineItemValue('item', 'custcol_site_cogs', i)) : ""
            });
            lineOption.push({
                id: 'custcol_fabric_extra',
                cartOptionId: 'custcol_fabric_extra',
                name: 'Extra',
                value: placed_order.getLineItemValue('item', 'custcol_fabric_extra', i) ? escape(placed_order.getLineItemValue('item', 'custcol_fabric_extra', i)) : ""
            });
            lineOption.push({
                id: 'custcol_so_id',
                cartOptionId: 'custcol_so_id',
                name: 'SOID',
                value: placed_order.getLineItemValue('item', 'custcol_so_id', i) ? placed_order.getLineItemValue('item', 'custcol_so_id', i) : ""
            });
            lineOption.push({
                id: 'custcol_avt_cmt_status',
                cartOptionId: 'custcol_avt_cmt_status',
                name: 'CMT Status',
                value: placed_order.getLineItemValue('item', 'custcol_avt_cmt_status', i) ? placed_order.getLineItemValue('item', 'custcol_avt_cmt_status', i) : ""
            });
            /** end date needed, hold fabric, hold production **/

            if (item_type != 'Markup') {
                result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
                    internalid: placed_order.getLineItemValue('item', 'id', i),
                    quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

                        ,
                    rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    tax_amount: 0,
                    tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i),
                    tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

                        ,
                    discount: 0

                        ,
                    total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    item: item_id,
                    type: item_type,
                    options: lineOption,
                    shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null,
                    shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
                };

                items_to_preload[item_id] = {
                    id: item_id,
                    type: item_type
                };
            } else {
                result.lines[placed_order.getLineItemValue('item', 'line', i)] = {
                    internalid: placed_order.getLineItemValue('item', 'id', i),
                    quantity: parseInt(placed_order.getLineItemValue('item', 'quantity', i), 10)

                        ,
                    rate: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    amount: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i)

                        ,
                    tax_amount: 0,
                    tax_rate: placed_order.getLineItemValue('item', 'taxrate1', i),
                    tax_code: placed_order.getLineItemValue('item', 'taxcode_display', i)

                        ,
                    discount: 0

                        ,
                    total: placed_order.getLineItemValue('item', 'custcol_tailor_cust_pricing', i),
                    item: {
                        storedisplayname2: placed_order.getLineItemValue('item', 'description', i),
                        displayname: placed_order.getLineItemText('item', 'item', i),
                        internalid: placed_order.getLineItemValue('item', 'id', i)
                    },
                    type: item_type,
                    options: lineOption,
                    shipaddress: placed_order.getLineItemValue('item', 'shipaddress', i) ? result.listAddresseByIdTmp[placed_order.getLineItemValue('item', 'shipaddress', i)] : null,
                    shipmethod: placed_order.getLineItemValue('item', 'shipmethod', i) || null
                };
            }
        }
    }

    // Preloads info about the item

    // items_to_preload = _.values(items_to_preload);
    // preloadedItems = preloadItems(items_to_preload, preloadedItems);
    // nlapiLogExecution('debug','preloadedItems',JSON.stringify(preloadedItems));

    result.lines = _.values(result.lines);

    result.lines.forEach(function(line) {
        line.rate_formatted = formatCurrency(line.rate);
        line.amount_formatted = formatCurrency(line.amount);
        line.tax_amount_formatted = formatCurrency(line.tax_amount);
        line.discount_formatted = formatCurrency(line.discount);
        line.total_formatted = formatCurrency(line.total);
        // line.item = line.type != 'Markup' ? _.find(preloadedItems, function (preloadedItem) {
        // return preloadedItem.internalid == line.item;}) :lline.item;
        line.item = line.item;
    });

    // remove the temporary address list by id
    delete result.listAddresseByIdTmp;
}

function preloadItems(items, preloadedItems) {
    'use strict';

    var items_by_id = {},
        parents_by_id = {};

    items = items || [];

    preloadedItems = preloadedItems || {};
    items.forEach(function(item) {
        if (!item.id || !item.type || item.type === 'Discount') {
            return;
        }
        if (!preloadedItems[item.id]) {
            items_by_id[item.id] = {
                internalid: new String(item.id).toString(),
                itemtype: item.type,
                itemfields: getitemfields() //items_fields_standard_keys
            };
        }
    });

    if (!_.size(items_by_id)) {
        return preloadedItems;
    }
    var items_details = getItemFieldValues(items_by_id);
    //nlapiLogExecution('debug','itemdetails',JSON.stringify(items_details));
    // Generates a map by id for easy access. Notice that for disabled items the array element can be null
    _.each(items_details, function(item) {
        if (item && typeof item.itemid !== 'undefined') {
            preloadedItems[item.internalid] = item;
        }
    });
    return items_details;
}

function setFulfillments(result) {
    'use strict';
    result.fulfillments = {};
    var filters = [
            new nlobjSearchFilter('createdfrom', null, 'is', result.internalid), new nlobjSearchFilter('cogs', null, 'is', 'F'), new nlobjSearchFilter('shipping', null, 'is', 'F'), new nlobjSearchFilter('shiprecvstatusline', null, 'is', 'F')
        ]

        ,
        columns = [
            new nlobjSearchColumn('quantity'), new nlobjSearchColumn('item'), new nlobjSearchColumn('shipaddress'), new nlobjSearchColumn('shipmethod'), new nlobjSearchColumn('shipto'), new nlobjSearchColumn('trackingnumbers'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('status')

            // Ship Address
            , new nlobjSearchColumn('shipaddress'), new nlobjSearchColumn('shipaddress1'), new nlobjSearchColumn('shipaddress2'), new nlobjSearchColumn('shipaddressee'), new nlobjSearchColumn('shipattention'), new nlobjSearchColumn('shipcity'), new nlobjSearchColumn('shipcountry'), new nlobjSearchColumn('shipstate'), new nlobjSearchColumn('shipzip')
        ]

        ,
        fulfillments = getAllSearchResults('itemfulfillment', filters, columns),
        fulfillment_id = [];


    fulfillments.forEach(function(ffline) {

        if (ffline.getValue('status') === 'shipped') {

            var shipaddress = addAddress({
                internalid: ffline.getValue('shipaddress'),
                country: ffline.getValue('shipcountry'),
                state: ffline.getValue('shipstate'),
                city: ffline.getValue('shipcity'),
                zip: ffline.getValue('shipzip'),
                addr1: ffline.getValue('shipaddress1'),
                addr2: ffline.getValue('shipaddress2'),
                attention: ffline.getValue('shipattention'),
                addressee: ffline.getValue('shipaddressee')
            }, result);


            result.fulfillments[ffline.getId()] = result.fulfillments[ffline.getId()] || {
                internalid: ffline.getId(),
                shipaddress: shipaddress,
                shipmethod: {
                    internalid: ffline.getValue('shipmethod'),
                    name: ffline.getText('shipmethod')
                },
                date: ffline.getValue('trandate'),
                trackingnumbers: ffline.getValue('trackingnumbers') ? ffline.getValue('trackingnumbers').split('<BR>') : null,
                lines: []
            };

            result.fulfillments[ffline.getId()].lines.push({
                item_id: ffline.getValue('item'),
                quantity: ffline.getValue('quantity'),
                rate: 0,
                rate_formatted: formatCurrency(0)
            });
            fulfillment_id.push(ffline.getId());

        }

    });


    if (fulfillment_id.length) {
        filters = [
            new nlobjSearchFilter('internalid', null, 'anyof', result.internalid), new nlobjSearchFilter('fulfillingtransaction', null, 'anyof', fulfillment_id)
        ];


        columns = [
            new nlobjSearchColumn('line'), new nlobjSearchColumn('item'), new nlobjSearchColumn('rate'), new nlobjSearchColumn('fulfillingtransaction')

        ];


        // TODO: open issue: we need visibility to the orderline/orderdoc attributes of the fulfillment
        // and this sux :p
        getAllSearchResults('salesorder', filters, columns).forEach(function(line) {
            var foundline = _.find(result.fulfillments[line.getValue('fulfillingtransaction')].lines, function(ffline) {
                return ffline.item_id === line.getValue('item') && !ffline.line_id;
            });

            foundline.line_id = result.internalid + '_' + line.getValue('line');
            foundline.rate = parseFloat(line.getValue('rate')) * foundline.quantity;
            foundline.rate_formatted = formatCurrency(foundline.rate);
            delete foundline.item_id;
        });
    }

}

function setPaymentMethod(placed_order, result) {
    'use strict';

    return setPaymentMethodToResult(placed_order, result);
}


function setPaymentMethodToResult(record, result) {
    'use strict';
    var paymentmethod = {
        type: record.getFieldValue('paymethtype'),
        primary: true
    };

    if (paymentmethod.type === 'creditcard') {
        paymentmethod.creditcard = {
            ccnumber: record.getFieldValue('ccnumber'),
            ccexpiredate: record.getFieldValue('ccexpiredate'),
            ccname: record.getFieldValue('ccname'),
            internalid: record.getFieldValue('creditcard'),
            paymentmethod: {
                ispaypal: 'F',
                name: record.getFieldText('paymentmethod'),
                creditcard: 'T',
                internalid: record.getFieldValue('paymentmethod')
            }
        };
    }

    if (record.getFieldValue('ccstreet')) {
        paymentmethod.ccstreet = record.getFieldValue('ccstreet');
    }

    if (record.getFieldValue('cczipcode')) {
        paymentmethod.cczipcode = record.getFieldValue('cczipcode');
    }

    if (record.getFieldValue('terms')) {
        paymentmethod.type = 'invoice';

        paymentmethod.purchasenumber = record.getFieldValue('otherrefnum');

        paymentmethod.paymentterms = {
            internalid: record.getFieldValue('terms'),
            name: record.getFieldText('terms')
        };
    }

    result.paymentmethods = [paymentmethod];
}


function setReceipts(result, placedorder, user) {
    'use strict';

    // result.receipts = Application.getModel('Receipts').list({
    // orderid: result.internalid
    // });
    var reciept_type = ['CustInvc', 'CashSale'],
        amount_field = 'amount',
        filters = [
            new nlobjSearchFilter('mainline', null, 'is', 'T'), new nlobjSearchFilter('type', null, 'anyof', reciept_type)
        ]

        ,
        columns = [
            new nlobjSearchColumn('internalid'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('status'), new nlobjSearchColumn('type'), new nlobjSearchColumn('closedate'), new nlobjSearchColumn('mainline'), new nlobjSearchColumn('duedate').setSort(), new nlobjSearchColumn(amount_field)
        ],
        amount_remaining;
    var customer = new nlobjSearchFilter('entity', null, 'is', user)
    customer.isor = true;
    customer.leftparens = 1;
    filters.push(customer);
    var parent = new nlobjSearchFilter('parent', 'entity', 'is', user)

    amount_remaining = new nlobjSearchColumn('amountremaining');


    columns.push(amount_remaining);

    if (result.internalid) {
        filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', result.internalid));
    }

    var results = getAllSearchResults('transaction', filters, columns),
        now = new Date().getTime();


    result.receipts = _.map(results || [], function(record) {

        var due_date = record.getValue('duedate'),
            close_date = record.getValue('closedate'),
            tran_date = record.getValue('trandate'),
            due_in_milliseconds = due_date ? nlapiStringToDate(due_date).getTime() - now : 0 //new Date(due_date).getTime() - now
            ,
            total = toCurrency(record.getValue(amount_field)),
            total_formatted = formatCurrency(record.getValue(amount_field));

        return {
            internalid: record.getId(),
            tranid: record.getValue('tranid'),
            order_number: record.getValue('tranid') // Legacy attribute
                ,
            date: tran_date // Legacy attribute
                ,
            summary: { // Legacy attribute
                total: total,
                total_formatted: total_formatted
            },
            total: total,
            total_formatted: total_formatted,
            recordtype: record.getValue('type'),
            mainline: record.getValue('mainline'),
            amountremaining: toCurrency(record.getValue(amount_remaining)),
            amountremaining_formatted: formatCurrency(record.getValue(amount_remaining)),
            closedate: close_date,
            closedateInMilliseconds: close_date ? nlapiStringToDate(close_date).getTime() : 0 //new Date(close_date).getTime()
                ,
            trandate: tran_date,
            tranDateInMilliseconds: tran_date ? nlapiStringToDate(tran_date).getTime() : 0 //new Date(tran_date).getTime()
                ,
            duedate: due_date,
            dueinmilliseconds: due_in_milliseconds,
            isOverdue: due_in_milliseconds <= 0 && ((-1 * due_in_milliseconds) / 1000 / 60 / 60 / 24) >= 1,
            status: {
                internalid: record.getValue('status'),
                name: record.getText('status')
            },
            currency: {
                internalid: record.getValue('currency'),
                name: record.getText('currency')
            }
        };
    });
}

function setCases(result, placedorder, user) {
    'use strict';
    var amount_field = 'amount',
        filters = [
            new nlobjSearchFilter('internalid', 'company', 'is', user)
        ],
        columns = [
            new nlobjSearchColumn('internalid'), new nlobjSearchColumn('custevent_so_id'), new nlobjSearchColumn('status'), new nlobjSearchColumn('issue'), new nlobjSearchColumn('custevent_replacement_soid'), new nlobjSearchColumn('custevent_discount_requested'), new nlobjSearchColumn('custevent_discount_reasons'), new nlobjSearchColumn('custevent_date_needed')
        ]

    if (result.internalid) {
        filters.push(new nlobjSearchFilter('custevent_related_sales_order', null, 'anyof', result.internalid));
    }

     var caseresult = getAllSearchResults('supportcase', filters, columns);
		 result.cases = caseresult;
}

function setReturnAuthorizations(result, placedorder, user) {
    'use strict';
    var amount_field = 'amount'

        ,
        filters = [
            new nlobjSearchFilter('entity', null, 'is', user)
        ]

        ,
        columns = [
            new nlobjSearchColumn('internalid', 'item'), new nlobjSearchColumn('type', 'item'), new nlobjSearchColumn('parent', 'item'), new nlobjSearchColumn('displayname', 'item'), new nlobjSearchColumn('storedisplayname', 'item'), new nlobjSearchColumn('internalid'), new nlobjSearchColumn('taxtotal'), new nlobjSearchColumn('rate'), new nlobjSearchColumn('total'), new nlobjSearchColumn('mainline'), new nlobjSearchColumn('trandate'), new nlobjSearchColumn('internalid'), new nlobjSearchColumn('tranid'), new nlobjSearchColumn('status'), new nlobjSearchColumn('options'), new nlobjSearchColumn('linesequencenumber').setSort(), new nlobjSearchColumn(amount_field), new nlobjSearchColumn('quantity')
        ]

        ,
        return_authorizations = null;

    if (result.internalid) {
        filters.push(new nlobjSearchFilter('createdfrom', null, 'anyof', result.internalid));
    }

    result.returnauthorizations = parseResults(getAllSearchResults('returnauthorization', filters, columns));

}

function parseResults(return_authorizations) {
    'use strict';

    var amount_field = 'amount',
        return_authorization_id = 0,
        current_return = null,
        grouped_result = {};

    // the query returns the transaction headers mixed with the lines so we have to group the returns authorization
    _.each(return_authorizations, function(returnauthorization) {
        return_authorization_id = returnauthorization.getId();
        // create the return authorization
        if (!grouped_result[return_authorization_id]) {
            grouped_result[return_authorization_id] = {
                lines: []
            };
        }

        current_return = grouped_result[return_authorization_id];

        // asterisk means true
        if (returnauthorization.getValue('mainline') === '*' || !current_return.internalid) {
            // if it's the mainline we add some fields
            _.extend(current_return, {
                internalid: returnauthorization.getValue('internalid'),
                status: returnauthorization.getText('status'),
                date: returnauthorization.getValue('trandate'),
                summary: {
                    total: toCurrency(returnauthorization.getValue('total')),
                    total_formatted: formatCurrency(returnauthorization.getValue('total'))
                },
                type: 'returnauthorization',
                tranid: returnauthorization.getValue('tranid'),
                currency: is_multicurrency ? {
                    internalid: returnauthorization.getValue('currency'),
                    name: returnauthorization.getText('currency')
                } : null
            });

            // it the autorizhation is approved, add the return's information
            if (returnauthorization.getValue('status') !== 'pendingApproval') {
                current_return.order_number = returnauthorization.getValue('tranid');
                current_return.return_address = return_address;
            }
        }

        if (returnauthorization.getValue('mainline') !== '*') {
            // if it's a line, we add it to the lines collection of the return authorization
            // TODO: find the proper field for the internalid instead of building it
            current_return.lines.push({
                internalid: returnauthorization.getValue('internalid') + '_' + returnauthorization.getValue('linesequencenumber'),
                quantity: returnauthorization.getValue('quantity'),
                rate: toCurrency(returnauthorization.getValue('rate')),
                amount: toCurrency(returnauthorization.getValue(amount_field)),
                tax_amount: toCurrency(returnauthorization.getValue('taxtotal')),
                total: toCurrency(returnauthorization.getValue('total'))

                    ,
                options: getItemOptionsObject(returnauthorization.getValue('options'))
                    // add item information to order's line, the storeitem collection was preloaded in the getOrderLines function
                    ,
                item: (
                    returnauthorization.getValue('internalid', 'item'), returnauthorization.getValue('type', 'item')
                )
            });
        }
    });

    return _.values(grouped_result);
}

function isReturnable(placed_order) {
    'use strict';

    var status_id = placed_order.getFieldValue('statusRef');

    return status_id !== 'pendingFulfillment' && status_id !== 'pendingApproval' && status_id !== 'closed';
}

function getAllSearchResults(record_type, filters, columns) {
    'use strict';

    var search = nlapiCreateSearch(record_type, filters, columns);
    search.setIsPublic(true);

    var searchRan = search.runSearch(),
        bolStop = false,
        intMaxReg = 1000,
        intMinReg = 0,
        result = [];

    while (!bolStop && nlapiGetContext().getRemainingUsage() > 10) {
        // First loop get 1000 rows (from 0 to 1000), the second loop starts at 1001 to 2000 gets another 1000 rows and the same for the next loops
        var extras = searchRan.getResults(intMinReg, intMaxReg);

        result = searchUnion(result, extras);
        intMinReg = intMaxReg;
        intMaxReg += 1000;
        // If the execution reach the the last result set stop the execution
        if (extras.length < 1000) {
            bolStop = true;
        }
    }

    return result;
}

function searchUnion(target, array) {
    'use strict';

    return target.concat(array);
}

function setDateInt(date) {
    'use strict';

    var offset = new Date().getTimezoneOffset() * 60 * 1000;

    return new Date(parseInt(date, 10) + offset);
}

function getItemFieldValues(items_by_id) {
    'use strict';
    var item_ids = _.values(items_by_id)

    for (var j = 0; j < item_ids.length; j++) {
        var obj2 = nlapiLookupField('item', item_ids[j].internalid, item_ids[j].itemfields);
        obj2.isbackorderable = true;
        obj2.isinactive = false;
        obj2.isinstock = true;
        obj2.isonline = true;
        obj2.ispurchasable = true;
        obj2.showoutofstockmessage = false;
        obj2.itemtype = obj2.type;
        mix(obj2, item_ids[j]);
        //for(var key in obj2) item_ids[j][key] = obj2[key];
        //$.extend(item_ids[j], item_ids[j], nlapiLookupField('item',item_ids[j].internalid,item_ids[j].itemfields));
        //item_ids[j] = _.merge(item_ids[j],nlapiLookupField('item',item_ids[j].internalid,item_ids[j].itemfields))
        //item_ids[j] = Object.assign({}, [item_ids[j],nlapiLookupField('item',item_ids[j].internalid,item_ids[j].itemfields)]);
    }

    return item_ids;
}

function mix(source, target) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

}

function getShippingCharges(user) {
    var shippingcharges = [],
        filter = [],
        cols = [];
    filter.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    if (user)
        filter.push(new nlobjSearchFilter('custrecord_iscf_tailor', null, 'is', user));
    cols.push(new nlobjSearchColumn('custrecord_iscf_product_type'));
    cols.push(new nlobjSearchColumn('custrecord_iscf_tailor'));
    cols.push(new nlobjSearchColumn('custrecord_iscf_rate'));
    //30
    //Get the surcharges for calculation of shipping
    var do_surcharges = nlapiSearchRecord('customrecord_item_shipping_charges', null, filter, cols);
    if (do_surcharges) {
        for (var k = 0; k < do_surcharges.length; k++) {
            //name:location,
            //values:{[]}
            shippingcharges.push({
                tailor: do_surcharges[k].getValue('custrecord_iscf_tailor'),
                rate: do_surcharges[k].getValue('custrecord_iscf_rate'),
                producttype: do_surcharges[k].getText('custrecord_iscf_product_type')
            });
        }
    }
    return shippingcharges;
}

function getDutiesCosts() {
    var dutiescosts = [],
        filter = [],
        cols = [];
    filter.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

    cols.push(new nlobjSearchColumn('custrecord_dc_producttype'));
    cols.push(new nlobjSearchColumn('custrecord_dc_cost'));
    cols.push(new nlobjSearchColumn('custrecord_dc_exempt_tailor'));
    //30
    //Get the surcharges for calculation of shipping
    var do_surcharges = nlapiSearchRecord('customrecord_dutiescost', null, filter, cols);
    if (do_surcharges) {
        for (var k = 0; k < do_surcharges.length; k++) {
            //name:location,
            //values:{[]}
            dutiescosts.push({
                rate: do_surcharges[k].getValue('custrecord_dc_cost'),
                producttype: do_surcharges[k].getText('custrecord_dc_producttype'),
                exempt: do_surcharges[k].getValue('custrecord_dc_exempt_tailor').split(',')
            });
        }
    }
    return dutiescosts;
}
