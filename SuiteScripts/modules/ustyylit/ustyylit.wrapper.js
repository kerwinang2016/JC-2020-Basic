/**
 * ustyylit.wrapper.js
 *
 * @NApiVersion 2.x
 * @NAmdConfig /SuiteScripts/amd-config.json
 */


var APPSECRET = "80dec8520q6e9r7dk4oy8cr89o6t7ow3";
var BRAND = "TU";
var TESTMODE = false;
var StatusData = {
  "OrderStatus": {
	"1001": "On hold",
	"1002": "Processed",
	"1003": "Confirmed",
	"1004": "In production",
	"1005": "Left factory",
	"1006": "Delivered",
	"1007": "Cancelled",
	"1009": "Production Complete"
  },
  "FabricStatus": {
	"1202": "Fabric Ready"
  },
  "ShippingStatus": {
	"1301": "Internal Transition",
	"1302": "Direct shipment",
	"1303": "Domestic delivery"
  },
  "OrderStatusInternalId": {
	"ON HOLD": "6",
	"PROCESSED": "7",
	"CONFIRMED": "8",
	"IN PRODUCTION": "2",
	"LEFT FACTORY": "9",
	"DELIVERED": "10",
	"CANCELLED": "11",
	"PRODUCTION COMPLETE": "14"
  },
  "OrderStatusMap":{
	"1001": "6",
	"1002": "7",
	"1003": "8",
	"1004": "2",
	"1005": "9",
	"1006": "10",
	"1007": "11",
	"1009": "14"
  }
};
 var garmentData = {
   "FitTool_Shorts": {
			"TOTAL-RISE-MAX": "mkzd_jiashangdang",
			"TOTAL-RISE-MIN": "mkzd_jianshangdang",
			"FRONT-RISE-MAX": "mkzd_jiaqiandang",
			"FRONT-RISE-MIN": "mkzd_jianqiandang",
			"BACK-RISE-MAX":  "mkzd_jiahoudang",
			"BACK-RISE-MIN": "mkzd_jianhoudang",
			"FLAT-SEAT-MIN": "mkzd_jiandangwei",
			"BACK-RISE-CURVE-MIN": "mkzd_jiandang",
			"BACK-RISE-CURVE-MAX": "mkzd_jiadang",
			"CROTCH-MAX": "mkzd_jiadadangkuan",
			"CROTCH-MIN": "mkzd_jiandadangkuan",
			"1/2-WAIST-MAX": "mkzd_jiayaowei",
			"1/2-WAIST-MIN": "mkzd_jianyaowei",
			"1/2-SEAT-MAX": "mkzd_jiatunwei",
			"1/2-SEAT-MIN": "mkzd_jiantunwei",
			"1/2-HIP-MAX": "mkzd_jiacetunwei",
			"1/2-HIP-MIN": "mkzd_jiancetunwei",
			"1/2-FOOT-MAX": "mkzd_jiajiaokoukuan",
			"1/2-FOOT-MIN": "mkzd_jianjiaokoukuan",
			"LEG-LENGTH-LEFT-MAX": "mkzd_jiazuotuichang",
			"LEG-LENGTH-LEFT-MIN": "mkzd_jianzuotuichang",
			"LEG-LENGTH-RIGHT-MAX": "mkzd_jiayoutuichang",
			"LEG-LENGTH-RIGHT-MIN": "mkzd_jianyoutuichang"
		},
		"FitTool_Morning-Coat":{
			"1/2-BACK-MAX": "mtux_jiabeikuan",
			"1/2-BACK-MIN": "mtux_jianbeikuan",
			"1/2-CHEST-MAX": "mtux_jiaxiongwei",
			"1/2-CHEST-MIN": "mtux_jianxiongwei",
			"1/2-CHEST-FRONT-MAX": "mtux_jiaqianxiongkuan",
			"1/2-CHEST-FRONT-MIN": "mtux_jianqianxiongkuan",
			"1/2-COLLAR-MIN": "mtux_jianlingkou",
			"1/2-FRONT-MAX": "mtux_jiaqianzhikou",
			"1/2-FRONT-MIN": "mtux_jianqianzhikou",
			"1/2-GIRTH-MAX": "mtux_jiayaowei",
			"1/2-GIRTH-MIN": "mtux_jianyaowei",
			"1/2-HAND-MAX": "mtux_jiaxiukou",
			"1/2-HAND-MIN": "mtux_jianxiukou",
			"1/2-SHOULDER-MAX": "mtux_jiajiankuan",
			"1/2-SHOULDER-MIN": "mtux_jianjiankuan",
			"UPPER-ARM-MAX": "mtux_jiaxiufei",
			"UPPER-ARM-MIN": "mtux_jianxiufei",
			"ARMHOLE-DEPTH-MAX": "mtux_jiaxiulong",
			"ARMHOLE-DEPTH-MIN": "mtux_jianxiulong",
			"CHEST-POCKET-POSITION-MAX": "mtux_jiaxiongdouwei",
			"COLLAR-HEIGHT-MAX": "mtux_jialinggao",
			"COLLAR-HEIGHT-MIN": "mtux_jianlinggao",
			"LAPEL-LENGTH-MAX": "mtux_jiachangbotou",
			"LAPEL-LENGTH-MIN": "mtux_suoduanbotou",
			"LENGTH-MAX": "mtux_jiahouyichang",
			"LENGTH-MIN": "mtux_jianhouyichang",
			"POSTURE-MAX": "mtux_tuobeiti",
			"POSTURE-MIN": "mtux_houyangti",
			"SHOULDER-HEIGHT-LEFT-MAX": "mtux_jiazuojiangao",
			"SHOULDER-HEIGHT-LEFT-MIN": "mtux_jianzuojiangao",
			"SHOULDER-HEIGHT-RIGHT-MIN": "mtux_jianyoujiangao",
			"SHOULDER-HEIGHT-RIGHT-MAX": "mtux_jiayoujiangao",
			"SHOULDER-POSITION-MAX": "mtux_qianchongjian",
			"SHOULDER-POSITION-MIN": "mtux_houchongjian",
			"SLEEVE-LENGTH-LEFT-MIN": "mtux_jianzuoxiuchang",
			"SLEEVE-LENGTH-LEFT-MAX": "mtux_jiazuoxiuchang",
			"SLEEVE-LENGTH-RIGHT-MAX": "mtux_jiayouxiuchang",
			"SLEEVE-LENGTH-RIGHT-MIN": "mtux_jianyouxiuchang",
			"SLEEVE-POSITION-MAX": "mtux_qianxiuyiwei",
			"SLEEVE-POSITION-MIN": "mtux_houxiuyiwei",
			"ARMHOLE-WIDTH": "mtux_jiakuanxiulong"
		},
		"FitTool_Camp-Shirt":{
			"1/2-CHEST-MAX": "mxxcsd_jiaxiongwei",
			"1/2-CHEST-MIN": "mxxcsd_jianxiongwei",
			"1/2-CHEST-FRONT-MAX": "mxxcsd_jiaqianxiongwei",
			"1/2-CHEST-FRONT-MIN": "mxxcsd_jianqianxiongwei",
			"1/2-HIP-MAX": "mxxcsd_jiatunwei",
			"1/2-HIP-MIN": "mxxcsd_jiantunwei",
			"1/2-SHOULDER-MAX": "mxxcsd_jiajiankuan",
			"1/2-SHOULDER-MIN": "mxxcsd_jianjiankuan",
			"1/2-WAIST-MAX": "mxxcsd_jiayaowei",
			"1/2-WAIST-MIN": "mxxcsd_jianyaowei",
			"ARMHOLE-DEPTH-MAX": "mxxcsd_jiaxiulong",
			"ARMHOLE-DEPTH-MIN": "mxxcsd_jianxiulong",
			"COLLAR-SIZE-MAX": "mxxcsd_jialingkuan",
			"COLLAR-SIZE-MIN": "mxxcsd_jianlingkuan",
			"CUFF-WIDTH-LEFT-MAX": "mxxcsd_jiazuoxiukoukuan",
			"CUFF-WIDTH-LEFT-MIN": "mxxcsd_jianzuoxiukoukuan",
			"CUFF-WIDTH-RIGHT-MAX": "mxxcsd_jiayouxiukoukuan",
			"CUFF-WIDTH-RIGHT-MIN": "mxxcsd_jianyouxiukoukuan",
			"FRONT-LENGTH-MAX": "mxxcsd_jiaqianyichang",
			"FRONT-LENGTH-MIN": "mxxcsd_jianqianyichang",
			"LENGTH-MAX": "mxxcsd_jiahouyichang",
			"LENGTH-MIN": "mxxcsd_jianhouyichang",
			"NECKBAND-POSITION-MAX": "mxxcsd_jialingshen",
			"NECKBAND-POSITION-MIN": "mxxcsd_jianlingshen",
			"SHOULDER-HEIGHT-LEFT-MAX": "mxxcsd_jiazuojiangao",
			"SHOULDER-HEIGHT-LEFT-MIN": "mxxcsd_jianzuojiangao",
			"SHOULDER-HEIGHT-RIGHT-MAX": "mxxcsd_jiayoujiangao",
			"SHOULDER-HEIGHT-RIGHT-MIN": "mxxcsd_jianyoujiangao",
			"SLEEVE-LENGTH-LEFT-MAX": "mxxcsd_jiazuoxiuchang",
			"SLEEVE-LENGTH-LEFT-MIN": "mxxcsd_jianzuoxiuchang",
			"SLEEVE-LENGTH-RIGHT-MAX": "mxxcsd_jiayouxiuchang",
			"SLEEVE-LENGTH-RIGHT-MIN": "mxxcsd_jianyouxiuchang",
			"TOP-BUTTON-POSITION-MIN": "mxxcsd_jiankouweigao",
			"UPPER-ARM/ARMHOLE-MAX": "mxxcsd_jiadabiwei",
			"UPPER-ARM/ARMHOLE-MIN": "mxxcsd_jiandabiwei"
		},
		"FitTool_Shirt-Jacket":{
			"1/2-CHEST-MAX": "mxxcs_jiaxiongwei",
			"1/2-CHEST-MIN": "mxxcs_jianxiongwei",
			"1/2-CHEST-FRONT-MIN": "mxxcs_jianqianxiongwei",
			"1/2-CHEST-FRONT-MAX": "mxxcs_jiaqianxiongwei",
			"1/2-HIP-MAX": "mxxcs_jiatunwei",
			"1/2-HIP-MIN": "mxxcs_jiantunwei",
			"1/2-SHOULDER-MIN": "mxxcs_jianjiankuan",
			"1/2-SHOULDER-MAX": "mxxcs_jiajiankuan",
			"1/2-WAIST-MAX": "mxxcs_jiayaowei",
			"1/2-WAIST-MIN": "mxxcs_jianyaowei",
			"ARMHOLE-DEPTH-MAX": "mxxcs_jiaxiulong",
			"ARMHOLE-DEPTH-MIN": "mxxcs_jianxiulong",
			"COLLAR-SIZE-MAX": "mxxcs_jialingkuan",
			"COLLAR-SIZE-MIN": "mxxcs_jianlingkuan",
			"CUFF-WIDTH-LEFT-MAX": "mxxcs_jiazuoxiukoukuan",
			"CUFF-WIDTH-LEFT-MIN": "mxxcs_jianzuoxiukoukuan",
			"CUFF-WIDTH-RIGHT-MIN": "mxxcs_jianyouxiukoukuan",
			"CUFF-WIDTH-RIGHT-MAX": "mxxcs_jiayouxiukoukuan",
			"FRONT-LENGTH-MAX": "mxxcs_jiaqianyichang",
			"FRONT-LENGTH-MIN": "mxxcs_jianqianyichang",
			"LENGTH-MIN": "mxxcs_jianhouyichang",
			"LENGTH-MAX": "mxxcs_jiahouyichang",
			"NECKBAND-POSITION-MIN": "mxxcs_jianlingshen",
			"NECKBAND-POSITION-MAX": "mxxcs_jialingshen",
			"SHOULDER-HEIGHT-LEFT-MIN": "mxxcs_jianzuojiangao",
			"SHOULDER-HEIGHT-LEFT-MAX": "mxxcs_jiazuojiangao",
			"SHOULDER-HEIGHT-RIGHT-MAX": "mxxcs_jiayoujiangao",
			"SHOULDER-HEIGHT-RIGHT-MIN": "mxxcs_jianyoujiangao",
			"SLEEVE-LENGTH-LEFT-MAX": "mxxcs_jiazuoxiuchang",
			"SLEEVE-LENGTH-LEFT-MIN": "mxxcs_jianzuoxiuchang",
			"SLEEVE-LENGTH-RIGHT-MIN": "mxxcs_jianyouxiuchang",
			"SLEEVE-LENGTH-RIGHT-MAX": "mxxcs_jiayouxiuchang",
			"TOP-BUTTON-POSITION-MIN": "mxxcs_jiankouweigao",
			"UPPER-ARM/ARMHOLE-MAX": "mxxcs_jiadabiwei",
			"UPPER-ARM/ARMHOLE-MIN": "mxxcs_jiandabiwei"
		},
		"FitTool_Safari-Jacket": {
			"1/2-BACK-MAX": "mxxsy_jiabeikuan",
			"1/2-BACK-MIN": "mxxsy_jianbeikuan",
			"1/2-CHEST-MIN": "mxxsy_jianxiongwei",
			"1/2-CHEST-MAX": "mxxsy_jiaxiongwei",
			"1/2-CHEST-FRONT-MAX": "mxxsy_jiaqianxiongkuan",
			"1/2-CHEST-FRONT-MIN": "mxxsy_jianqianxiongkuan",
			"1/2-COLLAR-MAX": "mxxsy_jialingkou",
			"1/2-COLLAR-MIN": "mxxsy_jianlingkou",
			"1/2-FRONT-MAX": "mxxsy_jiaqianzhikou",
			"1/2-FRONT-MIN": "mxxsy_jianqianzhikou",
			"1/2-GIRTH-MIN": "mxxsy_jianyaowei",
			"1/2-GIRTH-MAX": "mxxsy_jiayaowei",
			"1/2-HAND-MAX": "mxxsy_jiaxiukou",
			"1/2-HAND-MIN": "mxxsy_jianxiukou",
			"1/2-HIP-MAX": "mxxsy_jiabaiwei",
			"1/2-HIP-MIN": "mxxsy_jianbaiwei",
			"1/2-SHOULDER-MIN": "mxxsy_jianjiankuan",
			"1/2-SHOULDER-MAX": "mxxsy_jiajiankuan",
			"1/2-UPPER-ARM-MAX": "mxxsy_jiaxiufei",
			"1/2-UPPER-ARM-MIN": "mxxsy_jianxiufei",
			"ARMHOLE-DEPTH-MIN": "mxxsy_jianxiulong",
			"ARMHOLE-DEPTH-MAX": "mxxsy_jiaxiulong",
			"ARMHOLE-WIDTH-MAX": "mxxsy_jiakuanxiulong",
			"CHEST-POCKET-POSITION-MAX": "mxxsy_jiaxiongdouw",
			"COLLAR-HEIGHT-MIN": "mxxsy_jianlinggao",
			"COLLAR-HEIGHT-MAX": "mxxsy_jialinggao",
			"LENGTH-MIN": "mxxsy_jianhouyichang",
			"LENGTH-MAX": "mxxsy_jiahouyichang",
			"POSTURE-MAX": "mxxsy_tuobeiti",
			"POSTURE-MIN": "mxxsy_houyangti",
			"SHOULDER-HEIGHT-LEFT-MAX": "mxxsy_jiazuojiangao",
			"SHOULDER-HEIGHT-LEFT-MIN": "mxxsy_jianzuojiangao",
			"SHOULDER-HEIGHT-RIGHT-MAX": "mxxsy_jiayoujiangao",
			"SHOULDER-HEIGHT-RIGHT-MIN": "mxxsy_jianyoujiangao",
			"SLEEVE-LENGTH-LEFT-MIN": "mxxsy_jianzuoxiuchang",
			"SLEEVE-LENGTH-LEFT-MAX": "mxxsy_jiazuoxiuchang",
			"SLEEVE-LENGTH-RIGHT-MAX": "mxxsy_jiayouxiuchang",
			"SLEEVE-LENGTH-RIGHT-MIN": "mxxsy_jianyouxiuchang",
			"SLEEVE-POSITION-MAX": "mxxsy_qianxiuyiwei",
			"SLEEVE-POSITION-MIN": "mxxsy_houxiuyiwei"
		},

	"FitTool_Jacket": {
		"POSTURE-MAX": "msy_tuobeiti",
		"POSTURE-MIN": "msy_houyangti",
		"COLLAR-HEIGHT-MAX": "msy_jialinggao",
		"COLLAR-HEIGHT-MIN": "msy_jianlinggao",
		"SHOULDER-HEIGHT-LEFT-MAX": "msy_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "msy_jianzuojiangao",
		"SHOULDER-HEIGHT-RIGHT-MAX": "msy_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "msy_jianyoujiangao",
		"ARMHOLE-DEPTH-MAX": "msy_jiaxiulong",
		"ARMHOLE-DEPTH-MIN": "msy_jianxiulong",
		"SLEEVE-POSITION-MAX": "msy_qianxiuyiwei",
		"SLEEVE-POSITION-MIN": "msy_houxiuyiwei",
		"STRONG-DART-MAX": "msy_jiadusheng",
		"LAPEL-LENGTH-MAX": "msy_jiachangbotou",
		"LAPEL-LENGTH-MIN": "msy_suoduanbotou",
		"SHOULDER-POSITION-MAX": "msy_qianchongjian",
		"SHOULDER-POSITION-MIN": "msy_houchongjian",
		"SWAY-BACK-MIN": "msy_pingtun",
		"CENTER-BACK-SEAM-MIN": "msy_jianhoubeihu",
		"1/2-COLLAR-MIN": "msy_jianlingkou",
		"1/2-SHOULDER-MAX": "msy_jiajiankuan",
		"1/2-SHOULDER-MIN": "msy_jianjiankuan",
		"1/2-BACK-MAX": "msy_jiabeikuan",
		"1/2-BACK-MIN": "msy_jianbeikuan",
		"1/2-CHEST-MAX": "msy_jiaxiongwei",
		"1/2-CHEST-MIN": "msy_jianxiongwei",
		"1/2-CHEST-FRONT-MAX": "msy_jiaqianxiongkuan",
		"1/2-CHEST-FRONT-MIN": "msy_jianqianxiongkuan",
		"1/2-GIRTH-MAX": "msy_jiayaowei",
		"1/2-GIRTH-MIN": "msy_jianyaowei",
		"1/2-FRONT-MAX": "msy_jiaqianzhikou",
		"1/2-FRONT-MIN": "msy_jianqianzhikou",
		"1/2-HIP-MAX": "msy_jiabaiwei",
		"1/2-HIP-MIN": "msy_jianbaiwei",
		"1/2-FRONT-SKIRT-MIN": "msy_jianqianbaiwei",
		"UPPER-ARM-MAX": "msy_jiaxiufei",
		"UPPER-ARM-MIN": "msy_jianxiufei",
		"1/2-HAND-MAX": "msy_jiaxiukou",
		"1/2-HAND-MIN": "msy_jianxiukou",
		"LENGTH-MAX": "msy_jiahouyichang",
		"LENGTH-MIN": "msy_jianhouyichang",
		"FRONT-LENGTH-MAX": "msy_jiaqianyichang",
		"FRONT-LENGTH-MIN": "msy_jianqianyichang",
		"SLEEVE-LENGTH-LEFT-MAX": "msy_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "msy_jianzuoxiuchang",
		"SLEEVE-LENGTH-RIGHT-MAX": "msy_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "msy_jianyouxiuchang",
		"CLOSING-BUTTON-HEIGHT-MAX": "msy_jiakouweigao",
		"CLOSING-BUTTON-HEIGHT-MIN": "msy_jiankouweigao",
		"CHEST-POCKET-POSITION-MAX": "msy_jiaxiongdouwei",
		"VENT-LENGTH-MAX": "msy_jiakaiqichang",
		"VENT-LENGTH-MIN": "msy_jiankaiqichang"
	},
	"FitTool_Ladies-Jacket": {
		"POSTURE-MAX": "mnsy_tuobeiti",
		"POSTURE-MIN": "mnsy_houyangti",
		"COLLAR-HEIGHT-MAX": "mnsy_jialinggao",
		"COLLAR-HEIGHT-MIN": "mnsy_jianlinggao",
		"SHOULDER-HEIGHT-LEFT-MAX": "mnsy_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "mnsy_jianzuojiangao",
		"SHOULDER-HEIGHT-RIGHT-MAX": "mnsy_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "mnsy_jianyoujiangao",
		"ARMHOLE-DEPTH-MAX": "mnsy_jiaxiulong",
		"ARMHOLE-DEPTH-MIN": "mnsy_jianxiulong",
		"SLEEVE-POSITION-MAX": "mnsy_qianxiuyiwei",
		"SLEEVE-POSITION-MIN": "mnsy_houxiuyiwei",
		"LAPEL-LENGTH-MAX": "mnsy_jiachangbotou",
		"LAPEL-LENGTH-MIN": "mnsy_suoduanbotou",
		"SHOULDER-POSITION-MAX": "mnsy_qianchongjian",
		"SHOULDER-POSITION-MIN": "mnsy_houchongjian",
		"CENTER-BACK-SEAM-MIN": "mnsy_jianhoubeihu",
		"CHEST-LENGTH-MAX": "mnsy_jiaxiongshengchang",
		"CHEST-LENGTH-MIN": "mnsy_jianxiongshengchang",
					"STRONG-CHEST-MAX": "mnsy_jiadaxiongsheng",
					"FLAT-CHEST-MIN": "mnsy_pingxiongti",
		"1/2-COLLAR-MIN": "mnsy_jianlingkou",
		"1/2-SHOULDER-MAX": "mnsy_jiajiankuan",
		"1/2-SHOULDER-MIN": "mnsy_jianjiankuan",
		"1/2-BACK-MAX": "mnsy_jiabeikuan",
		"1/2-BACK-MIN": "mnsy_jianbeikuan",
		"1/2-CHEST-MAX": "mnsy_jiaxiongwei",
		"1/2-CHEST-MIN": "mnsy_jianxiongwei",
		"1/2-CHEST-FRONT-MAX": "mnsy_jiaqianxiongkuan",
		"1/2-CHEST-FRONT-MIN": "mnsy_jianqianxiongkuan",
		"1/2-GIRTH-MAX": "mnsy_jiayaowei",
		"1/2-GIRTH-MIN": "mnsy_jianyaowei",
		"1/2-FRONT-MAX": "mnsy_jiaqianzhikou",
		"1/2-FRONT-MIN": "mnsy_jianqianzhikou",
		"1/2-HIP-MAX": "mnsy_jiabaiwei",
		"1/2-HIP-MIN": "mnsy_jianbaiwei",
		"1/2-FRONT-SKIRT-MIN": "mnsy_jianqianbaiwei",
		"1/2-UPPERARM-MAX": "mnsy_jiaxiufei",
		"1/2-UPPERARM-MIN": "mnsy_jianxiufei",
		"1/2-HAND-MAX": "mnsy_jiaxiukou",
		"1/2-HAND-MIN": "mnsy_jianxiukou",
		"LENGTH-MAX": "mnsy_jiahouyichang",
		"LENGTH-MIN": "mnsy_jianhouyichang",
		"FRONT-LENGTH-MAX": "mnsy_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mnsy_jianqianyichang",
		"LENGTH-WITHOUT-POCKETS/WAIST-MAX": "mnsy_jiahouyichangwudou",
		"LENGTH-WITHOUT-POCKETS/WAIST-MIN": "mnsy_jianhouyichangwudou",
		"SLEEVE-LENGTH-LEFT-MAX": "mnsy_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "mnsy_jianzuoxiuchang",
		"SLEEVE-LENGTH-RIGHT-MAX": "mnsy_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "mnsy_jianyouxiuchang",
		"CLOSING-BUTTON-HEIGHT-MAX": "mnsy_jiakouweigao",
		"CLOSING-BUTTON-HEIGHT-MIN": "mnsy_jiankouweigao",
		"CHEST-POCKET-POSITION-MAX": "mnsy_jiaxiongdouwei",
		"VENT-LENGTH-MAX": "mnsy_jiakaiqichang",
		"VENT-LENGTH-MIN": "mnsy_jiankaiqichang"
	},
	"FitTool_Trousers": {
		"TOTAL-RISE-MAX": "mkz_jiashangdang",
		"TOTAL-RISE-MIN": "mkz_jianshangdang",
		"FRONT-RISE-MAX": "mkz_jiaqiandang",
		"FRONT-RISE-MIN": "mkz_jianqiandang",
		"BACK-RISE-MAX": "mkz_jiahoudang",
		"BACK-RISE-MIN": "mkz_jianhoudang",
		"FLAT-SEAT-MIN": "mkz_jiandangwei",
		"BACK-RISE-CURVE-MIN": "mkz_jiadang",
		"CROTCH-MAX": "mkz_jiadadangkuan",
		"CROTCH-MIN": "mkz_jiandadangkuan",
		"1/2-WAIST-MAX": "mkz_jiayaowei",
		"1/2-WAIST-MIN": "mkz_jianyaowei",
		"1/2-SEAT-MAX": "mkz_jiatunwei",
		"1/2-SEAT-MIN": "mkz_jiantunwei",
		"1/2-HIP-MIN": "mkz_jiancetunwei",
		"1/2-THIGH-MAX": "mkz_jiadatuiwei",
		"1/2-THIGH-MIN": "mkz_jiandatuiwei",
		"1/2-KNEE-MAX": "mkz_jiaxiwei",
		"1/2-KNEE-MIN": "mkz_jianxiwei",
		"1/2-FOOT-MAX": "mkz_jiajiaokoukuan",
		"1/2-FOOT-MIN": "mkz_jianjiaokoukuan",
		"LEG-LENGTH-LEFT-MAX": "mkz_jiazuotuichang",
		"LEG-LENGTH-LEFT-MIN": "mkz_jianzuotuichang",
		"LEG-LENGTH-RIGHT-MAX": "mkz_jiayoutuichang",
		"LEG-LENGTH-RIGHT-MIN": "mkz_jianyoutuichang"
	},
	"FitTool_Ladies-Pants": {
		"TOTAL-RISE-MAX": "mnkz_jiashangdang",
		"TOTAL-RISE-MIN": "mnkz_jianshangdang",
		"FRONT-RISE-MAX": "mnkz_jiaqiandang",
		"FRONT-RISE-MIN": "mnkz_jianqiandang",
		"BACK-RISE-MAX": "mnkz_jiahoudang",
		"BACK-RISE-MIN": "mnkz_jianhoudang",
		"FLAT-SEAT-MIN": "mnkz_jiandangwei",
		"BACK-RISE-CURVE-MIN": "mnkz_jiadang",
		"CROTCH-MAX": "mnkz_jiadadangkuan",
		"CROTCH-MIN": "mnkz_jiandadangkuan",
		"1/2-WAIST-MAX": "mnkz_jiayaowei",
		"1/2-WAIST-MIN": "mnkz_jianyaowei",
		"1/2-SEAT-MAX": "mnkz_jiatunwei",
		"1/2-SEAT-MIN": "mnkz_jiantunwei",
		"1/2-HIP-MAX": "mnkz_jiacetunwei",
		"1/2-HIP-MIN": "mnkz_jiancetunwei",
		"1/2-THIGH-MAX": "mnkz_jiadatuiwei",
		"1/2-THIGH-MIN": "mnkz_jiandatuiwei",
		"1/2-KNEE-MAX": "mnkz_jiaxiwei",
		"1/2-KNEE-MIN": "mnkz_jianxiwei",
		"1/2-FOOT-MAX": "mnkz_jiajiaokoukuan",
		"1/2-FOOT-MIN": "mnkz_jianjiaokoukuan",
		"LEG-LENGTH-L-MAX": "mnkz_jiazuotuichang",
		"LEG-LENGTH-L-MIN": "mnkz_jianzuotuichang",
		"LEG-LENGTH-R-MAX": "mnkz_jiayoutuichang",
		"LEG-LENGTH-R-MIN": "mnkz_jianyoutuichang"
	},
	"FitTool_Waistcoat": {
		"POSTURE-MAX": "mmj_tuobeiti",
		"POSTURE-MIN": "mmj_houyangti",
		"SHOULDER-HEIGHT-LEFT-MAX": "mmj_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "mmj_jianzuojiangao",
		"SHOULDER-HEIGHT-RIGHT-MAX": "mmj_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "mmj_jianyoujiangao",
		"1/2-CHEST-MAX": "mmj_jiaxiongwei",
		"1/2-CHEST-MIN": "mmj_jianxiongwei",
		"1/2-WAIST-MAX": "mmj_jiayaowei",
		"1/2-WAIST-MIN": "mmj_jianyaowei",
		"1/2-SEAT-MAX": "mmj_jiabaiwei",
		"1/2-SEAT-MIN": "mmj_jianbaiwei",
		"1/2-FRONT-MAX": "mmj_jiaqianzhikou",
		"1/2-FRONT-MIN": "mmj_jianqianzhikou",
		"1/2-BACK-MAX": "mmj_jiahoubeikuan",
		"1/2-BACK-MIN": "mmj_jianhoubeikuan",
		"LENGTH-MAX": "mmj_jiahouyichang",
		"LENGTH-MIN": "mmj_jianhouyichang",
		"FRONT-LENGTH-MAX": "mmj_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mmj_jianqianyichang",
		"LAPELS-MAX": "mmj_jiabotou",
		"LAPELS-MIN": "mmj_jianbotou",
		"CLOSING-BUTTON-MAX": "mmj_taigaokouwei",
		"CLOSING-BUTTON-MIN": "mmj_tiaodikouwei",
		"ARMHOLE-MAX": "mmj_taixiulong",
		"ARMHOLE-MIN": "mmj_jiangxiulong"
	},
	"FitTool_Ladies-Skirt": {
		"1/2-HIP-MAX": "mnqz_jiatunwei",
		"1/2-HIP-MIN": "mnqz_jiantunwei",
		"1/2-HIP2-MAX": "mnqz_jiabaiwei",
		"1/2-HIP2-MIN": "mnqz_jianbaiwei",
		"1/2-SIDE-HIP-MAX": "mnqz_jiacetunwei",
		"1/2-SIDE-HIP-MIN": "mnqz_jiancetunwei",
		"1/2-WAIST-MAX": "mnqz_jiayaowei",
		"1/2-WAIST-MIN": "mnqz_jianyaowei",
		"LENGTH-MAX": "mnqz_jiaqunchang",
		"LENGTH-MIN": "mnqz_jianqunchang"
	},
	"FitTool_Shirt": {
		"SHOULDER-HEIGHT-RIGHT-MAX": "mcs_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "mcs_jianyoujiangao",
		"SHOULDER-HEIGHT-LEFT-MAX": "mcs_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "mcs_jianzuojiangao",
		"COLLAR-SIZE-MAX": "mcs_jialingkuan",
		"COLLAR-SIZE-MIN": "mcs_jianlingkuan",
		"1/2-CHEST-MAX": "mcs_jiaxiongwei",
		"1/2-CHEST-MIN": "mcs_jianxiongwei",
		"1/2-CHEST-FRONT-MAX": "mcs_jiaqianxiongwei",
		"1/2-CHEST-FRONT-MIN": "mcs_jianqianxiongwei",
		"1/2-WAIST-MAX": "mcs_jiayaowei",
		"1/2-WAIST-MIN": "mcs_jianyaowei",
		"1/2-HIP-MAX": "mcs_jiatunwei",
		"1/2-HIP-MIN": "mcs_jiantunwei",
		"1/2-SHOULDER-MAX": "mcs_jiajiankuan",
		"1/2-SHOULDER-MIN": "mcs_jianjiankuan",
		"UPPER-ARM/ARMHOLE-MAX": "mcs_jiadabiwei",
		"UPPER-ARM/ARMHOLE-MIN": "mcs_jiandabiwei",
		"CUFF-WIDTH-RIGHT-MAX": "mcs_jiayouxiukoukuan",
		"CUFF-WIDTH-RIGHT-MIN": "mcs_jianyouxiukoukuan",
		"CUFF-WIDTH-LEFT-MAX": "mcs_jiazuoxiukoukuan",
		"CUFF-WIDTH-LEFT-MIN": "mcs_jianzuoxiukoukuan",
		"FRONT-LENGTH-MAX": "mcs_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mcs_jianqianyichang",
		"LENGTH-MAX": "mcs_jiahouyichang",
		"LENGTH-MIN": "mcs_jianhouyichang",
		"SLEEVE-LENGTH-RIGHT-MAX": "mcs_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "mcs_jianyouxiuchang",
		"SLEEVE-LENGTH-LEFT-MAX": "mcs_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "mcs_jianzuoxiuchang",
		"NECKBAND-POSITION-MAX": "mcs_jialingshen",
		"NECKBAND-POSITION-MIN": "mcs_jianlingshen",
		"TOP-BUTTON-POSITION-MIN": "mcs_jiankouweigao"
	},
	"FitTool_Overcoat": {
		"POSTURE-MAX": "mdy_tuobeiti",
		"POSTURE-MIN": "mdy_houyangti",
		"COLLAR-HEIGHT-MAX": "mdy_jialinggao",
		"COLLAR-HEIGHT-MIN": "mdy_jianlinggao",
		"SHOULDER-HEIGHT-RIGHT-MAX": "mdy_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "mdy_jianyoujiangao",
		"SHOULDER-HEIGHT-LEFT-MAX": "mdy_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "mdy_jianzuojiangao",
		"CLOSING-BUTTON-HEIGHT-MAX": "mdy_jiakouweigao",
		"CLOSING-BUTTON-HEIGHT-MIN": "mdy_jiankouweigao",
		"ARMHOLE-MAX": "mdy_jiaxiulong",
		"ARMHOLE-MIN": "mdy_jianxiulong",
		"SLEEVE-POSITION-MAX": "mdy_qianxiuyiwei",
		"SLEEVE-POSITION-MIN": "mdy_houxiuyiwei",
		"SHOULDER-POSITION-MAX": "mdy_qianchongjian",
		"SHOULDER-POSITION-MIN": "mdy_houchongjian",
		"1/2-COLLAR-MIN": "mdy_jianlingkou",
		"1/2-SHOULDER-MAX": "mdy_jiajiankuan",
		"1/2-SHOULDER-MIN": "mdy_jianjiankuan",
		"1/2-BACK-MAX": "mdy_jiabeikuan",
		"1/2-BACK-MIN": "mdy_jianbeikuan",
		"1/2-CHEST-MAX": "mdy_jiaxiongwei",
		"1/2-CHEST-MIN": "mdy_jianxiongwei",
		"1/2-WAIST-MAX": "mdy_jiayaowei",
		"1/2-WAIST-MIN": "mdy_jianyaowei",
		"1/2-HIP-MAX": "mdy_jiatunwei",
		"1/2-HIP-MIN": "mdy_jiantunwei",
		"1/2-SKIRT-MIN": "mdy_jianbaiwei",
		"1/2-FRONT-MAX": "mdy_jiaqianpian",
		"1/2-FRONT-MIN": "mdy_jianqianpian",
		"UPPER-ARM/ARMHOLE-MAX": "mdy_jiadabiwei",
		"UPPER-ARM/ARMHOLE-MIN": "mdy_jiandabiwei",
		"1/2-HAND-WIDTH-MAX": "mdy_jiaxiukou",
		"1/2-HAND-WIDTH-MIN": "mdy_jianxiukou",
		"LAPELS-MAX": "mdy_jiachangbotou",
		"LAPELS-MIN": "mdy_suoduanbotou",
		"FRONT-LENGTH-MAX": "mdy_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mdy_jianqianyichang",
		"LENGTH-MAX": "mdy_jiahouyichang",
		"LENGTH-MIN": "mdy_jianhouyichang",
		"LENGTH-WITHOUT-POCKETS/WAIST-MAX": "mdy_jiahouyichangwudou",
		"LENGTH-WITHOUT-POCKETS/WAIST-MIN": "mdy_jianhouyichangwudou",
		"SLEEVE-LENGTH-RIGHT-MAX": "mdy_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "mdy_jianyouxiuchang",
		"SLEEVE-LENGTH-LEFT-MAX": "mdy_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "mdy_jianzuoxiuchang",
		"VENT-LENGTH-MAXjiaxiukou": "mdy_jiahoukaiqichang",
		"VENT-LENGTH-MIN": "mdy_jianhoukaiqichang",
		"CHEST-POCKET-POSITION-MAX": "mdy_jiaxiongdouwei",
		"CHEST-POCKET-POSITION-MIN": "mdy_jianxiongdouwei"
	},
	"FitTool_Trenchcoat": {
		"POSTURE-MAX": "mfy_tuobeiti",
		"POSTURE-MIN": "mfy_houyangti",
		"COLLAR-HEIGHT-MAX": "mfy_jialinggao",
		"COLLAR-HEIGHT-MIN": "mfy_jianlinggao",
		"SHOULDER-HEIGHT-R-MAX": "mfy_jiayoujiangao",
		"SHOULDER-HEIGHT-R-MIN": "mfy_jianyoujiangao",
		"SHOULDER-HEIGHT-L-MAX": "mfy_jiazuojiangao",
		"SHOULDER-HEIGHT-L-MIN": "mfy_jianzuojiangao",
		"ARMHOLE-DEPTH-MAX": "mfy_jiaxiulong",
		"ARMHOLE-DEPTH-MIN": "mfy_jianxiulong",
		"SLEEVE-POSITION-MAX": "mfy_qianxiuyiwei",
		"SLEEVE-POSITION-MIN": "mfy_houxiuyiwei",
		"1/2-COLLAR-MAX": "mfy_jialingkoukuan",
		"1/2-COLLAR-MIN": "mfy_jianlingkoukuan",
		"1/2-SHOULDER-MAX": "mfy_jiajiankuan",
		"1/2-SHOULDER-MIN": "mfy_jianjiankuan",
		"1/2-BACK-MAX": "mfy_jiabeikuan",
		"1/2-BACK-MIN": "mfy_jianbeikuan",
		"1/2-CHEST-MAX": "mfy_jiaxiongwei",
		"1/2-CHEST-MIN": "mfy_jianxiongwei",
		"1/2-GIRTH-MAX": "mfy_jiayaowei",
		"1/2-GIRTH-MIN": "mfy_jianyaowei",
		"1/2-HIP-MAX": "mfy_jiatunwei",
		"1/2-HIP-MIN": "mfy_jiantunwei",
		"COLLAR-MAX": "mfy_jialingkou",
		"COLLAR-MIN": "mfy_jianlingkou",
		"1/2-UPPERARM": "mfy_jiadabiwei",
		"1/2-UPPERARM": "mfy_jiandabiwei",
		"1/2-HAND-WIDTH-MAX": "mfy_jiaxiukou",
		"1/2-HAND-WIDTH-MIN": "mfy_jianxiukou",
		"1/2-CHEST-FRONT-MAX": "mfy_jiaqianxiongkuan",
		"1/2-CHEST-FRONT-MIN": "mfy_jianqianxiongkuan",
		"FRONT-LENGTH-MAX": "mfy_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mfy_jianqianyichang",
		"LENGTH-MAX": "mfy_jiahouyichang",
		"LENGTH-MIN": "mfy_jianhouyichang",
		"LENGTH-WITHOUT-POCKETS/WAIST-MAX": "mdy_jiahouyichangwudou",
		"LENGTH-WITHOUT-POCKETS/WAIST-MIN": "mdy_jianhouyichangwudou",
		"SLEEVE-LENGTH-RIGHT-MAX": "mfy_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "mfy_jianyouxiuchang",
		"SLEEVE-LENGTH-LEFT-MAX": "mfy_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "mfy_jianzuoxiuchang"
	},
	"FitTool_Short-Sleeves-Shirt": {
		"SHOULDER-HEIGHT-RIGHT-MAX": "mcsd_jiayoujiangao",
		"SHOULDER-HEIGHT-RIGHT-MIN": "mcsd_jianyoujiangao",
		"SHOULDER-HEIGHT-LEFT-MAX": "mcsd_jiazuojiangao",
		"SHOULDER-HEIGHT-LEFT-MIN": "mcsd_jianzuojiangao",
		"COLLAR-SIZE-MAX": "mcsd_jialingkuan",
		"COLLAR-SIZE-MIN": "mcsd_jianlingkuan",
		"1/2-CHEST-MAX": "mcsd_jiaxiongwei",
		"1/2-CHEST-MIN": "mcsd_jianxiongwei",
		"1/2-CHEST-FRONT-MAX": "mcsd_jiaqianxiongwei",
		"1/2-CHEST-FRONT-MIN": "mcsd_jianqianxiongwei",
		"1/2-WAIST-MAX": "mcsd_jiayaowei",
		"1/2-WAIST-MIN": "mcsd_jianyaowei",
		"1/2-HIP-MAX": "mcsd_jiatunwei",
		"1/2-HIP-MIN": "mcsd_jiantunwei",
		"ARMHOLE-MAX": "mcsd_jiaxiulong",
		"ARMHOLE-MIN": "mcsd_jianxiulong",
		"1/2-SHOULDER-MAX": "mcsd_jiajiankuan",
		"1/2-SHOULDER-MIN": "mcsd_jianjiankuan",
		"UPPER-ARM/ARMHOLE-MAX": "mcsd_jiadabiwei",
		"UPPER-ARM/ARMHOLE-MIN": "mcsd_jiandabiwei",
		"CUFF-WIDTH-RIGHT-MAX": "mcsd_jiayouxiukoukuan",
		"CUFF-WIDTH-RIGHT-MIN": "mcsd_jianyouxiukoukuan",
		"CUFF-WIDTH-LEFT-MAX": "mcsd_jiazuoxiukoukuan",
		"CUFF-WIDTH-LEFT-MIN": "mcsd_jianzuoxiukoukuan",
		"FRONT-LENGTH-MAX": "mcsd_jiaqianyichang",
		"FRONT-LENGTH-MIN": "mcsd_jianqianyichang",
		"LENGTH-MAX": "mcsd_jiahouyichang",
		"LENGTH-MIN": "mcsd_jianhouyichang",
		"SLEEVE-LENGTH-RIGHT-MAX": "mcsd_jiayouxiuchang",
		"SLEEVE-LENGTH-RIGHT-MIN": "mcsd_jianyouxiuchang",
		"SLEEVE-LENGTH-LEFT-MAX": "mcsd_jiazuoxiuchang",
		"SLEEVE-LENGTH-LEFT-MIN": "mcsd_jianzuoxiuchang",
		"NECKBAND-POSITION-MAX": "mcsd_jialingshen",
		"NECKBAND-POSITION-MIN": "mcsd_jianlingshen",
		"TOP-BUTTON-POSITION-MIN": "mcsd_jiankouweigao"
	},
	"FitTool_Overcoat_GM": {
		"BACK-LENGTH": "yichang",
		"SHOULDER": "jiankuan_half",
		"NECK": "lingwei",
		"SLEEVE-LEFT": "xiuchang_l",
		"SLEEVE-RIGHT": "xiuchang_r",
		"CHEST": "xiongwei_half",
		"WAIST": "yaowei_half",
		"SEAT": "tunwei_half",
		"UPPERARM": "dabiwei_half",
		"CUFF": "xiukou_half",
		"FRONT-LENGTH": "qianyichang",
		"TOP-BOTTON": "diyilikou",
		"ARM-POSITION": [{
			"FORWARD MIN 1": {
				"NAME": "C26",
				"VALUE": "C2601"
			},
			"FORWARD AVG 2": {
				"NAME": "C26",
				"VALUE": "C2602"
			},
			"FORWARD EXT 3": {
				"NAME": "C26",
				"VALUE": "C2603"
			},
			"FORWARD MAX 4": {
				"NAME": "C26",
				"VALUE": "C2604"
			},
			"BACK MIN 1": {
				"NAME": "C27",
				"VALUE": "C2701"
			},
			"BACK AVG 2": {
				"NAME": "C27",
				"VALUE": "C2702"
			},
			"BACK EXT 3": {
				"NAME": "C27",
				"VALUE": "T2703"
			},
			"BACK MAX 4": {
				"NAME": "C27",
				"VALUE": "C2704"
			}
		}],
		"ARMHOLE-DEPTH": [{
			"RAISE MIN 0.5": {
				"NAME": "C28",
				"VALUE": "C2801"
			},
			"RAISE AVG 1": {
				"NAME": "C28",
				"VALUE": "C2802"
			},
			"RAISE EXT 1.5": {
				"NAME": "C28",
				"VALUE": "C2803"
			},
			"RAISE MAX 2": {
				"NAME": "C28",
				"VALUE": "C2804"
			},
			"LOWER MIN 0.5": {
				"NAME": "C29",
				"VALUE": "C2901"
			},
			"LOWER AVG 1": {
				"NAME": "C29",
				"VALUE": "C2902"
			},
			"LOWER EXT 1.5": {
				"NAME": "C29",
				"VALUE": "C2903"
			},
			"LOWER MAX 2": {
				"NAME": "C29",
				"VALUE": "C2904"
			}
		}],
		"COLLAR-LENGTH": [{
			"SHORTEN MIN 0.5": {
				"NAME": "C23",
				"VALUE": "C2301"
			},
			"SHORTEN AVG 1": {
				"NAME": "C23",
				"VALUE": "C2302"
			},
			"SHORTEN MAX 1.5": {
				"NAME": "C23",
				"VALUE": "C2303"
			}
		}],
		"COLLAR-POSITION": [{
			"RAISE MIN 1": {
				"NAME": "C21",
				"VALUE": "C2101"
			},
			"RAISE AVG 1.5": {
				"NAME": "C21",
				"VALUE": "C2102"
			},
			"LOWER MIN 1": {
				"NAME": "C22",
				"VALUE": "C2201"
			},
			"LOWER AVG 1.5": {
				"NAME": "C22",
				"VALUE": "C2202"
			}
		}],
		"POSTURE": [{
			"STOOPING AVG 1": {
				"NAME": "C09",
				"VALUE": "C0901"
			},
			"STOOPING EXT 1.5": {
				"NAME": "C09",
				"VALUE": "C0902"
			},
			"STOOPING MAX 2": {
				"NAME": "C09",
				"VALUE": "C0903"
			},
			"STOOPING MIN 0.5": {
				"NAME": "C09",
				"VALUE": "C0904"
			},
			"ERECT AVG 1": {
				"NAME": "C08",
				"VALUE": "C0801"
			},
			"ERECT EXT 1.5": {
				"NAME": "C08",
				"VALUE": "C0802"
			},
			"ERECT MAX 2": {
				"NAME": "C08",
				"VALUE": "C0803"
			},
			"ERECT MIN 0.5": {
				"NAME": "C08",
				"VALUE": "C0804"
			}
		}],

		"SHOULDER-DESCRIPTION-L": [{
			"HIGH MIN 0.5": {
				"NAME": "C03",
				"VALUE": "C0304"
			},
			"HIGH AVG 1": {
				"NAME": "C03",
				"VALUE": "C0301"
			},
			"HIGH EXT 1.5": {
				"NAME": "C03",
				"VALUE": "C0302"
			},
			"HIGH MAX 2": {
				"NAME": "C03",
				"VALUE": "C0303"
			},
			"SLOPING MIN 0.5": {
				"NAME": "C04",
				"VALUE": "C0404"
			},
			"SLOPING AVG 1": {
				"NAME": "C04",
				"VALUE": "C0401"
			},
			"SLOPING EXT 1.5": {
				"NAME": "C04",
				"VALUE": "C0402"
			},
			"SLOPING MAX 2": {
				"NAME": "C04",
				"VALUE": "C0403"
			}
		}],
		"SHOULDER-DESCRIPTION-R": [{
			"HIGH MIN 0.5": {
				"NAME": "C05",
				"VALUE": "C0504"
			},
			"HIGH AVG 1": {
				"NAME": "C05",
				"VALUE": "C0501"
			},
			"HIGH EXT 1.5": {
				"NAME": "C05",
				"VALUE": "C0502"
			},
			"HIGH MAX 2": {
				"NAME": "C05",
				"VALUE": "C0503"
			},
			"SLOPING MIN 0.5": {
				"NAME": "C06",
				"VALUE": "C0604"
			},
			"SLOPING AVG 1": {
				"NAME": "C06",
				"VALUE": "C0601"
			},
			"SLOPING EXT 1.5": {
				"NAME": "C06",
				"VALUE": "C0602"
			},
			"SLOPING MAX 2": {
				"NAME": "C06",
				"VALUE": "C0603"
			}
		}],
		"STOMACH-STATURE": [{
			"FLAT MIN 0.5": {
				"NAME": "C14",
				"VALUE": "C1401"
			},
			"FLAT AVG 1": {
				"NAME": "C14",
				"VALUE": "C1402"
			},
			"FLAT MORE 1.5": {
				"NAME": "C14",
				"VALUE": "C1403"
			},
			"FLAT EXT 2": {
				"NAME": "C14",
				"VALUE": "C1404"
			},
			"FLAT MAX 2.5": {
				"NAME": "C14",
				"VALUE": "C1405"
			},
			"FULL MIN 0.5": {
				"NAME": "C13",
				"VALUE": "C1301"
			},
			"FULL AVG 1": {
				"NAME": "C13",
				"VALUE": "C1302"
			},
			"FULL MORE 1.5": {
				"NAME": "C13",
				"VALUE": "C1303"
			},
			"FULL EXT 2": {
				"NAME": "C13",
				"VALUE": "C1304"
			},
			"FULL MAX 2.5": {
				"NAME": "C13",
				"VALUE": "C1305"
			}
		}]
	},
	"FitTool_Short-Sleeves-Shirt_GM": {
		"NECK": "lingwei",
		"SHOULDER": "jiankuan",
		"CHEST": "xiongwei_half",
		"WAIST": "yaowei_half",
		"HIPS": "baiwei_half",
		"UPPERARM": "dabiwei_half",
		"SLEEVE-LEFT": "xiuchang_l",
		"SLEEVE-RIGHT": "xiuchang_r",
		"CUFF-LEFT": "xiukou_l",
		"CUFF-RIGHT": "xiukou_r",
		"BACK-LENGTH": "yichang",
		"FRONT-LENGTH": "qianyichang",
		"CHEST-STATURE": [{
			"FLAT AVG 1": {
				"NAME": "T253",
				"VALUE": "T25301"
			},
			"FLAT NO": {
				"NAME": "T253",
				"VALUE": "T25302"
			},
			"FLAT MIN 0.5": {
				"NAME": "T253",
				"VALUE": "T25303"
			},
			"FLAT MAX 1.5": {
				"NAME": "T253",
				"VALUE": "T25304"
			},
			"FULL AVG 1": {
				"NAME": "T254",
				"VALUE": "T25401"
			},
			"FULL NO": {
				"NAME": "T254",
				"VALUE": "T25402"
			},
			"FULL MIN 0.5": {
				"NAME": "T254",
				"VALUE": "T25403"
			},
			"FULL MAX 1.5": {
				"NAME": "T254",
				"VALUE": "T25404"
			}
		}],
		"COLLAR-POSITION": [{
			"RAISE MIN 1": {
				"NAME": "T96",
				"VALUE": "T9601"
			},
			"RAISE AVG 1.5": {
				"NAME": "T96",
				"VALUE": "T9602"
			},
			"RAISE MAX 2": {
				"NAME": "T96",
				"VALUE": "T9603"
			},
			"LOWER MIN 1": {
				"NAME": "T99",
				"VALUE": "T9901"
			},
			"LOWER AVG 1.5": {
				"NAME": "T99",
				"VALUE": "T9902"
			},
			"LOWER MAX 2": {
				"NAME": "T99",
				"VALUE": "T9903"
			}
		}],
		"SHOULDER-DESCRIPTION-L": [{
			"HIGH MIN 0.5": {
				"NAME": "T03",
				"VALUE": "T0304"
			},
			"HIGH AVG 1": {
				"NAME": "T03",
				"VALUE": "T0301"
			},
			"HIGH EXT 1.5": {
				"NAME": "T03",
				"VALUE": "T0302"
			},
			"HIGH MAX 2": {
				"NAME": "T03",
				"VALUE": "T0303"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T04",
				"VALUE": "T0404"
			},
			"SLOPING AVG 1": {
				"NAME": "T04",
				"VALUE": "T0401"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T04",
				"VALUE": "T0402"
			},
			"SLOPING MAX 2": {
				"NAME": "T04",
				"VALUE": "T0403"
			}
		}],
		"SHOULDER-DESCRIPTION-R": [{
			"HIGH MIN 0.5": {
				"NAME": "T05",
				"VALUE": "T0504"
			},
			"HIGH AVG 1": {
				"NAME": "T05",
				"VALUE": "T0501"
			},
			"HIGH EXT 1.5": {
				"NAME": "T05",
				"VALUE": "T0502"
			},
			"HIGH MAX 2": {
				"NAME": "T05",
				"VALUE": "T0503"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T06",
				"VALUE": "T0604"
			},
			"SLOPING AVG 1": {
				"NAME": "T06",
				"VALUE": "T0601"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T06",
				"VALUE": "T0602"
			},
			"SLOPING MAX 2": {
				"NAME": "T06",
				"VALUE": "T0603"
			}
		}]
	},
	"FitTool_Shirt_GM": {
		"NECK": "lingwei",
		"SHOULDER": "jiankuan",
		"CHEST": "xiongwei_half",
		"WAIST": "yaowei_half",
		"HIPS": "baiwei_half",
		"UPPERARM": "dabiwei_half",
		"SLEEVE-LEFT": "xiuchang_l",
		"SLEEVE-RIGHT": "xiuchang_r",
		"CUFF-LEFT": "xiukou_l",
		"CUFF-RIGHT": "xiukou_r",
		"BACK-LENGTH": "yichang",
		"FRONT-LENGTH": "qianyichang",
		"CHEST-STATURE": [{
			"FLAT AVG 1": {
				"NAME": "T253",
				"VALUE": "T25301"
			},
			"FLAT NO": {
				"NAME": "T253",
				"VALUE": "T25302"
			},
			"FLAT MIN 0.5": {
				"NAME": "T253",
				"VALUE": "T25303"
			},
			"FLAT MAX 1.5": {
				"NAME": "T253",
				"VALUE": "T25304"
			},
			"FULL AVG 1": {
				"NAME": "T254",
				"VALUE": "T25401"
			},
			"FULL NO": {
				"NAME": "T254",
				"VALUE": "T25402"
			},
			"FULL MIN 0.5": {
				"NAME": "T254",
				"VALUE": "T25403"
			},
			"FULL MAX 1.5": {
				"NAME": "T254",
				"VALUE": "T25404"
			}
		}],
		"COLLAR-POSITION": [{
			"RAISE MIN 1": {
				"NAME": "T96",
				"VALUE": "T9601"
			},
			"RAISE AVG 1.5": {
				"NAME": "T96",
				"VALUE": "T9602"
			},
			"RAISE MAX 2": {
				"NAME": "T96",
				"VALUE": "T9603"
			},
			"LOWER MIN 1": {
				"NAME": "T99",
				"VALUE": "T9901"
			},
			"LOWER AVG 1.5": {
				"NAME": "T99",
				"VALUE": "T9902"
			},
			"LOWER MAX 2": {
				"NAME": "T99",
				"VALUE": "T9903"
			}
		}],
		"SHOULDER-DESCRIPTION-L": [{
			"HIGH MIN 0.5": {
				"NAME": "T03",
				"VALUE": "T0304"
			},
			"HIGH AVG 1": {
				"NAME": "T03",
				"VALUE": "T0301"
			},
			"HIGH EXT 1.5": {
				"NAME": "T03",
				"VALUE": "T0302"
			},
			"HIGH MAX 2": {
				"NAME": "T03",
				"VALUE": "T0303"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T04",
				"VALUE": "T0404"
			},
			"SLOPING AVG 1": {
				"NAME": "T04",
				"VALUE": "T0401"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T04",
				"VALUE": "T0402"
			},
			"SLOPING MAX 2": {
				"NAME": "T04",
				"VALUE": "T0403"
			}
		}],
		"SHOULDER-DESCRIPTION-R": [{
			"HIGH MIN 0.5": {
				"NAME": "T05",
				"VALUE": "T0504"
			},
			"HIGH AVG 1": {
				"NAME": "T05",
				"VALUE": "T0501"
			},
			"HIGH EXT 1.5": {
				"NAME": "T05",
				"VALUE": "T0502"
			},
			"HIGH MAX 2": {
				"NAME": "T05",
				"VALUE": "T0503"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T06",
				"VALUE": "T0604"
			},
			"SLOPING AVG 1": {
				"NAME": "T06",
				"VALUE": "T0601"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T06",
				"VALUE": "T0602"
			},
			"SLOPING MAX 2": {
				"NAME": "T06",
				"VALUE": "T0603"
			}
		}]
	},
	"FitTool_Jacket_GM": {
		"SHOULDER": "jiankuan",
		"CHEST": "xiongwei_half",
		"WAIST": "yaowei_half",
		"SEAT": "baiwei_half",
		"BACK-LT": "houyichang",
		"SLEEVE-L": "xiuchang_l",
		"SLEEVE-R": "xiuchang_r",
		"UPPERARM": "dabiwei_half",
		"CUFF": "xiukou_half",
		"FRONT-LT": "qianyichang",
		"TOP-BUTTON": "diyilikou",
		"SHOULDER-DESCRIPTION-L": [{
			"HIGH MIN 0.5": {
				"NAME": "T03",
				"VALUE": "T0304"
			},
			"HIGH AVG 1": {
				"NAME": "T03",
				"VALUE": "T0301"
			},
			"HIGH EXT 1.5": {
				"NAME": "T03",
				"VALUE": "T0302"
			},
			"HIGH MAX 2": {
				"NAME": "T03",
				"VALUE": "T0303"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T04",
				"VALUE": "T0404"
			},
			"SLOPING AVG 1": {
				"NAME": "T04",
				"VALUE": "T0401"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T04",
				"VALUE": "T0402"
			},
			"SLOPING MAX 2": {
				"NAME": "T04",
				"VALUE": "T0403"
			}
		}],
		"SHOULDER-DESCRIPTION-R": [{
			"HIGH MIN 0.5": {
				"NAME": "T05",
				"VALUE": "T0504"
			},
			"HIGH AVG 1": {
				"NAME": "T05",
				"VALUE": "T0501"
			},
			"HIGH EXT 1.5": {
				"NAME": "T05",
				"VALUE": "T0502"
			},
			"HIGH MAX 2": {
				"NAME": "T05",
				"VALUE": "T0503"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T06",
				"VALUE": "T0604"
			},
			"SLOPING AVG 1": {
				"NAME": "T06",
				"VALUE": "T0601"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T06",
				"VALUE": "T0602"
			},
			"SLOPING MAX 2": {
				"NAME": "T06",
				"VALUE": "T0603"
			}
		}],
		"POSTURE": [{
			"STOOPING MIN 0.5": {
				"NAME": "T09",
				"VALUE": "T0904"
			},
			"STOOPING AVG 1": {
				"NAME": "T09",
				"VALUE": "T0901"
			},
			"STOOPING EXT 1.5": {
				"NAME": "T09",
				"VALUE": "T0902"
			},
			"STOOPING MAX 2": {
				"NAME": "T09",
				"VALUE": "T0903"
			},
			"ERECT MIN 0.5": {
				"NAME": "T08",
				"VALUE": "T0804"
			},
			"ERECT AVG 1": {
				"NAME": "T08",
				"VALUE": "T0801"
			},
			"ERECT EXT 1.5": {
				"NAME": "T08",
				"VALUE": "T0802"
			},
			"ERECT MAX 2": {
				"NAME": "T08",
				"VALUE": "T0803"
			}
		}],
		"CHEST-STATURE": [{

			"FLAT AVG 1": {
				"NAME": "T11",
				"VALUE": "T1101"
			},
			"FLAT NO": {
				"NAME": "T11",
				"VALUE": "T1102"
			},
			"FLAT MIN 0.5": {
				"NAME": "T11",
				"VALUE": "T1103"
			},
			"FLAT EXT 1.25": {
				"NAME": "T11",
				"VALUE": "T1104"
			},
			"FLAT MAX 1.5": {
				"NAME": "T11",
				"VALUE": "T1105"
			},
			"FULL MIN 0.5": {
				"NAME": "T12",
				"VALUE": "T1203"
			},
			"FULL AVG 1": {
				"NAME": "T12",
				"VALUE": "T1201"
			},
			"FULL EXT 1.25": {
				"NAME": "T12",
				"VALUE": "T1204"
			},
			"FULL MAX 1.5": {
				"NAME": "T12",
				"VALUE": "T1205"
			},
			"FULL NO": {
				"NAME": "T12",
				"VALUE": "T1202"
			}
		}],
		"STOMACH-STATURE": [{
			"FLAT MIN 0.5": {
				"NAME": "T255",
				"VALUE": "T25507"
			},
			"FLAT AVG 1": {
				"NAME": "T255",
				"VALUE": "T25508"
			},
			"FLAT MORE 1.5": {
				"NAME": "T255",
				"VALUE": "T25509"
			},
			"FLAT EXT 2": {
				"NAME": "T255",
				"VALUE": "T25510"
			},
			"FLAT MAX 2.5": {
				"NAME": "T255",
				"VALUE": "T25511"
			},
			"FULL AVG 1": {
				"NAME": "T13",
				"VALUE": "T1301"
			},
			"FULL NO": {
				"NAME": "T13",
				"VALUE": "T1302"
			},
			"FULL MIN 0.5": {
				"NAME": "T13",
				"VALUE": "T1303"
			},
			"FULL MORE 1.5": {
				"NAME": "T13",
				"VALUE": "T1304"
			},
			"FULL EXT 2": {
				"NAME": "T13",
				"VALUE": "T1305"
			},
			"FULL MAX 2.5": {
				"NAME": "T13",
				"VALUE": "T1306"
			}
		}],
		"COLLAR-POSITION": [{
			"RAISE MIN 0.5": {
				"NAME": "T21",
				"VALUE": "T2101"
			},
			"RAISE AVG 1": {
				"NAME": "T21",
				"VALUE": "T2102"
			},
			"RAISE MAX 2": {
				"NAME": "T21",
				"VALUE": "T2103"
			},
			"LOWER MIN 0.5": {
				"NAME": "T22",
				"VALUE": "T2201"
			},
			"LOWER AVG 1": {
				"NAME": "T22",
				"VALUE": "T2202"
			},
			"LOWER MAX 2": {
				"NAME": "T22",
				"VALUE": "T2203"
			}
		}],
		"COLLAR-LENGTH": [{
			"SHORTEN MIN 0.5": {
				"NAME": "T23",
				"VALUE": "T2301"
			},
			"SHORTEN AVG 1": {
				"NAME": "T23",
				"VALUE": "T2302"
			},
			"SHORTEN MAX 1.5": {
				"NAME": "T23",
				"VALUE": "T2303"
			}
		}],
		"SHOULDER-POSITION": [{
			"FORWARD MIN 0.5": {
				"NAME": "T24",
				"VALUE": "T2403"
			},
			"FORWARD MAX 1": {
				"NAME": "T24",
				"VALUE": "T2401"
			},
			"BACK MIN 0.5": {
				"NAME": "T25",
				"VALUE": "T2503"
			},
			"BACK MAX 1": {
				"NAME": "T25",
				"VALUE": "T2501"
			}
		}],
		"ARM-POSITION": [{
			"FORWARD MIN 1": {
				"NAME": "T26",
				"VALUE": "T2601"
			},
			"FORWARD AVG 2": {
				"NAME": "T26",
				"VALUE": "T2602"
			},
			"FORWARD EXT 3": {
				"NAME": "T26",
				"VALUE": "T2603"
			},
			"FORWARD MAX 4": {
				"NAME": "T26",
				"VALUE": "T2604"
			},
			"BACK MIN 1": {
				"NAME": "T27",
				"VALUE": "T2701"
			},
			"BACK AVG 2": {
				"NAME": "T27",
				"VALUE": "T2702"
			},
			"BACK EXT 3": {
				"NAME": "T27",
				"VALUE": "T2703"
			},
			"BACK MAX 4": {
				"NAME": "T27",
				"VALUE": "T2704"
			}
		}],
		"ARMHOLE-DEPTH": [{
			"RAISE MIN 0.5": {
				"NAME": "T28",
				"VALUE": "T2801"
			},
			"RAISE AVG 1": {
				"NAME": "T28",
				"VALUE": "T2802"
			},
			"RAISE EXT 1.5": {
				"NAME": "T28",
				"VALUE": "T2803"
			},
			"RAISE MAX 2": {
				"NAME": "T28",
				"VALUE": "T2804"
			},
			"LOWER MIN 0.5": {
				"NAME": "T29",
				"VALUE": "T2901"
			},
			"LOWER AVG 1": {
				"NAME": "T29",
				"VALUE": "T2902"
			},
			"LOWER EXT 1.5": {
				"NAME": "T29",
				"VALUE": "T2903"
			},
			"LOWER MAX 2": {
				"NAME": "T29",
				"VALUE": "T2904"
			}
		}]
	},
	"FitTool_Trousers_GM": {
		"WAIST": "yaowei_half",
		"SEAT": "tunwei_half",
		"U-RISE": "quandangchang",
		"OUTSEAM-L": "kuchang_l",
		"OUTSEAM-R": "kuchang_r",
		"THIGH": "hengdang_half",
		"FOOT": "jiaokou_half",
		"KNEE": "xiwei_half",
		"BACK-RISE": [{
			"RAISE MIN 1": {
				"NAME": "T44",
				"VALUE": "T4401"
			},
			"RAISE MORE 1.5": {
				"NAME": "T44",
				"VALUE": "T4402"
			},
			"RAISE AVG 2": {
				"NAME": "T44",
				"VALUE": "T4403"
			},
			"RAISE EXT 2.5": {
				"NAME": "T44",
				"VALUE": "T4404"
			},
			"RAISE EXT 3": {
				"NAME": "T44",
				"VALUE": "T4405"
			},
			"RAISE MAX 3.5": {
				"NAME": "T44",
				"VALUE": "T4406"
			},
			"LOWER MIN 0.5": {
				"NAME": "T45",
				"VALUE": "T4501"
			},
			"LOWER AVG 1": {
				"NAME": "T45",
				"VALUE": "T4502"
			},
			"LOWER EXT 1.5": {
				"NAME": "T45",
				"VALUE": "T4503"
			},
			"LOWER MAX 2": {
				"NAME": "T45",
				"VALUE": "T4504"
			}
		}],
		"FRONT-RISE": [{
			"RAISE MIN 1": {
				"NAME": "T42",
				"VALUE": "T4201"
			},
			"RAISE MORE 1.5": {
				"NAME": "T42",
				"VALUE": "T4202"
			},
			"RAISE AVG 2": {
				"NAME": "T42",
				"VALUE": "T4203"
			},
			"RAISE EXT 2.5": {
				"NAME": "T42",
				"VALUE": "T4204"
			},
			"RAISE EXT 3": {
				"NAME": "T42",
				"VALUE": "T4205"
			},
			"RAISE MAX 3.5": {
				"NAME": "T42",
				"VALUE": "T4206"
			},
			"LOWER MIN 0.5": {
				"NAME": "T43",
				"VALUE": "T4301"
			},
			"LOWER AVG 1": {
				"NAME": "T43",
				"VALUE": "T4302"
			},
			"LOWER EXT 1.5": {
				"NAME": "T43",
				"VALUE": "T4303"
			},
			"LOWER MAX 2": {
				"NAME": "T43",
				"VALUE": "T4304"
			}
		}],
		"SEAT-STATURE": [{
			"FLAT MIN 1": {
				"NAME": "T16",
				"VALUE": "T1601"
			},
			"FLAT NO": {
				"NAME": "T16",
				"VALUE": "T1602"
			},
			"FLAT AVG 1.5": {
				"NAME": "T16",
				"VALUE": "T1603"
			},
			"FLAT MAX 2": {
				"NAME": "T16",
				"VALUE": "T1604"
			}
		}]
	},
	"FitTool_Waistcoat_GM": {
		"CHEST": "xiongwei_half",
		"WAIST": "yaowei_half",
		"BACK-LT": "houyichang",
		"FRONT-LT": "qianyichang",
		"TOP-BUTTON": "diyilikou",
		"ARMHOLE": [{
			"RAISE MIN 0.5": {
				"NAME": "T54",
				"VALUE": "T5401"
			},
			"RAISE AVG 1": {
				"NAME": "T54",
				"VALUE": "T5402"
			},
			"RAISE MAX 1.5": {
				"NAME": "T54",
				"VALUE": "T5403"
			},
			"LOWER MIN 0.5": {
				"NAME": "T55",
				"VALUE": "T5501"
			},
			"LOWER AVG 1": {
				"NAME": "T55",
				"VALUE": "T5502"
			},
			"LOWER MAX 1.5": {
				"NAME": "T55",
				"VALUE": "T5503"
			}
		}],
		"POSTURE": [{
			"STOOPING MIN 0.5": {
				"NAME": "T09",
				"VALUE": "T0904"
			},
			"STOOPING AVG 1": {
				"NAME": "T09",
				"VALUE": "T0901"
			},
			"STOOPING EXT 1.5": {
				"NAME": "T09",
				"VALUE": "T0902"
			},
			"STOOPING MAX 2": {
				"NAME": "T09",
				"VALUE": "T0903"
			},
			"ERECT MIN 0.5": {
				"NAME": "T08",
				"VALUE": "T0804"
			},
			"ERECT AVG 1": {
				"NAME": "T08",
				"VALUE": "T0801"
			},
			"ERECT EXT 1.5": {
				"NAME": "T08",
				"VALUE": "T0802"
			},
			"ERECT AVG 2": {
				"NAME": "T08",
				"VALUE": "T0803"
			}
		}],
		"SHOULDER-DESCRIPTION-L": [{
			"HIGH MIN 0.5": {
				"NAME": "T03",
				"VALUE": "T0304"
			},
			"HIGH AVG 1": {
				"NAME": "T03",
				"VALUE": "T0301"
			},
			"HIGH EXT 1.5": {
				"NAME": "T03",
				"VALUE": "T0302"
			},
			"HIGH MAX 2": {
				"NAME": "T03",
				"VALUE": "T0303"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T04",
				"VALUE": "T0404"
			},
			"SLOPING AVG 1": {
				"NAME": "T04",
				"VALUE": "T0401"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T04",
				"VALUE": "T0402"
			},
			"SLOPING MAX 2": {
				"NAME": "T04",
				"VALUE": "T0403"
			}
		}],
		"SHOULDER-DESCRIPTION-R": [{
			"HIGH MIN 0.5": {
				"NAME": "T05",
				"VALUE": "T0504"
			},
			"HIGH AVG 1": {
				"NAME": "T05",
				"VALUE": "T0501"
			},
			"HIGH EXT 1.5": {
				"NAME": "T05",
				"VALUE": "T0502"
			},
			"HIGH MAX 2": {
				"NAME": "T05",
				"VALUE": "T0503"
			},
			"SLOPING MIN 0.5": {
				"NAME": "T06",
				"VALUE": "T0604"
			},
			"SLOPING AVG 1": {
				"NAME": "T06",
				"VALUE": "T0601"
			},
			"SLOPING EXT 1.5": {
				"NAME": "T06",
				"VALUE": "T0602"
			},
			"SLOPING MAX 2": {
				"NAME": "T06",
				"VALUE": "T0603"
			}
		}],
		"STOMACH-STATURE": [{
			"FLAT MIN 0.5": {
				"NAME": "T255",
				"VALUE": "T25507"
			},
			"FLAT AVG 1": {
				"NAME": "T255",
				"VALUE": "T25508"
			},
			"FLAT MORE 1.5": {
				"NAME": "T255",
				"VALUE": "T25509"
			},
			"FLAT EXT 2": {
				"NAME": "T255",
				"VALUE": "T25510"
			},
			"FLAT MAX 2.5": {
				"NAME": "T255",
				"VALUE": "T25511"
			},
			"FULL MIN 0.5": {
				"NAME": "T13",
				"VALUE": "T1303"
			},
			"FULL AVG 1": {
				"NAME": "T13",
				"VALUE": "T1301"
			},
			"FULL MORE 1.5": {
				"NAME": "T13",
				"VALUE": "T1304"
			},
			"FULL EXT 2": {
				"NAME": "T13",
				"VALUE": "T1305"
			},
			"FULL MAX 2.5": {
				"NAME": "T13",
				"VALUE": "T1306"
			}
		}]
	}
 }
