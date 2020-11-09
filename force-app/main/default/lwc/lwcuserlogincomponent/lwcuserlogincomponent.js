import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { createMessageContext, publish} from 'lightning/messageService';

import getUserLogins from '@salesforce/apex/Workplace_UserLoginController.getUserLogins';
import markCurrentUser from '@salesforce/apex/Workplace_UserLoginController.markCurrentUser';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";
import USERCREDMC from "@salesforce/messageChannel/CredMessageChannel__c";

let i=0;
export default class Lwcuserlogincomponent extends NavigationMixin(LightningElement) {

    @track userIds = [];
    @track value = '';
    selectedItemValue;
    context = createMessageContext();

    constructor(){
        super();
        const message = { 
            recordId : this.selectedItemValue,
            recordData : { value: true }};
        publish(this.context, POSTDATAMC, message);
        console.log('Message published for logged in user: ' + JSON.stringify(message));
    }

    // fetching active users in org and loadiing the values in combo-box
    @wire(getUserLogins)
    loginUsers({ error, data }) {
        if (data) {
            for(i=0; i < data.length; i++) {
                console.log('data is : ' + JSON.stringify(data[i]));
                this.userIds = [...this.userIds ,{value: data[i].Id , label: data[i].User_Name__c}];                                   
            }                
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

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

        console.log('Navigating to main page');
        console.log('User id is : ' + this.selectedItemValue);

        //setting current user
        markCurrentUser({
            userId : this.selectedItemValue
        }).then(() => {
            console.log('Current user set successfully');
        }).catch(error => {
            console.log('there is some error : ' + error)
        });

        // redirect the user to landing page
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName : 'Workplace_Page'
            }
        });
    }
}