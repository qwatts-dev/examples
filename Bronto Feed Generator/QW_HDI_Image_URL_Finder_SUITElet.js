/**
 * @NApiVersion 2.x
 * @NScriptType suitelet
*/
define(['N/https','N/error','N/search'], 
	function(https, error, search) {
	
		/*
    --------------------------
    Begin Entry Point Script

    Test link: https://3519184.app.netsuite.com/app/site/hosting/scriptlet.nl?script=638&deploy=1&imageid=IMAGE_IDENTIFIER_HERE

    Note: must be logged in. No incognito window necessary.
    --------------------------
    */
		function onRequest(options){

            var imageIdentifier = options.request.parameters['imageid'];
            var rangestart = parseInt(options.request.parameters['rangestart']); //convert string param to int
            var rangeend = rangestart + 99;


            if (imageIdentifier) {
            
                try {

                    if (isNaN(imageIdentifier)){ 
                        //if not a number, do nothing
                    } else { 
                        //if number
                        imageIdentifier = JSON.stringify(imageIdentifier);
                    }
                    
                    //search for each item's image
                    var imageFileSearch = search.create({
                        type: search.Type.FOLDER,
                        columns: ['name','file.name'],
                        filters: [
                            ['file.name', search.Operator.HASKEYWORDS, imageIdentifier] //imageid parameter from url
                        ] 
                    });
                    var imageFileResults = imageFileSearch.run().getRange({
                        start: 0,
                        end: 10
                    });
                    if (imageFileResults[0]){
                        var imageNameValues = JSON.parse(JSON.stringify(imageFileResults[0])); //make json object, then parse to access values
                        var imageFileName = imageNameValues.values["file.name"];
                        log.debug({
                            title: "imageFileName",
                            details: imageFileName
                        });
                    } else {
                        var imageFileName = "noimage_a.jpg";
                    }

                    //write to page
                    var resultStr = imageFileName;
                    options.response.write(resultStr);
                    return resultStr;

                } catch (error) {
                    
                    //write to log of results
                    log.debug({
                        title: "Errors",
                        details: error
                    });

                }

            }

            else {

                //write to page
                // var resultStr = "Please provide a search term.";
                // options.response.write(resultStr);
                // return resultStr;

                try {

                    //build result string
                    var resultStr = '';

                        //load saved search
                        var mySearch = search.load({
                            id: 'customsearch_brontoproductfeed_hdi' //change later
                        });
                
                        //run search
                        if (rangestart){
                            var myResultSet = mySearch.run().getRange({
                                start: rangestart,
                                end: rangeend
                            });
                        } else {
                            var myResultSet = mySearch.run().getRange({
                                start: 0,
                                end: 99
                            });
                        }
        
                        //write to log of results
                        log.debug({
                            title: "myResultSet",
                            details: myResultSet
                        });
                        

                        //iterate through results to display on page
                        var i;
                        for (i = 0; i < myResultSet.length; i++) {

                            var itemValues = JSON.parse(JSON.stringify(myResultSet[i])); //make json object, then parse to access values

                            //get item info
                            var name = itemValues.values.itemid;
                            var storeDisplayName = itemValues.values.storedisplayname;
                            var webLink = itemValues.values.formulatext; //formulatext = the saveed search's formula to generate link
                            var onlinePrice = itemValues.values.onlineprice;
                            //brand
                                if (itemValues.values.custitem_facet_brand_hdi[0]){
                                    var brand = itemValues.values.custitem_facet_brand_hdi[0].text;
                                } else {
                                    var brand = "&nbsp;";
                                }
                            var mpn = itemValues.values.mpn;
                            var pageTitle = itemValues.values.pagetitle;
                            var listPrice = itemValues.values.baseprice;
                            var stockDescription = itemValues.values.stockdescription;
                            var upcCode = itemValues.values.upccode;
                            //image
                                if (itemValues.values.custitem_image_item_identifier_hdi){
                                    if (isNaN(imageIdentifier)){ 
                                        //if not a number
                                        var imageIdentifier = itemValues.values.custitem_image_item_identifier_hdi;
                                    } else { 
                                        //if number
                                        var imageIdentifier = JSON.stringify(itemValues.values.custitem_image_item_identifier_hdi);
                                    }
                                } else {
                                    var imageIdentifier = "noimage";
                                }
                                //search for each item's image
                                var imageFileSearch = search.create({
                                    type: search.Type.FOLDER,
                                    columns: ['name','file.name'],
                                    filters: [
                                        ['file.name', search.Operator.HASKEYWORDS, imageIdentifier+"_"], //HDI image identifier .. added "_" to eliminate partial matches
                                        'and', ['file.name', search.Operator.DOESNOTCONTAIN, ".pdf"] // file name doesn't contain ".PDF"
                                    ] 
                                });
                                var imageFileResults = imageFileSearch.run().getRange({
                                    start: 0,
                                    end: 10
                                });
                                if (imageFileResults[0]){
                                    var imageNameValues = JSON.parse(JSON.stringify(imageFileResults[0])); //make json object, then parse to access values
                                    var imageFileName = imageNameValues.values["file.name"];
                                } else {
                                    var imageFileName = "noimage_a.jpg";
                                }
                                // if 2nd-6th image files, get the first
                                if (imageFileName.indexOf("_b.") || 
                                    imageFileName.indexOf("_c.") || 
                                    imageFileName.indexOf("_d.") || 
                                    imageFileName.indexOf("_e.") || 
                                    imageFileName.indexOf("_f.") || 
                                    imageFileName.indexOf("_g.")){
                                    var imageFileName = imageFileName.replace("_b.", "_a.");
                                    var imageFileName = imageFileName.replace("_c.", "_a.");
                                    var imageFileName = imageFileName.replace("_d.", "_a.");
                                    var imageFileName = imageFileName.replace("_e.", "_a.");
                                    var imageFileName = imageFileName.replace("_f.", "_a.");
                                    var imageFileName = imageFileName.replace("_g.", "_a.");
                                }


                            //create table entry for item
                            resultStr +='<tr>'+
                                        '<td>' +name+ '</td>'+
                                        '<td>' +storeDisplayName+ '</td>'+
                                        '<td>' +webLink+ '</td>'+
                                        '<td>' +onlinePrice+ '</td>'+
                                        '<td>' +brand+ '</td>'+
                                        '<td>' +mpn+ '</td>'+
                                        '<td>'+ 'https://www.hellodirect.com/assets/images/products/' +imageFileName+ '</td>'+
                                        // '<td>' +pageTitle+ '</td>'+
                                        // '<td>' +listPrice+ '</td>'+
                                        // '<td>' +stockDescription+ '</td>'+
                                        // '<td>' +upcCode+ '</td>'+
                                        '</tr>';
                        }  
                    

                    //write to page
                    options.response.write(resultStr);
                    return resultStr;
                    
                    
                } catch (error) {

                    //write to log of results
                    log.debug({
                        title: "Errors",
                        details: error
                    });
                    
                }


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