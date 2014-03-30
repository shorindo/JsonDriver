<?php
$json = file_get_contents('php://input');
$q = msq_get_queue(12345);
msg_send($q, 1, $json);
msg_recv($q, 1, $msgtype, 10000, $msg, true, MSG_EXCEPT);
/*
$url = 'http://localhost:4444/wd/hub' . $json->path;
$options = array('http' => array(
    'method' => $json->method,
    'content' => http_build_query($json->data),
));
print file_get_contents($url, false, stream_context_create($options));
*/