#SnipCSS

##DISCLAIMER:
The creator of this software disclaims any responsibility for harm resulting from using SnipCSS or 
any software or content downloaded using SnipCSS, whether or not the author approved such 
software or content. The author expressly disclaims all warranties and conditions, express or 
implied, including any implied warranties and conditions of merchantability, fitness for a 
particular purpose, and noninfringement, and any warranties and conditions arising out of course 
of dealing or usage of the SnipCSS software or any software or content you download using the SnipCSS
extension and server. No advice or information, whether oral or written, obtained from the author 
or elsewhere will create any warranty or condition not expressly stated in this agreement. 

####What is SnipCSS?

#### SnipCSS is a Firebug/Firefox extension that "snips" a portion of a webpage.  

It takes the HTML snip, tries to find all CSS selectors applied to that portion of HTML, and gets a list of images used in the
snip (both HTML images and CSS images).

Firebug must first be installed for the extension to work.  

To snip a portion of a webpage, install the extension, then right-click an element in the 
inspector panel... there should be a "SnipCSS" option in the context menu.  

##SnipCSS simple_server

To download the html/css/images of a snip, you need to have a server running to receive the data.

When the SnipCSS window pops up in the extension, you will need to specify the URL that will receive the code.
e.g.  http://locahost/simple_server/remote_snipcode.php


The firefox extension just does a simple AJAX post to the selected url...  
    $.post(REMOTE_SERVER_URL, 
    {  save_html: snipHtml, save_css:snipCSS, save_cimages:strCImages, 
       save_himages:strHImages, save_url: websiteUrl, 
       container_dimensions : dimString},
    function(data)
    {  
        alert(data);
    });

There are two types of servers.  One is in the simple_server folder.  For the simple server, let's
say you just copied simple_server folder to your root web directory.  Then the URL you'd need to 
enter in the extension popup window would be:
http://locahost/simple_server/remote_snipcode.php

For the simple server you need to make sure you are able to connect to your local db.  Open 
the snipcss_config.php file to enter your db credentials.  You should make an empty db... the db
tables will be created on first loading of index.php.

When a snip is selected from the dropdown menu, all images will be downloaded from the server.

You need PHP CURL installed to download images.  

After the images download (could take 5-30 seconds)... directions are displayed on how to 
copy the Snip into a webpage you are developing.

##SnipCSS codeigniter_server (not completed)
The CodeIgniter server does everything of the simple server, except it also has a templating engine
built specifically for filling SnipCSS imported code.  The templating engine hooks up CodeIgniter models
with JQuery selectors to insert records into the Snip HTML.  At first I tried using a normal templating
engine like Mustache, but there are too many cases to account for... the structure of the html isn't always a simple
list of repeating items for a list of records.  Multiple records need to be filled in the subitems, often 
at different levels of the DOM. JQuery is flexible enough to handle it. 

The snip html is stored in the views folder. The css in a css/site/ folder, the images in img/site/ folder of the root
directory.

