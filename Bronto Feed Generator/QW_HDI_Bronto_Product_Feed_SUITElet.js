/**
 * @NApiVersion 2.x
 * @NScriptType suitelet
*/
define(['N/https','N/error','N/search', 'N/url'], 
	function(https, error, search, urlMod) {

    /*
    --------------------------
    Begin Entry Point Script
    --------------------------
    */
		function onRequest(options){

            //Function: https.get SUITElet
            function doGetSuitelet(rangestart){
                var url = urlMod.resolveScript({
                    scriptId: 'customscript_hdi_imageurlfinder_suitelet',
                    deploymentId: 'customdeploy_hdi_imageurlfinder_suitelet',
                    params: {rangestart: rangestart}
                });
                url = "https://3519184.app.netsuite.com" + url;
                //write to log of results
                log.debug({
                    title: "url",
                    details: url
                });
                
                var response = https.get({
                    url: url,
                    headers: options.request.headers
                });
                return response;
            }


            try {

                //build html result page
                var resultStr = '<html>';
                    resultStr += '<head>'; 
                    resultStr += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
                    resultStr += '<!-- BOOTSTRAP: Dependencies -->';
                    resultStr += '<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>';
                    resultStr += '<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>';
                    resultStr += '<!-- BOOTSTRAP: JS + CSS -->';
                    resultStr += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">';
                    resultStr += '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>';

                    resultStr += '<!-- DataTables: Files For Sortable Tables -->';
                    resultStr += '<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.10.23/b-1.6.5/b-html5-1.6.5/datatables.min.css"/>';
                    resultStr += '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/pdfmake.min.js"></script>';
                    resultStr += '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/vfs_fonts.js"></script>';
                    resultStr += '<script type="text/javascript" src="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.10.23/b-1.6.5/b-html5-1.6.5/datatables.min.js"></script>';

                    resultStr += '<style>';
                    resultStr += '.dt-buttons{margin-bottom:10px;}'+
                                    '.table td, .table th{'+
                                    'text-align: center;'+
                                    'vertical-align: middle;'+
                                    '}' 
                    resultStr += '</style>'; 

                    resultStr += '</head>'; 
                    resultStr += '<body style="padding:20px;">';

                    resultStr += '<div id="container">';
                    resultStr += '<div class="table-responsive">'; 
                    resultStr += '<table id="compResults" class="table table-striped table-hover">'; 
                    resultStr += '<thead>'; 
                    resultStr += '<tr>'+
                                    '<th>SKU (Name)</th>'+
                                    '<th>Title (Store Display Name)</th>'+
                                    '<th>Web URL</th>'+
                                    '<th>Sale Price</th>'+
                                    '<th>Brand</th>'+
                                    '<th>MPN</th>'+
                                    '<th>Image Link</th>'+
                                    // '<th>Page Title</th>'+
                                    // '<th>Price (Base Price)</th>'+
                                    // '<th>Stock Description</th>'+
                                    // '<th>UPC Code</th>'+
                                '</tr>';  
                    resultStr += '</thead><tbody>'; 


                    //do SUITElet calls
                    var i;
                    var num = 0;
                    for (i = 0; i < 100; i++) {
                        var productResults = doGetSuitelet(num); //enter number 0, 99, 198, etc..
                        productResults = JSON.parse(JSON.stringify(productResults));

                        num = num + 99;

                        //if results, write them to the page; if not, then break
                        if(!productResults.body){

                            break;

                        } else {

                            resultStr += productResults.body;

                        }
                    }


                    resultStr += '</div>'; 
                    resultStr += '</div>'; 
                    resultStr += "<script>";
                        // resultStr += "$(document).ready(function() { var table = $('#compResults').DataTable( { lengthChange: false, buttons: [ 'copy', 'excel', 'pdf', 'colvis' ] } ); table.buttons().container() .appendTo( '.table-responsive' ); } );";           
                        resultStr += "$(document).ready(function() {\n" +
                                    "  var table = $('#compResults').DataTable( {\n" +
                                    "      lengthChange: true,\n" +
                                    "      buttons: [ 'copy'],\n" +
                                    "      \"lengthMenu\": [ 100, 500, 1000 ]\n" +
                                    "  } );\n" +
                                    "  table.buttons().container()\n" +
                                    "      .appendTo( '#container .col-md-6:eq(0)' );\n" +
                                    "} );\n";           
                    resultStr += '</script>'; 
                    resultStr += '</body>'; 
                    resultStr += '</html>'; 


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