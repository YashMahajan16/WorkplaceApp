public class MyNewWorkplaceApp_GetPostsApexController {

    @AuraEnabled
    public static void initializeUserView(){
        
        User_Login_Detail__c currentUser = [SELECT Id, User_Name__c
                                            FROM User_Login_Detail__c
                                            WHERE Is_Current_User__c = true]; 

        string currentUserId = currentUser.Id;
        System.debug('Current user is : ' + currentUserId);

        List<Post__c> allPosts = new List<Post__c>();
        allPosts = [SELECT Id, Name, Message__c, Relative_Datetime__c, Post_Owner__c, Is_Image_Attached__c,
                             Like_Old_value__c, Likes_Count__c, Comments_Count__c, 
                             Is_Liked_By_Current_User__c, Image_Path__c, Post_User__r.Profile_Picture_Path__c,
                             Post_User__r.Is_Profile_Pic_Uploaded__c,
                            (SELECT Liked_by_Id__c 
                             FROM Likes__r
                             WHERE Liked_by_Id__c =: currentUserId)
					FROM Post__c
                    ORDER BY CreatedDate DESC];
                    
        //code to check if post is liked by current user

        List<Post__c> currentUserPosts = new List<Post__c>();
        for(Post__c post: allPosts){
                        
            System.debug('Before update: ' + post.Is_Liked_By_Current_User__c);
            system.debug('Number of users liked: ' + post.Likes__r.size());

            List<string> userIds = new List<string>();
            for(Likes__c likedBy: post.Likes__r){              

                System.debug('Liked by: ' + likedBy.Liked_by_Id__c + 'Current user: ' + currentUserId);
                userIds.add(likedBy.Liked_by_Id__c);                
            }            

            System.debug('Is liked by user: ' + post.Is_Liked_By_Current_User__c);
            if(userIds.contains(currentUserId))
            {
                post.Is_Liked_By_Current_User__c = true;
                post.Like_Old_value__c = true;
                currentUserPosts.add(post);
            }
            else{
                post.Is_Liked_By_Current_User__c = false;
                post.Like_Old_value__c = false;
                currentUserPosts.add(post);
            }

            post.Is_Liked_By_Current_User__c = userIds.contains(currentUserId);
            System.debug('After update: ' + post.Is_Liked_By_Current_User__c);
        }

        update currentUserPosts;     
    }

    @AuraEnabled(cacheable=true)
    public static List<Post__c> fetchAllPosts(){
        
        System.debug('Connecting to database');
        User_Login_Detail__c currentUser = [SELECT Id, User_Name__c
                                            FROM User_Login_Detail__c
                                            WHERE Is_Current_User__c = true]; 

        string currentUserId = currentUser.Id;
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
        return allPosts;        
    }
}