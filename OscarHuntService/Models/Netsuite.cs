using OscarHunt;
using OscarHuntService.com.netsuite.webservices;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;

using System.Xml;
using System.Security.Cryptography;
using System.IO;
using Newtonsoft.Json;
using OscarHuntService.com.ustyylit.tuservice;
using Newtonsoft.Json.Linq;
using System.Web.Script.Serialization;
using System.Net.Mail;
using System.Web;
namespace OscarHuntService
{
    public class NSClientERP
    {
        /// <summary> Proxy class that abstracts the communication with the NetSuite Web
        /// Services. All NetSuite operations are invoked as methods of this class.
        /// </summary>
        private NetSuiteService _service;

        /// <value>Utility class for logging</value>
        private Logger _out;

        /// <value>A NameValueCollection that abstracts name/value pairs from
        /// the app.config file in the Visual .NET project. This file is called
        /// [AssemblyName].exe.config in the distribution</value>
        private System.Collections.Specialized.NameValueCollection _dataCollection;


        /// <summary> Requested page size for search
        /// </summary>
        private int _pageSize;

        /// <value>Flag saying whether authentication is token based. </value>
        private bool useTba;

        /// Set up request level preferences as a SOAP header
        private Preferences _prefs;
        private SearchPreferences _searchPreferences;

        private string ENVIRONMENT = string.Empty;

        private String PENDING_APPROVAL_STRING = "_salesOrderPendingApproval";

        private String TRANSACTION_TYPE = "_salesOrder";

        //Private variable declaration
        private String CUSTCOL_FITPROFILE = "custcol_fitprofile_";
        private String CUSTCOL_DESIGNOPTIONS = "custcol_designoptions_";
        private String CUSTCOL_CUSTOM_FABRIC_DETAILS = "custcol_custom_fabric_details";
        private String CUSTCOL_PRODUCTTYPE = "custcol_producttype";
        private String CUSTCOL_CUSTOMER_NAME = "custbody_customer_name";
        private String CUSTCOL_SO_ID = "custcol_so_id";
        private String CUSTCOL_FITPROFILE_SUMMARY = "custcol_fitprofile_summary";
        private string GARMENT_LINING_CODE = "li-";

        private String BLOCK = "Block";
        private String BODY = "Body";
        private String FIT = "Fit";
        private String JACKET = "Jacket";
        private String TROUSERS = "Trousers";
        private String TROUSER = "Trouser";
        private String WAISTCOAT = "Waistcoat";
        private String TWO_PIECE_SUIT = "2-Piece Suit";
        private String THREE_PIECE_SUIT = "3-Piece Suit";
        private String TWO_P_S = "2-Piece-Suit";
        private String THREE_P_S = "3-Piece-Suit";
        private String LADIES_SKIRT = "Ladies-Skirt";
        private String LADIES_JACKET = "Ladies-Jacket";
        private String LADIES_PANTS = "Ladies-Pants";
        private String TRENCHCOAT = "Trenchcoat";
        private String SHORT_SLEEVES_SHIRT = "Short-Sleeves-Shirt";
        private String L_2PC_SKIRT = "L-2PC-Skirt";
        private String L_3PC_SUIT = "L-3PC-Suit";
        private String L_2PC_PANTS = "L-2PC-Pants";
        private String TWO_PC_SUIT = "2 PC Suit";
        private String THREE_PC_SUIT = "3 PC Suit";
        private String SHIRT = "Shirt";
        private String SHORTS = "Shorts";
        private String MORNING_COAT = "Morning-Coat";
        private String CAMP_SHIRT = "Camp-Shirt";
        private String SHIRT_JACKET = "Shirt-Jacket";
        private String SAFARI_JACKET = "Safari-Jacket";
        private String CMT_ITEM = "CMT Item";


        private String MAPPING_DATA_ROOT_KEY = "MappingData";
        private String GARMENT_CLASS = "GarmentClass";
        private String MODE = "Mode";
        private String GARMENT_MAKE = "GarmentMake";
        private String GARMENT_COMBINATION_CODE = "GarmentCombinationCode";
        private String TWO_PIECE_SUIT_COMBINATION_CODE = "2P SUIT";
        private String THREE_PIECE_SUIT_COMBINATION_CODE = "3P SUIT";
        private String FITTOOL = "FitTool_";

        private string ITEM_API_STATUS_SCRIPT_ID = "custcolcustcol_api_status_fld";
        private string ITEM_API_STATUS_INTERNAL_ID = "836";

        private string ITEM_API_ERROR_DESC_SCRIPT_ID = "custcolcustcol_api_error_desc_fld";
        private string ITEM_API_ERROR_DESC_INTERNAL_ID = "837";

        private string API_SALES_ORDER_STATUS_SCRIPT_ID = "custbodycustbody_api_sales_ord_st_json";
        private string API_SALES_ORDER_STATUS_INTERNAL_ID = "838";

        private string SUCCESS = "Success";
        private string OLD_ORDER = "Old Order";
        private string ERROR = "Error";
        private string HOLD_ORDER = "Hold Order";
        private string PROCESSED = "Processed";
        private List<GroupOrders> groupOrders;

        private SettingConfnfiguration configSettingData;

        /// <summary>
        /// Summary description for NSClient.
        /// </summary>
        public NSClientERP()
        {
            // Setting pageSize to 5 records per page
            _pageSize = 100;

            _out = new Logger("info");

            // Reference to config file that contains sample data. This file
            // is named App.config in the Visual .NET project or, <AssemblyName>.exe.config
            // in the distribution
            _dataCollection = System.Configuration.ConfigurationManager.AppSettings;

            //Decide between standard login and TBA
            useTba = "true".Equals(_dataCollection["login.useTba"]);

            configSettingData = new SettingConfnfiguration();
            configSettingData = _out.ReadConfigFile();

            // Instantiate the NetSuite web services
            _service = new DataCenterAwareNetSuiteService(configSettingData.Account);
            _service.Timeout = 1000 * 60 * 60 * 2;

        }


