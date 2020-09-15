/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       18 Aug 2017     jmarimla         Initial
 * 2.00       24 Aug 2017     jmarimla         Saved search details portlet
 * 3.00       31 Aug 2017     jmarimla         SS context portlet
 * 4.00       07 Sep 2017     jmarimla         Onload get data
 * 5.00       18 Sep 2017     jmarimla         Customer debugging
 * 6.00       17 Nov 2017     jmarimla         Customer field update
 * 7.00       11 Jun 2018     jmarimla         Translation engine
 * 8.00       24 May 2019     erepollo         Removed header BG
 * 9.00       18 Aug 2019     jmarimla         Filters expand/collapse
 * 10.00      15 Jan 2020     earepollo        Customer debugging changes
 * 11.00      22 Jan 2020     earepollo        Handling blank compfil for farm wide data
 *
 */

APMSPD = APMSPD || {};

APMSPD._mainPanel = function () {

    function render() {
        var $mainContent = $('#spd-main-content').addClass('psgp-main-content');

        $mainContent.append(APMSPD.Components.$TitleBar)
            .append(APMSPD.Components.$BtnRefresh)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSPD.Components.$FilterPanel)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSPD.Components.$SsDetailsPortlet)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSPD.Components.$SsContextPortlet)
            .append($('<div>').psgpSpacer({
                height: 15
            }))
            .append(APMSPD.Components.$ColumnPanel);

        APMSPD.Components.$ColumnPanel.find('.psgp-column-panel-1')
            .append($('<div>').psgpSpacer({
                height: 15
            }));

        $mainContent.removeClass('psgp-loading-mask');

        //Onload Refresh Data
        var globalSettings = APMSPD.Services.getGlobalSettings();
        globalSettings.compfil = SPD_PARAMS.compfil;
        APMSPD.Components.$CustomerDebuggingDialog.find('.field-customer .psgp-textbox').val(SPD_PARAMS.compfil);
        if (SPD_PARAMS.searchId) {
            APMSPD.Services.showLoading();
            globalSettings.startDateMS = SPD_PARAMS.startDateMS;
            globalSettings.endDateMS = SPD_PARAMS.endDateMS;
            globalSettings.searchId = SPD_PARAMS.searchId;

            APMSPD.Components.updateDateTimeField(APMSPD.Components.$StartDateTimeFilter, SPD_PARAMS.startDateBd);
            APMSPD.Components.updateDateTimeField(APMSPD.Components.$EndDateTimeFilter, SPD_PARAMS.endDateBd);
            APMSPD.Components.$FilterPanel.psgpFilterPanel('collapse');
            APMSPD.Services.refreshData();
        }

        APMSPD.Services.refreshSsListData();
    };

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
        $(cssStyle).appendTo($('#spd-main-content'));
    }

    return {
        adjustCSS: adjustCSS,
        render: render
    };

};