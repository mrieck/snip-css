/********************************************************** 
 * Author: Mark Rieck (http://www.markrieck.com)
 * Your scientists were so preoccupied with whether or not they could, they didn't stop to think if they should. 
 **********************************************************
 * The author of this software is not liable for any damages or lawsuits arising from
 * the use of this software.  For more info see the READ_ME.
 **********************************************************/
Firebug.Console.log("What the fuck");

FBL.ns(function() { with (FBL) { 


Firebug.SnipCSS = extend(Firebug.Module, 
{ 	
    initialize: function() 
    { 
        Firebug.Module.initialize.apply(this, arguments); 
        Firebug.registerUIListener(this); 
    }, 
    shutdown: function() 
    { 
        Firebug.Module.shutdown.apply(this, arguments); 
        Firebug.unregisterUIListener(this); 
    }, 
    onContextMenu: function(items, object, target, context, panel, popup) 
    { 
		//ITEMS ARE SUPPOSED TO BE EMPTY...
		//FIREBUG DOESNT WANT ANYONE EDITING THEIR PRECIOUS CONTEXT MENU
		
		Firebug.Console.log("Items: " + items);
		Firebug.Console.log("object: " + object);
		Firebug.Console.log("target: " + target);
		Firebug.Console.log("context: " + context);
		Firebug.Console.log("panel: " + panel);
		Firebug.Console.log("popup: " + popup);
					
	
		CSSSnip.setElem(object);
		var com = bindFixed(CSSSnip.snipCSS, this);
		items.push({label: "SnipCSS", command: com});		

		Firebug.Console.log("Finished with context menu");	
    }
}); 

Firebug.registerModule(Firebug.SnipCSS);


}});


/********************************************************** 
 * Author: Mark Rieck (http://www.markrieck.com)
 * Licensed under the LGPL. 
 **********************************************************
 * The author of this software is not liable for any damages or lawsuits arising from
 * the use of this software.  For more info see the READ_ME.
 **********************************************************/

/********** Lets Try this Module pattern instead of Object Literal Notation ********************** 
*********** (before this was all global func/vars. It is easier to convert to this than OLN)***********/

