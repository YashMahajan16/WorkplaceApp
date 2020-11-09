({
    handleLikeButtonClick : function (component) {
        
        component.set('v.liked', true);
        var recordId = component.get("v.parentRecordId");
        var isLiked = component.get("v.liked");
        var event = component.getEvent("postUpdateEvent");
        event.setParams({
            	"commentMessage" : "Sample Comment" ,
            	"isLiked" : true,
           		"recordId" : recordId
        });
        event.fire();
        //$A.get('e.force:refreshView').fire();
        
    },
    handleAnswerButtonClick: function (component) {
        
        component.set('v.commented', !component.get('v.commented'));
        var commentMessage = component.get("v.commentMessage");
        var recordId = component.get("v.parentRecordId");
        var event = component.getEvent("postUpdateEvent");
        event.setParams({
            	"commentMessage" : "Sample comment",
                "isLiked" : false,
            	"recordId" : recordId
        });
        event.fire();
       // $A.get('e.force:refreshView').fire();
    }
});