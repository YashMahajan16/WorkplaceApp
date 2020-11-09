({
	init: function (component) {

		component.set('v.selectedItem', 'Home');
		component.set('v.currentContent', 'Home');
	},

	handleSelect: function(component, event, helper) {

		console.log('value changed');

		var selected = component.get('v.selectedItem');
		console.log(selected);

        if (selected == 'My Profile') {

			//code to fire the event
			var userEditEvent = $A.get("e.c:MyNewWorkplace_UserEditEvent");
			userEditEvent.setParams({ "isEdit" : true });
			userEditEvent.fire();

			console.log('Event fired');
        }
        
        if (selected == 'Home') {

			//code to fire the event
			var userEditEvent = $A.get("e.c:MyNewWorkplace_UserEditEvent");
			userEditEvent.setParams({ "isEdit" : false });
			userEditEvent.fire();

			console.log('Event fired');
        }
        component.set('v.currentContent', selected);

    }
})