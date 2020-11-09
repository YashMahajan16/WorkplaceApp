public class MyWorkplceApp_ApexHelperController {

    @AuraEnabled
    public static User getUserInfo(){
        User u = [select id,Name from User where id =: userInfo.getUserId()];
        return u;
    }
}