//http://yuiblog.com/blog/2007/06/12/module-pattern/
CSSSnip = function () 
{
	//private variables and methods are before "return"
	var isSnippingCode = true;
	var snipArr = new Array();  //all CSS Selectors
	var cssImages = new Array(); //snipped CSS Images
	var htmlImages = new Array(); //snipped Html Images
	var parentDim = new Array();
	var snipHtml = "";
	var websiteUrl = "";
	var snipRootElem;
	var selectorFixArr = new Array();
	var stylesheetLocationArr = new Array();
	var REMOTE_SERVER = "http://localhost/automationking";

	var uriUtil;
	var imgUriUtil;
	
	//extracts the URL from a css selector like:  background: url('http://whatisthis.com')
	var parseURLValue = function(value)
	{
		var xURL = /url\("?([^"\)]+)?"?\)/;
		var m = xURL.exec(value);
		return m ? m[1] : "";
	}
	
	//Is exact copy in snipArr?  If so, get index
	var alreadySnipped = function(testText)
	{
		for(var i = 0; i < snipArr.length; i++)
		{
			var allSelector = snipArr[i];    
			if(allSelector == testText)
			{
				return i;
			}        
		}
		return -1;
	}	
		
	
	/*************************
	So we have a selector like...  #container_div li.fuckin a
	What if #container_div wasn't a part of the html we took?
	Then this selector needs to be changed to "li.fuckin a" to match.  It searches hierarchy for each component,
	and removes those that don't match
	**************************/
	var fixSelector = function(selText)
	{
		
		var selParts = selText.split(" ");
		
		if(selParts.length <= 1)
		{
			return selText;
		}
			
		var matchPartsArr = new Array();  //only add parts that exist in hierarchy
		var removedOne = false;
		
		var k = 0;
		for(k = 0; k < selParts.length; k++)
		{
			//dont want to mess jquery up by having :visited, :hover etc. in selector
			if(selParts[k].indexOf(":") >= 0)
			{
				matchPartsArr.push(selParts[k]);        
				continue;
			}
			if(selParts[k].indexOf("<") >= 0 || selParts[k].indexOf(">") >= 0)
			{
				matchPartsArr.push(selParts[k]);        
				continue;
			}        
			
			//search rootElem for matches        
			var howManyMatches = $(snipRootElem.parentNode).find(selParts[k]).length;
			
			if(howManyMatches > 0)
			{
				matchPartsArr.push(selParts[k]);
			}
			else
			{
				//Firebug.Console.log("selPart didnt match: " + selParts[k]);              
				removedOne = true;
			}
		}
	  
		if(!removedOne)  //nothing needs fixin', we kept them all
		{
			return selText;
		}    

		//if we had to remove everything why did it match... well its prob something like
		//body, table,td,blockquote  etc.  where blockquote wasnt used but td might have been
		//so just skip it for now.. leave blockquote there... but this is bad because it's affecting my shit... let's try removing it
		if(matchPartsArr.length > 0)  
		{
			selText = matchPartsArr.join(" ");        
		}

		//Firebug.Console.log("New seltext: " + selText); 
		  
		return selText;
	}
	
	//Gets Rules of One Element and adds them to snipArr
	var snipElemCSS = function(element)
	{
		Firebug.Console.log("Trying rule calls");
		
        var rules = [], sections = [], usedProps = {};
        Firebug.currentContext.getPanel('css').getInheritedRules(element, sections, usedProps);
        Firebug.currentContext.getPanel('css').getElementRules(element, rules, usedProps);
	
		var ruleArr = rules;
		Firebug.Console.log(ruleArr);
		var i = 0;
		var j = 0;
		var k = 0;
		
		Firebug.Console.log("Done Logging Rule Arr");
		
		
		if(!ruleArr || ruleArr.length <= 0)
		{
			Firebug.Console.log("RULE ARR EMPTY");
			
			return;
		}
			
		for(i = 0; i < ruleArr.length; i++)
		{
			//  var selText = x["rule"].selectorText;
			//  JQUERY doesn't like the  : visited  a : hover
			var selText = ruleArr[i].rule["selectorText"];
			Firebug.Console.log("selText: " + selText);
			
			if(selText === undefined || selText.length <= 0)
			{
				continue;
			}
					
			var selArr = selText.split(",");
			var modifiedArr = new Array();
			
			//If this selector was already fixed to match elements of the Snip DOM, then just use the fixed
			//It speeds up the process, since we are calling this function for every DOM element in Snip
			var foundFix = false;
			for(var aFix in selectorFixArr)
			{
				if(aFix == selText)//already exists
				{
					foundFix = true;
					selText = selectorFixArr[aFix];    
					//Firebug.Console.log("Found Existing : " + selText);                  
				}
			}
			
			if(!foundFix)
			{
				for(k = 0; k < selArr.length; k++)
				{                
					var fixedSelector = fixSelector(selArr[k]);
					//TODO: if body elem we should instead make it the root elem of snip...
					//#snip_root  ... if single generic element like a or table... we should probably prepend
					//#snip_root ... maybe give 
					
					modifiedArr.push(fixedSelector);            
					selectorFixArr[selText] = fixedSelector;
				}
				Firebug.Console.log("Original Selector: " + selText);                          
				selText = modifiedArr.join(",");
				Firebug.Console.log("New Selector: " + selText);                  
			}
			
			var allProperties = "";
		
			//Firebug.Console.log("Going through props");
			
			for(j = 0; j < ruleArr[i].props.length; j++)
			{        
				if(ruleArr[i].props[j].disabled == false && ruleArr[i].props[j].value !== "inherit")
				{
					var lineVal = ruleArr[i].props[j].value;
					
					var parseUrl = parseURLValue(ruleArr[i].props[j].value);
					if(parseUrl != "")
					{
						Firebug.Console.log("Found CSS Image: " + parseUrl);
						var stylesheetUrl = Firebug.currentContext.getPanel('css').getStylesheetURL(ruleArr[i].rule); 
						if (stylesheetUrl.lastIndexOf('/') == -1)
						{
							continue;
						}
						stylesheetUrl = stylesheetUrl.substring(0, stylesheetUrl.lastIndexOf('/') + 1);                    
						Firebug.Console.log("StyleSheet Url: " + stylesheetUrl);                    
				   
						//img in stylesheet is relative to stylesheet url, not the
						//url of the loaded webpage
						imgUriUtil = $.uri(stylesheetUrl);
						var fullUrl = imgUriUtil.resolve(parseUrl).toString();
						cssImages.push(fullUrl);
						Firebug.Console.log("Found CSS Image: " + fullUrl);  

						if(fullUrl.indexOf("\/") >= 0)
						{
							//Firebug.Console.log("inside elemsrc");  
							var sArr = fullUrl.split("\/");
							var imgName = sArr[sArr.length - 1];
							var replaceUrl = "PATH_TO_CIMAGES" + imgName;
							lineVal = lineVal.replace(parseUrl, replaceUrl);
							Firebug.Console.log("Replaced css image path to: " + imgName);                        
						}
					}

					var line = ruleArr[i].props[j].name + ": " + lineVal + ";";
					
					allProperties = allProperties + line;                
					//Firebug.Console.log(ruleArr[i].props[j].name + ":" + ruleArr[i].props[j].value);                                
				}
			}
			
			var alreadySnippedIndex = alreadySnipped(selText + " {" + allProperties + "}");
			
			if(alreadySnippedIndex >= 0)  
			{
				//The EXACT same selector and properties already exist in snipped CSS
				var itExists = snipArr[alreadySnippedIndex];
				Firebug.Console.log("-------This selector already exists: " + itExists);
			}
			else
			{
				Firebug.Console.log("---------------------");			
				Firebug.Console.log(selText + " {" + allProperties + "}");
				snipArr.push(selText + " {" + allProperties + "}");
			}
			
			//Firebug.Console.log("}");         
		}    
	
	
	}

	//YES WE HIT EVERY SINGLE ELEMENT IN THE SNIPPED DOM 
	//AND WE TAKE THEIR CSS
	var snipChildrenCSS = function(elem, depth) 
	{ 
	   snipElemCSS(elem);
	   
	   if(elem.hasChildNodes()) 
	   {
		 // Get all children of node
		 var children = elem.childNodes;               

		 // Loop through the children
		 for(var c = 0; c < children.length; c++) 
		 {
			if(children[c].nodeType == 1)
			{            
				Firebug.Console.log("=====>SNIPPING NODE AT DEPTH: " + depth + " --------- " + children[c].nodeName);          
				snipChildrenCSS(children[c], (depth + 1));        
			}
		 }     
	   }
	}	
	
	var snipImagesFromHtml = function(elem)
	{
		$(elem).find('img,button,input').each(function()
		{
			var elemSrc = "";
			if($(this).attr('src') !== undefined)
			{
				elemSrc = this.src;
			}
			else
			{
				return;
			}
			if(!elemSrc)
			{
				return;
			}
			var imgSrc = uriUtil.resolve(elemSrc).toString();     
			
			var hImage = "";
			if(elemSrc.indexOf("\/") >= 0)
			{
				//Firebug.Console.log("inside elemsrc");  
				var sArr = elemSrc.split("\/");
				var imgName = sArr[sArr.length - 1];
						

				hImage = "PATH_TO_HIMAGES" + imgName;            
				this.src = hImage;
			}
			else
			{
				hImage = "PATH_TO_HIMAGES" + imgName;            
				this.src = hImage;   
			}
			
			htmlImages.push(imgSrc);
		});
	}

	//anying inside return just makes it a public function/member
	return  {
		setElem: function(elem)
		{
			snipRootElem = elem;		
		},		
		snipCSS: function()
		{
			//alert("OK1");
			var elem = snipRootElem;

			Firebug.Console.log("In Snip CSS");		
			var parentElem = elem.parentNode;
			var win = parentElem.ownerDocument.defaultView;
			var style = win.getComputedStyle(parentElem, "");
			
			parentDim.push(style.getPropertyValue("width"));
			parentDim.push(style.getPropertyValue("height"));
			Firebug.Console.log("Parent Dim: " + style.getPropertyValue("width") + ", " + style.getPropertyValue("height"));		
			
			websiteUrl =  Firebug.currentContext.browser.contentWindow.location.href;
			Firebug.Console.log("Website URL: " + websiteUrl);
			
			uriUtil = $.uri(websiteUrl);
			
			snipArr = new Array();
			cssImages = new Array();       
			htmlImages = new Array();    
			selectorFixArr = new Array();    
			isSnippingCode = true;

			Firebug.Console.log("Variables Initialized");		
			
			//alert("Done");
			Firebug.Console.log("SNIPPING ROOT ELEMENT");   
			snipElemCSS(elem);
			
			var children = elem.childNodes; 
			for(var c = 0; c < children.length; c++) 
			{
				if(children[c].nodeType == 1)
				{
					Firebug.Console.log("SNIPPING NODE at depth 1 --------- " + children[c].nodeName);        
					snipChildrenCSS(children[c], 1);        
				}
			}       
			
			isSnippingCode = false;    
			snipImagesFromHtml(elem);   
			
			var sOuterHTML = new XMLSerializer().serializeToString(elem);
		
			//after serializing remove this xml shit...
			sOuterHTML = sOuterHTML.replace('xmlns="http://www.w3.org/1999/xhtml" role="main"', '');
			
			//Open the dialog showing results
			var win = window.openDialog("chrome://firefoxsnipcss/content/snip_window.xul",  "snip_window3", "chrome,centerscreen", 
			{
				outHtml: sOuterHTML, 
				cssArr : snipArr, 
				cImages : cssImages,  
				hImages : htmlImages, 
				wUrl : websiteUrl, 
				conDim : parentDim
			});     

		}
	};

}();

/*
function openUrlNewTab(url) 
{
    var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow('navigator:browser');
    win.gBrowser.selectedTab = win.gBrowser.addTab(url);
}
*/


//Object dump
function myDump(object, depth, max)
{
	depth = depth || 0;
	max = max || 2;

	if (depth > max)
	return false;

	var indent = "";
	for (var i = 0; i < depth; i++)
	indent += "  ";

	var output = "";  
	for (var key in object){
	output += "\n" + indent + key + ": ";
	switch (typeof object[key]){
	  case "object": output += odump(object[key], depth + 1, max); break;
	  case "function": output += "function"; break;
	  default: output += object[key]; break;        
	}
	}
	return output;
}


