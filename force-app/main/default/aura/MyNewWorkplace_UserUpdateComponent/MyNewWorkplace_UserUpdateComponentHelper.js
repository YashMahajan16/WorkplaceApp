({
    getCurrentUserInfo : function(component) {

        var action = component.get('c.getUserInfo');
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                component.set("v.userName", storeResponse);
            }
        });
        $A.enqueueAction(action);
    },

    updateCurrentUserInfo : function(component) {
        
        console.log("in update method");
        var currentUser = component.get('v.userName');
        

        console.log('Fetching values through id');

        var fName = component.find("updatedFirstName").get("v.value");
        var lName = component.find("updatedLastName").get("v.value");
        var department = component.find("updatedDepartment").get("v.value");
        var city = component.find("updatedCity").get("v.value");
        

        var action = component.get('c.updateUserInfo');
        action.setParams({
            "fName" : fName,
            "lName" : lName,
            "department" : department,
            "city" : city
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();
                console.log("User update - Success!!");
            }
        });
        $A.enqueueAction(action);

        alert('User updated successfully');

        component.find("updatedFirstName").set("v.value", " ");
        component.find("updatedLastName").set("v.value", " ");
        component.find("updatedDepartment").set("v.value", " ");
        component.find("updatedCity").set("v.value", " ");
    }


})