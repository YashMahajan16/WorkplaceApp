import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe, MessageContext }
    from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import fetchAllPosts from '@salesforce/apex/MyNewWorkplaceApp_GetPostsApexController.fetchAllPosts';
import savePost from '@salesforce/apex/MyNewWorkplaceApp_CrtePstApexController.savePost';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c";

export default class Workplacecreateandgetposts extends LightningElement {

    isVisible = false;

    @track imagesUploaded = [];
    @track currentUserId = '';
    @track currentUserName = '';

    // mapping of wire property to the apex controller method
    @wire(fetchAllPosts, {currentUserId : '$currentUserId'}) allPosts;

    // properties / to used for holding input text
    @track postMessage;

    //fields to work with message channel
    //userContext = createMessageContext();
    @wire(MessageContext) userContext;
    userSubscription = null;
    @track userReceivedMessage = '';

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

            //LogoutMC
            @wire(MessageContext) logoutContext;
            logoutSubscription = null;
            @track logoutReceivedMessage = '';

    constructor() {
        super();
        console.log('Initializing user view');    
    }

    // Code to subscribe the message
    connectedCallback() {
        console.log('Create and get post comp - Message received');
        this.subscribeUSERCREDMC();
        this.subscribePOSTDATAMC();
    }

    subscribeUSERCREDMC() {

        if (this.userSubscription) {
            return;
        }

        console.log('Message Subscription 1 - ' + this.userSubscription);
        this.userSubscription = subscribe(this.userContext, USERCREDMC,
                                          (message) => { 
                                              console.log('Create and get post comp - Catching user credentials');
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
   }
        
    handleUSERCREDMessage(message) {
        console.log('Create and get post comp - Received user credentials' + JSON.stringify(message));
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
        refreshApex(this.allPosts);
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
      console.log('Create and get post comp - received logout message : '+ JSON.stringify(message));        
      this.isVisible = false;
    }

    // code to handle the image upload
    handleImageUploaded(event) {

        console.log('file upload event called');
        if (event.target.files.length > 0) {
            for (var i = 0; i < event.target.files.length; i++) {
                let image = event.target.files[i];
                let reader = new FileReader();
                reader.onload = e => {
                    let base64 = 'base64,';
                    let content = reader.result.indexOf(base64) + base64.length;
                    let fileContents = reader.result.substring(content);
                    this.imagesUploaded.push({
                        PathOnClient: image.name,
                        Title: image.name,
                        VersionData: fileContents
                    });
                };
                reader.readAsDataURL(image);
                console.log('a file is uploaded');
                console.log(image.name);
            }
        }
    }

    // code to save new post
    createPost() {

        // reading input from UI and mapping to local variable
        this.postMessage = this.template.querySelector('lightning-input').value;
        
        console.log('Current user id is : ' + this.currentUserId + ' and user name is : ' + this.currentUserName);

        //call to apex controller method
        savePost({
            message : this.postMessage,
            userName : this.currentUserName,
            userId : this.currentUserId,
            files : this.imagesUploaded
        })
            .then(() => {
                this.showToastMessage('Success', 'Files uploaded', 'success');
                refreshApex(this.allPosts);
                console.log('apex refresh called');

                this.template.querySelector('lightning-input').value = '';             

                var input = this.template.querySelectorAll('lightning-input');
                input.forEach(function(element) {
                    element.value = '';            
                });
            })
            .catch(() => {
                this.showToastMessage('Error', 'Error uploading files', 'error');
            });
    }

    showToastMessage(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}