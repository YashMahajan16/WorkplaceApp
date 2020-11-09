({
	getAllPosts : function(component, event) {			

        	//var isRefresh = component.get("v.isParentRefresh");
            var action = component.get('c.fetchAllPosts');
            action.setCallback(this, function(response){
            
            console.log("preparing to call apex");
            var state = response.getState();
            if( (state === 'SUCCESS' || state ==='DRAFT')){

                var responseValue = response.getReturnValue();
               /* if (isRefresh == true) {
                     var newValues = responseValue[0];
                     component.set("v.allPosts", newValues);                                     
            	}
                 else */
                console.log(responseValue);
                component.set("v.allPosts", responseValue);
                console.log("value set");
            } 

            console.log('Error: ' + state);
        });
        $A.enqueueAction(action);
	}
})