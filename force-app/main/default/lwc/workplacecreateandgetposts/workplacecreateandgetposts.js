import { LightningElement, wire, track, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe }
    from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import fetchAllPosts from '@salesforce/apex/MyNewWorkplaceApp_GetPostsApexController.fetchAllPosts';
import initializeUserView from '@salesforce/apex/MyNewWorkplaceApp_GetPostsApexController.initializeUserView';
import savePost from '@salesforce/apex/MyNewWorkplaceApp_CrtePstApexController.savePost';
import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

export default class Workplacecreateandgetposts extends LightningElement {

    @track imagesUploaded = [];

    //fields to work with message channel
    context = createMessageContext();

    constructor() {
        super();
        console.log('Initializing user view');
        initializeUserView();
    }

    @wire(getCurrentUser) currentUser;

    subscription = null;
    @track receivedMessage = '';

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
        console.log('user name is : ' + this.currentUser.data.User_Name__c);

        //call to apex controller method
        savePost({
            message : this.postMessage,
            userName : this.currentUser.data.User_Name__c,
            userId : this.currentUser.data.Id,
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

    // Code to subscribe the message
    connectedCallback() {
        console.log('Message received');
        this.subscribeMC();
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, POSTDATAMC,
            (message) => { this.handleMessage(message); },
            { scope: APPLICATION_SCOPE });
    }

    handleMessage(message) {
        console.log('received message:::' + JSON.stringify(message));

        refreshApex(this.allPosts);
        console.log('Apex refreshed');
    }
}