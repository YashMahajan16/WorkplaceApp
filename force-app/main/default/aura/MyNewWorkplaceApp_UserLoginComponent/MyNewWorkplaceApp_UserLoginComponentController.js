({
	loginUser : function(component, event, helper) {
		
            var urlEvent = $A.get("e.force:navigateToURL");
            urlEvent.setParams({
                "url": "https://yashmah16workplace-dev-ed.lightning.force.com/lightning/page/home"
            });
        
            urlEvent.fire();
	}
})