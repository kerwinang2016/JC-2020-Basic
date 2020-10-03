using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Xml;

namespace OscarHunt
{
	/// <summary>
	/// Summary description for Logger.
	/// </summary>
	public class Logger
	{
		static private String LEVEL_INFO = "info";
		static private String LEVEL_DEBUG = "debug";

		private String _level;

		/// <summary>
		/// Constructor.
		/// </summary>
		public Logger( String level )
		{
			//
			// TODO: Add constructor logic here
			//

			_level = level;

		}

        
		/// <summary>
		/// Private method that writes a string to the console
		/// </summary>
		private void log( String msg )
		{

            var currentDate = System.DateTime.Now.ToString("yyyyMMdd");
           
            StreamWriter sw = null;

            if(!Directory.Exists(AppDomain.CurrentDomain.BaseDirectory + "OscarHuntLogs"))
            {
                Directory.CreateDirectory(AppDomain.CurrentDomain.BaseDirectory + "OscarHuntLogs");
            }

            var fileName = "OscarHuntLogs/logfile_" + currentDate + ".txt";
            sw = new StreamWriter(AppDomain.CurrentDomain.BaseDirectory + fileName, true);
            sw.WriteLine(DateTime.Now.ToString() + ": " + msg);
            sw.Flush();
            sw.Close();
        }


		/// <summary>
		/// Logs if level is LEVEL_INFO
		/// </summary>
		public void info( String msg )
		{
			if ( _level == LEVEL_INFO || _level == LEVEL_DEBUG )
			{
				log( msg );
			}
		}
		/*
		public void info( String msg, bool newLine )
		{
			if ( _level == LEVEL_INFO || _level == LEVEL_DEBUG )
			{
				if ( newLine )
					log( "\n--- INFO  " + msg );
				else
					log( "--- INFO  " + msg );
			}
		}
		*/
    
        
		/// <summary>
		/// Logs if level is LEVEL_DEBUG
		/// </summary>
		public void debug( String msg )
		{
			if ( _level == LEVEL_DEBUG )
			{
				log( "--- DEBUG: " + msg );
				//log( "*** WARNING: " + msg );
				//log( "***   ERROR: " + msg );
			}
		}

        
		/// <summary>
		/// Logs SOAP faults
		/// </summary>
		public void fault( String fault, String code, String msg )
		{
			log( "\n***   SOAP FAULT: fault type=" + fault + " with code=" + code + ". " + msg );
		}


		/// <summary>
		/// Logs SOAP faults
		/// </summary>
		public void fault( String msg )
		{
			log( "[SOAP Fault]: " + msg );
		}


		/// <summary>
		/// Logs warnings
		/// </summary>
		public void warning( String msg )
		{
			log( "*** WARNING: " + msg );
		}

        
		/// <summary>
		/// Logs an error message
		/// </summary>
		public void error( String msg )
		{
			log( "[Error]: " + msg );
		}

		/// <summary>
		/// Logs an error message with a new line
		/// </summary>
		public void error( String msg, bool isNewLine )
		{
			if (isNewLine)
				log( "\n[Error]: " + msg );
			else
				log( "[Error]: " + msg );
		}


		public void errorForRecord( String msg )
		{
			log( "    [Error]: " + msg );
		}

		/// <summary>
		/// Writes to the console
		/// </summary>
		public void write( String text )
		{
			System.Console.Write( text );
		}

		/// <summary>
		/// Writes line to the console
		/// </summary>
		public void writeLn( String text )
		{
			System.Console.WriteLine( text );
		}

		/// <summary>
		/// Reads line from the console
		/// </summary>
		public String readLn()
		{
			return System.Console.ReadLine().Trim();
		}

        /// <summary>
        /// Reads line with a password from the console
        /// </summary>
        public String readPassword()
        {
            String password = "";
            Boolean stop = false;
            do
            {
                ConsoleKeyInfo c = System.Console.ReadKey(true);
                if (c.Key == ConsoleKey.Enter)
                {
                    stop = true;
                }
                else if (c.Key == ConsoleKey.Backspace)
                {
                    if (password.Length > 0)
                    {
                        password = password.Remove(password.Length - 1);
                        Console.Write("\b \b");
                    }
                }
                else
                {
                    password += c.KeyChar;
                    Console.Write("*");
                }
            } while (!stop);

            Console.Write("\n");            
            return password.Trim();
        }

       


        public SettingConfnfiguration ReadConfigFile()
        {
            SettingConfnfiguration configFile = new SettingConfnfiguration();
            var fileName = "Settings.xml";

            XmlDocument xmlDoc = new XmlDocument();
            xmlDoc.Load(AppDomain.CurrentDomain.BaseDirectory + fileName);

            configFile.Username = GeneralUtilities.DecryptString(GetElementValue(xmlDoc, "Username"));
            configFile.Password = GeneralUtilities.DecryptString(GetElementValue(xmlDoc, "Password"));
            configFile.Account = GeneralUtilities.DecryptString(GetElementValue(xmlDoc, "Account"));
            configFile.RoleId = GetElementValue(xmlDoc, "RoleId");

            configFile.ServiceInterval = GetElementValue(xmlDoc, "ServiceInterval");


            configFile.SendAPISalesOrderStatusMail = GetElementValue(xmlDoc, "SendAPISalesOrderStatusMail");

            configFile.FromEmail = GetElementValue(xmlDoc, "FromEmail");
            configFile.ToEmail = GetElementValue(xmlDoc, "ToEmail");
            configFile.MailUsername = GetElementValue(xmlDoc, "MailUsername");
            configFile.MailPassword = GeneralUtilities.DecryptString(GetElementValue(xmlDoc, "MailPassword"));
            configFile.SmtpServer = GetElementValue(xmlDoc, "SmtpServer");
            configFile.SmtpPort = GetElementValue(xmlDoc, "SmtpPort");
            configFile.UseDefaultCredentialsMail = GetElementValue(xmlDoc, "UseDefaultCredentialsMail");
            configFile.EnableSslMail = GetElementValue(xmlDoc, "EnableSslMail");

            configFile.AppId = GetElementValue(xmlDoc, "AppId");
            configFile.AppSecret = GetElementValue(xmlDoc, "AppSecret");
            configFile.Environment = GetElementValue(xmlDoc, "Environment");
            configFile.BrandNameTest = GetElementValue(xmlDoc, "BrandNameTest");
            configFile.ShopNameTest = GetElementValue(xmlDoc, "ShopNameTest");

            configFile.GenerateJson = GetElementValue(xmlDoc, "GenerateJson");
            configFile.JsonOrderNo = GetElementValue(xmlDoc, "JsonOrderNo");
            configFile.PushData = GetElementValue(xmlDoc, "PushData");



            return configFile;

            //xmlDoc.Save(AppDomain.CurrentDomain.BaseDirectory + fileName);
        }

        public string GetElementValue(XmlDocument xmlDoc, string attrName)
        {
            string elementData = string.Empty;
            XmlElement Username = (XmlElement)xmlDoc.SelectSingleNode("//" + attrName);
            if (Username != null)
            {
                elementData = Username.Attributes[0].Value;
                //formData.SetAttribute("value", "+mY9FDLO7WOhokrcugpSRrBXZ2f3IckIoi2reE/yfJKbMRuZ3OSJVSYVXfVm60RBHello"); // Set to new value.
            }
            return elementData;
        }


    }
}
