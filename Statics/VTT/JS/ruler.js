////////////////////////////RULER
function ruler_draw(){
    if((ruler_pointers.point_array.length == 0)||((ruler_pointers.x == null))){
        return;
    }
    ctx.beginPath();
    var scale = grid_scale/init_scale;
    var ttllen = 0;
    var canvas_h = canvas.height;
    var canvas_w = canvas.width;
    var len = ruler_pointers.point_array.length;
    var curx = (ruler_pointers.point_array[0].x)*scale;
    var cury = (ruler_pointers.point_array[0].y)*scale;
    ctx.moveTo(curx,cury);
    if((ruler_pointers.point_array.length >= 1)){
        for(i=1;i<(ruler_pointers.point_array.length);i++){
            var x = (scale*(ruler_pointers.point_array[i].x));
            var y = (scale*(ruler_pointers.point_array[i].y));
            var len = (String(x - curx) +","+ String(y-cury));
            len = ((Math.sqrt((((x-curx)**2)+((y-cury)**2)))));
            ttllen +=parseInt(len);
            curx = x;
            cury = y;
            ctx.strokeStyle = "#0000FF";
            ctx.lineWidth = 4;
            ctx.lineTo(curx,cury);
            ctx.stroke();
            draw_circle_ruler(curx,cury);
            create_length(ttllen,curx,cury);
            ctx.strokeStyle = "#0000FF";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(curx,cury);
        }
    }
    var mouse_x = scale*ruler_pointers.x;
    var mouse_y = scale*ruler_pointers.y;
    var last_ele = ((ruler_pointers.point_array.length) -1);
    var last_x = ((ruler_pointers.point_array[last_ele].x)*(scale));
    var last_y = ((ruler_pointers.point_array[last_ele].y)*(scale));
    final_len = ((mouse_x - (last_x)))**2;
    final_len += (((mouse_y - last_y)**2));
    final_len = Math.sqrt(final_len);
    //console.log(final_len);
    //console.log((mouse_x - (ruler_pointers.point_array[last_ele].x)));
    ctx.lineTo((mouse_x),(mouse_y));
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 4;
    ctx.stroke();
    var x_new = mouse_x-last_x;
    var y_new = mouse_y-last_y;
    //var matrix_angle = (Math.atan2(x_new,-(y_new)));
    //console.log(matrix_angle);
    create_length(final_len,mouse_x,mouse_y);
    arrow_pointer(mouse_x,mouse_y,last_x,last_y);
}
function arrow_pointer(x,y,x1,y1){
    ctx.save();
    var x_new = x-x1;
    var y_new = y-y1;
    var matrix_angle = -(Math.atan2(x_new,(y_new)));
    //console.log(matrix_angle);
    ctx.beginPath();
    //ctx.translate(x,y);
    ctx.transform((Math.cos(matrix_angle)),(Math.sin(matrix_angle)),-(Math.sin(matrix_angle)),(Math.cos(matrix_angle)),x,y);
    ctx.moveTo(-13,-14);
    ctx.lineTo(13,-14);
    ctx.lineTo(0,5);
    ctx.closePath();
    ctx.fillStyle = "#0000FF";
    ctx.fill();
    ctx.restore();
}
//Creates length box
function create_length(len,x,y){
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.fillStyle = "#f7f7f7";
    ctx.globalAlpha = 0.80;
    var len = ((len/grid_scale).toFixed(1));
    var len = ((String(len))+ " SQ");
    ctx.font = "8 17px Arial";
    var metric = ctx.measureText(String(len));
    ctx.fillRect(x-15,y-42,metric.width+10,30);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "black";
    ctx.fillText(len,x-10,y-20);
}
//draw a circle
function draw_circle_ruler(x,y){
    ctx.beginPath();
    ctx.arc(x,y,10,0,Math.PI*2);
    ctx.fillStyle = "#0000FF";
    ctx.fill();
}
function reset_ruler(){
    is_ruler_down = false;
    ruler_pointers.x = 0;
    ruler_pointers.y = 0;
    ruler_pointers.point_array = [];
    render();
}
var is_ruler_down = false;
var ruler_pointers = {
    x:0,
    y:0,
    point_array:[]
}