namespace OscarHuntService
{
    partial class ProjectInstaller
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Component Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.OscarHuntServiceProcessInstaller = new System.ServiceProcess.ServiceProcessInstaller();
            this.OscarHuntServiceInstaller = new System.ServiceProcess.ServiceInstaller();
            // 
            // OscarHuntServiceProcessInstaller
            // 
            this.OscarHuntServiceProcessInstaller.Account = System.ServiceProcess.ServiceAccount.LocalService;
            this.OscarHuntServiceProcessInstaller.Password = null;
            this.OscarHuntServiceProcessInstaller.Username = null;
            // 
            // OscarHuntServiceInstaller
            // 
            this.OscarHuntServiceInstaller.ServiceName = "OscarHunt Service";
            // 
            // ProjectInstaller
            // 
            this.Installers.AddRange(new System.Configuration.Install.Installer[] {
            this.OscarHuntServiceProcessInstaller,
            this.OscarHuntServiceInstaller});

        }

        #endregion

        private System.ServiceProcess.ServiceProcessInstaller OscarHuntServiceProcessInstaller;
        private System.ServiceProcess.ServiceInstaller OscarHuntServiceInstaller;
    }
}