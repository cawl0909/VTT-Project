var ghost_canvas = document.createElement("canvas");
var ghost_ctx = ghost_canvas.getContext("2d");
var selected_element;
var is_selected = false;
var is_select_move = false;
var is_pointer_down = false;
var queue_pos;
var start_select_x;
var start_select_y;

// Multi-select / marquee selection state
var selected_indices = []; // indices in render_queue
var is_multi_select = false;
var multi_select_start_x = 0;
var multi_select_start_y = 0;
var multi_select_end_x = 0;
var multi_select_end_y = 0;
function select_canvas_element(x,y){
    ghost_canvas.width = canvas.width;
    ghost_canvas.height = canvas.height;
    var scale = grid_scale/init_scale;
    var tempx = x;
    var tempy = y;
    var temp_selected;
    for(l=(render_queue.length)-1;l>=0;l--){
        render_to_ghost_canvas(render_queue[l]);
        var render_image_data = ghost_ctx.getImageData(tempx,tempy,1,1).data;
        var render_image_data_color = (`rgba(${render_image_data[0]},${render_image_data[1]},${render_image_data[2]},${render_image_data[3]})`);
        if(render_image_data_color == "rgba(0,0,0,255)"){
            temp_selected = [render_queue[l],l];
            break;
        }else if(render_image_data_color == "rgba(1,1,1,255)"){
            return("tl");
            break;
        }else if(render_image_data_color == "rgba(2,2,2,255)"){
            return("north");
            break;
        }else if(render_image_data_color == "rgba(3,3,3,255)"){
            return("tr");
            break;
        }else if(render_image_data_color == "rgba(4,4,4,255)"){
            return("east");
            break;
        }else if(render_image_data_color == "rgba(5,5,5,255)"){
            return("br");
            break;
        }else if(render_image_data_color == "rgba(6,6,6,255)"){
            return("south");
            break;
        }else if(render_image_data_color == "rgba(7,7,7,255)"){
            return("bl");
            break;
        }else if(render_image_data_color == "rgba(8,8,8,255)"){
            return("west");
            break;
        }else if(render_image_data_color == "rgba(9,9,9,255)"){
            return("rotation");
            break;
        }
    }
    return(temp_selected);
}
function reset_ghost_canvas(){
    ghost_ctx.clearRect(0,0,canvas.width,canvas.height);
}
function clear_selection(){
    selected_indices = [];
    is_selected = false;
    is_select_move = false;
    is_multi_select = false;
}
function render_as_black(input_element){
    var input_element_dupe = JSON.parse(JSON.stringify(input_element));
    input_element_dupe.color = "rgba(0,0,0,255)";
    if(input_element_dupe.fill_color == "rgba(255,255,255,0)"){
    }else{
        input_element_dupe.fill_color = "rgba(0,0,0,255)";
    }
    return(input_element_dupe);
}
function render_to_ghost_canvas(input_element_render){
    var element_type_ghost = render_as_black(input_element_render);
    //console.log(element_type_ghost);
    //render_rect(element_type_ghost,ctx);
    //console.log(element_type_ghost);
    var temp_element_type = element_type_ghost.type;
    switch(temp_element_type){
        case "rect":
            render_rect(element_type_ghost,ghost_ctx);
            break;
        case "pen":
            render_pen(element_type_ghost,ghost_ctx);
            break;
        case "text":
            render_text(element_type_ghost,ghost_ctx);
            break;
        case "poly":
            render_poly(element_type_ghost,ghost_ctx);
            break;
        case "ellipse":
            render_elipse(element_type_ghost,ghost_ctx);
            break;
        case "img":
            render_ghost_img(element_type_ghost,ghost_ctx);
            break;
    }
    if(is_selected == true){
        render_ghost_element_options(render_queue[queue_pos]);
    }
    //document.getElementById("canvas-wrapper").appendChild(ghost_canvas);
}
/////render_bbox_ghost
function render_ghost_element_options(ghost_element){
    ghost_ctx.save();
    var scale = grid_scale/init_scale;
    var tlx = ghost_element.bbox.x*scale;
    var tly = ghost_element.bbox.y*scale;
    var brw = ghost_element.bbox.width*scale*ghost_element.scalee;
    var brh = ghost_element.bbox.height*scale*ghost_element.scalen;
    var tempmatrix = angle_matrix(ghost_element);
    tempmatrix = (tempmatrix._data);
    ghost_ctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    var sqr_width = 8*scale;
    ghost_ctx.fillStyle = "rgba(1,1,1,255)";
    ghost_ctx.fillRect(tlx-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width); //topleft anchor
    ghost_ctx.fillStyle = "rgba(2,2,2,255)";
    ghost_ctx.fillRect(tlx+(brw/2)-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width);//north anchor
    ghost_ctx.fillStyle = "rgba(3,3,3,255)";
    ghost_ctx.fillRect(tlx+brw-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width);//topright anchor
    ghost_ctx.fillStyle = "rgba(4,4,4,255)";
    ghost_ctx.fillRect(tlx+brw-sqr_width/2,tly+(brh/2)-sqr_width/2,sqr_width,sqr_width);//east anchor
    ghost_ctx.fillStyle = "rgba(5,5,5,255)";
    ghost_ctx.fillRect(tlx+brw-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width); // botright anchor
    ghost_ctx.fillStyle = "rgba(6,6,6,255)";
    ghost_ctx.fillRect(tlx+(brw/2)-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width);//south anchor
    ghost_ctx.fillStyle = "rgba(7,7,7,255)";
    ghost_ctx.fillRect(tlx-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width); //bottom left
    ghost_ctx.fillStyle = "rgba(8,8,8,255)";
    ghost_ctx.fillRect(tlx-sqr_width/2,tly+(brh/2)-sqr_width/2,sqr_width,sqr_width);//west anchor
    ///rotate anchor
    ghost_ctx.beginPath();
    ghost_ctx.arc(tlx+brw/2,tly-20*scale,5*scale,0,2*Math.PI);
    ghost_ctx.fillStyle = "rgba(9,9,9,255)";
    ghost_ctx.fill();
    //console.log("hi");
    ghost_ctx.restore();
}

