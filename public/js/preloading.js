/**
 * Created by dan on 1/26/2015.
 */
var loaded = new Object();
loaded.login = 0;
loaded.categories = Array();

function PreloadVerify() {
    var ok=1;
    if (loaded.login==0)
        ok=0;
    if (ok==1)
        {
        $('.loading_screen').animate({height:'toggle'},1000);
        }
        else
        window.setTimeout(PreloadVerify,300);
}

function LoginVerify() {
    var user = getCookie('user');
    if (user=='')
        loaded.login=1;
        else
        dpd.users.get(user, function (result) {
          loaded.login = result;
          userDeploydId = result.id;

          if (typeof(result.facebookId)!=='undefined')
            {
            //LoginFb();
            facebookAccessToken = result.facebookTokken;
            FB.getLoginStatus(function(response) {
            });
            $('.user_img').removeClass('glyphicon');
            $('.user_img').removeClass('glyphicon-user');
            $('.user_img').html('<img src="'+result.facebookProfilePictureURL+'" />');
            }
            if (typeof(result.googleId)!=='undefined')
            {
            //LoginGoogle();

            googleAccessToken = result.googleTokken;
            $('.user_img').removeClass('glyphicon');
            $('.user_img').removeClass('glyphicon-user');
            $('.user_img').html('<img src="'+result.googleProfilePictureURL+'" />');
            }
            LoadCategories();
        });
}

function LoadCategories() {
    var query = {"userId":userDeploydId};
    dpd.categories.get(query, function (result) {
       for(var i=0; i<result.length; i++)
        {
        loaded.categories[i]=result[i];
        $('#category_list').append('<a role="button" class="btn btn-default filter_button" filter="'+result[i].id+'_result" id="'+result[i].id+'">'+result[i].name+'</a>');
        }
  $('.results_filter a.filter_button').bind('click', FilterClick);
  $('.results_filter a.filter_button').bind('contextmenu', CategoryRightClick);

        $('#category_list').append('<a role="button" class="btn btn-default" onclick="CategoryAdd()"><span class="glyphicon glyphicon-plus-sign"></span></a>');
    });


}
