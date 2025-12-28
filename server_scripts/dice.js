const { removeWhiteSpace, check_is_char } = require("./parsing_utils.js");
const { quicksort } = require("./sort_scripts.js");
const psuedo_random = require("./psuedo_random.js");

function rollGrab(input){ //function to grab the values for rolling dice
  try{
    var parsed_input = removeWhiteSpace(input);
    if(parsed_input.length <= 1){
      return("error");
    }
    var reading = parsed_input.slice(1);
    reading = reading.join('');
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
        if(i == (reading.length)-1){
          sum_comp.push({type:type,value:temp_str});
        }
      }catch(e){
        return("error");
      }

    }
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
    var sorted_rolls = quicksort(dice_rolls);
    var sum_array = sorted_rolls.slice(drop,(sorted_rolls.length));
    var drop_array = sorted_rolls.slice(0,drop);
    var sumofdice = 0;
    for(i = 0;i<(sum_array.length);i++){
      sumofdice += sum_array[i];
    }
    return({value:sumofdice,rolls:sum_array,drop:drop_array,sizedice:size,type:"dice"});
  }catch(e){
    return("error");
  }
}
////////////////// Generates the random dice
function SumDice(item){ //function to generate random bumbers
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

module.exports = { rollGrab, clean_dice, run_dice, SumDice };