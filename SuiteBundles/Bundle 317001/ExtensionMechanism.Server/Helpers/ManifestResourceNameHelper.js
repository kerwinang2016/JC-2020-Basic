/**
 *@NApiVersion 2.x
 */
define(
    [
        '../../third_parties/underscore.js'
    ]
,   function(
    )
{
    var manifest_resource_name_helper = {

        resource_map : [
        {
            inner: 'ssplibraries',
            outer: 'ssp-libraries'
        },
        {
            inner: 'entrypoints',
            outer: 'entry_points'
        },
        {
            inner: 'entrypoint',
            outer: 'entry_point'
        }
        ],

        getEMToSDFResourceMap: function getEMToSDFResourceMap()
        {
            return _.mapObject(_.indexBy(this.resource_map, 'outer'), function(data)
            {
                return data.inner;
            });
        },

        getSDFToEMResourceMap: function getSDFToEMResourceMap()
        {
            return _.mapObject(_.indexBy(this.resource_map, 'inner'), function(data)
            {
                return data.outer;
            });
        },
    };

    return manifest_resource_name_helper;
});
