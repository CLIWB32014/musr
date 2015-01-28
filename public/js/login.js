/**
 * Created by dan on 1/27/2015.
 */

var facebookAccessToken;
var googleAccessToken;
var userDeploydId;

function LoginFb() {
    FB.login(statusChangeCallback,
        {scope:'email, user_likes, user_friends, user_about_me, user_interests, user_photos, user_activities, user_events, user_tagged_places'});

}

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        RegisterUserFb(response);
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.

    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.

    }
}

function RegisterUserFb(response) {

    var query = {"facebookId":response.authResponse.userID};

    // getting user with facebookId
    dpd.users.get(query, function (result) {
        if (result.length === 0) {

            var userInfos = {"email":"",
                        "facebookId":response.authResponse.userID,
                    "facebookTokken":response.authResponse.accessToken};

            dpd.users.post(userInfos, function(result, err) {
                if(err)
                    return console.log(err);
                userDeploydId = result.id;
                setCookie('user',userDeploydId,5);
            });
        } else{
            userDeploydId = result[0].id;
            setCookie('user',userDeploydId,5);
        }

        facebookAccessToken = response.authResponse.accessToken;

    });

    // get mail
    FB.api('/me', function(response) {
        // save/update mail
        dpd.users.put(userDeploydId, {"email" : response.email}, function(result, err) {
            if(err)
                return console.log(err);
        });
    });

    // get profile picture
    FB.api("/me/picture", function (response) {

            if (response && !response.error) {
                // save/update facebookProfilePictureURL
                dpd.users.put(userDeploydId, {"facebookProfilePictureURL" : response.data.url}, function(result, err) {
                    if(err)
                        return console.log(err);
                        //RELOAD AFTER FACEBOOK LOGIN
                        window.location.reload();
                });
            }
        }
    );

}


function onLoadCallback()
{
    gapi.client.setApiKey('AIzaSyDw74l5k5hSWbYW_jIMeV9R6tB_C86yK98'); //set your API KEY
    gapi.client.load('plus', 'v1',function(){});//Load Google + API
}

function LoginGoogle() {
    var myParams = {
    'clientid' : '135652671994-u0qore5v4rt9ut9um6725r5i91j3mbb9.apps.googleusercontent.com', //You need to set client id
    'cookiepolicy' : 'single_host_origin',
    'callback' : 'loginCallback', //callback function
    'approvalprompt':'force',
    'scope' : 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
  };
  gapi.auth.signIn(myParams);
}

function loginCallback(result)
{
    if(result['status']['signed_in'])
    {
        RegisterUserG(result);
    }
}


function RegisterUserG(response) {

    var request = gapi.client.plus.people.get(
    {
        'userId': 'me'
    });
    request.execute(function (resp)
    {
       var query = {"email":resp['result']['emails'][0]['value']};

        // getting user with facebookId
        dpd.users.get(query, function (result) {
            if (result.length === 0) {

                var userInfos = {"email":resp['result']['emails'][0]['value'],
                            "googleId":resp['result']['id'],
                        "googleTokken":response['access_token'],
                        "googleProfilePictureURL":resp['result']['image']['url']};

                dpd.users.post(userInfos, function(result, err) {
                    if(err)
                        return console.log(err);
                    userDeploydId = result.id;
                    setCookie('user',userDeploydId,5);
                        //RELOAD AFTER GOOGLE LOGIN
                        window.location.reload();
                });
            } else{
                userDeploydId = result[0].id;
                setCookie('user',userDeploydId,5);
                dpd.users.put(userDeploydId, {"googleId":resp['result']['id'],
                        "googleTokken":response['access_token'],
                        "googleProfilePictureURL":resp['result']['image']['url']}, function(result, err) {
                    if(err)
                        return console.log(err);
                        //RELOAD AFTER GOOGLE LOGIN
                        window.location.reload();
                });
            }

            googleAccessToken = response['access_token'];

        });
    });

}

