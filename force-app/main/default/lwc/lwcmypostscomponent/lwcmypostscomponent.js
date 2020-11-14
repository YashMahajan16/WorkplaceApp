import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { showToastEvent } from 'lightning/platformShowToastEvent';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, publish, MessageContext }
        from 'lightning/messageService';

import getMyPosts from '@salesforce/apex/Workplace_MyPostsController.getMyPosts';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c";
import USERMC from "@salesforce/messageChannel/UserMessageChannel__c";

export default class Lwcmypostscomponent extends LightningElement {

  //to hide and show the component based on conditions
  isVisible = false;

  @track currentUserId;
  @track currentUserName;

  @wire(getMyPosts, {userId : '$currentUserId'})
  myPosts;

  //USERCREDMC
  @wire(MessageContext) userContext;
  userSubscription = null;
  @track userReceivedMessage = '';

  //POSTDATAMC
  context = createMessageContext();
  subscription = null;
  @track receivedMessage = '';

  //LogoutMC
  @wire(MessageContext) logoutContext;
  logoutSubscription = null;
  @track logoutReceivedMessage = '';

  //USERMC
  @wire(MessageContext) userMyPostContext;
  userMyPostSubscription = null;
  @track userMyPostReceivedMessage = '';

  // Code to subscribe the message
  connectedCallback() {
    console.log('My post comp - Message received');
    this.subscribeUSERCREDMC();
  }

  subscribeUSERCREDMC() {

      if (this.userSubscription) {
          return;
      }

      console.log('Message Subscription 1 - ' + this.userSubscription);
      this.userSubscription = subscribe(this.userContext, USERCREDMC,
                                        (message) => { 
                                            console.log('My post comp - Catching user credentials');
                                              this.handleUSERCREDMessage(message); 
                                          },
                                          { scope: APPLICATION_SCOPE });

      console.log('Message Subscription 2 - ' + this.subscription);
      if (this.subscription) {
          return;
      }
      this.subscription = subscribe(this.context, POSTDATAMC,
      (message) => { this.handlePOSTDATAMessage(message); },
      { scope: APPLICATION_SCOPE });

      console.log('Message Subscription 3 - ' + this.logoutSubscription);
      if (this.logoutSubscription) {
        return;
      }
       this.logoutSubscription = subscribe(this.logoutContext, LogoutMC, 
        (message) => { this.handlelogoutMessage(message); },
        {scope: APPLICATION_SCOPE});

      console.log('Message Subscription 4 - ' + this.userMyPostSubscription);
      if (this.userMyPostSubscription) {
        return;
      }
      this.userMyPostSubscription = subscribe(this.userMyPostContext, USERMC, 
        (message) => { this.handleuserMyPostMessage(message); },
        {scope: APPLICATION_SCOPE});
  }
      
  handleUSERCREDMessage(message) {
      console.log('My post comp - Received user credentials' + JSON.stringify(message));
      this.currentUserId = message.userRecordId;
      this.currentUserName = message.userRecordData.userName;
      this.isVisible = message.userRecordData.isLoggedIn; 

      refreshApex(this.allPosts);
  }

  // Code to subscribe the post data message
  subscribePOSTDATAMC() {
      if (this.subscription) {
          return;
      }
      this.subscription = subscribe(this.context, POSTDATAMC,
          (message) => { this.handlePOSTDATAMessage(message); },
          { scope: APPLICATION_SCOPE });
  }

  handlePOSTDATAMessage(message) {
      console.log('Create and get post comp - Received post message :' + JSON.stringify(message));
      refreshApex(this.myPosts);
  }

  subscribeLogoutMC() {
    if (this.logoutSubscription) {
        return;
    }
    this.logoutSubscription = subscribe(this.context, LogoutMC, 
        (message) => { this.handlelogoutMessage(message); },
        {scope: APPLICATION_SCOPE});
  }

  handlelogoutMessage(message) {       
    console.log('My post comp - received logout message : '+ JSON.stringify(message));        
    this.isVisible = false;
  }

  handleuserMyPostMessage(message) {       
    console.log('My post comp - received USERMC message : '+ JSON.stringify(message));        
    this.isVisible = message.recordData.isMyPost;
  }
}