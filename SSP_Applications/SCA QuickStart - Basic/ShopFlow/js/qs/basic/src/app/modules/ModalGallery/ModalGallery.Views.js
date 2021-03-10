// Profile.Views.js
// -----------------------
// Views for profile's operations
define('ModalGallery.Views',  ['Client.Model'], function (ClientModel)
{
	'use strict';

	var Views = {};

	Views.Gallery = Backbone.View.extend({
		template: 'modal_gallery'
	,	title: ''
	,	events: {}
	, attributes: {
				'id': 'ModalImageGallery'
			,	'class': 'modal-image-gallery'
		}
	,	initialize: function (options)
		{

			this.title = options.key == jQuery("#" + options.title) ? jQuery("#" + options.title).find("option:selected").attr("name"): _(options.title).translate();
			this.application = options.application;
			this.key = options.key;
			this.designOption = options.designOption;
		}
	, 	getImageArray: function () {

	}
	,	render: function() {
			var self = this
			,	imageArray = new Array()
			,	key = this.key
			,	baseUrl = "http://store.jeromeclothiers.com/assets/images/item_options_images/";
			if(this.title == 'Button Code')
				key = "Button Code";

			jQuery.get(_.getAbsoluteUrl('js/DesignOptionsImages_Config.json?nocache=T')).done(function(data){

					var optionsConfig = data;
					if (optionsConfig) {
						if(optionsConfig[0][key]) {

							for (var i = optionsConfig[0][key].length - 1; i >= 0; i--) {
								imageArray.push(baseUrl + optionsConfig[0][key][i]);
							};
							//var imagePath = baseUrl + optionsConfig[0][key];
							self.renderImages(imageArray);
						}
					};
				});

			this._render();
		}
	, 	renderImages: function(img) {
			var self = this;

			jQuery('#in-modal-display-option-gallery').html(SC.macros.galleryPanel(img, this));
			var slider = jQuery('.bxslider').bxSlider({
				buildPager: function(slideIndex){
				    return "<img src=" + self.application.resizeImage(img[slideIndex], 'tinythumb') + ">";
				}
			});

			setTimeout(function() {
				if(img.length != 1) {
					slider.reloadSlider();
				}
			}, 200);
		}
	});

	return Views;
});
