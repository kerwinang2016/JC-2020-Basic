using OscarHunt;
using System;
using System.Configuration;
using System.ServiceProcess;

namespace OscarHuntService
{
    public partial class OscarHuntAPIService : ServiceBase
    {

        System.Timers.Timer createOrderTimer;
        Logger log = new Logger("info");
        static bool serviceInUse = false;
        public OscarHuntAPIService()
        {
            this.ServiceName = "Oscar Hunt Service";
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            //System.Diagnostics.Debugger.Launch();

            log.info("Oscar Hunt Service Started");

            var configData = log.ReadConfigFile();

            var serviceInterval = Convert.ToInt32(configData.ServiceInterval);
            createOrderTimer = new System.Timers.Timer();
            createOrderTimer.Elapsed += new System.Timers.ElapsedEventHandler(NetsuiteEntryPoint);
            createOrderTimer.Interval = 60000 * serviceInterval; 
            createOrderTimer.Enabled = true;
            createOrderTimer.AutoReset = true;
            createOrderTimer.Start();
        }

        protected override void OnStop()
        {   
            createOrderTimer.Enabled = false;
            log.info("Service stopped");
        }

        protected void NetsuiteEntryPoint(object sender, System.Timers.ElapsedEventArgs args)
        {
            if (!serviceInUse)
            {
                serviceInUse = true;
                NetsuiteEntryPoint();
                serviceInUse = false;
            }
        }

        public void NetsuiteEntryPoint()
        {
            log.info("NetsuiteEntryPoint initiated");
            NSClientERP netsuite = new NSClientERP();
            netsuite.EntryPoint();
        }        
    }

}
