<?php
    include_once("snipcss_config.php");
    include_once("helper_functions.php");
    	

	
	/*********************   FUNCTIONS  FUNCTIONS FUNCTIONS  ********************/
	
	
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>E.D.I.T.</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <!-- <link rel="stylesheet" type="text/css" href="style.css"> -->
    <link id="sitestyle" class="sitestyle" rel="stylesheet" type="text/css" href="style.css?<?php echo time(); ?>">    
    <script type="text/javascript" src="./js/jquery-1.4.2.min.js?"></script>
	<script type="text/javascript" src="./js/beautify-html.js?" ></script>    
	<script type="text/javascript" src="./js/jqueryui/js/jquery-ui-1.8.13.custom.min.js" ></script> 
	<script type="text/javascript" src="./js/sources-list.js?<?php echo time(); ?>" ></script>
	<script type="text/javascript" src="./js/nicEdit.js"></script> 
	
	<link class="sitestyle" rel="stylesheet" type="text/css" href="./js/jqueryui/css/ui-lightness/jquery-ui-1.8.13.custom.css?<?php echo time(); ?>">
    <script type="text/javascript">
    
    var SNIP_UTILITY = '<?php echo 'http://' . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]; ?>';
    var downloadFile = SNIP_UTILITY + "download_utility.php"; 
    
	var mainSourceList;	     


	var CURRENT_CODE_ID = -1;
	
	<?php
		echo "var typeList = new Array();"; 
		foreach($codeTypeList as $aType)
		{
			echo "typeList.push('{$aType}');";			
		}
	?>
        
    
    function changeCode(codeId)
    {
        $extra = (new Date()).getTime(); //add randomness to url
        var jsonUrl = downloadFile + "?id=" + codeId + "&r=" + $extra;
        
        //alert("calling json: " + jsonUrl);
        //use the JQuery get to grab the URL from the selected item, put the results in to an argument for parsing in the inline function called when the feed retrieval is complete
        $.getJSON(jsonUrl, function(data)
        {
        	if(data.message && data.message != "")
        	{
				alert(data.message);        		
        	}
            //alert("data: " + data);
            //alert("location: " + data.css_location);                                    

			//FILL THE HTML 
            $("#container_div").css("width", data.container_width);
            $("#container_div").css("height", data.container_height);
            
            $("#widget_width").val(data.container_width);
            $("#widget_height").val(data.container_height);
            
            //Stolen HTML attached before CLEANSED?
            $("#container_div").html(data.stolen_html);
            //Maybe we should cleanse on the other side... before
            
            var css = document.createElement("link");
            css.setAttribute("href", data.css_location);
            css.setAttribute("rel","stylesheet");
            css.setAttribute("type","text/css");
            css.setAttribute("class","site_stylesheet");            
            setCSS(css);
            
            //alert(data.stolen_type);
            var stolenType = data.stolen_type;
            if(stolenType != "" && stolenType != null)
            {
            	var tIndex = -1;
            	for(var m = 0; m < typeList.length; m++)
            	{
            		if(typeList[m] == stolenType)
            		{
            			tIndex = m;
            		}
            	}
            	if(tIndex < 0)
            	{
            		alert("Bad Type - Not Found: " + stolenType);
            	}
            	else
            	{
            	    //alert("setting checked of: " + "#type-" + tIndex);
					
					//var idField = "#type-" + tIndex;
					$("#type-" + tIndex).attr("checked", "checked");    
					$("#type_container" ).buttonset("refresh");
					
            	}	
            }
            else
            {
            	$("input[name=typeradio]").removeAttr("checked");
            	$("#type_container" ).buttonset("refresh");
            }
            
            //Directions to Add Code
            $("#span_codeid").html("Now showing code id: " + codeId);
            $("#curr_id").html(codeId);
            setModifiedHtmlAreas();
            
            $("#css_ref").val("<link rel='stylesheet' type='text/css' href='./site/" + codeId + "/style.css' />");            

            
            //COLOR CHANGE TABLES
            fillImageTable(data.html_images, data.css_images); 
            
            CURRENT_CODE_ID = codeId;
            $("#thecodeid").html(CURRENT_CODE_ID);
                        
            
            //The helper fields
            //$("#stolen_html").html(encodeMyHtml(data.stolen_html));
                        
        });
    }
    
    function loadCodeList(typeName)
    {
        $extra = (new Date()).getTime(); //add randomness to url
        var getUrl = downloadFile + "?getcodeoptions=true&codetype=" + typeName + "&r=" + $extra;
        
        //alert("calling json: " + jsonUrl);
        //use the JQuery get to grab the URL from the selected item, put the results in to an argument for parsing in the inline function called when the feed retrieval is complete
        $.get(getUrl, function(data)
        {    
        	//alert("changing code select innerhtml to: " + data);
        	$("#filtercode").empty();
        	$("#filtercode").html(data); 
        	$("#typeof_text").html(typeName);
        });        
    
    }
    
    function fillImageTable(hImages, cImages)
    {
	    $('#image_table > tbody').empty();

    	var hArr = hImages.split("|");
    	var cArr = cImages.split("|");

		for(var i = 0; i < hArr.length; i++)
		{
			if(hArr[i] == "")
			{	continue;}
				
			var checkboxText = "<input type='checkbox' id='himage" + i + "'\/>h: " + i;
			$('#image_table > tbody').append("<tr><td>" + checkboxText + "<\/td><td>HTML<\/td><td>" + hArr[i] + "<\/td><\/tr>");    			
		}
    	
		for(var j = 0; j < cArr.length; j++)
		{
			if(cArr[j] == "")
			{	continue;}

			var checkboxText = "<input type='checkbox' id='cimage" + j + "'\/>c: " + j;
			$('#image_table > tbody').append("<tr><td>" + checkboxText + "<\/td><td>CSS<\/td><td>" + cArr[j] + "<\/td><\/tr>");    			
		}
    }
    
    function setModifiedHtmlAreas()
    {
		/*********** FIRST BEAUTIFY HTML AND REMOVE UNNECESSARY TAGS/ATTRIBUTES  ********/
    	$("a", $("#container_div")).each(function()
    	{
    		this.href="#";    		
    		$(this).removeAttr("alt");
    		$(this).removeAttr("title");    		
    	});

    	$("img", $("#container_div")).each(function()
    	{
    		//this.href="#";    		
    		$(this).removeAttr("alt");
    		$(this).removeAttr("title");    		
    	});
    	$(":header", $("#container_div")).each(function()
    	{
    		//this.href="#";    		
    		$(this).removeAttr("alt");
    		$(this).removeAttr("title");    		
    	});
    	
    	$("div", $("#container_div")).each(function()
    	{
    		$(this).removeAttr("xmlns");
    	});
    	
    	$("script", $("#container_div")).remove();
    	$("object", $("#container_div")).remove();  
		$("noscript", $("#container_div")).remove();    
		
		//Set to the basic copy code
		var beautyHtml = style_html($("#container_div").html(), 4, ' ', 80, "collapse");
		
		$("#stolen_html").val(beautyHtml);

		/*****************************   BUILD TEMPLATES    ***********************************/
		
		//Use template_div from this point
		//Because we're going to replace elements with template place-holders 		
		//Copy over to template_div
		$("#template_div").html($("#container_div").html());
		
		
		//Do depth 1, 2, 3, 4, 5, 6, 
		
		var templateHtml = beautyHtml;
		
		//$('#my-element').parents().length
		//var topDepth = $('#template_div').parents().length;
		
		//replaceRepeatersAtDepth("div", topDepth + 1);
		//replaceRepeatersAtDepth("", topDepth + 1);
		//replaceRepeatersAtDepth("div", topDepth + 1);
		
		$("#view_html").val(templateHtml);
		
	
    }
    
    function deleteCode(codeId)
    {
        $extra = (new Date()).getTime(); //add randomness to url
        var getUrl = "download_utility.php?delid=" + codeId + "&r=" + $extra;
        
        //alert("calling json: " + jsonUrl);
        //use the JQuery get to grab the URL from the selected item, put the results in to an argument for parsing in the inline function called when the feed retrieval is complete
        $.get(getUrl, function(data)
        {
        
        	alert("Deleted ID: " + data + " refresh page if needed");        	
        });
    }    
    
	function encodeMyHtml(normalHtml) 
	{
		var encodedHtml = escape(normalHtml);
		encodedHtml = encodedHtml.replace(/\//g,"%2F");
		encodedHtml = encodedHtml.replace(/\?/g,"%3F");
		encodedHtml = encodedHtml.replace(/=/g,"%3D");
		encodedHtml = encodedHtml.replace(/&/g,"%26");
		encodedHtml = encodedHtml.replace(/@/g,"%40");
		return encodedHtml;
	}

	//WE SHOULD REMOVE OLD CSS ATTACHMENT
    function setCSS(css) 
    {    
        try 
        {            
            //remove previous ones?
            $("link.site_stylesheet").remove();
            //jquery alternative
            $('head').prepend(css);
            
            //WE DONT WANT IT AT THE END... THEN IT WILL OVERWRITE MY STYLING ON MY PAGE
            //document.getElementsByTagName("head")[0].appendChild(css);
        } 
        catch (e) 
        {
            setTimeout(function(){setCSS(css)}, 100);
        }
    }    
    
	 function getTextNodesI(node, includeWhitespaceNodes) 
	 {
		var textNodes = [], whitespace = /^\s*$/;

		function getTextNodes(node) {
			if (node.nodeType == 3) {
				if (includeWhitespaceNodes || !whitespace.test(node.nodeValue)) {
					textNodes.push(node);
				}
			} else {
				for (var i = 0, len = node.childNodes.length; i < len; ++i) {
					getTextNodes(node.childNodes[i]);
				}
			}
		}

		getTextNodes(node);
		return textNodes;
	}   
    
    
    $(document).ready(function() 
    {
        $('#filtercode').change(function() 
        {           
            var selFilter = "";
            $("#filtercode option:selected").each(function() 
            {
                selFilter = $(this).val();                                
            });
            
            if(selFilter != "" && selFilter != " ")
            {
                //alert("Changing code");
                changeCode(selFilter);         
            }
        });   
		
		
        $('#filtertypes').change(function() 
        {           
            var selFilter = "";
            $("#filtertypes option:selected").each(function() 
            {
                selFilter = $(this).val();                                
            });
            
            if(selFilter == "")
            {
            	return;
            }
            
            //loadCodeList(selFilter);  
			var extra = (new Date()).getTime(); //add randomness to url
			var getUrl = "download_utility.php?updatecodetype=true&cid=" + CURRENT_CODE_ID + 
				"&codetype=" + selFilter + "&r=" + extra;

			//alert("calling json: " + jsonUrl);
			//use the JQuery get to grab the URL from the selected item, put the results in to an argument for parsing in the inline function called when the feed retrieval is complete
			$.get(getUrl, function(data)
			{
				if(data != "Updated")
				{
					alert(data);
				}
			});              
            
        });   

		$('#stolen_html').click(function()
		{
			this.focus();
			this.select();
		});
		
		$("#delete_stolen").click(function()
		{
            var selFilter = "";
            $("#filtercode option:selected").each(function() 
            {
                selFilter = $(this).val();                                
            });		
            if(selFilter != "" && selFilter != " ")
            {
                alert("Deleting Code: " + selFilter);
                deleteCode(selFilter);     
            }            
		});
		
		$("input[name=typeradio]").click(function()
		{
			var radId = this.id;
			var aNumber = radId.substr(5);			

			var codeTypeText = "";
			if(aNumber != 99)
			{
				codeTypeText = typeList[aNumber];
			}
			
			loadCodeList(codeTypeText);   
		});
		
		
		$("#type_container" ).buttonset();
		$("#item_or_list" ).buttonset();		

		$('input:radio[id=sourceitem]').attr('checked', true);
		$("#item_or_list" ).buttonset("refresh");		

		
		$("#main-accordion").accordion({
			active: false,
			alwaysOpen: false, 
			collapsible: true,
			header: "div.headerdiv1",
			autoHeight: false
		});
    });
    
    function testIt()
    {
    	//alert("Fuck me");
    	//$("#type-6").attr("checked", "checked");    
    }
    
    /*************************
    IDEA:    
    Use the same method of RemoteDB for templates...
    Where there is an ACKey
    It inserts into html_template table remotely
    That server also has code to display/cache the template data in the template
    On loading the template it ensures ./site/xxx is loaded?    
    **************************/
    </script>
    

</head><body style="font-size:0.8em;">

<div class="markheader">
    <div class="LS">
    </div>
    <div class="title">
        SNIP CSS - simple server
    </div>
    <p class="Desc">
        <b>S</b>nip <b>C</b>opy and <b>P</b>aste
    </p>
</div>
<div id="markunique_pagecontainer"><br>
<div>Filter By Type:
<br style="clear:both";>
<div id="type_container">
	<?php
		getTypeRadios();
	?>
</div>
</div>
<span class="directions" id="directions">Showing <span style="font-weight:bold" id="typeof_text">Uncategorized</span> stolen code:</span><br style="clear:both";>
<?php
    getCodeSelect();    
?><img id="delete_stolen" class="delete_image" src="delete_icon.gif" /><br>
Update Type to: <?php
    getCodeTypes();    
?> <button onclick="updateType();">Update</button><br>
<br style="clear:both;">
<div id="main-accordion">
	<div class="headerdiv1">Copy Raw HTML/CSS to Website</div>
	<div>
		<table style="background:#EEEEEE">
			<tr>
				<td style="vertical-align:top;padding:5px;">
					<h2>Copy Basic HTML</h2>				
					<b>1. Copy HTML into file:</b><br>
					<textarea id="stolen_html" rows="16" style="width: 800px;"></textarea><br>
					<b>2. Copy Folder with ID:</b><span id="curr_id" class="curr_id"></span><br>
					<b>3. Link the Stylesheet with:<br>
					<input type="text" id="css_ref" name="css_ref" style="width: 380px;"></textarea><br>
				</td>
			</tr>
		</table>
	</div>
</div>

<br style="clear:both;">
</div>
<br><hr>
<div style="margin-left:35px;margin-right:10px;"
	<h2>HTML Preview below: </h2>
	<span id="span_codeid">(no code selected yet)</span>
	<div id="container_div">

	</div>

	<br style="clear:both"><br><br><br><br><br><br><br><br><br><br><br>
	<h1>BELOW IS TEMPLATE HTML </h1>
	<hr>
	
	<div id="template_div">

	</div>
</div>

<div id="userdialog">
</div>
</body>
</html>