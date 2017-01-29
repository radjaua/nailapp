<?php
$current_date=array(
"day"=>date ("j"),
"month"=>date ("n"),
"year"=>date ("Y"),
"hour"=>date ("H"),
"minute"=>date ("i")
);
echo json_encode($current_date);
?>