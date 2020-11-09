public with sharing class MyNewWorkplace_CurrentUserController {

    @AuraEnabled
    public static User getUserInfo(){
        User currentUser = [select Id,FirstName, LastName, Department, City from User 
                            where id =: userInfo.getUserId()];
        return currentUser;
    }

    @AuraEnabled
    public static void updateUserInfo(string fName, string lName, 
                                        string department, string city){

        System.debug('In apex controller');
        User oldUser = [select Id,FirstName, LastName, Department, City from User 
                        where id =: userInfo.getUserId()];
        
        oldUser.FirstName = fName;
        oldUser.LastName = lName;
        oldUser.Department = department;
        oldUser.City = city;
        
        update oldUser;
    }
}