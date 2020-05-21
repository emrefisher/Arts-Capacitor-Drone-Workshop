var flightPath = [];
JSON.stringify(flightPath);
localStorage.setItem('flightPath', flightPath);
var points = [];
var points = [];
var index = 0;
var editedpoint=0;
var locked = false;

// Canvases
var canvas_xy = null;
var canvas_xz = null;
var canvas_yz = null;

// Contexts
var context1 = null;
var context2 = null;
var context3 = null;

// Absolute Sizes
var rect_xy = null;
var rect_xz = null;
var rect_yz = null;

// Scale factors 
var xy_scaleX = null;
var xy_scaleY = null;

var xz_scaleX = null;
var xz_scaleZ = null;

var yz_scaleY = null;
var yz_scaleZ = null;

var alteredIndex = null; //index for where in xpos array to change coordinates

// Button statuses
var clearPathEnabled = false;
var genCSVEnabled = false;


// Class for storing point data
class Point {
    constructor(x, y, z, text) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    getCoordinateArray(){
        return [this.x, this.y, this.z]
    }
}

function init(){

    // Set up canvas
    canvas_xy = document.getElementById("canvas_xy");
    canvas_xy.width = canvas_xy.getBoundingClientRect().width;
    canvas_xy.height = canvas_xy.getBoundingClientRect().height;
    context1 = canvas_xy.getContext("2d");
    
    canvas_xz = document.getElementById("canvas_xz");
    canvas_xz.width = canvas_xz.getBoundingClientRect().width;
    canvas_xz.height = canvas_xz.getBoundingClientRect().height;
    context2 = canvas_xz.getContext("2d");   
    
    canvas_yz = document.getElementById("canvas_yz");
    canvas_yz.width = canvas_yz.getBoundingClientRect().width;
    canvas_yz.height = canvas_yz.getBoundingClientRect().height;
    context3 = canvas_yz.getContext("2d");   
    
    // We need to scale some of the point coordinates
    rect_xy = canvas_xy.getBoundingClientRect(); // abs. size of element
    xy_scaleX = canvas_xy.width / rect_xy.width;    // relationship bitmap vs. element for X
    xy_scaleY = canvas_xy.height / rect_xy.height;  // relationship bitmap vs. element for Y

    rect_xz = canvas_xz.getBoundingClientRect()
    xz_scaleX = canvas_xz.width / rect_xz.width;    
    xz_scaleZ = canvas_xz.height / rect_xz.height;  

    rect_yz = canvas_yz.getBoundingClientRect();
    yz_scaleY = canvas_yz.width / rect_yz.width;
    yz_scaleZ = canvas_yz.height / rect_yz.height;

    drawGridOnCanvas(0);
    drawGridOnCanvas(1);
    drawGridOnCanvas(2);

    // EventListeners for canvases
    canvas_xy.addEventListener("dblclick", function(event){
        var pos = getMousePos(0, event);
        points.push(new Point(pos.x-3, pos.y-4, xz_scaleZ * (context2.canvas.clientHeight/2)));
        drawPaths(points);

        if(clearPathEnabled == false){
            document.getElementById("clearButton").disabled = false;

            if (points.length > 1) {
                document.getElementById("sendButton").disabled = false;
            }
        }
    });

    canvas_xz.addEventListener("dblclick", function(event){
        var pos = getMousePos(1, event);
        points.push(new Point(pos.x-3, xy_scaleY * (context1.canvas.clientHeight/2), pos.z-4));
        drawPaths(points);

        if(clearPathEnabled == false){
            document.getElementById("clearButton").disabled = false;

            if (points.length > 1) {
                document.getElementById("sendButton").disabled = false;
            }
        }
    });

    canvas_yz.addEventListener("dblclick", function(event){
        var pos = getMousePos(2, event);
        points.push(new Point(xy_scaleX * (context1.canvas.clientHeight/2), pos.y-3, pos.z-4));
        drawPaths(points);

        if(clearPathEnabled == false){
            document.getElementById("clearButton").disabled = false;

            if (points.length > 1) {
                document.getElementById("sendButton").disabled = false;
            }
        }
    });

    

    canvas_xy.addEventListener("mousedown", function(event){
        var getpos = getMousePos(0, event);

        for(var i=0; i<points.length; i++){
            if( (Math.abs(getpos.x - points[i].x) < 4) && (Math.abs(getpos.y - points[i].y) < 4) ){
                alteredIndex = i; //sets points array location to pull from
                break;
            }
        }

    });

    canvas_xy.addEventListener("mouseup", function(event){

        var newpos = getMousePos(0, event);
        var newX = newpos.x-3;
        var newY = newpos.y-4;

        if (alteredIndex !== null) {
            points[alteredIndex].x = newX;
            points[alteredIndex].y = newY;
            drawPaths(points);
            alteredIndex = null;
        }
    });

    canvas_xz.addEventListener("mousedown", function(event){
        var getpos = getMousePos(1, event);

        for(var i=0; i<points.length; i++){
            if( (Math.abs(getpos.x - points[i].x) < 4) && (Math.abs(getpos.z - points[i].z) < 4) ){
                alteredIndex = i; //sets points array location to pull from
                break;
            }
        }
    });

    canvas_xz.addEventListener("mouseup", function(event){

        var newpos = getMousePos(1, event);
        var newX = newpos.x-3;
        var newZ = newpos.z-4;

        if (alteredIndex !== null) {
            points[alteredIndex].x = newX;
            points[alteredIndex].z = newZ;
            drawPaths(points);
            alteredIndex = null;
        }
    });

    canvas_yz.addEventListener("mousedown", function(event){
        var getpos = getMousePos(2, event);

        for(var i=0; i<points.length; i++){
            if( (Math.abs(getpos.y - points[i].y) < 4) && (Math.abs(getpos.z - points[i].z) < 4) ){
                alteredIndex = i; //sets points array location to pull from
                break;
            }
        }
    });

    canvas_yz.addEventListener("mouseup", function(event){

        var newpos = getMousePos(2, event);
        var newY = newpos.y-3;
        var newZ = newpos.z-4;

        if (alteredIndex !== null) {
            points[alteredIndex].y = newY;
            points[alteredIndex].z = newZ;
            drawPaths(points);
            alteredIndex = null;
        }
    });


}

