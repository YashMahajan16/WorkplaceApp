import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';

import fetchTrendingPosts from '@salesforce/apex/MyNewWorkplaceApp_TrendingApexContrller.fetchTrendingPosts'

import { createMessageContext, releaseMessageContext, APPLICATION_SCOPE, subscribe, unsubscribe } 
    from 'lightning/messageService';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

export default class Workplacetrendingpostcomponent extends LightningElement {

    //fields to work with message channel
    context = createMessageContext();
    subscription = null;
    @track receivedMessage = '';

    //wire connection to fetch the apex data
    @wire(fetchTrendingPosts) topFeeds;

    constructor(){
        super();
        console.log('Calling apex controller');
    }    

    connectedCallback(){
        console.log('Message received');
        this.subscribeMC();
    }

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