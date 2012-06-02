sourceslist = 
{
	sourceItems:[],  
	sourceLists:[],  
	init: function()
	{
		$('a.varlink').live("click", function()
		{
			//id is either list{x} or item{x}
			var sourceType = this.id.substr(0, 4);
			var itemNum = this.id.substring(4);
			
			alert("sourceType: " + sourceType + " itemNum: " + itemNum);
			
		});
	
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
			selectedVar: -1
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
			
			for(var x = 0; x < data.length; x++)
			{
				//alert("Var at: " + x + " is " + data[x]);
				$('#var_table').append($("<tr><td><a href='#' class='varlink' id='" + idPrefix + "'>Var" + x + "<\/a>: " + data[x] + "<\/td><\/tr>"));			
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
    insertVarInView : function(linkElem)
    {
    
    
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



    