function drawGridOnCanvas(context_id){

    var canvasPadding = 0; 
    var canvasWidth = null;
    var canvasHeight = null;
    var scaleX = null;
    var scaleY = null;
    var context = null;

    switch(context_id){
        case(0):
            canvasWidth = context1.canvas.clientWidth;
            canvasHeight = context1.canvas.clientHeight;
            scaleX = xy_scaleX;
            scaleY = xy_scaleY;
            context = context1;
            break;

        case(1):
            canvasWidth = context2.canvas.clientWidth;
            canvasHeight = context2.canvas.clientHeight;
            scaleX = xz_scaleX;
            scaleY = xz_scaleZ;
            context = context2;
            break;

        case(2):
            canvasWidth = context3.canvas.clientWidth;
            canvasHeight = context3.canvas.clientHeight;
            scaleX = yz_scaleY;
            scaleY = yz_scaleZ;
            context = context3;
            break;

        default:
            break;

    }

    context.beginPath();

    for (var x = 0; x <= canvasWidth; x += 30) {
        var location = x * scaleX;
        context.moveTo(0.5 + location + canvasPadding, canvasPadding);
        context.lineTo(0.5 + location + canvasPadding, canvasHeight + canvasPadding);
    }

    for (var x = 0; x <= canvasHeight; x += 30) {
        var location = x * scaleY;
        context.moveTo(canvasPadding, 0.5 + location + canvasPadding);
        context.lineTo(canvasWidth + canvasPadding, 0.5 + location + canvasPadding);
    }
    context.strokeStyle = "rgb(211,211,211)";
    context.stroke();
}

function getMousePos(canvas_id, evt) {
    var point = null;

    switch(canvas_id){
        case(0):
            var x = (evt.pageX - rect_xy.left) * xy_scaleX;
            var y = (evt.pageY - rect_xy.top) * xy_scaleY;
            var point = new Point(x, y, undefined);
            break;

        case(1):
            var x = (evt.pageX - rect_xz.left) * xz_scaleX;
            var z = (evt.pageY - rect_xz.top) * xz_scaleZ;
            var point = new Point(x, undefined, z);
            break;

        case(2):
            var y = (evt.pageX - rect_yz.left) * yz_scaleY;
            var z = (evt.pageY - rect_yz.top) * yz_scaleZ;
            var point = new Point(undefined, y, z);
            break;

        default: 
            break;
    }
    return point
}

function drawPoint(context, x, y, w, h, text){
    context.fillStyle = 'rgb(255,255,255)';
    context.fillRect(x, y, w, h);
    context.fillText(text, x, y-3);
}

function drawPaths(points){

    // Clear current canvases
    context1.clearRect(0, 0, canvas_xy.width, canvas_xy.height, false);
    context2.clearRect(0, 0, canvas_xz.width, canvas_xz.height, false);
    context3.clearRect(0, 0, canvas_yz.width, canvas_yz.height, false);

    // Redraw grids
    drawGridOnCanvas(0)
    drawGridOnCanvas(1)
    drawGridOnCanvas(2)

    for (var i=0; i<points.length; i++) {

        drawPoint(context1, points[i].x, points[i].y, 6, 6, i+1);
        drawPoint(context2, points[i].x, points[i].z, 6, 6, i+1);
        drawPoint(context3, points[i].y, points[i].z, 6, 6, i+1);

        if (i > 0) {

            context1.beginPath();
            context2.beginPath();
            context3.beginPath();

            context1.moveTo(points[i-1].x+1.5, points[i-1].y+2);
            context2.moveTo(points[i-1].x+1.5, points[i-1].z+2);
            context3.moveTo(points[i-1].y+2, points[i-1].z+1.5); 

            context1.lineTo(points[i].x+1.5, points[i].y+2);
            context2.lineTo(points[i].x+1.5, points[i].z+2);
            context3.lineTo(points[i].y+1.5, points[i].z+2);

            context1.strokeStyle = "white";
            context2.strokeStyle = "white";
            context3.strokeStyle = "white";

            context1.stroke() 
            context2.stroke()    
            context3.stroke()
        }
    }
}

function clearPath(){
    points = []
    drawPaths(points);

    document.getElementById("clearButton").disabled = true;
    document.getElementById("editButton").disabled = true
    document.getElementById("sendButton").disabled = true;
}

function sendToCSV(){
   
    // Add points to flightplan
    for(var i = 0; i < points.length; i++){
        flightPath.push(points[i].getCoordinateArray())
        console.log(flightPath);
    }
    
    let csvcontent = "data:text/csv;charset=utf-8,";
    flightPath.forEach(function(rowArray){
        let row = rowArray.join(",");
        csvcontent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvcontent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "flightPath.csv");
    document.body.appendChild(link);
    
    link.click();
}