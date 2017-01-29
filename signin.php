<?php
$mysqli = new mysqli ("localhost", "root", "", "nailappdb");
$mysqli->query ("SET NAMES 'utf8'");
$pass = md5($_POST['pass']);
$result = $mysqli->query ("SELECT `username` FROM `accounts` WHERE `email` = '".$_POST['email']."' AND `pass` = '".$pass."'");
if (($row = $result->fetch_assoc()) != false) {
	$answer=array(
	//"name"=>$row['username'],
	"access"=>1
	);
	$token = md5(uniqid(rand(),1));
	$new_res = $mysqli->query ("UPDATE `accounts` SET `token` = '".$token."' WHERE `email` = '".$_POST['email']."'");
	setcookie ("token", $token, 0);
} else {
	$answer=array(
	//"name"=>"",
	"access"=>0
	);
};	
echo json_encode($answer);
$mysqli -> close ();
?>