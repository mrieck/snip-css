<?php
    header('Content-type: text/html'); //Needed for IE
    header('Access-Control-Allow-Origin: *');
    include_once("./snipcss_config.php");    
        
    if (isset($HTTP_RAW_POST_DATA)) 
    {
        $data = explode('&', $HTTP_RAW_POST_DATA);
        foreach ($data as $val) 
        {
            if (!empty($val)) 
            {
                //echo "{$key} = {$val}";

                list($key, $value) = explode('=', $val);   
                $_REQUEST[$key] = urldecode($value);
            }
        }
    }    

    if(!isset($_REQUEST['save_html']) || !isset($_REQUEST['save_css']) ||
        !isset($_REQUEST['save_cimages']) || !isset($_REQUEST['save_himages']))
    {
        echo "Not enough params";
        exit();
    }

	//NO STRIP SLASHES... DONT SNIP HTML THAT HAS SCRIPTS IN IT	
	$containerDim = "500,500";
	$saveHtml = mysql_real_escape_string($_REQUEST['save_html']);
	$saveCss = mysql_real_escape_string($_REQUEST['save_css']);
	$saveCImages = mysql_real_escape_string($_REQUEST['save_cimages']);
	$saveHImages = mysql_real_escape_string($_REQUEST['save_himages']);
	$saveUrl = "";
   
	if(isset($_REQUEST['container_dimensions']))
	{
	   $containerDim = $_REQUEST['container_dimensions'];
	}
	if(isset($_REQUEST['save_url']))
	{
	   $saveUrl = mysql_real_escape_string($_REQUEST['save_url']);   
	}

	$theTime = time();
	$sql = "INSERT INTO code (stolen_html, stolen_css, html_images, css_images, website_url, container_dim, itime) " .
		   "VALUES ('{$saveHtml}', '{$saveCss}', '{$saveHImages}', '{$saveCImages}', '{$saveUrl}', '{$containerDim}', {$theTime})";   

	$mrdb->query($sql);


	$insertID = mysql_insert_id();    

	echo $insertID;
?>