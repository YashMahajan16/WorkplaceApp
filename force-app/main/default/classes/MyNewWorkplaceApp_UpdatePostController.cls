public class MyNewWorkplaceApp_UpdatePostController {

    @AuraEnabled
    public static void updateLikesData(string recordId, string currentUserId, boolean isDisliked){

        System.debug('Post id is : ' + recordId);
        System.debug('User id is : ' + currentUserId);
        system.debug('Is post disliked ? : ' + isDisliked);
        
        if(isDisliked == false){

            Likes__c newLike = new Likes__c();
            newLike.Liked_by_Id__c = currentUserId;	
            newLike.Post__c = recordId;
            
            insert newLike;   
                  
            Post__C oldPost = [SELECT Id, Likes_Count__c, Is_Liked_By_Current_User__c, Like_Old_value__c 
                                FROM Post__c
                                WHERE Id =: recordId];
            
            oldPost.Likes_Count__c = oldPost.Likes_Count__c + 1;
            oldPost.Is_Liked_By_Current_User__c = true;
            oldPost.Like_Old_value__c = true;
            
            update oldPost;
        }
        else{
            system.debug('Is post disliked ? : ' + isDisliked);
            system.debug('User id is : ' + currentUserId);
            system.debug('Record id is : ' + recordId);

            List<Likes__c> oldLike = [SELECT Id 
                                FROM Likes__c
                                WHERE Liked_by_Id__c =: currentUserId
                               	AND Post__c =: recordId];            
            
            delete oldLike;   
                  
            Post__C oldPost = [SELECT Id, Likes_Count__c, Is_Liked_By_Current_User__c, Like_Old_value__c 
                                FROM Post__c
                                WHERE Id =: recordId];
            
            oldPost.Likes_Count__c = oldPost.Likes_Count__c - 1;
            oldPost.Is_Liked_By_Current_User__c = false;
            oldPost.Like_Old_value__c = false;
            
            update oldPost;
        }
    }

    @AuraEnabled
    public static void updateCommentsData(string recordId, string message, string currentuserid){

        System.debug(currentuserid);
        Comment__c newComment = new Comment__c();
        newComment.Comment_Message__c = message;
        newComment.Post__c = recordId;
        newComment.Comment_User__c = currentuserid;

        insert newComment;
    }
}