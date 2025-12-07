window.addEventListener("load",(e)=>{
    render();
    console.log("FINISHED RENDERING");
    set_class_tool();
    add_to_lib();
    document.getElementById("loading_page").style.display = "none";
    console.log("FINISHED LOADING FILES");
});