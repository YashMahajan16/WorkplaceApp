({
    doInit : function(component, event, helper) {        

        var currentUser = $A.get("$SObjectType.CurrentUser");
        component.set("v.currentUser", currentUser);
        component.set("v.recordId", currentUser.Id);

        console.log('User id is: ' + currentUser.Id);

        helper.getCurrentUserInfo(component);
    },

    handleUserEdit: function(component, event){

        console.log('Event handled');
        component.set("v.isEdit", true);
        
        var currentUser = $A.get("$SObjectType.CurrentUser");
        component.set("v.currentUser", currentUser);
        component.set("v.recordId", currentUser.Id);    
    },

    save : function(component, event, helper) {

        console.log("in save method");

        helper.updateCurrentUserInfo(component);
    }    
})