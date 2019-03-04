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
		"apm.cd.button.back" : "后退",
		"apm.cd.label.concurrencydetails" : "并发性详细信息",
		"apm.cd.label.detailedconcurrency" : "详细并发性",
		"apm.cd.label.exceededconcurrency" : "超出并发性",
		"apm.cd.label.instancedetails" : "实例详细信息",
		"apm.cd.label.max" : "最大 - {0}",
		"apm.cd.label.sec" : "秒",
		"apm.cd.label.secs" : "秒",
		"apm.cd.label.viewrequests" : "查看请求",
		"apm.cd.label.webservices" : "网络服务",
		"apm.cm.label._101andabove" : "101% 及以上",
		"apm.cm.label.concurrencylimit" : "并发性限制",
		"apm.cm.label.concurrencymonitor" : "并发性监视器",
		"apm.cm.label.concurrencyusage" : "并发性使用",
		"apm.cm.label.generalconcurrency" : "一般并发性",
		"apm.cm.label.highestexceededconcurrency" : "最高超出并发性",
		"apm.cm.label.note" : "注释",
		"apm.cm.label.peakconcurrency" : "峰值并发性",
		"apm.cm.label.percentvaluesareapproximate" : "百分比值是近似值。",
		"apm.cm.label.requestexceedinglimit" : "超过限制的请求数",
		"apm.cm.label.requestswithinlimit" : "限制内的请求数 (%)",
		"apm.cm.label.totalexceededconcurrency" : "总的超出并发性",
		"apm.cm.label.valuesareexact" : "值是准确的。",
		"apm.common.alert.daterange._30days" : "日期范围不应超过 30 天",
		"apm.common.alert.daterange._3days" : "日期范围不应小于 3 天",
		"apm.common.alert.enablefeatures" : "必须启用 [自定义记录]、[客户端 SuiteScript] 和 [服务器 SuiteScript] 功能。请启用这些功能，然后重试。",
		"apm.common.alert.endaterequired" : "“结束日期”是必需的",
		"apm.common.alert.entervalidenddate" : "请输入有效的结束日期。",
		"apm.common.alert.entervalidstartdate" : "请输入有效的开始日期。",
		"apm.common.alert.errorinsearch" : "搜索中遇到错误",
		"apm.common.alert.errorinsuitelet" : "suitelet 中遇到错误",
		"apm.common.alert.invalidenddate" : "无效结束日期",
		"apm.common.alert.invalidstartdate" : "无效开始日期",
		"apm.common.alert.nocontent" : "无内容",
		"apm.common.alert.startdateearlierthanenddate" : "开始日期必须早于结束日期。",
		"apm.common.alert.startdaterequired" : "“开始日期”是必需的",
		"apm.common.button.cancel" : "取消",
		"apm.common.button.done" : "完成",
		"apm.common.button.refresh" : "刷新",
		"apm.common.button.reset" : "重置",
		"apm.common.button.set" : "设置",
		"apm.common.highcharts.drilluptext" : "返回到",
		"apm.common.highcharts.nodata" : "无数据显示",
		"apm.common.highcharts.resetzoom" : "重置缩放",
		"apm.common.highcharts.resetzoomtitle" : "重置缩放级别 1:1",
		"apm.common.label._95th" : "第 95 个",
		"apm.common.label._95thpercentile" : "第 95 个百分位",
		"apm.common.label.all" : "全部",
		"apm.common.label.asof" : "截止 {0}",
		"apm.common.label.client" : "客户端",
		"apm.common.label.close" : "关闭",
		"apm.common.label.companyid" : "公司 ID",
		"apm.common.label.completed" : "已完成",
		"apm.common.label.concurrency" : "并发性",
		"apm.common.label.concurrencycount" : "并发计数",
		"apm.common.label.context" : "上下文",
		"apm.common.label.csvimport" : "CSV 导入",
		"apm.common.label.custom" : "自定义",
		"apm.common.label.customdaterange" : "自定义日期范围",
		"apm.common.label.customerdebugsettings" : "客户调试设置",
		"apm.common.label.dashboard" : "仪表板",
		"apm.common.label.daterange" : "日期范围",
		"apm.common.label.datetime" : "日期和时间",
		"apm.common.label.deploymentname" : "部署名称",
		"apm.common.label.edit" : "编辑",
		"apm.common.label.elevatedpriority" : "提升的优先级",
		"apm.common.label.email" : "电子邮件",
		"apm.common.label.enddate" : "结束日期",
		"apm.common.label.enddatetime" : "结束日期/时间",
		"apm.common.label.endtimerequired" : "“结束时间”是必需的",
		"apm.common.label.errorrate" : "错误费率",
		"apm.common.label.exceededconcurrencycount" : "超出并发计数",
		"apm.common.label.executioncontext" : "执行上下文",
		"apm.common.label.executiontime" : "执行时间",
		"apm.common.label.exportcsv" : "导出 - CSV",
		"apm.common.label.failed" : "失败",
		"apm.common.label.failedrequests" : "失败的请求数",
		"apm.common.label.filters" : "筛选器",
		"apm.common.label.from" : "从",
		"apm.common.label.histogram" : "直方图",
		"apm.common.label.hr" : "小时",
		"apm.common.label.hrs" : "小时",
		"apm.common.label.instancecount" : "实例计数",
		"apm.common.label.integration" : "集成",
		"apm.common.label.last12hours" : "过去 12 小时",
		"apm.common.label.last14days" : "过去 14 天",
		"apm.common.label.last1hour" : "过去 1 小时",
		"apm.common.label.last24hours" : "过去 24 小时",
		"apm.common.label.last30days" : "过去 30 天",
		"apm.common.label.last3days" : "过去 3 天",
		"apm.common.label.last3hours" : "过去 3 小时",
		"apm.common.label.last6hours" : "过去 6 小时",
		"apm.common.label.last7days" : "过去 7 天",
		"apm.common.label.loading" : "正在加载",
		"apm.common.label.mapreduce" : "Map/Reduce",
		"apm.common.label.median" : "中位数",
		"apm.common.label.min" : "分钟",
		"apm.common.label.mins" : "分钟",
		"apm.common.label.mostusers" : "大多数用户",
		"apm.common.label.name" : "名称",
		"apm.common.label.network" : "网络",
		"apm.common.label.new" : "新",
		"apm.common.label.nodataavailable" : "无数据可用",
		"apm.common.label.nodrilldowndata" : "未返回下钻数据",
		"apm.common.label.none" : "无",
		"apm.common.label.norecordstoshow" : "没有记录要显示",
		"apm.common.label.notiledatavailable" : "无数据可用于此磁贴",
		"apm.common.label.numberoflogs" : "日志数",
		"apm.common.label.numberofusers" : "用户数",
		"apm.common.label.operation" : "操作",
		"apm.common.label.overview" : "概述",
		"apm.common.label.pageinit" : "页面初始化",
		"apm.common.label.percentage" : "百分比",
		"apm.common.label.queue" : "队列",
		"apm.common.label.recordoperations" : "记录操作",
		"apm.common.label.records" : "记录",
		"apm.common.label.recordsperminute" : "每分钟记录数",
		"apm.common.label.recordtype" : "记录类型",
		"apm.common.label.rejectedaccountconcurrency" : "被拒账户并发性",
		"apm.common.label.rejecteduserconcurrency" : "被拒用户并发性",
		"apm.common.label.requests" : "请求",
		"apm.common.label.responsetime" : "响应时间",
		"apm.common.label.restlet" : "RESTlet",
		"apm.common.label.role" : "角色",
		"apm.common.label.roles" : "角色",
		"apm.common.label.save" : "保存",
		"apm.common.label.scheduled" : "已排定",
		"apm.common.label.scriptname" : "脚本名称",
		"apm.common.label.selectionaffectallportlets" : "选择影响所有门户组件",
		"apm.common.label.server" : "服务器",
		"apm.common.label.setup" : "设置",
		"apm.common.label.sorting" : "排序",
		"apm.common.label.startdate" : "开始日期",
		"apm.common.label.startdatetime" : "开始日期/时间",
		"apm.common.label.status" : "状态",
		"apm.common.label.timeline" : "时间轴",
		"apm.common.label.timeout" : "已超时",
		"apm.common.label.timeoutrate" : "超时率",
		"apm.common.label.to" : "至",
		"apm.common.label.total" : "总计",
		"apm.common.label.totalrecords" : "总记录数",
		"apm.common.label.totalrequests" : "总请求数",
		"apm.common.label.totaltime" : "总时间",
		"apm.common.label.type" : "类型",
		"apm.common.label.urlrequests" : "URL 请求",
		"apm.common.label.user" : "用户",
		"apm.common.label.userevent" : "用户事件",
		"apm.common.label.users" : "用户",
		"apm.common.label.view" : "视图",
		"apm.common.label.viewdetails" : "视图详细信息",
		"apm.common.label.viewfrhtdetails" : "视图 FRHT 详细信息",
		"apm.common.label.viewing" : "正在查看",
		"apm.common.label.waittime" : "等待时间",
		"apm.common.label.webservice" : "Web 服务",
		"apm.common.month.april" : "四月",
		"apm.common.month.august" : "八月",
		"apm.common.month.december" : "十二月",
		"apm.common.month.february" : "二月",
		"apm.common.month.january" : "一月",
		"apm.common.month.july" : "七月",
		"apm.common.month.june" : "六月",
		"apm.common.month.march" : "三月",
		"apm.common.month.may" : "五月",
		"apm.common.month.november" : "十一月",
		"apm.common.month.october" : "十月",
		"apm.common.month.september" : "九月",
		"apm.common.priority.high" : "高",
		"apm.common.priority.low" : "低",
		"apm.common.priority.standard" : "标准",
		"apm.common.shortmonth.april" : "四月",
		"apm.common.shortmonth.august" : "八月",
		"apm.common.shortmonth.december" : "十二月",
		"apm.common.shortmonth.february" : "二月",
		"apm.common.shortmonth.january" : "一月",
		"apm.common.shortmonth.july" : "七月",
		"apm.common.shortmonth.june" : "六月",
		"apm.common.shortmonth.march" : "三月",
		"apm.common.shortmonth.may" : "五月",
		"apm.common.shortmonth.november" : "十一月",
		"apm.common.shortmonth.october" : "十月",
		"apm.common.shortmonth.september" : "九月",
		"apm.common.shortweekday.friday" : "F",
		"apm.common.shortweekday.monday" : "M",
		"apm.common.shortweekday.saturday" : "S",
		"apm.common.shortweekday.sunday" : "S",
		"apm.common.shortweekday.thursday" : "T",
		"apm.common.shortweekday.tuesday" : "T",
		"apm.common.shortweekday.wednesday" : "W",
		"apm.common.time.am" : "AM",
		"apm.common.time.pm" : "PM",
		"apm.common.tooltip.percentfromtotal" : "% 距离总计",
		"apm.common.weekday.friday" : "星期五",
		"apm.common.weekday.monday" : "星期一",
		"apm.common.weekday.saturday" : "星期六",
		"apm.common.weekday.sunday" : "星期日",
		"apm.common.weekday.thursday" : "星期四",
		"apm.common.weekday.tuesday" : "星期二",
		"apm.common.weekday.wednesday" : "星期三",
		"apm.db.alert.entervalidhistograminterval" : "请输入有效的直方图间隔",
		"apm.db.alert.entervalidresponsetime" : "请输入有效的响应时间",
		"apm.db.alert.operationrequired" : "“操作”是必需的",
		"apm.db.alert.recordtyperequired" : "“记录类型”是必需的",
		"apm.db.alert.starttimerequired" : "“开始时间”是必需的",
		"apm.db.alert.watchlist10items" : "监视列表中最多只能有 10 项。",
		"apm.db.label.adddatetime" : "添加日期和时间",
		"apm.db.label.addwatchlist" : "添加监视列表",
		"apm.db.label.chartpreferences" : "图表首选项",
		"apm.db.label.customdatetime" : "自定义日期和时间",
		"apm.db.label.duplicaterecordtypeoperation" : "重复记录类型和操作",
		"apm.db.label.endtime" : "结束时间",
		"apm.db.label.export" : "导出",
		"apm.db.label.general" : "常规",
		"apm.db.label.highestresponsetime" : "最高响应时间",
		"apm.db.label.mostutilized" : "利用率最高",
		"apm.db.label.outof" : "{0}/{1}",
		"apm.db.label.recordinstance" : "记录实例",
		"apm.db.label.recordinstances" : "记录实例",
		"apm.db.label.recordpages" : "记录页",
		"apm.db.label.recordtiles" : "记录磁贴",
		"apm.db.label.removeall" : "全部清除",
		"apm.db.label.setuprecordpages" : "设置记录页",
		"apm.db.label.showallrecordtiles" : "显示全部记录磁贴",
		"apm.db.label.showwatchlistonly" : "只显示监视列表",
		"apm.db.label.starttime" : "开始时间",
		"apm.db.label.throughput" : "吞吐量",
		"apm.db.label.unknown" : "未知",
		"apm.db.label.usereventworkflow" : "用户事件和工作流",
		"apm.db.label.watchlist" : "监视列表",
		"apm.db.responsetimechart.clientnetworkserver" : "客户端、网络和服务器",
		"apm.db.setup.interval" : "时间间隔",
		"apm.ns.client.fieldchanged" : "fieldChanged",
		"apm.ns.client.lineinit" : "lineInit",
		"apm.ns.client.postsourcing" : "postSourcing",
		"apm.ns.client.recalc" : "recalc",
		"apm.ns.client.saverecord" : "saveRecord",
		"apm.ns.client.validatedelete" : "validateDelete",
		"apm.ns.client.validatefield" : "validateField",
		"apm.ns.client.validateinsert" : "validateInsert",
		"apm.ns.client.validateline" : "validateLine",
		"apm.ns.common.add" : "添加",
		"apm.ns.context.backend" : "后端",
		"apm.ns.context.customfielddefault" : "自定义字段默认",
		"apm.ns.context.emailalert" : "电子邮件提醒",
		"apm.ns.context.emailscheduled" : "预定的电子邮件",
		"apm.ns.context.machine" : "机器",
		"apm.ns.context.other" : "其他",
		"apm.ns.context.reminder" : "提示",
		"apm.ns.context.snapshot" : "快览",
		"apm.ns.context.suitescript" : "SuiteScript",
		"apm.ns.context.website" : "网站",
		"apm.ns.context.workflow" : "工作流",
		"apm.ns.status.finished" : "已完成",
		"apm.ns.triggertype.aftersubmit" : "提交后",
		"apm.ns.triggertype.beforeload" : "加载前",
		"apm.ns.triggertype.beforesubmit" : "提交前",
		"apm.ns.wsa.delete" : "删除",
		"apm.ns.wsa.update" : "更新",
		"apm.ptd.label.clientheader" : "客户端：标题",
		"apm.ptd.label.clientinit" : "客户端：初始化",
		"apm.ptd.label.clientrender" : "客户端：呈现",
		"apm.ptd.label.deploymentid" : "部署 ID",
		"apm.ptd.label.page" : "页面",
		"apm.ptd.label.pagetimedetails" : "页面时间详细信息",
		"apm.ptd.label.script" : "脚本",
		"apm.ptd.label.scriptaftersubmit" : "脚本：提交后：{0}",
		"apm.ptd.label.scriptbeforeload" : "脚本：加载前：{0}",
		"apm.ptd.label.scriptbeforesubmit" : "脚本：提交前：{0}",
		"apm.ptd.label.scriptpageinit" : "脚本：页面初始化：{0}",
		"apm.ptd.label.scripttypeworkflow" : "脚本类型/工作流",
		"apm.ptd.label.searches" : "搜索",
		"apm.ptd.label.suitescriptworkflowdetails" : "SuiteScript 和工作流详细信息",
		"apm.ptd.label.time" : "时间",
		"apm.ptd.label.usage" : "用量",
		"apm.ptd.label.userevent" : "用户事件",
		"apm.pts.description._95thpercentile" : "值（或分数），低于该值可能发现 95% 的观察值",
		"apm.pts.description.average" : "数字的平均值",
		"apm.pts.description.median" : "中间数（在数字的排序列表中）",
		"apm.pts.description.standarddeviation" : "数字如何扩散的度量",
		"apm.pts.label.aggregation" : "聚合",
		"apm.pts.label.and" : "与",
		"apm.pts.label.between" : "介于",
		"apm.pts.label.bundle" : "捆绑",
		"apm.pts.label.columnname" : "列名",
		"apm.pts.label.description" : "说明",
		"apm.pts.label.details" : "详细信息",
		"apm.pts.label.greaterthan" : "大于",
		"apm.pts.label.lessthan" : "小于",
		"apm.pts.label.meanaverage" : "平均",
		"apm.pts.label.netsuitesystem" : "NetSuite 系统",
		"apm.pts.label.pagetimesummary" : "页面时间汇总",
		"apm.pts.label.performancelogs" : "性能日志",
		"apm.pts.label.responsetimeinseconds" : "响应时间（秒）",
		"apm.pts.label.scriptworkflowtimebreakdown" : "脚本/工作流时间细分",
		"apm.pts.label.setupsummary" : "设置汇总",
		"apm.pts.label.show" : "显示",
		"apm.pts.label.standarddeviation" : "标准偏差",
		"apm.pts.label.summary" : "汇总",
		"apm.scpm.alert.startdate30dayscurrentdate" : "开始日期距离当前日期不应超过 30 天。",
		"apm.scpm.label.available" : "可用",
		"apm.scpm.label.availabletime" : "可用时间",
		"apm.scpm.label.aveexecutiontime" : "平均执行时间",
		"apm.scpm.label.averagewaittime" : "平均等待时间",
		"apm.scpm.label.avewaittime" : "平均等待时间",
		"apm.scpm.label.cancelled" : "已取消",
		"apm.scpm.label.complete" : "完成",
		"apm.scpm.label.deferred" : "已延迟",
		"apm.scpm.label.elevated" : "已提升",
		"apm.scpm.label.elevationinterval" : "提升间隔",
		"apm.scpm.label.jobs" : "作业",
		"apm.scpm.label.jobscompleted" : "已完成的作业",
		"apm.scpm.label.jobsfailed" : "失败的作业",
		"apm.scpm.label.jobstatus" : "作业状态",
		"apm.scpm.label.noofreservedprocessors" : "保留的处理器数。",
		"apm.scpm.label.original" : "原始",
		"apm.scpm.label.pending" : "待定",
		"apm.scpm.label.priority" : "优先级",
		"apm.scpm.label.priorityelevation" : "优先级提升",
		"apm.scpm.label.processing" : "正在处理",
		"apm.scpm.label.processorconcurrency" : "处理器并发性",
		"apm.scpm.label.processorreservation" : "处理器保留",
		"apm.scpm.label.processors" : "处理器",
		"apm.scpm.label.processorsettings" : "处理器设置",
		"apm.scpm.label.processorutilization" : "处理器利用率",
		"apm.scpm.label.queueprocessordetails" : "队列/处理器详细信息",
		"apm.scpm.label.queues" : "队列",
		"apm.scpm.label.reservedprocessorsinuse" : "在使用的保留处理器",
		"apm.scpm.label.retry" : "重试",
		"apm.scpm.label.reuseidleprocessors" : "重用空闲处理器",
		"apm.scpm.label.totalnoofprocessors" : "处理器总数",
		"apm.scpm.label.totalwaittime" : "总等待时间",
		"apm.scpm.label.utilization" : "利用率",
		"apm.scpm.label.utilized" : "已利用",
		"apm.scpm.label.utilizedtime" : "利用的时间",
		"apm.scpm.label.waittimebypriority" : "按优先级的等待时间",
		"apm.setup.label.apmsetup" : "APM 设置",
		"apm.setup.label.employee" : "雇员",
		"apm.setup.label.employees" : "雇员",
		"apm.setup.label.setuppermissionlabel" : "设置对应用程序性能管理 SuiteApp 的权限",
		"apm.setup.top10mostutilized" : "利用率最高的前 10 名",
		"apm.spa.label.highestexecutiontime" : "最高执行时间",
		"apm.spa.label.mostrequested" : "请求最多",
		"apm.spa.label.mosttimeouts" : "超时最多",
		"apm.spa.label.savedsearches" : "保存搜索",
		"apm.spa.label.searchperformanceanalysis" : "搜索性能分析",
		"apm.spd.alert.searchloadingwait" : "您的搜索正在加载。请等待。",
		"apm.spd.label.date" : "日期",
		"apm.spd.label.isfalse" : "假",
		"apm.spd.label.istrue" : "真",
		"apm.spd.label.savedsearch" : "保存搜索",
		"apm.spd.label.savedsearchbycontext" : "按上下文的保存搜索",
		"apm.spd.label.savedsearchdetails" : "保存搜索详细信息",
		"apm.spd.label.savedsearchlogs" : "保存搜索日志",
		"apm.spd.label.searchperformancedetails" : "搜索性能详细信息",
		"apm.spjd.label.alldeployments" : "所有部署",
		"apm.spjd.label.alltasktypes" : "所有任务类型",
		"apm.spjd.label.datecreated" : "创建日期",
		"apm.spjd.label.deployment" : "部署",
		"apm.spjd.label.jobdetails" : "作业详细信息",
		"apm.spjd.label.jobdetailstimeline" : "作业详细信息时间轴",
		"apm.spjd.label.mapreduceexecutiontime" : "Map/Reduce 执行时间",
		"apm.spjd.label.mapreducestage" : "Map/Reduce 阶段",
		"apm.spjd.label.mapreducewaittime" : "Map/Reduce 等待时间",
		"apm.spjd.label.originalpriority" : "原始优先级",
		"apm.spjd.label.scheduledexecutiontime" : "预定的执行时间",
		"apm.spjd.label.scheduledwaittime" : "预定的等待时间",
		"apm.spjd.label.suitecouldprocessorsjobdetails" : "SuiteCloud 处理器作业详细信息",
		"apm.spjd.label.taskid" : "任务 ID",
		"apm.spjd.label.tasktype" : "任务类型",
		"apm.spm.label.suitecloudprocessormonitor" : "SuiteCloud 处理器监视器",
		"apm.ssa.alert.enterclienteventtype" : "请选择客户端事件类型。",
		"apm.ssa.alert.enterscriptid" : "请输入脚本 Id。",
		"apm.ssa.alert.enterscripttype" : "请选择脚本类型。",
		"apm.ssa.alert.selectscriptname" : "请选择脚本名称",
		"apm.ssa.label.clienteventtype" : "客户端事件类型",
		"apm.ssa.label.errorcount" : "错误计数",
		"apm.ssa.label.performancechart" : "性能图表",
		"apm.ssa.label.recordid" : "记录 ID",
		"apm.ssa.label.scriptid" : "脚本 Id",
		"apm.ssa.label.scripttype" : "脚本类型",
		"apm.ssa.label.search" : "搜索",
		"apm.ssa.label.searchcalls" : "搜索调用",
		"apm.ssa.label.suitelet" : "Suitelet",
		"apm.ssa.label.suitescriptanalysis" : "SuiteScript 分析",
		"apm.ssa.label.suitescriptdetails" : "SuiteScript 详细信息",
		"apm.ssa.label.suitescriptexecutionovertime" : "随时间推移的 SuiteScript 执行",
		"apm.ssa.label.usagecount" : "使用计数",
		"apm.ssa.label.usereventaftersubmit" : "用户事件（提交后）",
		"apm.ssa.label.usereventbeforeload" : "用户事件（加载前）",
		"apm.ssa.label.usereventbeforesubmit" : "用户事件（提交前）",
		"apm.ssa.label.userinterface" : "用户界面",
		"apm.ssa.label.value" : "值",
		"apm.ssa.label.viewlogs" : "查看日志",
		"apm.ssa.label.webstore" : "网上商店",
		"apm.wsa.apiversion.notreleased" : "未发布",
		"apm.wsa.apiversion.notsupported" : "不受支持",
		"apm.wsa.apiversion.supported" : "受支持",
		"apm.wsa.apiversionusage.retired" : "已停用",
		"apm.wsa.label.apiversionusage" : "API 版本用量",
		"apm.wsa.label.executiontimeperrecordtype" : "执行时间/记录类型",
		"apm.wsa.label.instancecountperrecordtype" : "实例计数/记录类型",
		"apm.wsa.label.requestcount" : "请求计数",
		"apm.wsa.label.statusbreakdown" : "状态细分",
		"apm.wsa.label.topwebservicesoperations" : "排名靠前的网络服务操作",
		"apm.wsa.label.topwebservicesrecordprocessing" : "排名靠前的网络服务记录处理",
		"apm.wsa.label.webservicesanalysis" : "网络服务分析",
		"apm.wsa.label.webservicesoperationstatus" : "网络服务操作状态",
		"apm.wsa.label.webservicesrecordprocessing" : "网络服务记录处理",
		"apm.wsa.label.webservicesrecordprocessingstatus" : "网络服务记录处理状态",
		"apm.wsod.label.performancedetails" : "性能详细信息",
		"apm.wsod.label.timerange" : "时间范围",
		"apm.wsod.label.toprecordsperformance" : "排名靠前的记录性能",
		"apm.wsod.label.webservicesoperationdetails" : "网络服务操作详细信息",
		"apm.wsod.label.webservicesoperationlogs" : "网络服务操作日志",
		"apm.wsod.label.webservicesrecordprocessinglogs" : "网络服务记录处理日志",
		"apm.common.label.performance" : "性能",

    	//NEW
        "apm.common.label.profilerdetails" : "Profiler Details",
        "apm.common.label.viewprofilerdetails" : "View Profiler Details"
    };

    return translation;
});