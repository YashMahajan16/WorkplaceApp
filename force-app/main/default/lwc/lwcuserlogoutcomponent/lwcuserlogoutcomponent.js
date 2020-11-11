import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, publish} from 'lightning/messageService';

import logoutUser from '@salesforce/apex/Workplace_UserLoginController.logoutUser';

import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c"

export default class Lwcuserlogoutcomponent extends NavigationMixin(LightningElement) {

    isVisible = false;
    username = 'None';
    userid = '1000';

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

    // Code to subscribe the message
    connectedCallback() {
        console.log('Looged in user cred recieved');
        this.subscribeUSERCREDMC();
    }

    subscribeUSERCREDMC() {
        if (this.subscription) {
            return;
        }
        console.log('Catching user credentials - initial');
        this.subscription = subscribe(this.context, USERCREDMC,
            (message) => { 
                console.log('Catching user credentials' + JSON.stringify(message));
                this.handleUSERCREDMessage(message); 
            },
            { scope: APPLICATION_SCOPE });
        }
        
    handleUSERCREDMessage(message) {
        console.log('Received user credentials' + JSON.stringify(message));
        this.userid = message.userRecordId;
        this.username = message.userRecordData.userName;
        this.isVisible = message.userRecordData.isLoggedIn;        

        console.log('User Id - ' + message.userRecordId);
        console.log('User Name - ' + message.userRecordData.userName);
        console.log('Is Logged In - ' + message.userRecordData.isLoggedIn);
    }

    pubContext = createMessageContext();
    logout(){

        logoutUser()
            .then(() => {
                //code to publish the message
                const message = { 
                  recordId : 'user profile update',
                  recordData : { isLoggedOut : true }};
            publish(this.pubContext, LogoutMC, message);
            this.isVisible = false; 

                // displaying the logout success
                const successEvent = new ShowToastEvent({
                    "title": "Logged out!",
                    "message": "User logged out successfully!",
                    "variant" : "success"
                });
                this.dispatchEvent(successEvent);       
             });
    }
}