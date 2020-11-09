import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createMessageContext, publish} from 'lightning/messageService';

import logoutUser from '@salesforce/apex/Workplace_UserLoginController.logoutUser';
import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';
import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

export default class Lwcuserlogoutcomponent extends NavigationMixin(LightningElement) {

    context = createMessageContext();
    @track username = '';

    // fetching the logged in user info
    @wire(getCurrentUser)
    currentUser({ error, data }) {
        if (data) { 
            console.log('Logged in user data is : ' + JSON.stringify(data));
            this.username = data.User_Name__c;
            this.error = undefined;
        } else if(error) {
            this.error = error;
            console.log('User loging error is : ' + error);
        }
    }

    logout(){
        const message = { 
            recordId : 'user logout',
            recordData : { value: true }};
        publish(this.context, POSTDATAMC, message);
        console.log('Message published for logged out user: ' + JSON.stringify(message));

        logoutUser().then(() => {

            // displaying the logout success
            const successEvent = new ShowToastEvent({
                "title": "Logged out!",
                "message": "User logged out successfully!",
                "variant" : "success"
            });
            this.dispatchEvent(successEvent);

            // navigating back to the login page
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName : 'User_Login'
                }
            });
        }).catch(() => {
            alert('Cannot logout user, try again later');
        });
    }
}