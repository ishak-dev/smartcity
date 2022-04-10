<?php

class Server{

  private $conn;
  private $lat=0;
  private $lng=0;

  public function __construct(){
    $database = "127.0.0.1:3309";
    $username = "root";
    $password = "user";
    $schema = "hackathome";

    $this->conn = new PDO ("mysql:host=$database;dbname=$schema", $username,$password);
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  //Definisemo polja koja c ena trebati za insertovanje podataka
  private $Text="";
  private $Time="";
  private $Location="";
  private $Type="";

  //funckija koja iz jendog texta izvlaci sve potrebne infomracije L -location T-Time
  public function sortText($text){
    $this->Time = strstr($text,"T:");
    $this->Time = substr($this->Time,2);
    $this->Time = strstr($this->Time,"K",true);
    $this->Type = strstr($text, "K");
    $this->Type = substr($this->Type,2);
    $this->Type = trim($this->Type," ");
    $this->Location = strstr($text,"L:");
    $this->Location = substr($this->Location,2);
    $this->Location = strstr($this->Location,"T",true);
    $this->Text = strstr($text,"L:",true);

  }

  // Funkcija api sluzi za konvertovanje adrese u koordinate
  public function Api(){
  $queryString = http_build_query([
  'access_key' => '69491e743057fbe7c5b4179554a5bd98',
  'query' => $this->Location,
  'region' => 'Sarajevo',
  'output' => 'json',
  'limit' => 1,
  ]);

  $ch = curl_init(sprintf('%s?%s', 'http://api.positionstack.com/v1/forward', $queryString));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $json = curl_exec($ch);

  curl_close($ch);

  $apiResult = json_decode($json, true);

//  $object = $apiResult[0]
  $this->lat= $apiResult["data"][0]['latitude'];
  $this->lng= $apiResult["data"][0]['longitude'];

  }

  //dodajemo sve infomracije u bazu podataka
  public function addData($data){
    $data['lat'] = $this->lat;
    $data['lng'] = $this->lng;
    $data["TweetText"] = $this->Text;
    $data["Adresa"] = $this->Location;
    $data["Time"] = $this->Time;
    $data["type"] = $this->Type;
    $stmt = $this->conn->prepare("INSERT INTO data (TweetText,TweetedBy,Time,Adresa,lat,lng,type) VALUES (:TweetText, :TweetedBy,:Time,:Adresa,:lat,:lng,:type)");
    $stmt->execute($data);
    return $data;
  }


  // ostali kod nema znacaja uglavnom je po potrebi

  public function listAll(){
    $stmt = $this->conn->prepare("SELECT * FROM data");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function updateData($data){
    $stmt = $this->conn->prepare("UPDATE data SET Time= :Time, lat = :lat, lng = :lng WHERE id = :id");
    $stmt->execute($data);
    return $data;
  }

  public function deleteData($id){
    $stmt = $this->conn->prepare("DELETE FROM data WHERE id = :id");
    $stmt->bindParam(':id',$id);
    $stmt->execute();
  }


}





?>
