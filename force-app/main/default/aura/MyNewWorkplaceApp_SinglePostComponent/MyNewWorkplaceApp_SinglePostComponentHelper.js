({    
    updateLikesData : function(component){
        
        var post = component.get("v.singlePost");
        
        console.log(post.Id);

        var isDisliked = new Boolean(false);
        console.log('Initial boolean value is: ' + post.Is_Liked_By_Current_User__c)
        if (post.Is_Liked_By_Current_User__c == true && post.Like_Old_value__c == false){
            isDisliked = false;
         }
         else if (post.Is_Liked_By_Current_User__c == false && post.Like_Old_value__c == true){
            isDisliked = true;
         }
        
        var action = component.get('c.UpdateSinglePostData');
        action.setParams({
            "recordId" : post.Id,
            "isDisliked" : isDisliked
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if( (state === 'SUCCESS' || state ==='DRAFT') && component.isValid()){

                var responseValue = response.getReturnValue();
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
        
    },

    updateCommentsData : function(component){
        
        var post = component.get("v.singlePost");
        var message = component.get("v.commentMessage");
        
        console.log(post.Id);
        console.log(message);
        
        var action = component.get('c.UpdateCommentsData');
        action.setParams({
            "message" : message,
            "recordId" : post.Id
        });
        action.setCallback(this, function(response){
            
            var state = response.getState();
            if( (state === 'SUCCESS' || state ==='DRAFT') && component.isValid()){

                var responseValue = response.getReturnValue();

                component.set("v.commentMessage", " ");
                component.set("v.isCommented", false);
            } 
            console.log("Error: " + state);
        });
        $A.enqueueAction(action);
        
    }
})