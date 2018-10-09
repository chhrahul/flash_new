
// net connection check-----------------------
var fcm_token = "";
var platform = "";
document.addEventListener("offline", checkForOffline, false);

function checkForOffline() {
	if (navigator.onLine == false) {
		navigator.notification.alert("Please turn on your net connection to use this app", function () {
			navigator.app.exitApp();
		}, "", "OK");
	}
}

function logErrorDetails(error)
{
    return "Error: " + error.responseText + "!";
}

// device ready events------------------------------
$(document).on("pageshow", "div[data-role=page]", function () {
	var activePage = $.mobile.activePage.attr("id");
    if($(".error-message").length > 0)
    {
        $(".error-message").html("");
    }
	//alert(activePage);
	$(".ui-link").removeClass("active");
	if (activePage == "pet-profile-listing" || activePage == "pet-profile" || activePage == "pet-profile-detail") {
		$(".pet-link").addClass("active");
	} else if (activePage == "veterinarian-info") {
		$(".vet-link").addClass("active");
	} else if (activePage == "profile") {
		$(".my-profile-link").addClass("active");
	} else if (activePage == "travel-plan") {
		$(".travel-link").addClass("active");
	} else if (activePage == "pet-document-listing" || activePage == "add-edit-pet-document" || activePage == "document-detail-page") {
	  $(".document-link").addClass("active");
	 } else if (activePage == "change-password") {
	  $(".password-link").addClass("active");
	 }

});
$(document).on("deviceready", function () {
    // Preventing desing breaking due to font size of device -------------------
    if(window.MobileAccessibility){
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
	// Getting fcm token -------------------------------
	/*setTimeout(function(){
		FCMPlugin.getToken(
		function (token) {
		console.log("token " + token);
		fcm_token = token + "-" + device.platform;

	},
		function (err) {});
	},8000);
	
	FCMPlugin.onNotification(
		function (data) {
		if (data.wasTapped) {
			//Notification was received on device tray and tapped by the user.
			updateUserdata();
		} else {
			//Notification was received in foreground. Maybe the user needs to be notified.
			updateUserdata();
		}
	},
		function (msg) {
		console.log('onNotification callback successfully registered: ' + msg);
	},
		function (err) {
		console.log('Error registering onNotification callback: ' + err);
	});*/
    

setTimeout(function(){
    window.FirebasePlugin.getToken(function(token) {
		// save this server-side and use it to push notifications to this device
		console.log("token " + token);
		fcm_token = token + "-" + device.platform;
    alert(fcm_token)
    }, function(error) {
    	console.log(error);
    })
	},8000);
window.FirebasePlugin.grantPermission();
window.FirebasePlugin.onNotificationOpen(function(notification) {
    console.log(notification);
    updateUserdata();
}, function(error) {
    console.log(error);
});

	// checking if user is logged in or not ----------------
	$("#login").on("pagebeforeshow", function () {
		if (window.localStorage.getItem("loggedIn") != null) {
			var userdata = JSON.parse(window.localStorage.getItem("userdata"));
            window.fabric.Crashlytics.setUserIdentifier(userdata.ACCOUNTNO);
            window.fabric.Crashlytics.setUserName(userdata.CONTACT);
			$(".user-name").html(userdata.CONTACT);
			var address = "";
			if (typeof userdata.ADDRESS1 != "undefined" && userdata.ADDRESS1 != "" && userdata.ADDRESS1 != "null" && userdata.ADDRESS1 != null) {
				if (address != "") {
					address += ", ";
				}
				address += userdata.ADDRESS1;
			}
			if (typeof userdata.CITY != "undefined" && userdata.CITY != "" && userdata.CITY != "null" && userdata.CITY != null) {
				if (address != "") {
					address += ", ";
				}
				address += userdata.CITY;
			}
			if (typeof userdata.STATE != "undefined" && userdata.STATE != "" && userdata.STATE != "null" && userdata.STATE != null) {
				if (address != "") {
					address += ", ";
				}
				address += userdata.STATE;
			}
			if (typeof userdata.COUNTRY != "undefined" && userdata.COUNTRY != "" && userdata.COUNTRY != "null" && userdata.COUNTRY != null) {
				if (address != "") {
					address += ", ";
				}
				address += userdata.COUNTRY;
			}
			$(".user-address").html(address);
			$.mobile.changePage("#home", {
				transition: "flip"
			});
		}
	});

	// load add pet page ----------------------------------------
	$(".add-pet").on("tap", function () {
		showLoader("Please wait ...");
    	window.fabric.Crashlytics.addLog("Starting ajax request to add new pet at " + get_date_time());
    
		var userdata = JSON.parse(window.localStorage.getItem('userdata'));
		$.ajax({
			method: "POST",
			url: globalUrl + "my_account/add_pet_profile",
			data: {
				userId: userdata.ACCOUNTNO
			},
			dataType: 'json',
			success: function (response) {
				if (response.response == "Y") {

					petProfile(response.pet_id, 'add');
          window.fabric.Crashlytics.addLog("Ending add pet ajax request as Pet Profile is added successfully at " + get_date_time());
          window.fabric.Crashlytics.sendNonFatalCrash("");
				} else {
					window.plugins.toast.show('An error occurred. Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
				hideLoader();
			},
			error: function (error) {
				hideLoader();
				window.fabric.Crashlytics.addLog("Ending add pet ajax request as an error occurred while adding new pet at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				window.plugins.toast.show('An error occurred. Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});
	});

	// view password functionality ---------------------
	$(".view-password").on("click", function () {
		if ($(this).parent().find("input").attr("type") == "password") {
			$(this).parent().find("input[type=password]").attr("type", "text");
			$(this).text("Hide Password");
		} else {
			$(this).parent().find("input").attr("type", "password");
			$(this).text("show Password");
		}

	});

});



// login function-------------------

function login() {

	var formData = $("form[name=login-form]").serializeArray();
	var error = 0;
	$(".error-message").html("");
	var info = {};
	$.each(formData, function (key, val) //validation
	{
		if ($.trim(val.value) == "") {
			$("input[name=" + val.name + "]").parent().next(".error-message").text("*required field");
			error++;
		} else if (val.name == "username" && validateEmail($.trim(val.value)) == false) {
			$("input[name=" + val.name + "]").parent().next(".error-message").text("*not a valid email.");
			error++;
		}
		info[val.name] = $.trim(val.value);
	});

	if (error == 0) {
		showLoader("Please wait...");
		setTimeout(function(){
		info["fcm_token"] = fcm_token;

		//alert(JSON.stringify(info));
		console.log(globalUrl + "login?" + $.param(info));
    	window.fabric.Crashlytics.addLog("Starting Ajax Request For Login at : " + get_date_time());
    
		$.ajax({
			url: globalUrl + "login",
			method: "POST",
			data: info,
			dataType: "json",
			success: function (response) {
				hideLoader();
                //alert(JSON.stringify(response));
				if (response.success == true && typeof response.userdata != "undefined") {
					window.localStorage.setItem("loggedIn", "1");
					window.localStorage.setItem("userdata", JSON.stringify(response.userdata));
					var userdata = JSON.parse(window.localStorage.getItem("userdata"));
					window.fabric.Crashlytics.setUserIdentifier(userdata.ACCOUNTNO);
					window.fabric.Crashlytics.setUserName(userdata.CONTACT);
					window.fabric.Crashlytics.addLog("Ending Login Ajax request as "+userdata.ACCOUNTNO + " has successfully logged in at " + get_date_time());
					window.fabric.Crashlytics.sendNonFatalCrash("");
					$(".user-name").html(userdata.CONTACT);
					var address = "";
					if (typeof userdata.ADDRESS1 != "undefined" && userdata.ADDRESS1 != "" && userdata.ADDRESS1 != "null" && userdata.ADDRESS1 != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.ADDRESS1;
					}
					if (typeof userdata.CITY != "undefined" && userdata.CITY != "" && userdata.CITY != "null" && userdata.CITY != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.CITY;
					}
					if (typeof userdata.STATE != "undefined" && userdata.STATE != "" && userdata.STATE != "null" && userdata.STATE != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.STATE;
					}
					if (typeof userdata.COUNTRY != "undefined" && userdata.COUNTRY != "" && userdata.COUNTRY != "null" && userdata.COUNTRY != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.COUNTRY;
					}
					$(".user-address").html(address);
					$.mobile.changePage("#home");
				} else {
					getMessage(response.message, "OK");
				}
			},
			error: function (error) {
				//alert(JSON.stringify(error));
				hideLoader();
				window.fabric.Crashlytics.addLog("Ending Login Ajax request as an error occurred while logging in at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				window.plugins.toast.show('An error occurred. Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});
	},8000);
	} else {
		$('html,body').animate({
			scrollTop: ($('form[name=login-form] .error-message:not(:empty):first').offset().top) - 100
		},
			'slow');
	}
}

// logout function --------------------------------------------------------

function logout() {
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	$("form[name=login-form] input").val("");
    //alert(userdata.ACCOUNTNO)
    window.fabric.Crashlytics.addLog("Starting Logout Ajax request for "+userdata.ACCOUNTNO + " at " + get_date_time());
	$.ajax({
		url: globalUrl + "login/logout",
		method: "POST",
		data: {
			"userId": userdata.ACCOUNTNO,
			"fcm_token": fcm_token
		},
		dataType: "json",
		success: function (res) {
			window.fabric.Crashlytics.addLog("Logged out successfully, Ending Logout Ajax request at " + get_date_time());
      		window.fabric.Crashlytics.sendNonFatalCrash("");
			if (res.response == "Y") {        
				window.localStorage.clear();
				$.mobile.changePage("#login", {
					transition: "flip"
				});
			} else {
				window.plugins.toast.show('Unable to log you out now. Please try again. ', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		},
		error: function (error) {
			window.fabric.Crashlytics.addLog("Unable to log you out now. Please try again, Ending Logout Ajax request at " + get_date_time());
		  	window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Unable to log you out now. Please try again. ', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
}

// view my profile page --------------------------

$(document).on("pagebeforeshow", "#profile", function () {
	$(".error-message").html("");
    
	var userdata = JSON.parse(window.localStorage.getItem('userdata'));
	showLoader("Loading page....Please wait");
	window.fabric.Crashlytics.addLog("Starting ajax request to fetch account information at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/account_information",
		method: "POST",
		data: {
			'userId': userdata.ACCOUNTNO
		},
		dataType: "json",
		success: function (response) {
    		window.fabric.Crashlytics.addLog("Ending ajax request to fetch account information at " + get_date_time());
    		window.fabric.Crashlytics.sendNonFatalCrash("");
			if (response.response == "Y" && typeof response.user_info != "undefined") {
               
				if (response.country_list != "") {
					$("form[name=profile-form] select[name=COUNTRY]").html(response.country_list);
				}
				if (response.state_list != "") {
                    $("form[name=profile-form] select[name=STATE]").html(response.state_list);
                }
				$.each(response.user_info, function (k, val) {
					//if (k != "COUNTRY" && k != "STATE" && k != "UPUDATE" && k != "UDLDATE") {
					if (k != "COUNTRY" && k != "UPUDATE" && k != "UDLDATE" && k != "STATE") {
						$("input[name=" + k + "]").val(val);
					}  else if (k == "STATE" || k == "COUNTRY" ) {
						if ($("select[name=" + k + "] option[value='" + val + "']").length > 0) {
							$("select[name=" + k + "]").val(val).selectmenu("refresh");
						}
                       else
                       {
                            $("select[name=" + k + "]").val("").selectmenu("refresh");
                       }
					}  else if (k == "UPUDATE" || k == "UDLDATE") {
						$("input[name=" + k + "]").val(dbDateToDatePickerConversion(val));
					}
				});
			}
			$(".curdate").datepicker({
				minDate: new Date(),
			});
			hideLoader();
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fetch account information at " + get_date_time());
      		window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again. ', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
});

// view veterinarian info page ---------------------------
$(document).on("pagebeforeshow", "#veterinarian-info", function () {
	$(".error-message").html("");						  
  
	var userdata = JSON.parse(window.localStorage.getItem('userdata'));
	showLoader("Loading page...Please wait");
	window.fabric.Crashlytics.addLog("Starting ajax request to fetch veterinarian information at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/veterinarian_information",
		method: "POST",
		data: {
			'userId': userdata.ACCOUNTNO
		},
		dataType: "json",
		success: function (response) {
			if (response.response == "Y" && typeof response.vet_info != "undefined") {
                window.fabric.Crashlytics.addLog("Displaying veterinarian information. Ending ajax request to fetch veterinarian information at " + get_date_time());
                window.fabric.Crashlytics.sendNonFatalCrash("");
				if (response.state_list != "") {
					$("form[name=vet-info-form] select[name=UVSTATE]").html(response.state_list);
				}
				$.each(response.vet_info, function (k, val) {
					if (k != "UVSTATE") {
						$("form[name=vet-info-form] input[name=" + k + "]").val(val);
					} else {
						$("form[name=vet-info-form] select[name=" + k + "]").val(val).selectmenu("refresh");
					}
				});
			}
			hideLoader();
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fetch veterinarian information at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
});

// view pet profile list -------------------------------
$(document).on("pagebeforeshow", "#pet-profile-listing", function () {
	$('.pet-profile-list').html("");
    
	showLoader("Loading page...");
	var userdata = JSON.parse(window.localStorage.getItem('userdata'));
	window.fabric.Crashlytics.addLog("Starting ajax request to fetch pet profile list at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/pet_profile_list",
		method: "POST",
		data: {
			'userId': userdata.ACCOUNTNO
		},
		dataType: "json",
		success: function (response) {
			window.fabric.Crashlytics.addLog("Displaying pet list and Ending ajax request to fetch pet profile list at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (response.response == "Y" && typeof response.profiles != "undefined" && response.profiles.length > 0) {
                
				var html = "";
				var count = 1;
                var paramkeyArray=["maxnumberofpets"];
                CustomConfigParameters.get(function(configData){                    
                    //alert(configData.maxnumberofpets);                    
                    if(response.profiles.length < configData.maxnumberofpets)
                    {
                        $('.add-pet').show();
                        $(".add-pet").draggable({
        					containment: "document"
        				});
                    }
                },function(err){
                  //console.log(err);
                },paramkeyArray);
        
				$.each(response.profiles, function (k, val) {
					var greyClass = "";
					if ((count % 2) == 0) {
						greyClass = "gray-panel";
					}
					var img = "";
					if (typeof val.UIMAGE != "undefined") {
						img = val.UIMAGE;
					}
					console.log("img----" + img);
					html += '<li class="' + greyClass + '">' +
					'<div class="my-favorite-cv-list-inner">' +
					'<div class="listing-img"><img src="' + img + '" alt="Dog" title="Dog" class="circle-img"></div>' +
					'<div class="details">' +
					'<h3>' + val.UPETNAME + '</h3>' +
					'<div class="left-cont">';
					if (val.USPECIES != "" && val.USPECIES != "null" && val.USPECIES != null) {
						html += '<p>Species: ' + val.USPECIES + '</p>';
					}
					if (val.UBREED != "" && val.UBREED != "null" && val.UBREED != null && val.UBREED != "other" && val.UBREED != "Other") {
						html += '<p>Breed: ' + val.UBREED + '</p>';
					} else if (val.UBREED == "Other" || val.UBREED == "other") {
						html += '<p>Breed: ' + val.UBREED2 + '</p>';
					}
					if (val.USEX != "" && val.USEX != "null" && val.USEX != null) {
						html += '<p>Sex: ' + val.USEX + '</p>';
					}
					// if (val.UAGE != "" && val.UAGE != null && val.UAGE != "null" && dbDateToDatePickerConversion(val.UAGE) != "") {
					if (val.UAGE != "" && val.UAGE != null && val.UAGE != "null") {
						html += '<p>Age: ' + val.UAGE + '</p>';
					}
					html += '</div>' +
					'<div class="right-cont">'
					 + '<a href="#" class="ui-btn-icon-right ui-icon-carat-r go-button">&nbsp;</a>' +
					'</div>' +
					'</div>' +
					'</div>' +
					'<div class="my-favorite-cv-list-left">' +
					'<ul class="action-icons">' +
					'<li><a href="javascript:void(0);" onclick="viewPetProfile(\'' + val.UPID + '\')"><img src="images/view-icon.jpg" alt="View" title="View" /></a></li>' +
					'<li><a href="javascript:void(0)" onclick="petProfile(\'' + val.UPID + '\',\'edit\')"><img src="images/edit-icon.jpg" alt="Edit" title="Edit" /></a></li>' +
					'<li><a href="javascript:void(0);" onclick="deletePet(\'' + val.UPID + '\')"><img src="images/delete-icon.jpg" alt="Delete" title="Delete" /></a></li>' +
					'</ul>' +
					'</div>' +
					'</li>';
					count++;
				});
				$('.pet-profile-list').html(html);
				$(".swipe-show li").click(function () {
					if ($(this).hasClass("open")) {
						$(this).removeClass("open");
					} else {
						$(".swipe-show li").removeClass("open");
						$(this).addClass("open");
					}

				});
			} else {
				var html = '<li><div class="my-favorite-cv-list-inner"><h3 class="no-record">No pets to display.</h3></div></li>';
				$('.pet-profile-list').html(html);
			}
			if ($(".pet-profile-list").children("li").length < 9) {
				//$(".add-pet").css("display", "block");
				$(".add-pet").draggable({
					containment: "document"
				});

			}
			hideLoader();
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fetch pet profile list at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
});

// view and edit pet profile -----------------------------------------------

function petProfile(petId, action) {
	showLoader("Loading page...");
    //window.fabric.Crashlytics.addLog("");
    //We don't need addLog here because this function is called from another function(where we have already added Log)
	//$("form[name=pet-profile-form] select,input").val('');
    document.getElementById("pet-profile-form").reset();
	$("#profile-pet-image").attr('src', noImgUrl);
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	//alert(userdata.ACCOUNTNO);
	// window.fabric.Crashlytics.addLog("Starting ajax request to fet individual pet profile information for petid: "+petId+" at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/pet_profile_details/" + petId,
		method: "POST",
		data: {
			"userId": userdata.ACCOUNTNO
		},
		dataType: "json",
		success: function (res) {
			window.fabric.Crashlytics.addLog("Displaying pet information and ending ajax request to fet individual pet profile information for petid: "+petId+" at " + get_date_time());
    		window.fabric.Crashlytics.sendNonFatalCrash("");
			//document.getElementById("add-edit-pet-profile").reset();
           //alert(JSON.stringify(res));
			$("#petUpdate").attr("petId", petId);
			$("#petUpdate").attr("petAction", action);
			if (res.response == "Y" && typeof res.pet_id != "undefined" && typeof res.pet_info != "undefined") {
				/* if (res.sp_data.species.length > 0) {
					var opt = "<option value=''>----</option>";
					$.each(res.sp_data.species, function (k, val) {
						opt += "<option value='" + val.ENTRY + "'>" + val.ENTRY + "</option>";
					});
					$("form[name=pet-profile-form] select[name=USPECIES]").html(opt);

				} */
				if (res.species.length > 0) {
					$("form[name=pet-profile-form] select[name=USPECIES]").html(res.species);
				}
				if (res.sex != "") {
					$("form[name=pet-profile-form] select[name=USEX]").html(res.sex);
				}
				if (res.color != "") {
					$("form[name=pet-profile-form] select[name=UCOLOR]").html(res.color);
				}
				if (res.kennel != "") {
					$("form[name=pet-profile-form] select[name=UKENNEL]").html(res.kennel);
				} 
				if (res.flown != "") {
					$("form[name=pet-profile-form] select[name=USERDEF]").html(res.flown);
				}

				if (res.chip_manufacturer != "") {
					$("form[name=pet-profile-form] select[name=UCHIP]").html(res.chip_manufacturer);
				}
				// storing breed info in localStorage
				if (typeof res.sp_data.breeds != "undefined") {
					window.localStorage.setItem("breeds", JSON.stringify(res.sp_data.breeds));
				} else {
					window.localStorage.removeItem("breeds");
				}
				// storing breed info in localStorage
				setTimeout(function () {
					$("form[name=pet-profile-form] input").val('');
					$.mobile.changePage("#pet-profile", {
						transition: "flip"
					});
					$.map(res.pet_info, function (val, k) {
						$("form[name=pet-profile-form] input[name=UPETNAME]").val(val["UPETNAME" + res.pet_id]);
						if (val["USPECIES" + res.pet_id] != "") {
							if (typeof res.sp_data.breeds != "undefined") {
								var breeds = res.sp_data.breeds;
								if (breeds[val["USPECIES" + res.pet_id]] != "undefined") {
									var opt = "<option value=''>----</option>";
									$.each(breeds[val["USPECIES" + res.pet_id]], function (key, data) {
										opt += "<option value='" + data.ENTRY + "'>" + data.ENTRY + "</option>";
									});
									$("form[name=pet-profile-form] select[name=UBREED]").html(opt);
								}
							} else {
								var opt = "<option value=''>----</option>";
								$("form[name=pet-profile-form] select[name=UBREED]").html(opt);
							}

							// set value for breed start ------------------------
							if (val["UBREED" + res.pet_id] != "" && $("form[name=pet-profile-form] select[name=UBREED] option[value='" + val["UBREED" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=UBREED] option[value='" + val["UBREED" + res.pet_id] + "']").prop("selected", true);
								$(".other-breed").css("display", "none");
								if (val["UBREED" + res.pet_id] == "other" || val["UBREED" + res.pet_id] == "Other") {
									$("form[name=pet-profile-form] input[name=UBREED2]").val(val["UBREED2" + res.pet_id]);
									$(".other-breed").css("display", "block");
								}
							} else {

								if ((val["UBREED2" + res.pet_id] != "" && val["UBREED2" + res.pet_id] != "null" && val["UBREED2" + res.pet_id] != null) && (val["UBREED" + res.pet_id] == "" || val["UBREED" + res.pet_id] == "null" || val["UBREED" + res.pet_id] == null)) {
									$("form[name=pet-profile-form] select[name=UBREED]").val('Other');
									$("form[name=pet-profile-form] input[name=UBREED2]").val(val["UBREED2" + res.pet_id]);
									$(".other-breed").css("display", "block");
								} else {

									$("form[name=pet-profile-form] select[name=UBREED]").val('');
									$(".other-breed").css("display", "none");
								}
							}
							// set value for breed end ------------------------
						}
						if (res.species != "") {
							if ($("form[name=pet-profile-form] select[name=USPECIES] option[value='" + val["USPECIES" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=USPECIES]").val(val["USPECIES" + res.pet_id]).selectmenu("refresh");
							}

						}
						if (res.sex != "") {
							if ($("form[name=pet-profile-form] select[name=USEX] option[value='" + val["USEX" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=USEX]").val(val["USEX" + res.pet_id]).selectmenu("refresh");
							}

						}

						if (res.flown != "") {
							if (res.pet_id == 1) {
								if ($("form[name=pet-profile-form] select[name=USERDEF] option[value='" + val["USERDEF02"] + "']").length > 0) {
									$("form[name=pet-profile-form] select[name=USERDEF]").val(val["USERDEF02"]).selectmenu("refresh");
								}
							} else {
								if ($("form[name=pet-profile-form] select[name=USERDEF] option[value='" + val["UFLOWN" + res.pet_id] + "']").length > 0) {
									$("form[name=pet-profile-form] select[name=USERDEF]").val(val["UFLOWN" + res.pet_id]).selectmenu("refresh");
								}
							}

						}
						if (res.kennel != "") {
							if ($("form[name=pet-profile-form] select[name=UKENNEL] option[value='" + val["UKENNEL" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=UKENNEL]").val(val["UKENNEL" + res.pet_id]).selectmenu("refresh");
							}
						}

						if (res.chip_manufacturer != "") {
							if ($("form[name=pet-profile-form] select[name=UCHIP] option[value='" + val["UCHIP" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=UCHIP]").val(val["UCHIP" + res.pet_id]).selectmenu("refresh");
							}
						}
						//if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null && dbDateToDatePickerConversion(val["UAGE" + res.pet_id]) != "") {
						if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null) {	
							$("form[name=pet-profile-form] input[name=UAGE]").val(val["UAGE" + res.pet_id]);
						}
						if (res.color != "") {
							if ($("form[name=pet-profile-form] select[name=UCOLOR] option[value='" + val["UCOLOR" + res.pet_id] + "']").length > 0) {
								$("form[name=pet-profile-form] select[name=UCOLOR]").val(val["UCOLOR" + res.pet_id]).selectmenu("refresh");
							}

						}
						//$("form[name=pet-profile-form] input[name=UCOLOR]").val(val["UCOLOR" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=UHEIGHT]").val(val["UHEIGHT" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=ULENGTH]").val(val["ULENGTH" + res.pet_id]);
						//$("form[name=pet-profile-form] input[name=UKENNEL]").val(val["UKENNEL" + res.pet_id]);									  
						if (val["UWEIGHT" + res.pet_id] != 0 && val["UWEIGHT" + res.pet_id] != "0") {
							$("form[name=pet-profile-form] input[name=UWEIGHT]").val(val["UWEIGHT" + res.pet_id]);
						}

						$("form[name=pet-profile-form] input[name=UTEMP]").val(val["UTEMP" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=UFOOD]").val(val["UFOOD" + res.pet_id]);
						if (val["UHCERT" + res.pet_id] != "" && val["UHCERT" + res.pet_id] != null && dbDateToDatePickerConversion(val["UHCERT" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=UHCERT]").val(dbDateToDatePickerConversion(val["UHCERT" + res.pet_id]));
						}
						if (val["UHCEXP" + res.pet_id] != "" && val["UHCEXP" + res.pet_id] != null && dbDateToDatePickerConversion(val["UHCEXP" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=UHCEXP]").val(dbDateToDatePickerConversion(val["UHCEXP" + res.pet_id]));
						}
						$("form[name=pet-profile-form] input[name=UMEDS]").val(val["UMEDS" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=UCHIP]").val(val["UCHIP" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=UMCSERNB]").val(val["UMCSERNB" + res.pet_id]);
						if (val["UMCIMPDT" + res.pet_id] != "" && val["UMCIMPDT" + res.pet_id] != null && dbDateToDatePickerConversion(val["UMCIMPDT" + res.pet_id]) != "" && res.pet_id != 2) {
							$("form[name=pet-profile-form] input[name=UMCIMPDT]").val(dbDateToDatePickerConversion(val["UMCIMPDT" + res.pet_id]));
						}
						else if (val["UMCIMDT" + res.pet_id] != "" && val["UMCIMDT" + res.pet_id] != null && val["UMCIMDT" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UMCIMDT" + res.pet_id]) != "" && res.pet_id == 2) {
							$("form[name=pet-profile-form] input[name=UMCIMPDT]").val(dbDateToDatePickerConversion(val["UMCIMDT" + res.pet_id]));
						}
						//if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null && dbDateToDatePickerConversion(val["UAGE" + res.pet_id]) != "") {
						if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null) {
							$("form[name=pet-profile-form] input[name=UAGE]").val(val["UAGE" + res.pet_id]);
						}

						if (val["URABVAC" + res.pet_id] != "" && val["URABVAC" + res.pet_id] != null && dbDateToDatePickerConversion(val["URABVAC" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=URABVAC]").val(dbDateToDatePickerConversion(val["URABVAC" + res.pet_id]));
						}
						if (val["URVEXP" + res.pet_id] != "" && val["URVEXP" + res.pet_id] != null && dbDateToDatePickerConversion(val["URVEXP" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=URVEXP]").val(dbDateToDatePickerConversion(val["URVEXP" + res.pet_id]));
						}
						$("form[name=pet-profile-form] input[name=URVMFR]").val(val["URVMFR" + res.pet_id]);
						$("form[name=pet-profile-form] input[name=URVSERNB]").val(val["URVSERNB" + res.pet_id]);
						if (val["UMULTIB" + res.pet_id] != "" && val["UMULTIB" + res.pet_id] != null && dbDateToDatePickerConversion(val["UMULTIB" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=UMULTIB]").val(dbDateToDatePickerConversion(val["UMULTIB" + res.pet_id]));
						}
						if (val["UMBEXP" + res.pet_id] != "" && val["UMBEXP" + res.pet_id] != null && dbDateToDatePickerConversion(val["UMBEXP" + res.pet_id]) != "") {
							$("form[name=pet-profile-form] input[name=UMBEXP]").val(dbDateToDatePickerConversion(val["UMBEXP" + res.pet_id]));
						}
						$("form[name=pet-profile-form] input[name=UMBSERNB]").val(val["UMBSERNB" + res.pet_id]);
						if (typeof val["UIMAGE"] != "undefined") {
							$("#profile-pet-image").attr("src", val['UIMAGE']);
						}
					});
					setTimeout(function () {
						$("form[name=pet-profile-form] select").selectmenu("refresh");
					}, 2000);

				}, 1000);

				$(".dob").datepicker({
					maxDate: 0,
					changeYear: true,
                    changeMonth: true,
                    yearRange: "-100:+0"
				});
				$(".yearCal").datepicker({
					changeYear: true,
					changeMonth: true,
					yearRange: "-50:+50"
				});
			}
			hideLoader();
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fet individual pet profile information for petid: "+petId+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});

}

//function to show/hide crash menu according to server response
function display_crash_menu()
{
    jQuery(document).ready(function () {
        $.ajax({
            method: "POST",
            url: globalUrl + "tracking/display_crash_menu",
            dataType: 'json',
            success: function (response) {
                if(response.display_crash_menu == 'TRUE')
                {
                    $('#crash_menu').show();
                }
                window.fabric.Crashlytics.addLog("Success. Ending ajax request to check if crash menu to be displayed or not at " + get_date_time());
                window.fabric.Crashlytics.sendNonFatalCrash("");
            }
        });  
    });  
}

//function to check app Version
function check_for_latest_version()
{
    cordova.getAppVersion.getVersionNumber(function (versionNumber) {                   
            var vNumber = versionNumber;
            jQuery(document).ready(function () {
            	window.fabric.Crashlytics.addLog("Starting ajax request to check for app's latest version at " + get_date_time());
                $.ajax({
                    method: "POST",
                    url: globalUrl + "tracking/check_app_version",
                    data: {
                        current_version: vNumber,
                        check_platform: device.platform,
                        //update_type: update_type
                    },
                    dataType: 'json',
                    success: function (response) {
						window.fabric.Crashlytics.addLog("Success. Ending ajax request to check for app's latest version at " + get_date_time());
	                    window.fabric.Crashlytics.sendNonFatalCrash("");
                        //alert(JSON.stringify(response))
                        //alert(response.update_type)
                        /*alert(response.error.title)
                        alert(response.error.message)
                        alert(response.error.action_button.title)
                        alert(response.error.action_button.url)
                        alert(response.error.dismiss_button_title)*/
                        if (response.difference == 1) {
                            var url = '';
                            var title = response.error.title;
                            var message = response.error.message;
                            if(response.update_type == 1)
                            {
                                var buttonarr = [response.error.action_button.title, response.error.dismiss_button_title];
                                url = response.error.action_button.url;
                            } 
                            else if(response.update_type == '2')
                            {
                                var buttonarr = [response.error.action_button.title];
                                url = response.error.action_button.url;
                            }
                            else
                            {
                                var buttonarr = [response.error.dismiss_button_title];
                                //url = response.error.action_button.url;
                            }
                            
                            function onConfirm(buttonIndex) {
                                if (buttonIndex == 1) {                                    
                                        //var url = 'https://itunes.apple.com/us/app/air-animal/id1210137507?mt=8';
                                        cordova.InAppBrowser.open(url, '_system');                                    
                                }
                            }
                            navigator.notification.confirm(
                                message, // message
                                onConfirm,            // callback to invoke with index of button pressed
                                title,           // title
                                buttonarr    // buttonLabels
                            );
                        }
                    },
                    error: function (error) {
                    	//hideLoader();
						//alert(error.responseText)
						window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to check for app's latest version at " + get_date_time());
						window.fabric.Crashlytics.sendNonFatalCrash("");
                    }
                });
            });    
        // 1.0.0
        
    });
}

// dashboard ------------------------------------------

$(document).on("pagebeforeshow", "#home", function () {
	//updateUserdata();
    display_crash_menu();
    check_for_latest_version();
    
	$("#owl-demo").html('');
	//$(".pet-transit").css("display","none");
	$('.google-popup-address ul').html('');
	$(".google-popup-address").css("display", "none");
	$('.intransit-detail-list').html('');
	$('.intransit-detail-main').css("display", "none");
	$("#map_canvas").html("");
	$(".google-map").css("margin-top", "0px", 'important');
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	if (window.localStorage.getItem("loggedIn") != null) {
		//alert(JSON.stringify(userdata));
		$(".user-name").html(userdata.CONTACT);
		var address = "";
		if (typeof userdata.ADDRESS1 != "undefined" && userdata.ADDRESS1 != "" && userdata.ADDRESS1 != "null" && userdata.ADDRESS1 != null) {
			if (address != "") {
				address += ", ";
			}
			address += userdata.ADDRESS1;
		}
		if (typeof userdata.CITY != "undefined" && userdata.CITY != "" && userdata.CITY != "null" && userdata.CITY != null) {
			if (address != "") {
				address += ", ";
			}
			address += userdata.CITY;
		}
		if (typeof userdata.STATE != "undefined" && userdata.STATE != "" && userdata.STATE != "null" && userdata.STATE != null) {
			if (address != "") {
				address += ", ";
			}
			address += userdata.STATE;
		}
		if (typeof userdata.COUNTRY != "undefined" && userdata.COUNTRY != "" && userdata.COUNTRY != "null" && userdata.COUNTRY != null) {
			if (address != "") {
				address += ", ";
			}
			address += userdata.COUNTRY;
		}
		$(".user-address").html(address);
	}
	$(".loader").css("display","block");
    $("#pet_loader").show();
    window.fabric.Crashlytics.addLog("Starting ajax request to fetch dashboard information at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/dashboard_new",
		method: "POST",
		dataType: "json",
		data: {
			"userId": userdata.ACCOUNTNO
		},
		success: function (response) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to fetch dashboard information at " + get_date_time());
			$("loader").css("display","none");
            window.fabric.Crashlytics.sendNonFatalCrash("");
            $("#pet_loader").hide();
			if (response.response == "Y") {
				if (typeof response.profiles != "undefined" && response.profiles.length > 0) {
               
					      //$(".pet-transit").css("display","block");
					var html = '<div class="owl-wrapper-outer"><div class="owl-wrapper" style="width: 1270px; left: 0px; display: block; transition: all 0ms ease; transform: translate3d(0px, 0px, 0px);">';
					var coun = 0;
                    $.each(response.profiles, function (k, val) {
                        coun++;                        
						console.log(val.UIMAGE);
                        if(coun == 3){
                            $pad = 'padding-right:15px;';
                        }
                        else {
                            $pad = '';
                        }
						html += '<div class="owl-item" style="width: 127px;float:left;'+$pad+'"><div class="item"><a onclick="viewPetProfile(' + val.UPID + ')" href="javascript:void(0);"><img src="' + val.UIMAGE + '" alt="Murphy" title="Murphy" class="circle-img"/>' +
						'<h2>' + val.UPETNAME + '</h2>' +
						'</a> </div></div>';
                        if(coun == 3){
                            html += '<div class="clearfix"></div>';
                            coun = 0; 
                        }
					});
					html += '</div></div>';
					$('#owl-demo').html(html);
					/*var owl = $("#owl-demo");
					var options = new Object;
					options.itemsCustom = [
						[0, 3],
						[450, 4],
						[600, 7],
						[700, 9],
						[1000, 10],
						[1200, 12],
						[1400, 13],
						[1600, 15]
					];
					options.navigation = false;
					options.autoPlay = true;
					options.loop = true;	 
					//options.autoplayTimeout = 1000;
					//options.
					owl.owlCarousel();
					var owlData = owl.data('owlCarousel');
					owlData.reinit(options);  */

				} else {
					$("#owl-demo").html('<h4 class="no-record">No pets to display</h4>');
				}
			
			} else {

			}

		},
		error: function (error) {
			$(".loader").css("display","none");
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fetch dashboard information at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
	
	$(".loader1").css("display","block");
	window.fabric.Crashlytics.addLog("Starting ajax request to fetch awb tracking details at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/awb_tracking_details_api",
		method: "POST",
		dataType: "json",
		data: {
			"userId": userdata.ACCOUNTNO
		},
		success: function (response) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to fetch awb tracking details at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (typeof response.awb_tracking_details != "undefined" && typeof response.awb_tracking_details.marker != "undefined") {
				var markers = response.awb_tracking_details.marker;

				var tracking_details = response.awb_tracking_details.tracking_details;
				var len = markers.length;
				var markers_animate = response.awb_tracking_details.marker_animate;
				//alert(JSON.stringify(markers_animate));
				if (typeof markers_animate != "undefined" && Object.keys(markers_animate).length > 0) {
					initialize(markers, markers_animate);
				} else {
					$(".loader1").css("display","none");
					initialize(markers, "");
				}

				// source flight info start -----------------------------------------
				if (typeof markers["origin"] != "undefined" && Object.keys(markers["origin"]).length > 0) {
					var html = '<li class="origin-airport airport"><div class="flight-record">' +
						'<h3>From :<span>' + markers["origin"]['title'] + '</span></h3>' +
						'<h4 class="air-add">' + markers["origin"]['city'] + ', ' + markers["origin"]['country'] + '</h4>' +
						'</div>' +
						'<div class="date">' +
						'<label>Date:</label>';
					var date = "-";
					var time = "-";
					var flightNo = "-";
					if (typeof tracking_details[markers["origin"]["title"]] != "undefined" && typeof tracking_details[markers["origin"]["title"]]["DEP"] != "undefined") {
						var depInfo = tracking_details[markers["origin"]["title"]]["DEP"];
						if (typeof depInfo.StatusDateTime_EventStatus != "undefined" && (depInfo.StatusDateTime_EventStatus == "Completed" || depInfo.StatusDateTime_EventStatus == "Planned") && depInfo.StatusDateTime != "") {
							//html += depInfo.StatusDateTime;
							var dtTime = depInfo.StatusDateTime.split("T");

							if (dtTime != "" && dtTime != "undefined" && dtTime != null) {
								date = getDateFormat("Y-m-d", "mm/dd/Y", dtTime[0]);

								time = getTimeFormat("h:i F", dtTime[1]);
							}
							if (depInfo.FlightNumber != "") {
								flightNo = depInfo.FlightNumber;
							}

						}

					}
					html += date + '</div>' +
					'<div class="time">' +
					'<label>Time:</label>&nbsp;&nbsp;' + time + '</div>' +
					'<div class="flight">';

					$('.google-popup-address ul').html(html);
					$(".google-popup-address").css("display", "block");
					$('.google-popup-address ul').append('<li> <span><img src="images/intransit-icon.png" alt="Intransit"  title="Intransit" /></span> </li>');
				}

				// source flight info end --------------------------------------------------

				// destination flight info start ----------------------------
				if (typeof markers["destination"] != "undefined" && Object.keys(markers["destination"]).length > 0) {
					var html = '<li class="desc-airport airport"><div class="flight-record">' +
						'<h3>To : <span>' + markers["destination"]['title'] + '</span></h3>' +
						'<h4 class="air-add">' + markers["destination"]['city'] + ', ' + markers["destination"]['country'] + '</h4>' +
						'</div>' +
						'<div class="date">' +
						'<label>Date:</label>';
					var date = "-";
					var time = "-";
					var flightNo = "-";
					if (typeof tracking_details[markers["destination"]['title']] != "undefined" && typeof tracking_details[markers["destination"]['title']]["RCF"] != "undefined") {
						var depInfo = tracking_details[markers["destination"]['title']]["RCF"];
						if (typeof depInfo.StatusDateTime_EventStatus != "undefined" && (depInfo.StatusDateTime_EventStatus == "Completed" || depInfo.StatusDateTime_EventStatus == "Planned") && depInfo.StatusDateTime != "") {
							var dtTime = depInfo.StatusDateTime.split("T");

							if (dtTime != "" && dtTime != "undefined" && dtTime != null) {
								date = getDateFormat("Y-m-d", "mm/dd/Y", dtTime[0]);
								time = getTimeFormat("h:i F", dtTime[1]);
							}
							if (depInfo.FlightNumber != "") {
								flightNo = depInfo.FlightNumber;
							}

						}
					}
					html += date + '</div>' +
					'<div class="time">' +
					'<label>  Time:</label>&nbsp;&nbsp;' + time + '</div>' +
					'<div class="flight">';
					$('.google-popup-address ul').append(html);
				}

				if ($('.air-add').length > 0) {
					var tallest = 0;
					$('.air-add').each(function () {
						var objHeight = $(this).height();
						if (tallest < objHeight) {
							tallest = objHeight;
						}
					});
					$('.air-add').css("height", tallest + "px");
				}

				if ($('.airport').length > 0) {
					var tallest = 0;
					$('.airport').each(function () {
						var objHeight = $(this).height();
						if (tallest < objHeight) {
							tallest = objHeight;
						}
					});
					$('.airport').css("height", tallest + 20 + "px");
				}
				// destination flight info end ------------------------------

				// tracking details start ------------------------------
				$('.intransit-detail-list').html("");
				$(".intransit-detail-main").css("display", "none");
				if (Object.keys(markers).length > 0) {
					var count = 0;

					var secFlag = false;
					$.each(markers, function (k, val) {
						var html = "";

						html += '<li class="air-' + count + '">' +
						'<div class="intransit-detail-list-inner">';
						if (count == 0) {
							html += '<span class="via-airport-from-name">' + val.title + '</span>';
						} else if (count < Object.keys(markers).length - 1) {
							html += '<span class="via-airport-name"><small>via</small>' + val.title + '</span>';
						} else if (count == Object.keys(markers).length - 1) {
							html += '<span class="via-airport-name">' + val.title + '</span>';
						}
						html += '</div>' +
						'<div class="via-detail">' +
						'<span class="via-name">' + val.city + ', ' + val.country + '</span>';
						var date = "-";
						var time = "-";
						var flightNumber = "-";
						if (typeof tracking_details[val.title] != "undefined") {
							$.each(tracking_details[val.title], function (key, value) {
								if (value.StatusDateTime_EventStatus == "Completed" || value.StatusDateTime_EventStatus == "Planned") {
									if (typeof value.StatusDateTime != "undefined" && value.StatusDateTime != "") {
										var dtTime = value.StatusDateTime.split("T");

										if (dtTime != "" && dtTime != "undefined" && dtTime != null) {
											date = getDateFormat("Y-m-d", "mm/dd/Y", dtTime[0]);
											time = getTimeFormat("h:i F", dtTime[1]);
										}
									}
									html += '<span class="via-date">Date: <strong>' + date + '</strong></span>' +
									'<span class="via-date">Time: <strong>' + time + '</strong></span>';
									if (typeof value.FlightNumber != "undefined" && value.FlightNumber != "") {
										html += '<span class="via-date">Flight: <strong>' + value.FlightNumber + '</strong></span>';
									}
									if (typeof value.Note != "undefined" && value.Note != "") {
										var note = value.Note;
										html += '<div class="clearfix"></div><span class="via-status">Status :<strong>' + note.replace("Goods", "Pets") + '</strong></span>';
									}
								}

							});
						}

						html += '</div>' +
						'</li>';

						$('.intransit-detail-list').append(html);
						$(".intransit-detail-main").css("display", "block");
						count++;
					});
					var liCount = $('.intransit-detail-list li').length;
					if (liCount < 5) {
						var width = 100 / (liCount - 1);
						$('.intransit-detail-list li').css("width", width + "%");
						$('.intransit-detail-list li').last().css("width", '7px', 'important');
					}
				}
				if (typeof markers_animate != "undefined" && Object.keys(markers_animate).length > 0) {
					var count = 0;
					$.each(markers_animate, function (k, val) {
						if (count < Object.keys(markers_animate).length - 1 && val.line == 1) {
							$('.air-' + k).addClass("complete");
						}
						if (count == Object.keys(markers_animate).length - 1 && val.line == 1) {
							$('.air-' + k).addClass("active open");
							var prntHeight = $('.air-' + k).find(".via-detail").height();
							$(".google-map").css("margin-top", (prntHeight + 7) + "px", 'important');
						}
						
						count++;
					});
				} else {
					
					$('.air-0').addClass("active open");
					var prntHeight = $('.air-0').find(".via-detail").height();
					$(".google-map").css("margin-top", (prntHeight + 7) + "px", 'important');
				}
				if($(".complete").length == 0)
				{
					$('.air-0').addClass("active open");
					var prntHeight = $('.air-0').find(".via-detail").height();
					$(".google-map").css("margin-top", (prntHeight + 7) + "px", 'important');
				}
				$(".via-airport-from-name,.via-airport-name").on("tap", function () {
					$(".via-detail").css("display", "none");
					$(this).parent().next(".via-detail").css("display", "block", "important");

					$('.intransit-detail-list li').removeClass("open");
					$(this).parent().parent().addClass("open");
					var prntHeight = $(this).parent().next('.via-detail').height();
					$(".google-map").css("margin-top", (prntHeight + 10) + "px", 'important');
				});
				// tracking details end -------------------------------
			} else {
				
				initialize("", "");
			}
		$(".loader1").css("display","none");
		},
		error: function (error) {
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to fetch awb tracking details at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			$(".loader1").css("display","none");
			getMessage("unable to fetch map.","OK");
		}
	});
});

//function to crash the app
function crash_app()
{
    //alert('crashed')
    //window.fabric.Crashlytics.sendCrash();
    hockeyapp.forceCrash();
}

//Save Destination

function save_destination()
{
    var userdata = JSON.parse(window.localStorage.getItem("userdata"));
    var URADD1 = $('#travel_uradd1').val();
    var URADD2 = $('#travel_uradd2').val();
    var URCITY = $('#travel_urcity').val();
    var URST = $('#travel_urst').val();
    var URZIP = $('#travel_urzip').val();
    var UDESTCTY = $('#travel_udestcty').val();
    var UPHONE4 = $('#travel_uphone4').val();
    window.fabric.Crashlytics.addLog("Starting ajax request to edit travel plan at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/edit_travel_plan",
		method: "POST",
		dataType: "json",
		data: {
			"ACCOUNTNO": userdata.ACCOUNTNO,
            "URADD1":URADD1,
            "URADD2":URADD2,
            "URCITY":URCITY,
            "URST":URST,
            "URZIP":URZIP,
            "UDESTCTY":UDESTCTY,
            "UPHONE4":UPHONE4
		},
		success: function (response) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to edit travel plan at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show(response.message, 'short', 'bottom', function (a) {
				//console.log('toast success: ' + a)
			}, function (b) {
				//console.log('toast error: ' + b)
			});
        },
        error:function(error){
            window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to edit travel plan at " + get_date_time());
            window.fabric.Crashlytics.sendNonFatalCrash("");
            window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				//console.log('toast success: ' + a)
			}, function (b) {
				//console.log('toast error: ' + b)
			});
        }
    });
}

// travel plan page ---------------------------------------------

$(document).on("pagebeforeshow", "#travel-plan", function () {
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
//alert(globalUrl)
//showLoader("Loading page...");
    window.fabric.Crashlytics.addLog("Starting ajax request to see travel plan at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/travel_plan",
		method: "POST",
		dataType: "json",
		data: {
			"userId": userdata.ACCOUNTNO
		},
		success: function (response) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to see travel plan at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (response.response == "Y" && typeof response.user_info != "undefined") {
				$.each(response.user_info, function (k, val) {
                    window.fabric.Crashlytics.addLog("Displayed information for travel plan.");
                    window.fabric.Crashlytics.sendNonFatalCrash("");
					if (val != '' && val != null && val != "null") {
                        if(k == 'URADD1')
                        {
                            $("#travel_uradd1").val(val);
                        }
                        if(k == 'URADD2')
                        {
                            $("#travel_uradd2").val(val);
                        }
                        if(k == 'URCITY')
                        {
                            $("#travel_urcity").val(val);
                        }
                        if(k == 'URST')
                        {
                            $("#travel_urst").val(val);
                        }
                        if(k == 'URZIP')
                        {
                            $("#travel_urzip").val(val);
                        }
                        if(k == 'UDESTCTY')
                        {
                            $("#travel_udestcty").val(val);
                        }
                        if(k == 'UPHONE4')
                        {
                            $("#travel_uphone4").val(val);
                        }
						if (k != "UOTRDATE" && k != "UPLDATES" && k != "UDUDATE") {
							$("form[name=travel-plan-form] .travel-" + k).text(val);
						} else {
							$("form[name=travel-plan-form] .travel-" + k).text(dbDateToDatePickerConversion(val));
						}
					} else {
						$("form[name=travel-plan-form] .travel-" + k).text("-");
					}

				});

			}
		},
		error: function (error) {
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to see travel plan at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
});

// map section ----

function initialize(markers, markers_animate) {
	window.fabric.Crashlytics.addLog("Starting ajax request to display map on dashboard at " + get_date_time());
	var map = new google.maps.Map(
			document.getElementById("map_canvas"), {
			center: new google.maps.LatLng(37.4419, -122.1419),
			zoom: 9,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
		});
	var lat_lng = [];
	var latlngbounds = new google.maps.LatLngBounds();
	if (Object.keys(markers).length > 0 && markers != "") {
		$.each(markers, function (k, val) {
			count = 0;
			var data = val;
			var myLatlng = new google.maps.LatLng(data.lat, data.lng);
			lat_lng.push(myLatlng);
			var marker = new google.maps.Marker({
					position: myLatlng,
					map: map,
					icon: "images/Flight_icon.png",
					title: data.title
				});

			var lineSymbol = {
				path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
				strokeOpacity: 1,
				strokeWeight: 2,
				scale: 1,
				strokeColor: "#00ae32"
			};

			infoWindow = new google.maps.InfoWindow({
					content: "<i class='fa fa-spinner fa-spin fa-lg' style='color: #FFA46B;' title='Loading...'></i> Loading..."
				});

			latlngbounds.extend(marker.position);
			(function (marker, data) {
				google.maps.event.addListener(marker, "click", function (e) {
					infoWindow.setContent("Location:" + data.title);
					infoWindow.open(map, marker);
				});
			})(marker, data);

			//***********ROUTING****************//

			if (Object.keys(lat_lng).length > 1) {
				if (markers_animate[count].line == 1) {
					var poly = new google.maps.Polyline({
							map: map,
							strokeColor: '#00ae32',
							path: lat_lng,
							geodesic: true,
							strokeOpacity: 1.0,
							strokeWeight: 1,
							icons: [{
									icon: lineSymbol,
									offset: '0',
									repeat: '36px'
								}
							],
						});
				} else {
					var lineSymbol = {
						path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
						strokeOpacity: 1,
						strokeWeight: 2,
						scale: 1,
						strokeColor: "#2371d1"
					};
					var poly = new google.maps.Polyline({
							map: map,
							strokeColor: '#2371d1',
							strokeOpacity: 1.0,
							strokeWeight: 1,
							geodesic: true,
							icons: [{
									icon: lineSymbol,
									offset: '0',
									repeat: '36px',

								}
							],
							path: lat_lng
						});
				}
				lat_lng = [];
				lat_lng.push(myLatlng);
			}

			var lineSymbol = {
				path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
				scale: 4,
				strokeColor: '#4986E7',
				fillOpacity: 0
			};

			// Create the polyline and add the symbol to it via the 'icons' property.
			var line = new google.maps.Polyline({
					path: markers_animate,
					icons: [{
							icon: lineSymbol,
							offset: '100%'
						}
					],
					map: map
				});

			animateCircle(line);

			// Use the DOM setInterval() function to change the offset of the symbol
			// at fixed intervals.
			function animateCircle(line) {
				var count = 0;
				window.setInterval(function () {
					count = (count + 1) % 200;

					var icons = line.get('icons');
					icons[0].offset = (count / 2) + '%';
					line.set('icons', icons);
				}, 100);
			}
			count++;
		});
		map.setCenter(latlngbounds.getCenter());
		map.fitBounds(latlngbounds);
	}

}

// update my profile ---------------------------------------------

function updateMyProfile() {

	$(".error-message").html("");
	//var name = $.trim($("form[name=profile-form] input[name=CONTACT]").val());
	var pickDate = $("form[name=profile-form] input[name=UPUDATE]").val();
	var delvDate = $("form[name=profile-form] input[name=UDLDATE]").val();
    

	/* if (name != "") {
		$("form[name=profile-form] input[name=U_CONTACT]").val(name.toUpperCase());
		var nameArr = name.split(" ");
		if (nameArr.length > 1) {
			var lastname = nameArr[nameArr.length - 1];
			$("form[name=profile-form] input[name=U_LASTNAME]").val(lastname.toUpperCase());
			$("form[name=profile-form] input[name=LASTNAME]").val(lastname);
		}
	} */
	//var city = $("form[name=profile-form] select[name=CITY] option:selected").val();
	/* if (city != "") {
		var cEntry = $("form[name=profile-form] input[name=CITY]").val();
		$("form[name=profile-form] input[name=U_CITY]").val(cEntry.toUpperCase());
	} */
	//var country = $("form[name=profile-form] select[name=COUNTRY] option:selected").val();
	/* if (country != "") {
		var coEntry = $("form[name=profile-form] select[name=COUNTRY] option:selected").attr("entry");
		$("form[name=profile-form] input[name=U_COUNTRY]").val(coEntry.toUpperCase());
	} */
	//var state = $("form[name=profile-form] select[name=STATE] option:selected").val();
	/* if (state != "") {
		var sEntry = $("form[name=profile-form] select[name=STATE] option:selected").attr("entry");
		$("form[name=profile-form] input[name=U_STATE]").val(sEntry.toUpperCase());
	} */
	var error = 0;
	/* if (name == "") {
		$("form[name=profile-form] input[name=CONTACT]").parent().next(".error-message").html("* required");
		error++;
	} */
	if (pickDate != "" && delvDate != "" && (new Date(pickDate) > new Date(delvDate))) {
		error++;
		$("form[name=profile-form] input[name=UDLDATE]").parent().next(".error-message").html("* Delivery date must be after pick up date");
	}
	$("form[name=profile-form] input[type=tel]").each(function () {
		if ($.trim($(this).val()) != "") {
			if (validatePhn($.trim($(this).val())) == false) {
				error++;
				$(this).parent().next(".error-message").html("* Invalid phone no.");
			}
		}
	});

	setTimeout(function () {
		if (error == 0) {
			showLoader("Please Wait....");
			var formdata = $("form[name=profile-form]").serializeArray();
			var userdata = JSON.parse(window.localStorage.getItem("userdata"));
			//var columeName = '';
			//var columeValue = '';
			//var columeName1 = '';
			//var columeValue1 = '';
			var info = {};
			info['userId'] = userdata.ACCOUNTNO;

			$.each(formdata, function (k, val) {
				/*if (val.name != "UBLEMAIL" && val.name != "s_email" && val.name != "UPUDATE" && val.name != "UDLDATE") {
					if (columeName1 != "") {
						columeName1 += ",";
						columeValue1 += ",";
					}
					columeName1 += val.name;
					columeValue1 += $.trim(val.value);
				} else if ((val.name == "UPUDATE" || val.name == "UDLDATE") && $.trim(val.value) != "") {
					if (columeName != "") {
						columeName += ",";
						columeValue += ",";
					}
					columeName += val.name;
					columeValue += getDbDateFormat($.trim(val.value));
				}*/
				if (val.name != "s_email" && val.name != "CONTACT" && val.name != "UPUDATE" && val.name != "UDLDATE") {
					info[val.name] = $.trim(val.value);
				} else if ((val.name == "UPUDATE" || val.name == "UDLDATE") && $.trim(val.value) != ""){
					info[val.name] = getDbDateFormat(val.value);
				}
			});
			var accNo = userdata.ACCOUNTNO;
			//accNo = accNo.replace("&","|");
			//alert(accNo);
			/*var tableName = 'CONTACT2';
			var tableName1 = 'CONTACT1';
			var myObject = new Object();
			myObject.columeName = columeName;
			myObject.where = accNo;
			myObject.tableName = tableName;
			myObject.columeValue = columeValue;
			var myString = JSON.stringify(myObject);

			var myObject1 = new Object();
			myObject1.columeName = columeName1;
			myObject1.where = accNo;
			myObject1.tableName = tableName1;
			myObject1.columeValue = columeValue1;
			var myString1 = JSON.stringify(myObject1);
			console.log("ACC "+updateContactUrl + "?value1=" + myString);*/
			/*$.ajax({
				method: "POST",
				dataType: "json",
				url: updateContactUrl,
				data:myString,
				contentType: "application/json; charset=utf-8",
				success: function (res) {
					//alert(JSON.stringify(res));
					var response = JSON.parse(res);
					if (typeof response.Status != "undefined" && (response.Status == "Success" || response.Status == "")) {
						$.ajax({
							method: "POST",
							dataType: "json",
							url:updateContactUrl,
							data:myString1,
							contentType: "application/json; charset=utf-8",
							success: function (res1) {
								var response1 = JSON.parse(res1);
								if (typeof response1.Status != "undefined" && response1.Status == "Success") {*/
									var userdata = JSON.parse(window.localStorage.getItem("userdata"));
									window.fabric.Crashlytics.addLog("Starting ajax request to update account information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
                                    //alert(JSON.stringify(info))
									$.ajax({
										method: "POST",
										dataType: "json",
										data: info,
										url: globalUrl + "my_account/updateAccountInfo",
										success: function (response) {
                                            //alert(response.response)
											//window.fabric.Crashlytics.addLog("Success. Ending ajax request to update account information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
											//window.fabric.Crashlytics.sendNonFatalCrash("");
                                            //hideLoader();
											if (response.response == "Y") {
												hideLoader();
												var userdata = JSON.parse(window.localStorage.getItem("userdata"));
												userdata.ACCOUNTNO = userdata.ACCOUNTNO;
												userdata.CONTACT = info['CONTACT'];
												userdata.s_email = userdata.s_email;
												userdata.COUNTRY = info['COUNTRY'];
												userdata.STATE = info['STATE'];
												userdata.CITY = info['CITY'];
												userdata.ADDRESS1 = info['ADDRESS1'];
												var address = "";
												if (typeof userdata.ADDRESS1 != "undefined" && userdata.ADDRESS1 != "" && userdata.ADDRESS1 != null && userdata.ADDRESS1 != "null") {
													if (address != "") {
														address += ", ";
													}
													address += userdata.ADDRESS1;
												}
												if (typeof userdata.CITY != "undefined" && userdata.CITY != "" && userdata.CITY != "null" && userdata.CITY != null) {
													if (address != "") {
														address += ", ";
													}
													address += userdata.CITY;
												}
												if (typeof userdata.STATE != "undefined" && userdata.STATE != "" && userdata.STATE != "null" && userdata.STATE != null) {
													if (address != "") {
														address += ", ";
													}
													address += userdata.STATE;
												}
												if (typeof userdata.COUNTRY != "undefined" && userdata.COUNTRY != "" && userdata.COUNTRY != "null" && userdata.COUNTRY != null) {
													if (address != "") {
														address += ", ";
													}
													address += userdata.COUNTRY;
												}
												$(".user-address").html(address);
												window.localStorage.setItem("userdata", JSON.stringify(userdata));
												window.plugins.toast.show(response.message, 'short', 'bottom', function (a) {
													console.log('toast success: ' + a)
												}, function (b) {
													console.log('toast error: ' + b)
												});

											} else {
												hideLoader();
												window.fabric.Crashlytics.addLog("Error! Ending ajax request to update account information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
												window.fabric.Crashlytics.sendNonFatalCrash("");
												window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
													console.log('toast success: ' + a)
												}, function (b) {
													console.log('toast error: ' + b)
												});
											}
										},
										error: function (error) {
											hideLoader();
											window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to update account information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
											window.fabric.Crashlytics.sendNonFatalCrash("");
											window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
												console.log('toast success: ' + a)
											}, function (b) {
												console.log('toast error: ' + b)
											});
										}
									});
								/*} else {
									hideLoader();
									window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
										console.log('toast success: ' + a)
									}, function (b) {
										console.log('toast error: ' + b)
									});
								}
							},
							error: function (error1) {
								hideLoader();
								window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
									console.log('toast success: ' + a)
								}, function (b) {
									console.log('toast error: ' + b)
								});
							}
						});

					} else {
						hideLoader();
						window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
							console.log('toast success: ' + a)
						}, function (b) {
							console.log('toast error: ' + b)
						});
					}
				},
				error: function (error) {
					hideLoader();
					//alert(JSON.stringify(error));
					window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
			});*/
		} else {
			$('html,body').animate({
				scrollTop: ($('form[name=profile-form] .error-message:not(:empty):first').offset().top) - 100
			},
				'slow');
		}

	}, 1000);

}

// update veterian information
function updateVetInfo() {
    
	$(".error-message").html("");
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));  
  var formdata = $("form[name=vet-info-form]").serializeArray();
	var error = 0;
	var myString = "";
	var columeName = "";
	var columeValue = "";
	var info = {};
	$("form[name=vet-info-form] input[type=tel]").each(function () {
		if ($.trim($(this).val()) != "") {
			if (validatePhn($.trim($(this).val())) == false) {
				error++;
				$(this).parent().next(".error-message").html("* Invalid phone no.");
			}
		}
	});
	$("form[name=vet-info-form] input[type=email]").each(function () {
		if ($.trim($(this).val()) != "") {
			if (validateEmail($.trim($(this).val())) == false) {
				error++;
				$(this).parent().next(".error-message").html("* Invalid email id.");
			}
		}
	});
	$.each(formdata, function (k, val) {
		if ((val.name == "UVCONTACT" || val.name == "UVPRACNAME") && $.trim(val.value) == "") {
			error++;
			$("form[name=vet-info-form] input[name=" + val.name + "]").parent().next(".error-message").html("* Required");
		}

		/*if (columeName != "") {
			columeName += ",";
			columeValue += ",";
		}
		columeName += val.name;
		columeValue += $.trim(val.value);*/
		info[val.name] = $.trim(val.value);
	});
	info["userId"] = userdata.ACCOUNTNO;
	if (error == 0) {
		showLoader("Please Wait....");
		/*var tableName = 'CONTACT2';
		var myObject = new Object();
		myObject.columeName = columeName;
		myObject.where = userdata.ACCOUNTNO;
		myObject.tableName = tableName;
		myObject.columeValue = columeValue;
		var myString = JSON.stringify(myObject);
		console.log(updateContactUrl + "?value1=" + myString);*/
		/*$.ajax({
			method: "POST",
			dataType: "json",
			url: updateContactUrl,
			data: myString,
			contentType: "application/json; charset=utf-8",
			success: function (response) {
				var res = JSON.parse(response);
				if (typeof res.Status != "undefined" && res.Status == "Success") {*/
        window.fabric.Crashlytics.addLog("Starting ajax request to update veterian information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
					$.ajax({
						method: "POST",
						dataType: "json",
						data: info,
						url: globalUrl + "my_account/updateVetInfo",
						success: function (response) {
							window.fabric.Crashlytics.addLog("Success. Ending ajax request to update veterian information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
							window.fabric.Crashlytics.sendNonFatalCrash("");
							if (response.response == "Y") {
								hideLoader();
								getMessage(response.message, "OK");
							} else {
								hideLoader();
								window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
									console.log('toast success: ' + a)
								}, function (b) {
									console.log('toast error: ' + b)
								});
							}
						},
						error: function (error) {
							window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to update veterian information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
							window.fabric.Crashlytics.sendNonFatalCrash("");
							window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
								console.log('toast success: ' + a)
							}, function (b) {
								console.log('toast error: ' + b)
							});
						}
					});
				/*} else {
					hideLoader();
					window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
			},
			error: function (error) {
				hideLoader();
				window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});*/
	} else {
		$('html,body').animate({
			scrollTop: ($('form[name=vet-info-form] .error-message:not(:empty):first').offset().top) - 100
		},
			'slow');
	}
}

// update pet information ---------------------------------------------------------------

function updatePetDetails(obj) {
    
	$(".error-message").html("");
	var formdata = $("form[name=pet-profile-form]").serializeArray();
	var error = 0;
	//var columeName = "";
	//var columeValue = "";
	//var myString = "";
	var info = {};
	var petId = $(obj).attr("petId");
	var action = $(obj).attr("petAction");
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	info['userId'] = userdata.ACCOUNTNO;
	$.each(formdata, function (k, val) {
		console.log(val.name + "=" + val.value);
		if ((val.name == "UPETNAME" || val.name == "UBREED" || val.name == "USERDEF") && $.trim(val.value) == "") {
			if (val.name == "UPETNAME") {
				$("form[name=pet-profile-form] input[name=UPETNAME]").parent().next(".error-message").html("* required");
			}
			if (val.name == "UBREED" || val.name == "USERDEF") {

				$("form[name=pet-profile-form] select[name=" + val.name + "]").parent().parent().next(".error-message").html("* required");
			}
			error++;
		}
		if (val.name == "UWEIGHT" && $.trim(val.value) != "" && $.isNumeric($.trim(val.value)) == false)
		{
			error++;
			$("form[name=pet-profile-form] input[name=UWEIGHT]").parent().next(".error-message").html("* Weight must be in digits");
		}
		if (val.name == 'USERDEF' && $.trim(val.value) != "") {
			/*if (columeName != "") {
				columeName += ",";
				columeValue += ",";
			}*/
			if (petId == 1) {
				//columeName += "USERDEF02";
				info["USERDEF02"] = $.trim(val.value);
			} else {
				//columeName += "UFLOWN" + petId;
				info["UFLOWN" + petId] = $.trim(val.value);
			}
			//columeValue += $.trim(val.value);
		} else if ((val.name == 'UMCIMPDT' && petId == 2) && $.trim(val.value) != "") {
			/*if (columeName != "") {
				columeName += ",";
				columeValue += ",";
			}
			columeName += 'UMCIMDT' + petId;
			columeValue += getDbDateFormat($.trim(val.value));*/
			info['UMCIMDT' + petId] = getDbDateFormat($.trim(val.value));
		} else {

			if ((val.name == "UHCERT" || val.name == "UHCEXP" || val.name == "UMCIMPDT" || val.name == "URABVAC" || val.name == "URVEXP" || val.name ==
					"UMULTIB" || val.name == "UMBEXP" || val.name== "UFAVN") && $.trim(val.value) != "") {
				/*if (columeName != "") {
					columeName += ",";
					columeValue += ",";
				}
				columeName += val.name + petId;
				columeValue += getDbDateFormat(val.value);*/
				info[val.name + petId] = getDbDateFormat(val.value);
			} else if (val.name == "UBREED" && ($.trim(val.value) == "other" || $.trim(val.value) == "Other")) {
				/*if (columeName != "") {
					columeName += ",";
					columeValue += ",";
				}
				columeName += "UBREED2" + petId;
				columeValue += $.trim($("form[name=pet-profile-form] input[name=UBREED2]").val());
				columeName += ",UBREED" + petId;
				columeValue += $.trim(val.value);*/
				info["UBREED2" + petId] = $.trim($("form[name=pet-profile-form] input[name=UBREED2]").val());
				info["UBREED" + petId] = $.trim(val.value);
			} else if (val.name == "UBREED" && $.trim(val.value) != "other" && $.trim(val.value) != "Other") {
				/*if (columeName != "") {
					columeName += ",";
					columeValue += ",";
				}
				columeName += "UBREED2" + petId;
				columeValue += ",";
				columeName += ",UBREED" + petId;
				columeValue += $.trim(val.value);*/
				info["UBREED" + petId] = $.trim(val.value);
				info["UBREED2" + petId] = "";
			} else if (val.name != "UBREED2" && $.trim(val.value) != "") {
				/*if (columeName != "") {
					columeName += ",";
					columeValue += ",";
				}
				columeName += val.name + petId;
				columeValue += $.trim(val.value);*/
				info[val.name + petId] = $.trim(val.value);
			}

		}

	});

	if (error == 0) {
		showLoader("Updating...");
		/*var tableName = "CONTACT2";
		var myObject = new Object();
		myObject.tableName = tableName;
		myObject.where = userdata.ACCOUNTNO;
		myObject.columeName = columeName;
		myObject.columeValue = columeValue;
		myString = JSON.stringify(myObject);
		console.log("Acc " + JSON.stringify(myObject));
		console.log("url " + updateContactUrl + "?value1=" + myString);
		console.log("pet profile update url " + updateContactUrl);*/
		/*$.ajax({
			method: "POST",
			dataType: "json",
			url: updateContactUrl,
			data:myString,
			contentType: "application/json; charset=utf-8",
			success: function (response) {
				var res = JSON.parse(response);
				if (typeof res.Status != "undefined" && res.Status == "Success") {*/
        window.fabric.Crashlytics.addLog("Starting ajax request to modify pet information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
					$.ajax({
						method: "POST",
						dataType: "json",
						url: globalUrl + "my_account/modify_pet_profile/" + petId + "/" + action,
						data: info,
						success: function (success) {
							window.fabric.Crashlytics.addLog("Success. Ending ajax request to modify pet information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
							window.fabric.Crashlytics.sendNonFatalCrash("");
							if (success.response == "Y") {
								// Profile-image upload section start------------------
								var imgSrc = $("#profile-pet-image").attr("src");
								if (imgSrc.startsWith('file://')) {

									window.resolveLocalFileSystemURL(imgSrc, function (fileEntry) {
										fileEntry.file(function (file) {
											var options = new FileUploadOptions();
											options.fileKey = "profileImage";
											options.fileName = file.name;
											options.mimeType = file.type;
											options.chunkedMode = false;
											var params = {};
											params.userId = userdata.ACCOUNTNO;
											params.petId = petId;
											options.params = params;
											var ft = new FileTransfer();
											ft.upload(imgSrc, encodeURI(profile_image_url), function (r) {
												//alert(JSON.stringify(r));
												$.mobile.changePage('#pet-profile-listing', {
													transition: "flip"
												});
												hideLoader();
												window.plugins.toast.show(success.message, 'short', 'bottom', function (a) {
													console.log('toast success: ' + a)
												}, function (b) {
													console.log('toast error: ' + b)
												});
											}, function (err) {
												hideLoader();
												//alert(JSON.stringify(err))
												window.plugins.toast.show("There is something wrong with the image. Please try again.", 'short', 'bottom', function (a) {
													console.log('toast success: ' + a)
												}, function (b) {
													console.log('toast error: ' + b)
												});
											}, options);
										});
									},
										function (fail) {});

								}
								// Profile-image upload section end------------------
								else {
									$.mobile.changePage('#pet-profile-listing', {
										transition: "flip"
									});
									hideLoader();
									window.plugins.toast.show(success.message, 'short', 'bottom', function (a) {
										console.log('toast success: ' + a)
									}, function (b) {
										console.log('toast error: ' + b)
									});
								}

							} else {
								$.mobile.changePage('#pet-profile-listing', {
									transition: "flip"
								});
								hideLoader();
								window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
									console.log('toast success: ' + a)
								}, function (b) {
									console.log('toast error: ' + b)
								});
							}

						},
						error: function (fail) {
							hideLoader();
              				window.fabric.Crashlytics.addLog(logErrorDetails(fail) + " Ending ajax request to modify pet information for Account: "+userdata.ACCOUNTNO+" at " + get_date_time());
              				window.fabric.Crashlytics.sendNonFatalCrash("");
							window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
								console.log('toast success: ' + a)
							}, function (b) {
								console.log('toast error: ' + b)
							});
						}
					});
				/*}
			},
			error: function (error) {
				hideLoader();
				window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});*/

	} else {
		$('html,body').animate({
			scrollTop: ($('form[name=pet-profile-form] .error-message:not(:empty):first').offset().top) - 100
		},
			'slow');
	}
}

function deletePet(petId) {
    
	navigator.notification.confirm(
		'Are you sure you want to remove this pet?', // message
		function (btnIndex) {
		if (btnIndex == 1) {
			var formFields = $("form[name=pet-profile-form]").serializeArray();
			var userdata = JSON.parse(window.localStorage.getItem("userdata"));
			var columeName = "";
			var columeValue = "";
			var info = {};
			showLoader("Removing pet...");
			info['userId'] = userdata.ACCOUNTNO;
			$.each(formFields, function (k, val) {
				if (columeName != "") {
					columeName += ",";
					columeValue += ",";
				}
				if (val.name == 'USERDEF') {
					if (petId == 1) {
						columeName += "USERDEF02";
						info["USERDEF02"] = '';
					} else {
						columeName += "UFLOWN" + petId;
						info["UFLOWN" + petId] = '';
					}
				} else if (val.name == 'UMCIMPDT' && petId == 2) {
					columeName += 'UMCIMDT' + petId;
					info['UMCIMDT' + petId] = '';
				} else {
					columeName += val.name + petId;
					info[val.name + petId] = '';
				}
				//columeValue += null;

			});
			/* var tableName = "CONTACT2";
			var myObject = new Object();
			myObject.where = userdata.ACCOUNTNO;
			myObject.columeName = columeName;
			myObject.columeValue = columeValue;
			myObject.tableName = tableName;
			var myString = JSON.stringify(myObject);
			console.log(updateContactUrl + "?value1=" + myString);
			$.ajax({
				method: "POST",
				dataType: "json",
				url: updateContactUrl,
				data:myString,
				contentType: "application/json; charset=utf-8",
				success: function (response) {
					var res = JSON.parse(response);
					if (typeof res.Status != "undefined" && res.Status == "Success") { */
          window.fabric.Crashlytics.addLog("Starting ajax request to delete pet information for Petid: "+petId+" at " + get_date_time());
						$.ajax({
							method: "POST",
							dataType: "json",
							url: globalUrl + "my_account/modify_pet_profile/" + petId + "/delete",
							data: info,
							success: function (success) {
								window.fabric.Crashlytics.addLog("Success. Ending ajax request to delete pet information for Petid: "+petId+" at " + get_date_time());
								window.fabric.Crashlytics.sendNonFatalCrash("");
								hideLoader();
								window.plugins.toast.show("Pet removed successfully.", 'short', 'bottom', function (a) {
									console.log('toast success: ' + a)
								}, function (b) {
									console.log('toast error: ' + b)
								});
								$.mobile.changePage("#pet-profile-listing", {
									allowSamePageTransition: true
								});

							},
							error: function (fail) {
								hideLoader();
								window.fabric.Crashlytics.addLog(logErrorDetails(fail) + " Ending ajax request to delete pet information for Petid: "+petId+" at " + get_date_time());
								window.fabric.Crashlytics.sendNonFatalCrash("");
								window.plugins.toast.show('Unable to remove pet in server. Please try again.', 'short', 'bottom', function (a) {
									console.log('toast success: ' + a)
								}, function (b) {
									console.log('toast error: ' + b)
								});
							}
						});
					/* }
					hideLoader();
				},
				error: function (error) {
					hideLoader();
					window.plugins.toast.show('Unable to delete information in server. Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
			}); */

		}
	}, // callback to invoke with index of button pressed
		'', // title
		['Yes', 'Cancel']// buttonLabels
	);

}
function viewPetProfile(petId) {
  window.fabric.Crashlytics.addLog("Starting ajax request to view individual pet profile: "+petId+" at " + get_date_time());
	showLoader("Loading page...");
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	$.ajax({
		url: globalUrl + "my_account/pet_profile_details/" + petId,
		method: "POST",
		data: {
			"userId": userdata.ACCOUNTNO
		},
		dataType: "json",
		success: function (res) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to view individual pet profile: "+petId+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			$("td[class^='pet-']").html('');
			if (res.response == "Y" && typeof res.pet_id != "undefined" && typeof res.pet_info != "undefined") {
				$.map(res.pet_info, function (val, k) {
					if (val["UPETNAME" + res.pet_id] != "null" && val["UPETNAME" + res.pet_id] != null && val["UPETNAME" + res.pet_id] != "") {
						$(".pet-UPETNAME").text(val["UPETNAME" + res.pet_id]);
					}
					if (val["UBREED" + res.pet_id] != "null" && val["UBREED" + res.pet_id] != null && val["UBREED" + res.pet_id] != "" && val["UBREED" + res.pet_id] != "other" && val["UBREED" + res.pet_id] != "Other") {
						$(".pet-UBREED").text(val["UBREED" + res.pet_id]);
					} else if ((val["UBREED" + res.pet_id] == "other") || (val["UBREED" + res.pet_id] == "Other")) {
						$(".pet-UBREED").text(val["UBREED2" + res.pet_id]);
					}
					if (val["USPECIES" + res.pet_id] != "null" && val["USPECIES" + res.pet_id] != null && val["USPECIES" + res.pet_id] != "") {
						$(".pet-USPECIES").text(val["USPECIES" + res.pet_id]);
					}
					if (val["USEX" + res.pet_id] != "null" && val["USEX" + res.pet_id] != null && val["USEX" + res.pet_id] != "") {
						$(".pet-USEX").text(val["USEX" + res.pet_id]);
					}
					if (val["UCOLOR" + res.pet_id] != "null" && val["UCOLOR" + res.pet_id] != null && val["UCOLOR" + res.pet_id] != "") {
						$(".pet-UCOLOR").text(val["UCOLOR" + res.pet_id]);
					}
					if (val["UTEMP" + res.pet_id] != "null" && val["UTEMP" + res.pet_id] != null && val["UTEMP" + res.pet_id] != "") {
						$(".pet-UTEMP").text(val["UTEMP" + res.pet_id]);
					}
					if (val["UFOOD" + res.pet_id] != "null" && val["UFOOD" + res.pet_id] != null && val["UFOOD" + res.pet_id] != "") {
						$(".pet-UFOOD").text(val["UFOOD" + res.pet_id]);
					}
					if (res.pet_id == 1) {
						if (val["USERDEF02"] != "null" && val["USERDEF02"] != null && val["USERDEF02"] != "") {
							$(".pet-USERDEF").text(val["USERDEF02"]);
						}
					} else {
						if (val["UFLOWN" + res.pet_id] != "null" && val["UFLOWN" + res.pet_id] != null && val["UFLOWN" + res.pet_id] != "") {

							$(".pet-USERDEF").text(val["UFLOWN" + res.pet_id]);
						}
					}
					if (val["UKENNEL" + res.pet_id] != "null" && val["UKENNEL" + res.pet_id] != null && val["UKENNEL" + res.pet_id] != "") {
						$(".pet-UKENNEL").text(val["UKENNEL" + res.pet_id]);
					}
					if (val["URVMFR" + res.pet_id] != "null" && val["URVMFR" + res.pet_id] != null && val["URVMFR" + res.pet_id] != "") {
						$(".pet-URVMFR").text(val["URVMFR" + res.pet_id]);
					}
					if (val["UCHIP" + res.pet_id] != "null" && val["UCHIP" + res.pet_id] != null && val["UCHIP" + res.pet_id] != "") {
						$(".pet-UCHIP").text(val["UCHIP" + res.pet_id]);
					}
					if (val["UHEIGHT" + res.pet_id] != "null" && val["UHEIGHT" + res.pet_id] != null && val["UHEIGHT" + res.pet_id] != "" && val["UHEIGHT" + res.pet_id] != "0") {
						$(".pet-UHEIGHT").text(val["UHEIGHT" + res.pet_id]);
					}
					if (val["ULENGTH" + res.pet_id] != "null" && val["ULENGTH" + res.pet_id] != null && val["ULENGTH" + res.pet_id] != "" && val["ULENGTH" + res.pet_id] != "0") {
						$(".pet-ULENGTH").text(val["ULENGTH" + res.pet_id]);
					}
					if (val["UWEIGHT" + res.pet_id] != "null" && val["UWEIGHT" + res.pet_id] != null && val["UWEIGHT" + res.pet_id] != "" && val["UWEIGHT" + res.pet_id] != "0") {
						$(".pet-UWEIGHT").text(val["UWEIGHT" + res.pet_id]);
					}
					if (val["UHCERT" + res.pet_id] != "" && val["UHCERT" + res.pet_id] != null && val["UHCERT" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UHCERT" + res.pet_id]) != "") {
						$(".pet-UHCERT").text(dbDateToDatePickerConversion(val["UHCERT" + res.pet_id]));
					}
					if (val["UHCEXP" + res.pet_id] != "" && val["UHCEXP" + res.pet_id] != null && val["UHCEXP" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UHCEXP" + res.pet_id]) != "") {
						$(".pet-UHCEXP").text(dbDateToDatePickerConversion(val["UHCEXP" + res.pet_id]));
					}
					//if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null && val["UAGE" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UAGE" + res.pet_id]) != "") 
					if (val["UAGE" + res.pet_id] != "" && val["UAGE" + res.pet_id] != null && val["UAGE" + res.pet_id] != "null") {
						$(".pet-UAGE").text(val["UAGE" + res.pet_id]);
					}
					if (val["UMEDS" + res.pet_id] != "null" && val["UMEDS" + res.pet_id] != null && val["UMEDS" + res.pet_id] != "") {
						$(".pet-UMEDS").text(val["UMEDS" + res.pet_id]);
					}
					if (val["UMCSERNB" + res.pet_id] != "null" && val["UMCSERNB" + res.pet_id] != null && val["UMCSERNB" + res.pet_id] != "") {
						$(".pet-UMCSERNB").text(val["UMCSERNB" + res.pet_id]);
					}
					if (val["UMCIMPDT" + res.pet_id] != "" && val["UMCIMPDT" + res.pet_id] != null && val["UMCIMPDT" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UMCIMPDT" + res.pet_id]) != "" && res.pet_id != 2) {
						$(".pet-UMCIMPDT").text(dbDateToDatePickerConversion(val["UMCIMPDT" + res.pet_id]));
					} else if (val["UMCIMDT" + res.pet_id] != "" && val["UMCIMDT" + res.pet_id] != null && val["UMCIMDT" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UMCIMDT" + res.pet_id]) != "" && res.pet_id == 2) {
						$(".pet-UMCIMPDT").text(dbDateToDatePickerConversion(val["UMCIMDT" + res.pet_id]));
					}
					if (val["URABVAC" + res.pet_id] != "" && val["URABVAC" + res.pet_id] != null && val["URABVAC" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["URABVAC" + res.pet_id]) != "") {
						$(".pet-URABVAC").text(dbDateToDatePickerConversion(val["URABVAC" + res.pet_id]));
					}
					if (val["URVEXP" + res.pet_id] != "" && val["URVEXP" + res.pet_id] != null && val["URVEXP" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["URVEXP" + res.pet_id]) != "") {
						$(".pet-URVEXP").text(dbDateToDatePickerConversion(val["URVEXP" + res.pet_id]));
					}
					if (val["URVSERNB" + res.pet_id] != "" && val["URVSERNB" + res.pet_id] != null && val["URVSERNB" + res.pet_id] != "null") {
						$(".pet-URVSERNB").text(val["URVSERNB" + res.pet_id]);
					}
					if (val["UMULTIB" + res.pet_id] != "" && val["UMULTIB" + res.pet_id] != null && val["UMULTIB" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UMULTIB" + res.pet_id]) != "") {
						$(".pet-UMULTIB").text(dbDateToDatePickerConversion(val["UMULTIB" + res.pet_id]));
					}
					if (val["UMBEXP" + res.pet_id] != "" && val["UMBEXP" + res.pet_id] != null && val["UMBEXP" + res.pet_id] != "null" && dbDateToDatePickerConversion(val["UMBEXP" + res.pet_id]) != "") {
						$(".pet-UMBEXP").text(dbDateToDatePickerConversion(val["UMBEXP" + res.pet_id]));
					}
					if (val["UMBSERNB" + res.pet_id] != "null" && val["UMBSERNB" + res.pet_id] != null && val["UMBSERNB" + res.pet_id] != "") {
						$(".pet-UMBSERNB").text(val["UMBSERNB" + res.pet_id]);
					}
					if (typeof val["UIMAGE"] != "undefined") {
						$("#profile-pet-image-view").attr("src", val['UIMAGE']);
					}
				});

			}

			$("span[class*='pet-']").each(function () {
				//alert($(this).attr('class'));
				if ($(this).text() == "") {
					$(this).text('-');
				}
			});
			hideLoader();
			/* if(action == "view"){
			$("form[name=pet-profile-form] input[type=text]").attr("readonly",true);
			$("form[name=pet-profile-form] select").attr("disabled",true);
			$("form[name=pet-profile-form] .hasDatepicker").datepicker("disable");
			} */

			$.mobile.changePage("#pet-profile-detail", {
				transition: "flip"
			});
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to view individual pet profile: "+petId+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('Error! Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});

}

function getPicture(type) {
	//alert(type);
	var options = new Object;
	if (type == "camera") {
		options.sourceType = Camera.PictureSourceType.CAMERA;
	} else {
		//alert(2);
		options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
	}
	options.destinationType = Camera.DestinationType.FILE_URI;
	options.correctOrientation = true;
    options.EncodingType = Camera.EncodingType.JPEG;
	//alert(JSON.stringify(options));
	navigator.camera.getPicture(function (imageURI) {
		//alert(imageURI);
		if (imageURI != "") {

			/* var fileUri = "";
			if (imageURI.startsWith("content://")) { */
			//window.FilePath.resolveNativePath(imageURI, function (localFileUri) {
				//var fileUri = localFileUri;
				$("#popupPadded").popup("close");
				$("#profile-pet-image").attr("src", imageURI);
			//});
			//alert("file "+fileUri);
			/* }
			else
		{
			fileUri = imageURI;
			}
			alert(fileUri); */
		}

	},
		function (fail) {
		//alert(JSON.stringify(fail));
		$("#popupPadded").popup("close");
	},
		options);
}

function loadDocumentForm(id) {
  
	$("#doc-action").attr("doc_id", id);
	$("form[name=pet-document-form] input").val("");
	showLoader("Loading...");
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	window.fabric.Crashlytics.addLog("Starting ajax request to view document form for pet profile: "+id+" at " + get_date_time());
	$.ajax({
		url: globalUrl + 'my_account/pet_document_form/',
		method: 'POST',
		data: {
			"user_id": userdata.ACCOUNTNO,
			"pet_id": id
		},
		dataType: 'json',
		success: function (response) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to view document form for pet profile: "+id+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			$.mobile.changePage("#add-edit-pet-document", {
				transition: "flip"
			});
			if (response.response == "Y") {
				if (response.petList != "") {
					$("form[name=pet-document-form] select[name=pet_id]").html("<option value=''>------</option>" + response.petList);
				}
				if (response.catList != "") {
					$("form[name=pet-document-form] select[name=cat_id]").html("<option value=''>------</option>" + response.catList);
				}
				if (typeof response.pet_info != "undefined" && response.pet_info.length > 0) {
					$("form[name=pet-document-form] select[name=pet_id]").val(response.pet_info[0].pet_id).selectmenu("refresh");
					$("form[name=pet-document-form] select[name=cat_id]").val(response.pet_info[0].cat_id).selectmenu("refresh");
					$("form[name=pet-document-form] input[name=s_title]").val(response.pet_info[0].s_title);
					$("form[name=pet-document-form] .u_document").text(response.pet_info[0].s_file_name);
				} else {
					$("form[name=pet-document-form] .u_document").text("");
					$("form[name=pet-document-form] select").val("").selectmenu("refresh");
				}

			} else {
        
				window.plugins.toast.show('unable to load the information from server. Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
			hideLoader();
		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to view document form for pet profile: "+id+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('unable to load the information from server. Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
}

// get file in document section----------------
$(document).ready(function () {
	$(".add-doc").on("tap", function () {
		loadDocumentForm(0);
	});
	$("form[name=pet-document-form] input[name=s_file_name]").on("change", function (event) {
		if ($(this).val() != "") {
			showLoader("Loading file...");
			var input = event.target;

			var reader = new FileReader();
			reader.onload = function () {
				var dataURL = reader.result;
				console.log(dataURL);
				$("#file-url").val(dataURL);
				hideLoader();
			};
			reader.readAsDataURL(input.files[0]);
		} else {
			$("#file-url").val("");
		}

	});

	$("form[name=pet-profile-form] select[name=UBREED]").on("change", function () {
		if ($(this).val() == "other" || $(this).val() == "Other") {
			$(".other-breed").css("display", "block");
		} else {
			$(".other-breed").css("display", "none");
		}
	});

	$("form[name=pet-profile-form] select[name=USPECIES]").on("change", function () {
		var species = $(this).val();
		var breed = window.localStorage.getItem("breeds");
		$(".other-breed").css("display", "none");
		if (breed != null && species != null) {
			breedList = JSON.parse(breed);
			if (breedList[species] != "undefined") {
				var opt = "<option value=''>---</option>";
				$.each(breedList[species], function (k, val) {
					opt += "<option value='" + val.ENTRY + "'>" + val.ENTRY + "</option>";
				});
				$("form[name=pet-profile-form] select[name=UBREED]").html(opt).selectmenu("refresh");
			} else {
				var opt = "<option value=''>---</option>";
				$("form[name=pet-profile-form] select[name=UBREED]").html(opt).selectmenu("refresh");
			}
		} else {
			var opt = "<option value=''>---</option>";
			$("form[name=pet-profile-form] select[name=UBREED]").html(opt).selectmenu("refresh");
		}
	});

});

function modifyPetDocument() {
    
	var docId = $("#doc-action").attr("doc_id");

	var userdata = JSON.parse(window.localStorage.getItem("userdata"));

	var error = 0;

	var file_name = "";
	var file_type = "";
	$(".error-message").html("");
	var formdata = $("form[name=pet-document-form]").serializeArray();
	var info = {};
	info["userId"] = userdata.ACCOUNTNO;
	info["docId"] = docId;
	$.each(formdata, function (key, val) {
		if (val.name == "s_title" && $.trim(val.value) == "") {
			error++;
			$("form[name=pet-document-form] input[name=" + val.name + "]").parent().next(".error-message").html("* required field");
		} else if ((val.name == "pet_id" || val.name == "cat_id") && $.trim(val.value) == "") {
			error++;
			$("form[name=pet-document-form] select[name=" + val.name + "]").parent().parent().next(".error-message").html("* required field");
		}
		info[val.name] = $.trim(val.value);
	});
	if ($("#file-url").val() != "") {
		var file = document.getElementById('s_file_name').files[0];
		info['file_name'] = file.name;
		info['file_type'] = file.type;
	} else if (docId == 0 || docId == "") {
		error++;
		$("form[name=pet-document-form] input[name=file-url]").next(".error-message").html("* required field");
	} 
	if (error == 0) {
		showLoader("Please wait...");
		if ($("#file-url").val() != "") {
			var fileUrl = $("#file-url").val();
			var fileData = fileUrl.split(";base64,");
			info["file_data"] = fileData[1];
			//alert(JSON.stringify(info["file_name"]));
		}  
    	window.fabric.Crashlytics.addLog("Starting ajax request to modify pet document for docId: "+docId+" at " + get_date_time());
		console.log(" document data :"+JSON.stringify(info));
		$.ajax({
			url: globalUrl + "my_account/add_pet_document",
			method: "POST",
			dataType: "json",
			data: info,
			success: function (response) {
				window.fabric.Crashlytics.addLog("Success. Ending ajax request to modify pet document for docId: "+docId+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				hideLoader();
				if (response.response == "Y") {
                    //showLoader();
					$.mobile.changePage("#pet-document-listing", {
						transition: "flip"
					});
				} else {
					//alert(JSON.stringify(response));
					window.plugins.toast.show('unable to update information in server. Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
			},
			error: function (error) {
				hideLoader();
				//alert(JSON.stringify(error));
				window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to modify pet document for docId: "+docId+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				window.plugins.toast.show('unable to update information in server. Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});

	} else {
		$('html,body').animate({
			scrollTop: ($('form[name=pet-document-form] .error-message:not(:empty):first').offset().top) - 100
		},
			'slow');
	}
}

//--------------- pet document listing page ----------------------

$(document).on("pagebeforeshow", "#pet-document-listing", function () {
    
	$(".pet-document-list").html("");
    showLoader("Loading page...");
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	window.fabric.Crashlytics.addLog("Starting ajax request to display listing pet document for userid: "+userdata.ACCOUNTNO+" at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/pet_document_list",
		method: "POST",
		dataType: "json",
		data: {
			userId: userdata.ACCOUNTNO
		},
		success: function (response) {
			//showLoader("Loading page...");
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to display listing pet document for userid: "+userdata.ACCOUNTNO+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (response.response == "Y") {
				var html = "";
				var count = 1;
				if (response.data.length > 0) {
					$.each(response.data, function (k, val) {
						var greyClass = "";
						if ((count % 2) == 0) {
							greyClass = "gray-panel";
						}
						html += '<li class="' + greyClass + '">' +
						'<div class="my-favorite-cv-list-inner">' +
						'<div class="details">' +
						'<h3>Pet Name: ' + val.petname + '</h3>' +
						'<div class="left-cont" style="width:100%;">' +
						'<p><strong>Category:</strong> ' + val.category + '</p>' +
						'<p><strong>Title:</strong> ' + val.s_title + '</p>';
						if (val.dt_created_on != "") {
							var dtTimeArr = val.dt_created_on.split(" ");
							var date = getDateFormat("Y-m-d", "mm/dd/Y", dtTimeArr[0]);
							var time = getTimeFormat("h:i F", dtTimeArr[1]);
							html += "<strong>Uploaded on: </strong>" + date + " " + time;
						}
						html += '</div>' +
						'</div>' +
						'</div>' +
						'<div class="my-favorite-cv-list-left">' +
						'<ul class="action-icons">' +
						'<li><a href="javascript:void(0);"><img src="images/view-icon.jpg" alt="View" title="View" onclick="viewDoc(' + val.i_id + ')"/></a></li>';
						if(val.uploaded_by == 4)
						{
							html += '<li><a href="javascript:void(0);" onclick="loadDocumentForm(' + val.i_id + ')"><img src="images/edit-icon.jpg" alt="Edit" title="Edit" /></a></li>' +
							'<li><a href="#"><img src="images/delete-icon.jpg" alt="Delete" title="Delete" onclick="deleteDoc(' + val.i_id + ')"/></a></li>' ;
						}
						html += '</ul>' +
						'</div>' +
						'</li>';
						count++;
					});
				} else {
					html += '<li><div class="my-favorite-cv-list-inner"><h3 class="no-record">No documents found.</h3></div></li>';
				}
				$(".pet-document-list").html(html);
				$(".swipe-show li").click(function () {
					if ($(this).hasClass("open")) {
						$(this).removeClass("open");
					} else {
						$(".swipe-show li").removeClass("open");
						$(this).addClass("open");
					}

				});
			} else {
				var html = '<li><div class="my-favorite-cv-list-inner"><h3 class="no-record">No documents found.</h3></div></li>';
				$(".pet-document-list").html(html);
			}

			//var position = $("wo").position();
			//alert(position.left+"----"+position.top);

			hideLoader();
		},
		error: function (error) {
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to display listing pet document for userid: "+userdata.ACCOUNTNO+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
            hideLoader();
			window.plugins.toast.show('unable to fetch information from server. Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
});
$(document).on("pageshow", "#pet-document-listing", function () {
	$(".add-doc").css("display", "block");
	$(".add-doc").draggable({
		containment: "document"
	});
});
//---------------------pet document delete ------------------------

function deleteDoc(docId) {
    window.fabric.Crashlytics.addLog("Starting ajax request to delete document for docid: "+docId+" at " + get_date_time());
	navigator.notification.confirm("Are you sure you want to delete this document?",
		function (btnIndex) {
		if (btnIndex == "1") {
			$.ajax({
				url: globalUrl + "my_account/delete_document/" + docId,
				method: "POST",
				dataType: "json",
				success: function (res) {
					window.fabric.Crashlytics.addLog("Success. Ending ajax request to delete document for docid: "+docId+" at " + get_date_time());
					window.fabric.Crashlytics.sendNonFatalCrash("");
					if (res.success == true) {
						window.plugins.toast.show('Document deleted successfully.', 'short', 'bottom', function (a) {
							console.log('toast success: ' + a)
						}, function (b) {
							console.log('toast error: ' + b)
						});
						$.mobile.changePage("#pet-document-listing", {
							allowSamePageTransition: true
						});
					} else {
						window.plugins.toast.show('unable to delete document. Please try again.', 'short', 'bottom', function (a) {
							console.log('toast success: ' + a)
						}, function (b) {
							console.log('toast error: ' + b)
						});
					}
				},
				error: function (err) {
					window.fabric.Crashlytics.addLog(logErrorDetails(err) + " Ending ajax request to delete document for docid: "+docId+" at " + get_date_time());
					window.fabric.Crashlytics.sendNonFatalCrash("");
					window.plugins.toast.show('unable to delete document. Please try again.', 'short', 'bottom', function (a) {
						console.log('toast success: ' + a)
					}, function (b) {
						console.log('toast error: ' + b)
					});
				}
			});
		}
	}, '', ["Yes", "Cancel"]);
}

// Function for view Document ---------------------------------------------------

function viewDoc(id) {
  window.fabric.Crashlytics.addLog("Starting ajax request to view doc for docid: "+id+" at " + get_date_time());
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
	$.ajax({
		method: "POST",
		dataType: "json",
		url: globalUrl + "my_account/view_document/" + id,
		data: {
			'userId': userdata.ACCOUNTNO
		},
		success: function (res) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to view doc for docid: "+id+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (res.success == "Y" && typeof res.document_data != "undefined") {
				$.each(res.document_data, function (k, val) {
					if (k != "fileType" && k != "fileUrl" && k != "s_file_name") {
						$(".doc-" + k).html(val);
					} else if (k == "fileType") {
						if (val == 'image/jpeg' || val == "image/png" || val == "image/jpg") {
							$(".doc-" + k).html('<a href="javascript:void(0);" class="ui-link doc-link" onclick="downloadDoc();"><img src="https://maxcdn.icons8.com/windows8/PNG/26/Files/image_file-26.png" title="Download" width="24" style="display:inline"></a>');
						} else if (val == "application/msword" || val == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || val == "application/vnd.openxmlformats-officedocument.wordprocessingml.template") {
							$(".doc-" + k).html('<a href="javascript:void(0);" class="ui-link doc-link" onclick="downloadDoc();"><img src="https://maxcdn.icons8.com/windows8/PNG/26/Very_Basic/document-26.png" title="Download" width="24" style="display:inline"></a>');
						} else if (val == "application/pdf") {
							$(".doc-" + k).html('<a href="javascript:void(0);" class="ui-link doc-link" onclick="downloadDoc();"><img src="https://maxcdn.icons8.com/iOS7/PNG/25/Files/pdf_2-25.png" title="Download" width="24" style="display:inline"></a>');
						}

					} else if (k == "s_file_name") {
						$("#docFile").val(val);
					} else if (k == "fileUrl") {
						$("#docUrl").val(val);
					}

				});

				$.mobile.changePage("#document-detail-page", {
					transition: "flip"
				});
                //showLoader("Loading page...");
			} else {
				window.plugins.toast.show('Unable to fetch document. Please try again.', 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		},
		error: function (err) {
			window.fabric.Crashlytics.addLog(logErrorDetails(err) + " Ending ajax request to view doc for docid: "+id+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show('unable to fetch document. Please try again.', 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
}

function open_pdf_ios(f)
{
    //alert(f)
    var option = {
        password: null,
        flatUI: true,
        showShadows: true,
        enableThumbs: true,
        disableRetina: false,
        enablePreview: true,
        bookmarks: true,
        landscapeDoublePage: true,
        landscapeSingleFirstPage: true,
        toolbarBackgroundColor: null,
        textColor: null,
        enableShare: false
    };
    PDFReader.open(f, option, successpdf, errorpdf);
}

function successpdf()
{
    console.log("pdf opened");
}

function errorpdf()
{
    console.log("Error opening pdf file.");
}

// Download or open document from view document page ----------------------------------------------------

function downloadDoc() {
    
	showLoader("Loading file ...");
	var fileUrl = $("#docUrl").val();
	var fileName = $("#docFile").val();
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(fileUrl);
  //alert(uri)
	if(device.platform == 'Android')
  {
      var fileUrl = cordova.file.externalCacheDirectory;
  }
  else {
      var fileUrl = cordova.file.documentsDirectory;
  }  
  //alert(fileUrl)   
	if(device.platform == 'Android')
  {
  
  window.resolveLocalFileSystemURL(fileUrl + "/" + fileName, function (fs) {
		fs.file(function (file) {
			hideLoader();
      //alert(fs.toURL() + ' => 1 => '+file.type)
			openFile(fs.toURL(), file.type);
		},
			function (fail) {
			hideLoader();
			window.plugins.toast.show("This file is not accessible", 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		});
	},
		function (fail) { 
           hideLoader();
		showLoader("Downloading file ...");
		window.fabric.Crashlytics.addLog("Starting ajax request to download document at " + get_date_time());
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				hideLoader();
                //alert(file.type)
                window.fabric.Crashlytics.addLog("Success. Ending ajax request to download document at " + get_date_time());
                window.fabric.Crashlytics.sendNonFatalCrash("");
                if(file.type == 'application/pdf')
                {
                   
                        open_pdf_android(entry.toURL());
                    
                } 
                else
                {
                    
                        openFile(entry.toURL(), file.type);
                    
                   //open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				hideLoader();
				window.plugins.toast.show("This file is not accessible", 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			});
		},
		function (error) {
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to download document at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			hideLoader();
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("download error code" + error.code);
			window.plugins.toast.show("An error occurred while downloading the file.Please try again.", 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);
    	});
   }
   else
   {   
		hideLoader();
		showLoader("Downloading file ...");
		window.fabric.Crashlytics.addLog("Starting ajax request to download document at " + get_date_time());
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				hideLoader();
                //alert(file.type)
                window.fabric.Crashlytics.addLog("Success. Ending ajax request to download document at " + get_date_time());
                window.fabric.Crashlytics.sendNonFatalCrash("");
                if(file.type == 'application/pdf')
                {
                    //openFile(entry.toURL(), file.type);
                    if(device.platform == 'Android')
                    {
                        open_pdf_android(entry.toURL());
                        //openFile(entry.toURL(), file.type);
                    }
                    else 
                    {
                        open_pdf_ios(entry.toURL());
                    }
                } 
                else
                {
                    if(device.platform == 'Android')
                    {
                        //open_pdf_android(entry.toURL());
                        openFile(entry.toURL(), file.type);
                    }
                    else 
                    {
                        //open_pdf_ios(entry.toURL());
                        window.open(entry.toURL(),'_blank', 'location=no,enableViewportScale=yes');
                        //openFile(entry.toURL(), file.type);
                        //alert("'" +  uri + "'"+"----"+fileUrl+"-------"+entry.toURL());
                        //PhotoViewer.show('images/dog3.jpg', 'Optional Title');
                        //FullScreenImage.showImageURL(entry.toURL());
                        //cordova.InAppBrowser.open(entry.toURL(), '_system', 'location=yes');
                        
                        
                    }
                   //open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				hideLoader();
				window.plugins.toast.show("This file is not accessible", 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			});
		},
		function (error) {
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to download document at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			hideLoader();
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("download error code" + error.code);
			window.plugins.toast.show("An error occurred while downloading the file.Please try again.", 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);

   }
}

// solution of panel scrolling problem -------------------------------------------

$(document).on("pageinit", "div[data-role=page]", function (event) {

	$("#menu").on("panelopen", function (event, ui) {
		//setting overflow : hidden and binding "touchmove" with event which returns false
		$('body').css("overflow", "hidden").on("touchmove", false);
	});

	$("#menu").on("panelclose", function (event, ui) {
		//remove the overflow: hidden property. Also, remove the "touchmove" event.
		$('body').css("overflow", "auto").off("touchmove");
	});

});

// chnage password function ---------------------------------


function changePassWord() {
  
	var userdata = JSON.parse(window.localStorage.getItem("userdata"));
  
	var curPass = $("form[name=change-password-form] input[name=password]").val();
	var nPass = $("form[name=change-password-form] input[name=new_password]").val();
	var cPass = $("form[name=change-password-form] input[name=c_password]").val();
	var error = 0;
	$(".error-message").html("");
	var formdata = $("form[name=change-password-form]").serializeArray();
	$.each(formdata, function (k, val) {
		if ($.trim(val.value) == "") {
			error++;
			$("form[name=change-password-form] input[name=" + val.name + "]").parent().next(".error-message").html("* required");
		} else if (val.name == "new_password" && $.trim(val.value).indexOf(" ") > -1) {
			error++;
			$("form[name=change-password-form] input[name=" + val.name + "]").parent().next(".error-message").html("* Password should not contain space.");
		} else if (val.name == "new_password" && $.trim(val.value).length < 6) {
			error++;
			$("form[name=change-password-form] input[name=" + val.name + "]").parent().next(".error-message").html("* Password should  contain atleast 6 characters or numbers.");
		}
		if (nPass != "" && cPass != "" && (nPass != cPass)) {
			error++;
			$("form[name=change-password-form] input[name=c_password]").parent().next(".error-message").html("* Password not matched.");
		}
		if (curPass != "" && nPass != "" && curPass == nPass) {
			error++;
			$("form[name=change-password-form] input[name=new_password]").parent().next(".error-message").html("* You have entered the current password as new password.");
		}
	});
	if (error == 0) {
		showLoader("Please wait...");
    	window.fabric.Crashlytics.addLog("Starting ajax request to change password for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
		$.ajax({
			url: globalUrl + "my_account/change_password",
			method: "POST",
			dataType: "json",
			data: {
				"userId": userdata.ACCOUNTNO,
				"n_password": nPass,
				"s_password": curPass
			},
			success: function (res) {
				window.fabric.Crashlytics.addLog("Success. Ending ajax request to change password for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				hideLoader();
				if (res.response == "N") {
					if (typeof res.message != "undefined") {
                        
						window.plugins.toast.show(res.message, 'short', 'bottom', function (a) {
							console.log('toast success: ' + a)
						}, function (b) {
							console.log('toast error: ' + b)
						});
					} else {
						window.plugins.toast.show("An error occurred while changing the password. Please try again.", 'short', 'bottom', function (a) {
							console.log('toast success: ' + a)
						}, function (b) {
							console.log('toast error: ' + b)
						});
					}
				}
				if (res.response == "Y") {
					navigator.notification.alert("Your password changed successfully. We are logging you out from the app.Please login again with new password.", function () {
						logout();
					}, "", "OK");
					$("form[name=change-password-form] input").val("");
				}
			},
			error: function (error) {
				hideLoader();
				window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to change password for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				window.plugins.toast.show("An error occurred. Please try again.", 'short', 'bottom', function (a) {
					console.log('toast success: ' + a)
				}, function (b) {
					console.log('toast error: ' + b)
				});
			}
		});
	}

}
 /*
$(document).ready(function(){
   if (window.localStorage.getItem("loggedIn") != null) {
         $('#login').hide();
         $('#home').show();
   }
   else
   {
       $('#login').show();
         $('#home').hide();
   }
});
   */
$(document).on("pageshow", "#login", function () {
	setTimeout(function () {
     //$('#login').hide();
		if (window.localStorage.getItem("loggedIn") != null) {
			$.mobile.changePage("#home", {
				transition: "flip"
			});
		} else {
    
			$.mobile.changePage("#login", {
				transition: "flip"
			});
		}
	}, 1000);

}); 

$(document).on("pagebeforeshow", "[data-role=page]", function () {
	var id = $.mobile.activePage.attr("id");
	if (id == "landing") {
		$("body").addClass("splash-screen");
	} else {
		$("body").removeClass("splash-screen");
	}
});

// function for updating userdata after notification -----------------------------------------------

function updateUserdata() {
    
	var userdata = JSON.parse(window.localStorage.getItem('userdata'));
	window.fabric.Crashlytics.addLog("Starting ajax request to update user data for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
	$.ajax({
		url: globalUrl + "my_account/get_user_info",
		method: "POST",
		dataType: "json",
		data: {
			"ACCOUNTNO": userdata.ACCOUNTNO,
		},
		success: function (res) {
			window.fabric.Crashlytics.addLog("Success. Ending ajax request to update user data for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			if (typeof(res.userdata[0]) != "undefined") {
				window.localStorage.setItem("userdata", JSON.stringify(res.userdata[0]));
				var userdata = JSON.parse(window.localStorage.getItem("userdata"));
				if (window.localStorage.getItem("loggedIn") != null) {
                    
					$(".user-name").html(userdata.CONTACT);
					var address = "";
					if (typeof userdata.ADDRESS1 != "undefined" && userdata.ADDRESS1 != "" && userdata.ADDRESS1 != "null" && userdata.ADDRESS1 != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.ADDRESS1;
					}
					if (typeof userdata.CITY != "undefined" && userdata.CITY != "" && userdata.CITY != "null" && userdata.CITY != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.CITY;
					}
					if (typeof userdata.STATE != "undefined" && userdata.STATE != "" && userdata.STATE != "null" && userdata.STATE != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.STATE;
					}
					if (typeof userdata.COUNTRY != "undefined" && userdata.COUNTRY != "" && userdata.COUNTRY != "null" && userdata.COUNTRY != null) {
						if (address != "") {
							address += ", ";
						}
						address += userdata.COUNTRY;
					}
					$(".user-address").html(address);
				}
			}

		},
		error: function (error) {
			hideLoader();
			window.fabric.Crashlytics.addLog(logErrorDetails(error) + " Ending ajax request to update user data for userId : "+userdata.ACCOUNTNO+" at " + get_date_time());
			window.fabric.Crashlytics.sendNonFatalCrash("");
			window.plugins.toast.show("An error occurred. Please try again.", 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});
		}
	});
}

// forgot password ------------------------------------------------------------------

function forgotPassword() {
    
	$(".error-message").html("");
	var email = $.trim($("form[name=forgot-password-form] input[name=username]").val());
	if (email == "") {
		$("form[name=forgot-password-form] input[name=username]").parent().next(".error-message").html("* Required");
	} else if (email != "" && validateEmail(email) == false) {
		$("form[name=forgot-password-form] input[name=username]").parent().next(".error-message").html("* Invalid mail id");
	} else {
		showLoader("Please wait...");
    window.fabric.Crashlytics.addLog("Starting ajax request to recover password for email : "+email+" at " + get_date_time());
		$.ajax({
			url: globalUrl + "login/forgot_password",
			method: "POST",
			dataType: "json",
			data: {
				"s_email": email,
			},
			success: function (response) {
				window.fabric.Crashlytics.addLog("Success. Ending ajax request to recover password for email : "+email+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				hideLoader();
				getMessage(response.message, "OK");
				if (response.response == "Y") {
					$.mobile.changePage("#login", {
						transition: "slide"
					});
				}
			},
			error: function (err) {
				hideLoader();
				window.fabric.Crashlytics.addLog(logErrorDetails(err) + " Ending ajax request to recover password for email : "+email+" at " + get_date_time());
				window.fabric.Crashlytics.sendNonFatalCrash("");
				getMessage("An error occurred. Please try again.", "OK");
			}
		});
	}
}
