/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */
define(['N/search'],
    function(search) {
        function render(context) {
            var portlet = context.portlet;
            portlet.title = "Custom HTML";
        }
        return {
            render: render
        };
    });
