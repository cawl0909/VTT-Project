function rollGrab(input){ //function to grab the values for rolling dice
  try{ //deafult to try catch incase there is some internal error
    if(input.length > 30){
      return("error"); // validating that the roll length isn't greater than 30 chars 
    }
    if(input.match(/d/g) > 2){
      return("error");
    }
    var split_command = removeWhiteSpace(input);
    if (split_command.length != 2){ //if the number of the white spaced removed input array is longer than 2 it is an error 
      return("error");
    }
    console.log("1");
    console.log(split_command);

    var plusminussplit = ((split_command[1]).split(/[+-]/)); //splits dice roll up along the arithmatic 
    var plusminusarray = []; //array to hold the order of +/-
    for (var i =0;i<((plusminussplit).length);i++){
      if(plusminussplit[i] == ''){ //this for loop checks if there are any double symbols and returns error
          return("error");
      }
    }
    for(var i = 0;i<(input.length);i++){
      if((input[i]) == "+"){
        plusminusarray.push("+"); //adds arithmatic operator to the plusminusarray to see when to use it
      }else if((input[i]) == "-"){
        plusminusarray.push("-");
      }
    }
    var arith = 0; //holds the arithmatic values
    for(var i =0;i<plusminusarray.length;i++){
      if(plusminusarray[i] == "+"){     //adds/subtracts the values to the arithmatic total
        arith += parseInt(plusminussplit[i+1]);
      }else if(plusminusarray[i] == "-"){
        arith -= parseInt(plusminussplit[i+1]);
      }
    }
    var drop;
    var size; //initilaises the dice roll values
    var number;
    var manipulator = plusminussplit[0]; //variable that holds the actual dice
    number = parseInt((manipulator.substring(0,manipulator.indexOf('d')))); //finds the number of dice to be rolled
    var number_dice = (manipulator.split('d')); //splits along d
    size = parseInt(number_dice[1]); //finds the size of the dice
    drop = parseInt(number_dice[2]); //finds the size of the dice to be dropped
    if ((isNaN(size) == true) || (size >100)){ //checks if the size is empty or if the size is greater than 100
      return("error"); //returns error
    }
    if ((number >100)){ //if the number of dice is greater than 100 it returns an error
      return("error");
    }
    return[number,size,drop,arith]; //returns the extracted values to roll the dice
  }catch(e){
    return("error")
  }
}

function sum(value){
  try{
    var manip = removeWhiteSpace(value);
    var numbers = manip[1];
    console.log(isNumber(numbers));
    if(isNaN(parseInt(manip[1])) == true){
    }
    return(manip);
  }catch(e){
    return("error");
  }
}