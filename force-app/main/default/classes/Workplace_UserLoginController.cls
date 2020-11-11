public with sharing class Workplace_UserLoginController {

    public class ProfilePicData {

        public string ProfilePicPath;
        public string Title;
        public Blob VersionData; 
        
    }

    @AuraEnabled(cacheable=true)
    public static List<User_Login_Detail__c> getUserLogins()
    {
        try {            
            System.debug('Fetching all users');
            List<User_Login_Detail__c> userLogins = [SELECT Id, User_Name__c, First_Name__c, Last_Name__c, 
                                                            Department__c, City__c, Profile_Picture_Path__c
                                                     FROM User_Login_Detail__c
                                                     ORDER BY User_Name__c];
        
            return userLogins;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static User_Login_Detail__c getCurrentUser(string userId)
    {
        try {            
            System.debug('Fetching current user');
            User_Login_Detail__c currentUser = [SELECT Id, User_Name__c, First_Name__c, Last_Name__c, 
                                                        Department__c, City__c, Profile_Picture_Path__c
                                                FROM User_Login_Detail__c
                                                WHERE Id =: userId];    
            return currentUser;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void logoutUser()
    {
        try {            
            List<User_Login_Detail__c> activeUsers = [SELECT Id, Is_Current_User__c
                                                        FROM User_Login_Detail__c];                                                
                                                
            for(User_Login_Detail__c user: activeUsers){
                    user.Is_Current_User__c = false;
            }
            update activeUsers;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateCurrentUser(String firstName, String lastName, string department, 
                                            string city, String userName, string userId,
                                            List<Map<string, Object>> profilePic) 
    {
        try {            
            System.debug('Updating user' + userId);
            User_Login_Detail__c exsistinguser = [SELECT Id, User_Name__c, First_Name__c, Last_Name__c, 
                                                        Department__c, City__c, Profile_Picture_Path__c
                                                FROM User_Login_Detail__c
                                                WHERE Id =: userId];
            
           //code to upload the profile pic in content version    
           
           System.debug('Number of image uploaded : ' + profilePic.size());
           string profilePicPath = '';
           List<ContentVersion> images = new List<ContentVersion>();
           for (Map<String, Object> file : profilePic) {
   
               String fileJson = JSON.serialize(file);
               ProfilePicData profilePicData = (ProfilePicData) JSON.deserialize(fileJson, ProfilePicData.class);
   
               ContentVersion contentVersionFile = new ContentVersion();
               contentVersionFile.PathOnClient = profilePicData.ProfilePicPath;
               contentVersionFile.Title = profilePicData.Title;
               contentVersionFile.VersionData = profilePicData.VersionData;
               images.add(contentVersionFile);
   
               System.debug('PathOnClient : ' + profilePicData.ProfilePicPath);

               Database.saveResult saveResult = Database.insert(images[0]);
               string picId = saveResult.getId();
    
               profilePicPath = 'https://yashmah16workplace-dev-ed--c.documentforce.com/' + 
                                        'sfc/servlet.shepherd/version/download/'+ picId;
           }

            exsistinguser.First_Name__c = firstName;
            exsistinguser.Last_Name__c = lastName;
            exsistinguser.Department__c = department;
            exsistinguser.City__c = city;     

            if (string.isNotBlank(profilePicPath) && string.isNotEmpty(profilePicPath)) {
                exsistinguser.Is_Profile_Pic_Uploaded__c = true;
                exsistinguser.Profile_Picture_Path__c = profilePicPath;
            }
            // else {
            //     exsistinguser.Is_Profile_Pic_Uploaded__c = false;
            //     exsistinguser.Profile_Picture_Path__c = profilePicPath;
            // }

            update exsistinguser;
        } 
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}