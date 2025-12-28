const express = require('express'); //imports express
const fs = require('fs');        //initilaisng and importing Node.JS libraries //imports file handling
const http = require('http'); //imports http server
const { Server } = require("socket.io"); //imports socketio
const sort_scripts = require("./server_scripts/sort_scripts")
const psuedo_random = require("./server_scripts/psuedo_random")


// 



//server init
const app = express(); //creates express instance called app
const server = http.createServer(app); //creates http server with express
const io = new Server(server); //creates socket.io server within main server


// Per-room board state map (roomName -> render_queue array)
var board_states = {};
function getRoom(socket){ return socket.room || 'main'; }
const port1 = process.env.PORT || 3000; // Specify a port that the server listens on
const formidable = require('formidable');///formidable package
const { sort } = require('mathjs');

////////////////////////////////////////////////////////
////////////////////////////////////////////////
app.use(express.static(__dirname+"/node_modules/mathjs/lib/browser/"));
app.use(express.static('Statics')); //allows the server to send the static web files
app.use(express.static("/canvas_image_assets/")); ///canvas image assets
app.use(express.json());
app.use(express.urlencoded({
  extended:true,
}));
app.get("/",(req,res)=>{
  res.sendFile(__dirname + '/Statics/VTT/main.html');
});
app.get("/main",(req,res)=>{
  res.sendFile(__dirname + '/Statics/VTT/main.html');
});
app.get("/cdn/:url",(req,res)=>{
  try{
    var img_path = (req.params).url;
    img_path = String(__dirname+"/canvas_image_assets/" +img_path);
    fs.stat(img_path,function(err,stat){
      if(err == null){
        res.sendFile(img_path);
      }else{
        res.sendFile(__dirname+"/missing_text.jpg");
      }
    });
  }catch(e){
    res.sendFile(__dirname+"/missing_text.jpg");
  }
});
app.get("/imglib",(req,res)=>{
  var img_obj_array = [];
  try{
    fs.readdir(__dirname + "/canvas_image_assets/",(err,files)=>{
      if(err){
        console.log(err);
      }else{
        files.forEach(file=>{
          img_obj_array.push(String(file));
        })
      }
      res.send(img_obj_array);
    });
  }catch(e){

  }
});
app.post("/upload",(req,res)=>{
  try{
    var tempform = new formidable.IncomingForm();
    tempform.parse(req,function(err,fields,files){
      var path_to_upload = (__dirname+"/canvas_image_assets/"+files.file.originalFilename);
      //console.log((files.file.originalFilename));
      if(files.file.size <= 10000000){
        fs.rename(files.file.filepath,path_to_upload,function(err){
          if(err)console.log(err);
          return(res.status(200).send());
        });
      }
      if(err){
        res.status(400).send();
      }
    });
  }catch(e){
    res.status(400).send();
  }
});
app.get("/login",(req,res)=>{
  res.sendFile(__dirname + "/Statics/loginpage/main.html");
});
//////////////////////////////////////////////
io.on('connection', (socket) => { //handles socket communcation with clients
  console.log('a user connected');
  socket.on('csm',(msg)=>{ // when an emititon from a connected socket with the tag 'csm' comes it 
    var curtime = new Date(); // starts, this gets the current time at the time of getting the message 
    var ttime = (String(curtime.getHours())+":"+String(curtime.getMinutes())+":"+String(curtime.getSeconds()));
    //Above gets the current time for the server in hh:mm:ss
    var socket_ip = socket.handshake.headers['x-forwarded-for']; //grabs IP
    var tempmessage = {name:String((socket_ip)),time:ttime,message:msg};
    //Above creates a JSON object to be emited, with the name (IP adress for now), the current time and the actual message contents
    if ((msg.length == 0) || (msg.trim("").length ==0)){ //validates if the message is just empty of full of whitepsace to prevent spam
    }else if((msg.length)>1000){ //If the chat message was too long send a 'TL' (Too Long) tagged emition.
      socket.emit("server",{type:"toolong"}); //emits as beforemention TL emition
    }else{
      try{
        console.log(socket_ip); // trys to grab and output the IP-Adress of a socket
        //connected to the server from the HTTP handshake 
      } catch{
      }
      var room = getRoom(socket);
      io.to(room).emit("scm",(JSON.stringify(tempmessage))); //Converts the JSON object into a string and emits to sockets in the room
      var temparr = commandRunner(msg)  //Checks if msg is command
      try{
        if(temparr == "error-unrec"){ //check if message
          socket.emit("server",{type:(temparr)}); // Generates a random dice roll
        }else if(temparr != "error"){
          io.to(room).emit("server",(temparr));
        }
      }catch{
      }
      console.log(msg); //outputs the chat message sent to the server to the console.
      fs.appendFileSync('message_log.txt', "\r\n[" + ttime + "][" + curtime.getDate() + "/" + (parseInt(curtime.getMonth())+1).toString() + "/" + curtime.getFullYear() + "][ROOM-" + room + "][IP-" + socket_ip + "]: -- " + msg, 'utf-8');
      //above appends the messages tot he message log

    }
  });
  // allow clients to join a named room (default: 'main')
  socket.on('join_room',(roomName)=>{
    try{
      if(!roomName) roomName = 'main';
      socket.join(roomName);
      socket.room = roomName;
      if(!board_states[roomName]) board_states[roomName] = [];
      // immediately send the room's board state to the joining client
      socket.emit('board_update', board_states[roomName]);
      console.log('Socket joined room:', roomName);
    }catch(e){}
  });

  socket.on('board_update',(msg)=>{
    try{
      var room = getRoom(socket);
      board_states[room] = msg;
      io.to(room).emit('board_update', board_states[room]);
    }catch(e){ }
  });
  socket.on('request_board',()=>{
    var room = getRoom(socket);
    socket.emit('board_update', board_states[room] || []);
  });
  // socket disconnect handler — no socket param is provided by the event callback
  socket.on('disconnect', ()=>{
    console.log("Disconnect", getRoom(socket)); //when a connected user leaves the socket it outputs it to the terminal and room
  });
});
server.listen(port1,() =>{   //sets the the server listens on the port1 port
    console.log("Listening on:" + port1); //Once the server starts listening it outputs the port onto the console
});
///// Check is a char
function check_is_char(e){
  return( /^[A-Za-z]{1,1}$/.test(e));
}
/////Remove white space 
function removeWhiteSpace(toRemove){ //gets the string whos whitespace needs to be removed
  var breakdown = toRemove.split(' '); //splits the string on whitespace
  var listof = []; //creates temp list
  for(var i = 0;i<(breakdown.length);i++ ){
      if(breakdown[i] == ""){ //goes through all of the list and adds the 
        //postion of any whitespace onto the temp string
          listof.push(i);
      }
  }
  sort_scripts.quicksort(listof); 
  for (var i = listof.length -1;i>-1;i--){ //goes from top to bottom of temp list
    //splices the split list at their locations descending 
      breakdown.splice(listof[i],1);
  }
  return(breakdown); //returns the nowhitespace list
  
}
/////Grabs the command from input string
function getCommand(msg){ //gets command
  try{ //prevents server from crashing with try loop
      if(msg.length < 500){ 
        var splitString = removeWhiteSpace(msg); //calls removewhitespace 
        if ((splitString[0].substr(0,1)) == "/"){ //checks if it has the correct syntax 
          var command = splitString[0].substr(1,splitString[0].length);
           //grabs the command
           return(command);//returns the command
        }else{
          return("error");
        }
      } 
    }catch(e){
      return("error");
    }
}
///Runs through a switch function to trigger correct commands
function commandRunner(input){ //This takes the message as an input
  try{
    var command = getCommand(input); //gets the command
    switch (command){ //checks what the command is if it is isn't recogninsed or is not a command
      case "roll": 
        var output = SumDice((input));
        var return_out = {values:output,type:'roll'};
        return(return_out);
        break;
      case "sum":    
        var output = sum(value);
        var return_out = {values:output,type:'sum'}
        return(return_out);
        break;
      case "error":
        return("error");
        break;
      case "r":
        var output = SumDice((input));
        var return_out = {values:output,type:'roll'};
        return(return_out);
      default:
        return("error-unrec"); //if it isn't in the switch statement it deafults to an unrecognised command
        break;
    }
  }catch(e){
    return("error")
  }
}
//////////////////////////////////////
function rollGrab(input){ //function to grab the values for rolling dice
  try{
    var parsed_input = removeWhiteSpace(input);
    if(parsed_input.length <= 1){
      return("error");
    }
    var reading = parsed_input.slice(1);
    reading = reading.join('');
    //console.log(parsed_input);
    //console.log(reading);
    var sum_comp =[];
    var temp_str = "";
    var type = "";
    for(i = 0;i<(reading.length);i++){
      try{
        cur_char = reading[i];
        if(cur_char === "+" || cur_char === "-" || cur_char === "*" || cur_char === "/"){
          if(temp_str === ""){
          }else{
            sum_comp.push({type:type,value:temp_str});
          }
          temp_str = "";
          type = "";
          sum_comp.push({type:cur_char});
          continue;
        }
        temp_str += cur_char;
        //console.log(temp_str);
        var cur_is_alpha = (check_is_char(cur_char));
        var check = isNaN(Number(temp_str));
        if (cur_char === "\n"){
          return("error");
        }
        if(check === false){
          type = "num"
        }else if((cur_char === "d")){
          type = "dice";
        }else if((cur_char != "d")&&(check == true)&&((isNaN(Number(cur_char)))=== true)){
          return("error");
        }
        //console.log(temp_str);
        if(i == (reading.length)-1){
          sum_comp.push({type:type,value:temp_str});
        }
      }catch(e){
        return("error");
      }

    }
    //console.log(sum_comp);
    return(clean_dice(sum_comp));
  }catch(e){
    return("error");
  }
}
/////// Cleans the parsed dice
function clean_dice(sum_comp){
  try{
    var final_array = [];
    for(i = 0;i<(sum_comp.length);i++){
      if(sum_comp[i].type === "+" || sum_comp[i].type === "/" || sum_comp[i].type === "*" || sum_comp[i].type === "-"){
        if(((sum_comp[i-1].type === ("dice"))  || (sum_comp[i-1].type === "num")) && ((sum_comp[i+1].type === ("dice"))  || (sum_comp[i+1].type === "num"))){
          final_array.push(sum_comp[i]);
        }else{
          return("error");
        }
      }else{
        final_array.push(sum_comp[i]);
      }
    }
    //console.log(final_array);
    return(final_array);
  }catch(e){
    return("error");
  }
}
function run_dice(dice){
  try{
    if(dice.type != "dice"){
      return("error");
    }
    var dicevalue = dice.value;
    var num;
    var size;
    var drop;
    var d1;
    var d2;
    var dcount = 0;
    for(i=0;i<(dicevalue.length);i++){
      if(dicevalue[i] == "d"){
        dcount+=1;
      }
      if(dcount>2){
        return("error");
      }
      if((i== (dicevalue.length-1)) && dcount<1){
        return("error");
      }
      if(dicevalue[i] == "d" && dcount == 1){
        d1 = i;
      }else if(dicevalue[i] == "d" && dcount == 2){
        d2 = i;
      }
    }
    num = dicevalue.substring(0,d1);
    if(num === ""){
      num =1;
    }else{
      num = Number(num);
    }
    if (d2 == undefined){
      size = dicevalue.substring(d1+1,(dicevalue.length));
      if(size === "" || (Number(size)) === 0){
        return("error");
      }else{
        size = Number(size);
      }
    }else{
      size = dicevalue.substring((d1+1),d2)
      if(size === "" || ((Number(size))) === 0){
        return("error");
      }else{
        size = Number(size);
      }
    }
    if(d2 != undefined){
      drop = dicevalue.substring((d2+1),(dicevalue.length));
      if(drop === ""){
        return("error");
      }else{
        drop = Number(drop);
      }
    }else{
      drop = 0;
    }
    if(drop>num){
      return("error");
    }
    if(num>500){
      return("error");
    }
    if(size>10000000){
      return("error");
    }
    var dice_rolls = []
    for(i=0;i<num;i++){
      dice_rolls.push(((psuedo_random.LCG())%size)+1);
    }
    var sorted_rolls = sort_scripts.quicksort(dice_rolls);
    var sum_array = sorted_rolls.slice(drop,(sorted_rolls.length));
    var drop_array = sorted_rolls.slice(0,drop);
    var sumofdice = 0;
    for(i = 0;i<(sum_array.length);i++){
      sumofdice += sum_array[i];
    }
    //return(sumofdice);
    return({value:sumofdice,rolls:sum_array,drop:drop_array,sizedice:size,type:"dice"});
  }catch(e){
    return("error");
  }
}
////////////////// Generates the random dice
function  SumDice(item){ //function to generate random bumbers
  try{
    items = rollGrab(item);
    var sumall =0;
    if(items == "error"){ //if items is error
      return("error"); //returns error
    }
    for (lig = 0;lig<(items.length);lig++){ ////strange I bug replaced with lig
      if(items[lig].type === "dice"){
        var x = items[lig];
        x = run_dice(x);
        if(x == "error"){
          return("error");
        }
        items[lig] = x;
      }
    }
    var tempstringtoeval = "";
    for(i=0;i<(items.length);i++){
      if(items[i].type === "/" ||items[i].type === "*" ||items[i].type === "+" ||items[i].type === "-"){
        tempstringtoeval += items[i].type;
      }else{
        tempstringtoeval+=(String(items[i].value));
      }
    }
    var finaltotal = eval(tempstringtoeval);
    return({total:finaltotal,expression:items});
  }catch(e){
    return("error");
  }
  
}
//////////////////////////////////////////////////////////////////////////////////////
var tempoarray = [
  { type: 'dice', value: '3d6' },
  { type: '+' },
  { type: 'dice', value: 'd6' },
  { type: '+' },
  { type: 'dice', value: 'd7' }
]
//console.log(run_dice(  { type: 'dice', value: '3d6d1' }));
//console.log(tempoarray);