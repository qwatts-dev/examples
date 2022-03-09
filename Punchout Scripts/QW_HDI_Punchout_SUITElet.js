/**
 * @NApiVersion 2.x
 * @NScriptType suitelet
*/
define(['N/https','N/url','N/error','N/xml','N/record'], 
	function(https, urlMod, error, xml, record) {
	
		/*
		-----------
		Global Functions
		-----------
        */
        //Function: Parameter validation
        function doValidation(args, argNames, methodName) 
            {
			for (var i = 0; i < args.length; i++)
				if (!args[i] && args[i] !== 0)
					throw error.create({
						name: 'MISSING_REQ_ARG',
						message: 'Missing a required argument: [' + argNames[i] + '] for method: ' + methodName
					});
            }
        //Function: Make string 2 characters
        function twoChar( str )
            {
            var retStr;
            str = str.toString();
            if ( 1 == str.length ) {
                retStr = "0" + str;
            } else {
            retStr = str;
            }
            return retStr;
            }
        //Function: create Time Stamp for cXML Prologs
        function timestamp( dt )
            {
            var str;
            var milli;
            str = dt.getFullYear() + "-" + twoChar( 1 + dt.getMonth() ) + "-";
            str += twoChar( dt.getDate() ) + "T" + twoChar( dt.getHours() ) + ":";
            str += twoChar( dt.getMinutes() ) + ":" + twoChar( dt.getSeconds() ) + ".";
            milli = dt.getMilliseconds();
            milli = milli.toString();
            if ( 3 == milli.length ) {
                str += milli;
            } else {
                str += "0" + twoChar( milli );
            }
            str += "+0000";
            return str;
            }
        //Function: generate Random Integer
        function getRandomInt(max)
            {
            return Math.floor(Math.random() * Math.floor(max));
            }
        //Function: https.get RESTlet
        function doGetRestlet(objParams)
            {
            var url = urlMod.resolveScript({
                scriptId: 'customscript_hdi_punchout_restlet',
                deploymentId: 'customdeploy_hdi_punchout_restlet',
                returnExternalUrl: true,
                params: objParams
            });
            var headers = {
                //  headers removed for proprietary reasons
                'Authorization': 'Hello World!',
                'Content-Type': 'application/json' //return JSON object
            };
            var response = https.get({
                url: url, 
                headers: headers
            });
            return response;
            }
        //Function: New "sessionId" varaible
        function getSessionId(length) 
            {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
            }
            //Generate Session ID (used in redirect URL on Success)
            var sessionId = getSessionId(32);

        /*
        --------------------------
        Begin Entry Point Script
        --------------------------
        */
		function onRequest(options){

      //Validate "requestId" - 1=launch page, 2=login page, 3=punchout cart
			try{				
				var requestId = options.request.parameters['requestId']; //see "requestId" above
				doValidation([requestId], ['requestId'], 'GET');

			} catch (e) {
				log.error ({ 
					title: e.name,
					details: e.message
				});   
			}
        
			
			if (requestId === "1"){
				/*
				-----------
				1 - Launch Page (punchoutSetupRequest)
				-----------
				*/
				try {

            /*
            -------------------------
            Launch Page - Global Functions 
            -------------------------
            */                
            function genProlog( cXMLvers, randStr )
                {
                var dt;
                var str;
                var vers, sysID;
                var nowNum, timeStr;
                vers = "1.1.007";
                sysID = "http://xml.cXML.org/schemas/cXML/" + vers + "/cXML.dtd";
                dt = new Date();
                nowNum = dt.getTime();
                timeStr = timestamp( dt );
                str = '<?xml version="1.0" encoding="UTF-8"?>\n';
                str += '<!DOCTYPE cXML SYSTEM "' + sysID + '">\n';
                str += '<cXML payloadID="' + nowNum + ".";
                str += randStr + '@hellodirect.com'; 
                str += '" timestamp="' + timeStr + '">\n';
                return str;
                }
            function getXmlElem(elem,pos,attr)
                {
                if (attr !==undefined){
                    var result = xmlDoc.getElementsByTagName({
                        tagName: elem
                    })[pos-1].getAttributeNode({
                        name : attr
                    }).value;
                } else {
                    var result = xmlDoc.getElementsByTagName({
                        tagName: elem
                    })[pos-1].textContent;
                }
                return result;
                }
              

            /*
            --------------------------------
            Receive the punchOutSetupRequest
            --------------------------------
            */

            //Create data needed in XML prolog
                var randStr,prologStr,statusText,statusCode,cookie,url,xmlstr,xmlDoc,fromUser,toUser,email,name,fname,lname;
                
                randStr = getRandomInt(100000001);
                prologStr = genProlog( "1.0", randStr );
                cookie = "";
                url = "";
                xmlstr = "";
            
            // Read the incoming HTTP cXML request
                xmlstr = options.request.body;
                xmlDoc = xml.Parser.fromString({
                        text : xmlstr
                    });

                cookie = getXmlElem("BuyerCookie",1); 
                url = getXmlElem("URL",1); // <URL> in <BrowserFormPost>
                fromUser = getXmlElem("Identity",1);  // <Identity> in <From>
                toUser = getXmlElem("Identity",2); //<Identity> in <To>
                email = getXmlElem("Email",1);
                //for testing, replace 'qwatts@hellodirect.com' with {email} below:
                if (email === 'qwatts@hellodirect.com'){
                    // email = 'Norman.Castelino@experian.com'; //change to new email if you want to create a new contact record
                    // email = email.toLowerCase();
                    email = 'qwatts.developer@testseagate10.com'; //change to new email if you want to create a new contact record
                }

                name = getXmlElem("Name",1);
                //for testing, replace 'Quentin Watts' with {name} below:
                if (name === 'null Quentin null Watts'){
                    // name = 'Castelino, Norman Alwyn'; //changee to new email if you want to create a new contact record
                    name = 'WattsTEST10, Quentin'; //change to new email if you want to create a new contact record
                }

                function setName(name){
                    if (name.indexOf(",") > -1){                            
                        fname = name.substring(name.indexOf(",")).replace(", ","");
                        if (fname.indexOf("null") > -1){
                            fname = fname.replace("null ","");
                        }
                        // if (fname.indexOf("Mr.") > -1){
                        //     fname = fname.replace("Mr. ","");
                        // }
                        lname = name.substring(0,name.indexOf(","));
                        if (lname.indexOf("null") > -1){
                            lname = lname.replace("null ","");
                        }
                    } else if (name.indexOf("null") > -1){
                        name = name.replace("null ","");
                        fname = name.substring(0,name.indexOf(" "));
                        lname = name.substring(name.indexOf(" ")).replace(" ","").replace("null ","");
                    } else {
                        fname = name.substring(0,name.indexOf(" "));
                        lname = name.substring(name.indexOf(" ")).replace(" ","");
                    }
                    return fname+" "+lname;
                }                
                setName(name);
                


            //Create Punchout Request Record
                function createRequestObj()
                    {   
                    var toDomain = getXmlElem("Credential",2,"domain"); //<Credential> in <To>
                    var senderDomain = getXmlElem("Credential",3,"domain"); //<Credential> in <Sender> <Identity>
                    var senderUserAgent = getXmlElem("UserAgent",1); //<UserAgent> in <Sender>

                    var obj = {
                        recordtype          : 'customrecord_hdi_punchout_request',
                        browserformpost     : url,
                        toidentity          : toUser,
                        todomain            : toDomain,
                        senderdomain        : senderDomain,
                        senderidentity      : fromUser,
                        senderuseragent     : senderUserAgent,
                        senderbuyercookie   : cookie,
                        firstname           : fname,
                        lastname            : lname,
                        email               : email,
                        decodeorderresponse : "false",
                        sessionId           : sessionId
                    }
                    return obj; //return internalId of Punchout Request Record
                    }

                //create punch request record
                var reqObj = createRequestObj();
                //perform https.get RESTlet
                var response = doGetRestlet(reqObj);
                var punchReq = JSON.parse(response.body);
                log.debug({
                    title: "Punch Request ID Returned",
                    details: punchReq.punchReqId
                });


            /*
            --------------------------------
            Format the cXML PunchOutSetupReponse
            --------------------------------
            */
            var poResp;
            var startPage = 'https://customer.hellodirect.com/sca-dev-2019-1/checkout.ssp?punchreqid=' +punchReq.punchReqId+ '&amp;email=' +email+ '&amp;sessionId=' +sessionId+ '&amp;is=login&amp;login=T#login-register';
            // cookie = ""; //used to kick back 400 error for testing
                if (cookie === ""){
                    statusCode = "400";
                    statusText = "Bad Request";
                    //create cXML response
                    poResp = prologStr;
                    poResp += '<Response> \n ';
                    poResp += '<Status code="400" Text="Bad Request">Invalid Document. Unable to extract BuyerCookie.</Status> \n ';
                    poResp += '</Response> \n ';
                    poResp += '</cXML>';
                } else {
                    statusCode = "200";
                    statusText = "OK";
                    //create cXML response
                    poResp = prologStr;
                    poResp += '<Response> \n ';
                    poResp += '<Status code="200" text="OK"/> \n ';
                    poResp += '<PunchOutSetupResponse> \n ';
                    poResp += '<StartPage> \n ';
                    poResp += '<URL>' +startPage+ '</URL> \n ';
                    poResp += '</StartPage> \n ';
                    poResp += '</PunchOutSetupResponse> \n ';
                    poResp += '</Response> \n ';
                    poResp += '</cXML>';
                }

            /*
            ---------------
            Send the cXML PunchOutSetupResponse
            ---------------
            */ 
            options.response.write(poResp);
            options.response.addHeader({name: 'Content-Type', value: 'text/xml'});  
            options.response.addHeader({name: 'charset', value: 'utf-8'});


            //create punch log records
            var objDataForPunchLog = {
                recordtype      : 'customrecord_hdi_punchout_log',
                xmlstr          : xmlstr,
                startpage       : startPage,
                poresp          : poResp,
                senderidentity  : fromUser,
                punchreqid      : punchReq.punchReqId,
                sessionid       : sessionId, 
                statustext      : statusText
            }
            doGetRestlet(objDataForPunchLog);



            //use punch request id to create/update contact login credentials
            try {
                log.debug({
                    title: "Email from cXML request - SUITElet",
                    details: email
                });
                if (statusText === "OK"){
                    //create parameters to pass to URL
                    var params = {
                        recordtype  : 'customer',
                        fromUser    : fromUser,
                        sessionId   : sessionId,
                        email       : email,
                        fname       : fname,
                        lname       : lname,
                        punchreqid  : punchReq.punchReqId
                    }
                    //perform https.get RESTlet
                    doGetRestlet(params);
                }
                    
            } catch (e) {
              //log errors if any
                log.error ({ 
                  title: e.name,
                  details: e.message
                });   
            }	


				} catch (e) {
					//log errors if any
						log.error ({ 
							title: e.name,
							details: e.message
						});   
				}
				
			//end requestType 1
			} else if (requestId === "2"){
				/*
				-----------
        2 - Login Page
				-----------
        */
        
        try {
            //create parameters to pass to URL
            //log
            log.debug({
                title: "creating parameters to pass to URL",
                details: "creating parameters to pass to URL"
            });
            var params = {
                recordtype  : 'punchout_request',
                punchreqid  : options.request.parameters['punchreqid'],
                email       : options.request.parameters['email'],
                sessionId   : options.request.parameters['sessionid']
            }
            //perform https.get RESTlet
              //log
              log.debug({
                title: "perform https.get RESTlet",
                details: "perform https.get RESTlet"
            });
            var jsonResp = doGetRestlet(params);

            //log
            log.debug({
                title: "Parsing RESTlet response",
                details: "Parsing RESTlet response"
            });
            var jsonRespParsed = JSON.parse(jsonResp.body);

            function generateHtmlOut(obj){
                if (obj.statuscode !== "200"){
                    str = JSON.stringify(obj);
                } else {
                    str = JSON.stringify(obj);
                }
                return str
            }
            //log
            log.debug({
                title: "generating HTML output",
                details: "generating HTML output"
            });
            var htmlOutput = generateHtmlOut(jsonRespParsed);

            options.response.write(htmlOutput);

            log.debug({
                title: "HTML Output",
                details: jsonResp
            });

                   
				} catch (e) {
					//log errors if any
						log.error ({ 
							title: e.name,
							details: e.message
						});   
				}	
			//end requestType 2	
			} else if (requestId === "3"){
				/*
				-----------
				3 - Punchout Cart
				-----------
				*/
				try {
            //Function: Generate cXML prolog
            function createProlog( cXMLvers, randStr )
                {
                var dt;
                var str;
                var vers, sysID;
                var nowNum, timeStr;
                vers = "1.1.007";
                sysID = "http://xml.cXML.org/schemas/cXML/" + vers + "/cXML.dtd";
                dt = new Date();
                nowNum = dt.getTime();
                timeStr = timestamp( dt );
                str = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
                str += '<!DOCTYPE cXML SYSTEM "' + sysID + '">\n'; //didn't see this line in Ashok's formated response
                str += '<cXML payloadID="' + nowNum + ".";
                str += randStr + '@hellodirect.com'; 
                str += '" timestamp="' + timeStr + '" version="1.0" xml:lang="en-US">\n';
                return str;
                }
            
            var randStr = getRandomInt(100000001);
            var prologStr = createProlog( "1.0", randStr );


            /*
            --------------------------------
            Format the cXML PunchOutOrderMessage
            --------------------------------
            */
            
            //get initial Punchout Request Record
            objPunchReq = {
                recordtype: "get_punchout_request",
                punchreqid: options.request.parameters['punchreqid']
            }
            var punchReqRec = doGetRestlet(objPunchReq);
            var punchReqRecParsed = JSON.parse(punchReqRec.body);
        
            //get Item detials
            var objItems = JSON.parse(options.request.parameters['items']);
            
            //set UNSPC code (determined by Buyer <Header> <Sender> <Identity> in Punchout Request)
            var fromUser = punchReqRecParsed.fields.custrecord_hdi_punchout_senderidentity;
            var unspcCode;
            if (fromUser === "94-3043208"){
                // return "34101106"; //for testing - EXPERIAN
                unspcCode = "XXXXXXX"; //testing - Test Corporate Customer
            } else if (fromUser === "059782060"){
                unspcCode = "34101106"; //Experian
            } else if (fromUser === "038476441"){
                unspcCode = "34101106"; //Seagate
            } else if (fromUser === "CBS"){
                unspcCode = "0000000"; //CBS
            }

            
            var poResp;
            if (prologStr){
                poResp = prologStr;
                /*--Header--*/
                poResp += '<Header> \n ';
                poResp += '     <From> \n ';
                poResp += '         <Credential domain="' +punchReqRecParsed.fields.custrecord_hdi_punchout_todomain+ '"> \n ';
                poResp += '             <Identity>' +punchReqRecParsed.fields.custrecord_hdi_punchout_toidentity+ '</Identity> \n ';
                poResp += '         </Credential> \n ';
                poResp += '     </From> \n ';
                poResp += '     <To> \n ';
                poResp += '         <Credential domain="' +punchReqRecParsed.fields.custrecord_hdi_punchout_senderdomain+ '"> \n '; 
                poResp += '             <Identity>' +punchReqRecParsed.fields.custrecord_hdi_punchout_senderidentity+ '</Identity> \n ';
                poResp += '         </Credential> \n ';
                poResp += '     </To> \n ';
                poResp += '     <Sender> \n ';
                poResp += '         <Credential domain="' +punchReqRecParsed.fields.custrecord_hdi_punchout_todomain+ '"> \n '; 
                poResp += '             <Identity>' +punchReqRecParsed.fields.custrecord_hdi_punchout_toidentity+ '</Identity> \n ';
                poResp += '         </Credential> \n ';
                poResp += '     </Sender> \n ';
                poResp += '</Header> \n ';

                /*--Message--*/
                poResp += '<Message> \n ';
                poResp += '     <PunchOutOrderMessage> \n ';

                                /*-- If there are items to punch --*/ 
                                if(objItems){
                poResp += '         <BuyerCookie>' +punchReqRecParsed.fields.custrecord_hdi_punchout_buyercookie+ '</BuyerCookie> \n '; 
                poResp += '         <PunchOutOrderMessageHeader operationAllowed="create"> \n '; //make dynamic - (set up to get operation from original request)
                poResp += '             <Total> \n ';
                poResp += '                 <Money currency="USD">' +options.request.parameters['total']+ '</Money> \n '; //md
                poResp += '             </Total> \n ';
                poResp += '         </PunchOutOrderMessageHeader> \n ';

                                    /*--START Items--*/
                                    for (var key in objItems){
                                    //do item API call to get item's manufacturer
                                    var internalid = objItems[key].nsInternalId;
                                    itemUrl = 'https://customer.hellodirect.com/api/items?id=' +internalid+ '&fields=manufacturer';
                                    var response = https.get({
                                        url: itemUrl,
                                        headers: options.request.headers
                                    });
                                    var responseParsed = JSON.parse(response.body);
                                    //build cXML part
                poResp += '         <ItemIn quantity="' +objItems[key].quantity+ '"> \n '; 
                poResp += '             <ItemID> \n ';
                poResp += '                 <SupplierPartID>' +objItems[key].SupplierPartId+ '</SupplierPartID> \n '; 
                poResp += '             </ItemID> \n ';
                poResp += '             <ItemDetail> \n ';
                poResp += '                 <UnitPrice> \n ';
                poResp += '                     <Money currency="USD">' +objItems[key].UnitPrice+ '</Money> \n '; 
                poResp += '                 </UnitPrice> \n ';
                poResp += '                 <Description xml:lang="en">' +objItems[key].Description+ '</Description> \n '; 
                poResp += '                 <UnitOfMeasure>EA</UnitOfMeasure> \n ';
                poResp += '                 <Classification domain="UNSPSC">' +unspcCode+ '</Classification> \n '; //md - set UNSPC code to punchReqId - custrecord_hdi_punchout_customer_unspc
                poResp += '                 <ManufacturerName>' +responseParsed.items[0].manufacturer+ '</ManufacturerName> \n '; 
                poResp += '             </ItemDetail> \n ';
                poResp += '         </ItemIn> \n ';
                                    }
                                    /*--END Items--*/
                                }
                                /*--END If--*/

                poResp += '     </PunchOutOrderMessage> \n ';
                poResp += '</Message> \n ';

                /*--Close cXML--*/
                poResp += '</cXML>';
            }
            options.response.write(poResp);

        
        } catch (e) {
					//log errors if any
						log.error ({ 
							title: e.name,
							details: e.message
						});   
				}	
			//end requestType 3
			} else if (requestId === "4"){
				/*
				-----------
        4 - Log PunchoutOrderRequest cXML
            - steps:
                - receive encoded url param with cXML data
                - log that data..
            - clear the cart
            - log the user out 
				-----------
				*/
				try {
                    
            /*
            --------------------------------
            Format the cXML PunchOutOrderMessage
            --------------------------------
            */
            
            //get initial Punchout Request Record
            objPunchReq = {
                recordtype: "get_punchout_request",
                punchreqid: options.request.parameters['punchreqid']
            }
            var punchReqRec = doGetRestlet(objPunchReq);
            var punchReqRecParsed = JSON.parse(punchReqRec.body);
            

            //get Punchout Order Response from URL param
            var poResp = options.request.parameters['cXML'];
            // log.debug({
            //     title: "Punchout Clicked --> Response cXML",
            //     details: poResp
            // });


            //create punch log records
            var objOrderRespLog = {
                recordtype      : 'customrecord_hdi_punchout_log',
                poresp          : poResp,
                sessionid       : punchReqRecParsed.fields.custrecord_hdi_punchout_sessionid, 
                senderidentity  : punchReqRecParsed.fields.custrecord_hdi_punchout_toidentity,
                logtype         : "5"
            }
            doGetRestlet(objOrderRespLog);

            //clear cart
            var responseClearCart = https.get({
                url: 'https://customer.hellodirect.com/app/site/backend/emptycart.nl',
                headers: options.request.headers
            });

            //log out
            var responseLogOut = https.get({
                url: 'https://customer.hellodirect.com/sca-dev-2019-1/logOut.ssp?logoff=T',
                headers: options.request.headers
            });
        
        } catch (e) {
					//log errors if any
						log.error ({ 
							title: e.name,
							details: e.message
						});   
				}	
			//end requestType 4
			} else if (requestId >= 5 && requestId <= 99){	
				//print message to user
            options.response.write(
                '<div style="background:#CCC; width:200px; height:200px; text-align:center; padding:20px;">Whoops! Something went wrong. Please return to your previous page.</div>'+
                '<script>console.log("Whoops! Something went wrong. Please return to your previous page.")</script>'
            );
				//log error
            log.error ({ 
                title: "INVALID_REQUEST_TYPE",
                details: 'There is no request type "5" or greater. Please use a valid "requesttype" parameter value.'
            });   
			//end requestType 5-99
			} else {
          //print message to user
              options.response.write(
                  '<script>console.log("Whoops! Something went wrong. Please return to your previous page.")</script>'
              );
          //log error
              log.error ({ 
                  title: "NO_REQUEST_TYPE",
                  details: 'There is no request type set. Please use a valid "requesttype" parameter value.'
              });   
      }
			

		}
	
		/*
		-----------
		Return onRequest function on the 'onRequest' entry point
		-----------
        */
		return {
			onRequest : onRequest
        };
	}
		
);