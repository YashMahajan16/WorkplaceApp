({
    getTopTrendingPosts : function(component) {
		
            var action = component.get('c.fetchTrendingPosts');
            action.setCallback(this, function(response){
            
            var state = response.getState();
            if( (state === 'SUCCESS' || state ==='DRAFT') && component.isValid()){

                var responseValue = response.getReturnValue();
                component.set("v.topTrendingPosts", responseValue);
            } 
        });
        $A.enqueueAction(action);
	}
})