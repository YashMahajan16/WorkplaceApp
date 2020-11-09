({
    likePost : function(component, event, helper) {
      console.log("Before value: " + component.get('v.liked'));

      component.set('v.liked', !component.get('v.liked'));

      console.log("After value: " + component.get('v.liked'));

      //if(component.get('v.liked')){
        helper.updateLikesData (component);
      //}

     // $A.get('e.force:refreshView').fire();

    //code to fire the event
		  var postUpdateEvent = $A.get("e.c:MyNewWorkplaceApp_PostUpdateEvent");
      postUpdateEvent.fire();
    
    },

    checkComments : function(component, event, helper) {
		  component.set("v.isCommented", true);
    },

    commentPost : function(component, event, helper) {
      
      console.log("this is controller");
      helper.updateCommentsData (component);

        //$A.get('e.force:refreshView').fire();
      //code to fire the event
      var postUpdateEvent = $A.get("e.c:MyNewWorkplaceApp_PostUpdateEvent");
      postUpdateEvent.fire();

    }
})