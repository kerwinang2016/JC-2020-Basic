Hello,
	This is a quick demo on how to use fuctionalities in the Jerome System
	
	First you need to use the credentials given to pass using our NLAuth header

	This is the credentials that you will use
	function credentials(){
		this.email = "development@jeromeclothiers.com";
		this.account = "3857857";
		this.role = "1028";
		this.password = "Jerome123!";
	}

	Then you will use these credentials in the header
	var headers = {"User-Agent-x": "SuiteScript-Call",
               "Authorization": "NLAuth nlauth_account=" + cred.account + ", nlauth_email=" + cred.email + 
				", nlauth_signature= " + cred.password + ", nlauth_role=" + cred.role,
				"Content-Type": "application/json"};
				
	The rest url is for GET POST AND PUT CALLS
	var url = "https://3857857.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=380&deploy=2";
	
	Please refer to the documentation or these files
	docker-compose.yaml
	openapi-spec
	openapi-spec.yaml
	You can view the openapi-spec.yaml in this site https://editor.swagger.io/
	just open the file using a notepad and copy and paste the text
	
please send an email to development@jeromeclothiers.com for any questions

//Sample code	
function credentials(){
	this.email = "development@jeromeclothiers.com";
	this.account = "3857857";
	this.role = "1028";
	this.password = "Jerome123!";
}
	
function replacer(key, value){
    if (typeof value == "number" && !isFinite(value)){
        return String(value);
    }
    return value;
}
 
//Setting up URL              
var url = "https://3857857.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=380&deploy=2";

//Calling credential function
var cred = new credentials();
                
//Setting up Headers 
var headers = {"User-Agent-x": "SuiteScript-Call",
               "Authorization": "NLAuth nlauth_account=" + cred.account + ", nlauth_email=" + cred.email + 
                                ", nlauth_signature= " + cred.password + ", nlauth_role=" + cred.role,
               "Content-Type": "application/json"};
                
//Setting up Datainput
var jsonobj = {
	type: 'ORDER',
	data:
	[{
      'tailor': 5,
	  'items':
	  [{  'fabric': 'TSHL059',
		  'productType': 'Jacket',
		  'client': 'Test User',
		  'designOptionsJacket': '[{"name":"jm-ms-j","value":"Handmade"},{"name":"T010201","value":"T01020102"},{"name":"T010202","value":"T01020201"},{"name":"T010256","value":"T01025601"},{"name":"T010208","value":"T01020803"},{"name":"T010209","value":"T01020902"},{"name":"T010215","value":"T01021501"},{"name":"T010205","value":"T01020501"},{"name":"T010263","value":"T01026301"},{"name":"T010254","value":"T01025401"},{"name":"T010255","value":"T01025501"},{"name":"T010253","value":"T01025301"},{"name":"T010252","value":"T01025201"},{"name":"T010206","value":"Fabric"},{"name":"T010203","value":"T01020316"},{"name":"T010204","value":"T01020401"},{"name":"T010251","value":"T01025108"},{"name":"T010231","value":"Tone on tone"},{"name":"T010211","value":"T01021101"},{"name":"T010212","value":"T01021202"},{"name":"T010210","value":"T01021001"},{"name":"T010213","value":"T01021301"},{"name":"T010214","value":"T01021401"},{"name":"T010267","value":"T01026701"},{"name":"T010207","value":"T140"},{"name":"li-b-j","value":"TR669"},{"name":"li-vnd","value":"Please select"},{"name":"li-code","value":""},{"name":"li-qty","value":""},{"name":"T010216","value":"T01021602"},{"name":"T010217","value":"T01021709"},{"name":"T010247","value":"T01024704"},{"name":"T010219","value":"T01021901"},{"name":"T010228","value":"T01022807"},{"name":"T010229","value":"Tone on tone"},{"name":"T010264","value":"T01026401"},{"name":"T010265","value":"No"},{"name":"T010224","value":"T01022401"},{"name":"T010268","value":"T01026801"},{"name":"T010269","value":"T01026923"},{"name":"T010227","value":"Same as body lining"},{"name":"T010260","value":"T01026001"},{"name":"T010222","value":"No"},{"name":"T010223","value":"T01022301"},{"name":"T010270","value":"T01027001"},{"name":"T010271","value":"T01027123"},{"name":"T010234","value":"Tone on tone"},{"name":"T010225","value":"T01022501"},{"name":"T010262","value":"T01026201"},{"name":"T010230","value":"Tone on tone"},{"name":"T010232","value":"Tone on tone"},{"name":"T010233","value":"Tone on tone"},{"name":"T010221","value":"Tone on tone"},{"name":"T010218","value":"No"},{"name":"T010220","value":"No"},{"name":"T010266","value":"T01026601"},{"name":"T010257","value":"T01025702"},{"name":"T010258","value":""},{"name":"T010259","value":"NA"},{"name":"T010243","value":"T01024302"},{"name":"T010235","value":"NA"},{"name":"T010236","value":"NA"},{"name":"T010238","value":""},{"name":"T010244","value":"T01024401"},{"name":"T010245","value":"T01024502"},{"name":"T010237","value":"M15"},{"name":"T010239","value":"S.P."},{"name":"T010240","value":"DAVOR"},{"name":"T010250","value":""},{"name":"T010261","value":""},{"name":"T010246","value":"T01024601"},{"name":"T010249","value":"T01024901"}]' ,
		  'designOptionsOverCoat': '',
		  'designOptionsShirt': '',
		  'designOptionsShortSleevesShirt': '',
		  'designOptionsTrenchCoat': '',
		  'designOptionsTrouser': '',
		  'designOptionsWaistCoat': '',
		  'designOptionsLadiesJacket': '',
		  'designOptionsLadiesPants': '',
		  'designOptionsLadiesSkirt': '',
		  'designOptionsMessage': '',
		  'fitProfileJacket': '',
		  'fitProfileOverCoat': '',
		  'fitProfileShirt': '',
		  'fitProfileShortSleevesShirt': '',
		  'fitProfileTrenchCoat': '',
		  'fitProfileTrouser': '',
		  'fitProfileWaistCoat': '',
		  'fitProfileLadiesJacket': '',
		  'fitProfileLadiesPants': '',
		  'fitProfileLadiesSkirt': '',
		  'fitProfileMessage': '',
		  'fabricQuantity': '5',
		  'dateNeeded': '6/9/2020'	
	  }]
	}]
}    
//Stringifying JSON
var myJSONText = JSON.stringify(jsonobj, replacer);
//var myJSONText = null;
//POST REQUEST to the URL
jQuery.ajax({url:url,header:header,data:myJSONText})
