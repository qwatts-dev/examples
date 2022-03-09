
define(
	'QWatts.QWB2BAdditionalCopy.Main'
,   [
		'QWatts.QWB2BAdditionalCopy.Main.View'
	]
,   function (
		MainView
	)
{
	'use strict';

	return  {

		mountToApp: function mountToApp (container)
		{
			try {
				//GLOBAL: get microsite name
				var microname = SC.ENVIRONMENT.published.microSite.siteName;
				
				//PDP add child view
				var layout = container.getComponent('Layout');
				if(layout) {
					layout.addChildView('Product.Price', function() {
						var pdp = container.getComponent('PDP');
						if(pdp){
							//get itemsku
							var iteminfo = pdp.getItemInfo();
							var itemsku = iteminfo.item.itemid;

							//render view
							return new MainView({ 
								type: "pdp", 
								container: container, 
								iteminfo: iteminfo,
								microname: microname,
								itemsku: itemsku
							});
						}
					});
				}
				
			} catch (error) {
				console.log(error);
			}
		} //END mountToApp
	};
});
