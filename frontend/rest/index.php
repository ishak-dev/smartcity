<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL);

require_once "../vendor/autoload.php";
require_once "dao/server.php";

//Flight::route('/home','hello');

Flight::register('server','Server');



Flight::route('GET /home',function(){
  Flight::json(Flight::server()->listAll());
});

Flight::route("POST /home",function(){
  $data = Flight::request()->data->getData();

  Flight::json(Flight::server()->sortText($data['TweetText']));
  Flight::json(Flight::server()->Api());
  Flight::json(Flight::server()->addData($data));
});

Flight::route("PUT /home/@id",function($id){
  $data = Flight::request()->data->getData();
  $data['id'] = $id;
  Flight::json(Flight::server()->updateData($data));
});

Flight::route('DELETE /home/@id',function($id){
  Flight::server()->deleteData($id);
  Flight.json(["message"=>"deleted"]);
});

Flight::start();
?>
