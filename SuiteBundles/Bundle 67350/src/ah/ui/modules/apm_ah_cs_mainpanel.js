/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Mar 2019     alaurito         Initial
 * 2.00       14 May 2019     rwong            Adjusted portlet to tab based
 * 3.00       21 May 2019     jmarimla         Get data onload
 * 4.00       10 Jul 2019     rwong            New UI
 * 5.00       11 Sep 2019     erepollo         Investigate link
 * 6.00       23 Sep 2019     erepollo         Customer debugging
 * 7.00       28 Jan 2020     lemarcelo        Customer debugging changes
 *
 */
APMAH = APMAH || {};

APMAH._MainPanel = function() {

    function render() {
        var $mainContent = $('#apm-ah-main-content').addClass('psgp-main-content');

        $mainContent.append(APMAH.Components.$TitleBar)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMAH.Components.$AccountOverviewPortlet)

        $mainContent.removeClass('psgp-loading-mask');

        //resize event
        $(window).resize(function() {
            var delay = 250;
            setTimeout(function() {
                var charts = [

                ];

                for (var i in charts) {
                    if (charts[i]) charts[i].reflow();
                }
            }, delay);
        });

        var globalSettings = APMAH.Services.getGlobalSettings();
        globalSettings.endDateMS = new Date().setMinutes(0, 0, 0);
        globalSettings.startDateMS = globalSettings.endDateMS - 1000*60*60*24*8;
        globalSettings.compfil = APM_PARAMS.myCompany;

        APMAH.Components.$CustomerDebuggingDialog.find('.field-customer .psgp-textbox').val(APM_PARAMS.myCompany);
        APMAH.Services.refreshAccountOverviewData();
    }

    function adjustCSS() {
        var themeColor = $('#ns_navigation').css('background-color');
        themeColor = themeColor || '#DDDDDD';
        var fontFamily = $('.uir-record-type').css('font-family');
        fontFamily = fontFamily || '#Serif';
        var cssStyle = '' +
            '<style type="text/css">' +
            '.psgp-main-content *, .psgp-dialog *, .psgp-settings-dialog *, .psgp-dialog input, .psgp-settings-dialog input { font-family: ' + fontFamily + ';}' +
            '.psgp-dialog .ui-dialog-titlebar { background-color: ' + themeColor + ';}' +
            '</style>';
        $(cssStyle).appendTo($('#apm-ah-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };
};