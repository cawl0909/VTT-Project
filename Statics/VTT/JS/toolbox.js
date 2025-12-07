var pointer_tool_on = true;
var ruler_tool_on = false;
var draw_tool_on = false;
var draw_tool_text = false;
var draw_tool_freehand = true;
var draw_tool_polyline = false;
var draw_tool_circledraw = false;
var draw_tool_squaredraw = false;
document.addEventListener('click', e=>{
    switch (e.target.id){
        case "ruler_id":
            false_all_tools();
            ruler_tool_on = true;
            set_class_tool();
            break;
        case "cursor_tool_id":
            false_all_tools();
            pointer_tool_on = true;
            set_class_tool();
            break;
        case "draw_id":
            false_all_tools();
            draw_tool_on = true;
            set_class_tool();
            break;
        case "del_id":
            clear_canvas();
            break;
        case "freehand":
            false_all_tools_sublist();
            document.getElementById("draw_id").src = document.getElementById("freehand").childNodes[1].src;
            draw_tool_freehand = true;
            set_class_tool();
            break;
        case "polyline":
            false_all_tools_sublist();
            document.getElementById("draw_id").src = document.getElementById("polyline").childNodes[1].src;
            draw_tool_polyline = true;
            set_class_tool();
            break;
        case "circle_draw":
            false_all_tools_sublist();
            document.getElementById("draw_id").src = document.getElementById("circle_draw").childNodes[1].src;
            draw_tool_circledraw = true;
            set_class_tool();
            break;
        case "square_draw":
            false_all_tools_sublist();
            document.getElementById("draw_id").src = document.getElementById("square_draw").childNodes[1].src;
            draw_tool_squaredraw = true;
            set_class_tool();
            break;
        case "text_draw":
            false_all_tools_sublist();
            document.getElementById("draw_id").src = document.getElementById("text_draw").childNodes[1].src;
            draw_tool_text = true;
            set_class_tool();
            break;
    }
    return;
});
function false_all_tools(){
    reset_tools();
    pointer_tool_on = false;
    ruler_tool_on = false;
    draw_tool_on = false;
}
function false_all_tools_sublist(){
    reset_tools();
    draw_tool_freehand = false;
    draw_tool_polyline = false;
    draw_tool_circledraw = false;
    draw_tool_squaredraw = false;
    draw_tool_text = false;
}
function reset_tools(){
    reset_pen_tempalte();
    is_ruler_down = false;
    is_pen_down = false;
    is_elipse_down = false;
    is_poly_down = false;
    is_text_down = false;
    json_reset_text();
    reset_elipse_template();
    reset_ruler();
    reset_rect_json_template();
    reset_poly_template();
    reset_selection();
}
function set_class_tool(){
    if (ruler_tool_on == true){
        document.getElementById("ruler_id").setAttribute('class',"elemI2");
    }else{
        document.getElementById("ruler_id").setAttribute('class',"elemI");
    }
    if(pointer_tool_on == true){
        document.getElementById("cursor_tool_id").setAttribute('class',"elemI2");
    }else{
        document.getElementById("cursor_tool_id").setAttribute('class',"elemI");
    }
    if (draw_tool_on == true){
        document.getElementById("draw_id").setAttribute('class',"elemI2");
        document.getElementById("color_picker_width").style.visibility = "visible";
        document.getElementById("draw_sub_list").style.visibility = "visible";
        if(draw_tool_freehand == true){
            document.getElementById("freehand").setAttribute('class','draw_sub_list_class_2');
        }else{
            document.getElementById("freehand").setAttribute('class','draw_sub_list_class');
        }
        if(draw_tool_polyline == true){
            document.getElementById("polyline").setAttribute('class','draw_sub_list_class_2');
        }else{
            document.getElementById("polyline").setAttribute('class','draw_sub_list_class');
        }
        if(draw_tool_circledraw == true){
            document.getElementById("circle_draw").setAttribute('class','draw_sub_list_class_2');
        }else{
            document.getElementById("circle_draw").setAttribute('class','draw_sub_list_class');
        }
        if(draw_tool_squaredraw == true){
            document.getElementById("square_draw").setAttribute('class','draw_sub_list_class_2');
        }else{
            document.getElementById("square_draw").setAttribute('class','draw_sub_list_class');
        }
        if(draw_tool_text == true){
            document.getElementById("text_draw").setAttribute('class','draw_sub_list_class_2');
        }else{
            document.getElementById("text_draw").setAttribute('class','draw_sub_list_class');
        }
    }else{
        document.getElementById("draw_id").setAttribute('class',"elemI");
        document.getElementById("color_picker_width").style.visibility = "hidden";
        document.getElementById("draw_sub_list").style.visibility = "hidden";
    }
}
////////////////////////////////
//Swapping between tabs 
function switchmenu_function_chat(){
    document.getElementById("message-wrapper").style.display = "block";
    document.getElementById("Chat-Wrapper").style.display = "block";
    document.getElementById("img_submenu").style.display = "none";
}
function switchmenu_function_img(){
    document.getElementById("message-wrapper").style.display = "none";
    document.getElementById("Chat-Wrapper").style.display = "none";
    document.getElementById("img_submenu").style.display = "block";
}