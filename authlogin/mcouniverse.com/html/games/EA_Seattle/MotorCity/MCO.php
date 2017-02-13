<?php
$binary_string = pack("H*" , 'cafebeef00000000000003');
header('Content-type: application/octet-stream');
echo $binary_string;
