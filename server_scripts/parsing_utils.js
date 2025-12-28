const { quicksort } = require("./sort_scripts.js");

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
  quicksort(listof); 
  for (var i = listof.length -1;i>-1;i--){ //goes from top to bottom of temp list
    //splices the split list at their locations descending 
      breakdown.splice(listof[i],1);
  }
  return(breakdown); //returns the nowhitespace list
  
}

module.exports = { check_is_char, removeWhiteSpace };