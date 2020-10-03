using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OscarHunt
{
    public class Fabric
    {
        public string sku { get; set; }
        public string mode { get; set; }
        public string Vendor { get; set; }
        public string Description { get; set; }
        public string Composition { get; set; }
        public string Length { get; set; }
    }

    public class FabricDetails
    {
        public string fabricCode { get; set; }
        public string itemName { get; set; }
    }

    public class Lining
    {
        public string sku { get; set; }
        public string mode { get; set; }
        public string Vendor { get; set; }
        public string Description { get; set; }
        public string Composition { get; set; }
        public string Length { get; set; }
    }

    public class OrderDetail
    {
        public string order { get; set; }
        public string orderdetailid { get; set; }
        public string combination { get; set; }
        public string mode { get; set; }
        public List<Fabric> fabric { get; set; }
        public List<Lining> lining { get; set; }
        public string cl_flag { get; set; }
        public string styleno { get; set; }
        public string ptype { get; set; }
        public string @class { get; set; }
        public string made { get; set; }
        public string tryon { get; set; }
        public string fit { get; set; }
        public string remark { get; set; }
        public string vendor { get; set; }
        public object previous_order { get; set; }
        public object previous_vendor { get; set; }
    }

    public class Measurement
    {
        public string orderdetailid { get; set; }
        public string styleno { get; set; }
        public string @class { get; set; }
        public string item_code { get; set; }
        public string tryon_adjustment { get; set; }
        public string value { get; set; }
    }

    public class Option
    {
        public string orderdetailid { get; set; }
        public string styleno { get; set; }
        public string @class { get; set; }
        public string option_type { get; set; }
        public string option_code { get; set; }
    }

    public class Observation
    {
        public string orderdetailid { get; set; }
        public string styleno { get; set; }
        public string @class { get; set; }
        public string item_code { get; set; }
        public string value { get; set; }
    }

    public class Order
    {
        public string brand { get; set; }
        public string mainorder { get; set; }
        public string shop { get; set; }
        public string customer { get; set; }
        public string cdate { get; set; }
        public string deliver_date { get; set; }
        public string latest_deliver_date { get; set; }
        public string import_time { get; set; }
        public string remark { get; set; }
        public string front { get; set; }
        public string back { get; set; }
        public string sideRight { get; set; }
        public string sideLeft { get; set; }
        public string receiver { get; set; }
        public string country { get; set; }
        public string province { get; set; }
        public string address { get; set; }
        public string postcode { get; set; }
        public string contactnumber { get; set; }        
        public List<OrderDetail> OrderDetails { get; set; }
        public List<Measurement> Measurements { get; set; }
        public List<Option> Options { get; set; }
        public List<Observation> Observations { get; set; }
    }

    public class Orders
    {
        public List<Order> Order { get; set; }
    }

    public class GroupOrder
    {
        public string mainOrderId { get; set; }
        public string brand { get; set; }
        public Order order { get; set; }
    }

    public class GroupOrders
    {
        public List<string> mainOrderIdList { get; set; }
        public string brand { get; set; }
        public List<Order> orderList { get; set; }
    }

    public class JsonMappingData
    {
        public string jsonMapping { get; set; }
        public string jsonErrors { get; set; }
    }

    public class CreateOrder
    {
        public string Action { get; set; }
        public Orders orders { get; set; }
    }

    public class FitProfileSummary
    {
        public string name { get; set; }
        public string value { get; set; }
        public string type { get; set; }
    }

    public class KeyValuePairJson
    {
        public string name { get; set; }
        public string value { get; set; }
    }

    public class UstyylitErrorCodes
    {
        public string brand { get; set; }
        public string pt_code { get; set; }
        public string   error_code { get; set; }
        public string remark { get; set; }
    }

    public class UstyylitResultResponse
    {
        public string result { get; set; }
        public string msgid { get; set; }
    }

    public class UstyylitOrderErrorResponse
    {
        public string orderno { get; set; }
        public string error_code { get; set; }
    }

    public class UstyylitResponse
    {
        public UstyylitResultResponse resultResponse { get; set; }
        public List<UstyylitOrderErrorResponse> OrderErrorResponse { get; set; }
    }

    public class OrderErrorResponse
    {
        public string mainOrderId { get; set; }
        public string subOrderId { get; set; }
        public string remark { get; set; }
    }

    public class UstyylitResponseTests
    {
        public string result { get; set; }
        public string msgid { get; set; }
        public string orderno { get; set; }
        public string error_code { get; set; }
    }

    public class SettingConfnfiguration
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Account { get; set; }
        public string RoleId { get; set; }
        public string ServiceInterval { get; set; }
        public string SendAPISalesOrderStatusMail { get; set; }
        public string FromEmail { get; set; }
        public string ToEmail { get; set; }
        public string MailUsername { get; set; }
        public string MailPassword { get; set; }
        public string SmtpServer { get; set; }
        public string SmtpPort { get; set; }
        public string UseDefaultCredentialsMail { get; set; }
        public string EnableSslMail { get; set; }
        public string AppId { get; set; }
        public string AppSecret { get; set; }
        public string Environment { get; set; }
        public string BrandNameTest { get; set; }
        public string ShopNameTest { get; set; }
        public string GenerateJson { get; set; }
        public string JsonOrderNo { get; set; }
        public string PushData { get; set; }
    }
}