        public void EntryPoint()
        {
            //_out.info("Inside EntryPoint");
            // Force TLS 1.2
            System.Net.ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

            // In order to enable SOAPscope to work through SSL. Refer to FAQ for more details
            ServicePointManager.ServerCertificateValidationCallback += delegate (object sender, System.Security.Cryptography.X509Certificates.X509Certificate certificate, System.Security.Cryptography.X509Certificates.X509Chain chain, System.Net.Security.SslPolicyErrors sslPolicyErrors)
            {
                return true;
            };
            NSClientERP ns = null;
            try
            {
                ns = new NSClientERP();
                ns.groupOrders = new List<GroupOrders>();

                //setting Search Preferences for the client
                ns.setPreferences();
                ns.ENVIRONMENT = Convert.ToString(configSettingData.Environment);
            }
            catch (Exception ex)
            {
                ns._out.error("Error while loading the application:" + ex.Message);
            }

            // Continue if Client loaded
            if (ns != null)
            {
                try
                {
                    if (configSettingData.GenerateJson == "JSON" || configSettingData.GenerateJson == "ORDER")
                    {
                        var orderNos = configSettingData.JsonOrderNo;
                        if (orderNos != string.Empty)
                        {
                            string[] orderData = orderNos.Split(',');
                            foreach (var mainOrderId in orderData)
                            {
                                SalesOrder SoDetails = ns.GetSalesOrderDetails(mainOrderId);

                                if (SoDetails != null && SoDetails.tranId != null)
                                {
                                    if (configSettingData.GenerateJson == "JSON")
                                    {
                                        StreamReader jsonDataMapping = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "MappingData.json", true);
                                        StreamReader errorData = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "UstyylitErrorCodes.json", true);

                                        var jsonMappingData = new JsonMappingData
                                        {
                                            jsonMapping = jsonDataMapping.ReadToEnd(),
                                            jsonErrors = errorData.ReadToEnd()
                                        };

                                        var orderDetails = CreateOrder(SoDetails, jsonMappingData);
                                        var jsonData = CreateOrderJson(orderDetails);

                                        StreamWriter sw = null;

                                        if (!Directory.Exists(AppDomain.CurrentDomain.BaseDirectory + "JsonData"))
                                        {
                                            Directory.CreateDirectory(AppDomain.CurrentDomain.BaseDirectory + "JsonData");
                                        }

                                        var fileName = "JsonData/" + mainOrderId + ".json";

                                        sw = new StreamWriter(AppDomain.CurrentDomain.BaseDirectory + fileName, false);
                                        sw.Write(jsonData);
                                        sw.Flush();
                                        sw.Close();
                                        ns._out.info("JSON created for order no:" + mainOrderId);
                                    }
                                    else
                                    {
                                        ns._out.info("Started manual order processing for order no:" + SoDetails.tranId);
                                        ns.searchSalesOrderByOrderNumber(SoDetails);
                                    }

                                }
                            }
                        }
                    }

                    if (Convert.ToBoolean(configSettingData.PushData))
                    {
                        ns.searchSalesOrderByStatus();
                    }
                }
                catch (System.FormatException)
                {
                    ns._out.info("\nInvalid choice. Please select once of the following options.");
                }
                catch (System.Web.Services.Protocols.SoapException ex)
                {
                    // Get the fault type. It's the only child element of the detail element.
                    String fault = ex.Detail.FirstChild.Name;

                    // Get the list of child elements of the fault type element. 
                    // It should include the code and message elements
                    System.Collections.IEnumerator ienum = ex.Detail.FirstChild.ChildNodes.GetEnumerator();
                    String code = null;
                    String message = null;
                    while (ienum.MoveNext())
                    {
                        XmlNode node = (XmlNode)ienum.Current;
                        if (node.Name.Equals("code"))
                            code = node.InnerText;
                        else if (node.Name.Equals("message"))
                            message = node.InnerText;
                    }
                    ns._out.fault(fault, code, message);
                }
                catch (System.Net.WebException ex)
                {
                    ns._out.fault(ex.Message);
                }
                catch (System.InvalidOperationException ex)
                {
                    ns._out.fault(ex.Message);
                }
                catch (System.Exception ex)
                {
                    ns._out.error(ex.Message);
                }
                finally
                {
                }
            }
        }

        public string GetBrandName(string brandName)
        {
            if (brandName != string.Empty)
            {
                string[] brand = brandName.Split(' ');
                var brandNumber = brand[0];
                if (System.Text.RegularExpressions.Regex.IsMatch(brandNumber, "^[0-9]*$"))
                {
                    brandName = brandName.Substring(brandNumber.Length + 1);
                }
            }

            return brandName;
        }

        private string CreateOrderJson(Order order)
        {
            List<Order> orderList = new List<Order>();
            orderList.Add(order);

            var createOrder = new CreateOrder
            {
                Action = "CreateOrder",
                orders = new Orders
                {
                    Order = orderList
                }
            };
            var orderJsonData = new JavaScriptSerializer().Serialize(createOrder);

            return orderJsonData;
        }

        private string CreateOrderGroupJson(List<Order> orderList)
        {
            var createOrder = new CreateOrder
            {
                Action = "CreateOrder",
                orders = new Orders
                {
                    Order = orderList
                }
            };
            var orderJsonData = new JavaScriptSerializer().Serialize(createOrder);
            return orderJsonData;
        }

        private Order CreateOrder(SalesOrder so, JsonMappingData jsonData)
        {
            var order = new Order();
            try
            {
                var customerName = so.customFieldList.Where(m => m.scriptId == CUSTCOL_CUSTOMER_NAME).Select(item => ((StringCustomFieldRef)item).value).FirstOrDefault().ToString();
                string jsonMapData = jsonData.jsonMapping;
                var dictMapData = new JavaScriptSerializer().Deserialize<List<dynamic>>(jsonMapData);
                
                var brandNameTest = configSettingData.BrandNameTest; 
                var shopNameTest = configSettingData.ShopNameTest;

                var brandName = GetBrandName(so.entity.name);
                
                var thebrand = GetBrandName(so.entity.name);
                if (brandName != "Oscar Hunt Pty Ltd" && brandName != "Oscar Hunt Sydney Pty Ltd" && brandName != "GC Menswear")
                {
                    thebrand = "JETU";
                }
                else if (brandName == "GC Menswear") {
                    thebrand = "GCTU";
                }
                order = new Order
                {
                    brand = thebrand,
                    mainorder = so.tranId,
                    shop = ENVIRONMENT.ToUpper() == "TESTING" ? shopNameTest : brandName,
                    customer = customerName,
                    cdate = Convert.ToDateTime(so.createdDate).ToString("yyyy-MM-dd"),
                    deliver_date = "",
                    latest_deliver_date = "",
                    import_time = DateTime.Now.ToString("yyyy-MM-dd"),
                    remark = "",
                    front = "",
                    back = "",
                    sideLeft = "",
                    sideRight = "",
                    receiver = brandName,
                    country = so.shippingAddress.country.ToString(),
                    province = so.shippingAddress.state,
                    address = so.shippingAddress.addrText,
                    postcode = so.shippingAddress.zip,
                    contactnumber = so.shippingAddress.addrPhone

                };


                int itemNumber = 0;
                List<OrderDetail> orderDetailList = new List<OrderDetail>();
                List<Measurement> MeasurementList = new List<Measurement>();
                List<Observation> ObservationList = new List<Observation>();
                List<Option> OptionList = new List<Option>();
                string measurementType = null;
                foreach (var item in so.itemList.item)
                {
                    itemNumber += 1;
                    if (itemNumber % 2 != 0)
                    {
                        //Garment Design Option Data
                        var customFabricDetailsData = item.customFieldList.Where(m => m.scriptId == CUSTCOL_CUSTOM_FABRIC_DETAILS).Count() > 0 ? Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_CUSTOM_FABRIC_DETAILS).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()) : null;
                        var productTypeData = item.customFieldList.Where(m => m.scriptId == CUSTCOL_PRODUCTTYPE).Count() > 0 ? Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_PRODUCTTYPE).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()) : null;
                        FabricDetails fabric = GetFabricDetails(item.item.name, customFabricDetailsData, productTypeData);
                        
                        var fabricCode = fabric.fabricCode;
                        var itemName = fabric.itemName;

                        if (item.poVendor.name == "AC Shirt")
                        {
                            fabricCode = "Q" + fabricCode;
                        }
                        else if (item.poVendor.name == "Filarte")
                        {
                            fabricCode = "FI" + fabricCode;
                        }
                        int subItemCount = 1;
                        var itemNameCombinationName = itemName;
                        if (itemName == TWO_PIECE_SUIT || itemName == TWO_PC_SUIT || itemName == TWO_P_S)
                        {
                            subItemCount = 2;
                            itemNameCombinationName = TWO_PIECE_SUIT_COMBINATION_CODE;
                            itemName = TWO_PIECE_SUIT_COMBINATION_CODE;
                        }
                        else if (itemName == THREE_PIECE_SUIT || itemName == THREE_PC_SUIT || itemName == THREE_P_S)
                        {
                            subItemCount = 3;
                            itemNameCombinationName = THREE_PIECE_SUIT_COMBINATION_CODE;
                            itemName = THREE_PIECE_SUIT_COMBINATION_CODE;
                        }
                        else if ( itemName == L_2PC_SKIRT)
                        {
                            subItemCount = 2;
                            itemNameCombinationName = itemName;
                            //itemName = itemName;
                        }
                        else if ( itemName == L_2PC_PANTS)
                        {
                            subItemCount = 2;
                            itemNameCombinationName = itemName;
                            //itemName = itemName;
                        }
                        else if ( itemName == L_3PC_SUIT)
                        {
                            subItemCount = 3;
                            itemNameCombinationName = itemName;
                            //itemName = itemName;
                        }


                        //Style no iteration logic
                        var subItemName = string.Empty;
                        for (int itemCounter = 1; itemCounter <= subItemCount; itemCounter++)
                        {
                            if (itemNameCombinationName == TWO_PIECE_SUIT_COMBINATION_CODE)
                            {
                                if (itemCounter == 1)
                                {
                                    subItemName = JACKET;
                                }
                                else
                                {
                                    subItemName = TROUSER;
                                }
                            }
                            else if (itemNameCombinationName == THREE_PIECE_SUIT_COMBINATION_CODE)
                            {
                                if (itemCounter == 1)
                                {
                                    subItemName = JACKET;
                                }
                                else if (itemCounter == 2)
                                {
                                    subItemName = TROUSER;
                                }
                                else
                                {
                                    subItemName = WAISTCOAT;
                                }
                            }
                            else if (itemNameCombinationName == L_2PC_SKIRT)
                            {
                                if (itemCounter == 1)
                                {
                                    subItemName = LADIES_JACKET;
                                }
                                else
                                {
                                    subItemName = LADIES_SKIRT;
                                }
                            }
                            else if (itemNameCombinationName == L_2PC_PANTS)
                            {
                                if (itemCounter == 1)
                                {
                                    subItemName = LADIES_JACKET;
                                }
                                else
                                {
                                    subItemName = LADIES_PANTS;
                                }
                            }
                            else if (itemNameCombinationName == L_3PC_SUIT)
                            {
                                if (itemCounter == 1)
                                {
                                    subItemName = LADIES_JACKET;
                                }
                                else if (itemCounter == 2)
                                {
                                    subItemName = LADIES_PANTS;
                                }
                                else
                                {
                                    subItemName = LADIES_SKIRT;
                                }
                            }
                            else
                            {
                                subItemName = itemName;
                            }


                            if (item.customFieldList.Where(m => m.scriptId.Contains(CUSTCOL_FITPROFILE_SUMMARY)).Count() > 0)
                            {
                                measurementType = GetMeasurementType(item.customFieldList.Where(m => m.scriptId.Contains(CUSTCOL_FITPROFILE_SUMMARY)).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault().ToString(), subItemName);
                            }
                            
                            //Garment Class code
                            var garmentClass = subItemName;
                            if (garmentClass == TROUSER)
                            {
                                garmentClass = TROUSERS;
                                //itemNameCombinationName = TROUSERS;
                            }

                            if (itemName == TROUSER)
                            {
                                itemName = TROUSERS;
                            }
                            
                            string subitemsubstring = subItemName;
                            if (subItemName == SHORT_SLEEVES_SHIRT)
                            {
                                subitemsubstring = "ssshirt";
                            }
                            else if (subItemName == LADIES_JACKET)
                            {
                                subitemsubstring = "ladiesjacket";
                            }
                            else if (subItemName == LADIES_PANTS)
                            {
                                subitemsubstring = "ladiespants";
                            }
                            else if (subItemName == LADIES_SKIRT) {
                                subitemsubstring = "ladiesskirt";
                            }
                            else if (subItemName == MORNING_COAT)
                            {
                                subitemsubstring = "morning_coat";
                            }
                            else if (subItemName == CAMP_SHIRT)
                            {
                                subitemsubstring = "camp_shirt";
                            }
                            else if (subItemName == SHIRT_JACKET)
                            {
                                subitemsubstring = "shirt_jacket";
                            }
                            else if (subItemName == SAFARI_JACKET)
                            {
                                subitemsubstring = "safari_jacket";
                            }

                            //Garment Design Option Data
                            var designOptionsData = item.customFieldList.Where(m => m.scriptId == CUSTCOL_DESIGNOPTIONS + subitemsubstring.ToLower()).Count() > 0 ? Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_DESIGNOPTIONS + subitemsubstring.ToLower()).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()) : null;
                            
                            //Garment FIT PROFILE Data
                            var fitProfileData = item.customFieldList.Where(m => m.scriptId == CUSTCOL_FITPROFILE + subitemsubstring.ToLower()).Count() > 0 ? Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_FITPROFILE + subitemsubstring.ToLower()).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()) : null;
                            //Lining logic
                            var liningCode = designOptionsData != null ? GetLiningCode(designOptionsData) : null;
                            var liningVendor = designOptionsData != null ? GetLiningVendor(designOptionsData) : null;
                            var liningQty = "";
                            if (liningVendor != null && liningVendor == "Custom Lining")
                            {
                                liningCode = designOptionsData != null ? GetCustomLiningCode(designOptionsData) : null;
                                liningQty = designOptionsData != null ? GetLiningQuantity(designOptionsData) : null;
                            }
                             
                                
                            //MAKE LOGIC
                            var garmentMakeCode = dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_MAKE][subItemName.ToUpper()];

                            var garmentMake = GetGarmentMake(designOptionsData, garmentMakeCode);
                            
                            //TRY ON LOGIC
                            var tryOnCode = fitProfileData != null ? GetFitProfileCode(fitProfileData, BLOCK) : string.Empty;

                            //TRY ON LOGIC
                            var fitCode = fitProfileData != null ? GetFitProfileCode(fitProfileData, FIT) : string.Empty;

                            List<Fabric> fabricList = new List<Fabric> {
                                new Fabric
                                {
                                    sku = fabricCode,
                                    mode = (item.poVendor.name == "AC Shirt" || item.poVendor.name == "Filarte" || item.poVendor.name == "Jerome Clothiers Cut Length" || item.poVendor.name == "Jerome Clothiers")? "01" : "02",
                                    Vendor = "",
                                    Description = "",
                                    Composition = "",
                                    Length = Convert.ToString(item.quantity)
                                }
                            };
                            var liningmode = liningCode != null && liningCode.ToUpper() == "CMT LINING" ? "02" : "01";

                            var showMode = true;
                            if (subItemName == SHIRT || subItemName == SHIRT_JACKET || subItemName == SHORTS)
                                showMode = false;
                            List<Lining> liningList = new List<Lining> {
                            new Lining {
                                    sku = liningCode != null ? liningCode : "",
                                    mode = showMode? liningmode : "",
                                    Vendor = "",
                                    Description = "",
                                    Composition = "",
                                    Length = liningQty
                                }
                            };

                            if (measurementType == BODY)
                                fitCode = "Regular";
                            // Adding Order Details Data to order
                            var clf = "0";
                            if (item.poVendor.name == "AC Shirt" || item.poVendor.name == "Filarte"
                                || item.poVendor.name == "Jerome Clothiers Cut Length")
                            {
                                clf = "1";
                            }
                            var orderDetail = new OrderDetail
                            {
                                order = so.tranId,
                                orderdetailid = item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Count() > 0 ? item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault().ToString() : null,
                                combination = itemName != string.Empty ? Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_COMBINATION_CODE][itemName.ToUpper()]) : string.Empty,
                                mode = measurementType != null ? Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][MODE][measurementType.ToUpper()]) : string.Empty,
                                fabric = fabricList,
                                lining = liningList,
                                cl_flag =  clf,
                                styleno = "0" + itemCounter.ToString(),
                                ptype = "01",
                                @class = garmentClass != null ? Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_CLASS][garmentClass.ToUpper()]) : string.Empty,
                                made = garmentMake,
                                tryon = measurementType == BLOCK ? tryOnCode : string.Empty,
                                fit = fitCode,
                                remark = ""
                            };
                            orderDetailList.Add(orderDetail);
                            //Adding Measurement data to order
                            if (fitProfileData != null)
                            {
                                var resultFitProfile = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(fitProfileData);
                                if (measurementType == BLOCK)
                                {
                                    foreach (var fitItem in resultFitProfile)
                                    {
                                        var name = fitItem.name;
                                        var value = fitItem.value;

                                        var fitToolGarmentData = dictMapData[0][MAPPING_DATA_ROOT_KEY][FITTOOL + garmentClass];
                                        foreach (var fit in fitToolGarmentData)
                                        {
                                            if (name.ToUpper() == ((KeyValuePair<string, object>)fit).Key)
                                            {
                                                if (value != "0" && value != "0.0")
                                                {
                                                    var measurement = new Measurement
                                                    {
                                                        orderdetailid = Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()),
                                                        styleno = "0" + itemCounter.ToString(),
                                                        @class = Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_CLASS][garmentClass.ToUpper()]),
                                                        item_code = Convert.ToString(((KeyValuePair<string, object>)fit).Value),
                                                        tryon_adjustment = value,
                                                        value = null
                                                    };
                                                    MeasurementList.Add(measurement);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    List<KeyValuePairJson> bodyMeasurements = new List<KeyValuePairJson>();
                                    List<KeyValuePairJson> observations = new List<KeyValuePairJson>();
                                    foreach (var fitItem in resultFitProfile)
                                    {
                                        var fitToolGarmentData = dictMapData[0][MAPPING_DATA_ROOT_KEY][FITTOOL + garmentClass + "_GM"];
                                        foreach (var fit in fitToolGarmentData)
                                        {
                                            if (fitItem.name.ToUpper() == (fit).Key || fitItem.name.ToUpper() == "ALLOWANCE-" + (fit).Key)
                                            {
                                                var resultData = bodyMeasurements.Where(m => m.name == (fit).Value.ToString()).FirstOrDefault();
                                                if (resultData != null)
                                                {
                                                    resultData.value = Convert.ToString(Convert.ToDouble(resultData.value) + Convert.ToDouble(fitItem.value));
                                                }
                                                else
                                                {
                                                    var fitToolName = string.Empty;
                                                    var fitToolValue = string.Empty;

                                                    if ((fit).Value is string)
                                                    {
                                                        fitToolName = Convert.ToString((fit).Value);
                                                        fitToolValue = fitItem.value;
                                                    }
                                                    else
                                                    {
                                                        var fitToolData = ((dynamic)(fit).Value)[0];
                                                        var observationName = string.Empty;
                                                        var observationValue = string.Empty;
                                                        foreach (var itemData in fitToolData)
                                                        {
                                                            var key = (itemData).Key;
                                                            if (key == fitItem.value.ToUpper())
                                                            {
                                                                var fitToolItemData = (itemData).Value;
                                                                foreach (var subItemData in fitToolItemData)
                                                                {
                                                                    if ((subItemData).Key == "NAME")
                                                                    {
                                                                        observationName = (subItemData).Value;
                                                                    }
                                                                    else if ((subItemData).Key == "VALUE")
                                                                    {
                                                                        observationValue = (subItemData).Value;
                                                                    }
                                                                }
                                                                var obs = new KeyValuePairJson
                                                                {
                                                                    name = observationName,
                                                                    value = observationValue
                                                                };
                                                                observations.Add(obs);
                                                            }
                                                        }
                                                    }
                                                    var fitData = new KeyValuePairJson
                                                    {
                                                        name = fitToolName,
                                                        value = fitToolValue
                                                    };
                                                    bodyMeasurements.Add(fitData);
                                                }
                                            }
                                        }
                                    }
                                        
                                    foreach (var observationData in observations)
                                    {
                                        if (observationData.name != string.Empty)
                                        {
                                            var observation = new Observation
                                            {
                                                orderdetailid = Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()),
                                                styleno = "0" + itemCounter.ToString(),
                                                @class = Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_CLASS][garmentClass.ToUpper()]),
                                                item_code = observationData.name,
                                                value = observationData.value
                                            };
                                            ObservationList.Add(observation);
                                        }
                                    }

                                    foreach (var fitData in bodyMeasurements)
                                    {
                                        if (fitData.name != string.Empty && fitData.value != "0" && fitData.value != "0.0")
                                        {
                                            var fitDataNameText = fitData.name.Split('_');
                                            var fitDataNameTextCount = fitDataNameText.Count();
                                            if (fitDataNameTextCount > 1)
                                            {
                                                var lastObservationText = fitDataNameText[fitDataNameTextCount - 1];
                                                if (lastObservationText.ToUpper() == "HALF")
                                                {
                                                    fitData.value = Convert.ToString(Convert.ToDouble(fitData.value) / 2);
                                                }
                                            }
                                            var measurement = new Measurement
                                            {
                                                orderdetailid = Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()),
                                                styleno = "0" + itemCounter.ToString(),
                                                @class = Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_CLASS][garmentClass.ToUpper()]),
                                                item_code = fitData.name,
                                                tryon_adjustment = null,
                                                value = fitData.value
                                            };
                                            MeasurementList.Add(measurement);
                                        }
                                    }
                                }
                            }



                            //Adding Options data to order
                            if (designOptionsData != null)
                            {
                                var resultOptions = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(designOptionsData);
                                foreach (var optionItem in resultOptions)
                                {
                                    var name = optionItem.name;
                                    var value = optionItem.value;

                                    if (!name.Contains("_other") && !name.Contains(GARMENT_LINING_CODE) && name != garmentMakeCode)
                                    {
                                        if (value == "Other")
                                        {
                                            //This is first used from contrast.. 
                                            //When contrast is set to Other, look for the name with _other
                                            var otherOptionValue = Convert.ToString(resultOptions.Where(m => m.name == name + "_other").Select(x => x.value).FirstOrDefault());
                                            value = otherOptionValue;
                                        }
                                        if (name == "T010239" || name == "T010238" || name == "T010240" || name == "T010250" ||
                                            name == "T010525" || name == "T010422" || name == "T010427" || name == "T010428" ||
                                            name == "T010634" || name == "T011623" || name == "T011628" || name == "T027242" ||
                                            name == "T014938" || name == "T014942" || name == "T014943" || name == "T010745" ||
                                            name == "T010745" || name == "T016938" || name == "T016942" || name == "T016943" ||
                                            name == "T016945" || name == "T016944")
                                        {
                                            value = HttpUtility.UrlPathEncode(value);
                                        }
                                            var option = new Option
                                        {
                                            orderdetailid = Convert.ToString(item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault()),
                                            styleno = "0" + itemCounter.ToString(),
                                            @class = Convert.ToString(dictMapData[0][MAPPING_DATA_ROOT_KEY][GARMENT_CLASS][garmentClass.ToUpper()]),
                                            option_type = name,
                                            option_code = value
                                        };
                                        OptionList.Add(option);
                                    }
                                }
                            }

                        }

                    }

                }

                order.OrderDetails = orderDetailList;
                order.Measurements = MeasurementList;
                if (measurementType == BODY)
                {
                    if(ObservationList.Any())
                        order.Observations = ObservationList;
                    else
                        order.Observations = new List<Observation>();
                }
                else
                {
                    order.Observations = new List<Observation>();
                }
                order.Options = OptionList;
            }
            catch (Exception ex)
            {
                _out.info("Error occured while creating order json for order no:" + so.tranId);
                _out.info("Error is:" + ex.Message);
            }
            return order;

        }

        public FabricDetails GetFabricDetails(string itemType, string customfabricdetails, string producttype)
        {
            string fabricCode = string.Empty;
            var itemName = string.Empty;
            var itemText = itemType.Split('(', ')');
            var codevalue = "";
            
            if (itemText.Count() == 1)
            {
                //I think this must be a cmt item
                string[] itemTypeArray = itemType.Split('-');
                if (itemTypeArray[0].Trim() == CMT_ITEM)
                {
                    //fabricCode = CMT_ITEM;
                    if (!string.IsNullOrEmpty(customfabricdetails))
                    {
                        JObject result = JObject.Parse(customfabricdetails);
                        try
                        {
                            codevalue = result["code"].ToString();
                        }
                        catch (Exception e) {
                            //_out.info("\nERROR: KERWIN " + e);
                            codevalue = CMT_ITEM;
                        }
                    }
                    
                    fabricCode = codevalue;
                }
                if (itemTypeArray.Count() == 1)
                {
                    itemName = producttype;
                    fabricCode = itemType;
                }
                else {
                    itemName = itemTypeArray[1].Trim();
                    fabricCode = itemType;
                }
            }
            else
            {
                
                fabricCode = itemText[1];
                if (producttype != "") {
                    itemName = producttype;
                }
                else
                    itemName = itemText[2].Trim().Substring(1).Trim();
            }

            var fabric = new FabricDetails
            {
                fabricCode = fabricCode,
                itemName = itemName
            };

            return fabric;
        }

        public string GetMeasurementType(string data, string garmentType)
        {
            var result = JsonConvert.DeserializeObject<List<FitProfileSummary>>(data);
            var measurementType = result.Where(m => m.name == garmentType).Select(item => item.type != null ? item.type : BLOCK).FirstOrDefault().ToString();
            return measurementType;
        }

        public string GetLiningCode(string data)
        {
            if (data != string.Empty)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var liningCode = Convert.ToString(result.Where(m => m.name.Contains(GARMENT_LINING_CODE)).Select(item => item.value).FirstOrDefault());
                return liningCode;
            }
            else
            {
                return null;
            }
        }
        public string GetCustomLiningCode(string data)
        {
            if (data != string.Empty)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var liningCode = Convert.ToString(result.Where(m => m.name.Contains("li-code")).Select(item => item.value).FirstOrDefault());
                return liningCode;
            }
            else
            {
                return null;
            }
        }
        public string GetLiningQuantity(string data)
        {
            if (data != string.Empty)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var liningQuantity = Convert.ToString(result.Where(m => m.name.Contains("li-qty")).Select(item => item.value).FirstOrDefault());
                return liningQuantity;
            }
            else
            {
                return "";
            }
        }
        public string GetLiningVendor(string data)
        {
            if (data != string.Empty)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var liningVendor = Convert.ToString(result.Where(m => m.name.Contains("li-vnd")).Select(item => item.value).FirstOrDefault());
                return liningVendor;
            }
            else
            {
                return null;
            }
        }
        public string GetGarmentMake(string data, dynamic makeNameCode)
        {
            if (makeNameCode != string.Empty && data != null)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var makeCode = Convert.ToString(result.Where(m => m.name == makeNameCode).Select(item => item.value).FirstOrDefault());
                return makeCode;
            }
            else
            {
                return null;
            }

        }

        public string GetFitProfileCode(string data, string dataCode)
        {
            if (data != null && data != string.Empty)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var code = Convert.ToString(result.Where(m => m.name == dataCode.ToLower()).Select(item => item.value).FirstOrDefault());
                return code;
            }
            else
                return string.Empty;

        }

        public string GetFitCode(string data)
        {
            if (data != null)
            {
                var result = JsonConvert.DeserializeObject<List<KeyValuePairJson>>(data);
                var tryOnCode = Convert.ToString(result.Where(m => m.name == BLOCK.ToLower()).Select(item => item.value).FirstOrDefault());
                return tryOnCode;
            }
            else
                return string.Empty;

        }


        public virtual List<UstyylitErrorCodes> getUstyylitErrorCodes(TUService ustyylitService, JsonMappingData jsonData)
        {
            var errorCodes = ustyylitService.GetErrorCode();

            //var errorCodes = jsonData.jsonErrors;
            //_out.info("\nERROR CODE LIST: " + errorCodes);
            var errorCodeResult = JsonConvert.DeserializeObject<List<UstyylitErrorCodes>>(errorCodes);

            return errorCodeResult;

        }


        public virtual void updateSalesOrderItemInformation(SalesOrder salesOrder, List<OrderErrorResponse> errors, string orderStatus, string accessToken)
        {
            SalesOrder so = UpdateCustomRecordValue(salesOrder, orderStatus);

            SalesOrderItemList salesOrderItemList = salesOrder.itemList;
            StringBuilder mailErrorDetails = new StringBuilder();
            int itemCounter = 1;
            foreach (var item in salesOrderItemList.item)
            {
                if (itemCounter % 2 != 0)
                {
                    StringBuilder errorDetails = new StringBuilder();

                    var itemErrorStatus = SUCCESS;
                    if (errors != null)
                    {
                        var subOrderId = item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Count() > 0 ? item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault().ToString() : null;

                        foreach (var errorData in errors)
                        {
                            if (errorData.subOrderId == subOrderId)
                            {
                                errorDetails.Append(errorData.remark);
                                errorDetails.AppendLine();
                                errorDetails.AppendLine();
                                mailErrorDetails.Append(errorDetails.ToString());
                            }
                        }
                        itemErrorStatus = ERROR;
                    }
                    else
                    {
                        errorDetails.AppendLine("Item Created @" + DateTime.Now.ToString("dd MMM yyyy hh:mm:ss"));
                    }

                    if (item.customFieldList.Where(m => m.scriptId == ITEM_API_STATUS_SCRIPT_ID).Count() > 0)
                    {
                        ((StringCustomFieldRef)(item.customFieldList.Where(m => m.scriptId == ITEM_API_STATUS_SCRIPT_ID).FirstOrDefault())).value = itemErrorStatus;
                    }
                    else
                    {
                        var newCustomField = new StringCustomFieldRef
                        {
                            value = itemErrorStatus,
                            scriptId = ITEM_API_STATUS_SCRIPT_ID,
                            internalId = ITEM_API_STATUS_INTERNAL_ID
                        };

                        var itemCustomData = item.customFieldList.ToList();
                        itemCustomData.Add(newCustomField);

                        item.customFieldList = itemCustomData.ToArray();

                    }

                    if (item.customFieldList.Where(m => m.scriptId == ITEM_API_ERROR_DESC_SCRIPT_ID).Count() > 0)
                    {
                        ((StringCustomFieldRef)(item.customFieldList.Where(m => m.scriptId == ITEM_API_ERROR_DESC_SCRIPT_ID).FirstOrDefault())).value = Convert.ToString(errorDetails);
                    }
                    else
                    {
                        var newCustomField = new StringCustomFieldRef
                        {
                            value = Convert.ToString(errorDetails),
                            scriptId = ITEM_API_ERROR_DESC_SCRIPT_ID,
                            internalId = ITEM_API_ERROR_DESC_INTERNAL_ID
                        };

                        var itemCustomData = item.customFieldList.ToList();
                        itemCustomData.Add(newCustomField);
                        item.customFieldList = itemCustomData.ToArray();
                    }

                    //item.description = Convert.ToString(errorDetails);
                }
                itemCounter++;
            }

            salesOrderItemList.replaceAll = false;

            so.itemList = salesOrderItemList;


            WriteResponse writeRes = _service.update(so);
            if (writeRes.status.isSuccess)
            {
                _out.writeLn("\nSales order updated successfully");
            }
            else
            {
                _out.error(getStatusDetails(writeRes.status));
            }

            if (Convert.ToBoolean(configSettingData.SendAPISalesOrderStatusMail))
            {
                SendMail(salesOrder.tranId, Convert.ToString(mailErrorDetails), accessToken);
            }

        }

        public virtual void updateGroupSalesOrderItemInformation
            (List<string> salesOrderList, List<OrderErrorResponse> errors, string orderStatus, string accessToken)
        {
            foreach (var salesId in salesOrderList)
            {
                SalesOrder salesOrder = GetSalesOrderDetails(salesId);

                var mainOrderId = errors.Where(m => m.mainOrderId == salesId);
                _out.info("\nErrors:" + errors);
                _out.info("\nMain order:" + mainOrderId + " Sales OrderID:" + salesId);
                if (mainOrderId.Count() > 0)
                {
                    StringBuilder mailErrorDetails = new StringBuilder();
                    SalesOrder so = UpdateCustomRecordValue(salesOrder, orderStatus);

                    SalesOrderItemList salesOrderItemList = salesOrder.itemList;

                    int itemCounter = 1;
                    foreach (var item in salesOrderItemList.item)
                    {
                        if (itemCounter % 2 != 0)
                        {
                            StringBuilder errorDetails = new StringBuilder();
                            var itemErrorStatus = SUCCESS;
                            if (errors != null)
                            {
                                var subOrderId = item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Count() > 0 ? item.customFieldList.Where(m => m.scriptId == CUSTCOL_SO_ID).Select(x => ((StringCustomFieldRef)x).value).FirstOrDefault().ToString() : null;

                                foreach (var errorData in errors)
                                {
                                    if (errorData.subOrderId == string.Empty && errorData.remark == SUCCESS)
                                    {
                                        errorDetails.AppendLine("ITEM CREATED SUCCESSFULLY. MsgId:" + accessToken);
                                        break;
                                    }
                                    else if (errorData.subOrderId == string.Empty)
                                    {
                                        errorDetails.AppendLine(errorData.remark);
                                        itemErrorStatus = errorData.remark;
                                        break;
                                    }
                                    {
                                        if (errorData.subOrderId == subOrderId)
                                        {
                                            errorDetails.Append(errorData.remark);
                                            errorDetails.AppendLine();
                                            errorDetails.AppendLine();
                                        }
                                        itemErrorStatus = ERROR;
                                    }
                                }
                                mailErrorDetails.Append(errorDetails.ToString());

                            }
                            else
                            {
                                errorDetails.AppendLine("Item Created. MsgId:" + accessToken);
                            }

                            if (item.customFieldList.Where(m => m.scriptId == ITEM_API_STATUS_SCRIPT_ID).Count() > 0)
                            {
                                ((StringCustomFieldRef)(item.customFieldList.Where(m => m.scriptId == ITEM_API_STATUS_SCRIPT_ID).FirstOrDefault())).value = itemErrorStatus;
                            }
                            else
                            {
                                var newCustomField = new StringCustomFieldRef
                                {
                                    value = itemErrorStatus,
                                    scriptId = ITEM_API_STATUS_SCRIPT_ID,
                                    internalId = ITEM_API_STATUS_INTERNAL_ID
                                };

                                var itemCustomData = item.customFieldList.ToList();
                                itemCustomData.Add(newCustomField);

                                item.customFieldList = itemCustomData.ToArray();

                            }

                            if (item.customFieldList.Where(m => m.scriptId == ITEM_API_ERROR_DESC_SCRIPT_ID).Count() > 0)
                            {
                                ((StringCustomFieldRef)(item.customFieldList.Where(m => m.scriptId == ITEM_API_ERROR_DESC_SCRIPT_ID).FirstOrDefault())).value = Convert.ToString(errorDetails);
                            }
                            else
                            {
                                var newCustomField = new StringCustomFieldRef
                                {
                                    value = Convert.ToString(errorDetails),
                                    scriptId = ITEM_API_ERROR_DESC_SCRIPT_ID,
                                    internalId = ITEM_API_ERROR_DESC_INTERNAL_ID
                                };

                                var itemCustomData = item.customFieldList.ToList();
                                itemCustomData.Add(newCustomField);
                                item.customFieldList = itemCustomData.ToArray();
                            }
                        }
                        itemCounter++;
                    }

                    salesOrderItemList.replaceAll = true;

                    so.itemList = salesOrderItemList;

                    var a = GeneralUtilities.GetXmlFromObject(so);

                    WriteResponse writeRes = _service.update(so);
                    if (writeRes.status.isSuccess)
                    {
                        _out.info("\nSales order:" + salesId + " updated successfully in Netsuite");
                    }
                    else
                    {
                        _out.error(getStatusDetails(writeRes.status));
                    }

                    if (Convert.ToBoolean(configSettingData.SendAPISalesOrderStatusMail))
                    {
                        SendMail(salesOrder.tranId, Convert.ToString(mailErrorDetails), accessToken);
                    }
                }
            }

        }

        public virtual SalesOrder UpdateCustomRecordValue(SalesOrder salesOrder, string orderStatus)
        {
            var field = salesOrder.customFieldList.Where(custField => custField.scriptId == API_SALES_ORDER_STATUS_SCRIPT_ID).FirstOrDefault();

            SalesOrder so = new SalesOrder();
            so.internalId = salesOrder.internalId;
            CustomFieldRef[] custFieldList;
            if (field == null)
            {
                custFieldList = new CustomFieldRef[] {
                    new StringCustomFieldRef
                    {
                        value = orderStatus,
                        scriptId = API_SALES_ORDER_STATUS_SCRIPT_ID,
                        internalId = API_SALES_ORDER_STATUS_INTERNAL_ID
                    }
                 };
            }
            else
            {
                custFieldList = new CustomFieldRef[] {
                    new StringCustomFieldRef
                    {
                        value = orderStatus,
                        scriptId = field.scriptId,
                        internalId = field.internalId
                    }
                 };
            }

            so.customFieldList = custFieldList;

            return so;
        }

        private SalesOrder GetSalesOrderDetails(string mainOrderId)
        {
            SalesOrder salesOrder = new SalesOrder();
            try
            {
                TransactionSearch xactionSearch = new TransactionSearch();

                SearchEnumMultiSelectField soField = new SearchEnumMultiSelectField();
                soField.@operator = SearchEnumMultiSelectFieldOperator.anyOf;
                soField.operatorSpecified = true;
                System.String[] searchValueStringArray = new System.String[1];
                searchValueStringArray[0] = TRANSACTION_TYPE;
                soField.searchValue = searchValueStringArray;

                SearchStringField orderIdField = new SearchStringField();
                orderIdField.@operator = SearchStringFieldOperator.contains;
                orderIdField.operatorSpecified = true;
                orderIdField.searchValue = mainOrderId;

                TransactionSearchBasic xactionBasic = new TransactionSearchBasic();
                xactionBasic.type = soField;
                xactionBasic.tranId = orderIdField;

                xactionSearch.basic = xactionBasic;

                SearchResult res = _service.search(xactionSearch);

                if (res.status.isSuccess && res.recordList.Count() > 0)
                {
                    salesOrder = (SalesOrder)res.recordList[0];
                }
            }
            catch (Exception ex)
            {
                _out.error("Error Occured: " + ex.Message);
            }

            return salesOrder;
        }

        private void searchSOByTranId(SalesOrder salesOrder)
        {
            var testXML = GeneralUtilities.GetXmlFromObject(salesOrder);
            StreamReader jsonDataMapping = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "MappingData.json", true);
            StreamReader errorData = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "UstyylitErrorCodes.json", true);

            var jsonData = new JsonMappingData
            {
                jsonMapping = jsonDataMapping.ReadToEnd(),
                jsonErrors = errorData.ReadToEnd()
            };
            try
            {
                if (salesOrder != null)
                {
                    var apiOrderStatus = salesOrder.customFieldList.Where(m => m.scriptId == API_SALES_ORDER_STATUS_SCRIPT_ID).Count() > 0 ? salesOrder.customFieldList.Where(m => m.scriptId == API_SALES_ORDER_STATUS_SCRIPT_ID).Select(item => ((StringCustomFieldRef)item).value).FirstOrDefault().ToString() : string.Empty;


                    _out.info("Processing started for order no:" + salesOrder.tranId);
                    TUService tuService = new TUService();
                    var accessToken = tuService.GetAccessToken();

                    var errorCodes = getUstyylitErrorCodes(tuService, jsonData);

                    var orderDetails = CreateOrder(salesOrder, jsonData);

                    var brandName = GetBrandName(salesOrder.entity.name);
                    var orderGroup = new GroupOrder
                    {
                        brand = brandName,
                        order = orderDetails
                    };

                    CreateGroupOrders(orderGroup);

                    var orderData = CreateOrderJson(orderDetails);

                    //get Ustyylit Access Code

                    var appSecret = configSettingData.AppSecret;

                    var encryptedOrderData = GeneralUtilities.AESEncrypt(orderData, appSecret, accessToken);

                    //// TESTING DATA FOR Order Response
                    //var orderResponse = "{\"result\":\"100\",\"msgid\":\"170124AUu3Reckx6\"}";
                    //var orderResponse = "{\"result\":\"1389\",\"msgid\":\"170124AUu3Reckx6\"}";
                    //var orderResponse = "[{\"orderno\":\"TU518-1\",\"error_code\":\"1047\"},{\"orderno\":\"TU518-1\",\"error_code\":\"1048\"},{\"orderno\":\"TU518-1\",\"error_code\":\"100126\"},{\"orderno\":\"TU518-1\",\"error_code\":\"100133\"},{\"orderno\":\"TU518-1\",\"error_code\":\"100143\"}]";

                    string brand = "TU";
                    //if (brandName != "Oscar Hunt Pty Ltd" && brandName != "Oscar Hunt Sydney Pty Ltd")
                    //{
                    //    brand = "JETU";
                    //}
                    var orderResponse = tuService.ReceiveOrder(encryptedOrderData, accessToken, brand);

                    _out.info("Order Response: " + orderResponse);
                    List<OrderErrorResponse> orderErrorResponse = new List<OrderErrorResponse>();
                    var token = JToken.Parse(orderResponse);
                    dynamic orderResponseJSON = string.Empty;
                    if (token is JArray)
                    {
                        orderResponseJSON = JsonConvert.DeserializeObject<List<UstyylitOrderErrorResponse>>(orderResponse);
                        foreach (var responseItem in (List<UstyylitOrderErrorResponse>)orderResponseJSON)
                        {

                            var orderNo = responseItem.orderno;
                            orderNo = orderNo.Substring(brand.Length, orderNo.Length - 2);
                            var error = responseItem.error_code;
                            var errorCodeRemark = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.remark).FirstOrDefault());
                            var ptCode = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.pt_code).FirstOrDefault());
                            var orderError = new OrderErrorResponse
                            {
                                subOrderId = orderNo,
                                remark = ptCode + " : " + errorCodeRemark
                            };
                            orderErrorResponse.Add(orderError);
                            _out.error("Error for Order-" + responseItem.orderno + " is: " + errorCodeRemark + " pt_code:" + ptCode);
                        }
                        string orderStatus = "Error: Item Data Missing";
                        updateSalesOrderItemInformation(salesOrder, orderErrorResponse, orderStatus, accessToken);
                    }
                    else if (token is JObject)
                    {
                        var orderStatus = string.Empty;
                        orderResponseJSON = JsonConvert.DeserializeObject<UstyylitResultResponse>(orderResponse);
                        if (((UstyylitResultResponse)orderResponseJSON).result == "100")
                        {
                            orderStatus = SUCCESS;
                            _out.info("Order No: " + salesOrder.tranId + "  created Successfully");
                        }
                        else
                        {
                            var error = ((UstyylitResultResponse)orderResponseJSON).result;
                            var errorCodeRemark = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.remark).FirstOrDefault());
                            orderStatus = "Error: " + errorCodeRemark;
                            _out.error("Error is: " + errorCodeRemark);
                        }

                        updateSalesOrderItemInformation(salesOrder, null, orderStatus, accessToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _out.error("Error Occured for order: " + salesOrder.tranId);
            }

        }

        private void CreateGroupOrders(GroupOrder order)
        {
            bool processMultiOrder = Convert.ToBoolean(ConfigurationManager.AppSettings["multipleOrders"]);

            if (processMultiOrder)
            {
                var brandData = groupOrders.Where(m => m.brand == order.brand).FirstOrDefault();

                if (brandData != null)
                {
                    brandData.mainOrderIdList.Add(order.mainOrderId);
                    brandData.orderList.Add(order.order);
                }
                else
                {
                    InsertGroupOrderData(order);
                }
            }
            else
            {
                InsertGroupOrderData(order);
            }
        }

        public void InsertGroupOrderData(GroupOrder order)
        {
            List<Order> brandOrderList = new List<Order>();
            brandOrderList.Add(order.order);

            var brandGroupOrders = new GroupOrders
            {
                mainOrderIdList = new List<string> { order.mainOrderId },
                brand = order.brand,
                orderList = brandOrderList
            };
            groupOrders.Add(brandGroupOrders);
        }

        private void ProcessOrder(SalesOrder salesOrder, JsonMappingData jsonData)
        {
            try
            {
                if (salesOrder != null)
                {
                    var apiOrderStatus = salesOrder.customFieldList.Where(m => m.scriptId == API_SALES_ORDER_STATUS_SCRIPT_ID).Count() > 0 ? salesOrder.customFieldList.Where(m => m.scriptId == API_SALES_ORDER_STATUS_SCRIPT_ID).Select(item => ((StringCustomFieldRef)item).value).FirstOrDefault().ToString() : string.Empty;

                    if (apiOrderStatus != PROCESSED && apiOrderStatus != SUCCESS && apiOrderStatus != OLD_ORDER && apiOrderStatus != HOLD_ORDER)
                    {
                        TUService tuService = new TUService();

                        var errorCodes = getUstyylitErrorCodes(tuService, jsonData);
                        
                        var orderDetails = CreateOrder(salesOrder, jsonData);
                        
                        var brandName = GetBrandName(salesOrder.entity.name);
                        var orderGroup = new GroupOrder
                        {
                            mainOrderId = salesOrder.tranId,
                            brand = brandName,
                            order = orderDetails
                        };

                        CreateGroupOrders(orderGroup);
                        
                    }
                    else
                    {
                        //_out.info("Order No: " + salesOrder.tranId + "-  Exists");
                    }
                }
            }
            catch (Exception ex)
            {
                _out.error("Error Occured for order: " + salesOrder.tranId);
            }

        }

        private void PushDataToUstyylit(JsonMappingData jsonData)
        {
            TUService tuService = new TUService();
            var errorCodes = getUstyylitErrorCodes(tuService, jsonData);
            
            if (groupOrders.Count() > 0)
            {
                foreach (var apiData in groupOrders)
                {
                    var OrderId = apiData.mainOrderIdList.FirstOrDefault().ToString();
                    _out.info("Processing started for order no:" + OrderId);
                    var accessToken = tuService.GetAccessToken();

                    var orderData = CreateOrderGroupJson(apiData.orderList);

                    //get Ustyylit Access Code

                    var appSecret = configSettingData.AppSecret;

                    var encryptedOrderData = GeneralUtilities.AESEncrypt(orderData, appSecret, accessToken);

                    //// TESTING DATA FOR Order Response
                    //var orderResponse = "{\"result\":\"100\",\"msgid\":\"170124AUu3Reckx6\"}";
                    //var orderResponse = "{\"result\":\"1389\",\"msgid\":\"170124AUu3Reckx6\"}";
                    //var orderResponse = "[{\"orderno\":\"TU561-1\",\"error_code\":\"1047\"},{\"orderno\":\"TU561-1\",\"error_code\":\"1048\"},{\"orderno\":\"TU561-1\",\"error_code\":\"100126\"},{\"orderno\":\"TU561-1\",\"error_code\":\"100133\"},{\"orderno\":\"TU561-1\",\"error_code\":\"100143\"}]";

                    //var brandNameTest = ConfigurationManager.AppSettings["BrandNameTest"];

                    _out.info("Before pushing data " + OrderId);
                    string brand = "TU";
                    //if (apiData.brand != "Oscar Hunt Pty Ltd" && apiData.brand != "Oscar Hunt Sydney Pty Ltd")
                    //{
                    //    brand = "JETU";
                    //}
                    try
                    {
                        var orderResponse = tuService.ReceiveOrder(encryptedOrderData, accessToken, brand); // hard coded brand TU

                        _out.info("Order Response for order no:" + OrderId + " is " + orderResponse);

                        List<OrderErrorResponse> orderErrorResponse = new List<OrderErrorResponse>();
                        var token = JToken.Parse(orderResponse);
                        dynamic orderResponseJSON = string.Empty;
                        if (token is JArray)
                        {
                            orderResponseJSON = JsonConvert.DeserializeObject<List<UstyylitOrderErrorResponse>>(orderResponse);
                            StringBuilder errorString = new StringBuilder();
                            foreach (var responseItem in (List<UstyylitOrderErrorResponse>)orderResponseJSON)
                            {

                                var subOrderNo = responseItem.orderno;
                                subOrderNo = subOrderNo.Substring(brand.Length, subOrderNo.Length - 2);
                                var mainOrderId = subOrderNo.Split('-')[0];
                                var error = responseItem.error_code;
                                var errorCodeRemark = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.remark).FirstOrDefault());
                                var ptCode = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.pt_code).FirstOrDefault());
                                var orderError = new OrderErrorResponse
                                {
                                    mainOrderId = mainOrderId,
                                    subOrderId = subOrderNo,
                                    remark = ptCode + " : " + errorCodeRemark
                                };
                                orderErrorResponse.Add(orderError);
                                errorString.Append("Error for Order-" + responseItem.orderno + " is: " + errorCodeRemark + " pt_code:" + ptCode);
                            }
                            _out.error(errorString.ToString());
                            string orderStatus = "Error: Item Data Missing";
                            updateGroupSalesOrderItemInformation(apiData.mainOrderIdList, orderErrorResponse, orderStatus, accessToken);
                        }
                        else if (token is JObject)
                        {
                            var orderStatus = string.Empty;
                            orderResponseJSON = JsonConvert.DeserializeObject<UstyylitResultResponse>(orderResponse);
                            if (((UstyylitResultResponse)orderResponseJSON).result == "100")
                            {
                                orderStatus = SUCCESS;

                            }
                            else
                            {
                                var error = ((UstyylitResultResponse)orderResponseJSON).result;
                                var errorCodeRemark = Convert.ToString(errorCodes.Where(m => m.error_code == error).Select(item => item.remark).FirstOrDefault());
                                orderStatus = "Error: " + errorCodeRemark;
                                //_out.error("Error is: " + errorCodeRemark);
                            }

                            foreach (var responseItem in apiData.mainOrderIdList)
                            {
                                var orderError = new OrderErrorResponse
                                {
                                    mainOrderId = responseItem,
                                    subOrderId = "",
                                    remark = orderStatus
                                };

                                if (orderError.remark == SUCCESS)
                                {
                                    _out.info("Order No: " + responseItem + "  created Successfully");
                                }
                                else
                                {
                                    _out.info("Error for order no: " + responseItem + " is " + orderError.remark);
                                }
                                orderErrorResponse.Add(orderError);

                            }
                            updateGroupSalesOrderItemInformation(apiData.mainOrderIdList, orderErrorResponse, orderStatus, accessToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        _out.error("Error while process order:" + ex.Message);
                    }
                }
            }
            else
            {
                _out.info("There is no order to process. Come back again after " + configSettingData.ServiceInterval + " minutes.");
            }


        }

        public void SendMail(string orderNo, string message, string accessToken)
        {
            try
            {
                var configData = (SettingConfnfiguration)configSettingData;

                if (message == string.Empty || message == null)
                {
                    StringBuilder mailMessage = new StringBuilder();
                    mailMessage.Append("Sales Order Posted successfully in Ustyylit system.");
                    mailMessage.AppendLine();
                    mailMessage.AppendLine();
                    mailMessage.Append("Order Number: " + orderNo + ", MsgId: " + accessToken);
                    message = mailMessage.ToString();
                }
                MailMessage msg = new MailMessage();
                msg.Subject = "API Sales Order Status for Order Number:" + orderNo + ". MsgId:" + accessToken;
                msg.Body = message;
                msg.IsBodyHtml = false;
                msg.From = new MailAddress(configData.FromEmail);
                msg.To.Add(configData.ToEmail);

                SmtpClient smtp = new SmtpClient();
                smtp.Host = Convert.ToString(configData.SmtpServer);
                smtp.EnableSsl = Convert.ToBoolean(configData.EnableSslMail);

                smtp.UseDefaultCredentials = false;
                NetworkCredential credentials = new NetworkCredential();
                credentials.UserName = configData.MailUsername;
                credentials.Password = configData.MailPassword;
                smtp.Credentials = credentials;

                smtp.Port = Convert.ToInt32(configData.SmtpPort);
                smtp.Send(msg);
                _out.info("Order Status mail sent for order:" + orderNo);
            }
            catch (Exception ex)
            {
                _out.info("Error1 sending mail for order:" + orderNo);
                _out.info("Error1 sending mail for order:" + ex.Message);
            }
        }


        /// <summary>
        /// <p>Demonstrates how to use the request level login on each operation with attached passport object.</p>
        /// </summary>
        /// <remarks>The following field values used for the login are obtained 
        /// from the config file or the user is prompted:
        /// <list type="bullet">
        /// <item>
        /// <description>email</description>
        /// </item>
        /// <item>
        /// <description>password</description>
        /// </item>
        /// <item>
        /// <description>role</description>
        /// </item>
        /// <item>
        /// <description>account</description>
        /// </item>
        /// </list>
        /// </remarks>
        private void prepareLoginPassport()
        {
            if (_service.passport == null)
            {
                _service.applicationInfo = createApplicationId();

                // Populate Passport object with all login information
                Passport passport = new Passport();
                RecordRef role = new RecordRef();

                var configData = (SettingConfnfiguration)configSettingData;

                passport.email = configData.Username;
                passport.password = configData.Password;
                passport.account = configData.Account;

                role.internalId = configData.RoleId;
                passport.role = role;

                _service.passport = passport;
            }
        }

        /// <summary>************************************************************************
        /// Search for SalesOrder based on status of either pendingApproval		
        /// </summary>
        public virtual void searchSalesOrderByStatus()
        {
            bool needValidInput = true;
            while (needValidInput)
            {
                searchSOByStatusAllValues(PENDING_APPROVAL_STRING);
                needValidInput = false;
                break;
            }
        }


        public virtual void searchSalesOrderByOrderNumber(SalesOrder salesOrder)
        {
            bool needValidInput = true;
            while (needValidInput)
            {
                searchSOByTranId(salesOrder);
                needValidInput = false;
                break;
            }
        }
        /// <summary> Helper method that searches for SalesOrder records with status of the
        /// given String parameter value.
        /// 
        /// </summary>		
        private void searchSOByStatusAllValues(System.String parmStatus)
        {
            _out.info("Order push will start now.");
            TransactionSearch xactionSearch = new TransactionSearch();

            SearchEnumMultiSelectField soField = new SearchEnumMultiSelectField();
            soField.@operator = SearchEnumMultiSelectFieldOperator.anyOf;
            soField.operatorSpecified = true;
            System.String[] searchValueStringArray = new System.String[1];
            searchValueStringArray[0] = TRANSACTION_TYPE;

            soField.searchValue = searchValueStringArray;

            SearchEnumMultiSelectField statusField = new SearchEnumMultiSelectField();
            statusField.@operator = SearchEnumMultiSelectFieldOperator.anyOf;
            statusField.operatorSpecified = true;
            System.String[] searchStatusStringArray = new System.String[1];
            searchStatusStringArray[0] = parmStatus;
            statusField.searchValue = searchStatusStringArray;

            TransactionSearchBasic xactionBasic = new TransactionSearchBasic();
            xactionBasic.type = soField;
            xactionBasic.status = statusField;

            xactionSearch.basic = xactionBasic;

            SearchResult res = _service.search(xactionSearch);

            if (res.status.isSuccess)
            {
                Record[] recordList;
                recordList = res.recordList;

                StreamReader jsonDataMapping = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "MappingData.json", true);
                StreamReader errorData = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "UstyylitErrorCodes.json", true);

                var jsonData = new JsonMappingData
                {
                    jsonMapping = jsonDataMapping.ReadToEnd(),
                    jsonErrors = errorData.ReadToEnd()
                };
                //_out.info("Processing Orders Length" + recordList.Length);
                for (int j = 0; j < recordList.Length; j++)
                {
                    if (recordList[j] is SalesOrder)
                    {
                        SalesOrder salesOrder = (SalesOrder)(recordList[j]);
                        ProcessOrder(salesOrder, jsonData);
                    }
                }
                //_out.info("Pushing data to Ustyylit");
                PushDataToUstyylit(jsonData);
            }
            else
            {
                _out.error(getStatusDetails(res.status));
            }
        }


        /// <summary>
        /// <p>This function builds the Pereferences and SearchPreferences in the SOAP header. </p>
        /// </summary>
        private void setPreferences()
        {
            // Set up request level preferences as a SOAP header
            _prefs = new Preferences();
            _service.preferences = _prefs;
            _searchPreferences = new SearchPreferences();
            _service.searchPreferences = _searchPreferences;

            // Preference to ask NS to treat all warnings as errors
            _prefs.warningAsErrorSpecified = true;
            _prefs.warningAsError = false;
            _searchPreferences.pageSize = _pageSize;
            _searchPreferences.pageSizeSpecified = false;
            // Setting this bodyFieldsOnly to true for faster search times on Opportunities
            _searchPreferences.bodyFieldsOnly = false;
            prepareLoginPassport();
        }

        /// <summary> 
        /// Processes the status object and prints the status details		
        /// </summary>	
        private System.String getStatusDetails(Status status)
        {
            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            for (int i = 0; i < status.statusDetail.Length; i++)
            {
                sb.Append("[Code=" + status.statusDetail[i].code + "] " + status.statusDetail[i].message + "\n");
            }
            return sb.ToString();
        }

        private string computeNonce()
        {
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            byte[] data = new byte[20];
            rng.GetBytes(data);
            int value = Math.Abs(BitConverter.ToInt32(data, 0));
            return value.ToString();
        }

        private long computeTimestamp()
        {
            return ((long)(DateTime.UtcNow.Subtract(new DateTime(1970, 1, 1))).TotalSeconds);
        }

        private TokenPassportSignature computeSignature(string compId, string consumerKey, string consumerSecret,
                                        string tokenId, string tokenSecret, string nonce, long timestamp)
        {
            string baseString = compId + "&" + consumerKey + "&" + tokenId + "&" + nonce + "&" + timestamp;
            string key = consumerSecret + "&" + tokenSecret;
            string signature = "";
            var encoding = new System.Text.ASCIIEncoding();
            byte[] keyBytes = encoding.GetBytes(key);
            byte[] baseStringBytes = encoding.GetBytes(baseString);
            using (var hmacSha1 = new HMACSHA1(keyBytes))
            {
                byte[] hashBaseString = hmacSha1.ComputeHash(baseStringBytes);
                signature = Convert.ToBase64String(hashBaseString);
            }
            TokenPassportSignature sign = new TokenPassportSignature();
            sign.algorithm = "HMAC-SHA1";
            sign.Value = signature;
            return sign;
        }

        private ApplicationInfo createApplicationId()
        {
            ApplicationInfo applicationInfo = new ApplicationInfo();
            applicationInfo.applicationId = configSettingData.AppId;
            return applicationInfo;
        }
    }

    class OverrideCertificatePolicy : ICertificatePolicy
    {
        public bool CheckValidationResult(ServicePoint srvPoint, System.Security.Cryptography.X509Certificates.X509Certificate certificate, WebRequest request, int certificateProblem)
        {
            return true;
        }
    }

    /// <summary>    
    /// Since 12.2 endpoint accounts are located in multiple datacenters with different domain names.
    /// In order to use the correct one, wrap the Service and get the correct domain first.
    ///
    /// See getDataCenterUrls WSDL method documentation in the Help Center.	 
    /// </summary>
    class DataCenterAwareNetSuiteService : NetSuiteService
    {
        public DataCenterAwareNetSuiteService(string account)
            : base()
        {
            System.Uri originalUri = new System.Uri(this.Url);
            DataCenterUrls urls = getDataCenterUrls(account).dataCenterUrls;
            Uri dataCenterUri = new Uri(urls.webservicesDomain + originalUri.PathAndQuery);
            this.Url = dataCenterUri.ToString();
        }
    }
}
