<?php
require_once('../mcoWeb.php');
if (array_key_exists($_GET['username'], $valid_usernames)) {
  header('Content-type: text/plain');
  echo "Valid=TRUE\n";
  echo "Ticket=" . $valid_usernames[$_GET['username']] . "\n";
} else {
  header('Content-type: text/plain');
  echo "Valid=FALSE\n";
  echo "Ticket=0\n";
  echo "reasoncode=INV-110\n";
  echo "reasontext=The member name or password you have entered is incorrect. Please try again.\n";
  echo "reasonurl=http://forums.mcouniverse.com";
}
