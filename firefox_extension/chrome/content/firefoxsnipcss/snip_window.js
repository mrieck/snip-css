//Scope doesn't matter on this page, just a XUL window
var ss = require("simple-storage");
var REMOTE_SERVER = "http://localhost/github/SnipCSS/simple_server/remote_snipcode.php";

var stolenHtml = "";
var stolenArr = new Array();  //all CSS Selectors
var cssImages = new Array(); //snipped CSS Images
var htmlImages = new Array(); //snipped Html Images
var parentDim = new Array();
var websiteUrl = "";
var prefs;

function onLoadUI()
{
    stolenHtml = window.arguments[0].outHtml;
    stolenArr = window.arguments[0].cssArr;
    cssImages = window.arguments[0].cImages;
    htmlImages = window.arguments[0].hImages;
    websiteUrl = window.arguments[0].wUrl;   
    parentDim = window.arguments[0].conDim;
    
	//Not using jquery because this is XUL... can't use .val() on xul 
    var textHtml = document.getElementById("text_shtml"); 
    var textCSS = document.getElementById("text_scss");     
    var cssImageList = document.getElementById("css_image_list"); 
    var htmlImageList = document.getElementById("html_image_list"); 
    
    var allCSS = "";
    for(var s = 0; s < stolenArr.length; s++)
    {
        allCSS = allCSS + stolenArr[s] + "\n";    
    }
    
    textCSS.value = allCSS;    
    textHtml.value = stolenHtml;
   
    for (var i = 0; i < cssImages.length; i++)
    {
        var elementItem = document.createElement("listitem");
        elementItem.setAttribute("label", cssImages[i]);

        cssImageList.appendChild(elementItem);
    }   
    for (i = 0; i < htmlImages.length; i++)
    {
        var elementItem = document.createElement("listitem");
        elementItem.setAttribute("label", htmlImages[i]);

        htmlImageList.appendChild(elementItem);
    }   
	
	//Look at this fucking bullshit...  why can't Google Chrome expose the webkit methods that determine matched styles?
    prefs = Components.classes["@mozilla.org/preferences-service;1"]  
         .getService(Components.interfaces.nsIPrefService)  
         .getBranch("extensions.firefoxsnipcss.");  
    prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);  

    var defServer = prefs.getCharPref("serverurl");  	
	if(defServer)
	{
		REMOTE_SERVER = defServer;
	}
	
	var serverElem = document.getElementById("server_loc"); 
	serverElem.value = REMOTE_SERVER;
	
}

function saveSnip()
{
    if(stolenHtml == "")
    {
        alert("Nothing was snipped?!?");
        return;
    }
    
    var strCImages = cssImages.join("|");
    var strHImages = htmlImages.join("|");
    var strCSS = stolenArr.join("\n");

	REMOTE_SERVER = $('#server_loc').val();
	
	//alert("Setting preferences to: " + REMOTE_SERVER);
	
	prefs.setCharPref("serverurl", REMOTE_SERVER);  


    var dimString = "";    
    if(parentDim.length > 1)
    {
        dimString = parentDim[0] + "," + parentDim[1];
    }

	//alert("Posting to server Server: " + REMOTE_SERVER);	

    $.post(REMOTE_SERVER, 
    {  
       save_html: stolenHtml, save_css:strCSS, save_cimages:strCImages, save_himages:strHImages, 
       save_url: websiteUrl, container_dimensions : dimString},
    function(data)
    {  
        processAjaxInsert(data);
    });
}

function processAjaxInsert(aData)
{
    alert("Saved to ID: " + aData);
}