var sampleJSONdata = {
   "Action":"CreateOrder",
   "orders":{
      "Order":[
         {
            "brand":"TU",
            "mainorder":"8632991",
            "shop":"Web shop 1",
            "cdate":"2016-07-11",
            "deliver_date":"2016-07-26",
            "import_time":"2016-07-11 11:08:08",
            "remark":"Main order is 8632991",
            "customer":"Dean,W",
            "receiver":"Mr John",
            "country":"Australia",
            "province":" xxxxxx ",
            "address":"xxxxxx",
            "postcode":"116600",
            "contactnumber":"086135045712354",
            "front":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.1006347261.customer.6554935.2.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "back":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.1580473625.customer.6554935.0.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "sideLeft":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.546762578.customer.6554935.1.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "sideRight":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444814.949463591.customer.6554935.3.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "OrderDetails":[
               {
                  "orderdetailid":"456775",
                  "order":"8632991",
                  "combination":"TU0101",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":"3223",
                        "mode":"01",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"01",
                  "ptype":"01",
                  "class":"02",
                  "made":"Half Canvas",
                  "tryon":"40",
                  "fit":"Regular",
                  "remark":""
               },
               {
                  "orderdetailid":"456775",
                  "order":"8632991",
                  "combination":"TU0101",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":"",
                        "mode":"",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"02",
                  "ptype":"01",
                  "class":"05",
                  "made":"Half Canvas",
                  "tryon":"40",
                  "fit":"Regular",
                  "remark":""
               },
               {
                  "orderdetailid":"345433",
                  "order":"8632991",
                  "combination":"TU0101",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":"3223",
                        "mode":"01",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"01",
                  "ptype":"01",
                  "class":"02",
                  "made":"Half Canvas",
                  "tryon":"40",
                  "fit":"Regular",
                  "remark":""
               },
               {
                  "orderdetailid":"345433",
                  "order":"8632991",
                  "combination":"TU0101",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":"",
                        "mode":"01",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"02",
                  "ptype":"01",
                  "class":"05",
                  "made":"Half Canvas",
                  "tryon":"40",
                  "fit":"Regular",
                  "remark":""
               }
            ],
            "Measurements":[
               {
                  "orderdetailid":"456775",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"msy_jiazuojiangao",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"mkz_jiayaowei",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"mkz_jiatunwei",
                  "tryon_adjustment":"2.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"msy_jiachangbotou",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"msy_jiazuojiangao",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"mkz_jiayaowei",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"mkz_jiatunwei",
                  "tryon_adjustment":"2.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"msy_jiachangbotou",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               }
            ],
            "Options":[
               {
                  "orderdetailid":"456775",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010201",
                  "option_code":" T01020102"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010202",
                  "option_code":" T01020201"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010501",
                  "option_code":" T01050102"
               },
               {
                  "orderdetailid":"456775",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010502",
                  "option_code":" T01050201"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010201",
                  "option_code":" T01020101"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010202",
                  "option_code":" T01020202"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010501",
                  "option_code":" T01050101"
               },
               {
                  "orderdetailid":"345433",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010502",
                  "option_code":" T01050202"
               }
            ]
         },
         {
            "brand":"TU",
            "mainorder":"8632992",
            "shop":" Web shop 1 ",
            "combination":"TU0101",
            "cdate":"2016-07-11",
            "cl_flag":"0",
            "deliver_date":"2016-07-18",
            "import_time":"2016-07-10 12:08:08",
            "remark":"This is the second order 8632992",
            "customer":"Dean,W",
            "receiver":"Robert Plant",
            "country":"China",
            "province":"Liaoni",
            "address":"xxxxxx",
            "postcode":"116600",
            "contactnumber":"086135045712222",
            "front":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.1006347261.customer.6554935.2.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "back":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.1580473625.customer.6554935.0.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "sideLeft":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444813.546762578.customer.6554935.1.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "sideRight":"https%3A%2F%2Fd3dgk6r8ca2pzn.cloudfront.net%2Fimages%2Fcustomer_profiles%2Fx1482444814.949463591.customer.6554935.3.large.jpeg.pagespeed.ic.wtXUj1YfjJ.jpg ",
            "OrderDetails":[
               {
                  "orderdetailid":"233222",
                  "order":"8632992",
                  "combination":"TU0101",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":" L400",
                        "mode":"01",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"01",
                  "ptype":"01",
                  "class":"02",
                  "made":"Half Canvas",
                  "tryon":"52",
                  "fit":"Regular",
                  "remark":""
               },
               {
                  "orderdetailid":"233223",
                  "order":"8632992",
                  "combination":"TU0102",
                  "mode":"01",
                  "fabric":[
                     {
                        "sku":"TROC012",
                        "mode":"02",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":"3"
                     }
                  ],
                  "lining":[
                     {
                        "sku":" L400",
                        "mode":"01",
                        "Vendor":"",
                        "Description":"",
                        "Composition":"",
                        "Length":""
                     }
                  ],
                  "cl_flag":"0",
                  "styleno":"02",
                  "ptype":"01",
                  "class":"05",
                  "made":"Half Canvas",
                  "tryon":"52",
                  "fit":"Regular",
                  "remark":""
               }
            ],
            "Measurements":[
               {
                  "orderdetailid":"233222",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"msy_jiazuojiangao",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"mkz_jiayaowei",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"mkz_jiatunwei",
                  "tryon_adjustment":"2.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"msy_jiachangbotou",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"msy_jiazuojiangao",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"01",
                  "class":"02",
                  "item_code":"mkz_jiayaowei",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"mkz_jiatunwei",
                  "tryon_adjustment":"2.5",
                  "value":"NULL"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"02",
                  "class":"05",
                  "item_code":"msy_jiachangbotou",
                  "tryon_adjustment":"1.5",
                  "value":"NULL"
               }
            ],
            "Options":[
               {
                  "orderdetailid":"233222",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010201",
                  "option_code":" T01020102"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010202",
                  "option_code":" T01020201"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010501",
                  "option_code":" T01050102"
               },
               {
                  "orderdetailid":"233222",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010502",
                  "option_code":" T01050201"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010201",
                  "option_code":" T01020101"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"01",
                  "class":"02",
                  "option_type":" T010202",
                  "option_code":" T01020202"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010501",
                  "option_code":" T01050101"
               },
               {
                  "orderdetailid":"233223",
                  "styleno":"02",
                  "class":"05",
                  "option_type":" T010502",
                  "option_code":" T01050202"
               }
            ]
         }
      ]
   }
}
var RECORDMOD, FORMATMOD, SEARCHMOD, RUNTIMEMOD, HTTPMOD, XMLMOD, LOGMOD;
define(['N/record', 'N/format', 'N/search', 'N/runtime', 'N/http', 'N/xml', 'N/log', 'N/https'],
function(record, format, search, runtime, httpmod, xmlmod, logmod, httpsmod) {
	RECORDMOD = record;
	FORMATMOD = format;
	SEARCHMOD = search;
	RUNTIMEMOD = runtime;
	HTTPMOD = httpmod;
	XMLMOD = xmlmod;
	LOGMOD = logmod;
	HTTPSMOD = httpsmod;
	return {
		'getAccessToken' : getAccessToken,
		'getAesStr' : getAesStr,
		'getDeAes' : getDeAes,
		'getErrorCode' : getErrorCode,
		'getOrderConsume' : getOrderConsume,
		'getOrderInfo' : getOrderInfo,
		'getPartsInfo' : getPartsInfo,
		'getStock' : getStock,
		'getStockByFtno' : getStockByFtno,
		'receiveOrder' : receiveOrder,
		'receiveOrderTest' : receiveOrderTest,
		'sendOrderUnencrypted' : sendOrderUnencrypted,
		'sendOrderUnencryptedTest' : sendOrderUnencryptedTest,
		'getStyylcartUrl': getStyylcartUrl,
		'getCustomerLiningUrl': getCustomerLiningUrl
	}

});
function getAccessToken(){
	try{
		var response = HTTPMOD.get({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetAccessToken',
			body: ""
			});
		LOGMOD.audit('getAccessToken', 'getAccessToken response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var AccessToken = xml_path.firstChild.textContent;
			return AccessToken;
		}
		return {error: response.code};
	}catch(e){
		LOGMOD.error('getAccessToken', 'ERROR : ' + e.message);
	}
}

function getAesStr(orders, accesstoken){//orders appsecret accesstoken
	try{
		var data = {
			orders: orders,
			appsecret: APPSECRET,
			accessToken: accesstoken//getAccessToken()
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetAesStr',
			body: data
			});
		LOGMOD.audit('getAesStr', 'getAesStr response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getAesStr', 'ERROR : ' + e.message);
	}
}

