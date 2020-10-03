using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Serialization;

namespace OscarHunt
{
    public static class GeneralUtilities
    {
        /// <summary>
        /// Replace String
        /// </summary>
        /// <param name="xmldata">xml data</param>
        /// <param name="patterns">matching patterns array</param>
        /// <param name="replacestring">replacement string</param>
        /// <returns>string</returns>
        public static string ReplaceString(this string xmldata, string[] patterns, string replacestring = null)
        {
            return patterns.Aggregate(xmldata, (current, pattern) => Regex.Replace(current, pattern, replacestring ?? string.Empty));
        }

        /// <summary>
        /// Get the unique id
        /// </summary>
        /// <returns></returns>
        public static string GenerateToken()
        {
            return Guid.NewGuid().ToString();
        }

        /// <summary>
        /// De-serialize XML
        /// </summary>
        /// <typeparam name="T">T as type</typeparam>
        /// <param name="pXmlizedString">XML string</param>
        /// <returns>T type</returns>
        public static T DeserializeXml<T>(string pXmlizedString) where T : class
        {
            MemoryStream memory = null;
            try
            {
                var serializer = new XmlSerializer(typeof(T));
                memory = new MemoryStream(StringToUtf8ByteArray(pXmlizedString));
                return (T)serializer.Deserialize(memory);
            }
            finally
            {
                if (memory != null)
                {
                    memory.Close();
                    memory.Dispose();
                }
            }
        }

        /// <summary>
        /// String To Utf8 Byte Array conversion 
        /// </summary>
        /// <param name="pXmlString">XML string</param>
        /// <returns>Byte array</returns>
        private static byte[] StringToUtf8ByteArray(string pXmlString)
        {
            var encoding = new UTF8Encoding();
            var byteArray = encoding.GetBytes(pXmlString);
            return byteArray;
        }

        /// <summary>
        /// Get XML string From Object
        /// </summary>
        /// <param name="response">Object</param>
        /// <returns>XML string</returns>
        public static string GetXmlFromObject(object response)
        {
            var serializer = new XmlSerializer(response.GetType());
            using (var writer = new StringWriter())
            {
                serializer.Serialize(writer, response);
                return writer.ToString();
            }
        }

        /// <summary>
        /// Get Data from XML file.
        /// </summary>
        /// <typeparam name="T">Output class name</typeparam>
        /// <param name="fileName">XML file name</param>
        /// <param name="type">ProviderConfigurationType.Ex: TEST or string.empty</param>
        /// <param name="useProviderConfigurationType">use ProviderConfiguration Type [boolean] </param>
        /// <returns>Output object in specified cast</returns>
        public static T GetDataFromXml<T>(string fileName, Type type, bool useProviderConfigurationType = false) where T : class
        {
            var providerConfigurationtype = useProviderConfigurationType ? ConfigurationManager.AppSettings["ProviderConfigurationType"] : string.Empty;
            using (var fileStream = ReadResource(fileName + providerConfigurationtype + ".xml", type))
            {
                var serializer = new XmlSerializer(typeof(T));
                var response = (T)serializer.Deserialize(fileStream);
                fileStream.Dispose();
                return response;
            }
        }

        /// <summary>
        /// Read the resource file.
        /// </summary>
        /// <param name="fileName">File Name</param>
        /// <param name="type">Assembly Type</param>
        /// <returns>Stream of data</returns>
        private static Stream ReadResource(string fileName, Type type)
        {
            var assembly = Assembly.GetAssembly(type);
            var resourceName = $"{assembly.GetName().Name}.{fileName}";
            var fileStream = assembly.GetManifestResourceNames()
                .Where(c => c.Equals(resourceName, StringComparison.InvariantCultureIgnoreCase))
                .Select(d => assembly.GetManifestResourceStream(d)).FirstOrDefault();
            if (fileStream == null)
                throw new ApplicationException($"The resource could not be found [{fileName}]");
            return fileStream;
        }


        public static string AESEncrypt(string text, string appsecret, string access_token)
        {
            RijndaelManaged rijndaelCipher = new RijndaelManaged();
            rijndaelCipher.Mode = CipherMode.CBC;
            rijndaelCipher.Padding = PaddingMode.PKCS7;
            rijndaelCipher.KeySize = 128;
            rijndaelCipher.BlockSize = 128;
            byte[] pwdBytes = System.Text.Encoding.UTF8.GetBytes(appsecret);
            byte[] keyBytes = new byte[16];
            int len = pwdBytes.Length;
            if (len > keyBytes.Length)
            {
                len = keyBytes.Length;
            }
            System.Array.Copy(pwdBytes, keyBytes, len);
            rijndaelCipher.Key = keyBytes;
            byte[] ivBytes = System.Text.Encoding.UTF8.GetBytes(access_token);
            rijndaelCipher.IV = ivBytes;
            ICryptoTransform transform = rijndaelCipher.CreateEncryptor();
            byte[] plainText = Encoding.UTF8.GetBytes(text);
            byte[] cipherBytes = transform.TransformFinalBlock(plainText, 0, plainText.Length);
            return Convert.ToBase64String(cipherBytes);
        }

        public static string EncryptString(string clearText)
        {
            string EncryptionKey = "OSV2SHUNT94482";
            byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    clearText = Convert.ToBase64String(ms.ToArray());
                }
            }
            return clearText;
        }

        public static string DecryptString(string cipherText)
        {
            string EncryptionKey = "OSV2SHUNT94482";
            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }
                    cipherText = Encoding.Unicode.GetString(ms.ToArray());
                }
            }
            return cipherText;
        }
    }
}
