<?php
$schedule=array();
$mysqli = new mysqli ("localhost", "root", "", "nailappdb");
$mysqli->query ("SET NAMES 'utf8'");
$result = $mysqli->query ("SELECT `timefrom`, `timeto` FROM `schedule` WHERE `date` = '".$_POST['year']."-".$_POST['month']."-".$_POST['day']."' ORDER BY `timefrom`");
//$result = $mysqli->query ("SELECT `timefrom`, `timeto` FROM `schedule` WHERE `date` = '"."2017"."-"."01"."-"."16"."' ORDER BY `timefrom`");
$schedule = array ( 'timefrom'  => array (),
					'timeto'	=> array ()
				  );
while (($row = $result->fetch_assoc()) != false) {
	$schedule['timefrom'][] = $row['timefrom'];
	$schedule['timeto'][] = $row['timeto'];
}
$mysqli -> close ();
echo json_encode($schedule);
?>