function getDeAes(orders){
	try{
		var data = {
			orders: orders,
			AccessToken: getAccessToken()
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetDeAes',
			body: data
			});
		LOGMOD.audit('getDeAes', 'getDeAes response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getDeAes', 'ERROR : ' + e.message);
	}
}

function getErrorCode(){
	try{
		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetErrorCode',
			body: ""
			});
		LOGMOD.audit('getErrorCode', 'getErrorCode response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var AccessToken = xml_path.firstChild.textContent;
			return AccessToken;
		}
		return {error: response.code};
	}catch(e){
		LOGMOD.error('getErrorCode', 'ERROR : ' + e.message);
	}
}

function getOrderConsume(orders){
	try{
		var data = {
			orders: orders,
			appsecrets: APPSECRET
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetOrderConsume',
			body: data
			});
		LOGMOD.audit('getOrderConsume', 'getOrderConsume response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getOrderConsume', 'ERROR : ' + e.message);
	}
}

function getOrderInfo(ordernos){
	try{
		var data = {
			orders: ordernos,
			appsecrets: APPSECRET
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetOrderInfo',
			body: data
			});
		LOGMOD.audit('getOrderInfo', 'getOrderInfo response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getOrderInfo', 'ERROR : ' + e.message);
	}
}

function getPartsInfo(classid, optiontypecode){
	try{
		var data = {
			appsecrets: APPSECRET,
			classid: classid,
			optiontypecode: optiontypecode
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetPartsInfo',
			body: data
			});
		LOGMOD.audit('getPartsInfo', 'getPartsInfo response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getPartsInfo', 'ERROR : ' + e.message);
	}
}

