//////////////////////////////////
//Image /////////////////////////
var elements_images = document.getElementsByClassName("image_list_element");
var is_image_element_visble = false;
var drag_element;
window.addEventListener("mousedown",e=>{
    if(String(e.target.className) == "image_list_element"){
        var tempele = (e.target);
        is_image_element_visble = true;
        create_drag_element(tempele);
        document.body.appendChild(drag_element);
        move_drag_element(e);
    }
});
window.addEventListener("mouseup",e=>{
    if(is_image_element_visble == true){
        is_image_element_visble = false;
        document.getElementById("preview_image").remove();
        if(e.target.nodeName == "CANVAS"){
            var scale = grid_scale/init_scale;
            img_json_template.x = (e.offsetX)/scale;
            img_json_template.y = (e.offsetY)/scale;
            img_json_template.src = drag_element.children[0].src;
            add_to_render_queue(img_json_template);
            json_reset_img();
            render();
        }
    }
});

window.addEventListener("mousemove",e=>{
    if(is_image_element_visble == true){
        move_drag_element(e);
    }
});
function create_drag_element(inputele){
    var children = (inputele.children);
    var temp_wrapper = document.createElement("div");
    var temp_image = document.createElement("img");
    temp_image.src = children[0].src;
    temp_image.style.position = "absolute";
    temp_image.style.width = "250px";
    temp_image.style.height = "250px";
    temp_image.style.objectFit = "contain";
    temp_image.style.zIndex = "1000";
    temp_image.style.top = "0px";
    temp_image.style.left = "0px";
    temp_image.style.pointerEvents = "none";
    temp_wrapper.style.zIndex = "10000";
    temp_wrapper.style.position = "fixed";
    temp_wrapper.id = "preview_image";
    temp_wrapper.appendChild(temp_image);
    drag_element = (temp_wrapper);
}
function move_drag_element(e){
    var tempele_move = document.getElementById("preview_image");
    var top = e.clientY;
    var left = e.clientX;
    tempele_move.style.top = (String(top)+"px");
    tempele_move.style.left = (String(left)+"px");
}
var img_json_template = {
    id:"",
    type:"img",
    bbox:{},
    x:0,
    y:0,
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    width:100,
    height:100,
}
function json_reset_img(){
    text_json_template = {
        id:"",
        type:"img",
        bbox:{},
        x:0,
        y:0,
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        width:100,
        height:100,
        src:"",
        fill_color:"",
        color:(color_picker_1.value),
    }
}
///////render_image
function render_img(inpimg,tempctx){
    tempctx.save();
    var scale = grid_scale/init_scale;
    if(inpimg.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(inpimg);
        tempmatrix = (tempmatrix._data);
        tempctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    var img = new Image();
    img.src = inpimg.src;
    tempctx.drawImage(img,inpimg.x*scale,inpimg.y*scale,inpimg.width*scale,inpimg.height*scale);
    tempctx.restore();
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/////IMG IMG IMG IMG LIB CREATION//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
function add_to_lib(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var temp_img_array = JSON.parse(this.responseText);
            temp_img_array.forEach(element => {
                add_element_lib(element);
            });
        }
    };
    xhttp.open("GET","http://localhost:3000/imglib",true);
    xhttp.send();
}
function add_element_lib(inputname){
    var wrapperdiv = document.createElement("div");
    wrapperdiv.classList.add("image_list_element");
    var tempimg = document.createElement("img");
    tempimg.src = "http://localhost:3000/cdn/"+String(inputname);
    tempimg.classList.add("image_list_element_image");
    wrapperdiv.appendChild(tempimg);
    var temptext = document.createElement("div");
    temptext.classList.add("image_list_element_text");
    temptext.appendChild(document.createTextNode(String(inputname)));
    wrapperdiv.appendChild(temptext);
    document.getElementById("image_list").appendChild(wrapperdiv);
}
///////////////////////////////////////////////////////////////////////////
/////////////////UPLOAD IMAGE/////////////////////////////////////////////////////////
////////////////////////////////////////////
var image_uploader = document.getElementById("upload_file_img");
var image_upload_button = document.getElementById("upload_button");
image_upload_button.addEventListener("click",upload_image);
function upload_image(e){
    var exts = /(\.jpg|\.jpeg|\.png|\.svg|\.webp)$/i;
    var upload_value = image_uploader.value;
    if(exts.exec(upload_value) == null){
        return;
    }
    if(image_uploader.files.length <1 || image_uploader.files.length >1){
        return;
    }
    var formData = new FormData();
    formData.append("file", image_uploader.files[0],image_uploader.files[0].name);
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var parent_node = document.getElementById("image_list");
            remAllChild(parent_node);
            add_to_lib();
        }
    };
    xhttp.open("POST","http://localhost:3000/upload",true);
    xhttp.send(formData);
}
function remAllChild(parent_node) {
    while (parent_node.firstChild) {
        parent_node.removeChild(parent_node.firstChild);
    }
}