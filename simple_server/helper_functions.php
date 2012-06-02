<?php
//Don't mind the ugly code
// I wrote this years ago 

/************* GET SELECT BOXES FOR PAGE *************************/
	$codeTypeList = array();
	$codeTypeList[] = "Sidebar Item";
	$codeTypeList[] = "Sidebar";
	$codeTypeList[] = "Posts";
	$codeTypeList[] = "Table";
	$codeTypeList[] = "Grid";		
	$codeTypeList[] = "List";
	$codeTypeList[] = "Form";		
	$codeTypeList[] = "Whole Page";		
	
	$defaultResultName = "GeekHutProducts";
    
	function getCodeSelect()
	{
		global $mrdb;
		$codeArr = array();

		$cRecords = $mrdb->get_results("SELECT id,website_url FROM code WHERE stolen_type = '' OR stolen_type IS NULL");    

		echo '<select class="nochange" id="filtercode" name="filtercode">';
		echo '  <option class="" value=""> </option>';                

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
		echo '</select>';
	}
	
	function getTypeRadios()
	{
		global $codeTypeList;	
		
		echo '<input type="radio" id="type-99" name="typeradio" />';
		echo '<label for="type-99">Uncategorized</label>';		
		$x = 0;
		foreach($codeTypeList as $aType)
		{
			echo '<input type="radio" id="type-' . $x . '" name="typeradio" />';
			echo '<label for="type-' . $x . '">' . $aType . '</label>';
			$x++;
		}	
	
	}	
	
	function getCodeTypes()
	{
		global $codeTypeList;
		echo '<select class="nochange" id="filtertypes" name="filtertypes">';
		echo '  <option class="" value="">None</option>';
		
		
		$i = 0;
		foreach($codeTypeList as $aType)
		{
			echo '<option class="" value="' . $aType . '">' . $aType . '</option>';                
		}
		echo '</select>';	
	}

	function getResultNameSelect()
	{
		global $mrdb;
		global $defaultResultName;
		$resultNames = array();
		$resultRows = $mrdb->get_results("SELECT DISTINCT result_name from imported_scrapes");
		foreach($resultRows as $row)
		{
			$resultNames[] = $row->result_name;
		}

		$aSelect = "";

		$aSelect .= '<select class="source-select" id="source_select" name="source" style="max-width:280px;" >';
		$i = 0;
		$aSelect .=  '<option class="" value=""></option>';
		foreach ($resultNames as $aProp) 
		{
			$selected = "";
			if(strcmp($defaultResultName, $aProp) === 0)
			{
				$selected = "selected=true "; 
			}
		    $aSelect .=  '<option class="" ' . $selected . 'value="' . $aProp . '">' . $aProp . '</option>';
		}
		$aSelect .= '</select>';    

		return $aSelect;
	}
	
	function getPageSlugSelect()
	{
		global $mrdb;
		$pageSlugs = array();
		$slugRows = $mrdb->get_results("SELECT DISTINCT id,page_slug from page_hierarchy");

		$aSelect = "";

		$aSelect .= '<select class="slug-select" id="slug_select" name="slug" style="max-width:120px;">';
		
		foreach($slugRows as $slug)
		{
			$aSelect .=  '<option class="" value="' . $slug->id . '">' . $slug->page_slug . '</option>';
		}

		$aSelect .= '</select>';    

		return $aSelect;
	}	
	
	
	
	function getContainerSelect()	
	{
		//first check to see if each page_hierarchy has default container... if not create
		global $mrdb;
		insertDefaultContainers();
		
		//Value has ID of container
		$allResults = $mrdb->get_results("SELECT page_containers.id, page_hierarchy_id, page_order, page_hierarchy.id as pid,  page_hierarchy.page_slug, page_hierarchy.level, page_hierarchy.parent_page, page_hierarchy.page_name 
			FROM page_containers 
			LEFT JOIN page_hierarchy on page_hierarchy.id = page_hierarchy_id");
		
		$aSelect = "";

		$aSelect .= '<select class="container-select" id="container-select" name="container" style="max-width:200px;">';
		
		$baseUrl = 'mysite.com/';
		foreach($allResults as $container)
		{
			
			$hierId = $container->pid;
			$partsText = getUrlParts($hierId);
			
			$displayUrl = getDisplayUrl($baseUrl, $partsText, true);
			
			
			$aSelect .=  '<option id="' . $partsText . '" value="' . $container->id . '">' . $displayUrl . '</option>';
		}

		$aSelect .= '</select>';    

		return $aSelect;			
	}
	
	function getDisplayUrl($baseUrl, $partsText, $skipRoot)
	{	
		$testValArr = array();
		$testValArr[] = "xxx"; $testValArr[] = "yyy"; $testValArr[] = "zzz"; $testValArr[] = "moremoremore"; $testValArr[] = "aaa"; $testValArr[] = "bbb";
		
		$theParts = explode("|", $partsText);
		
		$totalUrl = $baseUrl;
		$partIndex = 0;
		
		if(count($theParts) <= 0)
		{
			echo "Error No Parts";
		}
		
		$minusIndex = 1;
		if($skipRoot)   //Root is usually something like MUSIC for music site, so not part of the url
		{
			$minusIndex = 2;	
		}
		
		for($m = (count($theParts) - $minusIndex); $m >= 0; $m--)
		{
			$aPart = $theParts[$m];
			$totalUrl .= $aPart . '/' . $testValArr[$partIndex] . '/';
			$partIndex++;
		}
		
		return $totalUrl;
	}
	
	function getUrlParts($hierarchyId)
	{
		global $mrdb;
		$aRecord = $mrdb->get_row("SELECT page_slug, parent_page FROM  page_hierarchy WHERE id = {$hierarchyId}");
		
		if($aRecord === null)
		{
			return "";
		}
		
		$currSlug = $aRecord->page_slug;
		
		$parentId = (int)$aRecord->parent_page;
		if($parentId < 0)
		{
			return $currSlug;
		}
		
		return $currSlug . "|" . getUrlParts($parentId);				
	}

	function insertDefaultContainers()
	{
		global $mrdb;
		
		$res = $mrdb->get_results("SELECT * FROM  page_hierarchy");
		
		
		foreach($res as $pageStructure)
		{
			$anId = $pageStructure->id;
			$row = $mrdb->get_row("SELECT id FROM page_containers WHERE page_hierarchy_id = {$anId}");
			if($row === null)
			{
				$mrdb->query("INSERT INTO page_containers SET page_hierarchy_id = {$anId}, page_order = 1");			
			}
		}	
	}
	
	
	
	
	
?>