function getStock(){
	try{
		var data = {
			AccessToken: getAccessToken(),
			appsecrets: APPSECRET
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetStock',
			body: data
			});
		LOGMOD.audit('getStock', 'getStock response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getStock', 'ERROR : ' + e.message);
	}
}

function getStockByFtno(ftnos){
	try{
		var data = {
			AccessToken: getAccessToken(),
			appsecrets: APPSECRET,
			ftnos: ftnos
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/GetStockByFtno',
			body: data
			});
		LOGMOD.audit('getStockByFtno', 'getStockByFtno response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getStockByFtno', 'ERROR : ' + e.message);
	}
}

function receiveOrder(orders){
	try{
		var accesstoken = getAccessToken();
		var encryptedOrder = getAesStr(JSON.stringify(orders), accesstoken);
		LOGMOD.audit('receiveOrder encryptedOrder', encryptedOrder);
		var data = {
			AccessToken: accesstoken,
			Brand: BRAND,
			orders: encryptedOrder
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/ReceiveOrder',
			body: data
			});
		LOGMOD.audit('receiveOrder', 'receiveOrder response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('receiveOrder', 'ERROR : ' + e.message);
	}
}

function receiveOrderTest(orders){
	try{
		var data = {
			AccessToken: getAccessToken(),
			Brand: BRAND,
			orders: orders
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/ReceiveOrderTest',
			body: data
			});
		LOGMOD.audit('receiveOrderTest', 'receiveOrderTest response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('receiveOrderTest', 'ERROR : ' + e.message);
	}
}

