public class MyNewWorkplaceApp_GetPostsApexController {
    
    @AuraEnabled(cacheable=true)
    public static List<Post__c> fetchAllPosts(string currentUserId){
        
        System.debug('Current user is : ' + currentUserId);
        
        List<Post__c> allPosts = new List<Post__c>();
        allPosts = [SELECT Id, Name, Message__c, Relative_Datetime__c, Post_Owner__c, Is_Image_Attached__c,
                            Like_Old_value__c, Likes_Count__c, Comments_Count__c, 
                            Is_Liked_By_Current_User__c, Image_Path__c, Post_User__r.Profile_Picture_Path__c,
                            Post_User__r.Is_Profile_Pic_Uploaded__c,
                            (SELECT Liked_by_Id__c 
                                FROM Likes__r 
                                WHERE Liked_by_Id__c =: currentUserId),
                            (SELECT Id, Comment_Message__c, Comment_User__r.User_Name__c, Relative_Time__c 
                                FROM Comments__r 
                                ORDER BY CreatedDate DESC)
                    FROM Post__c
                    ORDER BY CreatedDate DESC];
        
        for(Post__c post: allPosts){
            
            system.debug('Number of users liked: ' + post.Likes__r.size());
            
            List<string> userIds = new List<string>();
            for(Likes__c likedBy: post.Likes__r){              
                userIds.add(likedBy.Liked_by_Id__c);                
            }            
            
            if(userIds.contains(currentUserId))
                post.Like_Old_value__c = true;
            else
                post.Like_Old_value__c = false;
        }
        return allPosts;        
    }
}