
var seed = 1344890202

export function LCG(){  //Psuedorandom number generator using a C++ minstd_rand0 standard.
    const modul = (2147483647); //holds intial paramters.
    const multiplier = 48271;
    const increment = 0;
    seed = (((multiplier*seed)+increment)%modul); //runs one pass of the formula
    return(seed); //returns the seed after one pass through the function
}
