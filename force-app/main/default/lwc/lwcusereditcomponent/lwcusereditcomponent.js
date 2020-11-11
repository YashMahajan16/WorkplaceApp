import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe, publish, 
          MessageContext } 
    from 'lightning/messageService';

import USERMC from "@salesforce/messageChannel/UserMessageChannel__c";
import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c"

import updateCurrentUser from '@salesforce/apex/Workplace_UserLoginController.updateCurrentUser';
import getCurrentUser from '@salesforce/apex/Workplace_UserLoginController.getCurrentUser';

export default class Lwcusereditcomponent extends LightningElement {

    isVisible = false;
    
    @track isCurrentUserEdit = false;
    @track id = '';
    @track fName = '';
    @track lName = '';
    @track department = '';
    @track city = '';
    @track userName = '';
    @track profilePicPath = '';

    @track picUpload = [];

    @wire(getCurrentUser, {userId : '$id'}) currentUser;

    isEdit = false;

    // fields to work with USERMC message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';


    //USERCREDMC
    @wire(MessageContext) userContext;
    userSubscription = null;
    @track userReceivedMessage = '';
    
    //LogoutMC
    @wire(MessageContext) logoutContext;
    logoutSubscription = null;
    @track logoutReceivedMessage = '';

    // code to handle the lightning message
    connectedCallback(){
        console.log('User edit comp - User Cred received');
        this.subscribeUSERCREDMC();
        this.subscribeMC();
    }

    subscribeUSERCREDMC() {

      if (this.userSubscription) {
          return;
      }

      console.log('Message Subscription 1 - ' + this.userSubscription);
      this.userSubscription = subscribe(this.userContext, USERCREDMC,
                                        (message) => { 
                                            console.log('User edit comp - Catching user credentials');
                                              this.handleUSERCREDMessage(message); 
                                          },
                                          { scope: APPLICATION_SCOPE });

      console.log('Message Subscription 2 - ' + this.subscription);
      if (this.subscription) {
          return;
      }
      this.subscription = subscribe(this.context, USERMC,
      (message) => { this.handleMessage(message); },
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
        
      console.log('User edit comp - Received user credentials' + JSON.stringify(message));
      this.id = message.userRecordId;
      this.isVisible = message.userRecordData.isLoggedIn; 

      refreshApex(this.currentUser);        
    }

    subscribeMC() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.context, USERMC, 
            (message) => { this.handleMessage(message); },
            {scope: APPLICATION_SCOPE});
     }

     handleMessage(message) {       
        console.log('User edit comp - received cred message : '+ JSON.stringify(message));        
        this.isEdit = message.recordData.value;
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
      console.log('User edit comp - received logout message : '+ JSON.stringify(message));        
      this.isVisible = false;
  }

    // setting the input fields
    edit(){

      console.log('Edit button clicked');

      this.id = this.currentUser.data.Id;
      this.fName = this.currentUser.data.First_Name__c;
      this.lName = this.currentUser.data.Last_Name__c;
      this.department = this.currentUser.data.Department__c;
      this.city = this.currentUser.data.City__c;
      this.profilePicPath = this.currentUser.data.Profile_Picture_Path__c;

      console.log('id is : ' + this.currentUser.data.Id);
      console.log('fName is : ' + this.fName);
      console.log('lName is : ' + this.lName);
      console.log('department is : ' + this.department);
      console.log('city is : ' + this.city);

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

    pubContext = createMessageContext();

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
                          console.log('USer edit comp - refresh apex');
                          refreshApex(this.currentUser);
                            //code to publish the message
                            const message = { 
                                recordId : 'user profile update',
                                recordData : { value: true }};
                            publish(this.pubContext, POSTDATAMC, message);

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