
function service(request, response)
{
	'use strict';
	try 
	{
		require('QWatts.QWB2BAdditionalCopy.Main.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('QWatts.QWB2BAdditionalCopy.Main.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}