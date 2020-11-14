public with sharing class Workplace_MyPostsController {

    public Workplace_MyPostsController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Post__c> getMyPosts(string userId){

      System.debug('Current user is : ' + userId);
        
      List<Post__c> myPosts = new List<Post__c>();
      myPosts = [SELECT Id, Name, Message__c, Relative_Datetime__c, Post_Owner__c, Is_Image_Attached__c,
                          Like_Old_value__c, Likes_Count__c, Comments_Count__c, 
                          Is_Liked_By_Current_User__c, Image_Path__c, Post_User__r.Profile_Picture_Path__c,
                          Post_User__r.Is_Profile_Pic_Uploaded__c,
                          (SELECT Liked_by_Id__c 
                              FROM Likes__r 
                              WHERE Liked_by_Id__c =: userId),
                          (SELECT Id, Comment_Message__c, Comment_User__r.User_Name__c, Relative_Time__c 
                              FROM Comments__r 
                              ORDER BY CreatedDate DESC)
                  FROM Post__c
                  WHERE Post_User__r.Id =: userId
                  ORDER BY CreatedDate DESC];
      
      for(Post__c post: myPosts){
                    
          List<string> userIds = new List<string>();
          for(Likes__c likedBy: post.Likes__r){              
              userIds.add(likedBy.Liked_by_Id__c);                
          }            
          
          if(userIds.contains(userId))
              post.Like_Old_value__c = true;
          else
              post.Like_Old_value__c = false;
      }
      return myPosts;  

    }

    @AuraEnabled
    public static void deletePost(string postId){
      try {

        Post__c postToBeDeleted = [SELECT Id, Name
                                    FROM Post__c 
                                    WHERE Id =: postId];

        delete postToBeDeleted;
        
      } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
      }
    }
}
