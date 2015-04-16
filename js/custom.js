    var visitorCountry = null;
    var locale = "en-us";
    var todayTimeStamp = new Date();
    var oneDayTimeStamp = 1000 * 60 * 60 * 24;

    $(document).ready(function() {        
        $.get("http://ipinfo.io/", function (response) {
            if(window.location.hash.replace('#', '') != '') {
              dayMonth = window.location.hash.replace('#', '').split('-');
              prepareFacts(response.country, dayMonth[0], dayMonth[1]);
              todayTimeStamp = new Date(dayMonth[0]+'/'+dayMonth[1]+'/'+todayTimeStamp.getFullYear());
            } else {
                prepareFacts(response.country, todayTimeStamp.toLocaleString(locale, { month: "short" }), todayTimeStamp.getDate());
            }

            visitorCountry = response.country;
            $('#flag').addClass('flag-'+response.country.toLowerCase());
            showDates();
        }, "jsonp");

        $('#prev').click(function () {
            var yesterdayTimeStamp = new Date(todayTimeStamp - oneDayTimeStamp);
            var yesterdayString = yesterdayTimeStamp.getFullYear() + '-' + (yesterdayTimeStamp.getMonth() + 1) + '-' + yesterdayTimeStamp.getDate();

            $('#today').text(yesterdayTimeStamp.toLocaleDateString(locale, { 
                                                month: "long", 
                                                day: "numeric"
                                            })
            );

            todayTimeStamp = new Date(yesterdayTimeStamp); 
            prepareFacts(visitorCountry, yesterdayTimeStamp.toLocaleString(locale, { month: "short" }), yesterdayTimeStamp.getDate());  
            history.pushState(null, null, '#'+yesterdayTimeStamp.toLocaleString(locale, { month: "short" })+'-'+yesterdayTimeStamp.getDate());
        }); 

        $('#next').click(function () {
            var tomorrowTimeStamp = new Date(+todayTimeStamp + oneDayTimeStamp);
            var tomorrowString = tomorrowTimeStamp.getFullYear() + '-' + (tomorrowTimeStamp.getMonth() + 1) + '-' + tomorrowTimeStamp.getDate();

            $('#today').text(tomorrowTimeStamp.toLocaleDateString(locale, { 
                                                month: "long", 
                                                day: "numeric"
                                            })
            );            

            todayTimeStamp = new Date(tomorrowTimeStamp);
            prepareFacts(visitorCountry, tomorrowTimeStamp.toLocaleString(locale, { month: "short" }), tomorrowTimeStamp.getDate());  
            history.pushState(null, null, '#'+tomorrowTimeStamp.toLocaleString(locale, { month: "short" })+'-'+tomorrowTimeStamp.getDate());
        }); 

    });   

    $(document).on( "click", ".hashtag", function() {
        var tag = $(this).text();
        highLightByTag(tag);
    });    

    function showDates() {
        var todayString = todayTimeStamp.getFullYear() + '-' + (todayTimeStamp.getMonth() + 1) + '-' + todayTimeStamp.getDate();

        $('#today').text(todayTimeStamp.toLocaleDateString(locale, { 
                                            month: "long", 
                                            day: "numeric"
                                        })
        );        
    }

    function prepareFacts(country, month, day) {
        $.ajax({
            url: "http://historyof.today/"+country+"/"+month+"/"+day+".txt",
            cache: false,
            dataType: "text",
            success: function( data, textStatus, jqXHR ) {

            var factArray = [];
            var facts = data.split('---');
            for(var fact = 0; fact < facts.length; fact++){
                
                var lineArray = [];  
                var lines = facts[fact].split('\n\n');
                for(var line = 0; line < lines.length; line++){
                    lineArray.push(lines[line].trim());
                }
                
                factArray[fact] = lineArray;
            }   
            showFacts(factArray);

            },
            error: function(e) {
                $('#facts').html('<div class="alert alert-warning" role="alert">'+
                                    '<strong>দুঃখিত!</strong> এই দিনের জন্য এখন পর্যন্ত কোন ঘটনা আমাদের তথ্য ভাণ্ডারে নেই। যুক্ত করতে উপরের [সম্পৃক্ত হোন] বাটনে ক্লিক করুন।'+
                                 '</div>');
            }
        });        
    }

    function showFacts(facts) {
        $('#facts').html('');
        $.each(facts, function(i, lines) {
            $('#facts').append('<div class="panel panel-default fact">'+
            '<div class="panel-heading">'+
                '<h3 class="panel-title">'+lines[0]+'</h3>'+
            '</div>'+
            '<div class="panel-body">'+
                lines[1]+
                '<br/><span class="glyphicon glyphicon-tags" aria-hidden="true"></span> '+lines[2].replace(/#([^ ]+)/g, ' <a href="javscript:void(0)" class="hashtag">#$1</a>')+
                '<br/><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span> <span id="factref">'+lines[3].replace(/http([^ ]+)/g, ' <a href="http$1" target="_blank">http$1</a>')+'<span>'+
            '</div>'+
          '</div>');
        });
    }

    function highLightByTag(tag) {
        if (tag != '') {
            $('.fact').removeClass('panel-info');
            $('#facts div.panel-body:contains('+tag+')').parent().addClass('panel-info');
        }
    }    