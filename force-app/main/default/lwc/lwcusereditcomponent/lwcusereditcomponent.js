import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe, publish } 
    from 'lightning/messageService';

import USERMC from "@salesforce/messageChannel/UserMessageChannel__c";
import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';
import updateCurrentUser from '@salesforce/apex/Workplace_UserLoginController.updateCurrentUser';

export default class Lwcusereditcomponent extends LightningElement {

    @track isCurrentUserEdit = false;
    @track id = '';
    @track fName = '';
    @track lName = '';
    @track department = '';
    @track city = '';
    @track userName = '';
    @track profilePicPath = '';

    @track picUpload = [];

    isEdit = false;

    @wire(getCurrentUser) currentUser;

    // fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';


    // code to handle the lightning message
    connectedCallback(){
        console.log('User Cred received');
        this.subscribeMC();
    }

    subscribeMC() {
        refreshApex(this.currentUser);
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, USERMC, 
            (message) => { this.handleMessage(message); },
            {scope: APPLICATION_SCOPE});
     }

     handleMessage(message) {       
        console.log('received cred message:::'+JSON.stringify(message));        
        this.isEdit = message.recordData.value;
    }

    // setting the input fields
    edit(){

        this.id = this.currentUser.data.Id;
        this.fName = this.currentUser.data.First_Name__c;
        this.lName = this.currentUser.data.Last_Name__c;
        this.department = this.currentUser.data.Department__c;
        this.city = this.currentUser.data.City__c;
        this.userName = this.currentUser.data.User_Name__c;
        this.profilePicPath = this.currentUser.data.Profile_Picture_Path__c;

        console.log('Profile pic path is : ' + this.currentUser.data.Profile_Picture_Path__c);
        this.isCurrentUserEdit = true;
        refreshApex(this.currentUser);
    }


    uploadProfilePic(event){

        console.log('Pic upload called');
        if (event.target.files.length > 0) {
            for (var i = 0; i < event.target.files.length; i++) {
                let image = event.target.files[i];
                let reader = new FileReader();
                reader.onload = e => {
                    let base64 = 'base64,';
                    let content = reader.result.indexOf(base64) + base64.length;
                    let fileContents = reader.result.substring(content);
                    this.picUpload.push({
                        ProfilePicPath: image.name,
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


    // call to user update
    save(){

        var inputfName = '';
        var inputlName = '';
        var inputDepartment = '';
        var inputCity = '';

        var input = this.template.querySelectorAll('lightning-input');
        input.forEach(function(element) {
            if(element.name == "inputFirstName")
                inputfName = element.value;
            if(element.name == "inputLastName")
                inputlName = element.value;
            if(element.name == "inputDepartment")
                inputDepartment = element.value;
            if(element.name == "inputCity")            
                inputCity = element.value;               
        });

        // saving the updated values to the database
        updateCurrentUser({ firstName : inputfName, 
                            lastName : inputlName, 
                            department : inputDepartment, 
                            city : inputCity, 
                            userName : this.userName, 
                            userId : this.id,
                            profilePic : this.picUpload
                        }).then(() => {

                            //code to publish the message
                            const message = { 
                                recordId : 'user profile update',
                                recordData : { value: true }};
                            publish(this.context, POSTDATAMC, message);

                            const successEvent = new ShowToastEvent({
                                "title": "Success!",
                                "message": "User updated successfully!",
                                "variant": "success" 
                            });
                            this.dispatchEvent(successEvent);
                            refreshApex(this.currentUser);
                        }).catch(error => console.log('there is some error : ' + error));

       this.isCurrentUserEdit = false;
    }
}