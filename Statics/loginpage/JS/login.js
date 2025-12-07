var userfield = document.getElementById("username");
var passfield = document.getElementById("password");
var submit_button = document.getElementById("submit_form");
var switch_check = document.getElementById("switch_visible");
var error_log = document.getElementById("errlog");
switch_check.addEventListener("click",funcswitch);
function funcswitch(e){
    var switch_bool = (switch_check.checked);
    if(switch_bool == true){
        passfield.type = "text";
    }else{
        passfield.type = "password";
    }
}
submit_button.addEventListener("click",send_pass)
function send_pass(e){
    var tempass = passfield.value;
    var tempuser = userfield.value;
    if(tempass == ""||tempuser == ""){
        throw_error("empty_field");
        return;
    }
    if((test_if_has_whitespace(tempass) == true) || (test_if_has_whitespace(tempass)) == true){
        throw_error("empty_spaces");
        return;
    }
    if((tempass.length >30)|| (tempuser>30)){
        throw_error("too_long");
        return;
    }
    error_log.innerHTML = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("hi");
        }
    };    
    xhttp.open("POST","http://localhost:3000/login",true)
    xhttp.setRequestHeader("Content-type","application/json");
    xhttp.send(JSON.stringify({username:tempuser,password:tempass}));
}
function test_if_has_whitespace(inp){
    var regextest = /\s/g;
    return(regextest.test(inp));
}
function test_if_number(inp){
    var regextest = /[0-9]/g;
    return((inp.match(regextest)));
}
function throw_error(error){
    if(error == "empty_field"){
        error_log.innerHTML = "You cannont leave any fields empty";
    }else if(error == "empty_spaces"){
        error_log.innerHTML = "You cannont have any white space";
    }else if(error == "too_long"){
        error_log.innerHTML = "The inputs are too long";
    }
}