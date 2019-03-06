/**
 * Copyright © 2019, Oracle and/or its affiliates. All rights reserved.
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
 *
 */
/**
 * @NModuleScope Public
 */
define(function() {
    var translation = {
		//latest update from masterlist: 07 Dec 2018 7:00AM
		
    	//REQUESTED	
		"apm.cd.button.back" : "Indietro",
		"apm.cd.label.concurrencydetails" : "Dettagli concorrenza",
		"apm.cd.label.detailedconcurrency" : "Concorrenza dettagliata",
		"apm.cd.label.exceededconcurrency" : "Concorrenza superata",
		"apm.cd.label.instancedetails" : "Dettagli istanza",
		"apm.cd.label.max" : "Max. - {0}",
		"apm.cd.label.sec" : "sec.",
		"apm.cd.label.secs" : "sec.",
		"apm.cd.label.viewrequests" : "Visualizza richieste",
		"apm.cd.label.webservices" : "Servizi Web",
		"apm.cm.label._101andabove" : "101% e oltre",
		"apm.cm.label.concurrencylimit" : "Limite concorrenza",
		"apm.cm.label.concurrencymonitor" : "Monitoraggio concorrenza",
		"apm.cm.label.concurrencyusage" : "Utilizzo concorrenza",
		"apm.cm.label.generalconcurrency" : "Concorrenza generale",
		"apm.cm.label.highestexceededconcurrency" : "Superamento concorrenza massimo",
		"apm.cm.label.note" : "Nota",
		"apm.cm.label.peakconcurrency" : "Concorrenza massima",
		"apm.cm.label.percentvaluesareapproximate" : "I valori percentuali sono approssimati.",
		"apm.cm.label.requestexceedinglimit" : "Richieste oltre i limiti",
		"apm.cm.label.requestswithinlimit" : "Richieste entro i limiti (%)",
		"apm.cm.label.totalexceededconcurrency" : "Superamento concorrenza totale",
		"apm.cm.label.valuesareexact" : "I valori sono esatti.",
		"apm.common.alert.daterange._30days" : "L’intervallo di date non deve essere superiore a 30 giorni",
		"apm.common.alert.daterange._3days" : "L’intervallo di date non deve essere inferiore a 3 giorni",
		"apm.common.alert.enablefeatures" : "Le funzionalità [Custom Records], [Client SuiteScript] e [Server SuiteScript] devono essere abilitate. Abilitare le funzionalità e riprovare.",
		"apm.common.alert.endaterequired" : "È necessaria una data di fine",
		"apm.common.alert.entervalidenddate" : "Inserire una data di fine valida.",
		"apm.common.alert.entervalidstartdate" : "Inserire una data di inizio valida.",
		"apm.common.alert.errorinsearch" : "Errore riscontrato durante la ricerca",
		"apm.common.alert.errorinsuitelet" : "Errore riscontrato nella Suitelet",
		"apm.common.alert.invalidenddate" : "Data di fine non valida",
		"apm.common.alert.invalidstartdate" : "Data di inizio non valida",
		"apm.common.alert.nocontent" : "Nessun contenuto",
		"apm.common.alert.startdateearlierthanenddate" : "La data di inizio deve precedere la data di fine",
		"apm.common.alert.startdaterequired" : "È necessaria una data di inizio",
		"apm.common.button.cancel" : "Annulla",
		"apm.common.button.done" : "Fatto",
		"apm.common.button.refresh" : "Aggiorna",
		"apm.common.button.reset" : "Ripristina",
		"apm.common.button.set" : "Imposta",
		"apm.common.highcharts.drilluptext" : "Torna a",
		"apm.common.highcharts.nodata" : "Nessun dato da visualizzare",
		"apm.common.highcharts.resetzoom" : "Reimposta zoom",
		"apm.common.highcharts.resetzoomtitle" : "Reimposta livello di zoom 1:1",
		"apm.common.label._95th" : "95°",
		"apm.common.label._95thpercentile" : "95° percentile",
		"apm.common.label.all" : "Tutto",
		"apm.common.label.asof" : "A partire da {0}",
		"apm.common.label.client" : "Client",
		"apm.common.label.close" : "Chiudi",
		"apm.common.label.companyid" : "ID società",
		"apm.common.label.completed" : "Completato",
		"apm.common.label.concurrency" : "Concorrenza",
		"apm.common.label.concurrencycount" : "Conteggio concorrenza",
		"apm.common.label.context" : "Contesto",
		"apm.common.label.csvimport" : "Importazione CSV",
		"apm.common.label.custom" : "Personalizzato",
		"apm.common.label.customdaterange" : "Intervallo di date personalizzato",
		"apm.common.label.customerdebugsettings" : "Impostazioni di debug cliente",
		"apm.common.label.dashboard" : "Dashboard",
		"apm.common.label.daterange" : "Intervallo di date",
		"apm.common.label.datetime" : "Data e ora",
		"apm.common.label.deploymentname" : "Nome distribuzione",
		"apm.common.label.edit" : "Modifica",
		"apm.common.label.elevatedpriority" : "Priorità elevata",
		"apm.common.label.email" : "E-mail",
		"apm.common.label.enddate" : "Data di fine",
		"apm.common.label.enddatetime" : "Data/ora di fine",
		"apm.common.label.endtimerequired" : "È necessaria un’ora di fine",
		"apm.common.label.errorrate" : "Frequenza errori",
		"apm.common.label.exceededconcurrencycount" : "Conteggio concorrenza superata",
		"apm.common.label.executioncontext" : "Contesto di esecuzione",
		"apm.common.label.executiontime" : "Tempo di esecuzione",
		"apm.common.label.exportcsv" : "Esporta - CSV",
		"apm.common.label.failed" : "Non riuscito",
		"apm.common.label.failedrequests" : "Richieste non riuscite",
		"apm.common.label.filters" : "Filtri",
		"apm.common.label.from" : "Da",
		"apm.common.label.histogram" : "Istogramma",
		"apm.common.label.hr" : "h",
		"apm.common.label.hrs" : "h",
		"apm.common.label.instancecount" : "Conteggio istanze",
		"apm.common.label.integration" : "Integrazione",
		"apm.common.label.last12hours" : "Ultime 12 ore",
		"apm.common.label.last14days" : "Ultimi 14 giorni",
		"apm.common.label.last1hour" : "Ultima ora",
		"apm.common.label.last24hours" : "Ultime 24 ore",
		"apm.common.label.last30days" : "Ultimi 30 giorni",
		"apm.common.label.last3days" : "Ultimi 3 giorni",
		"apm.common.label.last3hours" : "Ultime 3 ore",
		"apm.common.label.last6hours" : "Ultime 6 ore",
		"apm.common.label.last7days" : "Ultimi 7 giorni",
		"apm.common.label.loading" : "Caricamento",
		"apm.common.label.mapreduce" : "Mappa/Riduci",
		"apm.common.label.median" : "Mediana",
		"apm.common.label.min" : "min.",
		"apm.common.label.mins" : "min.",
		"apm.common.label.mostusers" : "Maggioranza utenti",
		"apm.common.label.name" : "Nome",
		"apm.common.label.network" : "Rete",
		"apm.common.label.new" : "Nuovo",
		"apm.common.label.nodataavailable" : "Nessun dato disponibile",
		"apm.common.label.nodrilldowndata" : "L’espansione non ha restituito dati",
		"apm.common.label.none" : "Nessuno",
		"apm.common.label.norecordstoshow" : "Nessun record da mostrare",
		"apm.common.label.notiledatavailable" : "Nessun dato disponibile per questo riquadro",
		"apm.common.label.numberoflogs" : "Numero di log",
		"apm.common.label.numberofusers" : "Numero di utenti",
		"apm.common.label.operation" : "Operazione",
		"apm.common.label.overview" : "Panoramica",
		"apm.common.label.pageinit" : "pageinit",
		"apm.common.label.percentage" : "Percentuale",
		"apm.common.label.queue" : "Coda",
		"apm.common.label.recordoperations" : "Operazioni del record",
		"apm.common.label.records" : "Record",
		"apm.common.label.recordsperminute" : "Record al minuto",
		"apm.common.label.recordtype" : "Tipo di record",
		"apm.common.label.rejectedaccountconcurrency" : "Concorrenza conto rifiutata",
		"apm.common.label.rejecteduserconcurrency" : "Concorrenza utente rifiutata",
		"apm.common.label.requests" : "Richieste",
		"apm.common.label.responsetime" : "Tempo di risposta",
		"apm.common.label.restlet" : "RESTlet",
		"apm.common.label.role" : "Ruolo",
		"apm.common.label.roles" : "Ruoli",
		"apm.common.label.save" : "Salva",
		"apm.common.label.scheduled" : "Pianificato",
		"apm.common.label.scriptname" : "Nome script",
		"apm.common.label.selectionaffectallportlets" : "Le selezioni interessano tutti i portlet",
		"apm.common.label.server" : "Server",
		"apm.common.label.setup" : "Configura",
		"apm.common.label.sorting" : "Ordinamento",
		"apm.common.label.startdate" : "Data di inizio",
		"apm.common.label.startdatetime" : "Data/ora di inizio",
		"apm.common.label.status" : "Stato",
		"apm.common.label.timeline" : "Cronologia",
		"apm.common.label.timeout" : "Timeout",
		"apm.common.label.timeoutrate" : "Frequenza di timeout",
		"apm.common.label.to" : "A",
		"apm.common.label.total" : "Totale",
		"apm.common.label.totalrecords" : "Record totali",
		"apm.common.label.totalrequests" : "Richieste totali",
		"apm.common.label.totaltime" : "Tempo totale",
		"apm.common.label.type" : "Tipo",
		"apm.common.label.urlrequests" : "Richieste URL",
		"apm.common.label.user" : "UTENTE",
		"apm.common.label.userevent" : "Evento utente",
		"apm.common.label.users" : "Utenti",
		"apm.common.label.view" : "Visualizza",
		"apm.common.label.viewdetails" : "Visualizza dettagli",
		"apm.common.label.viewfrhtdetails" : "Visualizza dettagli FRHT",
		"apm.common.label.viewing" : "Visualizzazione",
		"apm.common.label.waittime" : "Tempo di attesa",
		"apm.common.label.webservice" : "Servizio Web",
		"apm.common.month.april" : "Aprile",
		"apm.common.month.august" : "Agosto",
		"apm.common.month.december" : "Dicembre",
		"apm.common.month.february" : "Febbraio",
		"apm.common.month.january" : "Gennaio",
		"apm.common.month.july" : "Luglio",
		"apm.common.month.june" : "Giugno",
		"apm.common.month.march" : "Marzo",
		"apm.common.month.may" : "Maggio",
		"apm.common.month.november" : "Novembre",
		"apm.common.month.october" : "Ottobre",
		"apm.common.month.september" : "Settembre",
		"apm.common.priority.high" : "Alto",
		"apm.common.priority.low" : "Basso",
		"apm.common.priority.standard" : "Standard",
		"apm.common.shortmonth.april" : "Apr.",
		"apm.common.shortmonth.august" : "Ago.",
		"apm.common.shortmonth.december" : "Dic.",
		"apm.common.shortmonth.february" : "Feb.",
		"apm.common.shortmonth.january" : "Gen.",
		"apm.common.shortmonth.july" : "Lug.",
		"apm.common.shortmonth.june" : "Giu.",
		"apm.common.shortmonth.march" : "Mar.",
		"apm.common.shortmonth.may" : "Mag.",
		"apm.common.shortmonth.november" : "Nov.",
		"apm.common.shortmonth.october" : "Ott.",
		"apm.common.shortmonth.september" : "Set.",
		"apm.common.shortweekday.friday" : "V",
		"apm.common.shortweekday.monday" : "L",
		"apm.common.shortweekday.saturday" : "S",
		"apm.common.shortweekday.sunday" : "D",
		"apm.common.shortweekday.thursday" : "G",
		"apm.common.shortweekday.tuesday" : "M",
		"apm.common.shortweekday.wednesday" : "M",
		"apm.common.time.am" : "a.m.",
		"apm.common.time.pm" : "p.m.",
		"apm.common.tooltip.percentfromtotal" : "% del totale",
		"apm.common.weekday.friday" : "Venerdì",
		"apm.common.weekday.monday" : "Lunedì",
		"apm.common.weekday.saturday" : "Sabato",
		"apm.common.weekday.sunday" : "Domenica",
		"apm.common.weekday.thursday" : "Giovedì",
		"apm.common.weekday.tuesday" : "Martedì",
		"apm.common.weekday.wednesday" : "Mercoledì",
		"apm.db.alert.entervalidhistograminterval" : "Inserire un intervallo di istogramma valido",
		"apm.db.alert.entervalidresponsetime" : "Inserire un tempo di risposta valido",
		"apm.db.alert.operationrequired" : "È necessaria un’operazione",
		"apm.db.alert.recordtyperequired" : "È necessario il tipo di record",
		"apm.db.alert.starttimerequired" : "È necessaria un’ora di inizio",
		"apm.db.alert.watchlist10items" : "L’elenco di verifica può contenere un massimo di 10 voci.",
		"apm.db.label.adddatetime" : "Aggiungi data e ora",
		"apm.db.label.addwatchlist" : "Aggiungi elenco di verifica",
		"apm.db.label.chartpreferences" : "Preferenze grafico",
		"apm.db.label.customdatetime" : "Data e ora personalizzate",
		"apm.db.label.duplicaterecordtypeoperation" : "Duplica tipo di record e operazione",
		"apm.db.label.endtime" : "Ora di fine",
		"apm.db.label.export" : "Esporta",
		"apm.db.label.general" : "Generale",
		"apm.db.label.highestresponsetime" : "Tempo di risposta più elevato",
		"apm.db.label.mostutilized" : "Più utilizzato",
		"apm.db.label.outof" : "{0} di {1}",
		"apm.db.label.recordinstance" : "Istanza del record",
		"apm.db.label.recordinstances" : "Istanze del record",
		"apm.db.label.recordpages" : "Pagine del record",
		"apm.db.label.recordtiles" : "Riquadri del record",
		"apm.db.label.removeall" : "Rimuovi tutto",
		"apm.db.label.setuprecordpages" : "Configura pagine del record",
		"apm.db.label.showallrecordtiles" : "Mostra tutti i riquadri del record",
		"apm.db.label.showwatchlistonly" : "Mostra solo elenco di verifica",
		"apm.db.label.starttime" : "Ora di inizio",
		"apm.db.label.throughput" : "Velocità effettiva",
		"apm.db.label.unknown" : "Sconosciuto",
		"apm.db.label.usereventworkflow" : "Evento utente e flusso di lavoro",
		"apm.db.label.watchlist" : "Elenco di verifica",
		"apm.db.responsetimechart.clientnetworkserver" : "Client, rete e server",
		"apm.db.setup.interval" : "Intervallo",
		"apm.ns.client.fieldchanged" : "fieldChanged",
		"apm.ns.client.lineinit" : "lineInit",
		"apm.ns.client.postsourcing" : "postSourcing",
		"apm.ns.client.recalc" : "ricalc.",
		"apm.ns.client.saverecord" : "saveRecord",
		"apm.ns.client.validatedelete" : "validateDelete",
		"apm.ns.client.validatefield" : "validateField",
		"apm.ns.client.validateinsert" : "validateInsert",
		"apm.ns.client.validateline" : "validateLine",
		"apm.ns.common.add" : "Aggiungi",
		"apm.ns.context.backend" : "BACKEND",
		"apm.ns.context.customfielddefault" : "VALORI PREDEFINITI CAMPO PERSONALIZZATO",
		"apm.ns.context.emailalert" : "AVVISO E-MAIL",
		"apm.ns.context.emailscheduled" : "E-MAIL PIANIFICATA",
		"apm.ns.context.machine" : "COMPUTER",
		"apm.ns.context.other" : "ALTRO",
		"apm.ns.context.reminder" : "PROMEMORIA",
		"apm.ns.context.snapshot" : "ISTANTANEA",
		"apm.ns.context.suitescript" : "SuiteScript",
		"apm.ns.context.website" : "SITO WEB",
		"apm.ns.context.workflow" : "Flusso di lavoro",
		"apm.ns.status.finished" : "Terminato",
		"apm.ns.triggertype.aftersubmit" : "aftersubmit",
		"apm.ns.triggertype.beforeload" : "beforeload",
		"apm.ns.triggertype.beforesubmit" : "beforesubmit",
		"apm.ns.wsa.delete" : "Elimina",
		"apm.ns.wsa.update" : "Aggiorna",
		"apm.ptd.label.clientheader" : "Client: intestazione",
		"apm.ptd.label.clientinit" : "Client: inizializzazione",
		"apm.ptd.label.clientrender" : "Client: Render",
		"apm.ptd.label.deploymentid" : "ID distribuzione",
		"apm.ptd.label.page" : "Pagina",
		"apm.ptd.label.pagetimedetails" : "Dettagli ora pagina",
		"apm.ptd.label.script" : "Script",
		"apm.ptd.label.scriptaftersubmit" : "Script: aftersubmit: {0}",
		"apm.ptd.label.scriptbeforeload" : "Script: beforeload: {0}",
		"apm.ptd.label.scriptbeforesubmit" : "Script: beforesubmit: {0}",
		"apm.ptd.label.scriptpageinit" : "Script: pageinit: {0}",
		"apm.ptd.label.scripttypeworkflow" : "Tipo di script/Flusso di lavoro",
		"apm.ptd.label.searches" : "Ricerche",
		"apm.ptd.label.suitescriptworkflowdetails" : "Dettagli di SuiteScript e del flusso di lavoro",
		"apm.ptd.label.time" : "Ora",
		"apm.ptd.label.usage" : "Utilizzo",
		"apm.ptd.label.userevent" : "EVENTO UTENTE",
		"apm.pts.description._95thpercentile" : "Il valore (o punteggio) al di sotto del quale si trova il 95% delle osservazioni",
		"apm.pts.description.average" : "La media dei numeri",
		"apm.pts.description.median" : "Il numero medio (in un elenco ordinato di numeri)",
		"apm.pts.description.standarddeviation" : "Misura della distanza tra i numeri",
		"apm.pts.label.aggregation" : "Aggregazione",
		"apm.pts.label.and" : "E",
		"apm.pts.label.between" : "Tra",
		"apm.pts.label.bundle" : "Bundle",
		"apm.pts.label.columnname" : "Nome colonna",
		"apm.pts.label.description" : "Descrizione",
		"apm.pts.label.details" : "Dettagli",
		"apm.pts.label.greaterthan" : "Maggiore di",
		"apm.pts.label.lessthan" : "Minore di",
		"apm.pts.label.meanaverage" : "Valore intermedio/Media",
		"apm.pts.label.netsuitesystem" : "Sistema NetSuite",
		"apm.pts.label.pagetimesummary" : "Riepilogo ora pagina",
		"apm.pts.label.performancelogs" : "Log delle prestazioni",
		"apm.pts.label.responsetimeinseconds" : "Tempo di risposta (in sec.)",
		"apm.pts.label.scriptworkflowtimebreakdown" : "Ripartizione temporale script/flusso di lavoro",
		"apm.pts.label.setupsummary" : "Riepilogo configurazione",
		"apm.pts.label.show" : "Mostra",
		"apm.pts.label.standarddeviation" : "Deviazione standard",
		"apm.pts.label.summary" : "Riepilogo",
		"apm.scpm.alert.startdate30dayscurrentdate" : "La data di inizio non può superare di oltre 30 giorni la data odierna.",
		"apm.scpm.label.available" : "Disponibile",
		"apm.scpm.label.availabletime" : "Tempo disponibile",
		"apm.scpm.label.aveexecutiontime" : "Tempo di esecuzione medio",
		"apm.scpm.label.averagewaittime" : "Tempo di attesa medio",
		"apm.scpm.label.avewaittime" : "Tempo attesa med.",
		"apm.scpm.label.cancelled" : "Annullato",
		"apm.scpm.label.complete" : "Completo",
		"apm.scpm.label.deferred" : "Posticipato",
		"apm.scpm.label.elevated" : "Elevato",
		"apm.scpm.label.elevationinterval" : "Intervallo aumento",
		"apm.scpm.label.jobs" : "Job",
		"apm.scpm.label.jobscompleted" : "Job completati",
		"apm.scpm.label.jobsfailed" : "Job non riusciti",
		"apm.scpm.label.jobstatus" : "Stato job",
		"apm.scpm.label.noofreservedprocessors" : "N. di processori prenotati.",
		"apm.scpm.label.original" : "Originale",
		"apm.scpm.label.pending" : "In sospeso",
		"apm.scpm.label.priority" : "Priorità",
		"apm.scpm.label.priorityelevation" : "Aumento priorità",
		"apm.scpm.label.processing" : "Elaborazione",
		"apm.scpm.label.processorconcurrency" : "Concorrenza processore",
		"apm.scpm.label.processorreservation" : "Prenotazione processore",
		"apm.scpm.label.processors" : "Processori",
		"apm.scpm.label.processorsettings" : "Impostazioni processore",
		"apm.scpm.label.processorutilization" : "Utilizzo processore",
		"apm.scpm.label.queueprocessordetails" : "Dettagli coda/processore",
		"apm.scpm.label.queues" : "Code",
		"apm.scpm.label.reservedprocessorsinuse" : "Processori prenotati in uso",
		"apm.scpm.label.retry" : "Riprova",
		"apm.scpm.label.reuseidleprocessors" : "Riutilizza processori inattivi",
		"apm.scpm.label.totalnoofprocessors" : "N. totale processori",
		"apm.scpm.label.totalwaittime" : "Tempo di attesa totale",
		"apm.scpm.label.utilization" : "Utilizzo",
		"apm.scpm.label.utilized" : "Utilizzato",
		"apm.scpm.label.utilizedtime" : "Tempo utilizzato",
		"apm.scpm.label.waittimebypriority" : "Tempo di attesa per priorità",
		"apm.setup.label.apmsetup" : "Configurazione APM",
		"apm.setup.label.employee" : "Dipendente",
		"apm.setup.label.employees" : "Dipendenti",
		"apm.setup.label.setuppermissionlabel" : "Configura autorizzazione per la SuiteApp di gestione delle prestazioni delle applicazioni",
		"apm.setup.top10mostutilized" : "Primi 10 più utilizzati",
		"apm.spa.label.highestexecutiontime" : "Tempo di esecuzione più elevato",
		"apm.spa.label.mostrequested" : "Più richiesti",
		"apm.spa.label.mosttimeouts" : "Maggioranza di timeout",
		"apm.spa.label.savedsearches" : "Ricerche salvate",
		"apm.spa.label.searchperformanceanalysis" : "Analisi delle prestazioni di ricerca",
		"apm.spd.alert.searchloadingwait" : "Le ricerche sono in corso di caricamento. Attendere.",
		"apm.spd.label.date" : "DATA",
		"apm.spd.label.isfalse" : "false",
		"apm.spd.label.istrue" : "true",
		"apm.spd.label.savedsearch" : "RICERCA SALVATA",
		"apm.spd.label.savedsearchbycontext" : "Ricerca salvata per contesto",
		"apm.spd.label.savedsearchdetails" : "Dettagli ricerca salvata",
		"apm.spd.label.savedsearchlogs" : "Log ricerca salvata",
		"apm.spd.label.searchperformancedetails" : "Dettagli delle prestazioni di ricerca",
		"apm.spjd.label.alldeployments" : "Tutte le distribuzioni",
		"apm.spjd.label.alltasktypes" : "Tutti i tipi di attività",
		"apm.spjd.label.datecreated" : "Data di creazione",
		"apm.spjd.label.deployment" : "Distribuzione",
		"apm.spjd.label.jobdetails" : "Dettagli job",
		"apm.spjd.label.jobdetailstimeline" : "Cronologia dettagli job",
		"apm.spjd.label.mapreduceexecutiontime" : "Mappa/Riduci tempo di esecuzione",
		"apm.spjd.label.mapreducestage" : "Mappa/Riduci fase",
		"apm.spjd.label.mapreducewaittime" : "Mappa/Riduci tempo di attesa",
		"apm.spjd.label.originalpriority" : "Priorità originale",
		"apm.spjd.label.scheduledexecutiontime" : "Tempo di esecuzione pianificato",
		"apm.spjd.label.scheduledwaittime" : "Tempo di attesa pianificato",
		"apm.spjd.label.suitecouldprocessorsjobdetails" : "Dettagli job processori SuiteCloud",
		"apm.spjd.label.taskid" : "ID attività",
		"apm.spjd.label.tasktype" : "Tipo di attività",
		"apm.spm.label.suitecloudprocessormonitor" : "Monitoraggio processori SuiteCloud",
		"apm.ssa.alert.enterclienteventtype" : "Selezionare un tipo di evento client.",
		"apm.ssa.alert.enterscriptid" : "Inserire un ID di script.",
		"apm.ssa.alert.enterscripttype" : "Inserire un tipo di script.",
		"apm.ssa.alert.selectscriptname" : "Selezionare un nome di script",
		"apm.ssa.label.clienteventtype" : "Tipo di evento client",
		"apm.ssa.label.errorcount" : "Conteggio errori",
		"apm.ssa.label.performancechart" : "Grafico delle prestazioni",
		"apm.ssa.label.recordid" : "ID record",
		"apm.ssa.label.scriptid" : "ID di script",
		"apm.ssa.label.scripttype" : "Tipo di script",
		"apm.ssa.label.search" : "Ricerca",
		"apm.ssa.label.searchcalls" : "Ricerca chiamate",
		"apm.ssa.label.suitelet" : "Suitelet",
		"apm.ssa.label.suitescriptanalysis" : "Analisi di SuiteScript",
		"apm.ssa.label.suitescriptdetails" : "Dettagli di SuiteScript",
		"apm.ssa.label.suitescriptexecutionovertime" : "Esecuzione di SuiteScript nel tempo",
		"apm.ssa.label.usagecount" : "Conteggio utilizzo",
		"apm.ssa.label.usereventaftersubmit" : "Evento utente (After Submit)",
		"apm.ssa.label.usereventbeforeload" : "Evento utente (Before Load)",
		"apm.ssa.label.usereventbeforesubmit" : "Evento utente (Before Submit)",
		"apm.ssa.label.userinterface" : "Interfaccia utente",
		"apm.ssa.label.value" : "Valore",
		"apm.ssa.label.viewlogs" : "Visualizza log",
		"apm.ssa.label.webstore" : "Webstore",
		"apm.wsa.apiversion.notreleased" : "Non rilasciato",
		"apm.wsa.apiversion.notsupported" : "Non supportato",
		"apm.wsa.apiversion.supported" : "Supportato",
		"apm.wsa.apiversionusage.retired" : "Ritirato",
		"apm.wsa.label.apiversionusage" : "Utilizzo versione API",
		"apm.wsa.label.executiontimeperrecordtype" : "Tempo di esecuzione per tipo di record",
		"apm.wsa.label.instancecountperrecordtype" : "Conteggio istanze per tipo di record",
		"apm.wsa.label.requestcount" : "Conteggio richieste",
		"apm.wsa.label.statusbreakdown" : "Ripartizione stato",
		"apm.wsa.label.topwebservicesoperations" : "Operazioni servizi Web principali",
		"apm.wsa.label.topwebservicesrecordprocessing" : "Elaborazione record servizi Web principali",
		"apm.wsa.label.webservicesanalysis" : "Analisi servizi Web",
		"apm.wsa.label.webservicesoperationstatus" : "Stato operazioni servizi Web",
		"apm.wsa.label.webservicesrecordprocessing" : "Elaborazione record servizi Web",
		"apm.wsa.label.webservicesrecordprocessingstatus" : "Stato elaborazione record servizi Web",
		"apm.wsod.label.performancedetails" : "Dettagli prestazioni",
		"apm.wsod.label.timerange" : "Intervallo di tempo",
		"apm.wsod.label.toprecordsperformance" : "Prestazioni record principali",
		"apm.wsod.label.webservicesoperationdetails" : "Dettagli operazione servizi Web",
		"apm.wsod.label.webservicesoperationlogs" : "Log operazione servizi Web",
		"apm.wsod.label.webservicesrecordprocessinglogs" : "Log elaborazione record servizi Web",
		"apm.common.label.performance" : "Prestazioni",

    	//NEW
        "apm.common.label.profilerdetails" : "Profiler Details",
        "apm.common.label.viewprofilerdetails" : "View Profiler Details"
    };

    return translation;
});