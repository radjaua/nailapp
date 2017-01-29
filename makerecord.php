<?php
$mysqli = new mysqli ("localhost", "root", "", "nailappdb");
$mysqli -> query ("SET NAMES 'utf8'");
$result = $mysqli->query ("SELECT `userid` FROM `accounts` WHERE `token` = '".$_POST['cookiesToken']."'");
if (($row = $result->fetch_assoc()) != false) { // Проверяем токен и выясняем userid по нему
	$userid = $row['userid'];
} else {
	$answer = 1;// Вывод о просроченности токена, тобишь нужно перезайти
	echo "invalid token";
};
$result = $mysqli->query ("SELECT MAX(`ordernum`) FROM `schedule`");
if ((($row = $result->fetch_assoc()) != false) && (isset($row['MAX(`ordernum`)']))) {
	$ordernum = $row['MAX(`ordernum`)'] + 1;
} else {
	$ordernum = 1;
};
/*$timeFrom_elements = explode (":", $_POST['timeFrom']);
$timeTo_elements = explode (":", $_POST['timeTo']);
$time = mktime ($timeFrom_elements[0], $timeFrom_elements[1]);
$timeTo = mktime ($timeTo_elements[0], $timeTo_elements[1]);
while ($time < $timeTo) {
$time_array = getdate ($time); // Создание ассоциативного массива из времени
$timeSQL = $time_array['hours'].":".$time_array['minutes'];  //  Создание времени текстом для SQL    */
$resultt = $mysqli->query ("INSERT INTO `schedule` (`ordernum`, `date`, `timefrom`, `timeto`, `userid`, `worktype`, `manicyur`) VALUES ('".$ordernum."', STR_TO_DATE('".$_POST['date']."', '%d.%m.%Y'), STR_TO_DATE('".$_POST['timeFrom']."', '%k:%i'), STR_TO_DATE('".$_POST['timeTo']."', '%k:%i'), '".$userid."', '".$_POST['workType']."', '".$_POST['manicyur']."')");
/*$time = $time + 30 * 60;	
};*/


$mysqli -> close ();
?>