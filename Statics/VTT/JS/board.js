const canvas = document.getElementById("canvas_id");
const ctx = canvas.getContext('2d');
const canvas_warpper = document.getElementById("canvas-wrapper");
canvas.addEventListener("wheel",zoom);
canvas.addEventListener("mousedown",mouse_down);
canvas.addEventListener("mouseup",no_longer_down);
canvas.addEventListener("mousemove",mouse_move);
canvas.addEventListener("contextmenu",nocon);
canvas.addEventListener("keydown",canvas_keydown);
var render_queue = [];
function send_board_update(){
    if(typeof socket !== 'undefined'){
        try{
            socket.emit('board_update', JSON.parse(JSON.stringify(render_queue)));
        }catch(e){}
    }
}
///canvas clearer
function clear_canvas(){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    render_queue = [];
    render();
    send_board_update();
} 
/// Disables some weird CSS/JS 
function nocon(e){ // Disables right click on the canvas
    e.preventDefault();
    return false;
}
//Disables image draging on the tool panel
document.getElementById("tool-panel").ondragstart = function(){
    return false;
}
////////////////////////////////////////
///// panning 
var is_dragging = false;
var is_dragging_drag = false;
var pan_start_x;
var pan_start_y;
function no_longer_down(e){
    is_dragging = false;
    if((e.button == "2")){
        canvas.style.cursor = "auto";
        is_dragging_drag = false;
    }
    if(e.button == "0"){        // finalize marquee selection if active
        if(is_multi_select == true){
            is_multi_select = false;
            var x1 = Math.min(multi_select_start_x,multi_select_end_x);
            var x2 = Math.max(multi_select_start_x,multi_select_end_x);
            var y1 = Math.min(multi_select_start_y,multi_select_end_y);
            var y2 = Math.max(multi_select_start_y,multi_select_end_y);
            var sel = [];
            for(var i=0;i<render_queue.length;i++){
                var el = render_queue[i];
                if(!el || !el.bbox) continue;
                var bx = el.bbox.x;
                var by = el.bbox.y;
                var bw = el.bbox.width * (el.scalee || 1);
                var bh = el.bbox.height * (el.scalen || 1);
                if((bx < x2) && (bx + bw > x1) && (by < y2) && (by + bh > y1)){
                    sel.push(i);
                }
            }
            if(sel.length > 0){
                selected_indices = sel;
                is_selected = true;
                queue_pos = selected_indices[0];
            }else{
                clear_selection();
            }
            render();
            return;
        }        if(ruler_tool_on == true){
            is_ruler_down = false;
            reset_ruler();
        }else if(draw_tool_freehand == true && is_pen_down == true){
            is_pen_down = false;
            add_to_render_queue(pen_json_template);
            reset_pen_tempalte();
            render();
        }else if(draw_tool_squaredraw == true && is_rect_down == true){
            is_rect_down = false;
            add_to_render_queue(rect_json_template)
            reset_rect_json_template();
            render();
        }else if(draw_tool_circledraw == true && is_elipse_down == true){
            is_elipse_down = false;
            add_to_render_queue(elipse_json_template);
            reset_elipse_template();
            render();
        }else if(pointer_tool_on == true && is_selected == true){
            is_select_move = false;
            selected_rotate = false;
            select_tr = false;
            select_east = false;
            select_west = false;
            select_south = false;
            select_north = false;
            select_tl = false;
            select_br = false;
            select_bl = false;
            render();
        }
    }
}
function mouse_down(e){
    is_dragging = true;
    if((e.button == "2")){
        is_dragging_drag = true;
        canvas.style.cursor = "grabbing";
        pan_start_x = e.pageX
        pan_start_y = e.pageY
        var pos = get_cords(e);
        if(is_ruler_down == true){
            var pos = get_cords(e);
            var scale = grid_scale/init_scale;
            ruler_pointers.point_array.push({x:pos[0]/scale,y:pos[1]/scale});
        }
        if(is_poly_down == true){
            //console.log("3");
            is_poly_down = false;
            add_to_render_queue(poly_json_template);
            reset_poly_template();
            render();
        }
    }
    if ((e.button == "0")){
        if (ruler_tool_on == true){
            is_ruler_down = true;
            var scale = grid_scale/init_scale;
            var cords = get_cords(e);
            ruler_pointers.x = cords[0]/scale;
            ruler_pointers.y = cords[1]/scale;
            ruler_pointers.point_array.push({x:cords[0]/scale,y:cords[1]/scale});
        }
        if (draw_tool_freehand == true && draw_tool_on == true){
            is_pen_down = true;
            var cords = get_cords(e);
            var scale = grid_scale/init_scale;
            pen_json_template.x = cords[0]/scale;
            pen_json_template.y = cords[1]/scale;
            pen_json_template.pen_array.push({x:0,y:0});
            render();
            //render_pen(pen_json_template);
        }
        if (draw_tool_squaredraw == true && draw_tool_on == true){
            is_rect_down = true;
            var scale = grid_scale/init_scale;
            var cords = get_cords(e);
            rect_json_template.x = cords[0]/scale;
            rect_json_template.x1 = 0;
            rect_json_template.y = cords[1]/scale;
            rect_json_template.y1 = 0;
            render();
            //render_rect(rect_json_template);
        }
        if (draw_tool_circledraw == true && draw_tool_on == true){
            is_elipse_down = true;
            var cords = get_cords(e);
            var scale = grid_scale/init_scale;
            elipse_json_template.x = cords[0]/scale;
            elipse_json_template.x1 = 1;
            elipse_json_template.y = cords[1]/scale;
            elipse_json_template.y1 = 1;
            render();
        }
        if (draw_tool_polyline == true && draw_tool_on == true && is_poly_down == false){
            is_poly_down = true;
            var scale = grid_scale/init_scale;
            var cords = get_cords(e);
            poly_json_template.x = cords[0]/scale
            poly_json_template.y = cords[1]/scale;
            poly_json_template.arrayofpoints.push({x:0,y:0});
            render();
        }
        if(draw_tool_on == true && draw_tool_polyline == true && is_poly_down == true){
            //console.log("2");
            var cords = get_cords(e);
            var scale = grid_scale/init_scale;
            poly_json_template.arrayofpoints.push({x:((cords[0]/scale) -poly_json_template.x),y:(cords[1]/scale)-poly_json_template.y});
            render();
        }
        if(draw_tool_text == true && draw_tool_on == true && is_text_down == false){
            //console.log("hi");
            var cords = get_cords(e);
            var scale = grid_scale/init_scale;
            is_text_down = true;
            text_json_template.x = cords[0]/scale;
            text_json_template.y = cords[1]/scale;
            document.getElementById("input_box_textarea").style.display = "block";
        }else if(draw_tool_text == true && draw_tool_on == true && is_text_down == true){
            is_text_down = false;
            text_json_template.value = document.getElementById("input_box_textarea").value;
            document.getElementById("input_box_textarea").style.display = "none";
            document.getElementById("input_box_textarea").value = "";
            add_to_render_queue(text_json_template);
            json_reset_text();
            render();
        }
        if(pointer_tool_on == true){
            var cords = get_cords(e);
            var scale = grid_scale/init_scale;
            var temp_selected_element = select_canvas_element(cords[0],cords[1]);
            if (temp_selected_element != undefined){
                //console.log(temp_selected_element[0]);
                if(temp_selected_element == "rotation"){
                    selected_rotate = true;
                }else if(temp_selected_element == "tr"){
                    select_tr = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "east"){
                    select_east = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "west"){
                    select_west = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "south"){
                    select_south = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "north"){
                    select_north = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "tl"){
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                    select_tl = true;
                }else if(temp_selected_element == "br"){
                    select_br = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }else if(temp_selected_element == "bl"){
                    select_bl = true;
                    temp_stretch_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
                }
                else{
                    start_select_x = cords[0]/scale;
                    start_select_y = cords[1]/scale;
                    queue_pos = temp_selected_element[1];
                    // If clicked element is already part of a multi-selection, keep the selection
                    if(selected_indices && selected_indices.length > 0 && selected_indices.indexOf(queue_pos) !== -1){
                        is_selected = true;
                        is_select_move = true;
                    }else{
                        // single selection replace previous selection
                        selected_indices = [queue_pos];
                        is_selected = true;
                        is_select_move = true;
                    }
                    render();
                }
            }else{
                // Start marquee multi-select
                clear_selection();
                is_multi_select = true;
                var pos = get_cords(e);
                multi_select_start_x = pos[0]/scale;
                multi_select_start_y = pos[1]/scale;
                multi_select_end_x = multi_select_start_x;
                multi_select_end_y = multi_select_start_y;
                render();
            }
        }
    }
}
function mouse_move(e){
    if ((is_dragging_drag == true)){
        //var cur_x = e.offsetX;
        //var cur_y = e.offsetY;
        //canvas_warpper.scrollBy(Math.floor((cur_x-pan_start_x)*(-1)),Math.floor((cur_y-pan_start_y)*(-1)));
        //pan_start_x = cur_x;
        //pan_start_y = cur_y;
        var deltax = e.pageX - pan_start_x;
        var deltay = e.pageY - pan_start_y;
        canvas_warpper.scrollBy(deltax*-1,deltay*-1);
        pan_start_x = e.pageX;
        pan_start_y = e.pageY;
    }
    if (is_ruler_down == true){
        var scale = grid_scale/init_scale;
        var pos = get_cords(e);
        ruler_pointers.x = pos[0]/scale;
        ruler_pointers.y = pos[1]/scale;
        //clear_canvas_ruler();
        //ruler_draw();
        render();
    }
    // marquee multi-select drag
    if(is_multi_select == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        multi_select_end_x = pos[0]/scale;
        multi_select_end_y = pos[1]/scale;
        render();
        return;
    }
    if (is_pen_down == true && draw_tool_freehand == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var tempy = ((pos[1])/scale)-pen_json_template.y;
        var tempx = (pos[0]/scale) -pen_json_template.x;
        pen_json_template.pen_array.push({x:tempx,y:tempy});
        render();
        //render_pen(pen_json_template);
    }
    if (is_rect_down == true && draw_tool_squaredraw == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var tempx = pos[0]/scale - (rect_json_template.x);
        var tempy = pos[1]/scale - (rect_json_template.y);
        rect_json_template.x1 = tempx;
        rect_json_template.y1 = tempy;
        //console.log(rect_json_template);
        render();
        //render_rect(rect_json_template);
    }
    if(is_elipse_down == true && draw_tool_circledraw == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var tempx = (pos[0]/scale) - (elipse_json_template.x);
        var tempy = (pos[1]/scale) - (elipse_json_template.y);
        elipse_json_template.x1 = tempx;
        elipse_json_template.y1 = tempy;
        render();
    }
    if(pointer_tool_on == true && is_selected == true && is_select_move == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var tempx = (pos[0]/scale) -start_select_x;
        var tempy = (pos[1]/scale) -start_select_y;
        start_select_x = pos[0]/scale;
        start_select_y = pos[1]/scale;
        // If multiple indices are selected, move them all
        if(selected_indices && selected_indices.length > 1){
            for(var si=0;si<selected_indices.length;si++){
                var idx = selected_indices[si];
                var temp_element = JSON.parse(JSON.stringify(render_queue[idx]));
                temp_element.x += tempx;
                temp_element.y += tempy;
                if(temp_element.bbox){
                    temp_element.bbox.x += tempx;
                    temp_element.bbox.y += tempy;
                }
                render_queue[idx] = temp_element;
            }
        }else{
            var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
            temp_element.x += tempx;
            temp_element.y += tempy;
            temp_element.bbox.x +=tempx;
            temp_element.bbox.y +=tempy;
            render_queue[queue_pos] = temp_element;
        }
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && selected_rotate == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var midx = (temp_element.bbox.x + (temp_element.bbox.width*temp_element.scalee)/2)*scale;
        var midy = (temp_element.bbox.y + (temp_element.bbox.height*temp_element.scalen)/2)*scale;
        var deltax = (pos[0] - midx);
        var deltay = (pos[1] -midy);
        var tempangle = -((Math.atan2(deltax,deltay)) + (Math.PI)); 
        temp_element.angle = tempangle;
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_east == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxw = temp_stretch_element.bbox.width;
        var tempright = initbboxx + initbboxw*temp_element.scalee;
        var deltax = pos[0]/scale - initbboxx;
        var tempscale;
        if(deltax<=0){
            tempscale = (deltax/initbboxw);
            tempscale = math.abs(tempscale);
            temp_element.scalee = tempscale;
            if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }else if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }
            temp_element.bbox.x = (initbboxx + deltax);
            var deltaxtop = (temp_stretch_element.x - initbboxx);
            temp_element.x = (initbboxx + deltax + deltaxtop);
        }else{
            temp_element.bbox.x = initbboxx;
            var deltaxtop = (temp_stretch_element.x - initbboxx); /// keeps it from jumping around
            temp_element.x = (initbboxx +deltaxtop);
            tempscale = (deltax/initbboxw);
            temp_element.scalee = tempscale;
            temp_element.flipx = temp_stretch_element.flipx;
        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_west == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxw = temp_stretch_element.bbox.width;
        var tempright = initbboxx + initbboxw*temp_stretch_element.scalee;
        var deltax = (pos[0]/scale - tempright);
        if(deltax<=0){
            temp_element.bbox.x = (tempright+deltax);
            tempscale = math.abs(deltax/initbboxw);
            temp_element.scalee =  math.abs(deltax/initbboxw);
            var deltaxtop = (temp_stretch_element.x - initbboxx);
            temp_element.x =(tempright + deltax + deltaxtop)
            temp_element.flipx = temp_stretch_element.flipx;
        }else{
            tempscale = math.abs(deltax/initbboxw);
            temp_element.scalee =  math.abs(deltax/initbboxw);
            if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }else if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }
            temp_element.bbox.x = tempright;
            var deltaxtop = (temp_stretch_element.x - initbboxx); /// keeps it from jumping around
            temp_element.x = (tempright +deltaxtop);
        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_south == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempbottom = initbboxy + initbboxh*temp_stretch_element.scalen;
        var deltay = (pos[1]/scale -initbboxy);
        var tempscale;
        if(deltay<=0){
            tempscale = (deltay/initbboxh);
            tempscale = math.abs(tempscale);
            temp_element.bbox.y = (pos[1]/scale);
            temp_element.scalen = tempscale;
            var deltaytop = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.y = (initbboxy + deltaytop + deltay); ///prevent movement
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
        }else{
            temp_element.bbox.y = initbboxy;
            var deltaytop = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.y = (deltaytop + initbboxy);
            temp_element.flipy = temp_stretch_element.flipy;
            tempscale = (deltay/initbboxh);
            tempscale = math.abs(tempscale);
            temp_element.scalen = tempscale;
        }
        //console.log(tempscale);
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_north == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempbottom = initbboxy + initbboxh*temp_stretch_element.scalen;
        var deltay = (pos[1]/scale -tempbottom);
        var tempscale;
        if(deltay<=0){
            tempscale = math.abs(deltay/initbboxh);
            temp_element.bbox.y = (tempbottom+deltay);
            temp_element.scalen = tempscale;
            var deltaytop = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.y = (deltaytop+deltay+tempbottom);
            temp_element.flipy = temp_stretch_element.flipy;
        }else{
            tempscale = math.abs(deltay/initbboxh);
            temp_element.scalen = tempscale;
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
            temp_element.bbox.y = tempbottom;
            var deltaytop = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.y = (tempbottom +deltaytop); ///stops from jumping around
        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update()
    }else if(pointer_tool_on == true && is_selected == true && select_tl == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxw = temp_stretch_element.bbox.width;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempright = initbboxx+initbboxw*temp_stretch_element.scalee;
        var tempbottom = initbboxy+initbboxh*temp_stretch_element.scalen;
        var deltax = (pos[0]/scale - tempright);
        var deltay = (pos[1]/scale - tempbottom);
        var tlvector = [initbboxx - tempright,initbboxy- tempbottom];
        var componentin_tlvector = (math.dot([deltax,deltay],tlvector));
        componentin_tlvector = math.multiply(componentin_tlvector,1/((math.hypot(tlvector))**2));
        componentin_tlvector = math.multiply(componentin_tlvector,tlvector);
        //console.log(componentin_tlvector);
        var hypot = math.hypot(tlvector);
        var finalcomp = (math.hypot(componentin_tlvector))/hypot;
        if(componentin_tlvector[0]<=0){
            //console.log(temp_stretch_element.scalee);
            var scalex = finalcomp*temp_stretch_element.scalee;
            var scaley = finalcomp*temp_stretch_element.scalen;
            var newtlx = tempright - (scalex*initbboxw);
            var newtly = tempbottom - (scaley*initbboxh);
            temp_element.bbox.x = newtlx;
            temp_element.bbox.y = newtly;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.x = newtlx+deltatopx;
            temp_element.y = newtly+deltatopy;
            temp_element.flipx = temp_stretch_element.flipx;
            temp_element.flipy = temp_stretch_element.flipy;
        }else if(componentin_tlvector[0]>=0){
            var scalex = finalcomp*temp_stretch_element.scalee;
            var scaley = finalcomp*temp_stretch_element.scalen;
            temp_element.bbox.x = tempright;
            temp_element.bbox.y = tempbottom;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.x = tempright+deltatopx;
            temp_element.y = tempbottom+deltatopy;
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
            if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }else if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }

        }
        //console.log(componentin_tlvector);
        //console.log(finalcomp);
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_br == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxw = temp_stretch_element.bbox.width;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempright = initbboxx+initbboxw*temp_stretch_element.scalee;
        var tempbottom = initbboxy+initbboxh*temp_stretch_element.scalen;
        var deltax = (pos[0]/scale - initbboxx);
        var deltay = (pos[1]/scale - initbboxy);
        var tlvector = [tempright -initbboxx,tempbottom-initbboxy];
        var componentin_tlvector = (math.dot([deltax,deltay],tlvector));
        componentin_tlvector = math.multiply(componentin_tlvector,1/((math.hypot(tlvector))**2));
        componentin_tlvector = math.multiply(componentin_tlvector,tlvector);
        //console.log(componentin_tlvector);
        var hypot = math.hypot(tlvector);
        var finalcomp = (math.hypot(componentin_tlvector))/hypot;
        if(componentin_tlvector[0]>=0){
            temp_element.bbox.x = initbboxx;
            temp_element.bbox.y = initbboxy;
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.x = initbboxx+deltatopx;
            temp_element.y = initbboxy+deltatopy;
            temp_element.flipx = temp_stretch_element.flipx;
            temp_element.flipy = temp_stretch_element.flipy;
            temp_element.scalee = temp_stretch_element.scalee*finalcomp;
            temp_element.scalen = temp_stretch_element.scalen*finalcomp;
        }else if(componentin_tlvector[0]<0){
            var scalex = finalcomp*temp_stretch_element.scalee;
            var scaley = finalcomp*temp_stretch_element.scalen;
            var newtlx = initbboxx - (scalex*initbboxw);
            var newtly = initbboxy - (scaley*initbboxh);
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
            if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }else if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            temp_element.bbox.x = newtlx;
            temp_element.bbox.y = newtly;
            temp_element.x = newtlx+deltatopx;
            temp_element.y = newtly+deltatopy;
            console.log(scalex,scaley);
        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_tr == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxw = temp_stretch_element.bbox.width;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempright = initbboxx+initbboxw*temp_stretch_element.scalee;
        var tempbottom = initbboxy+initbboxh*temp_stretch_element.scalen;
        var deltax = (pos[0]/scale - initbboxx);
        var deltay = (pos[1]/scale - tempbottom);
        var tlvector = [tempright -initbboxx,initbboxy-tempbottom];
        var componentin_tlvector = (math.dot([deltax,deltay],tlvector));
        componentin_tlvector = math.multiply(componentin_tlvector,1/((math.hypot(tlvector))**2));
        componentin_tlvector = math.multiply(componentin_tlvector,tlvector);
        //console.log(componentin_tlvector);
        var hypot = math.hypot(tlvector);
        var finalcomp = (math.hypot(componentin_tlvector))/hypot;
        if(componentin_tlvector[0]>=0){
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.bbox.x = initbboxx;
            temp_element.x = initbboxx+deltatopx;
            var scalex = temp_stretch_element.scalee*finalcomp;
            var scaley = temp_stretch_element.scalen*finalcomp;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var newtly = (tempbottom-scaley*initbboxh);
            temp_element.bbox.y = newtly;
            temp_element.y = newtly+deltatopy;
            temp_element.flipx = temp_stretch_element.flipx;
            temp_element.flipy = temp_stretch_element.flipy;
        }else if(componentin_tlvector[0]<0){
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.bbox.y = tempbottom;
            temp_element.y = tempbottom+deltatopy;
            var scalex = temp_stretch_element.scalee*finalcomp;
            var scaley = temp_stretch_element.scalen*finalcomp;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var newtlx = initbboxx-scalex*initbboxw;
            temp_element.bbox.x = newtlx;
            temp_element.x = newtlx+deltatopx;
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
            if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }else if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }

        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }else if(pointer_tool_on == true && is_selected == true && select_bl == true){
        var pos = get_cords(e);
        var scale = grid_scale/init_scale;
        var temp_element = JSON.parse(JSON.stringify(render_queue[queue_pos]));
        var initbboxx = temp_stretch_element.bbox.x;
        var initbboxy = temp_stretch_element.bbox.y;
        var initbboxw = temp_stretch_element.bbox.width;
        var initbboxh = temp_stretch_element.bbox.height;
        var tempright = initbboxx+initbboxw*temp_stretch_element.scalee;
        var tempbottom = initbboxy+initbboxh*temp_stretch_element.scalen;
        var deltax = (pos[0]/scale - tempright);
        var deltay = (pos[1]/scale - initbboxy);
        var tlvector = [initbboxx-tempright,tempbottom-initbboxy];
        var componentin_tlvector = (math.dot([deltax,deltay],tlvector));
        componentin_tlvector = math.multiply(componentin_tlvector,1/((math.hypot(tlvector))**2));
        componentin_tlvector = math.multiply(componentin_tlvector,tlvector);
        //console.log(componentin_tlvector);
        var hypot = math.hypot(tlvector);
        var finalcomp = (math.hypot(componentin_tlvector))/hypot;
        if(componentin_tlvector[0]<=0){
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.bbox.y = initbboxy;
            temp_element.y = initbboxy+deltatopy;
            var scalex = temp_stretch_element.scalee*finalcomp;
            var scaley = temp_stretch_element.scalen*finalcomp;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var newtlx = (tempright - scalex*initbboxw);
            temp_element.bbox.x = newtlx;
            temp_element.x = newtlx+deltatopx;
            temp_element.flipx = temp_stretch_element.flipx;
            temp_element.flipy = temp_stretch_element.flipy;
        }else if(componentin_tlvector[0]>0){
            var deltatopx = (temp_stretch_element.x - temp_stretch_element.bbox.x);
            var deltatopy = (temp_stretch_element.y - temp_stretch_element.bbox.y);
            temp_element.bbox.x = tempright;
            temp_element.x = tempright+deltatopx;
            var scalex = temp_stretch_element.scalee*finalcomp;
            var scaley = temp_stretch_element.scalen*finalcomp;
            temp_element.scalee = scalex;
            temp_element.scalen = scaley;
            var newtly = (initbboxy-scaley*initbboxh);
            temp_element.bbox.y = newtly;
            temp_element.y = newtly+deltatopy;
            if(temp_stretch_element.flipy == true){
                temp_element.flipy = false;
            }else if(temp_stretch_element.flipy == false){
                temp_element.flipy = true;
            }
            if(temp_stretch_element.flipx == true){
                temp_element.flipx = false;
            }else if(temp_stretch_element.flipx == false){
                temp_element.flipx = true;
            }
        }
        render_queue[queue_pos] = temp_element;
        render();
        send_board_update();
    }
}
function canvas_keydown(e){
    var key_which_is_down = e.keyCode;
    //console.log(key_which_is_down);
    if(is_selected == true && key_which_is_down == "8" ){
        if(selected_indices && selected_indices.length > 1){
            var toRemove = selected_indices.slice().sort(function(a,b){return b-a});
            for(var ri=0;ri<toRemove.length;ri++){
                remove_element_from_queue(toRemove[ri]);
            }
        }else{
            remove_element_from_queue(queue_pos);
        }
        reset_selection();
        render();
        try{ send_board_update(); }catch(e){}
    }
    if(e.key == "c" && e.ctrlKey == true){
        if(is_selected == true){
            copy_element_store = render_queue[queue_pos];
        }
    }else if(e.key == "v" && e.ctrlKey == true){
        if(copy_element_store == undefined){
        }else{
            copy_element();
        }
    }else if(e.key == "W" && e.shiftKey == true){
        if(is_selected == true){
            moveToTopQueue();
        }
    }else if(e.key == "S" && e.shiftKey == true){
        if(is_selected == true){
            moveToBotQueue();
        }
    }

}
//////////////////////////////////////////
///ruler pointer
function get_cords(e){
    var x = e.offsetX;
    var y = e.offsetY;
    var x = (x).toFixed(8);
    var y = (y).toFixed(8);
    x = Number(x);
    y = Number(y);
    return([x,y]);
}

