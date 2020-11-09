public class MyNewWorkplaceApp_CrtePstApexController {

    //class to hold file related data
    public class relatedFile {
        public String PathOnClient;
        public String Title;
        public Blob VersionData;
    }
            
    @AuraEnabled
    public static void savePost(string message, string userName, string userId, List<Map<String, Object>> files){

        System.debug('Number of image uploaded : ' + files.size());
        string imageId = '';
        List<ContentVersion> images = new List<ContentVersion>();
        for (Map<String, Object> file : files) {

            String fileJson = JSON.serialize(file);
            relatedFile relatedDocument = (relatedFile) JSON.deserialize(fileJson, relatedFile.class);

            ContentVersion contentVersionFile = new ContentVersion();
            contentVersionFile.PathOnClient = relatedDocument.PathOnClient;
            contentVersionFile.Title = relatedDocument.Title;
            contentVersionFile.VersionData = relatedDocument.VersionData;
            images.add(contentVersionFile);

            System.debug('PathOnClient : ' + relatedDocument.PathOnClient);
            System.debug('Title : ' + relatedDocument.Title);

            Database.saveResult saveResult = Database.insert(images[0]);
            imageId = saveResult.getId();
        }

        System.debug('File id is : ' + imageId);
        system.debug(message);
        system.debug(userName);
        system.debug(userId);
        
        Post__c newPost = new Post__c();
        newPost.Post_Owner__C = userName;
        newPost.Post_User__c = userId;

        if(!String.isBlank(message)){
            newPost.Message__c = message; 
        }
        else {
            newPost.Message__c = ' ';
        }
         
        newPost.Likes_Count__c = 0;
        
       if(!String.isBlank(imageId) || !String.isEmpty(imageId)){
                       
            newPost.Is_Image_Attached__c = true;
            newPost.Image_Path__c =  'https://yashmah16workplace-dev-ed--c.documentforce.com/' + 
                                      'sfc/servlet.shepherd/version/download/'+ imageId;   
            System.debug(newPost.Image_Path__c);    
        }               
        else{
            newPost.Is_Image_Attached__c = false;
            newPost.Image_Path__c = ''; 
        } 
        insert newPost;
    }
}