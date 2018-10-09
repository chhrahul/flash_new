function getMessage(msg, button) {
	navigator.notification.alert(msg, function () {}, "", button);
}


function openPdf(filePath)
{
   //alert(filePath);
   window.open(filePath,'_system');
}


function open_pdf_android(f)
{
    //alert(f);
    window.open(f,'_system', 'location=yes');
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
            window.open(filePath,'_system', 'location=yes');
		},
		success: function () { 
		}
	});
}




	function downloadDoc() {
    
	
	var fileUrl = "http://softweavertech.com/projects/visicoil/pdf/VISICOIL-Brochure_Americas_0713_R1.pdf";
	var fileName = "VISICOIL-Brochure_Americas_0713_R1.pdf";
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
	window.resolveLocalFileSystemURL(fileUrl + "/" + fileName, function (fs) {
		fs.file(function (file) {
			
      //alert(fs.toURL() + ' => 1 => '+file.type)
			openFile(fs.toURL(), file.type);
		},
			function (fail) {
			
			
		});
	},
		function (fail) {  


			//alert(uri)
			//alert(fileUrl) 

	//	hideLoader();
		//showLoader("Downloading file ...");
		
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				
				
                //alert(file.type)
                
                if(file.type == 'application/pdf')
                {
                    //openFile(entry.toURL(), file.type);
                    if(device.platform == 'Android')
                    {
                        open_pdf_android(entry.toURL());
                    }
                    else 
                    {
                        open_pdf_ios(entry.toURL());
                    }
                } 
                else
                {
                   open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				
				
			});
		},
		function (error) {
			
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);
	});

}

function downloadDoc2() {
    
	
	var fileUrl = "http://softweavertech.com/projects/visicoil/pdf/IM-FL-E-VISICOIL-for-PT-1012_US.pdf";
	var fileName = "IM-FL-E-VISICOIL-for-PT-1012_US.pdf";
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
	window.resolveLocalFileSystemURL(fileUrl + "/" + fileName, function (fs) {
		fs.file(function (file) {
			
      //alert(fs.toURL() + ' => 1 => '+file.type)
			openFile(fs.toURL(), file.type);
		},
			function (fail) {
			
			
		});
	},
		function (fail) {  


			//alert(uri)
			//alert(fileUrl) 

	//	hideLoader();
		//showLoader("Downloading file ...");
		
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				
				
                //alert(file.type)
                
                if(file.type == 'application/pdf')
                {
                    //openFile(entry.toURL(), file.type);
                    if(device.platform == 'Android')
                    {
                        open_pdf_android(entry.toURL());
                    }
                    else 
                    {
                        open_pdf_ios(entry.toURL());
                    }
                } 
                else
                {
                   open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				
				
			});
		},
		function (error) {
			
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);
	});

}

function open_pdf_ios(f)
{
    PDFReader.open(f, options, successpdfios, errorpdfios);
}

function successpdfios()
{
    alert('success')
}

function errorpdfios()
{
    alert('error')
}
function downloadDoc3() {
    
	
	var fileUrl = "http://softweavertech.com/projects/visicoil/pdf/IM-CA-E-VISICOIL-Lung-IGRT_1012_US.pdf";
	var fileName = "IM-CA-E-VISICOIL-Lung-IGRT_1012_US.pdf";
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
	window.resolveLocalFileSystemURL(fileUrl + "/" + fileName, function (fs) {
		fs.file(function (file) {
			
      //alert(fs.toURL() + ' => 1 => '+file.type)
			openFile(fs.toURL(), file.type);
		},
			function (fail) {
			
			
		});
	},
		function (fail) {  


			//alert(uri)
			//alert(fileUrl) 

	//	hideLoader();
		//showLoader("Downloading file ...");
		
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				
				
                //alert(file.type)
                
                if(file.type == 'application/pdf')
                {
                    //openFile(entry.toURL(), file.type);
                    if(device.platform == 'Android')
                    {
                        open_pdf_android(entry.toURL());
                    }
                    else 
                    {
                        open_pdf_ios(entry.toURL());
                    }
                } 
                else
                {
                   open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				
				
			});
		},
		function (error) {
			
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);
	});

}
function downloadDoc4() {
    
	
	var fileUrl = "http://softweavertech.com/projects/visicoil/pdf/IM-CA-E-VISICOIL-Implantation-Trends-1012_US.pdf";
	var fileName = "IM-CA-E-VISICOIL-Implantation-Trends-1012_US.pdf";
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
	window.resolveLocalFileSystemURL(fileUrl + "/" + fileName, function (fs) {
		fs.file(function (file) {
			
      //alert(fs.toURL() + ' => 1 => '+file.type)
			openFile(fs.toURL(), file.type);
		},
			function (fail) {
			
			
		});
	},
		function (fail) {  


			//alert(uri)
			//alert(fileUrl) 

	//	hideLoader();
		//showLoader("Downloading file ...");
		
		fileTransfer.download(
			uri,
			fileUrl + "/" + fileName,
			function (entry) {
			entry.file(function (file) {
				
				
                //alert(file.type)
                
                if(file.type == 'application/pdf')
                {
                    //openFile(entry.toURL(), file.type);
                    if(device.platform == 'Android')
                    {
                        open_pdf_android(entry.toURL());
                    }
                    else 
                    {
                        open_pdf_ios(entry.toURL());
                    }
                } 
                else
                {
                   open_pdf_android(entry.toURL());
                } 
                //openFile(entry.toURL(), file.type);
				
			},
				function (fail) {
				
				
			});
		},
		function (error) {
			
		},
			true/* , {
			headers: {
				"Authorization": "Basic " + btoa(httpUser + ":" + httpPwd)
			}
		} */);
	});

}
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
