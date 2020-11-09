({
	doInit : function(component, event, helper) { 
		
		console.log('Fetching all posts');
        helper.getAllPosts(component, event);
	}
})