<?php
$mysqli = new mysqli ("localhost", "root", "", "nailappdb");
$mysqli->query ("SET NAMES 'utf8'");
$result = $mysqli->query ("SELECT `username`, `userid` FROM `accounts` WHERE `token` = '".$_POST['cookiesToken']."'");
//$result = $mysqli->query ("SELECT `username`, `userid` FROM `accounts` WHERE `token` = '0c8261fc4ced29ae5f72eaa31c52b716'");
if (($row = $result->fetch_assoc()) != false) {
	$answer=array(
	"name"=>$row['username'],
	"schedule"=>array(
					'date'		=> array (),
					'timefrom'	=> array (),
					'worktype'	=> array ()
				),
	"access"=>1
	);
	$userid = $row['userid'];
} else {
	$answer=array(
	"name"=>"",
	"access"=>0
	);
};	
if ($answer['access'] == 1) {
	//echo $userid;
	$resultt = $mysqli->query ("SELECT `date`, `timefrom`, `worktype` FROM `schedule` WHERE `userid` = ".$userid." AND ((`date` > CURDATE()) OR (`date` = CURDATE() AND `timefrom` >= CURTIME())) ORDER BY `date`, `timefrom`");
	while (($row = $resultt->fetch_assoc()) != false) {
		$answer['schedule']['date'][] = $row['date'];
		$answer['schedule']['timefrom'][] = $row['timefrom'];
		$answer['schedule']['worktype'][] = $row['worktype'];
	};
};

$mysqli -> close ();
echo json_encode($answer);
?>