import { LightningElement, track, wire } from 'lwc';
import { createMessageContext, publish, releaseMessageContext, APPLICATION_SCOPE, subscribe, MessageContext} from 'lightning/messageService';

import USERMC from "@salesforce/messageChannel/UserMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c";

export default class Lwcverticalnavigationcomponent extends LightningElement {

    isVisible = false;
    currentUserId = '';
    
    @track selectedItem = 'Home';
    @track currentContent = 'Home';

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

                //LogoutMC
                @wire(MessageContext) logoutContext;
                logoutSubscription = null;
                @track logoutReceivedMessage = '';

    // Code to subscribe the message
    connectedCallback() {
        console.log('Looged in user cred recieved');
        this.subscribeUSERCREDMC();
    }

    subscribeUSERCREDMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, USERCREDMC,
            (message) => { 
                console.log('Vertical Nav Comp - Catching user credentials' + JSON.stringify(message));
                this.handleUSERCREDMessage(message); 
            },
            { scope: APPLICATION_SCOPE });

            console.log('Message Subscription 3 - ' + this.logoutSubscription);
            if (this.logoutSubscription) {
              return;
            }
             this.logoutSubscription = subscribe(this.logoutContext, LogoutMC, 
              (message) => { this.handlelogoutMessage(message); },
              {scope: APPLICATION_SCOPE});
    }
        
    handleUSERCREDMessage(message) {
        console.log('Vertical Nav Comp - Received user credentials');
        this.userid = message.userRecordId;
        this.isVisible = message.userRecordData.isLoggedIn;        
    }

    subscribeLogoutMC() {
      if (this.logoutSubscription) {
          return;
      }
      this.logoutSubscription = subscribe(this.logoutContext, LogoutMC, 
          (message) => { this.handlelogoutMessage(message); },
          {scope: APPLICATION_SCOPE});
    }

    handlelogoutMessage(message) {       
      console.log('Vertical Nav Comp - received logout message : '+ JSON.stringify(message));        
      this.isVisible = false;
    }

    // properties / variables for message channel 
    pubContext = createMessageContext();

    handleSelect(event) {

        const selected = event.detail.name;
        if (selected === 'My Profile') {

            event.preventDefault();
            const message = { 
                recordId : this.currentUserId,
                recordData : { isEdit: true , isMyPost: false} 
             };
    
            publish(this.pubContext, USERMC, message);  
        }
        if (selected === 'Home') {

            event.preventDefault();
            const message = { 
                recordId : this.currentUserId,
                recordData : { isEdit: false , isMyPost: false } 
             };
    
            publish(this.pubContext, USERMC, message); 
        }

        if(selected === 'My Posts'){
          
          event.preventDefault();
          const message = { 
            recordId : this.currentUserId,
            recordData : { isEdit: false , isMyPost: true } 
          };
          
          publish(this.pubContext, USERMC, message);
        }
        this.currentContent = selected;
    }
}