// compute bounding box for a set of indices in render_queue (returns {x,y,width,height})
function compute_group_bbox(indices){
    if(!indices || indices.length == 0) return null;
    var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for(var i=0;i<indices.length;i++){
        var el = render_queue[indices[i]];
        if(!el || !el.bbox) continue;
        var bx = el.bbox.x;
        var by = el.bbox.y;
        var bw = el.bbox.width * (el.scalee || 1);
        var bh = el.bbox.height * (el.scalen || 1);
        minx = Math.min(minx, bx);
        miny = Math.min(miny, by);
        maxx = Math.max(maxx, bx + bw);
        maxy = Math.max(maxy, by + bh);
    }
    if(minx === Infinity) return null;
    return {x:minx, y:miny, width: (maxx-minx), height: (maxy-miny)};
}

function render_group_bbox(indices){
    var bbox = compute_group_bbox(indices);
    if(!bbox) return;
    ghost_ctx.save();
    var scale = grid_scale/init_scale;
    ghost_ctx.setLineDash([6,4]);
    ghost_ctx.strokeStyle = '#00ccff';
    ghost_ctx.lineWidth = 2 * scale;
    ghost_ctx.strokeRect(bbox.x*scale, bbox.y*scale, bbox.width*scale, bbox.height*scale);
    ghost_ctx.setLineDash([]);
    ghost_ctx.restore();
}
///////
function render_ghost_img(imginp,tempctx){
    tempctx.save();
    var scale = grid_scale/init_scale;
    if(imginp.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(imginp);
        tempmatrix = (tempmatrix._data);
        tempctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    tempctx.fillRect(imginp.x*scale,imginp.y*scale,imginp.width*scale,imginp.height*scale);
    tempctx.restore();
}
/// rotate element
var selected_rotate = false;
////reset_select
function reset_selection(){
    clear_selection();
    render();
}
//delete
function remove_element_from_queue(pos){
    var temp_render_queue = render_queue;
    temp_render_queue.splice(pos,1);
    render_queue = temp_render_queue;
    try{ send_board_update(); }catch(e){}
} 
///// Copy Paste
var copy_element_store;
function copy_element(){
    var rand_id = (Math.floor((Math.random())*100000000000000));
    var final_copy = JSON.parse(JSON.stringify(copy_element_store));
    final_copy.id = rand_id;
    render_queue.push(final_copy);
    render();
    try{ send_board_update(); }catch(e){}
} 
//////////////Move up in queue
function moveToTopQueue(){
    var temp_element = render_queue[queue_pos];
    var temp_render_array =  JSON.parse(JSON.stringify(render_queue));
    temp_render_array.splice(queue_pos,1);
    temp_render_array.push(temp_element);
    render_queue = temp_render_array;
    queue_pos = (temp_render_array.length-1);
    render();
    try{ send_board_update(); }catch(e){}
} 
//////Move bot queue
function moveToBotQueue(){
    var temp_element = render_queue[queue_pos];
    var temp_render_array =  JSON.parse(JSON.stringify(render_queue));
    temp_render_array.splice(queue_pos,1);
    temp_render_array.unshift(temp_element);
    render_queue = temp_render_array;
    queue_pos = 0;
    render();
    try{ send_board_update(); }catch(e){}
} 
///// stretch element
var select_tr =false;
var select_east = false;
var select_west = false;
var select_south = false;
var select_north = false;
var select_tl = false;
var select_br = false;
var select_bl = false;
var temp_stretch_element;

