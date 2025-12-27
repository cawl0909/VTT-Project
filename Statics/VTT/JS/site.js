window.addEventListener("onload",(e)=>{
    console.log("Done loading");
});
var socket = io(); //creates a connection with a socket on the same IP as the website domain
socket.on('connect', ()=>{ socket.emit('request_board'); });
socket.on('board_update',(data)=>{ if(data != null && typeof render_queue !== 'undefined'){ render_queue = data; try{ render(); }catch(e){} } });
const inputbox = document.getElementById("inpbox"); //Gets the input text area as a constant
const mwrap = document.getElementById("message-wrapper"); //Gets the message warpper as a cosntant
inputbox.addEventListener("keypress", checkkey); //adds an event listener for when a key is pressed in the textarea
function checkkey(e){ // A function to check if 

    if (e.which == 13){ // if the key idea for the event is 13 (enter key id)
        e.preventDefault(); //prevents the deafult action of the event namely casuing the text area to increment one line
        var val = (inputbox.value); // gets the text area's text value
        socket.emit("csm",inputbox.value); // emits the chat box value from the client to the server with the csm tag
        inputbox.value = ""; //clears the text area after being emited.
    }
}
socket.on('scm',(msg)=>{  //When it recieves a scm tagged message from the server it runs this
    var tmsg = JSON.parse(msg); // parses the JSON string into a JSON object
    addmessage(tmsg);//runs the addmessage function with the tmsg json object as a paramter 
});
function addmessage (tmsg){ //addmessage function
    var basediv = document.createElement("div"); //creates a div element 
    basediv.setAttribute('class','Inputs'); //gives the div, the class 'Inputs'
    var msginfo = document.createTextNode("("+tmsg.time+"):("+tmsg.name+")"); //Creates a textnode containing
    //the IP and time
    basediv.appendChild(msginfo); //appends the message info text node as a child to the basediv
    basediv.appendChild(document.createElement("br")); //adds to line break tags to the chat message div
    basediv.appendChild(document.createElement("br"));
    basediv.appendChild(document.createTextNode(tmsg.message)); //appends the actual message as a child to the div
    mwrap.appendChild(basediv); //appends the div to the message wrapper 
    scrollBottom();//scrolls the overflow to the bottom of the div
}
socket.on('dr',(msg)=>{ //listens for message from server dr tag
    if (msg[0] != null){ //if the roll value is not null
    var basediv = document.createElement("div"); //creates div
    basediv.setAttribute('class',"dice_roll"); //gives it the dice_roll css class
    var text = document.createTextNode(msg[0].toString()); // dets the value from the msg array
    basediv.appendChild(text); //appends to div 
    basediv.appendChild(document.createElement('br')); //adds two line breaks to basediv
    basediv.appendChild(document.createElement('br'));
    var text2 = document.createTextNode(msg[1].toString()); // creates a textnode containing all the dice rolls
    basediv.appendChild(text2); //appends it to basediv
    mwrap.appendChild(basediv); //appends this to the messagewarpper
    scrollBottom();//scrolls to the bottom of the mwrap div

    }
});
function server_message(inp){
    var basediv = document.createElement("div"); 
    basediv.setAttribute('class',"server_message");
    var text = document.createTextNode(inp); 
    basediv.appendChild(text);
    mwrap.appendChild(basediv); 
    scrollBottom(); 
}
function dice_roll(msg){
    var total = String(msg.values.total);
    var expression = msg.values.expression;
    var basediv = document.createElement("div"); //creates div
    basediv.setAttribute('class',"dice_roll"); //gives it the dice_roll css class
    for(i=0;i<(expression.length);i++){
        var current = expression[i]
        if(current.type === "dice"){
            basediv.appendChild(document.createTextNode("( "));
            var rolls = current.rolls;
            for(z=0;z<(rolls.length);z++){
                var current_dice_roll = rolls[z];
                if(current_dice_roll === 1){
                    var container = document.createElement("span");
                    container.style.color = "red";
                    var text_node = document.createTextNode(String(current_dice_roll) + " ");
                    container.appendChild(text_node);
                    basediv.appendChild(container);
                }else if (current_dice_roll === (current.sizedice)){
                    var container = document.createElement("span");
                    container.style.color = "green";
                    var text_node = document.createTextNode(String(current_dice_roll) + " ");
                    container.appendChild(text_node);
                    basediv.appendChild(container);
                }else{
                    var container = document.createElement("span");
                    var text_node = document.createTextNode(String(current_dice_roll) + " ");
                    container.appendChild(text_node);
                    basediv.appendChild(container);
                }
            }
            var dropped_dice = current.drop;
            if(dropped_dice.length != 0){
                basediv.appendChild(document.createTextNode(" | "));
                for(x=0;x<(dropped_dice.length);x++){
                    var container = document.createElement("span");
                    var text_node = document.createTextNode(String(dropped_dice[x])+ " ");
                    container.style.opacity = 0.5;
                    container.appendChild(text_node);
                    basediv.appendChild(container);
                }
            }
            var container2 = document.createElement("span");
            basediv.appendChild(container2.appendChild(document.createTextNode(")")));
        }
        if(current.type === "num"){
            var container = document.createElement("span");
            var text_node = document.createTextNode(" "+ (String(current.value)) + " ");
            container.appendChild(text_node);
            basediv.appendChild(container);
        }
        if(current.type === "*"||current.type === "/"||current.type === "+"||current.type === "-"){
            var container = document.createElement("span");
            var text_node = document.createTextNode(" " + (String(current.type)) + " ");
            container.appendChild(text_node);
            basediv.appendChild(container);
        }
    }
    basediv.appendChild(document.createElement("br"));
    basediv.appendChild(document.createElement("br"));
    var container3 = document.createElement("span");
    var text_node3 = document.createTextNode("=  " + total);
    container3.style.fontSize = "1.5rem";
    container3.appendChild(text_node3);
    basediv.appendChild(container3);
    basediv.appendChild(document.createElement("br"));
    //var text2 = document.createTextNode(((msg.values)[1]).toString()); // creates a textnode containing all the dice rolls
    mwrap.appendChild(basediv); //appends this to the messagewarpper
    scrollBottom();//scrolls to the bottom of the mwrap div
}
socket.on('server',(msg1)=>{
    msg = msg1.type;
    switch(msg){
        case "error-unrec":
            server_message("The command was unrecognaised");
            break;
        case "toolong":
            server_message("The message was too long");
            break;
        case "roll":
            if(msg1.values == "error"){
                server_message("You did not format the roll correctly");
                break;
            }
            //console.log(msg1);
            dice_roll(msg1);
            break;
        default:
            break;
    }
});
function scrollBottom(){
    mwrap.scrollTop = mwrap.scrollHeight;
}
