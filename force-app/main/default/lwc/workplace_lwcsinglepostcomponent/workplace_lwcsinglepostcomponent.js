import { api, LightningElement, wire, track } from 'lwc';
import { createMessageContext, publish} from 'lightning/messageService';

import updateLikesData from '@salesforce/apex/MyNewWorkplaceApp_UpdatePostController.updateLikesData';
import updateCommentsData from '@salesforce/apex/MyNewWorkplaceApp_UpdatePostController.updateCommentsData';
import deletePost from '@salesforce/apex/Workplace_MyPostsController.deletePost'

import POSTDATAMC from "@salesforce/messageChannel/PostDataMessageChannel__c";

export default class Workplace_lwcsinglepostcomponent extends LightningElement {

    // property to hold single post data, set from parent component
    @api post;
    @api islikedbycurrentuser;
    @api likeoldvalue;
    @api recordid;
    @api currentuserid;
    @api ismypost = false;

    // variable to hold data for like and comments button state
    @track likeState = false;
    @track commentState = false;
    @track isDisliked = false;

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

         console.log('Has user disliked the post ? ' + isTempDisliked);
         this.isDisliked = isTempDisliked;


        // call to apex controller method
        updateLikesData({
            recordId : this.recordid,
            currentUserId : this.currentuserid,
            isDisliked : isTempDisliked
            }).then(() => {

              //code to publish the message
              const message = { 
                recordId : this.recordid,
                recordData : { value: true }};
                publish(this.context, POSTDATAMC, message);
        }).catch(error => console.log('there is some error : ' + error));
    }

    isCommented = false;
    comment = '';
    handleCommentButtonClick() {
        
        this.commentState = !this.commentState;
        this.isCommented = true;    
    }

    saveComment(event) {
        
        event.preventDefault();
        this.commentState = !this.commentState;

        var inputComm = '';
        var input = this.template.querySelectorAll('lightning-input');
        input.forEach(function(element) {
            if(element.name == "inputComment")
            inputComm = element.value;            
        });

        //code to call apex
        updateCommentsData({
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
            console.log('Message -> User commented on post : ' + JSON.stringify(message));

            // code to reset the fields
            input.forEach(function(element) {
                if(element.name == "inputComment")
                    element.value = '';            
            });

            this.isCommented = false;
        })
        .catch(() => console.log('there is some error'));     
    }

    handleDeleteButtonClick(){

      deletePost({ postId : this.recordid
                }).then(() => {
              //code to publish the message
              const message = { 
                recordId : this.recordid,
                recordData : { value: true }};
                publish(this.context, POSTDATAMC, message);
                }).catch(() => console.log('there is some error')); 
    }
}