var globalUrl = "https://airanimal.biz/api/";
//var globalUrl = "http://localhost.airanimal.com:8081/api/";
var monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var noImgUrl = "https://airanimal.biz/resource/fe/img/pet-no-img.jpg";
var profile_image_url = "http://airanimal.biz/api/my_account/uploadProfileImage";	  

function validateEmail(email) {
	var exp = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
	return exp.test(email);

}
//function for exit app

function exitApp() {
	navigator.app.exitApp();
}

//function for message

function getMessage(msg, button) {
	navigator.notification.alert(msg, function () {}, "", button);
}

function showLoader(msg) {
	window.plugins.spinnerDialog.show("", msg, true);
}

function hideLoader() {
	window.plugins.spinnerDialog.hide();
}

function validatePhn(Phn) {
	//var exp = /^[0-9-+]+$/;
	var exp = /^[0-9\-\(\)\s]+$/;
	return exp.test(Phn);
}

function dbDateToDatePickerConversion(date) {
	//alert(date.indexOf("undefined"));
	var vdate = new Date(date.replace(' ', 'T')).getTime();								
	if (date != "" && date != null && date != "null" && vdate > 0) {

		var dArrone = date.split(" "); //alert(JSON.stringify(dArrone[0]));
		if (dArrone.length >= 1 && date.indexOf("undefined") == -1 && date.indexOf("Undefined") == -1) {
			var dArr = dArrone[0].split("-");
			if (dArr.length == 3) {
				if (dArr["2"] != "00") {
					var formattedDate = dArr["1"] + "/" + dArr["2"] + "/" + dArr["0"];
					/* if(dArrone.length >=2){
					//var tArr = dArrone[1].split(":");
					var dtTime = formattedDate+" "+ dArrone[1];
					return dtTime;
					} */

					return formattedDate;
				} else {
					return "";
				}
			} else {
				return "";
			}

		} else {
			return "";
		}
	} else
		{
		return "";
	}
}
/* function convertDateToDb(date){
var dArr = date.split("/");
var formattedDate = dArr["2"]+"-"+dArr["0"]+"-"+dArr["1"];
return formattedDate;
} */
function getDateFormat(fromFormat, toFormat, userDate) {
	var date = "";
	var retDate = "";
	var sp = "";
	if (fromFormat == "Y-m-d") {
		sp = userDate.split("-");
		//date = new Date(sp[0],sp[1]-1,sp[2])'
	}
	if (sp != "" && sp.indexOf("undefined") == -1 && sp.indexOf("Undefined") == -1) {
		if (toFormat == "MdY") {
			retDate = monthArr[sp[1] - 1] + " " + sp[2] + ", " + sp[0];
		} else if (toFormat = "mm/dd/Y") {
			retDate = sp[1] + "/" + sp[2] + "/" + sp[0];

		}
	}

	return retDate;
}

function getTimeFormat(toFormat, usertime) {
	var time = "";
	var retTime = "";
	var t = "";
	//if(fromFormat == "H:i")
	//{
	//alert(usertime);
	if(usertime != "" && usertime != "undefined" && usertime != "null"  && usertime != null)
	{
		t = usertime.split(":");
	//}
		if (t != "" && t.length > 1 && t[0] != "00" && t[0] != "undefined") {
			if (toFormat == "h:i F") {
				var su = "am";
				var hr = "";
				if (t[0] > 12) {
					su = "pm";
					hr = t[0] - 12;
				} else {
					hr = t[0];
				}
				var min = t[1];
				retTime = hr + ":" + min + " " + su;

			}
		}
	}
	

	return retTime;
}

var equalheight = function (container) {
	//alert(1);
	var currentTallest = 0,
	currentRowStart = 0,
	rowDivs = new Array(),
	$el,
	topPosition = 0;
	$(container).each(function () {

		$el = $(this);
		$($el).height('auto')
		topPostion = $el.position().top;

		if (currentRowStart != topPostion) {
			for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
				rowDivs[currentDiv].height(currentTallest);
			}
			rowDivs.length = 0; // empty the array
			currentRowStart = topPostion;
			currentTallest = $el.outerHeight();
			rowDivs.push($el);
		} else {
			rowDivs.push($el);
			currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
		}
		for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
			rowDivs[currentDiv].css('height', currentTallest, 'important');
		}
	});
}

function getDbDateFormat(uDate) {
	var retDate = "";
	if (uDate != "") {
		var dtArr = uDate.split('/');
		retDate = dtArr[2] + "-" + dtArr[0] + "-" + dtArr[1];
	}
	//alert(retDate);
	return retDate;
}

function openPdf(filePath)
{
   //alert(filePath);
   window.open(filePath,'_system');
}

function get_date_time()
{
    var d = new Date();
    return d.toUTCString();
}

function open_pdf_android(f)
{
    //alert(f);
    window.open(f,'_blank', 'location=yes');
}

function openFile(filePath, fileMIMEType) {
  //window.open(filePath,'_system', 'location=yes');
	cordova.plugins.fileOpener2.open(
		filePath,
		fileMIMEType, {
		error: function (e) {
			/*window.plugins.toast.show("Your phone is unable to display this file type within this app.", 'short', 'bottom', function (a) {
				console.log('toast success: ' + a)
			}, function (b) {
				console.log('toast error: ' + b)
			});*/
            window.open(filePath,'_blank', 'location=yes');
		},
		success: function () { 
		},
    ,
				function (fail) {
				hideLoader();
				window.open(filePath,'_blank', 'location=yes');
			}
	});
}

 document.addEventListener("backbutton", function(e)
 {
	// alert($.mobile.activePage.attr("id"));
	 if($.mobile.activePage.attr("id") == "home")
	 {
		 e.preventDefault();
	 }
	 else
	 {
		 window.history.back();
	 }
 }, false);
