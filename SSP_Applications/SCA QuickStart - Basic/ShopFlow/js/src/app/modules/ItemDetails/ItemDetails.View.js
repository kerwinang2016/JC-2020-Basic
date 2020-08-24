// ItemDetails.View.js
// -------------------
// Handles the pdp and quick view
define('ItemDetails.View', ['FitProFile.Views', 'FitProfile.Model', 'Facets.Translator', 'ItemDetails.Collection'], function (FitProfileViews, FitProfileModel, FacetsTranslator) {
    'use strict';

    var colapsibles_states = {};

    return Backbone.View.extend({

        title: ''
        , page_header: ''
        , template: 'product_details'
        , attributes: {
            'id': 'product-detail'
            , 'class': 'view product-detail'
        }

        , events: {
            'blur [data-toggle="text-option"]': 'setOption'
            , 'click [data-toggle="set-option"]': 'setOption'
            , 'change [data-toggle="select-option"]': 'setOption'

            , 'keydown [data-toggle="text-option"]': 'tabNavigationFix'
            , 'focus [data-toggle="text-option"]': 'tabNavigationFix'

            //,	'change [name="quantity"]': 'updateQuantity' removing since they do not want to re-render when quantity is changed
            , 'change [name="custcol_fabric_quantity"]': 'roundOffFabricQuantity'
            , 'keypress [name="custcol_fabric_quantity"]': 'ignoreEnter'
            , 'keypress [name="quantity"]': 'ignoreEnter'
            , 'click [data-header="design-option-parent"]': 'scrolltodesignoption'
            , 'click [data-type="add-to-cart"]': 'addToCart'

            , 'shown .collapse': 'storeColapsiblesState'
            , 'hidden .collapse': 'storeColapsiblesState'

            // , 'shown [data-container="design-option-parent"]>.accordion-group>.in': 'scrolltodesignoption'
            // , 'hidden [data-container="design-option-parent"]>.accordion-group>.collapse': 'scrolltodesignoption'

            , 'mouseup': 'contentMouseUp'
            , 'click': 'contentClick'

            , 'focus .display-option-dropdown': 'propertyValueChange'

            , 'click [data-action="show-productlist-control"]': 'setCustomOptions'
            , 'click [id="swx-modal-butt-close"]': 'closeModalManually'

            , 'change .designoption-message': 'designOptionMessageChange'
            , 'change .display-option-dropdown': 'propertyValueChange'
            //Fit profile change
            , 'change #fitprofile-details select.profiles-options': 'fitProfileChange'

            //Quantity change
            , 'change .input-mini.quantity': 'quantityChange'
            //Fit profile message change
            , 'change #fitprofile-message': 'fitProfileMessageChange'
            , 'change #fabric-cmt-vendor': 'fabricVendorChange'
        }

        , initialize: function (options) {
            var self = this;
            jQuery.get(_.getAbsoluteUrl('js/extraQuantity.json')).done(function (data) {
                window.extraQuantity = data;
            });
            jQuery.get(_.getAbsoluteUrl('js/itemRangeConfig.json')).done(function (data) {
                window.cmConfig = data;
            });

            jQuery.get(_.getAbsoluteUrl('js/itemRangeConfigInches.json')).done(function (data) {
                window.inchConfig = data;
            });
            this.application = options.application;
            this.counted_clicks = {};
            SC.sessioncheck();
            var historyFragment = decodeURIComponent(Backbone.history.fragment);
            if (options.pList) {
                options.pList = decodeURIComponent(options.pList);
                this.client = options.pList.split("client=")[1].split("|")[0];
                if(options.pList.split('|').length >2)
                  this.productList = options.pList.split("|")[1].split('|')[0];
                else {
                  this.productList = options.pList.split("|")[1].split('&')[0];
                }
                this.itemList = options.pList.split("|")[2];
            } else {
              if(this.getClientId(historyFragment)){
                this.client = this.getClientId(historyFragment).split('|')[0]// || historyFragment.split("?")[1].split("client=")[1].split("&")[0] || null;
                this.productList = this.getClientId(historyFragment).split('|')[1];
                this.itemList = this.getClientId(historyFragment).split('|')[2];
              }
            }

            jQuery.get(_.getAbsoluteUrl('services/liningfabrics.ss')).done(function (data) {
              self.liningfabrics = data;
            });
            //ADD THE PRODUCT TYPE HERE SO WILL LOAD FASTER
            jQuery.get(_.getAbsoluteUrl('services/measurementdefaults.ss'),{producttype:options.options.product}).done(function (data) {
              self.measurementdefaults = data;
            });
            jQuery.get(_.getAbsoluteUrl('services/influences.ss'),{producttype:options.options.product}).done(function (data) {
              self.influences = data;
            });
            jQuery.get(_.getAbsoluteUrl('services/bodyBlockMeasurements.ss'),{producttype:options.options.product}).done(function (data) {
              window.bodyBlockMeasurements = data;
            });
            jQuery.get(_.getAbsoluteUrl('services/blockQuantity.ss'),{producttype:options.options.product}).done(function (data) {
              window.blockQuantity = data;
            });
            if (!this.model) {
                throw new Error('A model is needed');
            }
            jQuery(document).ready(function () {
                jQuery("[data-type='alert-placeholder']").empty();
            });
            this.itemfinalblockvalue = "";
        }
        , getClientId: function (fragment) {
            var fragmentArray = fragment.split("?");
            for (var i = fragmentArray.length - 1; i >= 0; i--) {
                if (fragmentArray[i].match('client')) {
                    return fragmentArray[i].split('client=')[1].split("&")[0];
                }
            };
        }
        // view.getBreadcrumb:
        // It will generate an array suitable to pass it to the breadcrumb macro
        // It looks in the productDetailsBreadcrumbFacets config object
        // This will be enhaced to use the categories once thats ready
        , getBreadcrumb: function () {
            var self = this
                , breadcrumb = []
                , translator = new FacetsTranslator(null, null, this.application.translatorConfig);
            _.each(this.application.getConfig('productDetailsBreadcrumbFacets'), function (product_details_breadcrumb_facet) {
                var value = self.model.get(product_details_breadcrumb_facet.facetId);

                if (value) {
                    translator = translator.cloneForFacetId(product_details_breadcrumb_facet.facetId, value);
                    breadcrumb.push({
                        href: translator.getUrl()
                        , text: product_details_breadcrumb_facet.translator ? _(product_details_breadcrumb_facet.translator).translate(value) : value
                    });
                }
            });

            return breadcrumb;
        }
        , roundOffFabricQuantity: function (e) {
            var rawValue = jQuery(e.target).val();

            rawValue = rawValue < 0 ? rawValue * -1 : rawValue;
            var roundedValue = this.model.get('custitem_clothing_type') === "&nbsp;" ? (Math.round(rawValue * 100) / 100).toFixed(0) + '' : (Math.round(rawValue * 20) / 20).toFixed(2) + '';
            jQuery(e.target).val(roundedValue);

        }
        // view.storeColapsiblesState:
        // Since this view is re-rendered every time you make a selection
        // we need to keep the state of the collapsable for the next render
        , storeColapsiblesState: function () {
            this.storeColapsiblesStateCalled = true;

            this.$('.collapse').each(function (index, element) {
                colapsibles_states[SC.Utils.getFullPathForElement(element)] = jQuery(element).hasClass('in');
            });
        }

        // view.resetColapsiblesState:
        // as we keep track of the state, we need to reset the 1st time we show a new item
        , resetColapsiblesState: function () {
            var self = this;
            _.each(colapsibles_states, function (is_in, element_selector) {
                self.$(element_selector)[is_in ? 'addClass' : 'removeClass']('in').css('height', is_in ? 'auto' : '0');
            });
        }

        // view.updateQuantity:
        // Updates the quantity of the model
        , updateQuantity: function (e) {
            var new_quantity = parseInt(jQuery(e.target).val(), 10)
                , current_quantity = this.model.get('custcol_fabric_quantity');

            new_quantity = (new_quantity > 0) ? new_quantity : current_quantity;

            jQuery(e.target).val(new_quantity);

            if (new_quantity !== current_quantity) {
                this.model.setOption('custcol_fabric_quantity', new_quantity);
                this.refreshInterface(e);
            }

            if (this.$containerModal) {
                // need to trigger an afterAppendView event here because, like in the PDP, we are really appending a new view for the new selected matrix child
                this.application.getLayout().trigger('afterAppendView', this);
            }
        }

        // don't want to trigger form submit when user presses enter when in the quantity input text
        , ignoreEnter: function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        // view.contentClick:
        // Keeps track of the clicks you have made onto the view, so the contentMouseUp
        // knows if it needs to trigger the click event once again
        , contentClick: function (e) {
            this.counted_clicks[e.pageX + '|' + e.pageY] = true;

            if (this.$containerModal) {
                e.stopPropagation();
            }
        }

        // view.contentMouseUp:
        // this is used just to register a delayed function to check if the click went through
        // if it didn't we fire the click once again on the top most element
        , contentMouseUp: function (e) {
            if (e.which !== 2 && e.which !== 3) {
                var self = this;
                _.delay(function () {
                    if (!self.counted_clicks[e.pageX + '|' + e.pageY]) {
                        jQuery(document.elementFromPoint(e.clientX, e.clientY)).click();
                    }

                    delete self.counted_clicks[e.pageX + '|' + e.pageY];

                }, 100);
            }
        }

        , closeModalManually: function (e) {
            e.preventDefault();
            jQuery(".modal.in").modal("hide");
        }

        , fabricChecked: function () {
            var status = true
                , self = this;
            if(jQuery('#chkItem:checked').length == 0){
                self.showError(_('You must tick the box under fabric availability to confirm that this fabric is currently in stock').translate());
                status = false;
            }
            return status;
        }
        , addArrMustSelectConflictCodes: function(arrErrConflictCodes){
          if(jQuery('#T010213').val() == 'T01021301'){
            if(jQuery('#T010214').val() != 'T01021401' ){
              arrErrConflictCodes.push("You must select No for ticket pocket flap size with this ticket pocket option");
            }
          }
          if(jQuery('#T010213').val() == 'T01021303'){
            if(jQuery('#T010214').val() != 'T01021401' ){
              arrErrConflictCodes.push("You must select No for ticket pocket flap size with this ticket pocket option");
            }
          }
          if(jQuery('#T010213').val() == 'T01021302'){
            if(jQuery('#T010214').val() != 'T01021401' ){
              arrErrConflictCodes.push("You must select No for ticket pocket flap size with this ticket pocket option");
            }
          }
          if(jQuery('#T010213').val() == 'T01021306'){
            if(jQuery('#T010214').val() != 'T01021401' ){
              arrErrConflictCodes.push("You must select No for ticket pocket flap size with this ticket pocket option");
            }
          }
          if(jQuery('#T010213').val() == 'T01021307'){
            if(jQuery('#T010214').val() != 'T01021401' ){
              arrErrConflictCodes.push("You must select No for ticket pocket flap size with this ticket pocket option");
            }
          }
          if(jQuery('#T010203').val() == 'T01020325'){
            if(jQuery('#T010202').val() != 'T01020204' ){
              arrErrConflictCodes.push("You can only select 1 button closure with 1 button bib shawl lapel");
            }
          }
          if(jQuery('#T010204').val() == 'T01020403'){
            if(jQuery('#T010231').val() != 'NA' ){
              arrErrConflictCodes.push("Only NA can be selected for lapel buttonhole color with No for lapel buttonhole");
            }
          }
          if(jQuery('#T011701').val() == 'T01170109'){
            if(jQuery('#T011702').val() != 'T01170203' ){
              arrErrConflictCodes.push("You must select U lapel with DB 6 Button w pointed bottom");
            }
          }
          if(jQuery('#T011701').val() == 'T01170108'){
            if(jQuery('#T011702').val() != 'T01170201' ){
              arrErrConflictCodes.push("You must select no for lapel with DB 6 Button w straight bottom");
            }
          }
          //if(jQuery('#T011701')[0]){
          if(jQuery('#T011701').val() == 'T01170110'){
            if(jQuery('#T011702').val() != 'T01170201' ){
              arrErrConflictCodes.push("You must select no for lapel with DB 4 Button w pointed bottom");
            }
          }
          //}
          //if(jQuery('#T010522')[0]){
        	  if(jQuery('#T010522').val() == 'T01052201'){
        		if(jQuery('#T010517').val() != 'T01051709' ){
        		  arrErrConflictCodes.push("You can only select heel tape monogram with plain hem with fabric heel tape bottom");
        		}
        	  }
        	//}
          //if(jQuery('#T027231')[0]){
        	  if(jQuery('#T027231').val() == 'T02723103'){
        		if(jQuery('#T027232').val() != 'No' ){
        		  arrErrConflictCodes.push("If you select no for pick stitching then you must select no for pick stitch color");
        		}
        	  }
        	//}
          //if(jQuery('#T010409')[0]){
        	  if(jQuery('#T010409').val() == 'T01040901'){
        		if(jQuery('#T010416').val() != 'No' ){
        		  arrErrConflictCodes.push("If you select no for pick stitching then you must select no for pick stitch color");
        		}
        	  }
        	//}
          //if(jQuery('#T010244')[0]){
        	  if(jQuery('#T010244').val() == 'T01024401'){
        		if(!jQuery('#T010239').val() && !jQuery('#T010250').val() && !jQuery('#T010261').val()){
        		  arrErrConflictCodes.push("Monogram Text Line 1 or Monogram Text Above Pocket is required when Monogram Inside Lining is Yes");
        		}
        		if(jQuery('#T010239').val() && jQuery('#T010250').val()){
        		  arrErrConflictCodes.push("Monogram Text Line 1 and Monogram Text Above Pocket cannot both have values");
        		}
            if(jQuery('#T010239').val() && jQuery('#T010261').val()){
        		  arrErrConflictCodes.push("You cannot select both Monogram Inside Lining and Monogram on Label");
        		}
        		if(jQuery('#T010223').val() != 'T01022301' && jQuery('#T010250').val()){
        		  arrErrConflictCodes.push("Interior Construction should be Curved French Facing when Monogram Text Above Pocket has text");
        		}
        	  }
        	//}
        	//if(jQuery('#T027229')[0]){
        	  if(jQuery('#T027229').val() == 'T02722902'){
        		if(jQuery('#T027230').val() != 'NA' ){
        		  arrErrConflictCodes.push("You must select No for interior pocket piping when you select No for interior pocket");
        		}
        	  }
        	//}
        	if(jQuery('#T027305').val() == 'T02730502'){
        	  if(jQuery('#T027303').val() != 'NA' ){
        		arrErrConflictCodes.push("You must selecte NA for button code when you select NA for waistband closure");
        	  }
        	}
        	if(jQuery('#T027415').val() == 'T02741507' || jQuery('#T027415').val() == 'T02741502' ||
        	  jQuery('#T027415').val() == 'T02741504' || jQuery('#T027415').val() == 'T02741506'){
        	  if(jQuery('#T027410').val() != 'No' ){
        		arrErrConflictCodes.push("You must select No for back pocket buttonhole color with this left back pocket selection");
        	  }
        	}
        	if(jQuery('#T027416').val() == 'T02741607' || jQuery('#T027416').val() == 'T02741602' ||
        	  jQuery('#T027416').val() == 'T02741604' || jQuery('#T027416').val() == 'T02741606'){
        	  if(jQuery('#T027410').val() != 'No' ){
        		arrErrConflictCodes.push("You must select No for back pocket buttonhole color with this right back pocket selection");
        	  }
        	}
        	if(jQuery('#T027412').val() == 'T02741201'){
        	  if(jQuery('#T027409').val() != 'No' ){
        		arrErrConflictCodes.push("You must select No for front buttonhole color with this waistband closure selection");
        	  }
        	}
        	if(jQuery('#T027420').val() == 'T02742001'){
        	  if(jQuery('#T027421').val() != 'No' ){
        		arrErrConflictCodes.push("You must select No for pick stitch color when you select No for pick stitching");
        	  }
        	}
        	if(jQuery('#T010603').val() == 'T01060333'){
        	  if(jQuery('#T010608').val() != 'T01060803' ){
        		arrErrConflictCodes.push("You must select No for collar stays with high button down II collar");
        	  }
        	}
        	if(jQuery('#T010603').val() == 'T01060335'){
        	  if(jQuery('#T010608').val() != 'T01060803' ){
        		arrErrConflictCodes.push("You must select No for collar stays with eyelet pinned collar");
        	  }
        	}
        	if(jQuery('#T010603').val() == 'T01060334'){
        	  if(jQuery('#T010646').val() != 'T01064603'){
        		arrErrConflictCodes.push("You must select No for collar edge contrast with medium spread with round edges collar");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060708'){
        		if(jQuery('#T010628').val() != 'No'){
        			arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Formal Front with Studs front placket");
        		}
        		if(jQuery('#T010629').val() != 'No'){
        			arrErrConflictCodes.push("You must select No for contrast buttons side placket with Formal Front with Studs front placket");
        		}
        	}
        	if(jQuery('#T010607').val() == 'T01060713'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Formal Front with Classic Placket & 4 Studs front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Formal Front with Classic Placket & 4 Studs front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Formal Front with Classic Placket & 4 Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060714'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Formal Fly Front front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Formal Fly Front front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Formal Fly Front front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060715'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Classic Placket with Studs front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Classic Placket with Studs front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Classic Placket with Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060716'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Narrow Placket with Studs front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Narrow Placket with Studs front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Narrow Placket with Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060717'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Classic Placket with 4 Studs front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Narrow Placket with Studs front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Classic Placket with 4 Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060718'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Narrow Placket with 4 Studs front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Narrow Placket with 4 Studs front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Narrow Placket with 4 Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060719'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Pop Over 3B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060720'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Pop Over 2B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060721'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Pop Over 1B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060722'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Pop Over 1B Square front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060723'){
        	  if(jQuery('#T010648').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for placket contrast piping with Pop Over 2B Square front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060715'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Classic Placket with Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060716'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Narrow Placket with Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060717'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Classic Placket with 4 Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060718'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Narrow Placket with 4 Studs front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060719'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Pop Over 3B Pointed front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Pop Over 3B Pointed front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Pop Over 3B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060720'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Pop Over 2B Pointed front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Pop Over 2B Pointed front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Pop Over 2B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060721'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Pop Over 1B Pointed front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Pop Over 1B Pointed front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Pop Over 1B Pointed front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060722'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Pop Over 1B Square front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Pop Over 1B Square front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Pop Over 1B Square front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060723'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with studs with Pop Over 2B Square front placket");
        	  }
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Pop Over 2B Square front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Pop Over 2B Square front placket");
        	  }
        	}
        	if(jQuery('#T010651').val() == 'T01065101'){
        	  if(jQuery('#T010642').val() != 'T01064201'){
        		arrErrConflictCodes.push("You must select NA for formal front with NA for formal pleats length");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060704'){
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with Fly Front front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Fly Front front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060703'){
        	  if(jQuery('#T010628').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttonhole side placket with No Placket front placket");
        	  }
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with No Placket front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060709'){
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Contrast Piping Both Sides 3.5CM front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060710'){
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Contrast Piping Right Side 3.5CM front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060711'){
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Contrast Piping Both Sides 2.5CM front placket");
        	  }
        	}
        	if(jQuery('#T010607').val() == 'T01060712'){
        	  if(jQuery('#T010629').val() != 'No'){
        		arrErrConflictCodes.push("You must select No for contrast buttons side placket with Contrast Piping Right Side 2.5CM front placket");
        	  }
        	}
          if(jQuery('#T010203').val() == 'T01020307'){
        	  if(jQuery('#T010202').val() != 'T01020204'){
        		arrErrConflictCodes.push("You can only select 1 button closure with shawl collar 5cm lapel");
        	  }
        	}
          if( jQuery('#T010401').val() == 'T01040101' ||
              jQuery('#T010401').val() == 'T01040102' ||
              jQuery('#T010401').val() == 'T01040103' ||
              jQuery('#T010401').val() == 'T01040104' ||
              jQuery('#T010401').val() == 'T01040105' ||
              jQuery('#T010401').val() == 'T01040106' ||
              jQuery('#T010401').val() == 'T01040107' ||
              jQuery('#T010401').val() == 'T01040108' ||
              jQuery('#T010401').val() == 'T01040109' ||
              jQuery('#T010401').val() == 'T01040110' ||
              jQuery('#T010401').val() == 'T01040111' ||
              jQuery('#T010401').val() == 'T01040112' ||
              jQuery('#T010401').val() == 'T01040113' ||
              jQuery('#T010401').val() == 'T01040114' ||
              jQuery('#T010401').val() == 'T01040115'){
        	  if(jQuery('#T010433').val() != 'NA'){
        		arrErrConflictCodes.push("You must select NA for zipper closure color unless you select zipper closure for lapel");
        	  }
        	}
        }
        // view.addToCart:
        // Updates the Cart to include the current model
        // also takes care of updateing the cart if the current model is a cart item
        , addToCart: function (e) {
            e.preventDefault();
            //console.log(this.model.attributes);
            //this.setCookie('tempCartItem',JSON.stringify(this.model.attributes),1);
            window.tempOptions = {};
            window.tempOptionsNotes = "";
            window.tempFitProfile = "";
            window.tempQuantity = "";
            window.tempFitProfileMessage = "";
            var hasSquareBottom = false;
            var arrSelectedValues = _.getArrAllSelectedOptions();
            var objSelectSelectedValues = _.getObjSelectSelectedValues();
            var objConflictCodeMapping = OBJ_CONFLICT;
            var arrErrConflictCodes = _.getArrConflictCodesError(objConflictCodeMapping, arrSelectedValues, objSelectSelectedValues);
            this.addArrMustSelectConflictCodes(arrErrConflictCodes);

            var clothingTypes = this.model.itemOptions.custcol_producttype.internalid;//this.model.get('custitem_clothing_type').split(', ');
            if(clothingTypes == '3-Piece-Suit'){
              //Check if the linings of the waistcoat and jacket are the same
              var waistcoatlining = jQuery('#li-bl-w').val();
              var jacketlining = jQuery('#li-b-j').val();
              if(waistcoatlining != jacketlining){
                arrErrConflictCodes.push("Jacket and Waistcoat Lining Fabric should be the same.");
              }else if(waistcoatlining == 'CMT Lining'){
                var jdesignOptions = this.getDesignOptions("Jacket");
                var wdesignOptions = this.getDesignOptions("Waistcoat");
                var jobj = _.find(jdesignOptions,function(x){return x.name == 'li-code';});
                var wobj = _.find(wdesignOptions,function(x){return x.name == 'li-code';});
                if(jobj.value != wobj.value){
                  arrErrConflictCodes.push("Jacket and Waistcoat Lining Fabric should be the same.");
                }
              }
            }
            if(clothingTypes == 'Shirt' || clothingTypes == 'Short-Sleeves-Shirt'){
                if( jQuery('#T010652').val() == "T01065203" ||
        						jQuery('#T010652').val() ==	"T01065204" ||
        						jQuery('#T010652').val() ==	"T01065205"){
                      hasSquareBottom = true;
                    }
            }
            var arrErrConflictCodesTotal = (!_.isNullOrEmpty(arrErrConflictCodes)) ? arrErrConflictCodes.length : 0;
            var hasConflictCodes = (arrErrConflictCodesTotal != 0) ? true : false;

            if (hasConflictCodes) {
                var modalTitleErrConflictCode = 'Selected Options Error';
                var modalContentErrConflictCode = _.getHtmlErrConflictCodes(arrErrConflictCodes);
                _.displayModalWindow(modalTitleErrConflictCode, modalContentErrConflictCode, true)
                return false;
            }
            var arrOptionsTextCodes = this.checkOtherOptionsRequirement();
            if(arrOptionsTextCodes.length > 0){
              _.displayModalWindow("Contrast Option Other Text Required", arrOptionsTextCodes, true)
              return false;
            }

            if(jQuery('#fabric_extra').val() == "Please Select" || jQuery('#fabric_extra').val() == ""){
              _.displayModalWindow("Fabric Quantity Design", "You must select a design under fabric quantity", true)
              return false;
            }

            if(this.model.pricenotset){
                _.displayModalWindow("Error on Item", ["There is an error with this item. Please re-submit as a CMT item"], true);
                return false;
            }

            if (this.model.isReadyForCart() && this.fabricChecked() && this.validateFitProfile() && this.validateCMT()) {
                var self = this
                    , cart = this.application.getCart()
                    , layout = this.application.getLayout()
                    , cart_promise
                    , error_message = _('Sorry, there is a problem with this Item and can not be purchased at this time. Please check back later.').translate()
                    , hasNoFitProfile = false;
                var fabricdetails = {
                  code:jQuery('#fabric-cmt-code').val(),
                  collection:jQuery('#fabric-cmt-collection').val(),
                  vendor:jQuery('#fabric-cmt-vendor').val()
                }

                self.model.setOption('custcol_othervendorname', jQuery('#fabric-cmt-othervendorname').val());

                self.model.setOption('custcol_custom_fabric_details', JSON.stringify(fabricdetails));
                self.model.setOption('custcol_vendorpicked', fabricdetails.vendor);
                var categories = _.where(self.model.get("facets"), { id: "category" })[0].values[0].values;
                //remove the line item that's being edited
                if (self.productList && self.productList.indexOf('item') > -1) {
                    var lineItem = cart.get("lines").get(self.productList);
                    if (lineItem) {
                        cart.removeLine(lineItem)
                    }
                }

                // update design option hidden fields
                if (this.model.get('custitem_clothing_type') && this.model.get('custitem_clothing_type') != "&nbsp;") {
                    clothingTypes = this.model.get('custitem_clothing_type').split(', ');

                    var selectedUnits = "CM";
                    _.each(clothingTypes, function (clothingType) {
                        var usedClothingType = clothingType;
                        if(clothingType == 'Ladies-Jacket')
                          clothingType = 'LadiesJacket';
                        else if(clothingType == 'Ladies-Skirt')
                          clothingType = 'LadiesSkirt';
                        else if(clothingType == 'Ladies-Pants')
                          clothingType = 'LadiesPants';
                        else if(clothingType == 'Short-Sleeves-Shirt')
                          clothingType = 'SSShirt';
                        //Design Option
                        var internalId = "custcol_designoptions_" + clothingType.toLowerCase();
                        var designOptions = self.getDesignOptions(usedClothingType);

                        self.model.setOption(internalId, JSON.stringify(designOptions));
                        //Fit Profile
                        var selectedProfile = jQuery('#profiles-options-' + usedClothingType).val()
                        if (selectedProfile) {
                            var fitColumn = "custcol_fitprofile_" + clothingType.toLowerCase();
                            var fitValue = window.currentFitProfile.profile_collection.get(selectedProfile).get('custrecord_fp_measure_value');

                            var fitProfileValue = JSON.parse(fitValue);
                            var fpvIN = JSON.parse(JSON.stringify(fitProfileValue));
                            if (fitProfileValue[0].value == 'Inches') {
                                _.each(fitProfileValue, function (value, key, obj) {

                                    if (obj[key].name === 'units') {
                                        obj[key].value = 'CM';
                                    }
                                    //Try parse if value is number
                                    if (!isNaN(obj[key].value)) {
                                        obj[key].value = (obj[key].value * 2.54).toFixed(2);
                                    }
                                });
                            }
                            if (fpvIN[0].value == 'CM') {
                                _.each(fpvIN, function (value, key, obj) {

                                    if (obj[key].name === 'units') {
                                        obj[key].value = 'Inches';
                                    }
                                    //Try parse if value is number
                                    if (!isNaN(obj[key].value)) {
                                        obj[key].value = (obj[key].value/2.54).toFixed(2);
                                    }
                                });
                            }
                            self.model.setOption(fitColumn+'_in', JSON.stringify(fpvIN));
                            self.model.setOption(fitColumn, JSON.stringify(fitProfileValue));
                        }
                    });

                    // Updates the quantity of the model

                    self.model.setOption('custcol_fabric_quantity', this.$('[name="custcol_fabric_quantity"]').val());
                    self.model.setOption('custcol_ps_cart_item_id', "ITEM_" + (Date.now() / 1000 | 0)); // creates timestamp

                    self.model.setOption('custcol_designoption_message', jQuery('#designoption-message').val());
                    self.model.setOption('custcol_fitprofile_message', jQuery('#fitprofile-message').val());
                    self.model.setOption('custcol_tailor_cust_pricing', self.$('span[itemprop="price"]').attr("data-rate") ? self.$('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00");
                    self.model.setOption('custcol_tailor_custom_discount',0);
                    self.model.setOption('custcol_tailor_client', self.client);

                    //self.model.setOption('custcol_itm_category_url', _.where(self.model.get("facets"), {id: "category"})[0].values[0].values[0].values[0].id.replace('Home/', ''));
                    self.model.setOption('custcol_itm_category_url', _.where(categories, { url: "Item Types" })[0].values[0].id.replace('Home/', ''));
                    var fitProfileSummary = []
                        , measureList = []
                        , measureType = ""
                        , currentFitProfile = window.currentFitProfile;


                    jQuery(".profiles-options").each(function (index) {
                        var $el = jQuery(this);
                        if ($el.find(":selected").text() != "Select a profile") {
                            measureList = currentFitProfile.profile_collection.models;
                            mid = "";
                            blockvalue = "";
                            _.each(measureList, function (lineItem) {
                                if (lineItem.get('internalid') == $el.find(":selected").val()) {
                                    measureType = lineItem.get("custrecord_fp_measure_type");
                                    mid = lineItem.get('internalid');
                                    blockvalue = lineItem.get('custrecord_fp_block_value');
                                }
                            });
                            fitProfileSummary.push({
                                'name': $el.attr('data-type'),
                                'value': $el.find(":selected").text(),
                                'type': measureType,
                                'id': mid,
                                'blockvalue': blockvalue
                            });
                        }else{
                          hasNoFitProfile = true;
                        }
                    });

                    self.model.setOption('custcol_fitprofile_summary', JSON.stringify(fitProfileSummary));
                } else {
                    if (this.model.get('itemtype') === "NonInvtPart") {
                        self.model.setOption('custcol_fabric_quantity', this.$('[name="custcol_fabric_quantity"]').val());
                    }
                    self.model.setOption('custcol_ps_cart_item_id', "ITEM_" + (Date.now() / 1000 | 0)); // creates timestamp
                    self.model.setOption('custcol_tailor_cust_pricing', self.$('span[itemprop="price"]').attr("data-rate") ? self.$('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00");
                    self.model.setOption('custcol_tailor_custom_discount',0);
                    self.model.setOption('custcol_tailor_client', self.client);
                    //self.model.setOption('custcol_itm_category_url', _.where(self.model.get("facets"), {id: "category"})[0].values[0].values[0].values[0].id.replace('Home/', ''));
                    self.model.setOption('custcol_itm_category_url', _.where(categories, { url: "Item Types" })[0].values[0].id.replace('Home/', ''));
                }

                if (this.model.itemOptions && this.model.itemOptions.GIFTCERTRECIPIENTEMAIL) {
                    if (!Backbone.Validation.patterns.email.test(this.model.itemOptions.GIFTCERTRECIPIENTEMAIL.label)) {
                        self.showError(_('Recipient email is invalid').translate());
                        return;
                    }
                }

                self.dateneeded = '1/1/1900';
                self.holdfabric = 'F';
                self.holdproduction = 'F';
                self.model.setOption('custcol_avt_date_needed', self.dateneeded);
                self.model.setOption('custcol_fabric_extra',jQuery('#fabric_extra option:selected').text());
                //self.model.setOption('custcol_order_list_line_item_total', '0.00'); //JHD-34
                //self.model.setOption('custcolcustcol_item_check','T');
                self.model.setOption('custcolcustcol_item_check', jQuery("#chkItem").is(':checked')?'T':'F');

                cart_promise = cart.addItem(this.model).success(function () {
                    if (cart.getLatestAddition()) {
                        layout.showCartConfirmation(hasNoFitProfile, hasSquareBottom);
                    }
                    else {
                        self.showError(error_message);
                        //Add a cookie here so we can retried the model
                    }
                });

                // Checks for rollback items.
                cart_promise.error(function (jqXhr) {
                    var error_details = null;
                    try {
                        var response = JSON.parse(jqXhr.responseText);
                        error_details = response.errorDetails;
                    } finally {
                        if (error_details && error_details.status === 'LINE_ROLLBACK') {
                            var new_line_id = error_details.newLineId;
                            self.model.cartItemId = new_line_id;
                        }

                        self.showError('We couldn\'t process your item');
                    }
                });

                // disalbes the btn while it's being saved then enables it back again
                if (e && e.target) {
                    var $target = jQuery(e.target).attr('disabled', true);

                    cart_promise.always(function () {
                        $target.attr('disabled', false);
                    });
                }
            }
        }
        , delete_cookie: function(name) {
          document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        , setCookie: function(cname, cvalue, exdays) {
          var d = new Date();
          d.setTime(d.getTime() + (exdays*24*60*60*1000));
          var expires = "expires="+ d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        , getCookie: function (cname) {
          var name = cname + "=";
          var decodedCookie = decodeURIComponent(document.cookie);
          var ca = decodedCookie.split(';');
          for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
              c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
              return c.substring(name.length, c.length);
            }
          }
          return "";
        }
        , checkOtherOptionsRequirement: function(){
          var self = this;
          var errorcodes = [];
          jQuery("[data-type='placeholder']").each(function () {
              var option = jQuery(this).data().placeholder;
              var mainoption = jQuery('#'+option);
              if(mainoption && mainoption.val() == 'Other' && !jQuery(this).val()){
                errorcodes.push("Please enter fabric code for " + option.attr("fieldname") + " ");
              }
          });
          return errorcodes;
        }
        , validateCMT: function(){
          var self = this;
          var clothingTypes = this.model.get('custitem_clothing_type').split(', ');
          var internalid = this.model.get('internalid');
          var error_message = "";
          if(internalid == '253776'){
            if(jQuery('#fabric-cmt-code').val() == "" || jQuery('#fabric-cmt-vendor').val() == '' || jQuery('#fabric-cmt-collection').val() == ''){
              error_message += 'CMT Vendor, Code and Collection is required for CMT item<br/>';
            }

            if(jQuery('#fabric-cmt-vendor').val() == '33' && !jQuery('#fabric-cmt-othervendorname').val()){
                error_message += 'You must enter a vendor name when Other is selected';
            }
          }
          if(clothingTypes.indexOf('Jacket')!=-1){
            if((jQuery('#design-option-Jacket #li-vnd').val() != 'Please select') || (jQuery('#design-option-Jacket #li-code').val() != '')){
              if(jQuery('#design-option-Jacket #li-qty').val() =="" || parseFloat(jQuery('#design-option-Jacket #li-qty').val())< 0.88){
                error_message += 'CMT Lining for Jacket has minimim quantity of 0.88.<br/>';
              }
            }
      			if(jQuery('#li-b-j').val() == 'CMT Lining'){
      				if((jQuery('#design-option-Jacket #li-vnd').val() == 'Please select') || (jQuery('#design-option-Jacket #li-code').val() == '') ||
      				jQuery('#design-option-Jacket #li-qty').val() == ""){
      					error_message += 'CMT Lining Vendor, Code and Quantity is required when Lining Fabric is CMT Lining<br/>';
      				}
      			}
          }
          if(clothingTypes.indexOf('Waistcoat')!=-1){
            if((jQuery('#design-option-Waistcoat #li-vnd').val() != 'Please select') || (jQuery('#design-option-Waistcoat #li-code').val() != '')){
              if(jQuery('#design-option-Waistcoat #li-qty').val() == "" || parseFloat(jQuery('#design-option-Waistcoat #li-qty').val()) < 0.84){
                error_message += 'CMT Lining for Waistcoat has minimum quantity of 0.84.<br/>';
              }
            }
      			if(jQuery('#li-bl-w').val() == 'CMT Lining'){
      				if((jQuery('#design-option-Waistcoat #li-vnd').val() == 'Please select') || (jQuery('#design-option-Waistcoat #li-code').val() == '') ||
      				jQuery('#design-option-Waistcoat #li-qty').val() == ""){
      					error_message += 'CMT Lining Vendor, Code and Quantity is required when Lining Fabric is CMT Lining<br/>';
      				}
      			}
          }
    		  if(clothingTypes.indexOf('Overcoat')!=-1){
      			if(jQuery('#li-bl-o').val() == 'CMT Lining'){
      				if((jQuery('#design-option-Overcoat #li-code').val() == '') ||
      				jQuery('#design-option-Overcoat #li-qty').val() == ""){
      					error_message += 'CMT Code and Quantity is required when Lining Fabric is CMT Lining<br/>';
      				}
      			}
          }
          if(error_message != "")
            self.showError(error_message);
          return error_message != ""? false:true;
        }
        , validateFitProfile: function () {
            var status = true
                , self = this;

            jQuery('.profiles-options').each(function () {
                if (jQuery(this).val() == "" && status) {
                    self.showError(_('Please Select a Fit Profile').translate());
                    status = false
                }
            });
            if(status){
              //"Jacket, Trouser, Waistcoat","Jacket","Overcoat","Shirt","Jacket, Trouser"
              switch (this.model.get('custitem_clothing_type')) {
                  case "Jacket, Trouser, Waistcoat":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 3.2) {
                          self.showError(_('Quantity should be greater than 3.2 for 3 Piece Suit').translate());
                          status = false;
                      }
                      var measureType = "";
                      //Check the fitprofile if they are all block or body
                      jQuery(".profiles-options").each(function (index) {
                          var $el = jQuery(this);
                          if ($el.find(":selected").text() != "Select a profile") {
                              var measureList = window.currentFitProfile.profile_collection.models;

                              _.each(measureList, function (lineItem) {
                                  if (lineItem.get('internalid') == $el.find(":selected").val()) {
                                      if(!measureType){
                                        measureType = lineItem.get("custrecord_fp_measure_type");
                                      }else if(measureType && measureType != lineItem.get("custrecord_fp_measure_type")){
                                        self.showError(_('Measurement Type should be the same for all products').translate());
                                        status = false;
                                      }
                                  }
                              });
                          }
                      });
                      break;
                  case "Jacket":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.7) {
                          self.showError(_('Quantity should be greater than 1.7 for Jacket').translate());
                          status = false;
                      }
                      break;
                  case "Trouser":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.4) {
                          self.showError(_('Quantity should be greater than 1.4 for Trouser').translate());
                          status = false;
                      }
                      break;
                  case "Waistcoat":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < .8) {
                          self.showError(_('Quantity should be greater than 0.8 for Waistcoat').translate());
                          status = false;
                      }
                      break;
                  case "Overcoat":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2.2) {
                          self.showError(_('Quantity should be greater than 2.2 for Overcoat').translate());
                          status = false;
                      }
                      break;
                  case "Shirt":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.6) {
                          self.showError(_('Quantity should be greater than 1.6 for Shirt').translate());
                          status = false;
                      }
                      break;
                  case "Trenchcoat":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2) {
                          self.showError(_('Quantity should be greater than 2 for Shirt').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Jacket":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.5) {
                          self.showError(_('Quantity should be greater than 1.5 for Ladies-Jacket').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Pants":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 1.45) {
                          self.showError(_('Quantity should be greater than 1.45 for Ladies-Pants').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Skirt":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < .75) {
                          self.showError(_('Quantity should be greater than 0.75 for Ladies-Skirt').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Jacket, Ladies-Pants, Ladies-Skirt":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 3.1) {
                          self.showError(_('Quantity should be greater than 3.1 for Ladies Jacket, Skirt and Pants').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Jacket, Ladies-Pants":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2.6) {
                          self.showError(_('Quantity should be greater than 2.6 for Ladies Jacket and Pants').translate());
                          status = false;
                      }
                      break;
                  case "Ladies-Jacket, Ladies-Skirt":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2.1) {
                          self.showError(_('Quantity should be greater than 2.1 for Ladies Jacket and Skirt').translate());
                          status = false;
                      }
                      break;
                  case "Jacket, Trouser":
                      if (parseFloat(jQuery('[name="custcol_fabric_quantity"]').val()) < 2.85) {
                          self.showError(_('Quantity should be greater than 2.85 for 2 Piece Suit').translate());
                          status = false;
                      }
                      var measureType = "";
                      //Check the fitprofile if they are all block or body
                      jQuery(".profiles-options").each(function (index) {
                          var $el = jQuery(this);
                          if ($el.find(":selected").text() != "Select a profile") {
                              var measureList = window.currentFitProfile.profile_collection.models;

                              _.each(measureList, function (lineItem) {
                                  if (lineItem.get('internalid') == $el.find(":selected").val()) {
                                      if(!measureType){
                                        measureType = lineItem.get("custrecord_fp_measure_type");
                                      }else if(measureType && measureType != lineItem.get("custrecord_fp_measure_type")){
                                        self.showError(_('Measurement Type should be the same for all products').translate());
                                        status = false;
                                      }
                                  }
                              });
                          }
                      });
                      break;
                  default:
              }
            }else{
              //Set this to true so it prevets the fitprofile requirement check
              status = true;
              //self.showError(_('Please note that you have not selected a fit profile(s)').translate());
              //_.displayModalWindow("Please note that you have not selected a fit profile(s)")

            }
            if (status) {
                self.hideError();
            }
            return status
        }

        , setCustomOptions: function () {
            var self = this;

            var categories = _.where(this.model.get("facets"), { id: "category" })[0].values[0].values;
            if (this.model.get('custitem_clothing_type') && this.model.get('custitem_clothing_type') != "&nbsp;") {
                var clothingTypes = this.model.get('custitem_clothing_type').split(', ');
                _.each(clothingTypes, function (clothingType) {
                  var usedClothingType = clothingType;
                  if(clothingType == 'Ladies-Jacket')
                    clothingType = 'LadiesJacket';
                  else if(clothingType == 'Ladies-Skirt')
                    clothingType = 'LadiesSkirt';
                  else if(clothingType == 'Ladies-Pants')
                    clothingType = 'LadiesPants';
                  else if(clothingType == 'Short-Sleeves-Shirt')
                    clothingType = 'SSShirt';
                    //Design Option
                    var internalId = "custcol_designoptions_" + clothingType.toLowerCase();
                    var designOptions = self.getDesignOptions(usedClothingType);
                    //var designOptions = self.getAvtDesignOptions(clothingType);

                    self.model.setOption(internalId, JSON.stringify(designOptions));
                    //Fit Profile
                    var selectedProfile = jQuery('#profiles-options-' + usedClothingType).val()
                    if (selectedProfile) {
                        var fitColumn = "custcol_fitprofile_" + clothingType.toLowerCase();
                        var fitValue = window.currentFitProfile.profile_collection.get(selectedProfile).get('custrecord_fp_measure_value');
                        self.model.setOption(fitColumn, fitValue);
                    }
                });

                self.model.setOption('custcol_fabric_quantity', this.$('[name="custcol_fabric_quantity"]').val());
                self.model.setOption('custcol_ps_cart_item_id', "ITEM_" + (Date.now() / 1000 | 0)); // creates timestamp

                self.model.setOption('custcol_designoption_message', jQuery('#designoption-message').val());
                self.model.setOption('custcol_fitprofile_message', jQuery('#fitprofile-message').val());
                self.model.setOption('custcol_tailor_cust_pricing', self.$('span[itemprop="price"]').attr("data-rate") ? self.$('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00");
                self.model.setOption('custcol_tailor_custom_discount',0);
                self.model.setOption('custcol_tailor_client', self.client);
                //self.model.setOption('custcol_itm_category_url', _.where(self.model.get("facets"), {id: "category"})[0].values[0].values[0].values[0].id.replace('Home/', ''));
                self.model.setOption('custcol_itm_category_url', _.where(categories, { url: "Item Types" })[0].values[0].id.replace('Home/', ''));

                var fitProfileSummary = [];
                jQuery(".profiles-options").each(function () {
                    var $el = jQuery(this);
                    if ($el.find(":selected").text() != "Select a profile") {
                        fitProfileSummary.push({
                            'name': $el.attr('data-type'),
                            'value': $el.find(":selected").text()
                        });
                    }
                });

                self.model.setOption('custcol_fitprofile_summary', JSON.stringify(fitProfileSummary));
            } else {
                self.model.setOption('custcol_tailor_cust_pricing', self.$('span[itemprop="price"]').attr("data-rate") ? self.$('span[itemprop="price"]').attr("data-rate").replace(",", "") : "0.00");
                self.model.setOption('custcol_tailor_custom_discount',0);
                self.model.setOption('custcol_tailor_client', self.client);
                //self.model.setOption('custcol_itm_category_url', _.where(self.model.get("facets"), {id: "category"})[0].values[0].values[0].values[0].id.replace('Home/', ''));
                self.model.setOption('custcol_itm_category_url', _.where(categories, { url: "Item Types" })[0].values[0].id.replace('Home/', ''));
            }


        }

        // view.refreshInterface
        // Computes and store the current state of the item and refresh the whole view, re-rendering the view at the end
        // This also updates the url, but it does not generates a hisrory point
        , refreshInterface: function () {
            var focused_element = this.$(':focus').get(0);

            this.focusedElement = focused_element ? SC.Utils.getFullPathForElement(focused_element) : null;

            if (!this.inModal) {
                Backbone.history.navigate(this.options.baseUrl + this.model.getQueryString(), { replace: true });
            }

            // TODO: Review nasty fix
            // When there are dropdown options that overlapse with the "Add to cart" button
            // when those options are clicked, the "Add to cart" button is also clicked.
            setTimeout(jQuery.proxy(this, 'showContent', { dontScroll: true }), 1);
        }

        // view.computeDetailsArea
        // this process what you have configured in itemDetails
        // executes the macro or reads the properties of the item
        , computeDetailsArea: function () {
            var self = this
                , details = [];

            _.each(this.application.getConfig('itemDetails', []), function (item_details) {
                var content = '';

                if (item_details.macro) {
                    content = SC.macros[item_details.macro](self);
                }
                else if (item_details.contentFromKey) {
                    content = self.model.get(item_details.contentFromKey);
                }

                if (jQuery.trim(content)) {
                    details.push({
                        name: item_details.name
                        , opened: item_details.opened
                        , content: content
                        , itemprop: item_details.itemprop
                    });
                }
            });

            this.details = details;
        }

        // view.showInModal:
        // Takes care of showing the pdp in a modal, and changes the template, doesn't trigger the
        // after events because those are triggered by showContent
        , showInModal: function (options) {
            this.template = 'quick_view';
            return this.application.getLayout().showInModal(this, options);
        }

        // Prepears the model and other internal properties before view.showContent
        , prepView: function () {
            this.title = this.model.get('_pageTitle');
            this.page_header = this.model.get('_pageHeader');
            var wherevendor = _.where(this.model.get("facets"), { id: "custitem_vendor_name" }),
              vendorName;
            if(wherevendor && wherevendor.length>0){
              if(wherevendor[0].values.length>0)
                vendorName = wherevendor[0].values[0].label;
            }


            this.computeDetailsArea();
        }

        , getMetaKeywords: function () {
            return this.model.get('_keywords');
        }

        , getMetaTags: function () {
            return jQuery('<head/>').html(
                jQuery.trim(
                    this.model.get('_metaTags')
                )
            ).children('meta');
        }

        , getMetaDescription: function () {
            return this.getMetaTags().filter('[name="description"]').attr('content') || '';
        }
        // view.renderOptions:
        // looks for options placeholders and inject the rendered options in them
        , renderOptions: function () {

            var self = this
                , model = this.model
                , posible_options = model.getPosibleOptions();

            // this allow you to render 1 particular option in a diferent placeholder than the data-type=all-options
            this.$('div[data-type="option"]').each(function (index, container) {
                var $container = jQuery(container).empty()
                    , option_id = $container.data('cart-option-id')
                    , macro = $container.data('macro') || '';

                $container.append(model.renderOptionSelector(option_id, macro));
            });

            // Will render all options with the macros they were configured
            this.$('div[data-type="all-options"]').each(function (index, container) {
                var $container = jQuery(container).empty()
                    , exclude = ($container.data('exclude-options') || '').split(',')
                    , result_html = '';

                if (model.get('_isGridy')) {
                    exclude.push(model.get('_horizontalGridOption').cartOptionId, model.get('_verticalGridOption').cartOptionId);
                }

                exclude = _.map(exclude, function (result) {
                    return jQuery.trim(result);
                });

                _.each(posible_options, function (posible_option, index) {
                    if (!_.contains(exclude, posible_option.cartOptionId)) {
                        result_html += model.renderOptionSelector(posible_option, null, index);
                    }
                });

                $container.append(result_html);
            });

            // this allow you to render 1 particular option in a diferent placeholder than the data-type=all-options
            this.$('div[data-type="grid-options"]').each(function (index, container) {
                var $container = jQuery(container).empty();

                $container.append(
                    model.renderOptionsGridSelector({
                        horizontal: model.get('_horizontalGridOption')
                        , vertical: model.get('_verticalGridOption')
                    }, $container.data('macro') || self.application.getConfig('macros.itemOptions.grid.default'))
                );
            });

        }

        // view.tabNavigationFix:
        // When you blur on an input field the whole page gets rendered,
        // so the function of hitting tab to navigate to the next input stops working
        // This solves that problem by storing a a ref to the current input
        , tabNavigationFix: function (e) {
            var self = this;
            this.hideError();

            // We need this timeout because sometimes a view is rendered several times and we don't want to loose the tabNavigation
            if (!this.tabNavigationTimeout) {
                // If the user is hitting tab we set tabNavigation to true, for any other event we turn ir off
                this.tabNavigation = e.type === 'keydown' && e.which === 9;
                this.tabNavigationUpsidedown = e.shiftKey;
                this.tabNavigationCurrent = SC.Utils.getFullPathForElement(e.target);
                if (this.tabNavigation) {
                    this.tabNavigationTimeout = setTimeout(function () {
                        self.tabNavigationTimeout = null;
                        this.tabNavigation = false;
                    }, 5);
                }
            }
        }
        ,
        recurring: function () {
            self = this;

            jQuery.ajax({
                url: window.location.origin+'/api/items?fieldset=relateditems_details&language=en&country=AU&currency=USD&pricelevel=1&c=3857857&n=2&id=42461'
            });
            setTimeout(function () {
                self.recurring();
            }, 1140000);
        }

        , showContent: function (options) {
            jQuery(document).ready(function () {
                jQuery("[data-type='alert-placeholder']").empty();
            });
            jQuery(document).ajaxComplete(function (event, request, settings) {
                jQuery("[data-type='alert-placeholder']").empty();
            });

            var self = this;
            window.tempQuantity = window.tempQuantity ? window.tempQuantity : 0;
            // Once the showContent has been called, this make sure that the state is preserved
            // REVIEW: the following code might change, showContent should recieve an options parameter
            this.application.getLayout().showContent(this, options && options.dontScroll).done(function (view) {

                jQuery("[data-type='alert-placeholder']").empty()

                var selectedItem = null;
                for (var x = 0; x < SC._applications.Shopping.getCart().get('lines').models.length; x++) {
                    var currentItem = SC._applications.Shopping.getCart().get('lines').models[x];
                    var currentInternalId = currentItem.get('internalid');
                    if (currentInternalId == SC._applications.Shopping.getLayout().currentView.productList) {
                        selectedItem = currentItem;
                    }
                }
                // set options to options placeholder
                var optionsHolder = {};
                if (selectedItem) {
                    var options = selectedItem.get('options');
                    for (var x = 0; x < options.length; x++) {
                        if (options[x].id == "CUSTCOL_FITPROFILE_MESSAGE") {
                            optionsHolder["CUSTCOL_FITPROFILE_MESSAGE"] = options[x];
                        }
                        else if (options[x].id == "CUSTCOL_FITPROFILE_SUMMARY") {
                            optionsHolder["CUSTCOL_FITPROFILE_SUMMARY"] = options[x];
                        }
                        else if (options[x].id == "CUSTCOL_FABRIC_QUANTITY") {
                            optionsHolder["CUSTCOL_FABRIC_QUANTITY"] = options[x];
                        }
                        else if (options[x].id == "CUSTCOL_DESIGNOPTION_MESSAGE") {
                            optionsHolder["CUSTCOL_DESIGNOPTION_MESSAGE"] = options[x];
                        }
                        else if (options[x].id == "CUSTCOL_TAILOR_CUST_PRICING") {
                            optionsHolder["CUSTCOL_TAILOR_CUST_PRICING"] = options[x];
                            jQuery('span[itemprop="price"]').attr("data-rate",options[x].value);
                        }
                        else if( options[x].id == 'CUSTCOLCUSTCOL_ITEM_CHECK'){
                          jQuery('#chkItem').prop('checked',options[x].value=='T'?true:false);
                        }
                        else if( options[x].id == 'CUSTCOL_FABRIC_EXTRA'){
                          optionsHolder['CUSTCOL_FABRIC_EXTRA'] = options[x];//jQuery("#fabric_extra option[name=" + options[x].value +"]").prop("selected",true) ;
                        }
                        else if( options[x].id == 'CUSTCOL_OTHERVENDORNAME'){
                          jQuery('#fabric-cmt-othervendorname').val(options[x].value);
                        }
                        else if( options[x].id == 'CUSTCOL_CUSTOM_FABRIC_DETAILS'){
                          if(options[x].value){
                            var fabdetails = JSON.parse(options[x].value);
                            jQuery('#fabric-cmt-vendor').val(fabdetails.vendor);
                            jQuery('#fabric-cmt-collection').val(fabdetails.collection);
                            jQuery('#fabric-cmt-code').val(fabdetails.code);
                            if(fabdetails.vendor == '33'){
                              jQuery('#fabric-cmt-othervendorname').parent().show();
                            }
                          }
                        }
                    }
                }
                var profileView = new FitProfileViews.ProfileSelector({
                    application: self.application
                    , model: new FitProfileModel(self.application.getUser().get("internalid"))
                    , types: self.model.get("custitem_clothing_type").split(",")
                });
                //Removed this because after initialize does not really do anything
                // profileView.model.on("afterInitialize", function () {
                    profileView.model.set('current_client', self.client);

                    // set fabic quantity
                    // if (selectedItem){
                    // 	jQuery("input#quantity").val(optionsHolder['CUSTCOL_FABRIC_QUANTITY'].value);
                    // }
                    // if from cart, use optionsholder value else window.tempQuantity
                    if (self.model.get("custitem_clothing_type") !== '&nbsp;' && self.model.get('itemtype') !== 'InvtPart') {
                        jQuery("input#quantity").val(selectedItem ? optionsHolder['CUSTCOL_FABRIC_QUANTITY'].value : window.tempQuantity);
                    }
                // });

                profileView.model.on("afterProfileFetch", function () {
                    profileView.render();
                    self.updateFitProfileDetails(profileView.$el);

                    // set fit profile values from cart if item is already in cart
                    if (SC._applications.Shopping.getLayout().currentView && SC._applications.Shopping.getLayout().currentView.productList) {
                        if (selectedItem && (self.model.get("custitem_clothing_type") !== '&nbsp;' && self.model.get('itemtype') !== 'InvtPart')) {
                            // set fit profiles
                            var fitProfileItems = JSON.parse(optionsHolder['CUSTCOL_FITPROFILE_SUMMARY'].value);
                            for (var x = 0; x < fitProfileItems.length; x++) {
                                var currentFitProfileItem = fitProfileItems[x];
                                jQuery("#profiles-options-" + currentFitProfileItem.name + " option").filter(function () {
                                    return this.text.replace(/\+/g, ' ').replace(/ /g, '') == currentFitProfileItem.value.replace(/\+/g, ' ').replace(/ /g, '');
                                }).attr('selected', true);
                                jQuery("#profiles-options-" + currentFitProfileItem.name).trigger("change");
                            }

                            // set fit profile notes
                            if (optionsHolder['CUSTCOL_FITPROFILE_MESSAGE']) {
                                jQuery("textarea#fitprofile-message").html(optionsHolder['CUSTCOL_FITPROFILE_MESSAGE'].value);
                            }

                            // set display options notes
                            if (optionsHolder['CUSTCOL_DESIGNOPTION_MESSAGE']) {
                                jQuery("textarea#designoption-message").html(optionsHolder['CUSTCOL_DESIGNOPTION_MESSAGE'].value);
                            }
                            if(optionsHolder['CUSTCOL_FABRIC_EXTRA']){
                              jQuery("#fabric_extra option[name='" + optionsHolder['CUSTCOL_FABRIC_EXTRA'].value +"']").prop("selected",true) ;
                            }
                        } else { }
                    } else {
                        // set fit profile based on window.tempFitProfile if it has value stored
                        if (window.tempFitProfile && window.tempFitProfile.length > 0) {
                            for (var i = window.tempFitProfile.length - 1; i >= 0; i--) {
                                jQuery("#profiles-options-" + window.tempFitProfile[i].name + " option").filter(function () {
                                    return this.value == window.tempFitProfile[i].value;
                                }).attr('selected', true);
                                jQuery("#profiles-options-" + window.tempFitProfile.name).trigger("change");
                            };
                        }
                        // set fit profile notes based on window.tempFitProfileMessage if it has value stored
                        if (window.tempFitProfileMessage) {
                            jQuery("textarea#fitprofile-message").html(window.tempFitProfileMessage);
                        }
                    }
                });

                self.afterAppend();

                // related items
                var related_items_placeholder = view.$('[data-type="related-items-placeholder"]');
                // check if there is a related items placeholders
                if (related_items_placeholder.size() > 0) {
                    this.application.showRelatedItems && this.application.showRelatedItems(view.model.get('internalid'), related_items_placeholder);
                }

                // correlated items
                var correlated_items_placeholder = view.$('[data-type="correlated-items-placeholder"]');
                // check if there is a related items placeholders
                if (correlated_items_placeholder.size() > 0) {
                    this.application.showCorrelatedItems && this.application.showCorrelatedItems(view.model.get('internalid'), correlated_items_placeholder);
                }

                // product list place holder.
                var product_lists_placeholder = view.$('[data-type="product-lists-control"]');

                if (product_lists_placeholder.size() > 0) {
                    this.application.ProductListModule.renderProductLists(view);
                }

                setTimeout(function () {
                    window.tempOptions = new Object();
                    var values = new Object();
                    var clothingTypes = self.model.get("custitem_clothing_type").split(', ');
                    _.each(clothingTypes, function (clothingType, index) {
                        var designOptions = self.getDesignOptions(clothingType);
                        _.each(designOptions, function (option) {
                            values[option.name] = option.value
                        })
                    });
                    window.tempOptions = values;
                    window.tempQuantity = jQuery("input#quantity").val();
                    window.tempFitProfileMessage = jQuery("textarea#fitprofile-message").html();
                    window.tempOptionsNotes = jQuery("textarea#designoption-message").html();
                }, 1000);

            });
            this.application.on('profileRefresh', function () {
              //Prevent Buttons from being shown. because it break links
              jQuery('[id*="profile-actions"]').html("");
              if(self.cid == SC._applications.Shopping.getLayout().currentView.cid){
                var profileView = new FitProfileViews.ProfileSelector({
                    application: self.application
                    , model: new FitProfileModel(self.application.getUser().get("internalid"))
                    , types: self.model.get("custitem_clothing_type").split(",")
                });

                //Removed this because after initialize does not really do anything
                // profileView.model.on("afterInitialize", function () {
                    profileView.model.set('current_client', self.client);
                // });

                profileView.model.on("afterProfileFetch", function () {
                    profileView.render();
                    self.updateFitProfileDetails(profileView.$el);
                    //Hack on setting the profile
                    if (window.tempFitProfile) {
                        //What is the item??
                        var item = self.model.itemOptions.custcol_producttype.internalid;
                        var qty = 0;
                        for (var i = 0; i < window.tempFitProfile.length; i++) {

                            var profileID = window.tempFitProfile[i].value;
                            jQuery('#profiles-options-' + window.tempFitProfile[i].name).val(window.tempFitProfile[i].value);
                            if (window.tempFitProfile[i].value){
                                jQuery("#profile-actions-" + window.tempFitProfile[i].name).html("<a data-backdrop='static' data-keyboard='false' data-toggle='show-in-modal' href='/fitprofile/new'>Add</a> | <a data-backdrop='static' data-keyboard='false' data-toggle='show-in-modal' href='/fitprofile/" + profileID + "'>Edit</a> | <a data-action='remove-rec' data-type='profile' data-id='" + profileID + "'>Remove</a>");
                                //Update Quantity when Profile Refreshes, during add edit and delete....What if the item was already on cart
                                if(window.tempFitProfile[i].block){
                                    var bq = _.find(window.blockQuantity,function(q){
                                      return q.custrecord_bqm_producttext == item && q.custrecord_bqm_block == window.tempFitProfile[i].block;
                                    })
                                    if(bq){
                                      if(qty < parseFloat(bq.custrecord_bqm_quantity))
                                        qty = parseFloat(bq.custrecord_bqm_quantity);
                                    }
                                }
                            }
                            else{
                                jQuery("#profile-actions-" + window.tempFitProfile[i].name).html("<a data-backdrop='static' data-keyboard='false' data-toggle='show-in-modal' href='/fitprofile/new'>Add</a>");
                            }
                        }
                        var extra = 0;
                        if(jQuery('#fabric_extra').val() != "" && jQuery('#fabric_extra').val() != "Please Select")
                          extra = parseFloat(jQuery('#fabric_extra').val())
                        for (var i = 0; i < window.tempFitProfile.length; i++) {
                          var ptype = window.tempFitProfile[i].name;
                          var designQuantityCodes = _.find(window.extraQuantity[0].values,function(temp){
                            return temp.code == ptype;
                          });
                          if(designQuantityCodes){
                          _.each(jQuery('[data-type="fav-option-customization"]'),function(temp){
                            var val = _.find(designQuantityCodes.design,function(temp2){
                              return temp2.code == temp.value
                            });
                            if(val && val.value != "")
                              extra+= parseFloat(val.value);

                          });
                          }
                        }
                        jQuery('[name="custcol_fabric_quantity"]').val((qty + extra).toFixed(2));
                    }
                });
                self.showHideGroupedOptions();
              }
            });

        }
        , updateFitProfileDetails: function ($el) {

            // retain old values before updating HTML
            var oldValues = [];
            jQuery("#fitprofile-details select.profiles-options").each(function (index) {
                oldValues[index] = jQuery(this).val();
            });

            jQuery("#fitprofile-details").html($el);

            // re-set previous values into HTML
            jQuery("#fitprofile-details select.profiles-options").each(function (index) {
                jQuery(this).val(oldValues[index]);
            });
        }
        , afterAppend: function () {

            //jQuery("[data-type='alert-placeholder']").empty()
            this.renderOptions();
            this.focusedElement && this.$(this.focusedElement).focus();

            if (this.tabNavigation) {
                var current_index = this.$(':input').index(this.$(this.tabNavigationCurrent).get(0))
                    , next_index = this.tabNavigationUpsidedown ? current_index - 1 : current_index + 1;

                this.$(':input:eq(' + next_index + ')').focus();
            }

            this.storeColapsiblesStateCalled ? this.resetColapsiblesState() : this.storeColapsiblesState();
            this.application.getUser().addHistoryItem && this.application.getUser().addHistoryItem(this.model);

            if (this.inModal) {
                var $link_to_fix = this.$el.find('[data-name="view-full-details"]');
                $link_to_fix.mousedown();
                $link_to_fix.attr('href', $link_to_fix.attr('href') + this.model.getQueryString());
            }

        }

        // view.setOption:
        // When a selection is change, this computes the state of the item to then refresh the interface.
        , setOption: function (e) {

            var self = this
                , $target = jQuery(e.target)
                , value = $target.val() || $target.data('value') || null
                , cart_option_id = $target.closest('[data-type="option"]').data('cart-option-id');
            // prevent from going away
            e.preventDefault();

            // if option is selected, remove the value
            if ($target.data('active')) {
                value = null;
            }

            // it will fail if the option is invalid
            try {
                this.model.setOption(cart_option_id, value);
            }
            catch (error) {
                // Clears all matrix options
                _.each(this.model.getPosibleOptions(), function (option) {
                    option.isMatrixDimension && self.model.setOption(option.cartOptionId, null);
                });

                // Sets the value once again
                this.model.setOption(cart_option_id, value);
            }

            this.refreshInterface(e);

            // need to trigger an afterAppendView event here because, like in the PDP, we are really appending a new view for the new selected matrix child
            if (this.$containerModal) {
                this.application.getLayout().trigger('afterAppendView', this);
            }
        }
        , getDesignOptions: function (clothingType) {
            if (clothingType !== '&nbsp;') {
                var designOptionsList = [];
                jQuery("div#design-option-" + clothingType + "").find(":input").each(function () {
                    if(jQuery(this).data().type == 'placeholder'){
                      var option = jQuery(this).data().placeholder;
                      if(option && jQuery('#'+option).val() == 'Other'){
                        var currentDesignOptions = {
                            'name': jQuery(this).attr("id"),
                            'value': jQuery(this).val()
                        };
                        designOptionsList.push(currentDesignOptions);
                      }
                    }
                    else{
                      var currentDesignOptions = {
                          'name': jQuery(this).attr("id"),
                          'value': jQuery(this).val()
                      };
                      designOptionsList.push(currentDesignOptions);
                    }
                });
            }
            return designOptionsList;
        }

        , getAvtDesignOptions: function (clothingType) {
            var $ = jQuery;
            var arrObjDesignOptionsList = [];

            return arrObjDesignOptionsList;
        }

        , propertyValueChange: function (e) {
            e.preventDefault();
            var key = jQuery(e.target).val() + "|" + jQuery(e.target).attr("fieldname")
                , keyParent = jQuery(e.target).attr('id')
                , application = this.application
                , self = this;

            jQuery('#more-info_' + keyParent).html(SC.macros.displayMoreInfo(key));

            window.tempOptions = new Object();
            var values = new Object();
            var clothingTypes = this.model.get('custitem_clothing_type').split(', ');
            _.each(clothingTypes, function (clothingType, index) {
                var designOptions = self.getDesignOptions(clothingType);
                //var designOptions = self.getAvtDesignOptions(clothingType);
                _.each(designOptions, function (option) {
                    values[option.name] = option.value
                })
            });
            window.tempOptions = values;
            var r = new RegExp(/^[TR]{2}\d{3}($|-+\w*)|^[TRR]{3}\d{3}($|-+\w*)|^[TRD]{3}\d{2}($|-+\w*)/);

            if(jQuery(e.target).attr("id") == 'li-b-j' || jQuery(e.target).attr("id") == 'T010227' ||
            jQuery(e.target).attr("id") == 'li-bl-w' || jQuery(e.target).attr("id") == 'li-bl-o' || jQuery(e.target).attr("id") == 'T010415' ){
              if(r.test(jQuery(e.target).val())){
                var found = _.find(this.liningfabrics,function(d){
                  return d.custrecord_flf_ftcode == jQuery(e.target).val();
                  });
                if(!found || found.custrecord_flf_ftstatustext == "Out of Stock" || found.custrecord_flf_ftstatustext == "Soldout" || found.custrecord_flf_ftstatustext == "Temp Soldout"){
                  jQuery(e.target).nextAll('#liningstatusimage').html('<img title="Out of Stock" src="https://store1.jeromeclothiers.com/c.3857857/shopflow/img/red.png"/>')
                }else{
                  jQuery(e.target).nextAll('#liningstatusimage').html('<img title="Available" src="https://store1.jeromeclothiers.com/c.3857857/shopflow/img/green.png"/>')
                }
              }else{
                jQuery(e.target).nextAll('#liningstatusimage').html('');
              }
            }

            this.application.trigger('profileRefresh');
        }
        , showHideGroupedOptions: function(){
            if(jQuery('#T010622').val() == "Other"){
              jQuery('#T010622_other').parent().parent().show();
            }else{
              jQuery('#T010622_other').parent().parent().hide();
            }
            if(jQuery('#T010623').val() == "Other"){
              jQuery('#T010623_other').parent().parent().show();
            }else{
              jQuery('#T010623_other').parent().parent().hide();
            }
            if(jQuery('#T010624').val() == "Other"){
              jQuery('#T010624_other').parent().parent().show();
            }else{
              jQuery('#T010624_other').parent().parent().hide();
            }
            if(jQuery('#T010625').val() == "Other"){
              jQuery('#T010625_other').parent().parent().show();
            }else{
              jQuery('#T010625_other').parent().parent().hide();
            }
            if(jQuery('#T010626').val() == "Other"){
              jQuery('#T010626_other').parent().parent().show();
            }else{
              jQuery('#T010626_other').parent().parent().hide();
            }
            if(jQuery('#T010627').val() == "Other"){
              jQuery('#T010627_other').parent().parent().show();
            }else{
              jQuery('#T010627_other').parent().parent().hide();
            }
            if(jQuery('#T010628').val() == "Other"){
              jQuery('#T010628_other').parent().parent().show();
            }else{
              jQuery('#T010628_other').parent().parent().hide();
            }
            if(jQuery('#T010629').val() == "Other"){
              jQuery('#T010629_other').parent().parent().show();
            }else{
              jQuery('#T010629_other').parent().parent().hide();
            }
            if(jQuery('#T010630').val() == "Other"){
              jQuery('#T010630_other').parent().parent().show();
            }else{
              jQuery('#T010630_other').parent().parent().hide();
            }
            if(jQuery('#T010631').val() == "Other"){
              jQuery('#T010631_other').parent().parent().show();
            }else{
              jQuery('#T010631_other').parent().parent().hide();
            }
            if(jQuery('#T010632').val() == "Other"){
              jQuery('#T010632_other').parent().parent().show();
            }else{
              jQuery('#T010632_other').parent().parent().hide();
            }

            if(jQuery('#T010257').val() == "T01025702"){
              jQuery('#T010258').parent().parent().hide();
              jQuery('#T010258').val('');
              jQuery('#T010259').parent().parent().hide();
              jQuery('#T010259').val('NA');
            }else{
              jQuery('#T010258').parent().parent().show();
              jQuery('#T010259').parent().parent().show();
            }
            if(jQuery('#T010643').val() == "T01064302"){
              jQuery('#T010644').parent().parent().hide();
              jQuery('#T010644').val('');
              jQuery('#T010645').parent().parent().hide();
              jQuery('#T010645').val('');
            }else{
              jQuery('#T010644').parent().parent().show();
              jQuery('#T010645').parent().parent().show();
            }
          // if(jQuery(e.target).attr("id") == 'T010243'){
            if(jQuery('#T010243').val() == 'T01024302'){
              //hide stuff
              jQuery('#T010235').parent().parent().hide();
              jQuery('#T010235').val('NA');
              jQuery('#T010236').parent().parent().hide();
              jQuery('#T010236').val('NA');
              jQuery('#T010238').parent().parent().hide();
              jQuery('#T010238').val('');
            }
            else{
              //show
              jQuery('#T010235').parent().parent().show();
              jQuery('#T010236').parent().parent().show();
              jQuery('#T010238').parent().parent().show();
            }
          // }
          // else if(jQuery(e.target).attr("id") == 'T010244'){
            if(jQuery('#T010244').val() == 'T01024402'){
              //hide stuff
              jQuery('#T010245').parent().parent().hide();
              jQuery('#T010245').val('NA');
              jQuery('#T010237').parent().parent().hide();
              jQuery('#T010237').val('NA');
              jQuery('#T010239').parent().parent().hide();
              jQuery('#T010239').val('');
              jQuery('#T010240').parent().parent().hide();
              jQuery('#T010240').val('');
              jQuery('#T010250').parent().parent().hide();
              jQuery('#T010250').val('');
              jQuery('#T010261').parent().parent().hide();
              jQuery('#T010261').val('');
            }
            else{
              //show
              jQuery('#T010245').parent().parent().show();
              jQuery('#T010237').parent().parent().show();
              jQuery('#T010239').parent().parent().show();
              jQuery('#T010240').parent().parent().show();
              jQuery('#T010250').parent().parent().show();
              jQuery('#T010261').parent().parent().show();
            }
          // }
          // else if(jQuery(e.target).attr("id") == 'T010522'){
            if(jQuery('#T010522').val() == 'T01052202'){
              //hide stuff
              jQuery('#T010523').parent().parent().hide();
              jQuery('#T010523').val('NA');
              jQuery('#T010524').parent().parent().hide();
              jQuery('#T010524').val('NA');
              jQuery('#T010525').parent().parent().hide();
              jQuery('#T010525').val('');
            }
            else{
              //show
              jQuery('#T010523').parent().parent().show();
              jQuery('#T010524').parent().parent().show();
              jQuery('#T010525').parent().parent().show();
            }
          // }
          // else if(jQuery(e.target).attr("id") == 'T010419'){
            if(jQuery('#T010419').val() == 'T01041902'){
              //hide stuff
              jQuery('#T010420').parent().parent().hide();
              jQuery('#T010420').val('NA');
              jQuery('#T010421').parent().parent().hide();
              jQuery('#T010421').val('NA');
              jQuery('#T010422').parent().parent().hide();
              jQuery('#T010422').val('');
            }
            else{
              //show
              jQuery('#T010420').parent().parent().show();
              jQuery('#T010421').parent().parent().show();
              jQuery('#T010422').parent().parent().show();
            }
          // }
          // else if(jQuery(e.target).attr("id") == 'T010423'){
            if(jQuery('#T010423').val() == 'T01042302'){
              //hide stuff
              jQuery('#T010424').parent().parent().hide();
              jQuery('#T010424').val('NA');
              jQuery('#T010425').parent().parent().hide();
              jQuery('#T010425').val('NA');
              jQuery('#T010426').parent().parent().hide();
              jQuery('#T010426').val('NA');
              jQuery('#T010427').parent().parent().hide();
              jQuery('#T010427').val('');
              jQuery('#T010428').parent().parent().hide();
              jQuery('#T010428').val('');
            }
            else{
              //show
              jQuery('#T010424').parent().parent().show();
              jQuery('#T010425').parent().parent().show();
              jQuery('#T010426').parent().parent().show();
              jQuery('#T010427').parent().parent().show();
              jQuery('#T010428').parent().parent().show();
            }
          // }
          // else if(jQuery(e.target).attr("id") == 'T010633'){
            if(jQuery('#T010633').val() == 'T01063302'){
              //hide stuff
              jQuery('#T010634').parent().parent().hide();
              jQuery('#T010634').val('');
              jQuery('#T010635').parent().parent().hide();
              jQuery('#T010635').val('NA');
              jQuery('#T010636').parent().parent().hide();
              jQuery('#T010636').val('NA');
              jQuery('#T010637').parent().parent().hide();
              jQuery('#T010637').val('NA');
              jQuery('#T010638').parent().parent().hide();
              jQuery('#T010638').val('NA');
            }
            else{
              //show
              jQuery('#T010634').parent().parent().show();
              jQuery('#T010635').parent().parent().show();
              jQuery('#T010636').parent().parent().show();
              jQuery('#T010637').parent().parent().show();
              jQuery('#T010638').parent().parent().show();
            }
          // }
        }
        , designOptionMessageChange: function (e) {
            window.tempOptionsNotes = jQuery("#designoption-message").val();
        }
        , lookupBlockValue: function(id, ptype){

          if(!window.currentFitProfile.profile_collection) return 0;
          var pModel = window.currentFitProfile.profile_collection.get(id);
    			if(pModel.get('custrecord_fp_measure_type') == 'Block'){
            var bvalue;
            if(pModel.get('custrecord_fp_block_value'))
              bvalue = pModel.get('custrecord_fp_block_value')
            else {
              var mValue = JSON.parse(pModel.get('custrecord_fp_measure_value'));
              var mObj = mValue.find(function (e){return e.name == 'block';})
              bvalue = mObj.value;
            }
    				return bvalue;
    			}else{
    				//Should be a body
    				//3:Jacket, 4:Trouser, 6:Waistcoat, 7:Shirt, 8:Overcoat
            var result;
    				switch(ptype){
    					case 'Jacket':
    					case 'Shirt':
    					case 'Overcoat':
              case 'Short-Sleeves-Shirt':
    						var partvalue = 0, partmeasure = 0;
                var mValue = JSON.parse(pModel.get('custrecord_fp_measure_value'));
                var mUnits = mValue.find(function (e){return e.name == 'units';})
                var a = _.filter(mValue,function(m){
      						return m.name == "Waist" || m.name == "allowance-Waist" || m.name == "waist" || m.name == "allowance-waist";
      					});
                for(var i=0;i<a.length;i++){
      						partvalue += parseFloat(a[i].value);
      					}

    						if(partvalue)
    						partmeasure = mUnits.value == 'CM'?partvalue:parseFloat(partvalue)*2.54;
                partmeasure = parseFloat(partmeasure)/2;
    						var filtered = _.filter(window.bodyBlockMeasurements,function(data){
    						    return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partmeasure) && data.custrecord_bbm_producttypetext == ptype;
    						})
                if(filtered && filtered.length>0){
      						result = filtered.reduce(function(prev, curr){
      				        return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      				    });
                }else{
                  var filtered = _.filter(window.bodyBlockMeasurements,function(data){
      						    return data.custrecord_bbm_producttypetext == ptype;
      						});
                  result = filtered.reduce(function(prev, curr){
      				        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      				    });
                }
    						break;
    					case 'Waistcoat':
                var partvalue = 0, partmeasure = 0;
                var mValue = JSON.parse(pModel.get('custrecord_fp_measure_value'));
                var mUnits = mValue.find(function (e){return e.name == 'units';})
                var a = _.filter(mValue,function(m){
                  return m.name == "Waist" || m.name == "allowance-Waist" || m.name == "waist" || m.name == "allowance-waist";
                });
                for(var i=0;i<a.length;i++){
                  partvalue += parseFloat(a[i].value);
                }
    						if(partvalue)
    						partmeasure = jQuery('[name="units"]').val() == 'CM'?partvalue:parseFloat(partvalue)*2.54;
    						partmeasure = parseFloat(partmeasure)/2
    						var filtered = _.filter(window.bodyBlockMeasurements,function(data){
    						return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partmeasure) && data.custrecord_bbm_producttypetext == ptype;
    						})
    						if(filtered && filtered.length>0){
      						result = filtered.reduce(function(prev, curr){
      								return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      						});
                }else{
                  var filtered = _.filter(window.bodyBlockMeasurements,function(data){
      						    return data.custrecord_bbm_producttypetext == ptype;
      						});
                  result = filtered.reduce(function(prev, curr){
      				        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      				    });
                }
    						break;
    					case 'Trouser':
                var partvalue = 0, partmeasure = 0;
                var mValue = JSON.parse(pModel.get('custrecord_fp_measure_value'));
                var mUnits = mValue.find(function (e){return e.name == 'units';})
                var a = _.filter(mValue,function(m){
                  return m.name == "seat" || m.name == "allowance-seat";
                });
                for(var i=0;i<a.length;i++){
                  partvalue += parseFloat(a[i].value);
                }
                if(partvalue)
                partmeasure = mUnits.value == 'CM'?partvalue:parseFloat(partvalue)*2.54;
                partmeasure = parseFloat(partmeasure)/2;
    						var filtered = _.filter(window.bodyBlockMeasurements,function(data){
    						return parseFloat(data.custrecord_bbm_bodymeasurement) >= parseFloat(partmeasure) && data.custrecord_bbm_producttypetext == ptype;
    						})
                if(filtered && filtered.length>0){
      						result = filtered.reduce(function(prev, curr){
      								return parseFloat(prev['custrecord_bbm_bodymeasurement']) < parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      						});
                }else{
                  var filtered = _.filter(window.bodyBlockMeasurements,function(data){
      						    return data.custrecord_bbm_producttypetext == ptype;
      						});
                  result = filtered.reduce(function(prev, curr){
      				        return parseFloat(prev['custrecord_bbm_bodymeasurement']) > parseFloat(curr['custrecord_bbm_bodymeasurement']) ? prev : curr;
      				    });
                }
    						break;
    					default:
    				}
    				return result?result.custrecord_bbm_block:0;
    			}
    		}
        , fitProfileChange: function (e) {
          var productTypeValue = jQuery(e.target).data().type;

          if (!window.tempFitProfile) {
            window.tempFitProfile = new Array();
            for (var i = jQuery('#fitprofile-details select.profiles-options').length - 1; i >= 0; i--) {
                var elem = jQuery('#fitprofile-details select.profiles-options')[i];
                var type = jQuery(elem).attr('data-type');
                var bvalue;
                if(productTypeValue == type && jQuery(elem).val()){
                  bvalue = this.lookupBlockValue(jQuery(e.target).val(),productTypeValue);
                  window.tempFitProfile.push({ name: type, value: jQuery(elem).val(), block:bvalue });
                }
                else
                window.tempFitProfile.push({ name: type, value: jQuery(elem).val() });
                //Update quantity when profile is changed
            };
          }
          else{
            for (var i = 0; i < window.tempFitProfile.length; i++) {
              if (window.tempFitProfile[i].name == productTypeValue){
                var bvalue;
                window.tempFitProfile[i].value = jQuery(e.target).val();
                if(jQuery(e.target).val()){
                  bvalue = this.lookupBlockValue(jQuery(e.target).val(),productTypeValue);
                  window.tempFitProfile[i].block = bvalue;
                }
              }
            }
          }
          this.application.trigger('profileRefresh');
        }
        , quantityChange: function (e) {
            window.tempQuantity = jQuery(e.target).val();
        }
        , fabricVendorChange: function(e){
          if(jQuery(e.target).val() == '33'){
            jQuery('#fabric-cmt-othervendorname').parent().show();
          }else{
            jQuery('#fabric-cmt-othervendorname').parent().hide();
          }
        }
        , fitProfileMessageChange: function (e) {
            window.tempFitProfileMessage = jQuery(e.target).val();
        }
        , scrolltodesignoption: function (e) {

            if(jQuery('[data-holder="design-option-parent"] > .accordion-group > .in').length>0){
              jQuery('html,body').animate({
                  scrollTop: jQuery('[data-holder="design-option-parent"] > .accordion-group > .in').parent().parent().offset().top
              }, 500);
              jQuery('[data-holder="design-option-parent"] > .accordion-group > .in').collapse('hide');
            }
        }
    });
});
