({
	doInit : function(component, event, helper) {
		console.log("Welcome to init"); 
	},
    
    createPost : function(component, event, helper){
		
        console.log("call to helper");
        helper.savePost(component);

        //$A.get('e.force:refreshView').fire();
        //var childComponent = component.find('getAllPosts');
        //childComponent.reInit();

            //code to fire the event
		  var postUpdateEvent = $A.get("e.c:MyNewWorkplaceApp_PostUpdateEvent");
          postUpdateEvent.fire();
    },

    saveImage : function(component, event, helper){
		
        console.log("call to helper");
        helper.savePost(component);
    },

    saveLocation : function(component, event, helper){
		
        console.log("call to helper");
        helper.savePost(component);
    }
})