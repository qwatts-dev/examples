/**
* @NApiVersion 2.x
* @NModuleScope Public
*/
define(['N/search'],function (search) {
    "use strict";
    return {
        service: function (ctx) {

            try {
                //create search
                var mySearch = search.create({
                    type: 'customrecord_sc_microsite_item', //id of record type 'Microsite-Item'
                    columns: ['custrecord_sc_msi_description']
                });
                // filter by...
                mySearch.filters = [
                    search.createFilter({
                        name: 'formulatext',
                        formula: '{custrecord_sc_msi_ms}',
                        operator: search.Operator.IS,
                        values: ctx.request.parameters.microname
                    }),
                    search.createFilter({
                        name: 'formulatext',
                        formula: '{custrecord_sc_msi_item}',
                        operator: search.Operator.CONTAINS,
                        values: ctx.request.parameters.itemsku
                    })
                ]
                //run search
                var myResultSet = mySearch.run().getRange({
                    start: 0,
                    end: 5
                });
                //grab first result and do stuff with it
                if (myResultSet.length !== 0){
                    //parse values & write to response
                    var result = JSON.parse(JSON.stringify(myResultSet[0])); //make json object, then parse to access values
                    ctx.response.write(JSON.stringify({
                        additionalcopy: result.values.custrecord_sc_msi_description
                    }));
                }  
            } catch (error) {
                //write error to response
                ctx.response.write(JSON.stringify({
                    message: 'Error in Main.Service.ss',
                    error: error
                }));
            }


        }
    };
});
