/*
   VRExperience.js
 */
import {Vector3D, Matrix4D} from "./libraries/LinearAlgebra.js";
import {Entity} from "./entities/Entity.js";
import {CompositeEntity} from "./entities/CompositeEntity.js";
import {GamepadEntity} from "./entities/GamepadEntity.js";
import {Scene} from "./scenes/Scene.js";
export function startExperience(canvas)
{
    var gl = null;
    var entity = null;
    var scene = null;
    var vr_display = null;
    var buffers = null;
    var vr_present_button;
    function init(preserve_drawing_buffer)
    {
        var gl_attribs = {
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: preserve_drawing_buffer
        };
        gl = canvas.getContext("webgl", gl_attribs);
        canvas.getContext('webgl', gl_attribs) ||
            canvas.getContext('experimental-webgl', gl_attribs);
        // If we don't have a GL context, give up now
        if (!gl) {
            alert('Unable to initialize WebGL. Your browser or machine '+
                'may not support it.');
            return;
        }
        scene = new Scene(gl);
        scene.position =  Vector3D.create([0,-1.5,5]);
        var spin_box;
//Entity
        spin_box = createCube();
        scene.addEntity(spin_box);
        var box = createCube();
        scene.addEntity(box);
        var plane;
        plane = new Entity(null, [0,0,0], [15,0,15], 1);
        plane.face_colors = getColors(3);
        scene.addEntity(plane);
        //scene.view_entity = spin_box;
        //spin_box.allow_rendering = false;
        //spin_box.orientation_tracking = true;
        // Wait until we have a WebGL context to resize and start rendering.
        window.addEventListener("resize", onResize, false);
        onResize();
        window.requestAnimationFrame(animate);
    }
    function onResize() {
        if (vr_display && vr_display.isPresenting) {
            var left_eye = vr_display.getEyeParameters("left");
            var right_eye = vr_display.getEyeParameters("right");
            canvas.width = Math.max(left_eye.renderWidth,
                right_eye.renderWidth) * 2;
            canvas.height = Math.max(left_eye.renderHeight,
                right_eye.renderHeight);
        } else {
            canvas.width =
                canvas.offsetWidth;
            canvas.height =
                canvas.offsetHeight;
        }
    }
    var then = 0;
    var total = 0;
    // Draw the scene repeatedly
    function onContextLost(event)
    {
        event.preventDefault();
        console.log( 'WebGL Context Lost.' );
        gl = null;
    }
    function onContextRestored(event)
    {
        console.log( 'WebGL Context Restored.' );
        init(vr_display ? vr_display.capabilities.hasExternalDisplay : false);
    }
    function onVRRequestPresent()
    {
        vr_display.requestPresent([{ source: canvas }]).then(function () {
            console.log("hi there!! presenting");
        }, function (err) {
            var errMsg = "requestPresent failed.";
            if (err && err.message) {
                errMsg += "<br />" + err.message
            }
            console.log(errMsg);
        });
    }
    function onVRExitPresent()
    {
        if (!vr_display.isPresenting) {
            return;
        }
        vr_display.exitPresent().then(function () {
            window.requestAnimationFrame(animate);
        }, function () {
            console.log("exitPresent failed.");
        });
    }
    function onVRPresentChange()
    {
        onResize();
        if (vr_display.isPresenting) {
            if (vr_display.capabilities.hasExternalDisplay) {
                removeButton(vr_present_button);
                vr_present_button = addButton("Exit VR",
                    onVRExitPresent);
            }
        } else {
            if (vr_display.capabilities.hasExternalDisplay) {
                removeButton(vr_present_button);
                vr_present_button = addButton("Enter VR",
                    onVRRequestPresent);
            }
        }
    }
    canvas.addEventListener('webglcontextlost', onContextLost, false );
    canvas.addEventListener('webglcontextrestored', onContextRestored,
        false);
    if (navigator.getVRDisplays) {
        navigator.getVRDisplays().then(function (displays) {
            if (displays.length > 0) {
                vr_display = displays[displays.length - 1];
                init(true);
                if (vr_display.capabilities.canPresent) {
                    vr_present_button = addButton("Enter VR",
                        onVRRequestPresent);
                }
                window.addEventListener('vrdisplaypresentchange',
                    onVRPresentChange, false);
                window.addEventListener('vrdisplayactivate', onVRRequestPresent,
                    false);
                window.addEventListener('vrdisplaydeactivate', onVRExitPresent,
                    false);
            } else {
                init(false);
                window.requestAnimationFrame(animate);
                console.log("No VRDisplays found.");
            }
        },
        function () {
            init(false);
            window.requestAnimationFrame(animate);
            console.log("No WebVR support.");
        });
    }
    /*
     */
    function animate(now)
    {
        now *= 0.001;  // convert to seconds
        total = total + now;
        // check if the total time is over half a second
        if(total >= .5) {
            total = total - .5;
            //create a new cube if it is more than half a second
            var newCube = createCube();
            scene.addEntity(newCube);
        }
        var delta_time = now - then;
        then = now;
        scene.update(delta_time);
        renderExperience(vr_display, scene);
        if (vr_display && vr_display.isPresenting) {
            vr_display.requestAnimationFrame(animate);
        } else {
            window.requestAnimationFrame(animate);
        }
    }
}
/*
  Draw the VR Experience.
 */
