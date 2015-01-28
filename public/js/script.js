$(document).ready(function() {

  var configs = {
    searchTerm	: '' ,               // the thing to search
    type		: 'web',                            // web, images, videos
    append		: false,
    perPage		: 8,			   // A maximum of 8 is allowed by Google
    page		: 0,				   // The start page
    address     : ''
  };

  $('#searchButton').on('click', function() {
    configs.searchTerm = $('#searchInput').val();

    search(configs);

  });
  $("#searchInput").keyup(function(event){
    if(event.keyCode == 13){
        configs.searchTerm = $('#searchInput').val();
        search(configs);
        }
    });

  $('.results_filter a.filter_button').bind('click', FilterClick);
  $('#category_submit').bind('click', CreateCategory);
  window.setTimeout(PreloadVerify,300);
  LoginVerify();
});
function CategoryAdd() {
    $('.categ_form').animate({height:'toggle'},500);
}

function CreateCategory() {
    var ok=1;
    if ($('#category_name').val().length<3)
        {
        ok=0;
        $('#category_name').parent().addClass('has-error');
        $('#category_name').parent().removeClass('has-success');
        }
        else
        {
        $('#category_name').parent().removeClass('has-error');
        $('#category_name').parent().addClass('has-success');
        }
    /*if (ValidURL($('#category_searchonly').val()))
        {
        $('#category_searchonly').parent().removeClass('has-error');
        $('#category_searchonly').parent().addClass('has-success');
        }
        else
        {
        ok=0;
        $('#category_searchonly').parent().addClass('has-error');
        $('#category_searchonly').parent().removeClass('has-success');
        }*/
    if (ok==1)
        {
        dpd.categories.post({
            "userId":userDeploydId,
            "name":$('#category_name').val(),
            "web":$('.categ_form .checkbox input[value="web"]').prop('checked'),
            "images":$('.categ_form .checkbox input[value="images"]').prop('checked'),
            "video":$('.categ_form .checkbox input[value="video"]').prop('checked'),
            "location":$('.categ_form .checkbox input[value="location"]').prop('checked'),
            "facebook":$('.categ_form .checkbox input[value="facebook"]').prop('checked'),
            "google":$('.categ_form .checkbox input[value="google"]').prop('checked'),
            "onlyOn":$('#category_searchonly').val()
            },
            function(result, err) {
                //if(err) return console.log(err);
                  //  console.log(result, result.id);
                loaded.categories[loaded.categories.length]=result;
                 $('#category_list a:last-child').before('<a role="button" class="btn btn-default filter_button" filter="'+result.id+'_result" id="'+result.id+'">'+result.name+'</a>');

              $('.results_filter a.filter_button').bind('click', FilterClick);
              $('.results_filter a.filter_button').bind('contextmenu', CategoryRightClick);
        });
       // $('#category_searchonly').parent().removeClass('has-success');
        $('#category_name').parent().addClass('has-success');
        $('#category_name').val('');
        $('.categ_form .checkbox input').prop('checked',false);
        $('.categ_add_confirm').show();
        $('.categ_add_confirm').animate({height:'toggle'},2000);
        $('.categ_form').animate({height:'toggle'},1000);
        }

}
var idMaps = 1;
function createResult(type,title,content,url,source) {
    var div;
    if (type.indexOf('facebook')>=0)
        {
        div = document.createElement('div');
        }
        else
        {
        div = document.createElement('a');
        $(div).attr('href',url);
        }
    $(div).addClass('col-md-4');
    $(div).addClass('search_result');
    $(div).append('<h3>'+title+'</h3>');
    for (var i=0; i<loaded.categories.length; i++)
        {
        var categ = loaded.categories[i];
        if (categ.web && type=='web')
            $(div).addClass(categ.id+'_result');
        if (categ.images && type=='img')
            $(div).addClass(categ.id+'_result');
        if (categ.video && type=='video')
            $(div).addClass(categ.id+'_result');
        if (categ.location && type=='map')
            $(div).addClass(categ.id+'_result');
        if (categ.google && type=='google')
            $(div).addClass(categ.id+'_result');
        if (categ.facebook && type.indexOf('facebook')>=0)
            $(div).addClass(categ.id+'_result');
        }

    switch (type) {
        case 'web':
            $(div).append('<p>'+content+'</p>');
            break;
        case 'img':
            $(div).append('<img src="'+decodeURIComponent(content)+'" alt="'+title+'" class="img_result" />');
            break;
        case 'map':
            $(div).append('<div class="map"></div>');
            $(div).attr('id','map_'+idMaps);
            idMaps++;
            break;
        case 'google':
            $(div).append('<p>'+content.content+'</p>');
            if (typeof (content.attachments)!=='undefined')
                if (typeof (content.attachments[0])!=='undefined')
                    if (typeof (content.attachments[0].image)!=='undefined')
                        $(div).append('<img src="'+decodeURIComponent(content.attachments[0].image.url)+'" alt="'+title+'" class="img_result" />');
            break;
        case 'video':
            var id = content.substr(content.indexOf('?v=')+3);
            $(div).append('<iframe height="300" src="http://www.youtube.com/embed/'+id+'"></iframe>');
            break;
        case 'facebook_place':
            $.each(content,function(index,value){
                var l = '<a href="http://facebook.com/'+value.id+'" class="fb_link">'+
                '<img src="http://graph.facebok.com/'+value.id+'/picture" alt="'+title+'" />'+
                '<h2>'+value.name+'</h2>'+
                '<h4>Category: '+value.category+'</h4>'+
                '</a>';
                $(div).append(l);
            });
            type='facebook';
            break;
        case 'facebook_page':
            $.each(content,function(index,value){
                var l = '<a href="http://facebook.com/'+value.id+'" class="fb_link">'+
                '<img src="http://graph.facebok.com/'+value.id+'/picture" alt="'+title+'" />'+
                '<h2>'+value.name+'</h2>'+
                '<h4>Category: '+value.category+'</h4>'+
                '</a>';
                $(div).append(l);
            });
            type='facebook';
            break;
        case 'facebook_event':
            $.each(content,function(index,value){
                var l = '<a href="http://facebook.com/'+value.id+'" class="fb_link">'+
                '<img src="http://graph.facebok.com/'+value.id+'/picture" alt="'+title+'" />'+
                '<h2>'+value.name+'</h2>'+
                '<h4>Time: '+value.start_time+'</h4>'+
                '<h4>Location: '+value.location+'</h4>'+
                '</a>';
                $(div).append(l);
            });
            type='facebook';
            break;
        case 'facebook_user':
            $.each(content,function(index,value){
                var l = '<a href="http://facebook.com/'+value.id+'" class="fb_link">'+
                '<img src="http://graph.facebok.com/'+value.id+'/picture" alt="'+title+'" />'+
                '<h2>'+value.name+'</h2>'+
                '</a>';
                $(div).append(l);
            });
            type='facebook';
            break;
    }
    $(div).addClass(type+'_result');
    $(div).append('<img src="https://plus.google.com/_/favicon?domain='+url+'" alt="'+title+'" class="favicon" />');
    var p = url.lastIndexOf('.');
    if (url.indexOf('http://')!=-1)
        url = (url.substr( (url.indexOf('http://')!=-1?url.indexOf('/')+2:0) ));
        else
        if (url.indexOf('https://')!=-1)
        url = (url.substr( (url.indexOf('https://')!=-1?url.indexOf('/')+2:0) ));
    url = url.substr(0,(url.indexOf('/')!=-1?url.indexOf('/'):url.length));//get only domain
    $(div).append('<span>'+url+'</span>');
    if (source!='')
        {
        $(div).append('<span class="socicon socicon-'+source.toLowerCase()+'"></span>');
        }
    $('.results').append(div);
    return '#map_'+(idMaps-1);
}
//Isotope functions
function ArrangeEls() {
    $('.results').isotope({
      // options
      //itemSelector: '.search_result',
     // masonry: {
     //   columnWidth: 100
      //}
    });
}