////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////
//////Zoom
function zoom(e){
    e.preventDefault();
    var scroll_x = (canvas_warpper.scrollLeft);
    var scroll_y = (canvas_warpper.scrollTop);
    var canv_h = canvas.height;
    var canv_w = canvas.width;
    var canv_block_x = canvas_warpper.scrollWidth;
    var canv_block_y = canvas_warpper.scrollHeight;
    var viewport_width = parseInt(window.getComputedStyle(canvas_warpper,null).getPropertyValue("width"));
    var viewport_height = parseInt(window.getComputedStyle(canvas_warpper,null).getPropertyValue("height"));
    var y = e.deltaY * -0.025
    if(y>0){
        grid_scale*=1.05;
    }else{
        grid_scale*=1/1.05;
    }
    grid_scale = ((Math.round(grid_scale*10))/10);
    if(grid_scale >= (init_scale*5)){
        grid_scale = (init_scale*5);
    }
    if(grid_scale <= (10)){
        grid_scale = 10;
    }
    var mid_point_x = ((scroll_x)+((viewport_width)/2));
    var mid_point_y = ((scroll_y)+((viewport_height)/2));
    var mid_ratio_x =  mid_point_x/canv_block_x;
    var mid_ratio_y = mid_point_y/canv_block_y;
    render();
    var new_block_width = canvas_warpper.scrollWidth;
    var new_block_height = canvas_warpper.scrollHeight;
    var new_scroll_x = (((mid_ratio_x*new_block_width)-(viewport_width/2)));
    var new_scroll_y = ((mid_ratio_y*new_block_height)-(viewport_height/2));
    canvas_warpper.scrollTo((new_scroll_x),(new_scroll_y));
}
//Canvas generator
/// gird
var grid_x = 15;
var grid_y = 15;
var init_scale = 50;
var grid_scale = init_scale;
function canv_init(){
    canvas.width = (grid_x)*grid_scale;
    canvas.height = (grid_y)*grid_scale;
}
function generateGrid(){
    canv_init();
    ctx.save();
    var xco = 0;
    var yco = 0;
    for(var i = 0;i<=grid_x;i++){
        ctx.beginPath();
        xco = i*grid_scale;
        ctx.moveTo(xco,0);
        ctx.lineTo((xco),canvas.height);
        ctx.strokeStyle = "#DCDCDC";
        ctx.stroke();
    }
    for(var i = 0;i<=grid_y;i++){
        ctx.beginPath();
        yco = i*grid_scale;
        ctx.moveTo(0,yco);
        ctx.lineTo((canvas.width),yco);
        ctx.stroke();
    }
    ctx.restore();
}
function get_scale(){
    return(grid_scale/init_scale);
}
function render_queue_execute(){
    //console.log(render_queue);
    if(render_queue.length <= 0){
        return;
    }
    for(l=0;l<(render_queue.length);l++){
        var temp_type = (render_queue[l]).type;
        //console.log(temp_type);
        switch(temp_type){
            case "rect":
                render_rect(render_queue[l],ctx);
                //render_bbox(render_queue[l]);
                break;
            case "pen":
                render_pen(render_queue[l],ctx);
                //render_bbox(render_queue[l]);
                break;
            case "ellipse":
                render_elipse(render_queue[l],ctx);
                //render_bbox(render_queue[l]);
                break;
            case "poly":
                render_poly(render_queue[l],ctx);
                //render_bbox(render_queue[l]);
                break;
            case "text":
                render_text(render_queue[l],ctx);
                //render_bbox(render_queue[l]);
                break;
            case "img":
                render_img(render_queue[l],ctx);
                break;
        }
    }
    if(is_selected == true){
        render_bbox(render_queue[queue_pos]);
    }
}
function render(){
    generateGrid();
    render_queue_execute();
    render_pen(pen_json_template,ctx);
    render_rect(rect_json_template,ctx);
    render_elipse(elipse_json_template,ctx);
    render_poly(poly_json_template,ctx);
    ruler_draw();
    //select_canvas_element();
    // draw marquee or group bbox overlays
    var scale = grid_scale/init_scale;
    if(is_multi_select == true){
        var sx = Math.min(multi_select_start_x, multi_select_end_x);
        var sy = Math.min(multi_select_start_y, multi_select_end_y);
        var sw = Math.abs(multi_select_end_x - multi_select_start_x);
        var sh = Math.abs(multi_select_end_y - multi_select_start_y);
        ctx.save();
        ctx.setLineDash([6,4]);
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(sx*scale, sy*scale, sw*scale, sh*scale);
        ctx.setLineDash([]);
        ctx.restore();
    }else if(selected_indices && selected_indices.length > 0){
        var gb = compute_group_bbox(selected_indices);
        if(gb){
            ctx.save();
            ctx.setLineDash([6,4]);
            ctx.strokeStyle = '#00ccff';
            ctx.lineWidth = 2 * scale;
            ctx.strokeRect(gb.x*scale, gb.y*scale, gb.width*scale, gb.height*scale);
            ctx.setLineDash([]);
            ctx.restore();
        }
    }
}