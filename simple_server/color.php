<?php
header('Content-type: image/png');
$img = imagecreatefrompng('color.png');

/*
  Calculate RGB from HSV, reverse of RGB2HSV()
  Hue is in degrees
  Lightness is between 0 and 1
  Saturation is between 0 and 1
  http://local.wasp.uwa.edu.au/~pbourke/texture_colour/convert/
*/
function HSVToRGB($c1)
{
  $sat	= array();
  $c2	= array();

  while ($c1['h'] < 0)
	  $c1['h'] += 360;
  while ($c1['h'] > 360)
	  $c1['h'] -= 360;

  if ($c1['h'] < 120) {
	  $sat['r'] = (120 - $c1['h']) / 60.0;
	  $sat['g'] = $c1['h'] / 60.0;
	  $sat['b'] = 0;
  } else if ($c1['h'] < 240) {
	  $sat['r'] = 0;
	  $sat['g'] = (240 - $c1['h']) / 60.0;
	  $sat['b'] = ($c1['h'] - 120) / 60.0;
  } else {
	  $sat['r'] = ($c1['h'] - 240) / 60.0;
	  $sat['g'] = 0;
	  $sat['b'] = (360 - $c1['h']) / 60.0;
  }
  $sat['r'] = min($sat['r'], 1);
  $sat['g'] = min($sat['g'], 1);
  $sat['b'] = min($sat['b'], 1);

  $c2['r'] = (1 - $c1['s'] + $c1['s'] * $sat['r']) * $c1['v'];
  $c2['g'] = (1 - $c1['s'] + $c1['s'] * $sat['g']) * $c1['v'];
  $c2['b'] = (1 - $c1['s'] + $c1['s'] * $sat['b']) * $c1['v'];

  return($c2);
}

/*
  Calculate HSV from RGB
  Hue is in degrees
  Lightness is betweeen 0 and 1
  Saturation is between 0 and 1
  http://local.wasp.uwa.edu.au/~pbourke/texture_colour/convert/
*/
function RGBToHSV($c1)
{
  $c2 = array();

  $themin = min($c1['r'],min($c1['g'], $c1['b']));
  $themax = max($c1['r'],max($c1['g'], $c1['b']));
  $delta = $themax - $themin;

  $c2['v'] = $themax;
  $c2['s'] = 0;
  if ($themax > 0)
	  $c2['s'] = $delta / $themax;
  $c2['h'] = 0;
  
  if($delta > 0) {
	  if ($themax == $c1['r'] && $themax != $c1['g'])
		$c2['h'] += ($c1['g'] - $c1['b']) / $delta;
	  if ($themax == $c1['g'] && $themax != $c1['b'])
		$c2['h'] += (2 + ($c1['b'] - $c1['r']) / $delta);
	  if ($themax == $c1['b'] && $themax != $c1['r'])
		$c2['h'] += (4 + ($c1['r'] - $c1['g']) / $delta);
	  $c2['h'] *= 60;
  }
  return($c2);
}

$sx = imagesx($img);
$sy = imagesy($img);

$replaceColor = array('r'=>211/255, 'g'=>113/255, 'b'=>15/255);			//The color to replace
$replaceColor = RGBToHSV($replaceColor);
$newColor = RGBToHSV(array('r'=>196/255, 'g'=>57/255, 'b'=>255/255));	//The color to use for replacement
$p = 60;	//Fuzzyness..

$st = 1/(2*$p);	//Saturation threshold
$hp = $p/2;

for($y = 0; $y < $sy; $y++)
{
  for($x = 0; $x < $sx; $x++)
  {
	$pixelColor = imagecolorat($img, $x, $y);
	$pixelColor = imagecolorsforindex($img, $pixelColor);

	//We need the RGB components to be floats between 0 and 1
	$pixelColor['r'] = $pixelColor['red']/255;
	$pixelColor['g'] = $pixelColor['green']/255;
	$pixelColor['b'] = $pixelColor['blue']/255;

	$pixelColor = RGBToHSV($pixelColor);	//Switch to HSV space
	$d = max($replaceColor['h'], $pixelColor['h']) - min($replaceColor['h'], $pixelColor['h']);	//The angle between the colors (hues)

	if($d < $hp && $pixelColor['s'] > $st)	//Do we need to replace this pixel?
	{
	  $pixelColor['h'] = $newColor['h'] - $replaceColor['h'] + $pixelColor['h'];
	  $pixelColor['s'] = min(max($newColor['s']- $replaceColor['s'] + $pixelColor['s'] , 0), 1); 
	
	  $pixelColor = HSVToRGB($pixelColor);	//Go back to RGB space
	  $pixelColor = imagecolorallocate($img, $pixelColor['r']*255, $pixelColor['g']*255, $pixelColor['b']*255);
	  imagesetpixel($img, $x, $y, $pixelColor);
	}
  }
}

imagepng($img); 
