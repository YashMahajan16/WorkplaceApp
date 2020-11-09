public class MyNewWorkplaceApp_TrendingApexContrller {    
    
    @AuraEnabled(cacheable=true)
    public static List<Post__c> fetchTrendingPosts(){
        
        System.debug('fetching data');
        List<Post__c> allPosts = new List<Post__c>();
        allPosts = [SELECT Id, Name, Message__c, Likes_Count__c, Comments_Count__c, Post_Owner__c
                    From Post__c
                    ORDER BY Likes_Count__c DESC
                    LIMIT 5];

        System.debug(allPosts.size());
        return allPosts;
    }
}