function sendOrderUnencrypted(orders){
	try{
		var data = {
			orders: orders,
			AccessToken: getAccessToken(),
			appsecrets: APPSECRET,
			Brand: BRAND
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/SendOrderUnencrypted',
			body: data
			});
		LOGMOD.audit('sendOrderUnencrypted', 'sendOrderUnencrypted response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('sendOrderUnencrypted', 'ERROR : ' + e.message);
	}
}

function sendOrderUnencryptedTest(orders){
	try{
		var data = {
			orders: orders,
			AccessToken: getAccessToken(),
			appsecrets: APPSECRET,
			Brand: BRAND
		}

		var response = HTTPMOD.post({
			url:'http://tuservice.ustyylit.com/tuservice.asmx/SendOrderUnencryptedTest',
			body: data
			});
		LOGMOD.audit('sendOrderUnencryptedTest', 'sendOrderUnencryptedTest response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var xml_path = XMLMOD.Parser.fromString(response.body)
			LOGMOD.audit('path',response.body);
			var responseData = xml_path.firstChild.textContent;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('sendOrderUnencryptedTest', 'ERROR : ' + e.message);
	}
}

function isEmpty(fldValue) {
	return fldValue == '' || fldValue == null || fldValue == undefined;
}
function formatDDMMYYYY(date)
{
	return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
}
function getFloatVal(v) {
	if (isEmpty(v))
		return 0;

	return parseFloat(v);
}
function getCustomerLiningUrl(){
	try{
		var data = {
			appsecrect: APPSECRET
		}

		var response = HTTPSMOD.post({
			url:'https://api.dayang.cn/TokenService.asmx/GetCustomerLiningUrl',
			body: data
			});
		LOGMOD.audit('getCustomerLiningUrl', 'getCustomerLiningUrl response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var responseData = response.body;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('getCustomerLiningUrl', 'ERROR : ' + e.message);
	}
}
function getStyylcartUrl(){
	try{
		var data = {
			appsecrect: APPSECRET
		}

		var response = HTTPSMOD.post({
			url:'https://api.dayang.cn/TokenService.asmx/GetStyylcartUrl',
			body: data
			});
		LOGMOD.audit('GetStyylcartUrl', 'GetStyylcartUrl response | Code : ' + response.code + ' | Body : ' + response.body);
		if(response.code == 200){
			var responseData = response.body;
			return responseData;
		}else{
			return {error: response.code};
		}
	}catch(e){
		LOGMOD.error('GetStyylcartUrl', 'ERROR : ' + e.message);
	}
}
