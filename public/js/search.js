/**
 * Created by calincrist on 1/25/15.
 */
var search_count = 0;
var search_verify = 0;
var timecache = 1000*60*3;
function search(settings) {
    $('.results .search_result').remove();
    $('.results').hide();
    DestroyArrange();
    search_count=0;
    search_verify=0;
    //Google Web
    var query = {"userID":userDeploydId,"type":"googleGwebSearch","search":settings.searchTerm,"timestamp":{"$gt": Date.now()-timecache}};
    dpd.cache.get(query, function (result) {
      if (result.length>0)
        {
        googleSearchResults(result[0].data);
        }
        else
        {
        settings.type = 'web';
        googleSearch(settings);
        }
    });
    //Google Images
    var query = {"userID":userDeploydId,"type":"googleGimageSearch","search":settings.searchTerm,"timestamp":{"$gt": Date.now()-timecache}};
    dpd.cache.get(query, function (result) {
      if (result.length>0)
        {
        googleSearchResults(result[0].data);
        }
        else
        {
        settings.type = 'images';
        googleSearch(settings);
        }
    });
    //Google Videos
    var query = {"userID":userDeploydId,"type":"googleGvideoSearch","search":settings.searchTerm,"timestamp":{"$gt": Date.now()-timecache}};
    dpd.cache.get(query, function (result) {
      if (result.length>0)
        {
        googleSearchResults(result[0].data);
        }
        else
        {
        settings.perPage = 3;
        settings.type = 'video';
        googleSearch(settings);
        }
    });
    //Google PLus
    var query = {"userID":userDeploydId,"type":"googlePlus","search":settings.searchTerm,"timestamp":{"$gt": Date.now()-timecache}};
    dpd.cache.get(query, function (result) {
      if (result.length>0)
        {
        googlePlusSearchResults(result[0].data);
        }
        else
        {
        googlePlusSearch(settings);
        }
    });
    //googlePlusSearch(settings);
   // googleMapsSearch(settings);
   // facebookSearch(settings);
    finishsearch();
}


function finishsearch() {
    if (search_count==6 || search_verify>10)
        {
        $('.results').animate({height:'toggle'},1000,ArrangeEls);
        }
        else
        {
        search_verify++;
        window.setTimeout(finishsearch,300);
        }
}


function googleSearch(settings) {

    // URL of Google's AJAX search API
    var apiURL = 'http://ajax.googleapis.com/ajax/services/search/'+settings.type+'?v=1.0&callback=?';
    var resultsDiv = $('#resultsDiv');

    $.getJSON(apiURL,{
        q	: settings.searchTerm,
        rsz	: settings.perPage,
        start	: settings.page*settings.perPage
    },function(response) {

        var results = response.responseData.results;

        if (results.length) {
            // we have results
            dpd.cache.post({"userID":userDeploydId,"type":"google"+results[0].GsearchResultClass,"search":settings.searchTerm,"data":results,"timestamp":Date.now()}, function(result, err) {});
            googleSearchResults(results);

        } else {
            // no results
            console.log('No results.');

        }

    });

}

function googleSearchResults(results) {
    $.each(results, function(index, value) {

        var resultType;
        var content;
        var title;
        var url;
        var source;

        switch (value.GsearchResultClass) {
            case "GvideoSearch":
                resultType = 'video';
                content = value.url;
                title = value.titleNoFormatting;
                url = value.url;
                source = value.videoType;

                break;

            case "GwebSearch":
                resultType = 'web';
                content = value.content;
                title = value.titleNoFormatting;
                url = value.url;
                source = 'google';

                break;

            case "GimageSearch":
                resultType = 'img';
                content = value.url;
                title = value.titleNoFormatting;
                url = value.visibleUrl;
                source = 'google';

                break;

            default:
                break;
        }

        createResult(resultType, title, content, url, source);

    });

    search_count++;
}

