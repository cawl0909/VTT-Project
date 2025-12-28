// QUICK SORT
export function quicksort(items){
  if((items.length)<=1){
    return(items);
  }
  var pointer1 = 0;
  var pointer2 = (items.length -1);
  while(pointer1 != pointer2){
    if(((items[pointer1]>items[pointer2])&&(pointer1<pointer2)) || (((items[pointer2])>items[pointer1]) && (pointer2<pointer1))){
      var temp = items[pointer1];
      items[pointer1] = items[pointer2];
      items[pointer2] = temp;
      var temp2 = pointer1;
      pointer1 = pointer2;
      pointer2 = temp2;
    }
    if (pointer1<pointer2){
      pointer1+=1;
    }else{
      pointer1-=1;
    }
  }
  var left = quicksort((items.slice(0,pointer1)));
  var right = quicksort((items.slice((pointer1+1),(items.length))));
  return(left.concat([items[pointer1]],right));
}