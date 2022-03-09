# How to Update Sandbox Punchout Scripts - 01202022


## UPDATE TO TBA OAUTH:
SuiteAnswers: https://netsuite.custhelp.com/app/answers/detail/a_id/80724/kw/tba%20suitescript


1. Download & Copy `oauth.js` and `crypto.js` to /SuiteScripts/ directory in File Cabinet

2. in your own code editor, Create `secret.js` file (per SuiteAnswer's article)

    ```js
    define([], function() {
        return {
            consumer: {
                public: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab',
                secret: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab'
            },
            token: {
                public: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab',
                secret: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890ab'
            },
            realm: '1234567'
        }
    }); // realm == ACCOUNT_ID
    ```

3. Setup Integration Record

    SuiteAnswers: https://netsuite.custhelp.com/app/answers/detail/a_id/82077

    1. (SB2-Full Access) Setup > Integration > Manage Integration > New
    2. [field]* Name: HDI-Punchout
    3. [checkbox]* Token-based Authentication (TBA)
    4. Save
    5. Copy/Paste values to `secret.js`


4. Setup Tokens
    1. (SB2-Mod. Full Access) Setup > Users/Roles > Access Tokens > New

    2. Enter details
        - [select]* APPLICATION NAME: *select HDI-Punchout*
        - [select]* USER: *select my name*
        - [select]* ROLE: *select Mod. Full Access*
        - TOKEN NAME*: *auto-generated*
    3. Save
    5. Copy/Paste values to `secret.js`



5. Update `realm` value in `secret.js`. 

    ```js
    realm: '3519184_SB2'
    ```

5. Save `secret.js` locally then load to /SuiteScripts/ in File Cabinet


===

*(proceed to next section)*

===

## UPDATE FILE:

**Note:** *you only need to update the SUITElet - /SuiteScripts/HDI/QW_HDI_Punchout_SUITElet.js*

===

1. log into SB2
2. download the SUITElet
3. SEARCH/REPLACE the string `customer.h` --> `testb2b-sb2.h`
    - there will be 4 places
    - only update 3/4 (skip the item api lookup for the manufacturer..not necessary)
4. SEARCH/REPLACE the code 

    ```js
    xmlstr = options.request.body;
    ```

    ---> replace with code below

    
    ```js
    if (options.request.parameters['isTest']) {
        xmlstr = '<?xml version = \'1.0\' encoding = \'UTF-8\'?> <!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.1.007/cXML.dtd"> <cXML version="1.1.007" xml:lang="en-US" payloadID="20220121055340.12345.211011@osn.com" timestamp="2022-01-21T05:53:40+00:00"> <Header> <From> <Credential domain="DUNS"> <Identity>94-3043208</Identity> </Credential> </From> <To> <Credential domain="DUNS"> <Identity>94-3043208</Identity> </Credential> </To> <Sender> <Credential domain="Oracle Exchange Test 6.2.4"> <Identity>testexchange.oracle.com</Identity> <SharedSecret>Experian&amp;Jan2k18</SharedSecret> </Credential> <UserAgent>Oracle Exchange Test 6.2.4</UserAgent> </Sender> </Header> <Request> <PunchOutSetupRequest operation="create"> <BuyerCookie>12345678</BuyerCookie> <Extrinsic name="User">qwatts@hellodirect.com</Extrinsic> <BrowserFormPost> <URL>https://osn.com</URL> </BrowserFormPost> <Contact> <Name xml:lang="en-US">null Quentin null Watts</Name> <Email>qwatts@hellodirect.com</Email> </Contact> <SupplierSetup> <URL>https://3519184-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&amp;deploy=1&amp;compid=3519184_SB2&amp;h=ca19c67769bbc3856bf7&amp;requestId=1</URL> </SupplierSetup> </PunchOutSetupRequest> </Request> </cXML>';
    } else {
        xmlstr = options.request.body;
    } 
    ```

5. Update the `define()` statement to include the following:
    
    ```js
    define([... '/SuiteScripts/oauth', '/SuiteScripts/secret'], function(... oauth, secret) 
    ```

6. SEARCH for the comment `//Function: https.get RESTlet` .
    
    Replace the `doGetRestlet()` function
        
    ```js    
    function doGetRestlet(objParams)
        {
        var url = urlMod.resolveScript({
            scriptId: 'customscript_hdi_punchout_restlet',
            deploymentId: 'customdeploy_hdi_punchout_restlet',
            returnExternalUrl: true,
            params: objParams
        });
        url = url.replace(/\+/g, "%20"); //for some reason a space is replaced with a "+" instead of "%20" .. this fixes that..

        //define method
        var method = 'GET';
        //oauth headers
        var headers = oauth.getHeaders({
            url:         url,
            method:      method,
            tokenKey:    secret.token.public,
            tokenSecret: secret.token.secret
        });
        //push content-type to headers
        headers['Content-Type'] = 'application/json';

        var response = https.get({
            url: url, 
            headers: headers
        });
        return response;
        }
    ``` 

6. Save `QW_HDI_Punchout_SUITElet.js` locally then load to /SuiteScripts/HDI/ in File Cabinet

===

## GENERATE TEST LINK:

1. test URL: copy from Customization > Scripting > Script Deployments : QW - Punchout SUITElet
    - append `&requestId=1&isTest=T`
    - for outside the compnay, only append `&requestId=1`
        - Internal example:
            ```
            https://3519184-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1&compid=3519184_SB2&h=ca19c67769bbc3856bf7&requestId=1&isTest=T
            ```
        - External example:
            ```
            https://3519184-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1&compid=3519184_SB2&h=ca19c67769bbc3856bf7&requestId=1 
            ```

    <!-- 
    for (SB2): https://3519184-sb2.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1&compid=3519184_SB2&h=ca19c67769bbc3856bf7&requestId=1&isTest=T 
    -->

    <!--
    for (SB3): https://3519184-sb3.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1&compid=3519184_SB3&h=f3c2f28c53c8b25533b6&requestId=1&isTest=T 
    -->

2. in NS, check the Script's execution logs
3. in NS, Check punchout logs afterward 

===

**Note:** Always remember to switch back to production after testing..(if updating live)...

    ```
    https://3519184.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=561&deploy=1&compid=3519184&h=e2556329e67b08aa2990&requestId=1
    ```

===

# END