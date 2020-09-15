/**
 *@NApiVersion 2.x
 */
define(
    [
        '../ExtensionMechanism.Server/Services/WebsiteApiSS2'
    ,   '../third_parties/underscore.js'
    ]
,   function(
        WebsiteApi
    )
{
    var validator = {

        validate: function(domain, folder_id, active_extensions)
        {
            var activation_manifest = WebsiteApi.getActivationManifest(folder_id, domain);

			//If there is no manifest then there should be no active extensions
			if((_.isUndefined(activation_manifest) || _.isEmpty(activation_manifest)) && !_.isEmpty(active_extensions))
			{
				return false;
			}

			//If there is manifest then there should be active extensions
			if((!_.isUndefined(activation_manifest) && !_.isEmpty(activation_manifest)) && _.isEmpty(active_extensions))
			{
				return false;
			}

			//Both collections are sorted by priority
			//so, we can compare their extension_id projections to validate that they have the same extensions and in the same order
			activation_manifest = _.pluck(activation_manifest, 'extension_id');
			active_extensions = _.pluck(active_extensions, 'extension_id');

			return _.isEqual(_.sortBy(activation_manifest), _.sortBy(active_extensions));
        }

    };

    return validator;
});