function renderExperience(vr_display, scene)
{
    var gl = scene.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (vr_display && vr_display.isPresenting) {
        var frame_data = new VRFrameData();
        vr_display.getFrameData(frame_data);
        scene.orientation = frame_data.pose;
        scene.projection = frame_data.leftProjectionMatrix;
        gl.viewport(0, 0, gl.canvas.clientWidth * 0.5, gl.canvas.clientHeight);
        scene.render();
        scene.projection = frame_data.rightProjectionMatrix;
        gl.viewport(gl.canvas.clientWidth * 0.5, 0,
            gl.canvas.clientWidth * 0.5, gl.canvas.clientHeight);
        scene.render();
        vr_display.submitFrame();
    } else {
        scene.render();
    }
}
function addButtonElement(message)
{
    var button_elt = document.createElement("div");
    var webgl_canvas = document.getElementById('glcanvas');
    var button_container = document.getElementById("vr-button-container");
    if (!button_container) {
        button_container = document.createElement("div");
        button_container.id = "vr-button-container";
        Object.assign(button_container.style, {
            fontFamily : "sans-serif",
            position : "absolute",
            zIndex : "999",
            left : "0",
            bottom : "0",
            right : "0",
            margin : "0",
            padding : "0"
        });
        button_container.align = "right";
        webgl_canvas.parentNode.appendChild(button_container);
    }
    Object.assign(button_elt.style, {
        color: "#FFF",
        fontWeight: "bold",
        backgroundColor : "#888",
        borderRadius : "5px",
        border : "3px solid #555",
        position : "relative",
        display :  "inline-block",
        margin : "0.5em",
        padding : "0.75em",
        cursor : "pointer",
    });
    button_elt.align = "center";
    button_elt.innerHTML = "<img src='vricon.png' style='width:1in' /><br />" +
        message;
    button_container.appendChild(button_elt);
    return button_elt;
}
function addButton(message, callback)
{
    var element = addButtonElement(message);
    element.addEventListener("click", function (event) {
        callback(event);
        event.preventDefault();
    }, false);
    return {
        element: element,
    };
}
function removeButton(button)
{
    if (!button) {
        return;
    }
    if (button.element.parentElement) {
        button.element.parentElement.removeChild(button.element);
    }
}

//creates cube objects that are between x = -10 - 10, y = 10-15, and z = 5 - 25
//all cubes are 1m in length
function createCube() {
    var destObj = new Entity(null, [getRnd(-10, 10), getRnd(10,15), -getRnd(5, 25)], [1,1,1], 1);
    destObj.face_colors = getColors(getRnd(1, 7));
    destObj.acceleration = Vector3D.create([0,-1,0]);
    destObj.angle = getRnd(-1, 1);
    destObj.axis = Vector3D.create([getRnd(-1,1),getRnd(-1,1),getRnd(-1,1)]);
    return destObj;
}

//Gets a random number between min-max inclusive
function getRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function getColors(type) {
    var red;
    var green;
    var blue;
    switch(type) {
        //white
        case 1:
            red = 1;
            green = 1;
            blue = 1;
            break;
        //red
        case 2:
            red = 1;
            green = 0;
            blue = 0;
            break;
        //green
        case 3:
            red = 0;
            green = 1;
            blue = 0;
            break;
        //blue
        case 4:
            red = 0;
            green = 0;
            blue = 1;
            break;
        //yellow
        case 5:
            red = 1;
            green = 1;
            blue = 0;
            break;
        //purple
        case 6:
            red = 1;
            green = 0;
            blue = 1;
            break;
        //cyan
        case 7:
            red = 0;
            green = 1;
            blue = 1;
    }
    var faceColors = [
        [red,  green,  blue,  1.0],    // Front face
        [red,  green,  blue,  1.0],    // Back face
        [red,  green,  blue,  1.0],    // Top face
        [red,  green,  blue,  1.0],    // Bottom face
        [red,  green,  blue,  1.0],    // Right face
        [red,  green,  blue,  1.0],    // Left face
    ];
    return faceColors;
}