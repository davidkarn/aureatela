<?php
$months = [31,29,31,30,31,30,31,31,30,31,30,31];
foreach ($months as $i => $count) {
  $m = "".($i + 1);
  if (strlen($m) == 1) $m = "0".$m;
  
  for ($d = 1; $d <= $count; $d++) {
    $d = "".$d;
    if (strlen($d) == 1) $d = "0".$d;
    $url = "http://www.usccb.org/bible/readings/".$m.$d."20.cfm";
    $contents = file_get_contents($url);
    sleep(1);
    file_put_contents("sources/readings/".$m.$d."20.htm", $contents);
    echo $url."\n"; }}
  