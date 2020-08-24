// Price.View.js
// -----------------------
// Views for viewing Price list.
define('PriceLists.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'price_lists'

	,	title: _('Price Lists').translate()

	,	page_header: _('Price Lists').translate()

	,	attributes: {
			'class': 'priceLists'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			var self = this;
			var tailor = this.application.user_instance.get('parent');
			this.cmtcosts;
			jQuery.ajax({
				url: window.location.origin+"/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698&action=getcmtandstockedfabric&user="+tailor,
				async: false,
				success: function(data){
					self.cmtcosts = JSON.parse(data);
				}
			});
			jQuery.ajax({
				url: window.location.origin+"/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698&action=getcutlengthfabricvendors&user="+tailor,
				async: false,
				success: function(data){
					self.cutlengthfabricvendors = JSON.parse(data);
				}
			});
			jQuery.ajax({
				url: window.location.origin+"/app/site/hosting/scriptlet.nl?script=213&deploy=1&compid=3857857&h=272f4e9a8e3a11190698&action=getsurchargesformakeandtrim&user="+tailor,
				async: false,
				success: function(data){
					self.surchargesformakeandtrim = JSON.parse(data);
				}
			});
			console.log(self.surchargesformakeandtrim)
		}
	,	events: {
			'click [data-action="downloadCMTStockedFabric"]': 'downloadCMTStockedFabric'
		}
	, downloadCMTStockedFabric: function(e){
		e.preventDefault();
		var data1 = {};
		data1.contents = "data:text/csv;charset=utf-8,";

		if(this.cmtcosts){
			if(this.cmtcosts.allCMT && this.cmtcosts.allCMT.length>0){
				data1.contents += "Fabric Collection,3-Piece-Suit,2-Piece-Suit,Jacket,Trouser,Waistcoat,Shirt,Overcoat,Trenchcoat 4BTN Car Collar,Trenchcoat 5BTN Hooded,Trechcoat 10BTN DB,Ladies3PC Suit, Ladies2PC Jacket-Pants,Ladies2PC Jacket-Skirt,Ladies Jacket,Ladies Pants,Ladies Skirt\n";
				for(var i=0;i<this.cmtcosts.allCMT.length;i++){
					var cmt = this.cmtcosts.allCMT[i];
					data1.contents += cmt.collection?cmt.collection+",":",";
					data1.contents += cmt.threepc?cmt.threepc+",":",";
					data1.contents += cmt.twopc?cmt.twopc+",":",";
					data1.contents += cmt.jacket?cmt.jacket+",":",";
					data1.contents += cmt.trouser?cmt.trouser+",":",";
					data1.contents += cmt.waistcoat?cmt.waistcoat+",":",";
					data1.contents += cmt.shirt?cmt.shirt+",":",";
					data1.contents += cmt.overcoat?cmt.overcoat+",":",";
					data1.contents += cmt.trenchcoat?cmt.trenchcoat+",":",";
					data1.contents += cmt.trenchcoatfivebtn?cmt.trenchcoatfivebtn+",":",";
					data1.contents += cmt.trenchcoattenbtn?cmt.trenchcoattenbtn+",":",";
					data1.contents += cmt.ladiesthreepc?cmt.ladiesthreepc+",":",";
					data1.contents += cmt.twopcpants?cmt.twopcpants+",":",";
					data1.contents += cmt.twopcskirt?cmt.twopcskirt+",":",";
					data1.contents += cmt.ladiesjacket?cmt.ladiesjacket+",":",";
					data1.contents += cmt.ladiespants?cmt.ladiespants+",":",";
					data1.contents += cmt.ladiesskirt?cmt.ladiesskirt:",";
					data1.contents += "\n";
				}

			}
			if(this.cmtcosts.allShipping && this.cmtcosts.allShipping.length>0){
				for(var i=0;i<this.cmtcosts.allShipping.length;i++){
					var cmt = this.cmtcosts.allShipping[i];
					data1.contents += "Shipping Charges,"//cmt.collection+",";
					data1.contents += cmt.threepc+",";
					data1.contents += cmt.twopc+",";
					data1.contents += cmt.jacket+",";
					data1.contents += cmt.trouser+",";
					data1.contents += cmt.waistcoat+",";
					data1.contents += cmt.shirt+",";
					data1.contents += cmt.overcoat+",";
					data1.contents += cmt.trenchcoat+",";
					data1.contents += cmt.trenchcoat+",";
					data1.contents += cmt.trenchcoat+",";
					data1.contents += cmt.ladiesthreepc+",";
					data1.contents += cmt.twopcpants+",";
					data1.contents += cmt.twopcskirt+",";
					data1.contents += cmt.ladiesjacket+",";
					data1.contents += cmt.ladiespants+",";
					data1.contents += cmt.ladiesskirt+"\n";
				}
			}
			var link = document.createElement("a");
			var encodedUri = encodeURI(data1.contents);
			link.setAttribute("href", encodedUri);
			link.setAttribute("download", "CMT_AND_STOCKED_FABRIC.csv");
			document.body.appendChild(link);
			link.click();
		}
	}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'price_lists', [{
				text: this.title
			,	href: '/pricelists'
			}]);
		}

	});
});
