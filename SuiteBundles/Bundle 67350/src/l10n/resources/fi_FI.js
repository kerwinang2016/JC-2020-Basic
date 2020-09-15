/**
 * Copyright © 2015, 2020, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Jun 2018     jmarimla         Initial
 * 2.00       19 Jun 2018     justaris         Added Strings
 * 3.00       29 Jun 2018     jmarimla         Added Strings
 * 4.00       06 Jul 2018     jmarimla         Added Strings
 * 5.00       17 Jul 2018     rwong            Added Strings
 * 6.00       26 Jul 2018     jmarimla         Added Strings
 * 7.00       30 Jul 2018     justaris         Added Strings
 * 8.00       26 Oct 2018     jmarimla         Added Strings
 * 9.00       07 Dec 2018     jmarimla         Added Strings
 * 10.00      22 Aug 2019     erepollo         Added Strings
 * 11.00      17 Feb 2020     erepollo         Removed unused strings
 * 12.00      21 Feb 2020     lemarcelo        Added String
 * 13.00      28 Feb 2020     lemarcelo        Added Strings
 * 14.00      04 Mar 2020     earepollo        Updated strings
 * 15.00      13 Mar 2020     earepollo        Updated strings
 *
 */
/**
 * @NModuleScope Public
 */
define(function() {
    var translation = {
        "apm.cd.button.back" : "Takaisin",
        "apm.cd.label.concurrencydetails" : "Samanaikaisuustiedot",
        "apm.cd.label.detailedconcurrency" : "Yksityiskohtainen samanaikaisuus",
        "apm.cd.label.exceededconcurrency" : "Ylitetty samanaikaisuus",
        "apm.cd.label.instancedetails" : "Tapauksen tiedot",
        "apm.cd.label.max" : "Maksimi – {0}",
        "apm.cd.label.sec" : "s",
        "apm.cd.label.secs" : "s",
        "apm.cd.label.viewrequests" : "Katselupyynnöt",
        "apm.cm.label._101andabove" : "101 % tai enemmän",
        "apm.cm.label.concurrencylimit" : "Samanaikaisuusrajoitus",
        "apm.cm.label.concurrencymonitor" : "Samanaikaisuuden seuranta",
        "apm.cm.label.concurrencyusage" : "Samanaikaisuuskäyttö",
        "apm.cm.label.generalconcurrency" : "Yleinen samanaikaisuus",
        "apm.cm.label.highestexceededconcurrency" : "Korkein ylitetty samanaikaisuus",
        "apm.cm.label.note" : "Huomautus",
        "apm.cm.label.peakconcurrency" : "Samanaikaisuuden huippu",
        "apm.cm.label.percentvaluesareapproximate" : "Prosenttiarvot ovat likimääräisiä.",
        "apm.cm.label.requestexceedinglimit" : "Pyynnöt ylittävät rajan",
        "apm.cm.label.requestswithinlimit" : "Pyynnöt rajan sisällä (%)",
        "apm.cm.label.totalexceededconcurrency" : "Ylitetty samanaikaisuus yhteensä",
        "apm.cm.label.valuesareexact" : "Arvot ovat tarkkoja.",
        "apm.common.alert.daterange._30days" : "Päivämääräväli ei saa ylittää 30:tä päivää",
        "apm.common.alert.daterange._3days" : "Päivämääräväli ei saa olla alle 3 päivää",
        "apm.common.alert.enablefeatures" : "[Custom Records]-, [Client SuiteScript]- ja [Server SuiteScript] -ominaisuuksien on oltava käytössä. Ota nämä ominaisuudet käyttöön ja yritä uudelleen.",
        "apm.common.alert.endaterequired" : "Päättymispäivämäärä on pakollinen",
        "apm.common.alert.entervalidenddate" : "Syötä kelvollinen päättymispäivämäärä.",
        "apm.common.alert.entervalidstartdate" : "Syötä kelvollinen aloituspäivämäärä.",
        "apm.common.alert.errorinsearch" : "Virhe haussa",
        "apm.common.alert.errorinsuitelet" : "Virhe suiteletissa",
        "apm.common.alert.invalidenddate" : "Virheellinen päättymispäivämäärä",
        "apm.common.alert.invalidstartdate" : "Virheellinen aloituspäivämäärä",
        "apm.common.alert.nocontent" : "Ei sisältöä",
        "apm.common.alert.startdateearlierthanenddate" : "Alkamispäivämäärän on oltava ennen päättymispäivää.",
        "apm.common.alert.startdaterequired" : "Aloituspäivämäärä on pakollinen",
        "apm.common.button.cancel" : "Peruuta",
        "apm.common.button.done" : "Valmis",
        "apm.common.button.refresh" : "Päivitä",
        "apm.common.button.reset" : "Palauta",
        "apm.common.button.set" : "Aseta",
        "apm.common.highcharts.drilluptext" : "Takaisin",
        "apm.common.highcharts.nodata" : "Ei näytettäviä tietoja",
        "apm.common.highcharts.resetzoom" : "Palauta suurennus",
        "apm.common.highcharts.resetzoomtitle" : "Palauta suurennustaso 1:1",
        "apm.common.label._95th" : "95",
        "apm.common.label._95thpercentile" : "95. persentiili",
        "apm.common.label.all" : "Kaikki",
        "apm.common.label.asof" : "{0} alkaen",
        "apm.common.label.client" : "Asiakas",
        "apm.common.label.close" : "Sulje",
        "apm.common.label.companyid" : "Yritystunnus",
        "apm.common.label.completed" : "Valmis",
        "apm.common.label.concurrency" : "Samanaikaisuus",
        "apm.common.label.concurrencycount" : "Samanaikaisuuden määrä",
        "apm.common.label.context" : "Konteksti",
        "apm.common.label.csvimport" : "CSV-tuonti",
        "apm.common.label.custom" : "Mukautettu",
        "apm.common.label.customdaterange" : "Mukautettu päivämääräväli",
        "apm.common.label.customerdebugsettings" : "Asiakkaan virheenkorjausasetukset",
        "apm.common.label.dashboard" : "Hallintapaneeli",
        "apm.common.label.daterange" : "Päivämääräväli",
        "apm.common.label.datetime" : "Päivämäärä ja aika",
        "apm.common.label.deploymentname" : "Käyttöönoton nimi",
        "apm.common.label.edit" : "Muokkaa",
        "apm.common.label.elevatedpriority" : "Korotettu ensisijaisuus",
        "apm.common.label.email" : "Sähköposti",
        "apm.common.label.enddate" : "Päättymispäivämäärä",
        "apm.common.label.enddatetime" : "Päättymispäivämäärä/-aika",
        "apm.common.label.endtimerequired" : "Päättymisaika on pakollinen",
        "apm.common.label.errorrate" : "Virheaste",
        "apm.common.label.exceededconcurrencycount" : "Ylitetty samanaikaisuuden määrä",
        "apm.common.label.executioncontext" : "Toteutuskonteksti",
        "apm.common.label.executiontime" : "Toteuttamisaika",
        "apm.common.label.exportcsv" : "Vienti – CSV",
        "apm.common.label.failed" : "Epäonnistunut",
        "apm.common.label.failedrequests" : "Epäonnistuneet pyynnöt",
        "apm.common.label.filters" : "Suodattimet",
        "apm.common.label.from" : "Alkaen",
        "apm.common.label.histogram" : "Histogrammi",
        "apm.common.label.hr" : "t",
        "apm.common.label.hrs" : "t",
        "apm.common.label.instancecount" : "Tapausten määrä",
        "apm.common.label.integration" : "Integrointi",
        "apm.common.label.last12hours" : "Viimeiset 12 tuntia",
        "apm.common.label.last14days" : "Viimeiset 14 päivää",
        "apm.common.label.last1hour" : "Viimeisin tunti",
        "apm.common.label.last24hours" : "Viimeiset 24 tuntia",
        "apm.common.label.last30days" : "Viimeiset 30 päivää",
        "apm.common.label.last3days" : "Viimeiset 3 päivää",
        "apm.common.label.last3hours" : "Viimeiset 3 tuntia",
        "apm.common.label.last6hours" : "Viimeiset 6 tuntia",
        "apm.common.label.last7days" : "Viimeiset 7 päivää",
        "apm.common.label.loading" : "Ladataan",
        "apm.common.label.mapreduce" : "Kartoita/Vähennä",
        "apm.common.label.median" : "Mediaani",
        "apm.common.label.min" : "min",
        "apm.common.label.mins" : "min",
        "apm.common.label.mostusers" : "Useimmat käyttäjät",
        "apm.common.label.name" : "Nimi",
        "apm.common.label.network" : "Verkko",
        "apm.common.label.new" : "Uusi",
        "apm.common.label.nodataavailable" : "Ei tietoja saatavilla",
        "apm.common.label.nodrilldowndata" : "Ei palautettuja lisähakutietoja",
        "apm.common.label.none" : "Ei mitään",
        "apm.common.label.norecordstoshow" : "Ei näytettäviä tietoja",
        "apm.common.label.notiledatavailable" : "Ei tietoja saatavilla tälle ruudulle",
        "apm.common.label.numberoflogs" : "Lokien määrä",
        "apm.common.label.numberofusers" : "Käyttäjien määrä",
        "apm.common.label.operation" : "Käyttö",
        "apm.common.label.overview" : "Yleiskatsaus",
        "apm.common.label.pageinit" : "pageinit",
        "apm.common.label.percentage" : "Prosentti",
        "apm.common.label.queue" : "Jono",
        "apm.common.label.recordoperations" : "Tietotoiminnot",
        "apm.common.label.records" : "Tiedot",
        "apm.common.label.recordsperminute" : "Tietoa minuutissa",
        "apm.common.label.recordtype" : "Tietotyyppi",
        "apm.common.label.rejectedaccountconcurrency" : "Hylätty tilin samanaikaisuus",
        "apm.common.label.rejecteduserconcurrency" : "Hylätty käyttäjän samanaikaisuus",
        "apm.common.label.requests" : "Pyynnöt",
        "apm.common.label.responsetime" : "Vasteaika",
        "apm.common.label.restlet" : "RESTlet",
        "apm.common.label.role" : "Rooli",
        "apm.common.label.roles" : "Roolit",
        "apm.common.label.save" : "Tallenna",
        "apm.common.label.scheduled" : "Aikataulutettu",
        "apm.common.label.scriptname" : "Koodin nimi",
        "apm.common.label.selectionaffectallportlets" : "Valinnat vaikuttavat kaikkiin portletteihin",
        "apm.common.label.server" : "Palvelin",
        "apm.common.label.setup" : "Asetus",
        "apm.common.label.sorting" : "Lajittelu",
        "apm.common.label.startdate" : "Aloituspäivämäärä",
        "apm.common.label.startdatetime" : "Aloituspäivämäärä/-aika",
        "apm.common.label.status" : "Tila",
        "apm.common.label.timeline" : "Aikajana",
        "apm.common.label.timeout" : "Aikakatkaistu",
        "apm.common.label.timeoutrate" : "Aikakatkaisusuhde",
        "apm.common.label.to" : "Vastaanottaja",
        "apm.common.label.total" : "Yhteensä",
        "apm.common.label.totalrecords" : "Tietoja yhteensä",
        "apm.common.label.totalrequests" : "Pyyntöjä yhteensä",
        "apm.common.label.totaltime" : "Kokonaisaika",
        "apm.common.label.type" : "Tyyppi",
        "apm.common.label.urlrequests" : "URL-pyynnöt",
        "apm.common.label.user" : "KÄYTTÄJÄ",
        "apm.common.label.userevent" : "Käyttäjätapahtuma",
        "apm.common.label.users" : "Käyttäjät",
        "apm.common.label.view" : "Näkymä",
        "apm.common.label.viewdetails" : "Näytä tiedot",
        "apm.common.label.viewfrhtdetails" : "Näytä FRHT-tiedot",
        "apm.common.label.viewing" : "Tarkastelu",
        "apm.common.label.waittime" : "Odotusaika",
        "apm.common.label.webservice" : "Verkkopalvelu",
        "apm.common.month.april" : "Huhtikuu",
        "apm.common.month.august" : "Elokuu",
        "apm.common.month.december" : "Joulukuu",
        "apm.common.month.february" : "Helmikuu",
        "apm.common.month.january" : "Tammikuu",
        "apm.common.month.july" : "Heinäkuu",
        "apm.common.month.june" : "Kesäkuu",
        "apm.common.month.march" : "Maaliskuu",
        "apm.common.month.may" : "Toukokuu",
        "apm.common.month.november" : "Marraskuu",
        "apm.common.month.october" : "Lokakuu",
        "apm.common.month.september" : "Syyskuu",
        "apm.common.priority.high" : "Korkea",
        "apm.common.priority.low" : "Matala",
        "apm.common.priority.standard" : "Tavallinen",
        "apm.common.shortmonth.april" : "Huhti",
        "apm.common.shortmonth.august" : "Elo",
        "apm.common.shortmonth.december" : "Joulu",
        "apm.common.shortmonth.february" : "Helmi",
        "apm.common.shortmonth.january" : "Tammi",
        "apm.common.shortmonth.july" : "Heinä",
        "apm.common.shortmonth.june" : "Kesä",
        "apm.common.shortmonth.march" : "Maalis",
        "apm.common.shortmonth.may" : "Touko",
        "apm.common.shortmonth.november" : "Marras",
        "apm.common.shortmonth.october" : "Loka",
        "apm.common.shortmonth.september" : "Syys",
        "apm.common.shortweekday.friday" : "P",
        "apm.common.shortweekday.monday" : "M",
        "apm.common.shortweekday.saturday" : "S",
        "apm.common.shortweekday.sunday" : "S",
        "apm.common.shortweekday.thursday" : "T",
        "apm.common.shortweekday.tuesday" : "T",
        "apm.common.shortweekday.wednesday" : "K",
        "apm.common.time.am" : "AAMU",
        "apm.common.time.pm" : "ILTA",
        "apm.common.tooltip.percentfromtotal" : "% kokonaismäärästä",
        "apm.common.weekday.friday" : "Perjantai",
        "apm.common.weekday.monday" : "Maanantai",
        "apm.common.weekday.saturday" : "Lauantai",
        "apm.common.weekday.sunday" : "Sunnuntai",
        "apm.common.weekday.thursday" : "Torstai",
        "apm.common.weekday.tuesday" : "Tiistai",
        "apm.common.weekday.wednesday" : "Keskiviikko",
        "apm.db.alert.entervalidhistograminterval" : "Syötä kelvollinen histogrammi-intervalli",
        "apm.db.alert.entervalidresponsetime" : "Syötä kelvollinen vasteaika",
        "apm.db.alert.operationrequired" : "Toiminto on pakollinen",
        "apm.db.alert.recordtyperequired" : "Tietotyyppi on pakollinen",
        "apm.db.alert.starttimerequired" : "Aloitusaika on pakollinen",
        "apm.db.alert.watchlist10items" : "Seurantaluettelossa voi olla enintään 10 kohdetta.",
        "apm.db.label.adddatetime" : "Lisää päivämäärä ja aika",
        "apm.db.label.addwatchlist" : "Lisää seurantaluetteloon",
        "apm.db.label.chartpreferences" : "Kaaviovalinnat",
        "apm.db.label.customdatetime" : "Mukautettu päivämäärä ja aika",
        "apm.db.label.duplicaterecordtypeoperation" : "Tietotyypin ja toiminnon kaksoiskappale",
        "apm.db.label.endtime" : "Päättymisaika",
        "apm.db.label.export" : "Vienti",
        "apm.db.label.general" : "Yleinen",
        "apm.db.label.highestresponsetime" : "Korkein vasteaika",
        "apm.db.label.mostutilized" : "Hyödynnetyin",
        "apm.db.label.outof" : "{0}/{1}",
        "apm.db.label.recordinstance" : "Tietotapaus",
        "apm.db.label.recordinstances" : "Tietotapaukset",
        "apm.db.label.recordpages" : "Tietosivut",
        "apm.db.label.recordtiles" : "Tietoruudut",
        "apm.db.label.removeall" : "Poista kaikki",
        "apm.db.label.setuprecordpages" : "Aseta tietosivut",
        "apm.db.label.showallrecordtiles" : "Näytä kaikki tietoruudut",
        "apm.db.label.showwatchlistonly" : "Näytä vain seurantaluettelo",
        "apm.db.label.starttime" : "Aloitusaika",
        "apm.db.label.throughput" : "Tuotantokapasiteetti",
        "apm.db.label.unknown" : "Tuntematon",
        "apm.db.label.usereventworkflow" : "Käyttäjätapahtuma ja työnkulku",
        "apm.db.label.watchlist" : "Seurantaluettelo",
        "apm.db.responsetimechart.clientnetworkserver" : "Asiakas, verkko ja palvelin",
        "apm.db.setup.interval" : "Intervalli",
        "apm.ns.common.add" : "Lisää",
        "apm.ns.context.backend" : "LOPPUPÄÄ",
        "apm.ns.context.customfielddefault" : "MUKAUTETUN KENTÄN OLETUSARVO",
        "apm.ns.context.emailalert" : "SÄHKÖPOSTIHÄLYTYS",
        "apm.ns.context.emailscheduled" : "AAJOITETTU SÄHKÖPOSTI",
        "apm.ns.context.machine" : "KONE",
        "apm.ns.context.other" : "MUU",
        "apm.ns.context.reminder" : "MUISTUTUS",
        "apm.ns.context.snapshot" : "TILANNEKUVA",
        "apm.ns.context.suitescript" : "SuiteScript",
        "apm.ns.context.website" : "VERKKOSIVUSTO",
        "apm.ns.context.workflow" : "Työnkulku",
        "apm.ns.status.finished" : "Valmis",
        "apm.ns.triggertype.aftersubmit" : "aftersubmit",
        "apm.ns.wsa.delete" : "Poista",
        "apm.ns.wsa.update" : "Päivitä",
        "apm.ptd.label.clientheader" : "Asiakas: Ylätunniste",
        "apm.ptd.label.clientinit" : "Asiakas: Aloitus",
        "apm.ptd.label.clientrender" : "Asiakas: Renderöi",
        "apm.ptd.label.deploymentid" : "Käyttöönottotunnus",
        "apm.ptd.label.page" : "Sivu",
        "apm.ptd.label.pagetimedetails" : "Sivun aikatiedot",
        "apm.ptd.label.script" : "Koodi",
        "apm.ptd.label.scriptbeforeload" : "Koodi: beforeload: {0}",
        "apm.ptd.label.scripttypeworkflow" : "Koodityyppi/työnkulku",
        "apm.ptd.label.searches" : "Haut",
        "apm.ptd.label.suitescriptworkflowdetails" : "SuiteScript- ja työnkulkutiedot",
        "apm.ptd.label.time" : "Aika",
        "apm.ptd.label.usage" : "Käyttö",
        "apm.pts.description._95thpercentile" : "Arvo (tai pisteet), jonka alapuolella löytyy 95 prosenttia havainnoista",
        "apm.pts.description.average" : "Numeroiden keskiarvo",
        "apm.pts.description.median" : "Keskimmäinen numero (lajitellussa numeroluettelossa)",
        "apm.pts.description.standarddeviation" : "Sen mitta, kuinka hajallaan numerot ovat",
        "apm.pts.label.aggregation" : "Yhdistäminen",
        "apm.pts.label.and" : "Ja",
        "apm.pts.label.between" : "Välillä",
        "apm.pts.label.bundle" : "Paketti",
        "apm.pts.label.columnname" : "Sarakkeen nimi",
        "apm.pts.label.description" : "Kuvaus",
        "apm.pts.label.details" : "Tiedot",
        "apm.pts.label.greaterthan" : "Suurempi kuin",
        "apm.pts.label.lessthan" : "Pienempi kuin",
        "apm.pts.label.meanaverage" : "Keskiarvo",
        "apm.pts.label.netsuitesystem" : "NetSuite-järjestelmä",
        "apm.pts.label.pagetimesummary" : "Sivun aikayhteenveto",
        "apm.pts.label.performancelogs" : "Suorituskykylokit",
        "apm.pts.label.responsetimeinseconds" : "Vasteaika (sekuntia)",
        "apm.pts.label.scriptworkflowtimebreakdown" : "Koodin/työnkulun ajan erittely",
        "apm.pts.label.setupsummary" : "Asetuksen yhteenveto",
        "apm.pts.label.show" : "Näytä",
        "apm.pts.label.standarddeviation" : "Keskihajonta",
        "apm.pts.label.summary" : "Yhteenveto",
        "apm.scpm.label.available" : "Käytettävissä",
        "apm.scpm.label.availabletime" : "Saatavuusajat",
        "apm.scpm.label.aveexecutiontime" : "Keskimääräinen toteuttamisaika",
        "apm.scpm.label.averagewaittime" : "Keskimääräinen odotusaika",
        "apm.scpm.label.avewaittime" : "Keskim. odotusaika",
        "apm.scpm.label.cancelled" : "Peruutettu",
        "apm.scpm.label.complete" : "Valmis",
        "apm.scpm.label.deferred" : "Lykätty",
        "apm.scpm.label.elevated" : "Korotettu",
        "apm.scpm.label.elevationinterval" : "Korotusintervalli",
        "apm.scpm.label.jobs" : "Työt",
        "apm.scpm.label.jobscompleted" : "Valmiit työt",
        "apm.scpm.label.jobsfailed" : "Epäonnistuneet työt",
        "apm.scpm.label.jobstatus" : "Työn tila",
        "apm.scpm.label.noofreservedprocessors" : "Varattujen käsittelijöiden määrä",
        "apm.scpm.label.original" : "Alkuperäinen",
        "apm.scpm.label.pending" : "Odottaa",
        "apm.scpm.label.priority" : "Ensisijaisuus",
        "apm.scpm.label.priorityelevation" : "Ensisijaisuuden nosto",
        "apm.scpm.label.processing" : "Käsitellään",
        "apm.scpm.label.processorconcurrency" : "Käsittelijän samanaikaisuus",
        "apm.scpm.label.processorreservation" : "Käsittelijän varaus",
        "apm.scpm.label.processors" : "Käsittelijät",
        "apm.scpm.label.processorsettings" : "Käsittelijäasetukset",
        "apm.scpm.label.processorutilization" : "Käsittelijän käyttäminen",
        "apm.scpm.label.queueprocessordetails" : "Jonon/käsittelijän tiedot",
        "apm.scpm.label.queues" : "Jonot",
        "apm.scpm.label.reservedprocessorsinuse" : "Käytössä olevat varatut käsittelijät",
        "apm.scpm.label.retry" : "Yritä uudelleen",
        "apm.scpm.label.reuseidleprocessors" : "Käytä käyttämättömiä käsittelijöitä uudelleen",
        "apm.scpm.label.totalnoofprocessors" : "Käsittelijöiden määrä yhteensä",
        "apm.scpm.label.totalwaittime" : "Odotusaika yhteensä",
        "apm.scpm.label.utilization" : "Käyttäminen",
        "apm.scpm.label.utilized" : "Käytetty",
        "apm.scpm.label.utilizedtime" : "Käytetty aika",
        "apm.scpm.label.waittimebypriority" : "Odotusaika ensisijaisuuden mukaan",
        "apm.setup.label.apmsetup" : "APM-asetukset",
        "apm.setup.label.employee" : "Työntekijä",
        "apm.setup.label.employees" : "Työntekijät",
        "apm.setup.top10mostutilized" : "10 eniten hyödynnettyä",
        "apm.spa.label.highestexecutiontime" : "Korkein toteuttamisaika",
        "apm.spa.label.mostrequested" : "Pyydetyin",
        "apm.spa.label.mosttimeouts" : "Eniten aikakatkaisuja",
        "apm.spa.label.savedsearches" : "Tallennetut haut",
        "apm.spa.label.searchperformanceanalysis" : "Haun Suorituskykyanalyysi",
        "apm.spd.alert.searchloadingwait" : "Hakujasi ladataan. Odota.",
        "apm.spd.label.date" : "PÄIVÄMÄÄRÄ",
        "apm.spd.label.isfalse" : "väärin",
        "apm.spd.label.istrue" : "oikein",
        "apm.spd.label.savedsearch" : "TALLENNETTU HAKU",
        "apm.spd.label.savedsearchbycontext" : "Tallennettu haku kontekstin mukaan",
        "apm.spd.label.savedsearchdetails" : "Tallennetun haun tiedot",
        "apm.spd.label.savedsearchlogs" : "Tallennetun haun lokit",
        "apm.spd.label.searchperformancedetails" : "Hae suorituskykytiedot",
        "apm.spjd.label.alldeployments" : "Kaikki käyttöönotot",
        "apm.spjd.label.alltasktypes" : "Kaikki tehtävätyypit",
        "apm.spjd.label.datecreated" : "Luontipäivämäärä",
        "apm.spjd.label.deployment" : "Käyttöönotto",
        "apm.spjd.label.jobdetails" : "Työn tiedot",
        "apm.spjd.label.jobdetailstimeline" : "Työn tietojen aikajana",
        "apm.spjd.label.mapreduceexecutiontime" : "Kartoita toteuttamisaika / vähennä toteuttamisaikaa",
        "apm.spjd.label.mapreducestage" : "Kartoita/vähennä vaihe",
        "apm.spjd.label.mapreducewaittime" : "Kartoita/vähennä odotusaika",
        "apm.spjd.label.originalpriority" : "Alkuperäinen ensisijaisuus",
        "apm.spjd.label.scheduledexecutiontime" : "Aikataulutettu toteuttamisaika",
        "apm.spjd.label.scheduledwaittime" : "Aikataulutettu odotusaika",
        "apm.spjd.label.suitecouldprocessorsjobdetails" : "SuiteCloud-käsittelijän työn tiedot",
        "apm.spjd.label.taskid" : "Tehtävätunnus",
        "apm.spjd.label.tasktype" : "Tehtävätyyppi",
        "apm.spm.label.suitecloudprocessormonitor" : "SuiteCloud-käsittelijän näyttö",
        "apm.ssa.alert.enterclienteventtype" : "Valitse asiakkaan tapahtumatyyppi.",
        "apm.ssa.alert.enterscriptid" : "Syötä koodin tunnus.",
        "apm.ssa.alert.enterscripttype" : "Syötä koodin tyyppi.",
        "apm.ssa.alert.selectscriptname" : "Syötä koodin nimi.",
        "apm.ssa.label.clienteventtype" : "Asiakkaan tapahtumatyyppi",
        "apm.ssa.label.errorcount" : "Virheiden määrä",
        "apm.ssa.label.performancechart" : "Suorituskykykaavio",
        "apm.ssa.label.recordid" : "Tietojen tunnus",
        "apm.ssa.label.scriptid" : "Koodin tunnus",
        "apm.ssa.label.scripttype" : "Koodityyppi",
        "apm.ssa.label.search" : "Haku",
        "apm.ssa.label.searchcalls" : "Hae puheluita",
        "apm.ssa.label.suitelet" : "Suitelet",
        "apm.ssa.label.suitescriptanalysis" : "SuiteScript-analyysi",
        "apm.ssa.label.suitescriptdetails" : "SuiteScriptin tiedot",
        "apm.ssa.label.suitescriptexecutionovertime" : "SuiteScriptin toteutus ajan myötä",
        "apm.ssa.label.usagecount" : "Käyttömäärä",
        "apm.ssa.label.usereventaftersubmit" : "Käyttäjätapahtuma (lähettämisen jälkeen)",
        "apm.ssa.label.usereventbeforeload" : "Käyttäjätapahtuma (ennen lataamista)",
        "apm.ssa.label.usereventbeforesubmit" : "Käyttäjätapahtuma (ennen lähettämistä)",
        "apm.ssa.label.userinterface" : "Käyttöliittymä",
        "apm.ssa.label.value" : "Arvo",
        "apm.ssa.label.viewlogs" : "Näytä lokit",
        "apm.ssa.label.webstore" : "Verkkokauppa",
        "apm.wsa.apiversion.notreleased" : "Ei julkaistu",
        "apm.wsa.apiversion.notsupported" : "Ei tuettu",
        "apm.wsa.apiversion.supported" : "Tuettu",
        "apm.wsa.apiversionusage.retired" : "Eläkkeellä",
        "apm.wsa.label.apiversionusage" : "API-version käyttö",
        "apm.wsa.label.executiontimeperrecordtype" : "Toteuttamisaika tietojen tyypin mukaan",
        "apm.wsa.label.instancecountperrecordtype" : "Istuntojen määrä tietojen tyypin mukaan",
        "apm.wsa.label.requestcount" : "Pyyntöjen määrä",
        "apm.wsa.label.statusbreakdown" : "Tilan erittely",
        "apm.wsa.label.topwebservicesoperations" : "Suosituimmat verkkopalveluiden toiminnat",
        "apm.wsa.label.topwebservicesrecordprocessing" : "Suosituimpien verkkopalveluiden tietojenkäsittely",
        "apm.wsa.label.webservicesanalysis" : "Verkkopalveluiden analyysi",
        "apm.wsa.label.webservicesoperationstatus" : "Verkkopalveluiden toimintojen tila",
        "apm.wsa.label.webservicesrecordprocessing" : "Verkkopalveluiden tietojenkäsittely",
        "apm.wsa.label.webservicesrecordprocessingstatus" : "Verkkopalveluiden tietojenkäsittelyn tila",
        "apm.wsod.label.performancedetails" : "Suorituskykytiedot",
        "apm.wsod.label.timerange" : "Aikaväli",
        "apm.wsod.label.toprecordsperformance" : "Suosituimpien tietojen suorituskyky",
        "apm.wsod.label.webservicesoperationdetails" : "Verkkopalveluiden toimintojen tiedot",
        "apm.wsod.label.webservicesoperationlogs" : "Verkkopalveluiden toimintojen lokit",
        "apm.wsod.label.webservicesrecordprocessinglogs" : "Verkkopalveluiden tietojenkäsittelylokit",
        "apm.r2019a.profilerdetails": "Profiloijan tiedot",
        "apm.r2019a.averageexecutiontime": "Toteuttamisajan keskiarvo",
        "apm.r2019a.medianexecutiontime": "Toteuttamisajan mediaani",
        "apm.r2019a.average": "Keskiarvo",
        "apm.r2019a.important": "Tärkeää",
        "apm.r2019a.concurrencynote1": "Yleinen samanaikaisuus -portletti vaatii samanaikaisuusrajoituksen arvojen laskemiseen.",
        "apm.r2019a.concurrencynote2": "Kun samanaikaisuusrajoituksen arvo ei ole saatavilla (–), Yleinen samanaikaisuus -portletti käyttää yleistä rajoitusta, mikä saattaa aiheuttaa epäluotettavia arvoja.",
        "apm.r2019a.profiler": "Profiloija",
        "apm.r2019a.timingdetails": "Ajoitustiedot",
        "apm.r2019a.datetime": "Päivämäärä ja aika",
        "apm.r2019a.workflows": "Työnkulut",
        "apm.r2019a.recordsfromscriptsworkflows": "Tiedot komentosarjoista/työnkuluista",
        "apm.r2019a.requesturls": "Pyynnön URL-osoitteet",
        "apm.r2019a.entrypoint": "Syötepiste",
        "apm.r2019a.triggertype": "Käynnistystyyppi",
        "apm.r2019a.method": "Tapa",
        "apm.r2019a.webserviceoperation": "Verkkopalvelun toiminta",
        "apm.r2019a.apiversion": "API-versio",
        "apm.r2019a.profileroperationid": "Profiloijan toimintotunnus",
        "apm.r2019a.starttimeanddate": "Aloitusaika ja -päivämäärä",
        "apm.r2019a.scripts": "Komentosarjat",
        "apm.r2019a.profilertype": "Profiloijan tyyppi",
        "apm.r2019a.record": "Tiedot",
        "apm.r2019a.requesturl": "Pyynnön URL-osoite",
        "apm.r2019a.unclassified": "Luokittelematon",
        "apm.r2019a.url": "URL-osoite",
        "apm.r2019a.apicalls": "API-pyynnöt",
        "apm.r2019a.profilerdetailsalert": "APM:n profiloijan tiedot eivät voi tällä hetkellä näyttää tietoja ohjelman komentosarjoista. Avaa profiloijan tiedot palaamalla takaisin ja valitsemalla toinen komentosarja.",
        "apm.r2019a.top": "yläreuna",
        "apm.r2019a.actionhistoryon": "{0} toimintahistoria kohteessa {1} kohteesta {2}",
        "apm.r2019a.fromtopacifictime": "{0} {1}–{2} (PDT)",
        "apm.r2019a.onpacifictime": "{0} {1} {2} (PDT)",
        "apm.r2019a.actions": "Toiminnat",
        "apm.r2019a.alldevices": "Kaikki laitteet",
        "apm.r2019a.alllocations": "Kaikki sijainnit",
        "apm.r2019a.allsubsidiaries": "Kaikki tytäryhtiöt",
        "apm.r2019a.allusers": "Kaikki käyttäjät",
        "apm.r2019a.asofat": "{0} {1} alkaen",
        "apm.r2019a.averageduration": "keston keskiarvo",
        "apm.r2019a.clickanddragtozoom": "Napsauta ja vedä zoomataksesi",
        "apm.r2019a.moreinformation": "Napsauta tästä saadaksesi lisätietoja",
        "apm.r2019a.clientscripturl": "Ohjelman merkkijonon URL-osoite",
        "apm.r2019a.customcsurlrequests": "Mukautetut ohjelman merkkijonojen URL-pyynnöt",
        "apm.r2019a.customizationaverage": "Mukauttamisen keskiarvo",
        "apm.r2019a.lastupdatedon": "Mukauttamistiedot päivitetty viimeksi {0} {1}",
        "apm.r2019a.notavailable": "Mukauttamistietoja ei saatavilla",
        "apm.r2019a.customizationperformance": "Mukauttamisen suorituskyky",
        "apm.r2019a.customizationtime": "Mukauttamisaika",
        "apm.r2019a.device": "Laite",
        "apm.r2019a.devicelistisloading": "Laiteluetteloa ladataan. Odota.",
        "apm.r2019a.devicename": "Laitteen nimi",
        "apm.r2019a.devices": "Laitteet",
        "apm.r2019a.enddatetime": "Päättymispäivämäärä ja -aika",
        "apm.r2019a.event": "Tapahtuma",
        "apm.r2019a.executioncount": "Toteuttamismäärä",
        "apm.r2019a.filter": "Suodatin",
        "apm.r2019a.instances": "Tapaukset",
        "apm.r2019a.location": "Sijainti",
        "apm.r2019a.locationid": "Sijainnin tunnus",
        "apm.r2019a.locationlistisloading": "Sijaintiluetteloa ladataan. Odota.",
        "apm.r2019a.locations": "Sijainnit",
        "apm.r2019a.logid": "Lokin tunnus",
        "apm.r2019a.mostfrequent": "Yleisin",
        "apm.r2019a.nonbundle": "Ei-paketti",
        "apm.r2019a.nonbundledcomponents": "Pakettiin kuulumattomat komponentit",
        "apm.r2019a.operations": "Toiminnot",
        "apm.r2019a.overheadtime": "Yleiskuluaika",
        "apm.r2019a.pacifictime": "PDT-aikavyöhyke",
        "apm.r2019a.performancedataprocessing": "Suorituskykytietoja käsitellään edelleen. Jos haluat nähdä täydet tiedot, odota ennen tämän kuvakkeen napsauttamista, että arvot Käyttäjätapahtuman koodit- ja Työnkulku-sarakkeista tulevat näkyviin.",
        "apm.r2019a.enteravalidtotalduration": "Syötä kelvollinen kokonaiskesto",
        "apm.r2019a.enteravalidusereventtime": "Syötä kelvollinen käyttäjätapahtuman aika",
        "apm.r2019a.enteravalidworkflowtime": "Syötä kelvollinen työnkulun aika",
        "apm.r2019a.scisappothers": "SCIS-sovellus + muut",
        "apm.r2019a.scisbundle": "SCIS-paketti",
        "apm.r2019a.servertime": "Palvelinaika",
        "apm.r2019a.startdatetime": "Aloituspäivämäärä ja -aika",
        "apm.r2019a.subsidiary": "Tytäryhtiö",
        "apm.r2019a.subsidiaryid": "Tytäryhtiön tunnus",
        "apm.r2019a.subsidiarylistisloading": "Tytäryhtiöluetteloa ladataan. Odota.",
        "apm.r2019a.scisactionhistorydetail": "SuiteCommerce InStore -toimintahistorian tiedot",
        "apm.r2019a.scisperformancediagnostics": "SuiteCommerce InStore -suorituskyvyn diagnostiikka",
        "apm.r2019a.scisperformancesetup": "SuiteCommerce InStore -suorituskyvyn asetukset",
        "apm.r2019a.timebybundle": "Aika paketin mukaan",
        "apm.r2019a.timesources": "Aikalähteet",
        "apm.r2019a.total95th": "95. yhteensä",
        "apm.r2019a.totalaverage": "Keskiarvo yhteensä",
        "apm.r2019a.totalduration": "Kokonaiskesto",
        "apm.r2019a.totaldurationandcustomizationperformance": "Kokonaiskesto ja mukauttamisen suorituskyky ajan perusteella (PDT)",
        "apm.r2019a.totalmedian": "Mediaani yhteensä",
        "apm.r2019a.uninstalledbundle": "Paketin asennus poistettu",
        "apm.r2019a.usereventscripts": "Käyttäjätapahtuman koodit",
        "apm.r2019a.usereventtime": "Käyttäjätapahtuman aika",
        "apm.r2019a.userlistisloading": "Käyttäjäluetteloa ladataan. Odota.",
        "apm.r2019a.valuesarestillprocessing": "Arvoja, joissa on ajatusviiva (–), käsitellään edelleen. Odota, että arvot tulevat näkyviin, ennen kuin tarkastelet tietoja.",
        "apm.r2019a.viewchart": "Tarkastele kaaviota",
        "apm.r2019a.workflowname": "Työnkulun nimi",
        "apm.r2019a.workflowtime": "Työnkulun aika",
        "apm.r2019a.youcannotopenthispage": "Et voi avata tätä sivua, koska sovelluksen suorituskyvyn (APM) SuiteAppia ei ole asennettu.Asenna APM SuiteApp ja yritä uudelleen.",
        "apm.r2019a.fieldhelp": "Kentän ohje",
        "apm.r2019a.whatsthis": "Mikä tämä on?",
        "apm.r2019a.daterangefieldhelp": "Valitse SCIS-suorituskykytietojen tarkastelemisen ajanjakso. Päivämääräalue ei voi olla yli 30 päivää.",
        "apm.r2019a.locationfieldhelp": "Valitse sijainti, jos haluat keskittyä tietystä jälleenmyyntiliikkeestä kerättyihin suorituskykytietoihin.",
        "apm.r2019a.subsidiaryfieldhelp": "Valitse tytäryhtiö tarkastellaksesi tietyn tytäryhtiön toimintoihin perustuvia suorituskykytietoja tai tarkastele kaikkien tytäryhtiöiden suorituskykytietoja.",
        "apm.r2019a.devicefieldhelp": "Tarkastele suorituskykytietoja, jotka on kerätty tietyllä laitteella tai kaikilla SCIS-laitteilla.",
        "apm.r2019a.employeefieldhelp": "Valitse sen työntekijän nimi, joka voi tarkastella suorituskykytietoja, jotka liittyvät tietyn myyntikumppanin lähettämiin kauppatapahtumiin.",
        "apm.r2019a.sortfieldhelp": "Voit lajitella Toiminta-ruudut Yleisin- tai Pisin toteuttamisaika -arvojen perusteella. Yleisin näyttää toiminnat, jotka tapahtuvat useammin kuin muut. Toiminnoilla, joiden toteuttamisaika on pisin, on pisin kokonaiskesto.",
        "apm.r2020a.accounthealthdashboard": "Account Health Dashboard",
        "apm.r2020a.affectedintegrations": "Affected Integrations",
        "apm.r2020a.allowaccesstotheapm": "Allow access to the APM SuiteApp.",
        "apm.r2020a.allowaccesstothesuitecommerceinstore": "Allow access to theÂ SuiteCommerce InStore APM SuiteApp.",
        "apm.r2020a.asof": "As of",
        "apm.r2020a.dailyerrorrates": "Daily Error Rates",
        "apm.r2020a.deploymentsover100": "Deployments over 100",
        "apm.r2020a.endsnooze": "End Snooze",
        "apm.r2020a.error": "Error",
        "apm.r2020a.errors": "Errors",
        "apm.r2020a.failedjobs": "Failed Jobs",
        "apm.r2020a.highaveragewaittime": "High Average Wait Time",
        "apm.r2020a.higherrorrateforaccountconcurrency": "High Error Rate for Account Concurrency",
        "apm.r2020a.higherrorrateforuserconcurrency": "High Error Rate for User Concurrency",
        "apm.r2020a.higherrorrate": "High Error Rate",
        "apm.r2020a.highmedianrequesttime": "High Median Request Time",
        "apm.r2020a.highmedianresponsetime": "High Median Response Time",
        "apm.r2020a.highmediantimeperrecord": "High Median Time per Record",
        "apm.r2020a.highrateoffailedjobs": "High Rate of Failed Jobs",
        "apm.r2020a.hightimeoutrate": "High Timeout Rate",
        "apm.r2020a.includeserrors": "Includes Errors",
        "apm.r2020a.integrations": "Integrations",
        "apm.r2020a.investigate": "Investigate",
        "apm.r2020a.issue": "Issue",
        "apm.r2020a.lowusageofreservedprocessors": "Low Usage of Reserved Processors",
        "apm.r2020a.mediantimes": "Median Times",
        "apm.r2020a.noissuesdetectedrecently": "No issues detected recently.",
        "apm.r2020a.noissuesfound": "No Issues Found",
        "apm.r2020a.oftime": "of time",
        "apm.r2020a.operationid": "Operation ID",
        "apm.r2020a.performanceissue": "Performance Issue",
        "apm.r2020a.performanceissues": "Performance Issues",
        "apm.r2020a.rebuildsetup": "Rebuild Setup",
        "apm.r2020a.recordpagesmonitor": "Record Pages Monitor",
        "apm.r2020a.rejectedintegrationconcurrency": "Rejected Integration Concurrency",
        "apm.r2020a.requestsnearconcurrencylimit": "Requests Near Concurrency Limit",
        "apm.r2020a.showsnoozed": "Show Snoozed",
        "apm.r2020a.snooze": "Snooze",
        "apm.r2020a.snoozed": "snoozed",
        "apm.r2020a.stage": "Stage",
        "apm.r2020a.standardsupdate": "Standards Update",
        "apm.r2020a.standardsupdates": "Standards Updates",
        "apm.r2020a.suitescripts": "SuiteScripts",
        "apm.r2020a.thedatafortheoperationidisnotavailable": "The data for the operation ID that you entered is not available. The operation ID may be incorrect or the operation logs are still processing. Enter another operation ID in the Search by Operation ID field or try the same operation ID later.",
        "apm.r2020a.unsupportedwsdlversion": "Unsupported WSDL Version",
        "apm.r2020a.yes": "Yes",
        "apm.r2020a.yourprevioussetupwasretrieved": "Your previous setup was retrieved. To commit these changes, click Save."
    };

    return translation;
});