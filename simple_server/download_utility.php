<?php
    include_once("snipcss_config.php");   
	$debug = false;
	define('SIMPLEPIE_SAME_CASE', 1);
	define('SIMPLEPIE_LOWERCASE', 2);
	define('SIMPLEPIE_UPPERCASE', 4);	

	//Sometimes image doesn't download this tests why
	if(isset($_REQUEST['test_get_image']))
    {
        $imageUrl = $_REQUEST['test_get_image'];

        $testfolder = "testfolder";

        if (!is_dir("./site/{$id}")) 
        {
            mkdir("./site/{$testfolder}", 0755);
            mkdir("./site/{$testfolder}/himages", 0755);
            //mkdir("./site/{$testfolder}/cimages", 0755);    
        }

        $imgPath = pathinfo($imageUrl);  
        $fullFilename = $imgPath['basename'];
        $targetPath = "./site/{$testfolder}/himages/{$fullFilename}";
        saveImage($imageUrl, $targetPath);  
        
        echo "saved to: " . $targetPath;
        
    }
    else if(isset($_REQUEST['testid']))
    {
        $debug = true;
        $id = (int)$_REQUEST['testid'];
        getCodeJson($id);   
    }
    else if(isset($_REQUEST['id']))
    {
        $id = (int)$_REQUEST['id'];        
        getCodeJson($id);
        exit();
    }
    else if(isset($_REQUEST['delid']))
    {
        $id = (int)$_REQUEST['delid'];        
        $mrdb->query("DELETE FROM code WHERE id = {$id}");

        echo "Deleted Id: " . $id;
        
        exit();
    }  
    else if(isset($_REQUEST['getcodeoptions']))
    {
    	$extraWhere = "";
    	if(isset($_REQUEST['codetype']))
    	{
			$cType = $_REQUEST['codetype'];
			if(strlen($cType) > 1)
			{
				$extraWhere = " WHERE stolen_type = '{$cType}'";
			}
			else
			{
				$extraWhere = " WHERE stolen_type = '' OR stolen_type IS NULL";			
			}
    	}
		$codeArr = array();
		$cRecords = $mrdb->get_results("SELECT id,website_url FROM code" . $extraWhere);   
		

		//echo '<select class="nochange" id="filtercode" name="filtercode">';
		echo '  <option class="" value=""> </option>';                
		if($cRecords === null)
		{
			exit();
		}
		
		$i = 0;
		foreach($cRecords as $cRec)
		{
			$selected = "";
			if($i === 0)
			{
				//$selected = "selected=true ";
			}            
			$codeId = $cRec->id;
			$codeUrl = $cRec->website_url;
			echo '<option class="" ' . $selected . 'value="' . $codeId . '">' . $codeUrl . '</option>';                
		}
		//echo '</select>';

    }
    else if(isset($_REQUEST['updatecodetype']) && isset($_REQUEST['cid']) && isset($_REQUEST['codetype']))
    {
    	$cid = $_REQUEST['cid'];
    	$codeType = $_REQUEST['codetype'];
    	
    	$sql = "UPDATE code set stolen_type = '$codeType' WHERE id = {$cid}";
    	$mrdb->query($sql);
    	
    	echo "Updated";		    
    }
        
 

    function saveImage($imageUrl, $saveLocation)
    {
        $encodedUrl = replace_invalid_with_pct_encoding($imageUrl, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~!$&\'()*+,;=:@/?');
    
        $ch = curl_init($encodedUrl);        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
        $userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)';
        curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
        curl_setopt($ch, CURLOPT_FAILONERROR, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_AUTOREFERER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);    

        $rawdata = curl_exec($ch);
        curl_close ($ch);

        if(file_exists($saveLocation))
        {
           unlink($saveLocation);
        }

        $fp = fopen($saveLocation,'x');
        fwrite($fp, $rawdata);
        fclose($fp);
        
        return true;
    }
    
    //imageList is | delimited
    function downloadImages($imageList, $targetDir)   
    {
        $imgArr = explode("|", $imageList);
        
        $nice = true;
        foreach($imgArr as $imgUrl)
        {
            $imgPath = pathinfo($imgUrl);  
            $fullFilename = $imgPath['basename'];
            if(strpos($fullFilename, ".php") !== false)
            {
                $fullFilename = str_replace(".php" , ".jpg" , $fullFilename);                
            }
            
            if(strpos($fullFilename, "?") !== false)
            {
                $fileParts = explode("?", $fullFilename);               
                $fullFilename = $fileParts[0];
            }
            
            //echo "trying to save image: " . $fullFilename . "<br>";            
            $good = saveImage($imgUrl, $targetDir . $fullFilename);                        
            if(!$good)
            {
                $nice = false;
            }
        }      
        return $nice;
    }
    
    //mimics downloadImages just to get names
    function getImageNames($imageList)   
    {
        $imgArr = explode("|", $imageList);
        
        $niceImages = array();        
        foreach($imgArr as $imgUrl)
        {
            $imgPath = pathinfo($imgUrl);  
            $fullFilename = $imgPath['basename'];
            if(strpos($fullFilename, ".php") !== false)
            {
                $fullFilename = str_replace(".php" , ".jpg" , $fullFilename);                
            }
            
            if(strpos($fullFilename, "?") !== false)
            {
                $fileParts = explode("?", $fullFilename);               
                $fullFilename = $fileParts[0];
            }
            
            //avoids duplicates (because duplicates were overwritten anyway
            if(!in_array($fullFilename, $niceImages))
            {
            	$niceImages[] = $fullFilename;           
            }
        }      
        
        $niceString = implode("|", $niceImages);
        
        return $niceString;
    }    
    
    
    function getCodeJson($id)
    {
        global $mrdb;
        
        $jsonArr = array();
        $debugMessages = "";
		$cr = chr(13); // 0x0D [\r]
		$lf = chr(10); // 0x0A [\n]        
        
        $sql = "SELECT * from code WHERE id={$id}";        
        $aRecord = $mrdb->get_row($sql);
        
        $hImages = $aRecord->html_images;
        $cImages = $aRecord->css_images;                
        $stolenHtml = $aRecord->stolen_html;
        $stolenCss = $aRecord->stolen_css;
        $jsonArr["website_url"] = $aRecord->website_url;
        $dimensions = $aRecord->container_dim;
        $stolenType = $aRecord->stolen_type;

        $downloaded = (int)$aRecord->downloaded_images;

		if(!is_dir("site"))
		{
			mkdir("site", 0755);
		}
		
        if (!is_dir("./site/{$id}")) 
        {
            mkdir("./site/{$id}", 0755);
            mkdir("./site/{$id}/himages", 0755);
            mkdir("./site/{$id}/cimages", 0755);    
        }
        
        
        //DOWNLOADING IMAGES DOES NOT ACCOUNT FOR IMAGES IN DIFFERENT FOLDERS WITH SAME NAMES
        //THIS SCENARIO WOULD RESULT IN THE FIRST IMAGE BEING OVERWRITTEN BY THE SECOND
        //THAT IS THE PRICE YOU MUST PAY (for lazyness)
        if($downloaded <= 0)
        {  
           $debugMessages .= "DOWNLOADING IMAGES THIS TIME" . $cr . $lf;
           $success1 = false;
           $success2 = false;
           
           if(strlen($hImages) > 0)
               $success1 = downloadImages($hImages, "./site/{$id}/himages/");
            
           if(strlen($cImages) > 0)            
               $success2 = downloadImages($cImages, "./site/{$id}/cimages/");

            if(!$success1)
            {
                $debugMessages .= "FAILED DOWNLOADING HTML IMAGES" . $cr . $lf;
            }
            else if(!$success2)
            {
                $debugMessages .= "FAILED DOWNLOADING CSS IMAGES" . $cr . $lf;            
            }
            else
            {
            
            	$sql = "UPDATE code set downloaded_images = 1 WHERE id = {$id}";
            	$mrdb->query($sql);            	
            }
        }       
        
        if(stripos($dimensions , ",") !== false)
        {
            $dimArr = explode(",", $dimensions);
            $jsonArr["container_width"] = $dimArr[0];
            $jsonArr["container_height"] = $dimArr[1];                          
        }
        else
        {
            $jsonArr["container_width"] = "800px";
            $jsonArr["container_height"] = "800px";                                  
        }
        
        $stolenHtml = str_replace("PATH_TO_HIMAGES", "./site/{$id}/himages/", $stolenHtml);
        $stolenCss = str_replace("PATH_TO_CIMAGES", "./cimages/", $stolenCss);

        $cr = chr(13); // 0x0D [\r]
        $lf = chr(10); // 0x0A [\n]
        $newLine = $cr . $lf;
        $stolenCss = str_replace("\n", $newLine, $stolenCss); //try to have newlines    
        
        $cssLocation = "./site/{$id}/style.css";
        
        if(file_exists($cssLocation))
        {
           unlink($cssLocation);
        }    
        $fp = fopen($cssLocation,'x');
        

        fwrite($fp, "/*CSS for id: {$id}*/" . $newLine . $stolenCss); 
        fclose($fp);  // close file
        
        $jsonArr["stolen_html"] = $stolenHtml;
        $jsonArr["css_location"] = $cssLocation;
        $jsonArr["messages"] = $debugMessages;
        $jsonArr["css_images"] = getImageNames($cImages);
        $jsonArr["html_images"] = getImageNames($hImages);
        $jsonArr["stolen_type"] = $stolenType;
        
        echo json_encode($jsonArr);
    }
    
    
    //Ripped from simplepie for CURL_INIT
    
    //Needed for downloading images that have spaces in them
    /**
     * Replace invalid character with percent encoding
     *
     * @access private
     * @param string $string Input string
     * @param string $valid_chars Valid characters
     * @param int $case Normalise case
     * @return string
     */
    function replace_invalid_with_pct_encoding($string, $valid_chars, $case = SIMPLEPIE_SAME_CASE)
    {
        // Normalise case
        if ($case & SIMPLEPIE_LOWERCASE)
        {
            $string = strtolower($string);
        }
        elseif ($case & SIMPLEPIE_UPPERCASE)
        {
            $string = strtoupper($string);
        }

        // Store position and string length (to avoid constantly recalculating this)
        $position = 0;
        $strlen = strlen($string);

        // Loop as long as we have invalid characters, advancing the position to the next invalid character
        while (($position += strspn($string, $valid_chars, $position)) < $strlen)
        {
            // If we have a % character
            if ($string[$position] === '%')
            {
                // If we have a pct-encoded section
                if ($position + 2 < $strlen && strspn($string, '0123456789ABCDEFabcdef', $position + 1, 2) === 2)
                {
                    // Get the the represented character
                    $chr = chr(hexdec(substr($string, $position + 1, 2)));

                    // If the character is valid, replace the pct-encoded with the actual character while normalising case
                    if (strpos($valid_chars, $chr) !== false)
                    {
                        if ($case & SIMPLEPIE_LOWERCASE)
                        {
                            $chr = strtolower($chr);
                        }
                        elseif ($case & SIMPLEPIE_UPPERCASE)
                        {
                            $chr = strtoupper($chr);
                        }
                        $string = substr_replace($string, $chr, $position, 3);
                        $strlen -= 2;
                        $position++;
                    }

                    // Otherwise just normalise the pct-encoded to uppercase
                    else
                    {
                        $string = substr_replace($string, strtoupper(substr($string, $position + 1, 2)), $position + 1, 2);
                        $position += 3;
                    }
                }
                // If we don't have a pct-encoded section, just replace the % with its own esccaped form
                else
                {
                    $string = substr_replace($string, '%25', $position, 1);
                    $strlen += 2;
                    $position += 3;
                }
            }
            // If we have an invalid character, change into its pct-encoded form
            else
            {
                $replacement = sprintf("%%%02X", ord($string[$position]));
                $string = str_replace($string[$position], $replacement, $string);
                $strlen = strlen($string);
            }
        }
        return $string;
    }  
    
    
    
        

?>