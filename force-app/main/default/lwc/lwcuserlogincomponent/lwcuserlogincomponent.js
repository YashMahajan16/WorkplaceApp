import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe, publish, 
          MessageContext} from 'lightning/messageService';

import getUserLogins from '@salesforce/apex/Workplace_UserLoginController.getUserLogins';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";
import LogoutMC from "@salesforce/messageChannel/UserLogoutMessageChannel__c";

let i=0;
export default class Lwcuserlogincomponent extends NavigationMixin(LightningElement) {

    isVisible = true;

    @track userIds = [];
    @track value = '';
    @track username = '';
    @track usermap = [];

    selectedItemValue;
    context = createMessageContext();
    userContext = createMessageContext();

    //LogoutMC
    @wire(MessageContext) logoutContext;
    logoutSubscription = null;
    @track logoutReceivedMessage = '';

    // Code to subscribe the message
    connectedCallback() {
      console.log('Login comp - Message received');
      this.subscribeLogoutMC();
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
      console.log('Login comp - received logout message : '+ JSON.stringify(message));        
      this.isVisible = true;
    }

    constructor(){
        super();
        this.usermap = new Map();
        const message = { 
            recordId : this.selectedItemValue,
            recordData : { value: true }};
        publish(this.context, POSTDATAMC, message);
        console.log('Message published for logged in user: ' + JSON.stringify(message));
    }

    // fetching active users in org and loading the values in combo-box
    @wire(getUserLogins)
    loginUsers({ error, data }) {
        if (data) {
            for(i=0; i < data.length; i++) {
                console.log('data is : ' + JSON.stringify(data[i]));
                this.userIds = [...this.userIds ,{value: data[i].Id , label: data[i].User_Name__c}];   
                
                //adding values to map
                this.usermap.set(data[i].Id, { 
                  UserName : data[i].User_Name__c,
                  FirstName : data[i].First_Name__c, 
                  LastName : data[i].Last_Name__c, 
                  Department : data[i].Department__c, 
                  City : data[i].City__c, 
                  ProfilePicPath : data[i].Profile_Picture_Path__c
                 });
            }
            console.log(this.usermap.keys()); 
            console.log(this.usermap.values());                
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    //values for combo-box
    get statusOptions() {
        console.log(this.userIds);
            return this.userIds;
    }

    // value change event for the combo-box
    handleChange(event) {
        const selectedOption = event.detail.value;
        console.log('selectedOption = ' + selectedOption);        
        this.selectedItemValue = event.detail.value;
    }

    // login event, redirect 
    userLogin(){

        this.isVisible = false;
        console.log('User id is : ' + this.selectedItemValue);

        let mapValue = this.usermap.get(this.selectedItemValue);

        console.log(mapValue.UserName);
        console.log(mapValue.FirstName);
        console.log(mapValue.LastName);
        console.log(mapValue.Department);
        console.log(mapValue.City);
        console.log(mapValue.ProfilePicPath);

        //publish message to transfer user details
        const userMessage = { 
            userRecordId : this.selectedItemValue,
            userRecordData : { isLoggedIn : true, 
                               userName : mapValue.UserName,
                               firstName : mapValue.FirstName,
                               lastName : mapValue.LastName,
                               department : mapValue.Department,
                               city : mapValue.City,
                               profilePath : mapValue.ProfilePicPath
                             }
        };
        publish(this.userContext, USERCREDMC, userMessage);
        console.log('Message -> Publishing user credentials ' + JSON.stringify(userMessage));        
    }
}