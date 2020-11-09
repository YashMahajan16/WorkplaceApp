({
	savePost : function(component) {
        
        console.log("Welcome to helper");
        
		var message = component.get("v.postMessage"); 
        var action = component.get('c.savePost');
        console.log(message);
        action.setParams({"message" : message});
        action.setCallback(this, function(response){
            
            var state = response.getState();
            console.log(state);
            
            if( (state === 'SUCCESS' || state ==='DRAFT') && component.isValid()){
                console.log(state);
                component.set("v.postMessage", " ");
                component.set("v.isPostSuccessful", true);
            }  
            
			else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + 
                                 errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
		});
        $A.enqueueAction(action);
        //$A.get('e.force:refreshView').fire();
    }
})