var pen_width_box = document.getElementById("width");
var color_picker_1 = document.getElementById("color_picker");
var color_picker_2 = document.getElementById("color_picker2");
var trans_radio = document.getElementById("radio_trans");
pen_width_box.value = "1";
pen_width_box.addEventListener('input',(e)=>{
    var pen_width_value_num = Number(pen_width_box.value);
    if(pen_width_value_num > 250){
        pen_width_box.value = "250";
    }
    pen_json_template.pen_size = pen_width_value_num;
    rect_json_template.size = pen_width_value_num;
    elipse_json_template.size = pen_width_value_num;
    poly_json_template.size = pen_width_value_num;
    text_json_template.size = pen_width_value_num;
});
color_picker_1.addEventListener('input',(e)=>{
    var color_value = color_picker_1.value;
    pen_json_template.color = color_value;
    rect_json_template.color = color_value;
    elipse_json_template.color = color_value;
    poly_json_template.color = color_value;
    text_json_template.color = color_value;
});
color_picker_2.addEventListener('input',(e)=>{
    var color_value = color_picker_2.value;
    if(trans_radio.checked == true){
        rect_json_template.fill_color = "rgba(255,255,255,0)";
        pen_json_template.fill_color = "rgba(255,255,255,0)";
        elipse_json_template.fill_color = "rgba(255,255,255,0)";
        poly_json_template.fill_color = "rgba(255,255,255,0)";
    }else{
        rect_json_template.fill_color = color_value;
        pen_json_template.fill_color = color_value;
        elipse_json_template.fill_color = color_value;
        poly_json_template.fill_color = color_value;
    }
});
trans_radio.addEventListener("input",(e)=>{
    //console.log(trans_radio.checked);
    if(trans_radio.checked == true){
        rect_json_template.fill_color = "rgba(255,255,255,0)";
        pen_json_template.fill_color = "rgba(255,255,255,0)";
        elipse_json_template.fill_color = "rgba(255,255,255,0)";
        poly_json_template.fill_color = "rgba(255,255,255,0)";
    }else{
        rect_json_template.fill_color = (color_picker_2.value);
        pen_json_template.fill_color = (color_picker_2.value);
        elipse_json_template.fill_color = (color_picker_2.value);
        poly_json_template.fill_color = color_picker_2.value;
    }
});
var is_pen_down = false;
/////////////////////FREEHAND
var pen_json_template ={
    id:"",
    type:"pen",
    bbox:{},
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    x:0,
    y:0,
    fill_color:(check_if_transparent()),
    pen_array:[],
    pen_size:null,
    color:(color_picker_1.value)
}
function reset_pen_tempalte(){
    pen_json_template = {
        id:"",
        type:"pen",
        bbox:{},
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        x1:0,
        y1:0,
        fill_color:(check_if_transparent()),
        pen_array:[],
        pen_size:Number(pen_width_box.value),
        color:(color_picker_1.value)
    }
};
function render_pen(pen_input,inpctx){
    inpctx.save();
    inpctx.beginPath();
    if(pen_input.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(pen_input);
        //tempmatrix = math.multiply((scale_matrix(pen_input)),tempmatrix);
        tempmatrix = (tempmatrix._data);
        inpctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    var scale = (grid_scale/init_scale);
    var x_begin = (((pen_input).x)*scale);
    var y_begin = (((pen_input).y)*scale);
    inpctx.moveTo(x_begin,y_begin);
    for(i=0;i<(pen_input.pen_array.length);i++){
        var tempcurrent = pen_input.pen_array[i];
        inpctx.lineTo(((tempcurrent.x)*scale) + x_begin,((tempcurrent.y)*scale + y_begin));
    }
    inpctx.strokeStyle = pen_input.color;
    inpctx.lineWidth = ((pen_input.pen_size)*scale);
    inpctx.lineCap = "round";
    inpctx.lineJoin = "round";
    var fillcolor = (pen_input.fill_color);
    if (fillcolor == "rgba(255,255,255,0)"){
    }else{
        inpctx.fillStyle = fillcolor;
        inpctx.fill();
    }
    inpctx.stroke();
    inpctx.restore();
}
///////////////////////////////////////////////////////////////////////Rect draw
var is_rect_down = false;
var rect_json_template = {
    id:"",
    type:"rect",
    bbox:{},
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    x:0,
    y:0,
    x1:0,
    y1:0,
    color:(color_picker_1.value),
    fill_color:check_if_transparent(),
    size:Number(pen_width_box.value)
}
function reset_rect_json_template(){
    rect_json_template = {
        id:"",
        type:"rect",
        bbox:{},
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        x:0,
        y:0,
        x1:0,
        y1:0,
        color:(color_picker_1.value),
        fill_color:check_if_transparent(),
        size:Number(pen_width_box.value)
    }
}
function check_if_transparent(){
    if(trans_radio.checked == true){
        return("rgba(255,255,255,0)");
    }else{
        return(color_picker_2.value);
    }
}
function render_rect(rect_input, inpctx){
    inpctx.save();
    inpctx.beginPath();
    var scale = (grid_scale/init_scale);
    if(rect_input.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(rect_input);
        tempmatrix = (tempmatrix._data);
        inpctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    var topleft_tempx = scale*rect_input.x;
    var topleft_tempy = scale*rect_input.y;
    var tempwidth = scale*rect_input.x1;
    var tempheight = scale*rect_input.y1;
    inpctx.rect(topleft_tempx,topleft_tempy,tempwidth,tempheight);
    //console.log([topleft_tempx,topleft_tempy,tempwidth,tempheight]);
    inpctx.lineWidth = ((rect_input.size)*scale);
    inpctx.strokeStyle = rect_input.color;
    var tempfill = rect_input.fill_color;
    if(tempfill == "rgba(255,255,255,0)"){
    }else{
        inpctx.fillStyle = tempfill;
        inpctx.fill();
    }
    inpctx.stroke();
    inpctx.restore();
}

//////////////////////////////////////Circle Draw
var is_elipse_down = false;
var elipse_json_template = {
    id:"",
    type:"ellipse",
    bbox:{},
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    x:0,
    x1:0,
    y1:0,
    y:0,
    color:(color_picker_1.value),
    fill_color:check_if_transparent(),
    size:Number(pen_width_box.value)
};
function reset_elipse_template(){
    elipse_json_template = {
        id:"",
        type:"ellipse",
        bbox:{},
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        x1:0,
        y1:0,
        x:0,
        y:0,
        color:(color_picker_1.value),
        fill_color:check_if_transparent(),
        size:Number(pen_width_box.value)
    };
}

function render_elipse(elipse_input,inpctx){
    inpctx.save();
    inpctx.beginPath();
    var scale = (grid_scale/init_scale);
    if(elipse_input.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(elipse_input);
        tempmatrix = (tempmatrix._data);
        inpctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    var topleftx = (scale*(elipse_input.x));
    var toplefty = (scale*(elipse_input.y));
    var botrightx = (scale*(elipse_input.x1));
    var botrighty = (scale*(elipse_input.y1));
    var radius1 = ((botrightx)/2);
    var radius2 = ((botrighty)/2);
    var midx = topleftx+radius1;
    var midy = toplefty+radius2;
    inpctx.strokeStyle = elipse_input.color;
    inpctx.lineWidth = (elipse_input.size)*scale;
    var tempfill = elipse_input.fill_color;
    //console.log(tempfill);
    inpctx.ellipse(midx,midy,Math.abs(radius1),Math.abs(radius2),0,0,Math.PI*2);
    if(tempfill == "rgba(255,255,255,0)"){
        //console.log("hi");
    }else{
        inpctx.fillStyle = elipse_input.fill_color;
        inpctx.fill();
    }
    inpctx.stroke();
    inpctx.restore();
}

//////////////////////////////////////// Poly draw
var is_poly_down = false;
var poly_json_template = {
    id:"",
    type:"poly",
    bbox:{},
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    x:0,
    y:0,
    arrayofpoints:[],
    color:(color_picker_1.value),
    fill_color:check_if_transparent(),
    size:Number(pen_width_box.value)
};
function reset_poly_template(){
    poly_json_template ={
        id:"",
        type:"poly",
        bbox:{},
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        x:0,
        y:0,
        arrayofpoints:[],
        color:(color_picker_1.value),
        fill_color:check_if_transparent(),
        size:Number(pen_width_box.value)
    };
}
function render_poly(poly_input,inpctx){
    inpctx.save();
    inpctx.beginPath();
    var scale = (grid_scale/init_scale);
    if(poly_input.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(poly_input);
        tempmatrix = (tempmatrix._data);
        inpctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    var x_begin = (poly_input.x)*scale;
    var y_begin = (poly_input.y)*scale;
    inpctx.moveTo(x_begin,y_begin);
    for(i=0;i<poly_input.arrayofpoints.length;i++){
        var tempcurrent =  poly_input.arrayofpoints[i];
        inpctx.lineTo(((tempcurrent.x)*scale)+x_begin,((tempcurrent.y)*scale)+y_begin);
    }
    inpctx.strokeStyle = poly_input.color;
    inpctx.lineWidth = (poly_input.size)*scale;
    if(poly_input.fill_color == "rgba(255,255,255,0)"){
    }else{
        inpctx.fillStyle = poly_input.fill_color
        inpctx.fill();
    }
    //inpctx.lineJoin = "bevel";
    inpctx.stroke();
    inpctx.restore();
}
//////////////////////////////////// Text
var is_text_down = false;
var text_json_template = {
    id:"",
    type:"text",
    bbox:{},
    x:0,
    y:0,
    angle:0,
    scalen:1,
    scalee:1,
    flipx:false,
    flipy:false,
    value:"",
    fill_color:"",
    color:(color_picker_1.value),
    size:Number(pen_width_box.value)
}
function json_reset_text(){
    text_json_template = {
        id:"",
        type:"text",
        bbox:{},
        x:0,
        y:0,
        angle:0,
        scalen:1,
        scalee:1,
        flipx:false,
        flipy:false,
        value:"",
        fill_color:"",
        color:(color_picker_1.value),
        size:Number(pen_width_box.value)
    }
}
function render_text(text_input,inpctx){
    inpctx.save();
    var scale = (grid_scale/init_scale);
    if(text_input.bbox != undefined){
        var tempmatrix = rotate_about_centre_element(text_input);
        tempmatrix = (tempmatrix._data);
        inpctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    }
    if (text_input.color == "rgba(255,255,255,0)"){
    }else{
        inpctx.fillStyle = text_input.color;
    }
    var tempsize =  (text_input.size)*scale;
    inpctx.font = (String(tempsize)+"px sans-serif");
    inpctx.fillText((text_input.value),(text_input.x)*(scale),(text_input.y)*scale);
    inpctx.restore();
}
////Transfromation matrix about centre.
function rotate_about_centre_element(inputele){
    var scale = grid_scale/init_scale;
    var tempx = inputele.bbox.x*scale;
    var tempy = inputele.bbox.y*scale;
    var flipx = 1;
    var flipy = 1;
    if(inputele.flipx == true){
        flipx = -1;
    }
    if(inputele.flipy == true){
        flipy = -1;
    }
    var tempwidth = inputele.bbox.width*scale;
    var tempheight = inputele.bbox.height*scale;
    var midx = ((tempx + (tempwidth*inputele.scalee)/2));
    var midy = ((tempy + (tempheight*inputele.scalen)/2));
    ////scalex
    var translate1 = math.matrix([[1,0,-tempx],[0,1,-tempy-tempheight*inputele.scalen],[0,0,1]]);
    var scalematrix1 = math.matrix([[inputele.scalee*flipx,0,0],[0,1,0],[0,0,1]]);
    var finalmatrix = math.multiply(scalematrix1,translate1);
    var translateback1 = math.matrix([[1,0,tempx],[0,1,tempy+tempheight*inputele.scalen],[0,0,1]]);
    finalmatrix = math.multiply(translateback1,finalmatrix);
    if(flipx == -1){
        finalmatrix = math.multiply(math.matrix([[1,0,tempwidth*inputele.scalee],[0,1,0],[0,0,1]]),finalmatrix);
    }
    //////// scaley
    var transcaley = math.matrix([[1,0,-tempx],[0,1,-tempy],[0,0,1]]);
    var transcale2 = math.matrix([[1,0,0],[0,inputele.scalen*flipy,0],[0,0,1]]);
    var transcaley2 = math.matrix([[1,0,tempx],[0,1,tempy],[0,0,1]]);
    finalmatrix = math.multiply(transcaley,finalmatrix);
    finalmatrix = math.multiply(transcale2,finalmatrix);
    finalmatrix = math.multiply(transcaley2,finalmatrix);
    if(flipy == -1){
        finalmatrix = math.multiply(math.matrix([[1,0,0],[0,1,tempheight*inputele.scalen],[0,0,1]]),finalmatrix);
    }
    ////////angle matrix
    var angle = inputele.angle;
    var angletrans = math.matrix([[Math.cos(angle),-(Math.sin(angle)),0],[Math.sin(angle),Math.cos(angle),0],[0,0,1]]);
    var translate0 = math.matrix([[1,0,-midx],[0,1,-midy],[0,0,1]]);
    finalmatrix = math.multiply(translate0,finalmatrix);
    finalmatrix = math.multiply(angletrans,finalmatrix);
    var translateback = math.matrix([[1,0,midx],[0,1,midy],[0,0,1]]);
    finalmatrix = math.multiply(translateback,finalmatrix);
    return(finalmatrix);
}
function angle_matrix(inputele){
    var scale = grid_scale/init_scale;
    var tempx = inputele.bbox.x*scale;
    var tempy = inputele.bbox.y*scale;
    var tempwidth = inputele.bbox.width*scale;
    var tempheight = inputele.bbox.height*scale;
    var midx = ((tempx + tempwidth*inputele.scalee/2));
    var midy = ((tempy + tempheight*inputele.scalen/2));
    var translate0 = math.matrix([[1,0,-midx],[0,1,-midy],[0,0,1]]);
    var angle = inputele.angle;
    var angletrans = math.matrix([[Math.cos(angle),-(Math.sin(angle)),0],[Math.sin(angle),Math.cos(angle),0],[0,0,1]]);
    var translateback = math.matrix([[1,0,midx],[0,1,midy],[0,0,1]]);
    var finalmatrix = math.multiply(angletrans,translate0);
    finalmatrix = math.multiply(translateback,finalmatrix);
    return(finalmatrix);
}
function scale_matrix(x,y,h,w,inputele){
    var scale = grid_scale/init_scale;
    var tempx = x;
    var tempy = y;
    var flipx = 1;
    var flipy = 1;
    if(inputele.flipx == true){
        flipx = -1;
    }
    if(inputele.flipy == true){
        flipy = -1;
    }
    var tempwidth = w;
    var tempheight = h;
    var translate1 = math.matrix([[1,0,-tempx],[0,1,-tempy-tempheight],[0,0,1]]);
    var scalematrix1 = math.matrix([[inputele.scalee*flipx,0,0],[0,inputele.scalen*flipy,0],[0,0,1]]);
    var finalmatrix = math.multiply(scalematrix1,translate1);
    var translateback1 = math.matrix([[1,0,tempx],[0,1,tempy+tempheight],[0,0,1]]);
    finalmatrix = math.multiply(translateback1,finalmatrix);
    return(finalmatrix);
}
/////ADD to render queue 
function add_to_render_queue(inputele){
    inputele.bbox = create_bounding_box(inputele);
    var temp_json_to_add_to_queue = JSON.stringify(inputele);
    temp_json_to_add_to_queue = JSON.parse(temp_json_to_add_to_queue);
    var rand_id = (Math.floor((Math.random())*100000000000000)); // 14 digit random id
    temp_json_to_add_to_queue.id = rand_id;
    render_queue.push(temp_json_to_add_to_queue);
}
///Create bounding box 
function create_bounding_box(bbox_input){
    var bbox_x;
    var bbox_y;
    var bbox_w;
    var bbox_h;
    var bboxtype = bbox_input.type;
    switch(bboxtype){
        case "pen":
            var xarry = quicksort(bbox_input.pen_array.map(x=>x.x));
            var yarry = quicksort(bbox_input.pen_array.map(x=>x.y));
            var scale = grid_scale/init_scale;
            var size = (bbox_input.pen_size)*0.5;
            bbox_x = (xarry[0] + bbox_input.x) - size;
            bbox_y = (yarry[0] + bbox_input.y) - size;
            bbox_w = (xarry[xarry.length -1] - xarry[0]) + size*2;
            bbox_h = (yarry[yarry.length -1] - yarry[0]) + size*2;
            break;
        case "rect":
            var scale = grid_scale/init_scale;
            var size = (bbox_input.size);
            var temp;
            bbox_x = (bbox_input.x);
            bbox_y = (bbox_input.y)
            bbox_w = bbox_input.x1;
            bbox_h = bbox_input.y1;
            if(bbox_w<=0){
                bbox_x+=size/2;
                bbox_w-=size;
                bbox_x+=bbox_w;
                bbox_w = bbox_w*-1;
            }else{
                bbox_x-=size/2;
                bbox_w+=size;
            }
            if(bbox_h<=0){
                bbox_y+=size/2;
                bbox_h-=size;
                bbox_y+=bbox_h;
                bbox_h = bbox_h*-1;
            }else{
                bbox_y-=size/2;
                bbox_h+=size;
            }
            break;
        case "ellipse":
            var scale = grid_scale/init_scale;
            var size = (bbox_input.size);
            bbox_x = (bbox_input.x);
            bbox_y = (bbox_input.y);
            bbox_w = (bbox_input.x1); 
            bbox_h = (bbox_input.y1 );
            if(bbox_w<=0){
                bbox_x+=size/2;
                bbox_w-=size;
                bbox_x+=bbox_w;
                bbox_w = bbox_w*-1;
            }else{
                bbox_x-=size/2;
                bbox_w+=size;
            }
            if(bbox_h<=0){
                bbox_y+=size/2;
                bbox_h-=size;
                bbox_y+=bbox_h;
                bbox_h = bbox_h*-1;
            }else{
                bbox_y-=size/2;
                bbox_h+=size;
            }
            break;
        case "poly":
            var xarry = quicksort(bbox_input.arrayofpoints.map(x=>x.x));
            var yarry = quicksort(bbox_input.arrayofpoints.map(x=>x.y));
            var scale = grid_scale/init_scale;
            var size = (bbox_input.size)*0.5;
            bbox_x = (xarry[0] + bbox_input.x) - size;
            bbox_y = (yarry[0] + bbox_input.y) - size;
            bbox_w = (xarry[xarry.length -1] - xarry[0]) + size;
            bbox_h = (yarry[yarry.length -1] - yarry[0]) + size;
            break;
        case "text":
            var size = bbox_input.size;
            var scale = grid_scale/init_scale;
            ctx.save();
            var botleftx = bbox_input.x;
            var botlefty = bbox_input.y;
            ctx.font = (String(size*scale)+"px sans-serif");
            var measurement_of_text = ctx.measureText(bbox_input.value);
            var height_text = (size*scale)/scale;
            var width_text = measurement_of_text.width/scale;
            ctx.restore();
            bbox_x = bbox_input.x;
            bbox_y = (bbox_input.y - height_text);
            bbox_w = width_text;
            bbox_h = height_text*1.3;
            break;
        case "img":
            bbox_x = bbox_input.x;
            bbox_y = bbox_input.y;
            bbox_w = bbox_input.width;
            bbox_h = bbox_input.height;
            break;
    }
    return({x:bbox_x,y:bbox_y,width:bbox_w,height:bbox_h});
}
function render_bbox(bbox){
    ctx.save();
    ctx.beginPath();
    var scale = grid_scale/init_scale;
    ctx.lineWidth = 1*scale;
    ctx.strokeStyle = "#89cff0";
    var tlx = bbox.bbox.x*scale;
    var tly = bbox.bbox.y*scale;
    var brw = bbox.bbox.width*scale*bbox.scalee;
    var brh = bbox.bbox.height*scale*bbox.scalen;
    var scale = grid_scale/init_scale;
    var tempmatrix = angle_matrix(bbox);
    tempmatrix = (tempmatrix._data);
    ctx.transform(tempmatrix[0][0],tempmatrix[1][0],tempmatrix[0][1],tempmatrix[1][1],tempmatrix[0][2],tempmatrix[1][2]);
    ctx.rect(tlx,tly,brw,brh);
    ctx.stroke();
    var sqr_width = 8*scale;
    ctx.fillStyle = "#89cff0";
    ctx.fillRect(tlx-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width); //topleft anchor
    ctx.fillRect(tlx+(brw/2)-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width);//north anchor
    ctx.fillRect(tlx+brw-sqr_width/2,tly-sqr_width/2,sqr_width,sqr_width);//topright anchor
    ctx.fillRect(tlx+brw-sqr_width/2,tly+(brh/2)-sqr_width/2,sqr_width,sqr_width);//east anchor
    ctx.fillRect(tlx+brw-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width); // botright anchor
    ctx.fillRect(tlx+(brw/2)-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width);//south anchor
    ctx.fillRect(tlx-sqr_width/2,tly+brh-sqr_width/2,sqr_width,sqr_width); //bottom left
    ctx.fillRect(tlx-sqr_width/2,tly+(brh/2)-sqr_width/2,sqr_width,sqr_width);//west anchor
    ctx.moveTo(tlx+brw/2,tly);
    ctx.lineTo(tlx+brw/2,tly-20*scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tlx+brw/2,tly-20*scale,5*scale,0,2*Math.PI);
    ctx.fill();
    ctx.restore();
}
//create_bounding_box("l");
