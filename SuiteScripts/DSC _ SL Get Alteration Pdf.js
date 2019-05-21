var context = nlapiGetContext();
var checkboxesArr = ['{alteration_3pc}', '{alteration_2pc}', '{alteration_jkt}', '{alteration_trs}', '{alteration_wst}', '{alteration_sht}', '{alteration_ovc}']; //Track of checkboxes
var site = "https://system.na2.netsuite.com";
if (context.getEnvironment() == 'SANDBOX') {
    site = "https://system.netsuite.com"
}

var calibriFont = site + '/core/media/media.nl?id=22532&amp;c=3857857_SB1&amp;h=37263b5094177ae154a0&amp;_xt=.ttf';

function mainFunction(request, response) {
    var alteractionRec,
        measurementVlues,
        clientId,
        tailorLogo,
        tailorId; 
    nlapiLogExecution('Debug', 'mainFunction()', 'Start');
    var alterationRecId = request.getParameter('recid');
    nlapiLogExecution('Debug', 'alterationRecId:', alterationRecId);

    if (alterationRecId) {
        alteractionRec = nlapiLookupField('customrecord_sc_alteration', alterationRecId, ['custrecord_alterations_measure_values', 'custrecord_alterations_client']);
    }
    if (alteractionRec) {
        measurementVlues = alteractionRec.custrecord_alterations_measure_values;
        clientId = alteractionRec.custrecord_alterations_client;
    }

    if (measurementVlues) {
        var clientName = '';
        var trsNumOfSectionGenerate = 0;
        var wstNumOfSectionGenerate = 0;
        var shtNumOfSectionGenerate = 0;
        var jckOvcNumGenerate = 0;

        measurementVlues = measurementVlues.replace(/\+/g, " ")
        .replace(/&/g, "&amp;")      
        .replace(/\\r/g, "")
        .replace(/\\t/g, "")
        .replace(/\\b/g, "")
        .replace(/\\f/g, "")
        .replace(/\\n/g, "")
        .replace(/\//g, '\/');
        measurementVlues = JSON.parse(measurementVlues);
        for (var i = 0; i < measurementVlues.length; i++) {
            if (measurementVlues[i].name == "alteration_jkt") {
                var jktNumOfSectionGenerate = measurementVlues[i].value ? measurementVlues[i].value : 0;
            } else if (measurementVlues[i].name == "alteration_trs") {
                trsNumOfSectionGenerate = measurementVlues[i].value ? measurementVlues[i].value : 0;
            } else if (measurementVlues[i].name == "alteration_wst") {
                wstNumOfSectionGenerate = measurementVlues[i].value ? measurementVlues[i].value : 0;
            } else if (measurementVlues[i].name == "alteration_sht") {
                shtNumOfSectionGenerate = measurementVlues[i].value ? measurementVlues[i].value : 0;
            } else if (measurementVlues[i].name == "alteration_ovc") {
                var ovcNumOfSectionGenerate = measurementVlues[i].value ? measurementVlues[i].value : 0;
                jckOvcNumGenerate = parseInt(jktNumOfSectionGenerate) + parseInt(ovcNumOfSectionGenerate);
                break;
            }
        }
        if (clientId) {
            var clientRec = nlapiLookupField('customrecord_sc_tailor_client', clientId, ['custrecord_tc_first_name', 'custrecord_tc_last_name', 'custrecord_tc_tailor']);
            if (clientRec) {
                clientName = clientRec.custrecord_tc_first_name + ' ' + clientRec.custrecord_tc_last_name;
                tailorId = clientRec.custrecord_tc_tailor
            }

            if (tailorId) {
                tailorLogo = nlapiLookupField('customer', tailorId, 'custentity_avt_tailor_logo_url');
            }
        }
        var renderer = nlapiCreateTemplateRenderer();
        var template = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">';
        template += '<pdf>';
        template += '    <head>';
        template += '<style>';
        template += 'input{'
        template += 'background-color : #ffffff;padding:3px;border:1px solid #ccc;font-family: "Raleway", sans-serif;';
        template += '}';
        template += 'td{'
        template += 'font-family: "Raleway", sans-serif;color:#777777;font-size: 13px;font-weight: lighter !important;margin-bottom:-6px';
        template += '}';
        template += 'b{'
        template += 'color: #343434;';
        template += '}';
        template += '</style>';
        template += '</head>';
        template += '<body width="8.27in" height="11.69in" style="color:#000000; background-color: #fff;"  footer-height="15mm">';
        template += '<table width="100%">';
        template += '<tr >';
        template += '<td align="center">';
        template += 'replacelogo';
        template += '</td>';
        template += '</tr>';
        template += '</table>';
        template += '<table width="100%" style="padding-bottom:15px;">';
        template += '<tr width="100%">';
        template += '<td width="6%">&nbsp;</td>';
        template += '<td width="24%">&nbsp;</td>';
        template += '<td width="30%">&nbsp;</td>';
        template += '<td width="13%">&nbsp;</td>';
        template += '<td width="27%">&nbsp;</td>';
        template += '</tr>';
        template += '<tr font-size="11pt" width="100%">';
        template += '<td width="6%">Date</td>';
        template += '<td width="34%"><input type="text" readonly="true" name="alterationDate" id="alteration_date" value="&nbsp;{alteration_date}" /></td>';
        template += '<td width="6%" align="right">Client Name</td>';
        template += '<td width="24%"><input type="text" readonly="true" name="alterationClientName" id="alter_info_client" value="&nbsp;{alteration_client_name}" /></td>';
        template += '<td width="4%" align="right">Order #</td>';
        template += '<td width="26%"><input type="text" readonly="true" name="alterationOrderNo" id="alteration_order_no" value="&nbsp;{alteration_order_no}" /></td>';
        template += '</tr>';
        template += '</table>';
        template += '<table width="100%" style="border-bottom:1px solid #ccc;padding-bottom:15px;padding-top:15px;">';
        template += '<tr font-size="11pt" width="100%">';
        template += '<td width="5%">JKT</td>';
        template += '<td width="15%"><input type="text"  readonly="true"  width="50px" height="16px" name="jkt" value="&nbsp;{alteration_jkt}" /></td>';
        template += '<td width="5%">TRS</td>';
        template += '<td width="15%"><input type="text"  readonly="true"  width="50px" height="16px" name="trs" value="&nbsp;{alteration_trs}" /></td>';
        template += '<td width="5%">WST</td>';
        template += '<td width="15%"><input type="text"  readonly="true"  width="50px" height="16px" name="wst" value="&nbsp;{alteration_wst}" /></td>';
        template += '<td width="5%">SHT</td>';
        template += '<td width="15%"><input type="text"  readonly="true"  width="50px" height="16px" name="sht" value="&nbsp;{alteration_sht}" /></td>';
        template += '<td width="5%">OVC</td>';
        template += '<td width="15%"><input type="text"  readonly="true"  width="50px" height="16px" name="ovc" value="&nbsp;{alteration_ovc}" /></td>';
        template += '</tr>';
        template += '</table>';
        template += '<table width="100%" style="padding-top:10px;">';
        template += '<tr font-size="13pt"  width="100%">';
        template += '<td width="25%">&nbsp;</td>';
        template += '<td width="25%"><b>Alterations</b></td>';
        template += '<td width="25%">&nbsp;</td>';
        template += '<td width="25%"><b>Fit Profile Updates</b></td>';
        template += '</tr>';
        template += '</table>';
        if (jckOvcNumGenerate && jckOvcNumGenerate != 0) {
            for (var i = 0; i < jckOvcNumGenerate; i++) {
                template += '<table width="100%" style="border-bottom:1px solid #ccc;padding-bottom:15px;padding-top:15px;">';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%"><b>JACKET/OVERCOAT</b></td>';
                template += '<td width="32%"><input type="text" width="170px"  readonly="true" name="alterationJckOvc' + i + '" id="alteration_jck_ovc_' + i + '" value="&nbsp;{alteration_jck_ovc_' + i + '}"/></td>';
                template += '<td width="28%">&nbsp;</td>';
                template += '<td width="30%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%" style="margin-top:15px;">';
                template += '<td width="10%">&nbsp;</td>';
                template += '<td width="32%">&nbsp;</td>';
                template += '<td width="28%">&nbsp;</td>';
                template += '<td width="30%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Erect/Stooping</td>';
                template += '<td width="32%"><input type="text" width="170px"  readonly="true" name="alterationErectStooping' + i + '" id="alteration_erect_stooping' + i + '" value="&nbsp;{alteration_erect_stooping_' + i + '}"/></td>';
                template += '<td width="28%">Sleeve Position</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationJktsleeve' + i + '" id="alter_jkt_sleeve' + i + '" value="&nbsp;{alteration_sleeve_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Collar Height</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationeJktCollarHeight' + i + '" id="alter_jkt_colht' + i + '" value="&nbsp;{alteration_collar_height_' + i + '}"/></td>';
                template += '<td width="28%">Shorten Lapels</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationShorterLapels' + i + '" id="alter_jkt_shorten_lapels' + i + '" value="&nbsp;{alteration_shorten_lapels_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Shoulder Height</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationShoulderHeight' + i + '" id="alter_jkt_shold_ht' + i + '" value="&nbsp;{alteration_shoulder_height_' + i + '}"/></td>';
                template += '<td width="28%">Shoulder Position</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationShoulderPosition' + i + '" id="alter_jkt_shold_pos' + i + '" value="&nbsp;{alteration_shoulder_position_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Shoulder Height</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationShoulderHeight2' + i + '" id="alter_jkt_shold_ht2' + i + '" value="&nbsp;{alteration_Shoulder_height2_' + i + '}"/></td>';
                template += '<td width="28%">Left Shoulder Height</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationLeftShoulderHeight' + i + '" id="alter_jkt_lft_shold_ht' + i + '" value="&nbsp;{alteration_left_shoulder_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Back</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationBack' + i + '" id="alter_jkt_back' + i + '" value="&nbsp;{alteration_back_' + i + '}"/></td>';
                template += '<td width="28%" align="left">Right Shoulder Height</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationRightShoulderHeight' + i + '" id="alter_jkt_right_shold_ht' + i + '" value="&nbsp;{alteration_right_shoulder_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Chest</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationChest' + i + '" id="alter_jkt_chest' + i + '" value="&nbsp;{alteration_Chest_' + i + '}"/></td>';
                template += '<td width="28%">Closing Button Height</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationClosingButtonHeight' + i + '" id="alter_jkt_clos_btn_ht' + i + '" value="&nbsp;{alteration_clos_btn_ht_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Waist</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationWaist' + i + '" id="alter_jkt_waist' + i + '" value="&nbsp;{alteration_waist_' + i + '}"/></td>';
                template += '<td width="28%">Skirt</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationSkirt' + i + '" id="alter_jkt_skirt' + i + '" value="&nbsp;{alteration_skirt_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Hips</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true"  name="alteerationHips' + i + '" id="alter_jkt_hips' + i + '" value="&nbsp;{alteration_hips_' + i + '}"/></td>';
                template += '<td width="28%">Upper Arm</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true"  name="alterationUpperArm' + i + '" id="alter_jkt_upper_arm' + i + '" value="&nbsp;{alteration_upper_arm_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Upper Arm</td>';
                template += '<td width="32%"><input type="text"  width="170px" readonly="true" name="alteerationUpperArm2' + i + '" id="alter_jkt_upper_arm2' + i + '" value="&nbsp;{alteration_upper_arm2_' + i + '}"/></td>';
                template += '<td width="28%">Hand Width</td>';
                template += '<td width="30%"><input type="text"  width="170px" readonly="true" name="alterationHandWidth' + i + '" id="alter_jkt_hand_width' + i + '" value="&nbsp;{alteration_hand_width_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Hand Width</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true"  name="alteerationHandWidth2' + i + '" id="alter_hand_width2' + i + '" value="&nbsp;{alteration_hand_width2_' + i + '}"/></td>';
                template += '<td width="28%">Sway Back</td>';
                template += '<td width="30%"><input type="text"  width="170px" readonly="true"  name="alterationSwayBack' + i + '" id="alteration_sway_back' + i + '" value="&nbsp;{alteration_sway_back_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Jacket Length</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true"  name="alterationJacketLength' + i + '" id="alteration_jacket_length' + i + '" value="&nbsp;{alteration_jacket_length_' + i + '}"/></td>';
                template += '<td width="28%">Stooped</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationStooped' + i + '" id="alteration_stooped' + i + '" value="&nbsp;{alteration_stooped_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Sleeve Length</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alterationSleeveLength' + i + '" id="alteration_sleeve_length" value="&nbsp;{alteration_sleeve_length_' + i + '}"/></td>';
                template += '<td width="28%">Erect</td>';
                template += '<td width="30%"><input type="text" width="170px" readonly="true" name="alterationErect' + i + '" id="alteration_erect' + i + '" value="&nbsp;{alteration_erect_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="10%">Other</td>';
                template += '<td width="32%"><input type="text" width="170px" readonly="true" name="alteerationJacketOther' + i + '" id="alter_jkt_other' + i + '" value="&nbsp;{alteration_other_' + i + '}"/></td>';
                template += '<td width="28%">&nbsp;</td>';
                template += '<td width="30%">&nbsp;</td>';
                template += '</tr>';
                template += '</table>';
            }
        }
        if (trsNumOfSectionGenerate && trsNumOfSectionGenerate != 0) {
            for (var i = 0; i < trsNumOfSectionGenerate; i++) {
                template += '<table width="100%" style="border-bottom:1px solid #ccc;padding-bottom:15px;padding-top:15px;">';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="21%"><b>TROUSER</b></td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true" name="alterationTrouser_' + i + '" id="alteration_trouser_' + i + '" value="&nbsp;{alteration_trouser_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%" style="margin-top:15px;">';
                template += '<td width="21%">&nbsp;</td>';
                template += '<td width="29%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr font-size="11pt"  width="100%">';
                template += '<td width="21%">Waist</td>';
                template += '<td width="29%"><input type="text" width="170px"   readonly="true" name="alterationTrouserWaist' + i + '" id="alter_tr_waist' + i + '" value="&nbsp;{alteration_Trouser_waist_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Total Rise</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserRise' + i + '" id="alter_tr_total_rise' + i + '" value="&nbsp;{alteration_total_raise_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Seat</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserSeat' + i + '" id="alter_tr_seat' + i + '" value="&nbsp;{alteration_seat_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Front Rise</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserFrontRise' + i + '" id="alter_tr_front_rise' + i + '" value="&nbsp;{alteration_front_rise_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Hip</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserHip' + i + '" id="alter_tr_hip' + i + '" value="&nbsp;{alteration_trouser_hip_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Back Rise</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserBackRise' + i + '" id="alter_tr_back_rise' + i + '" value="&nbsp;{alteration_back_rise_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Crotch</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserCrotch' + i + '" id="alter_tr_crotch" value="&nbsp;{alteration_trouser_crotch_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Flat Seat</td>';
                template += '<td width="25%"><input type="text" width="170px" readonly="true"  name="alterationTrouserFlatSeat' + i + '" id="alter_tr_flat_seat" value="&nbsp;{alteration_flat_seat_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Thigh</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouser' + i + '" id="alter_tr_thigh' + i + '" value="&nbsp;{alteration_trouser_thigh_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Knee</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserKnee' + i + '" id="alter_tr_knee' + i + '" value="&nbsp;{alteration_trouser_knee_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Hem</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationHem' + i + '" id="alter_tr_hem' + i + '" value="&nbsp;{alteration_trouser_hem_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Length</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationLength' + i + '" id="alter_tr_length' + i + '" value="&nbsp;{alteration_trouser_length_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Other</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationTrouserOther' + i + '" id="alter_tr_other' + i + '" value="&nbsp;{alteration_trouser_other_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '</table>';
            }
        }
        if (shtNumOfSectionGenerate && shtNumOfSectionGenerate != 0) {
            for (var i = 0; i < shtNumOfSectionGenerate; i++) {
                template += '<table width="100%" style="border-bottom:1px solid #ccc;padding-bottom:15px;padding-top:15px;">';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%"><b>SHIRT</b></td>';
                template += '<td width="29%"><input type="text" width="170px"   readonly="true" name="alterationShirtName' + i + '" id="alteration_shirt_' + i + '" value="&nbsp;{alteration_shirt_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%" style="margin-top:15px;">';
                template += '<td width="21%">&nbsp;</td>';
                template += '<td width="29%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Neck</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtNeck' + i + '" id="alter_shirt_neck' + i + '" value="&nbsp;{alteration_shirt_neck_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Chest</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationShirtChest' + i + '" id="alter_shirt_chest' + i + '" value="&nbsp;{alteration_shirt_chest_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Chest</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtChest2' + i + '" id="alter_shirt_chest1' + i + '" value="&nbsp;{alteration_shirt_chest1_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Shoulder</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationShirtShoulder' + i + '" id="alter_shirt_shoulder' + i + '" value="&nbsp;{alteration_shirt_shoulder_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt" width="100%">';
                template += '<td width="21%">Waist</td>';
                template += '<td width="29%"><input type="text" width="170px"   readonly="true" name="alterationWaist' + i + '" id="alter_shirt_waist' + i + '" value="&nbsp;{alteration_waist1_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Waist</td>';
                template += '<td width="25%"><input type="text" width="170px"   readonly="true" name="alterationShirtWaist2' + i + '" id="alter_shirt_waist2' + i + '" value="&nbsp;{alteration_waist2_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt" width="100%">';
                template += '<td width="21%">Neck</td>';
                template += '<td width="29%"><input type="text" width="170px"   readonly="true" name="alterationSeat' + i + '" id="alter_shirt_seat' + i + '" value="&nbsp;{alteration_seat1_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Chest</td>';
                template += '<td width="25%"><input type="text" width="170px"   readonly="true" name="alterationShirtSeat2' + i + '" id="alter_shirt_seat2' + i + '" value="&nbsp;{alteration_shirt_seat2_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt" width="100%">';
                template += '<td width="21%">Bicep</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtBicep' + i + '" id="alter_shirt_bicep' + i + '" value="&nbsp;{alteration_bicep_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Sleeve L</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationShirtSleeveL' + i + '" id="alter_shirt_sleeve_l' + i + '" value="&nbsp;{alteration_shirt_sleeve_left_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr font-size="11pt" width="100%">';
                template += '<td width="21%">Cuff</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtCuff' + i + '" id="alter_shirt_cuff' + i + '" value="&nbsp;{alteration_cuff_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;&nbsp;Sleeve R</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationShirtSleeveR' + i + '" id="alter_shirt_sleeve_r' + i + '" value="&nbsp;{alteration_shirt_sleeve_r_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Sleeve Length</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirt' + i + '" id="alter_shirt_sleeve_length' + i + '" value="&nbsp;{alteration_shirt_sleeve_length_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>'
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Length</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtLength' + i + '" id="alter_shirt_length' + i + '" value="&nbsp;{alteration_shirt_length_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>'
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Other</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationShirtOther' + i + '" id="alter_shirt_other' + i + '" value="&nbsp;{alteration_shirt_other_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>'
                template += '</table>';
            }
        }
        if (wstNumOfSectionGenerate && wstNumOfSectionGenerate != 0) {
            for (var i = 0; i < wstNumOfSectionGenerate; i++) {
                nlapiLogExecution('debug', 'wstNumOfSectionGenerate ', wstNumOfSectionGenerate)
                template += '<table width="100%" style="border-bottom:1px solid #ccc;padding-bottom:15px;padding-top:15px;">';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%"><b>WAISTCOAT</b></td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true" name="alterationWaistcoat' + i + '" id="alteration_waistcoat_' + i + '" value="&nbsp;{alteration_waistcoat_' + i + '}"/></td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%" style="margin-top:15px;">';
                template += '<td width="21%">&nbsp;</td>';
                template += '<td width="29%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '<td width="25%">&nbsp;</td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Chest</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationWcChest' + i + '" id="alter_Wc_Chest' + i + '" value="&nbsp;{alteration_wc_chest_' + i + '}"/></td>';
                template += '<td width="25%">Posture</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationWcPosture' + i + '" id="alter_Wc_Posture' + i + '" value="&nbsp;{alteration_wc_posture_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Waist</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationWcWaist' + i + '" id="alteration_wc_waist' + i + '" value="&nbsp;{alteration_wc_waist_' + i + '}"/></td>';
                template += '<td width="25%">Shoulder Height L</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationWcShoulderLeft' + i + '" id="alteration_wc_shoulder_left' + i + '" value="&nbsp;{alteration_wc_shoulder_left_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Seat</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationWcSeat' + i + '" id="alteration_wc_seat' + i + '" value="&nbsp;{alteration_wc_seat_' + i + '}"/></td>';
                template += '<td width="25%">Shoulder Height R</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationWcShoulderR' + i + '" id="alteration_wc_shoulder_r' + i + '" value="&nbsp;{alteration_wc_shoulder_r_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Back</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationWcBack' + i + '" id="alteration_wc_back' + i + '" value="&nbsp;{alteration_wc_back_' + i + '}"/></td>';
                template += '<td width="25%">Armhole</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationWcArmhole' + i + '" id="alteration_wc_armhole' + i + '" value="&nbsp;{alteration_wc_armhole_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Length</td>';
                template += '<td width="29%"><input type="text" width="170px"  readonly="true"  name="alterationWcLength' + i + '" id="alteration_wc_length' + i + '" value="&nbsp;{alteration_wc_length_' + i + '}"/></td>';
                template += '<td width="25%" >Closing Button Height</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true"  name="alterationWcBtn' + i + '" id="alteration_wc_btn' + i + '" value="&nbsp;{alteration_wc_btn_' + i + '}"/></td>';
                template += '</tr>';
                template += '<tr  font-size="11pt" width="100%">';
                template += '<td width="21%">Shoulder</td>';
                template += '<td width="29%"><input type="text" width="170px"   readonly="true" name="alterationWcShoulder' + i + '" id="alteration_wc_shoulder' + i + '" value="&nbsp;{alteration_wc_shoulder_' + i + '}"/></td>';
                template += '<td width="25%">Other</td>';
                template += '<td width="25%"><input type="text" width="170px"  readonly="true" name="alterationWcOther' + i + '" id="alteration_wc_other' + i + '" value="&nbsp;{alteration_wc_other_' + i + '}"/></td>';
                template += '</tr>';
                template += '</table>';
            }
        }
        template += '<table width="100%" style="padding-bottom:15px;padding-top:15px;">';
        template += '<tr  font-size="11pt" width="100%">';
        template += '<td width="40%"><b>NOTES</b></td>';
        template += '<td width="60%">&nbsp;</td>';
        template += '</tr>';
        template += '<tr  font-size="11pt"  width="100%" style="margin-top:15px;">';
        template += '<td width="56%" height="90" style="border: 1px solid #ccc;">{notes_comment}</td>';
        template += '<td width="60%" height="90">&nbsp;</td>';
        template += '</tr>';
        template += '</table>';
        template += '</body>';
        template += '</pdf>';

        nlapiLogExecution('debug', 'template', template);
        template = replaceTemplateValue(measurementVlues, template);
        template = template.replace('{alteration_client_name}', clientName);
        if (tailorLogo) {
            tailorLogo = site + tailorLogo;
            tailorLogo = tailorLogo.replace(/&/g, '&amp;');
            var imageTage = '<img src="' + tailorLogo + '" height="70%" width="100%" />';
            template = template.replace('replacelogo', imageTage);
        } else {
            template = template.replace('replacelogo', '');
        }
        nlapiLogExecution('Debug', 'setTemplate(): ', 'renderer.setTemplate(template)');
        try {
            renderer.setTemplate(template); // Passes in raw string of template to be transformed by FreeMarker
            var xml = renderer.renderToString(); // Returns template content interpreted by FreeMarker as XML string that can be passed to the nlapiXMLToPDF function.
            nlapiLogExecution('Debug', 'renderToString(): ', 'var xml = renderer.renderToString()');
            var file = nlapiXMLToPDF(xml); // Produces PDF output.
            nlapiLogExecution('Debug', 'nlapiXMLToPDF(): ', 'var file = nlapiXMLToPDF(xml);');
            //file.setName("SS Customer Price List.pdf");
            var fileName = 'alteration.pdf';
            // set content type, file name, and content-disposition (inline means display in browser)
            response.setContentType('PDF', fileName, 'inline');
            // write response to the client
            response.write(file.getValue());
            return true;

        } catch (e) {
            nlapiLogExecution('Error', 'Error Message: ', e.message);
            return false;
        }
    } else {
        response.write("Error: Invalid record id.");
    }

}

function replaceTemplateValue(measurementVlues, template) {
    for (var i = 0; i < measurementVlues.length; i++) {
        var str = '{' + measurementVlues[i].name + '}';
        var value = measurementVlues[i].value ? measurementVlues[i].value : ' ';
        template = template.replace(str, value);


    }

    return template;

}

function isNullOrEmpty(valueStr) {
    return (valueStr == null || valueStr == "" || valueStr == undefined);
}