import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import fetchTrendingPosts from '@salesforce/apex/MyNewWorkplaceApp_TrendingApexContrller.fetchTrendingPosts'

import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext } 
    from 'lightning/messageService';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c";

export default class Workplacetrendingpostcomponent extends LightningElement {

    isVisible = false;

    //wire connection to fetch the apex data
    @wire(fetchTrendingPosts) topFeeds;

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

    userContext = createMessageContext();
    userSubscription = null;

        //LogoutMC
        @wire(MessageContext) logoutContext;
        logoutSubscription = null;
        @track logoutReceivedMessage = '';

    connectedCallback(){
        console.log('Trending post Comp - Message received');
        this.subscribeMC();
        this.subscribeUSERCREDMC();
    }
    
    //Message channel to get user credentials
    subscribeUSERCREDMC() {
        console.log('User subsciprition is - ' + this.userSubscription);
        if (this.userSubscription) {
            return;
        }
        this.userSubscription = subscribe(this.userContext, USERCREDMC,
            (message) => { 
                console.log('Trending post Comp - Catching user credentials' + JSON.stringify(message));
                this.handleUSERCREDMessage(message); 
            },
            { scope: APPLICATION_SCOPE });

            console.log('Message Subscription 2 - ' + this.logoutSubscription);
            if (this.logoutSubscription) {
              return;
            }
             this.logoutSubscription = subscribe(this.logoutContext, LogoutMC, 
              (message) => { this.handlelogoutMessage(message); },
              {scope: APPLICATION_SCOPE});
    }
        
    handleUSERCREDMessage(message) {
        console.log('Trending post Comp - Received user credentials');
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
      console.log('Trending post Comp - received logout message : '+ JSON.stringify(message));        
      this.isVisible = false;
    }
    disconnectedCallback() {
        //releaseMessageContext(this.context);
       // releaseMessageContext(this.userContext);
    }

    //Message channel to get updated posts
    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, POSTDATAMC, 
            (message) => { this.handleMessage(message); },
            {scope: APPLICATION_SCOPE});
     }

     handleMessage(message) {       
        console.log('received message:::'+JSON.stringify(message));

        refreshApex(this.topFeeds);    
        console.log('Apex refreshed'); 
    }

}