import { api, LightningElement, wire, track } from 'lwc';
import { createMessageContext, publish} from 'lightning/messageService';

import UpdateSinglePostData from '@salesforce/apex/MyNewWorkplaceApp_UpdatePostController.UpdateSinglePostData';
import UpdateCommentsData from '@salesforce/apex/MyNewWorkplaceApp_UpdatePostController.UpdateCommentsData';

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

export default class Workplace_lwcsinglepostcomponent extends LightningElement {

    // property to hold single post data, set from parent component
    @api post;
    @api islikedbycurrentuser;
    @api likeoldvalue;
    @api recordid;
    @api currentuserid;

    // variable to hold data for like and comments button state
    @track likeState = false;
    @track commentState = false;

    @track isDisliked = false;
    @wire(UpdateSinglePostData, {recordId : '$recordid', isDisliked : false}) likesData;

    // properties / variables for message channel 
    context = createMessageContext();

    handleLikeButtonClick(event) {

        event.preventDefault();
        this.likeState = !this.likeoldvalue;

        console.log('record id is : ' + this.recordid);

        var isTempDisliked = new Boolean(false);

        if (this.likeoldvalue == false){
            isTempDisliked = false;
         }
         else if (this.likeoldvalue == true){
            isTempDisliked = true;
         }
         this.isDisliked = isTempDisliked;


        // call to apex controller method
        UpdateSinglePostData({
            recordId : this.recordid,
            isDisliked : isTempDisliked
            }).then(() => {
                    //code to publish the message
                    const message = { 
                        recordId : this.recordid,
                        recordData : { value: true }};
                    publish(this.context, POSTDATAMC, message);
                    console.log('Message published : ' + JSON.stringify(message));
        }).catch(error => console.log('there is some error : ' + error));


    }

    isCommented = false;
    comment = '';
    handleCommentButtonClick() {
        
        this.commentState = !this.commentState;
        this.isCommented = true;    
    }

    savePost(event) {
        
        event.preventDefault();
        this.commentState = !this.commentState;

        var inputComm = '';
        var input = this.template.querySelectorAll('lightning-input');
        input.forEach(function(element) {
            if(element.name == "inputComment")
            inputComm = element.value;            
        });

        //code to call apex
        UpdateCommentsData({
            recordId : this.recordid,
            message : inputComm,
            currentuserid : this.currentuserid
        }).then(() => {
            //code to publish the message
            const message = { 
                recordId : this.recordid,
                recordData : { value: true } 
            };
            publish(this.context, POSTDATAMC, message);
            console.log('Message published : ' + JSON.stringify(message));

            // code to reset the fields
            input.forEach(function(element) {
                if(element.name == "inputComment")
                    element.value = '';            
            });
        })
        .catch(() => console.log('there is some error'));     
    }
}