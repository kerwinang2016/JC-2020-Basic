using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;


using System.Net;
using System.Xml;
using System.Security.Cryptography;
using OscarHuntService.com.netsuite.webservices;
using System.IO;
//using System.Web.Script.Serialization;
using Newtonsoft.Json;
using OscarHuntService.com.ustyylit.tuservice;
using System.Configuration;
using Newtonsoft.Json.Linq;

namespace OscarHuntService
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        static void Main()
        {
            ServiceBase[] ServicesToRun;
            ServicesToRun = new ServiceBase[]
            {
                new OscarHuntAPIService()
            };
            ServiceBase.Run(ServicesToRun);
        }

        //        static void Main()
        //        {

        //#if (false)
        //                    ServiceBase[] ServicesToRun;
        //                    ServicesToRun = new ServiceBase[]
        //                    {
        //                                    new OscarHuntAPIService()
        //                    };
        //                    ServiceBase.Run(ServicesToRun);
        //#else
        //            OscarHuntAPIService oscarHuntService = new OscarHuntAPIService();
        //            oscarHuntService.NetsuiteEntryPoint();
        //#endif
        //        }
    }
}
