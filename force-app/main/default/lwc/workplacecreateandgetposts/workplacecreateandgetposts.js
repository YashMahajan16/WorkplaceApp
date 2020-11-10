import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe }
    from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import fetchAllPosts from '@salesforce/apex/MyNewWorkplaceApp_GetPostsApexController.fetchAllPosts';
//import initializeUserView from '@salesforce/apex/MyNewWorkplaceApp_GetPostsApexController.initializeUserView';
import savePost from '@salesforce/apex/MyNewWorkplaceApp_CrtePstApexController.savePost';
import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";

export default class Workplacecreateandgetposts extends LightningElement {

    @track imagesUploaded = [];
    @track currentUserId = '';
    @track currentUserName = '';

    //fields to work with message channel
    userContext = createMessageContext();
    userSubscription = null;
    @track userReceivedMessage = '';

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

    constructor() {
        super();
        console.log('Initializing user view');
        //initializeUserView();
        //this.subscribeUSERCREDMC();        
    }

    // Code to subscribe the message
    connectedCallback() {
        console.log('Message received');
        this.subscribeUSERCREDMC();
        this.subscribePOSTDATAMC();
    }

    subscribeUSERCREDMC() {
        // if (this.userSubscription) {
        //     return;
        // }
        console.log('Catching user credentials - initial');
        this.userSubscription = subscribe(this.userContext, USERCREDMC,
                                            (message) => { 
                                                console.log('Catching user credentials' + JSON.stringify(message));
                                                this.handleUSERCREDMessage(message); 
                                            },
                                            { scope: APPLICATION_SCOPE });
        }
        
    handleUSERCREDMessage(message) {
        console.log('Received user credentials' + JSON.stringify(message));
        this.currentUserId = message.userrecordId;
        this.currentUserName = message.userrecordData.value;
    }

    disconnectedCallback() {
        console.log('Releasing user credentials message');
        releaseMessageContext(this.userContext);
    }
    //@wire(getCurrentUser) currentUser;

    // mapping of wire property to the apex controller method
    @wire(fetchAllPosts) allPosts;

    updatePosts;

    // properties / to used for holding input text
    @track postMessage;

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
        console.log('Received post message :' + JSON.stringify(message));

        refreshApex(this.allPosts);
        console.log('Apex refreshed');
    }
}