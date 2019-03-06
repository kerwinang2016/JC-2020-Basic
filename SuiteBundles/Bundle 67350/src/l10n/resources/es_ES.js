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
		"apm.cd.button.back" : "Atrás",
		"apm.cd.label.concurrencydetails" : "Detalles de concurrencia",
		"apm.cd.label.detailedconcurrency" : "Concurrencia detallada",
		"apm.cd.label.exceededconcurrency" : "Se excedió la concurrencia",
		"apm.cd.label.instancedetails" : "Detalles de instancia",
		"apm.cd.label.max" : "Máx. - {0}",
		"apm.cd.label.sec" : "segundo",
		"apm.cd.label.secs" : "segundos",
		"apm.cd.label.viewrequests" : "Ver solicitudes",
		"apm.cd.label.webservices" : "Servicios web",
		"apm.cm.label._101andabove" : "101 % y más",
		"apm.cm.label.concurrencylimit" : "Límite de concurrencia",
		"apm.cm.label.concurrencymonitor" : "Monitor de concurrencia",
		"apm.cm.label.concurrencyusage" : "Uso de concurrencia",
		"apm.cm.label.generalconcurrency" : "Concurrencia general",
		"apm.cm.label.highestexceededconcurrency" : "Máxima concurrencia excedida",
		"apm.cm.label.note" : "Nota",
		"apm.cm.label.peakconcurrency" : "Concurrencia máxima",
		"apm.cm.label.percentvaluesareapproximate" : "Los valores porcentuales son aproximados.",
		"apm.cm.label.requestexceedinglimit" : "Solicitudes que exceden el límite",
		"apm.cm.label.requestswithinlimit" : "Solicitudes dentro del límite (%)",
		"apm.cm.label.totalexceededconcurrency" : "Concurrencia excedida total",
		"apm.cm.label.valuesareexact" : "Los valores son exactos.",
		"apm.common.alert.daterange._30days" : "El rango de fechas no debe exceder los 30 días",
		"apm.common.alert.daterange._3days" : "El rango de fechas no debe ser inferior a 3 días",
		"apm.common.alert.enablefeatures" : "Las funciones [Registros personalizados], [SuiteScript del cliente] y [SuiteScript del servidor] deben estar habilitadas. Active las funciones y vuelva a intentarlo.",
		"apm.common.alert.endaterequired" : "La fecha de finalización es obligatoria",
		"apm.common.alert.entervalidenddate" : "Introduzca una fecha de finalización válida.",
		"apm.common.alert.entervalidstartdate" : "Introduzca una fecha de inicio válida.",
		"apm.common.alert.errorinsearch" : "Se encontró un error en la búsqueda",
		"apm.common.alert.errorinsuitelet" : "Se encontró un error en el suitelet",
		"apm.common.alert.invalidenddate" : "Fecha de finalización no válida",
		"apm.common.alert.invalidstartdate" : "Fecha de inicio no válida",
		"apm.common.alert.nocontent" : "Sin contenido",
		"apm.common.alert.startdateearlierthanenddate" : "La fecha de inicio debe ser anterior a la fecha de finalización.",
		"apm.common.alert.startdaterequired" : "La fecha de inicio es obligatoria",
		"apm.common.button.cancel" : "Cancelar",
		"apm.common.button.done" : "Listo",
		"apm.common.button.refresh" : "Actualizar",
		"apm.common.button.reset" : "Restablecer",
		"apm.common.button.set" : "Establecer",
		"apm.common.highcharts.drilluptext" : "Volver a",
		"apm.common.highcharts.nodata" : "Ningún dato para mostrar",
		"apm.common.highcharts.resetzoom" : "Restablecer zoom",
		"apm.common.highcharts.resetzoomtitle" : "Restablecer nivel de zoom 1:1",
		"apm.common.label._95th" : "95",
		"apm.common.label._95thpercentile" : "Percentil 95",
		"apm.common.label.all" : "Todo",
		"apm.common.label.asof" : "A partir de {0}",
		"apm.common.label.client" : "Cliente",
		"apm.common.label.close" : "Cerrar",
		"apm.common.label.companyid" : "ID de empresa",
		"apm.common.label.completed" : "Completado",
		"apm.common.label.concurrency" : "Concurrencia",
		"apm.common.label.concurrencycount" : "Recuento de concurrencia",
		"apm.common.label.context" : "Contexto",
		"apm.common.label.csvimport" : "Importación de CSV",
		"apm.common.label.custom" : "Personalizado",
		"apm.common.label.customdaterange" : "Rango de datos personalizado",
		"apm.common.label.customerdebugsettings" : "Configuración de depuración del cliente",
		"apm.common.label.dashboard" : "Panel de control",
		"apm.common.label.daterange" : "Rango de fechas",
		"apm.common.label.datetime" : "Fecha y hora",
		"apm.common.label.deploymentname" : "Nombre de implementación",
		"apm.common.label.edit" : "Editar",
		"apm.common.label.elevatedpriority" : "Prioridad elevada",
		"apm.common.label.email" : "Correo electrónico",
		"apm.common.label.enddate" : "Fecha de finalización",
		"apm.common.label.enddatetime" : "Hora y fecha de finalización",
		"apm.common.label.endtimerequired" : "La hora de finalización es obligatoria",
		"apm.common.label.errorrate" : "Tasa de error",
		"apm.common.label.exceededconcurrencycount" : "Se superó el recuento de concurrencia",
		"apm.common.label.executioncontext" : "Contexto de ejecución",
		"apm.common.label.executiontime" : "Tiempo de ejecución",
		"apm.common.label.exportcsv" : "Exportar - CSV",
		"apm.common.label.failed" : "Error",
		"apm.common.label.failedrequests" : "Solicitudes fallidas",
		"apm.common.label.filters" : "Filtros",
		"apm.common.label.from" : "Desde",
		"apm.common.label.histogram" : "Histograma",
		"apm.common.label.hr" : "hora",
		"apm.common.label.hrs" : "horas",
		"apm.common.label.instancecount" : "Recuento de instancias",
		"apm.common.label.integration" : "Integración",
		"apm.common.label.last12hours" : "Las últimas 12 horas",
		"apm.common.label.last14days" : "Los últimos 14 días",
		"apm.common.label.last1hour" : "Última hora",
		"apm.common.label.last24hours" : "Las últimas 24 horas",
		"apm.common.label.last30days" : "Los últimos 30 días",
		"apm.common.label.last3days" : "Los últimos 3 días",
		"apm.common.label.last3hours" : "Las últimas 3 horas",
		"apm.common.label.last6hours" : "Las últimas 6 horas",
		"apm.common.label.last7days" : "Los últimos 7 días",
		"apm.common.label.loading" : "Cargando",
		"apm.common.label.mapreduce" : "Asignar/Reducir",
		"apm.common.label.median" : "Mediana",
		"apm.common.label.min" : "minuto",
		"apm.common.label.mins" : "minutos",
		"apm.common.label.mostusers" : "La mayoría de los usuarios",
		"apm.common.label.name" : "Nombre",
		"apm.common.label.network" : "Red",
		"apm.common.label.new" : "Nuevo",
		"apm.common.label.nodataavailable" : "No hay datos disponibles",
		"apm.common.label.nodrilldowndata" : "No se devolvieron datos de desglose",
		"apm.common.label.none" : "Ninguno",
		"apm.common.label.norecordstoshow" : "No hay registros para mostrar",
		"apm.common.label.notiledatavailable" : "No hay datos disponibles para este cuadro",
		"apm.common.label.numberoflogs" : "Cantidad de registros",
		"apm.common.label.numberofusers" : "Cantidad de usuarios",
		"apm.common.label.operation" : "Operación",
		"apm.common.label.overview" : "Descripción general",
		"apm.common.label.pageinit" : "pageinit",
		"apm.common.label.percentage" : "Porcentaje",
		"apm.common.label.queue" : "Cola",
		"apm.common.label.recordoperations" : "Operaciones de registro",
		"apm.common.label.records" : "Registros",
		"apm.common.label.recordsperminute" : "Registros por minuto",
		"apm.common.label.recordtype" : "Tipo de registro",
		"apm.common.label.rejectedaccountconcurrency" : "Concurrencia de cuentas rechazadas",
		"apm.common.label.rejecteduserconcurrency" : "Concurrencia de usuarios rechazados",
		"apm.common.label.requests" : "Solicitudes",
		"apm.common.label.responsetime" : "Tiempo de respuesta",
		"apm.common.label.restlet" : "RESTlet",
		"apm.common.label.role" : "Rol",
		"apm.common.label.roles" : "Roles",
		"apm.common.label.save" : "Guardar",
		"apm.common.label.scheduled" : "Programado",
		"apm.common.label.scriptname" : "Nombre de script",
		"apm.common.label.selectionaffectallportlets" : "Las selecciones afectan a todos los portlets",
		"apm.common.label.server" : "Servidor",
		"apm.common.label.setup" : "Configurar",
		"apm.common.label.sorting" : "Orden",
		"apm.common.label.startdate" : "Fecha de inicio",
		"apm.common.label.startdatetime" : "Hora y fecha de inicio",
		"apm.common.label.status" : "Estado",
		"apm.common.label.timeline" : "Línea de tiempo",
		"apm.common.label.timeout" : "Se agotó el tiempo de espera",
		"apm.common.label.timeoutrate" : "Tasa de tiempo de espera",
		"apm.common.label.to" : "Hasta",
		"apm.common.label.total" : "Total",
		"apm.common.label.totalrecords" : "Registros totales",
		"apm.common.label.totalrequests" : "Solicitudes totales",
		"apm.common.label.totaltime" : "Tiempo total",
		"apm.common.label.type" : "Tipo",
		"apm.common.label.urlrequests" : "Solicitudes de URL",
		"apm.common.label.user" : "USUARIO",
		"apm.common.label.userevent" : "Evento de usuario",
		"apm.common.label.users" : "Usuarios",
		"apm.common.label.view" : "Ver",
		"apm.common.label.viewdetails" : "Ver detalles",
		"apm.common.label.viewfrhtdetails" : "er detalles de FRHT",
		"apm.common.label.viewing" : "Visualización",
		"apm.common.label.waittime" : "Tiempo de espera",
		"apm.common.label.webservice" : "Servicio web",
		"apm.common.month.april" : "Abril",
		"apm.common.month.august" : "Agosto",
		"apm.common.month.december" : "Diciembre",
		"apm.common.month.february" : "Febrero",
		"apm.common.month.january" : "Enero",
		"apm.common.month.july" : "Julio",
		"apm.common.month.june" : "Junio",
		"apm.common.month.march" : "Marzo",
		"apm.common.month.may" : "Mayo",
		"apm.common.month.november" : "Noviembre",
		"apm.common.month.october" : "Octubre",
		"apm.common.month.september" : "Septiembre",
		"apm.common.priority.high" : "Alto",
		"apm.common.priority.low" : "Bajo",
		"apm.common.priority.standard" : "Estándar",
		"apm.common.shortmonth.april" : "Abr",
		"apm.common.shortmonth.august" : "Ago",
		"apm.common.shortmonth.december" : "Dic",
		"apm.common.shortmonth.february" : "Feb",
		"apm.common.shortmonth.january" : "Ene",
		"apm.common.shortmonth.july" : "Jul",
		"apm.common.shortmonth.june" : "Jun",
		"apm.common.shortmonth.march" : "Mar",
		"apm.common.shortmonth.may" : "May",
		"apm.common.shortmonth.november" : "Nov",
		"apm.common.shortmonth.october" : "Oct",
		"apm.common.shortmonth.september" : "Sep",
		"apm.common.shortweekday.friday" : "V",
		"apm.common.shortweekday.monday" : "L",
		"apm.common.shortweekday.saturday" : "S",
		"apm.common.shortweekday.sunday" : "D",
		"apm.common.shortweekday.thursday" : "J",
		"apm.common.shortweekday.tuesday" : "M",
		"apm.common.shortweekday.wednesday" : "M",
		"apm.common.time.am" : "a. m.",
		"apm.common.time.pm" : "p. m.",
		"apm.common.tooltip.percentfromtotal" : "% del total",
		"apm.common.weekday.friday" : "Viernes",
		"apm.common.weekday.monday" : "Lunes",
		"apm.common.weekday.saturday" : "Sábado",
		"apm.common.weekday.sunday" : "Domingo",
		"apm.common.weekday.thursday" : "Jueves",
		"apm.common.weekday.tuesday" : "Martes",
		"apm.common.weekday.wednesday" : "Miércoles",
		"apm.db.alert.entervalidhistograminterval" : "Introduzca un intervalo de histograma válido",
		"apm.db.alert.entervalidresponsetime" : "Introduzca un tiempo de respuesta válido",
		"apm.db.alert.operationrequired" : "Operación es obligatorio",
		"apm.db.alert.recordtyperequired" : "Tipo de registro es obligatorio",
		"apm.db.alert.starttimerequired" : "Hora de inicio es obligatorio",
		"apm.db.alert.watchlist10items" : "Solo puede tener hasta 10 artículos en la lista de observación.",
		"apm.db.label.adddatetime" : "Agregar fecha y hora",
		"apm.db.label.addwatchlist" : "Agregar lista de observación",
		"apm.db.label.chartpreferences" : "Preferencias de gráfico",
		"apm.db.label.customdatetime" : "Fecha y hora personalizadas",
		"apm.db.label.duplicaterecordtypeoperation" : "Duplicar tipo de registro y operación",
		"apm.db.label.endtime" : "Hora de finalización",
		"apm.db.label.export" : "Exportar",
		"apm.db.label.general" : "General",
		"apm.db.label.highestresponsetime" : "Mayor tiempo de respuesta",
		"apm.db.label.mostutilized" : "Más utilizados",
		"apm.db.label.outof" : "{0} de {1}",
		"apm.db.label.recordinstance" : "Instancia de registro",
		"apm.db.label.recordinstances" : "Instancias de registro",
		"apm.db.label.recordpages" : "Páginas de registro",
		"apm.db.label.recordtiles" : "Cuadros de registro",
		"apm.db.label.removeall" : "Eliminar todo",
		"apm.db.label.setuprecordpages" : "Configurar páginas de registro",
		"apm.db.label.showallrecordtiles" : "Mostrar todos los cuadros de registro",
		"apm.db.label.showwatchlistonly" : "Mostrar solo la lista de observación",
		"apm.db.label.starttime" : "Hora de inicio",
		"apm.db.label.throughput" : "Rendimiento",
		"apm.db.label.unknown" : "Desconocido",
		"apm.db.label.usereventworkflow" : "Evento de usuario y flujo de trabajo",
		"apm.db.label.watchlist" : "Lista de observación",
		"apm.db.responsetimechart.clientnetworkserver" : "Cliente, red y servidor",
		"apm.db.setup.interval" : "Intervalo",
		"apm.ns.client.fieldchanged" : "fieldChanged",
		"apm.ns.client.lineinit" : "lineInit",
		"apm.ns.client.postsourcing" : "postSourcing",
		"apm.ns.client.recalc" : "recalc",
		"apm.ns.client.saverecord" : "saveRecord",
		"apm.ns.client.validatedelete" : "validateDelete",
		"apm.ns.client.validatefield" : "validateField",
		"apm.ns.client.validateinsert" : "validateInsert",
		"apm.ns.client.validateline" : "validateLine",
		"apm.ns.common.add" : "Agregar",
		"apm.ns.context.backend" : "BACK-END",
		"apm.ns.context.customfielddefault" : "CAMPO PERSONALIZADO PREDETERMINADO",
		"apm.ns.context.emailalert" : "ALERTA DE CORREO ELECTRÓNICO",
		"apm.ns.context.emailscheduled" : "CORREO ELECTRÓNICO PROGRAMADO",
		"apm.ns.context.machine" : "MÁQUINA",
		"apm.ns.context.other" : "OTROS",
		"apm.ns.context.reminder" : "RECORDATORIO",
		"apm.ns.context.snapshot" : "INSTANTÁNEA",
		"apm.ns.context.suitescript" : "SuiteScript",
		"apm.ns.context.website" : "SITIO WEB",
		"apm.ns.context.workflow" : "Flujo de trabajo",
		"apm.ns.status.finished" : "Finalizado",
		"apm.ns.triggertype.aftersubmit" : "aftersubmit",
		"apm.ns.triggertype.beforeload" : "beforeload",
		"apm.ns.triggertype.beforesubmit" : "beforesubmit",
		"apm.ns.wsa.delete" : "Eliminar",
		"apm.ns.wsa.update" : "Actualizar",
		"apm.ptd.label.clientheader" : "Cliente: encabezado",
		"apm.ptd.label.clientinit" : "Cliente: init",
		"apm.ptd.label.clientrender" : "Cliente: representar",
		"apm.ptd.label.deploymentid" : "ID de implementación",
		"apm.ptd.label.page" : "Página",
		"apm.ptd.label.pagetimedetails" : "Detalles del tiempo de página",
		"apm.ptd.label.script" : "Script",
		"apm.ptd.label.scriptaftersubmit" : "Script: aftersubmit: {0}",
		"apm.ptd.label.scriptbeforeload" : "Script: beforeload: {0}",
		"apm.ptd.label.scriptbeforesubmit" : "Script: beforesubmit: {0}",
		"apm.ptd.label.scriptpageinit" : "Script: pageinit: {0}",
		"apm.ptd.label.scripttypeworkflow" : "Tipo/Flujo de trabajo de Script",
		"apm.ptd.label.searches" : "Búsquedas",
		"apm.ptd.label.suitescriptworkflowdetails" : "Detalles de SuiteScript y del flujo de trabajo",
		"apm.ptd.label.time" : "Tiempo",
		"apm.ptd.label.usage" : "Uso",
		"apm.ptd.label.userevent" : "USEREVENT",
		"apm.pts.description._95thpercentile" : "El valor (o puntaje) por debajo del cual se puede encontrar el 95 por ciento de las observaciones",
		"apm.pts.description.average" : "El promedio de los números",
		"apm.pts.description.median" : "El número del medio (en una lista ordenada de números)",
		"apm.pts.description.standarddeviation" : "La medida de qué tan dispersos están los números",
		"apm.pts.label.aggregation" : "Acumulación",
		"apm.pts.label.and" : "Y",
		"apm.pts.label.between" : "Entre",
		"apm.pts.label.bundle" : "Paquete",
		"apm.pts.label.columnname" : "Nombre de la columna",
		"apm.pts.label.description" : "Descripción",
		"apm.pts.label.details" : "Detalles",
		"apm.pts.label.greaterthan" : "Mayor que",
		"apm.pts.label.lessthan" : "Menor que",
		"apm.pts.label.meanaverage" : "Media/Promedio",
		"apm.pts.label.netsuitesystem" : "Sistema NetSuite",
		"apm.pts.label.pagetimesummary" : "Resumen del tiempo de página",
		"apm.pts.label.performancelogs" : "Registros de rendimiento",
		"apm.pts.label.responsetimeinseconds" : "Tiempo de respuesta (en s)",
		"apm.pts.label.scriptworkflowtimebreakdown" : "Desglose del tiempo del script/flujo de trabajo",
		"apm.pts.label.setupsummary" : "Resumen de configuración",
		"apm.pts.label.show" : "Mostrar",
		"apm.pts.label.standarddeviation" : "Desviación estándar",
		"apm.pts.label.summary" : "Resumen",
		"apm.scpm.alert.startdate30dayscurrentdate" : "La fecha de inicio no debe exceder los 30 días a partir de la fecha actual.",
		"apm.scpm.label.available" : "Disponible",
		"apm.scpm.label.availabletime" : "Tiempo disponible",
		"apm.scpm.label.aveexecutiontime" : "Tiempo de ejecución prom.",
		"apm.scpm.label.averagewaittime" : "Tiempo de espera promedio",
		"apm.scpm.label.avewaittime" : "Tiempo de espera prom.",
		"apm.scpm.label.cancelled" : "Cancelado",
		"apm.scpm.label.complete" : "Completo",
		"apm.scpm.label.deferred" : "Diferido",
		"apm.scpm.label.elevated" : "Elevado",
		"apm.scpm.label.elevationinterval" : "Intervalo de elevación",
		"apm.scpm.label.jobs" : "Trabajos",
		"apm.scpm.label.jobscompleted" : "Trabajos completados",
		"apm.scpm.label.jobsfailed" : "Trabajos fallidos",
		"apm.scpm.label.jobstatus" : "Estado del trabajo",
		"apm.scpm.label.noofreservedprocessors" : "Cant. de procesadores reservados.",
		"apm.scpm.label.original" : "Original",
		"apm.scpm.label.pending" : "Pendiente",
		"apm.scpm.label.priority" : "Prioridad",
		"apm.scpm.label.priorityelevation" : "Elevación de prioridad",
		"apm.scpm.label.processing" : "Procesando",
		"apm.scpm.label.processorconcurrency" : "Concurrencia de procesador",
		"apm.scpm.label.processorreservation" : "Reserva de procesador",
		"apm.scpm.label.processors" : "Procesadores",
		"apm.scpm.label.processorsettings" : "Configuración del procesador",
		"apm.scpm.label.processorutilization" : "Utilización del procesador",
		"apm.scpm.label.queueprocessordetails" : "Detalles de cola/procesador",
		"apm.scpm.label.queues" : "Colas",
		"apm.scpm.label.reservedprocessorsinuse" : "Procesadores reservados en uso",
		"apm.scpm.label.retry" : "Reintentar",
		"apm.scpm.label.reuseidleprocessors" : "Reutilizar procesadores inactivos",
		"apm.scpm.label.totalnoofprocessors" : "Cant. total de procesadores",
		"apm.scpm.label.totalwaittime" : "Tiempo de espera total",
		"apm.scpm.label.utilization" : "Utilización",
		"apm.scpm.label.utilized" : "Utilizado",
		"apm.scpm.label.utilizedtime" : "Tiempo utilizado",
		"apm.scpm.label.waittimebypriority" : "Tiempo de espera por prioridad",
		"apm.setup.label.apmsetup" : "Configuración de APM",
		"apm.setup.label.employee" : "Empleado",
		"apm.setup.label.employees" : "Empleados",
		"apm.setup.label.setuppermissionlabel" : "Configurar permiso para la SuiteApp de gestión de rendimiento de la aplicación",
		"apm.setup.top10mostutilized" : "Principales 10 más utilizados",
		"apm.spa.label.highestexecutiontime" : "Mayor tiempo de ejecución",
		"apm.spa.label.mostrequested" : "Más solicitado",
		"apm.spa.label.mosttimeouts" : "Mayoría de tiempos de espera",
		"apm.spa.label.savedsearches" : "Búsquedas guardadas",
		"apm.spa.label.searchperformanceanalysis" : "Análisis de rendimiento de búsqueda",
		"apm.spd.alert.searchloadingwait" : "Sus búsquedas se están cargando. Espere.",
		"apm.spd.label.date" : "FECHA",
		"apm.spd.label.isfalse" : "falso",
		"apm.spd.label.istrue" : "verdadero",
		"apm.spd.label.savedsearch" : "BÚSQUEDA GUARDADA",
		"apm.spd.label.savedsearchbycontext" : "Búsqueda guardada por contexto",
		"apm.spd.label.savedsearchdetails" : "Detalles de búsqueda guardada",
		"apm.spd.label.savedsearchlogs" : "Registros de búsquedas guardadas",
		"apm.spd.label.searchperformancedetails" : "Buscar detalles de rendimiento",
		"apm.spjd.label.alldeployments" : "Todas las implementaciones",
		"apm.spjd.label.alltasktypes" : "Todos los tipos de tareas",
		"apm.spjd.label.datecreated" : "Fecha de creación",
		"apm.spjd.label.deployment" : "Implementación",
		"apm.spjd.label.jobdetails" : "Detalles del trabajo",
		"apm.spjd.label.jobdetailstimeline" : "Línea de tiempo de detalles del trabajo",
		"apm.spjd.label.mapreduceexecutiontime" : "Asignar/Reducir tiempo de ejecución",
		"apm.spjd.label.mapreducestage" : "Asignar/Reducir etapa",
		"apm.spjd.label.mapreducewaittime" : "Asignar/Reducir tiempo de espera",
		"apm.spjd.label.originalpriority" : "Prioridad original",
		"apm.spjd.label.scheduledexecutiontime" : "Hora de ejecución programada",
		"apm.spjd.label.scheduledwaittime" : "Tiempo de espera programado",
		"apm.spjd.label.suitecouldprocessorsjobdetails" : "Detalles de trabajo de los procesadores de SuiteCloud",
		"apm.spjd.label.taskid" : "ID de tarea",
		"apm.spjd.label.tasktype" : "Tipo de tarea",
		"apm.spm.label.suitecloudprocessormonitor" : "Monitor de procesadores de SuiteCloud",
		"apm.ssa.alert.enterclienteventtype" : "Seleccione un tipo de evento de cliente.",
		"apm.ssa.alert.enterscriptid" : "Introduzca una ID de script.",
		"apm.ssa.alert.enterscripttype" : "Seleccione un tipo de script.",
		"apm.ssa.alert.selectscriptname" : "Seleccione un nombre de script",
		"apm.ssa.label.clienteventtype" : "Tipo de evento de cliente",
		"apm.ssa.label.errorcount" : "Recuento de errores",
		"apm.ssa.label.performancechart" : "Gráfico de rendimiento",
		"apm.ssa.label.recordid" : "ID de registro",
		"apm.ssa.label.scriptid" : "ID de script",
		"apm.ssa.label.scripttype" : "Tipo de script",
		"apm.ssa.label.search" : "Buscar",
		"apm.ssa.label.searchcalls" : "Buscar llamadas",
		"apm.ssa.label.suitelet" : "Suitelet",
		"apm.ssa.label.suitescriptanalysis" : "Análisis de SuiteScript",
		"apm.ssa.label.suitescriptdetails" : "Detalles de SuiteScript",
		"apm.ssa.label.suitescriptexecutionovertime" : "Ejecución de SuiteScript en el tiempo",
		"apm.ssa.label.usagecount" : "Recuento de uso",
		"apm.ssa.label.usereventaftersubmit" : "Evento de usuario (después de enviar)",
		"apm.ssa.label.usereventbeforeload" : "Evento de usuario (antes de cargar)",
		"apm.ssa.label.usereventbeforesubmit" : "Evento de usuario (antes de enviar)",
		"apm.ssa.label.userinterface" : "Interfaz de usuario",
		"apm.ssa.label.value" : "Valor",
		"apm.ssa.label.viewlogs" : "Ver registros",
		"apm.ssa.label.webstore" : "Tienda web",
		"apm.wsa.apiversion.notreleased" : "No publicado",
		"apm.wsa.apiversion.notsupported" : "No compatible",
		"apm.wsa.apiversion.supported" : "Compatible",
		"apm.wsa.apiversionusage.retired" : "Retirado",
		"apm.wsa.label.apiversionusage" : "Uso de la versión de API",
		"apm.wsa.label.executiontimeperrecordtype" : "Tiempo de ejecución por tipo de registro",
		"apm.wsa.label.instancecountperrecordtype" : "Recuento de instancias por tipo de registro",
		"apm.wsa.label.requestcount" : "Recuento de solicitudes",
		"apm.wsa.label.statusbreakdown" : "Desglose de estado",
		"apm.wsa.label.topwebservicesoperations" : "Operaciones de servicios web principales",
		"apm.wsa.label.topwebservicesrecordprocessing" : "Procesamiento de registros de servicios web principales",
		"apm.wsa.label.webservicesanalysis" : "Análisis de servicios web",
		"apm.wsa.label.webservicesoperationstatus" : "Estado de operaciones de servicios web",
		"apm.wsa.label.webservicesrecordprocessing" : "Procesamiento de registros de servicios web",
		"apm.wsa.label.webservicesrecordprocessingstatus" : "Estado de procesamiento de los registros de servicios web",
		"apm.wsod.label.performancedetails" : "Detalles del rendimiento",
		"apm.wsod.label.timerange" : "Rango de tiempo",
		"apm.wsod.label.toprecordsperformance" : "Rendimiento de los registros principales",
		"apm.wsod.label.webservicesoperationdetails" : "Detalles de la operación de los servicios web",
		"apm.wsod.label.webservicesoperationlogs" : "Registros de la operación de los servicios web",
		"apm.wsod.label.webservicesrecordprocessinglogs" : "Registros de procesamiento de los registros de servicios web",
		"apm.common.label.performance" : "Rendimiento",

    	//NEW
        "apm.common.label.profilerdetails" : "Profiler Details",
        "apm.common.label.viewprofilerdetails" : "View Profiler Details"
    };

    return translation;
});