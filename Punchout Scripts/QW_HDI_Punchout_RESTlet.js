/**
 * @NApiVersion 2.x
 * @NScriptType restlet
*/


/*
-----------
Global Functions
-----------
*/
//Function: twoChar for Log Stamp function
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
//Function: create log stamp
function createLogStamp()
	{
	var dt = new Date();
	var str;
	str = dt.getFullYear() + "-" + twoChar( 1 + dt.getMonth() ) + "-";
	str += twoChar( dt.getDate() ) + " " + twoChar( dt.getHours() ) + ":";
	str += twoChar( dt.getMinutes() ) + ":" + twoChar( dt.getSeconds() );

	return str;
	}


/*
-----------
Begin Define Statement
-----------
*/
define(['N/record','N/runtime','N/error'], 
	   function(record, runtime, error) {
	
			function _get(context) {

          if (context.recordtype === 'customrecord_hdi_punchout_request'){
              try {

                  // Function: create punch request record
                  function createPunchRequestRecord(obj)
                      {
                      var rec = record.create({
                          type: 'customrecord_hdi_punchout_request',
                          isDynamic: true
                      });
                      for (var key in obj){
                          rec.setValue({
                              fieldId: key,
                              value: obj[key]
                          });
                      }
                      var recId = rec.save();

                      //log each variable
                      // for (var key in obj){
                      //     log.debug({
                      //         title: key,
                      //         details: obj[key]
                      //     });
                      // }
                      return recId; //return internalId of Punchout Request Record
                      }


                  //Object: punch request
                  var objPunchReq = {
                      custrecord_hdi_punchout_logstamp            : createLogStamp(), //create log stamp in RESTlet
                      custrecord_hdi_punchout_browserformpost     : context.browserformpost,
                      custrecord_hdi_punchout_toidentity          : context.toidentity,
                      custrecord_hdi_punchout_todomain            : context.todomain,
                      custrecord_hdi_punchout_senderdomain        : context.senderdomain,
                      custrecord_hdi_punchout_senderidentity      : context.senderidentity,
                      custrecord_hdi_punchout_useragent           : context.senderuseragent,
                      custrecord_hdi_punchout_buyercookie         : context.senderbuyercookie,
                      custrecord_hdi_punchout_firstname           : context.firstname,
                      custrecord_hdi_punchout_lastname            : context.lastname,
                      custrecord_hdi_punchout_email               : context.email,
                      custrecord_hdi_punchout_decodeorder         : context.decodeorderresponse,
                      custrecord_hdi_punchout_sessionid           : context.sessionId,
        
                  }
                  //store punch request id
                  var punchReqId = createPunchRequestRecord(objPunchReq);

                  //convert punchReqId to JSON object
                  var punchReqIdJSON = '{"punchReqId":"' +punchReqId+ '"}';
                  punchReqIdJSON = JSON.parse(punchReqIdJSON);
                  
                  //return the punchreqid
                  return punchReqIdJSON; 
                  
              } catch (e) {
                  log.error ({ 
                    title: e.name,
                    details: e.message
                  });   
              }
          }

          if (context.recordtype === 'customrecord_hdi_punchout_log'){
              try {

                  // Function: create punch log record
                  function createPunchLogRecord(obj)
                      {
                      var rec = record.create({
                          type: 'customrecord_hdi_punchout_log',
                          isDynamic: true
                      });
                      for (var key in obj){
                          rec.setValue({
                              fieldId: key,
                              value: obj[key]
                          });
                      }
                      rec.save();

                      //log each variable
                      // for (var key in obj){
                      //     log.debug({
                      //         title: key,
                      //         details: obj[key]
                      //     });
                      // }
                      }

                  //Create Punchout Log Record                    
                  function createLogObj(logtype)
                      {
                      var logtext;
                      if (logtype === '1'){// po request
                        logtext = context.xmlstr;
                      } else if (logtype === '2'){ //success
                        logtext = "SUCCESS - processPunchoutResponse - Punchout output url " +context.startpage;
                      } else if (logtype === '3'){ //failure
                        logtext = "FAILED - " +context.poresp;
                      } else if (logtype === '4'){ //po response
                        logtext = "SUCCESS - " +context.poresp;
                      } else if (logtype === '5'){ //po ORDER response
                        logtext = context.poresp;
                      } 
                      var obj = {
                        custrecord_hdi_punchout_log_logtype     : logtype,
                        custrecord_hdi_punchout_log_logstamp	: createLogStamp(),
                        custrecord_hdi_punchout_log_senderid	: context.senderidentity,
                        custrecordhdi_punchout_log_sessionid	: context.sessionid,
                        custrecord_hdi_punchout_log_logtext     : logtext,
                        // punchreqid  : punchReqId //later on conect log records with their punchout request record
                      }
                      return obj;
                      }

                  try {
                    var logtypeSet = context.logtype;
                  } catch (e) {
                    log.error({
                      title: e.name,
                      details: e.message
                    });
                  }

                  if(logtypeSet){
                    createPunchLogRecord(createLogObj(logtypeSet));
                  } else {
                    //create punch log records
                    createPunchLogRecord(createLogObj("1"));
                    if (context.statustext === "OK"){                    
                      createPunchLogRecord(createLogObj("2")); //success
                      createPunchLogRecord(createLogObj("4")); //po response
                    } else if (context.statustext === "Bad Request"){
                      createPunchLogRecord(createLogObj("3")); //failure
                    }
                  }
      

              } catch (e) {
                  log.error ({ 
                    title: e.name,
                    details: e.message
                  });   
              }
          }

          if (context.recordtype === 'customer') {
              try{
                  // Function: Get Customer Internal ID
                  function getCustIntId(fromUser){
                    if (fromUser === "94-3043208"){
                      return "1229653"; //for testing - Seagate
                      // return "3839946"; //testing - Test Corporate Customer
                    } else if (fromUser === "059782060"){
                      return "1218860"; //Experian
                    } else if (fromUser === "038476441"){
                      return "1229653"; //Seagate
                    } else if (fromUser === "CBS"){
                      return "1215518"; //CBS
                    }
                  }
                  // define variables
                  var fromUser = context.fromUser;
                  var sessionId = context.sessionId;
                  var email = context.email;
                  var fname = context.fname;
                  var lname = context.lname;
                  var punchReqId = context.punchreqid;

                  //log
                  log.debug({
                    title: "Email from cXML request - RESTlet",
                    details: email
                  });


                  //load customer record
                  var r = record.load({
                      type: record.Type.CUSTOMER,
                      id: getCustIntId(fromUser)
                  });
                  //customer record loaded
                  log.debug({
                    title: "Customer Record Loaded",
                    details: "Customer Record Loaded"
                  });
                  var objCustomer = JSON.parse(JSON.stringify(r)); //make json object
                  var contactList = objCustomer.sublists.contactroles; //get contact list
                  
                  
                  //Function: to search for contact (or create new contact, if needed) and set contact PW
                  function getContactRecord(userEmail) {
                    var userFound = false;
                    var newPass = sessionId; //update to pull pw from url, sessionid
                    var userEmailLower = userEmail.toLowerCase();

                    //Function: Set new pw for contact
                    function setContactPw(customerRecord,key){
                      var contactData = {
                        fillpassword: true,
                        giveaccess: true,
                        password: newPass,
                        passwordconfirm: newPass
                      }
                      for (var prop in contactData){
                        if (contactData.hasOwnProperty(prop)){
                          customerRecord.setSublistValue({
                            sublistId: 'contactroles',
                            fieldId: prop,
                            line: key.replace("line ","")-1,
                            value: contactData[prop]
                          });
                        }
                      }
                      return newPass;
                    }

                    //loop through contacts to see if user exists
                    for (var key in contactList){
                      if (userEmail === contactList[key].email){
                        userFound = true;
                        //log
                        log.debug({
                          title: "User Found?",
                          details: "True - with Title Case email"
                        });
                        
                        var pw = setContactPw(r,key);

                        r.save();	//save customer record after changes to contact password
                
                        log.debug ({ 
                          title: 'New PW Set',
                          details: 'New PW Set - Session Key of Punchout Request: ' +sessionId
                        });

                        //return contact email & PW
                        return pw;
                      } else if(userEmailLower === contactList[key].email){
                        userFound = true;
                        //log
                        log.debug({
                          title: "User Found?",
                          details: "True - with all Lower Case email"
                        });
                        
                        var pw = setContactPw(r,key);

                        r.save();	//save customer record after changes to contact password
                
                        log.debug ({ 
                          title: 'New PW Set',
                          details: 'New PW Set - Session Key of Punchout Request: ' +sessionId
                        });

                        //return contact email & PW
                        return pw;
                      } 
                    }
                    if (userFound != true){
                      //log
                      log.debug({
                        title: "User Found?",
                        details: "False - Creating new contact record"
                      });

                      function createAndSaveContactRecord(userEmail) {
                        //create new contact

                        var nameData = {
                          firstname: fname,
                          lastname: lname + " (punchout-" +punchReqId+ ")",
                          email: userEmail,
                          company: objCustomer.id
                        };
                        var objNewContactRecord = record.create({
                          type: record.Type.CONTACT,
                          isDynamic: false
                        });
                        objNewContactRecord.setValue({
                          fieldId: 'subsidiary',
                          value: '2' //2 = hello direct
                        });
                        for ( var key in nameData) {
                          if (nameData.hasOwnProperty(key)) {
                            objNewContactRecord.setValue({
                              fieldId: key,
                              value: nameData[key]
                            });
                          }
                        }
                        var recordId = objNewContactRecord.save(); //save new contact
                        log.debug ({ 
                          title: 'New User Created',
                          details: 'User Internal ID: '+recordId
                        });

                        //reload customer record, and set PW on contact
                        var r2 = record.load({
                          type: record.Type.CUSTOMER,
                          id: objCustomer.id
                        });
                        var objCustomer2 = JSON.parse(JSON.stringify(r2));
                        var contactList2 = objCustomer2.sublists.contactroles;
                        for (var key in contactList2){
                          if (userEmail === contactList2[key].email){
                            userFound = true;
                            
                            var pw2 = setContactPw(r2,key);

                            //log
                            log.debug({
                              title: "Customer Record - Contact List",
                              details: contactList2
                            });
                            r2.save();	//save customer record after changes to contact password
                            
                            //log
                            log.debug({
                              title: "Customer Record Saved",
                              details: "Customer Record Saved"
                            });
                            log.debug ({ 
                              title: 'New PW',
                              details: 'Get Session Key of Punchout Request: ' +sessionId
                            });
          
                            //return contact email & PW
                            return pw2;
                          } 
                        }
                      }
                      createAndSaveContactRecord(userEmail);
                    }
                  } // End Function: to search for contact (or create new contact, if needed) and set contact PW

                  // do function
                  getContactRecord(email);
                      

                  //return record results
                  return pr;
                  
              } catch (e) {
                  log.error ({ 
                      title: e.name,
                      details: e.message
                  });  
                  
                  return e;
              }
          }
  
          if (context.recordtype === 'punchout_request') {
            try{
              //load punchout request record
              var pr = record.load({
                  type: 'customrecord_hdi_punchout_request',
                  id: context.punchreqid
              });
              var objPunchReq = JSON.parse(JSON.stringify(pr)); //make json object

              // define variables
              var sessionId = objPunchReq.fields.custrecord_hdi_punchout_sessionid;
              var email = objPunchReq.fields.custrecord_hdi_punchout_email;
              var browserFormPost = objPunchReq.fields.custrecord_hdi_punchout_browserformpost;

              //return 'match' or 'Invalid Credentials'
              var response;
              if (sessionId === context.sessionId && email === context.email){
                response = {
                  statustext: "Success",
                  statuscode: "200",
                  browserFormPost: browserFormPost
                };
                return response;
              } else {
                response = {
                  statustext: "Invalid Credentials",
                  statuscode: "403" //Forbidden..
                };
                return response;
              }
                          
                          
            } catch (e) {
                log.error ({ 
                    title: e.name,
                    details: e.message
                });  
                
                return e;
            }
          }
  
          if (context.recordtype === 'get_punchout_request') {
            try{
              //load punchout request record
                var pr = record.load({
                    type: 'customrecord_hdi_punchout_request',
                    id: context.punchreqid
              });

              return pr;
                          
            } catch (e) {
                log.error ({ 
                    title: e.name,
                    details: e.message
                });  
                
                return e;
            }
          }
			
			}

			/*
			-----------
			Return entry point (get) and function attached to it (_get)
			-----------
			*/
			return{
				get: _get
			}

		}
);