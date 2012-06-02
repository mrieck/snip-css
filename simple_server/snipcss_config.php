<?php	
	include_once "ez_sql_core.php";

	//If using different database than mysql you can download different library from:
	//https://github.com/jv2222/ezSQL
	include_once "ez_sql_mysql.php";
	
	/************  CONFIGURE YOUR DATABASE HERE ****************/
	
	$DB_USER = "root";
	$DB_PASS = "";
	$DB_NAME = "snipcss";
	$DB_SERVER = "localhost";
	
	//Mr. Database
	$mrdb =  new ezSQL_mysql($DB_USER, $DB_PASS, $DB_NAME, $DB_SERVER);
	
	
	//Only need one table for simple server.
	$mrdb->query("CREATE TABLE IF NOT EXISTS `code` (
	  id int(11) NOT NULL AUTO_INCREMENT,
	  stolen_html text NOT NULL,
	  stolen_css text NOT NULL,
	  html_images text NOT NULL,
	  css_images text NOT NULL,
	  website_url varchar(255) DEFAULT NULL,
	  container_dim varchar(255) NOT NULL,
	  itime int(11) NOT NULL,
	  downloaded_images tinyint(1) NOT NULL DEFAULT '0',
	  stolen_type varchar(255) DEFAULT NULL,
	  PRIMARY KEY (id)) 
	  ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=80 ;");	
?>	