function DestroyArrange() {
    $('.results').isotope('destroy');
}

function FilterClick() {
console.log(1);
    var filter = $(this).attr('filter');
    if (filter!='')
        filter = '.'+filter;
    $('.results').isotope({filter: filter});
}

function PopupShow() {
    $('#popupBottom').show();
    window.setTimeout(function(){
    $(document).bind('click',function(){
        $('#popupBottom').hide();
        $(document).unbind('click');
    });},500);
}

function CategoryRightClick(evt) {

    var id = $(this).attr('id');
    console.log(id);
        evt.preventDefault();
        evt.stopImmediatePropagation();
        evt.stopPropagation();
    if (typeof (id)!='undefined')
        {
        var menu = '<div class="el_menu_background"></div><div class="el_menu" style="top: '+evt.pageY+'px; left: '+evt.pageX+'px;">'
            +'<a class="el_menu_link btn btn-danger" onclick="CategoryDelete(\''+id+'\')">Delete</a>'
        menu+='</div>';
        $('body').append(menu);
        $('.el_menu_background').bind('click', ElMenuMouseelsewhere);
        }
}


function ElMenuMouseelsewhere(evt) {
    var a = evt.target;
    if ($(a).hasClass('el_menu')||$(a).hasClass('el_menu_link'))
        {

        }
        else
        {
        $('.el_menu_background').unbind('click',ElMenuMouseelsewhere);
        $('.el_menu').remove();
        $('.el_menu_background').remove();
        evt.preventDefault();
        evt.stopImmediatePropagation();
        }
}

function CategoryDelete(id) {
    dpd.categories.del(id, function (err) {
        $('#'+id).remove();
        var p = 0;
        for (var i=0; i<loaded.categories.length; i++)
            if (loaded.categories[i].id==id)
                p=i;
        for (var i=p; i<loaded.categories.length; i++)
            {
            loaded.categories[i]=loaded.categories[i+1];
            }
        loaded.categories.pop();
        $('.el_menu_background').unbind('click',ElMenuMouseelsewhere);
        $('.el_menu').remove();
        $('.el_menu_background').remove();
    });
}




