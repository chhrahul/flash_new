// JavaScript Document
/*$(window).load(function() {
  intransitWidth();
	
});

$(window).resize(function() {
  intransitWidth();
	
});


function intransitWidth(){
	var intransit	=		$('.intransit-detail-list').width();
	$('.via-detail').css({width:intransit});
}*/


$(document).on("deviceready", function () {
    hockeyapp.start(null, null, "8ea8b4c75c4e464bb919edaa7357f1fd");

    document.addEventListener("pause", onPause, false);
    
    function onPause() {
        if (window.localStorage.getItem("loggedIn") != null) {
            var userdata = JSON.parse(window.localStorage.getItem("userdata"));
            var account_no = userdata.ACCOUNTNO;
        }
        else {
            account_no = 'null';
        }

        $.ajax({
            method: "POST",
            url: globalUrl + "tracking/app_closed",
            data: {
                device_id: device.uuid,
                user_id: account_no,
                action: 'insert'
            },
            dataType: 'json',
            success: function (response) {
                console.log(JSON.stringify(response))
            },
            error: function (error) {
                //hideLoader();
            }
        });
    }
    document.addEventListener("online", onOnline, false);

    function onOnline() {
        //alert('i am online')
    }
    
    document.addEventListener("offline", onOffline, false);

    function onOffline() {
        alert('Your device has gone offline, please connect to internet to use the app.')
    }
    var paramkeyArray=["autologincredentials","autologinemail","autologinpassword","appseekey"];
    CustomConfigParameters.get(function(configData){
        //var global_url = configData.globalurl;
        if(configData.autologincredentials == 'true')
        {
            $('#l_username').val(configData.autologinemail)
            $('#l_password').val(configData.autologinpassword)            
        }
        
        
        
        Appsee.start(configData.appseekey);

    },function(err){
      //console.log(err);
    },paramkeyArray);
    
    //alert('fg')
    if (window.localStorage.getItem("loggedIn") != null) {
        var userdata = JSON.parse(window.localStorage.getItem("userdata"));
        var account_no = userdata.ACCOUNTNO;
    }
    else {
        account_no = 'null';
    }

    $.ajax({
        method: "POST",
        url: globalUrl + "tracking/app_open",
        data: {
            device_id: device.uuid,
            user_id: account_no,
            action: 'insert'
        },
        dataType: 'json',
        success: function (response) {
            //alert(JSON.stringify(response))
        },
        error: function (error) {
            //hideLoader();
            //alert(error.responseText)
        }
    });
    
});
