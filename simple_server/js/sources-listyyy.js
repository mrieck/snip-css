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
			
			alert("sourceType: " + sourceType + " itemNum: " + itemNum);

			var varStr = $(this).html().substring(3);			
			varNum = parseInt(varStr);
			
			alert("varnum is: " + varNum);
			$('a.varlink').each(function()
			{
				$(this).css('background', 'white');				
			});
			$(this).css('background', 'yellow');			
		});
		
		if(sourceType == "list")
		{				
			var sourceObj = mainSourceList.sourceLists[itemNum - 1];
			sourceObj.selectedVar = parseInt(varNum);
		}
		else if(sourceType == "item")
		{
			var sourceObj = mainSourceList.sourceItems[itemNum - 1];
			sourceObj.selectedVar = parseInt(varNum);			
		}
		
		
	
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
			var $varTable = $("<table id='var_table'><tbody><\/tbody><\/table>");
			$('#source-accordion').append($varTable);
			
			for(var x = 1; x < 9; x++)
			{
				//alert("Var at: " + x + " is " + data[x]);
				$('#var_table').append($("<tr><td><a href='#' class='varlink' id='" + idPrefix + "'>Var" + x + "<\/a>: " + data[x] + "<\/td><\/tr>"));	
				sourceObj.currVars.push(data[x]);
				sourceObj.varTypes.push(mainSourceList.getVarType(data[x]));
			}
			
			
			$('#var_table').wrap("<div id='" + idPrefix + "-body' \/>");			
			
			
			//$('#source-accordion').
			$("#source-accordion").accordion({
				active: false,
				alwaysOpen: false, 
				collapsible: true,
				header: "div.sourcediv"
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
    	//${{item1}}
		//${list1-var2}
    	//<li title="repeater-list1"
    	for(var j = 0; j < this.sourceLists.length; j++)
    	{    		
     		var bestListMatch = this.findBestListMatch(this.sourceLists[j]);
    		if(bestListMatch != null)  //li element, div element, tr element or null
    		{
    			this.autofillList(this.sourceLists[j]);
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
    findBestListMatch : function(listObject)
    {
		var liParentArr = new Array();
		var trParentArr = new Array();
		var divParentArr = new Array();
		
		var bestListScore = 0;
		var currScore = 0;
		
		$("#template_div").find("li").each(function()
		{
			if($.inArray(this.parent, liParentArr) != -1)
			{
				return;
				//if same parent we shouldn't analyze
			}
			liParentArr.push(this);  
			listIndex++;
		});	
    	liParentArr.push(
    
    }
    autofillList : function(liElem, listObject)
    {
		$(this).siblings().remove();
		$(this).attr("title", "repeater-list" + listIndex);
		//Delete all but first
		//Wrap with a {{#list1}}


		var textNodes = getTextNodesIn(elem, false);
		for(var m = 0; m < textNodes.length; m++)
		{
			var nValue = textNodes[m].nodeValue;
			if(nValue.length < 3)
			{
				//irrelevent text
			}
		}    
    
    }
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
    clearSourceList: function()
    {
    	this.sourceItems = array();
    	this.sourceLists = array();
    	$('#source-accordion').empty();    
    }
};



    