function googleMapsSearch(settings) {

    var title;

    // initialize
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var mapOptions = {
        zoom: 8,
        center: latlng
    }

    var id = createResult('map', '', '','','google');
    var mapCanvas = $(id).find('.map').get(0);
    $(mapCanvas).attr('id', 'map-canvas');

    var map = new google.maps.Map(mapCanvas, mapOptions);

    // code address
    var address = settings.searchTerm;
    geocoder.geocode( { 'address': address}, function(results, status) {

        title = results[0].formatted_address;

        $(id).find('h3').html(title);

        if (status == google.maps.GeocoderStatus.OK) {

            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
            search_count++;

        } else {
            console.log('Geocode was not successful for the following reason: ' + status);

        }

    });


}

function googlePlusSearch(settings) {

    var request = gapi.client.plus.activities.search({
        "query" : settings.searchTerm
    });

    request.execute(function(response) {
        dpd.cache.post({"userID":userDeploydId,"type":"googlePlus","search":settings.searchTerm,"data":response.items,"timestamp":Date.now()}, function(result, err) {});
        googlePlusSearchResults(response.items);
    });
}

function googlePlusSearchResults(response) {
    var numItems = response.length;
    for (var i = 0; i < numItems; i++) {

        var resultType = 'google';
        var title = response[i].actor.displayName;
        var content = response[i].object;
        var url = response[i].url;
        var source = 'google';

        createResult(resultType, title, content, url, source);
     }
        search_count++;
}

function facebookSearch(settings) {

    var searchUrl = '/search?';
    var searchQuery = 'q=' + settings.searchTerm;
    var searchPlaces = '&type=place';
    var searchPages = '&type=page';
    var searchEvents = '&type=event';
    var searchUsers = '&type=user';
    var searchLimit = '&limit=5';
    var accessToken = '&accessToken=' + facebookAccessToken;

    FB.api(searchUrl + searchQuery + searchPlaces + accessToken + searchLimit, function (response) {

        console.log(response);

        if (response && !response.error) {

            var title;
            var content;
            var url = '';
            var source = 'facebook';

            var places = response.data;

            title = 'Places';
            content = places;

            createResult('facebook_place', title, content, url, source);

        }
    });

    FB.api(searchUrl + searchQuery + searchUsers + accessToken + searchLimit, function (response) {

        console.log(response);

        if (response && !response.error) {

            var title;
            var content;
            var url = '';
            var source = 'facebook';

            var users = response.data;

            title = 'Persons';
            content = users;

            createResult('facebook_user', title, content, url, source);

        }
    });

    FB.api(searchUrl + searchQuery + searchEvents + accessToken + searchLimit, function (response) {

        console.log(response);

        if (response && !response.error) {

            var title;
            var content;
            var url = '';
            var source = 'facebook';

            var events = response.data;

            title = 'Events';
            content = events;

            createResult('facebook_event', title, content, url, source);
        }
    });

    FB.api(searchUrl + searchQuery + searchPages + accessToken + searchLimit, function (response) {

        console.log(response);

        if (response && !response.error) {

            var title;
            var content;
            var url = '';
            var source = 'facebook';

            var pages = response.data;

            title = 'Pages';
            content = pages;

            createResult('facebook_page', title, content, url, source);
        }
            search_count++;
    });

}

/*
function twitterSearch(settings) {
    var oauth = OAuth({
        consumer: {
            public: '075nf6ZAXBAZn7ZYO6w1YvEGb',
            secret: '8v2badgNbhD7bYXdcUb2nRntBNlFJuNSdi6QpIjsU71Yjzgitd'
        },
        signature_method: 'HMAC-SHA1'
    });
    var request_data = {
        url: 'https://api.twitter.com/1.1/search/tweets.json?q=%23haiku',
        method: 'GET',
    };
    var token = {
        public: '183581455-5V5pVsnds6NchrgZxkryzMPnSAuShVhLvcTe556Z',
        secret: 'bJI511imGW5QvNN5MaCj6vLKszaIlm2kSOtvAnH9HQrQ9'
    };
    $.ajax({
        url: request_data.url,
        type: request_data.method,
        data: oauth.authorize(request_data, token),
        dataType: 'jsonp',
        headers: oauth.toHeader(oauth.authorize(request_data, token)),

    }).done(function(data) {
       console.log(data);
    });
}
*/
