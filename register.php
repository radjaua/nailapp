<?php
$mysqli = new mysqli ("localhost", "root", "", "nailappdb");
$mysqli->query ("SET NAMES 'utf8'");
$res_email = $mysqli->query ("SELECT `userid` FROM `accounts` WHERE `email` = '".$_POST['email']."'");
if ($res_email->fetch_assoc() != false) {
	echo 'email';
} else {
	$pass = md5($_POST['pass']);
	$token = md5(uniqid(rand(),1));
	$result = $mysqli->query ("INSERT INTO `accounts` (`username`, `email`, `pass`, `token`, `phone`) VALUES ('".$_POST['username']."', '".$_POST['email']."', '".$pass."', '".$token."', '".$_POST['phone']."')");
	echo $result;
	setcookie ("token", $token, 0);
};
// Тут нужно добавить mail ()
$mysqli -> close ();
?>