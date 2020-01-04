// Profile.Router.js
// -----------------------
// Router for handling profile view/update
define('ModalGallery.Router',  ['ModalGallery.Views', 'FormRenderer.View'], function (Views, FormRenderer)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'imagegallery/:key': 'renderGallery'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	renderGallery: function(key){
			var keyArr = unescape(key).split("|");
			var application = this.application
			,	galleryView = new Views.Gallery({
					application: application
				,	key: keyArr[0]
				,	title: keyArr[1]
				, designOption: keyArr[2]
				});
			galleryView.showContent();
		}
	});
});
