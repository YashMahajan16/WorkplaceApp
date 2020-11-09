import { LightningElement, track, wire } from 'lwc';
import { createMessageContext, publish} from 'lightning/messageService';

import USERMC from "@salesforce/messageChannel/UserMessageChannel__c";
import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';

export default class Lwcverticalnavigationcomponent extends LightningElement {

    @track selectedItem = 'Home';
    @track currentContent = 'Home';

    @wire(getCurrentUser) currentUser;

    // properties / variables for message channel 
    pubContext = createMessageContext();

    handleSelect(event) {
        const selected = event.detail.name;

        if (selected === 'My Profile') {

            // code to fire event
            event.preventDefault();
            const message = { 
                recordId : this.currentUser.Id,
                recordData : { value: true } 
             };
    
            publish(this.pubContext, USERMC, message);            
            console.log('My Profile : ' + JSON.stringify(message));
        }
        if (selected === 'Home') {

            // code to publish the lightning message
            event.preventDefault();
            const message = { 
                recordId : this.currentUser.Id,
                recordData : { value: false } 
             };
    
            publish(this.pubContext, USERMC, message);            
            console.log('Home : ' + JSON.stringify(message));
            console.log('Home user id is : ' + message.recordId);
        }
        this.currentContent = selected;
    }
}