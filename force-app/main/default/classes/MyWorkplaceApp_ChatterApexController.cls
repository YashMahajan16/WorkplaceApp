public class MyWorkplaceApp_ChatterApexController {

    @AuraEnabled
    public static string getFeed(){
        
        //Code to call REST api for getting feeds for company
        String repsonse;
       	Http http = new Http();
        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setHeader('Authorization','OAuth '+ 
                              '00D2w00000FZNfc!ARgAQMMCNm7qKCc7tArCEG.LV1852JVfhK.n9YKDlp0ZJrpq9MeC0hgf9v6.3gYBCljFnK2Wc7.X4GRGs0_PnrOEgyP1jc6R');
     	httpRequest.setHeader('Authorization', 'Bearer ' +
                              '00D2w00000FZNfc!ARgAQMMCNm7qKCc7tArCEG.LV1852JVfhK.n9YKDlp0ZJrpq9MeC0hgf9v6.3gYBCljFnK2Wc7.X4GRGs0_PnrOEgyP1jc6R'); 
        //'callout:Chatter_Cred/' +
        httpRequest.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() +
                                '/services/data/v49.0/chatter/feeds/company/feed-elements');
  		httpRequest.setMethod('GET');
        
        system.debug(UserInfo.getSessionId());
        
        HttpResponse httpResponse = http.send(httpRequest);
        
        system.debug(httpResponse.getBody());
        
        //Check if request is successful
        if (httpResponse.getStatusCode() == 200 ) {  
           		repsonse = httpResponse.getBody();  
        } 
        else{
            throw new CalloutException(httpResponse.getBody());  
        }
        return repsonse;
    }
    
    @AuraEnabled
    public static void postFeed(string postText){
        
        //Code to call REST api for getting feeds for company
        String repsonse;
        string body =            
            '{' +
      		' "body" : {' +
          		'"messageSegments" : [' +
            	'{ ' +
                	'"type" : "Text", '+
                	'"text" : "When should we meet for release planning? " '+
             	'}]' +
           	'},' +
       		'"feedElementType" : "FeedItem",'+
       		'"subjectId" : "005D00000016Qxp" '+
    	'}';           
            
       	Http http = new Http();
        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setHeader('Content-Type','application/json;charset=UTF-8');
        httpRequest.setHeader('Authorization','OAuth '+ 
                              '00D2w00000FZNfc!ARgAQMMCNm7qKCc7tArCEG.LV1852JVfhK.n9YKDlp0ZJrpq9MeC0hgf9v6.3gYBCljFnK2Wc7.X4GRGs0_PnrOEgyP1jc6R');
     	httpRequest.setHeader('Authorization', 'Bearer ' +
                              '00D2w00000FZNfc!ARgAQMMCNm7qKCc7tArCEG.LV1852JVfhK.n9YKDlp0ZJrpq9MeC0hgf9v6.3gYBCljFnK2Wc7.X4GRGs0_PnrOEgyP1jc6R'); 
        httpRequest.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() +
                                '/services/data/v49.0/chatter/feeds/company/feed-elements');
  		httpRequest.setMethod('POST');        
        httpRequest.setBody(body);
        
        system.debug(UserInfo.getSessionId());
        
        HttpResponse httpResponse = http.send(httpRequest);
        
        system.debug(httpResponse.getBody());
        
        //Check if request is successful
        if (httpResponse.getStatusCode() == 200 ) {  
            	system.debug('Feed created successfully');
           		repsonse = httpResponse.getBody();  
        } 
        else{
            throw new CalloutException(httpResponse.getBody());  
        }
    }
}