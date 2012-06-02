sourceslist = 
{
	sourceItems:[],  
	sourceLists:[],  
	init: function()
	{
		var varNum = 0;
		var sourceType = "";		
		var itemNum = 0;
		$('a.varlink').live("click", function()
		{
			//id is either list{x} or item{x}
			sourceType = this.id.substr(0, 4);
			itemNum = parseInt(this.id.substring(4));
			
			alert("sourceType: " + sourceType + " sourceIndex: " + itemNum);

			var varStr = $(this).html().substring(3);			
			varNum = parseInt(varStr);
			
			alert("varnum is: " + varNum);
			$('a.varlink').each(function()
			{
				$(this).css('background', 'white');				
			});
			$(this).css('background', 'yellow');			

			if(sourceType == "list")
			{				
				var sourceObj = this.sourceLists[itemNum - 1];
				sourceObj.selectedVar = parseInt(varNum);
			}
			else if(sourceType == "item")
			{
				var sourceObj = this.sourceItems[itemNum - 1];
				sourceObj.selectedVar = parseInt(varNum);			
			}
			
		});
		
		$('img.select_small').live("click", function()
		{
			sourceType = this.id.substr(0, 4);
			itemNum = parseInt(this.id.substring(4));

			alert("sourceType: " + sourceType + " itemNum: " + itemNum);
		});
		
		$('#filllist_cancel').live("click", function(event)
		{			
			event.preventDefault();		
			$("#userdialog").dialog("close");
		});

		//idPrefix
		
		return this;
	
	},
    //Add a source
    addSourceToView: function(selResult, slugId, selSlug, sourceType) 
    {
    	//We have to destroy the accordion each time it updates...
    	//So we store the data about the item in an object.
    	//It is saved to either the sourceItems or sourceLists array, depending on type of source    	
		var sourceObj =
		{
			result_name: selResult,
			slug_id: slugId,
			slug_name: selSlug,
			varIndex: 0,
			selectedVar: -1,
			currVars:[],   //var1,var2,var3,var4
			varTypes:[]    //link,textshort,textlong,used
		}
		$("#source-accordion").accordion("destroy");
		
		var prefix = "item";
		var sourceNum = (this.sourceItems.length + 1).toString();
		if(sourceType == 1)
		{
	        this.sourceItems.push(sourceObj);
		
		}
		else if(sourceType == 2)
		{
			prefix = "list";
			sourceNum = (this.sourceLists.length + 1).toString();			
			this.sourceLists.push(sourceObj);
		}
		else
		{
			alert("Could not add... invalid source type.");
			return;
		}
		var idPrefix = prefix + sourceNum;	
		//I like the first letter capitalized
		var headerText = idPrefix.charAt(0).toUpperCase() + idPrefix.slice(1) + ":" + selResult + " -> " + selSlug;
		
        var jsonUrl = "";
        jsonUrl = "db_codestealer.php?get_scrape_var=true&index=" + 0 + "&result_name=" + selResult;
        
        $.getJSON(jsonUrl, function(data)
        {        
			//alert("In response with data");

			$('#source-accordion').append("<div class='sourcediv' " + "id='" + idPrefix + "-head'>" + headerText + "<\/div>");			
			$('#source-accordion').append("<div id='" + idPrefix + "-body' \/>");

			var $varTable = $("<table id='var_table'><\/table>");
			
			for(var x = 1; x < 9; x++)
			{
				//alert("Var at: " + x + " is " + data[x]);
				$("<tr><td><a href='#' class='varlink' id='" + idPrefix + "'>Var" + x + "<\/a>: " + data[x] + "<\/td><\/tr>").appendTo($varTable);
				sourceObj.currVars.push(data[x]);
				sourceObj.varTypes.push(mainSourceList.getVarType(data[x]));
			}
			
			//alert($varTable.html());
			
			//var $sourceDiv = $('#var_table').wrap("<div id='" + idPrefix + "-body' \/>").parent();	
			$("div#" + idPrefix + "-body").append("<img id='" + idPrefix + "' class='select_small' src='./mods/img/select_small.jpg' \/><span class='bigger_select_text'>Pick list element.  <input type='checkbox' name='autofill' checked='checked' \/>Autofill?<\/span>");
			
			//HACK: BECAUSE I DON'T UNDERSTAND WHY THA FUCK... .append($varTable) adds two tables when the html is clearly of one table
			//WHY THE FUCK IS THIS HAPPENING???  WHYYYYYYYYY
			//$("div#" + idPrefix + "-body").append($varTable);
			$("div#" + idPrefix + "-body").append("<table id='var_table'>" + $varTable.html() + "<\/table>");
			
			//$('#source-accordion').
			$("#source-accordion").accordion({
				active: false,
				alwaysOpen: false, 
				collapsible: true,
				header: "div.sourcediv",
				autoHeight: false
			});			
	    });		
		
		//<div class='sourcediv'>Create Content Template Container</div>
		//<div>Content</div>		
        
    },
    getVarType : function(theVar)
    {
    	if(theVar.indexOf("http:") == 0)
    	{
    		if(theVar.indexOf(".jpg", theVar.length - 4) !== -1 ||
    			theVar.indexOf(".png", theVar.length - 4) !== -1 ||
    			theVar.indexOf(".gif", theVar.length - 4) !== -1 ||
    			theVar.indexOf("jpeg", theVar.length - 4) !== -1 ||
    			theVar.indexOf(".bmp", theVar.length - 4) !== -1)
    		{
    			return "image";
    		}
    		return "link";
    	}
		else if(theVar.indexOf("$") == 0)
		{
			return "price";			
		}
		
		if(theVar.length > 256)
		{
			return "textlong";
		}
    	return "textshort";
    
    },
    autofillVarsInView : function()
    {    
    	//THIS IS CALLED WHEN BUTTON PRESSED 
    	
    	//${{item1}}
		//${list1-var2}
    	//<li title="repeater-list1"
    	var oldHtml = $("#template_div").html();
    	if(oldHtml.length < 10)
    	{
    		alert("First select some stolen code");
    		return;
    	}
    	
    	
    	for(var j = 0; j < this.sourceLists.length; j++)
    	{    		
     		var bestListMatch = this.findBestListMatch(this.sourceLists[j]);
    		if(bestListMatch != null)  //li element, div element, tr element or null
    		{
    			alert("Popping up dialog");
    			
    			//this.autofillList(this.sourceLists[j]);
    			//manual is a popup that has you fill in the vars...
    			this.manualfillList(bestListMatch, this.sourceLists[j], j);
    		}
    	}
    	
    	for(var k = 0; k < this.sourceItems.length; k++)
    	{
    		this.autofillItem(this.sourceItems[k]);
    	}
    	
		if(this.sourceLists.length > 0)
		{	
			
		}
		
    },
    //THIS IS GOING TO BE TOO HARD... TOO MANY CASES
    //LETS JUST MAKE AN EASY SELECTION UPON LOADING STOLEN CODE
    //THAT SELECTION HAS ALL THE POSSIBLE LISTS 
    findBestListMatch : function(listObject)
    {
		var liParentArr = new Array();
		var trParentArr = new Array();
		var divParentArr = new Array();
		
		var bestListScore = 0;
		var bestLi = null;
		var currScore = 0;
		var listIndex = 0;
		
		$("#template_div").find("li,tr").each(function()
		{
			if($.inArray(this.parent, liParentArr) != -1)
			{
				return;
				//if same parent we shouldn't analyze
			}
			liParentArr.push(this.parent);  
			currScore = 0;
			
			if($(this).attr("title").indexOf("repeater-list") >= 0)
			{
				//already used
				return;
			}
			
			/************* CALCULATE THE SCORE BASED ON IF FIELDS OF TYPE AVAILABLE *******/
			var sourceLinkCount = 0;
			var sourceTitleCount = 0;
			var sourceTextCount = 0;
			var sourceImageCount = 0;
			
			for(var m = 0; m < listObject.varTypes.length; m++)
			{
				//image, link, textshort, textlong, price
				var aType = listObject.varTypes[m];
				//alert("AType is: " + aType);
				
				if(aType == "link")
					sourceLinkCount++;
				if(aType == "image")
					sourceImageCount++;
				if(aType == "textshort")
					sourceTitleCount++;
				if(aType == "textlong")
					sourceTextCount++;
			}
			
			alert("VARIABLE COUNTS a,img,title,text: " + sourceLinkCount + ", " + sourceImageCount + ", " + sourceTitleCount + ", " + sourceTextCount);
			
			if($(this).find("a").length > 0)
			{
				$(this).find("a").each(function()
				{
					if(sourceLinkCount > 0)
					{
						currScore++;
						sourceLinkCount--;
					}
				});
			}
			if($(this).find(":header").length > 0)
			{			
				$(this).find(":header").each(function()
				{
					if(sourceTitleCount > 0)
					{
						currScore++;
						sourceTitleCount--;
					}
				});
			}
			if($(this).find("p,span,div").length > 0)
			{			
				$(this).find("p,span,div").each(function()
				{
					if(sourceTextCount > 0)
					{
						currScore++;
						sourceTextCount--;
					}				
				});
			}

			if($(this).find("img").length > 0)
			{	
				$(this).find("img").each(function()
				{
					if(sourceImageCount > 0)
					{
						currScore++;
						sourceImageCount--;
					}
				});
			}

			alert("CurrScore is: " + currScore + " for " + $(this).html()); 			
			if(currScore > bestListScore)
			{
				bestLi = this;
				bestListScore = currScore;				
			}	
			
		});
		
		if(bestLi != null)
		{		
			//alert("bestli html: " + bestLi.innerHTML);
		}
		else
		{
			alert("bestli is null");
		}
		return bestLi;
    
    },
    autofillList : function(liElem, listObject)
    {
    	//This seems a bit difficult...
    	//Why not just make a popup that allows you to insert the correct things in place
    	//
		$(liElem).siblings().remove();
		$(liElem).attr("title", "repeater-list" + listIndex);
		//Delete all but first
		//Wrap with a {{#list1}}


		var textNodes = getTextNodesIn(liElem, false);
		for(var m = 0; m < textNodes.length; m++)
		{
			var nValue = textNodes[m].nodeValue;
			if(nValue.length < 3)
			{ 
				//irrelevent text
			}
		}    
    
    },
    manualfillList : function(liElem, listObject, listIndex)
    {
    	$("#userdialog").empty();
    	$("#userdialog").attr("name", "list" + listIndex);
				
    	$dialogDiv = $('<div style="text-align:center"></div>');
    	
    	//Add Textarea
    	var liOuterHtml = $(liElem).clone().wrap('<div>').parent().html();
    	var $aTextArea = $('<textarea name="dialog_edithtml" id="dialog_edithtml" style="width:450px;" rows="9" ></textarea>');		
		$aTextArea.val(liOuterHtml);
		
		$dialogDiv.append($aTextArea);
		
		//Add VarTable
		var $varTable = $("<table id='var_table'><\/table>");		
		for(var x = 0; x < listObject.currVars.length; x++)
		{
			var varNum = x + 1; 
			var varVal = listObject.currVars[x];
			//alert("Var at: " + x + " is " + data[x]);
			$("<tr><td style='vertical-align:top'><a href='#' class='varlink' id='list" + listIndex + "'>Var" + x + ":<\/a><\/td><td style='width:500px'>" + varVal + "<\/td><\/tr>").appendTo($varTable);			
		}		
		
		$dialogDiv.append("<table id='var_table'>" + $varTable.html() + "<\/table>");
		
		//This adds two tables for some retarded retard reason
		//$dialogDiv.append($varTable);
		
		//OK Cancel Buttons
		var $okCancelDiv = $('<div style="text-align:right;"></div>');
		
		$okCancelDiv.append('<button id="filllist_cancel">Cancel</button>');
		$okCancelDiv.append('<button id="filllist_ok">OK</button>');		
		$dialogDiv.append($okCancelDiv);
		
		$("#userdialog").append($dialogDiv);
    	$( "#userdialog" ).dialog({ width: 600 });
    	$( "#userdialog" ).dialog( "option", "title", 'Insert List' + listIndex + ' Vars into HTML' );
    	
    	if(!$( "#userdialog" ).dialog("isOpen"))
    	{
    		$( "#userdialog" ).dialog("open")    	
    	}
    	
    	//$(liElem).html();
    	//Might not need these, just use currVars
    	/*****
        var jsonUrl = "";
        jsonUrl = "db_codestealer.php?get_scrape_var=true&index=" + 0 + "&result_name=" + selResult;
        
        $.getJSON(jsonUrl, function(data)
        {        
			//alert("In response with data");

			$('#source-accordion').append("<div class='sourcediv' " + "id='" + idPrefix + "-head'>" + headerText + "<\/div>");			
			$('#source-accordion').append("<div id='" + idPrefix + "-body' \/>");

			var $varTable = $("<table id='var_table'><\/table>");
			
			for(var x = 1; x < 9; x++)
			{
				//alert("Var at: " + x + " is " + data[x]);
				$("<tr><td><a href='#' class='varlink' id='" + idPrefix + "'>Var" + x + "<\/a>: " + data[x] + "<\/td><\/tr>").appendTo($varTable);
				sourceObj.currVars.push(data[x]);
				sourceObj.varTypes.push(mainSourceList.getVarType(data[x]));
			}
						
			$().append("<table id='var_table'>" + $varTable.html() + "<\/table>");
			
			//$('#source-accordion').
			$("#source-accordion").accordion({
				active: false,
				alwaysOpen: false, 
				collapsible: true,
				header: "div.sourcediv",
				autoHeight: false
			});			
	    });		    	
    	
    	****/
    	
	},	
    insertVarInView : function(linkElem)
    {
    	//Shouldn't this be a drag and drop?
    	//or click an arrow elem
    	
    
    },    
    getCaret : function(el) 
    { 
		if (el.selectionStart) 
		{ 
			return el.selectionStart; 
		} 
		else if (document.selection) 
		{ 
			el.focus(); 

			var r = document.selection.createRange(); 
			if (r == null) { 
			  return 0; 
			} 

			var re = el.createTextRange(), 
				rc = re.duplicate(); 
			re.moveToBookmark(r.getBookmark()); 
			rc.setEndPoint('EndToStart', re); 

			return rc.text.length; 
		}  
		return 0; 
	},    
	getTextNodesIn : function(node, includeWhitespaceNodes) 
	{
		var textNodes = [], whitespace = /^\s*$/;
		

		if (node.nodeType == 3) 
		{
			//if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) 
			//{
				textNodes.push(node);
			//}
		} 
		else 
		{
			for (var i = 0, len = node.childNodes.length; i < len; ++i) 
			{
				this.getTextNodes(node.childNodes[i]);
			}
		}
		

		this.getTextNodes(node);
		return textNodes;		
	},
    clearSourceList: function()
    {
    	this.sourceItems = array();
    	this.sourceLists = array();
    	$('#source-accordion').empty();    
    }
};



    
