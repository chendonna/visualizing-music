

const AUDIO_WIDTH = 200;
const AUDIO_HEIGHT = 100;

// SETTING CONSTANTS

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const VIEW_ANGLE = 45;
const ASPECT = WIDTH/HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

var animationTime = 0;
var animationDelta = 0.03;

var mousePos = {x: 0.5, y: 0.5};
document.addEventListener('mousemove', function (event) {  mousePos = {x:event.clientX/WIDTH, y:event.clientY/HEIGHT};});


const segmentsX = 30;
const segmentsY = 30;

// CREATING SCENE
const scene_dom = document.getElementById('scene');

const renderer = new THREE.WebGLRenderer();
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

const scene = new THREE.Scene();

scene.add(camera);

camera.position.z = 300;

renderer.setSize(WIDTH, HEIGHT);
scene_dom.appendChild(renderer.domElement);

var parentContainer = new THREE.Object3D();
scene.add(parentContainer)

var shaderUniforms, shaderAttributes;

//createParticleSystem()
var system = createParticleSystem();
parentContainer.add(system)

//PARTICLE SYSTEM
function createParticleSystem() {
    // shaderAttributes = {
    //     vertexColor: {
    //         type: "c",
    //         value: []
    //     }
    // };
    shaderUniforms = {
        amplitude: {
            type: "f",
            value: 0.5
    }};

    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

    //var groupSpheres = new THREE.Group;
    const shaderMaterial = new THREE.ShaderMaterial({
                                  //attributes: shaderAttributes,
                                  uniforms: shaderUniforms,
                                  vertexShader: document.getElementById("vertexShader").textContent,
                                  fragmentShader: document.getElementById("fragmentShader").textContent,
                                  transparent: true,
                                  vertexColors: true,
                                  blending: THREE.AdditiveBlending,
    });

    var vertices = [];
    var colors = [];
    var centers = [];
    for (var z = -100; z < 250; z+=10) {
        var output = createCircle(20, 30, 30, z)
        vertices = vertices.concat(output.vertices);
        colors = colors.concat(output.colors)
        centers = centers.concat(output.centers)
    }
    console.log(centers)
    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'center', new THREE.Float32BufferAttribute( centers, 3 ) );


    console.log(geometry)
    var system = new THREE.Points(geometry, shaderMaterial);
    console.log("system ", system)
    system.sortParticles = true;

    //particles = system.geometry.vertices;

    return system;

}

function animate() {
	requestAnimationFrame( animate );

    shaderUniforms.amplitude.value = Math.sin(animationTime);
    console.log(Math.sin(animationTime))

    animationTime += animationDelta;

    //parentContainer.position.z += 0.1;
    //console.log(parentContainer.position.z)

    // parentContainer.rotation.y += 0.001;
    // parentContainer.rotation.x = (mousePos.y-0.5) * Math.PI;
    // parentContainer.rotation.z = (mousePos.x-0.5) * Math.PI;
    camera.rotation.x = (mousePos.y-0.5) * Math.PI;
    camera.rotation.z = (mousePos.x-0.5) * Math.PI;

	renderer.render( scene, camera );
}
animate();

function createCircle(radius, segmentsX, segmentsY, offset_z) {
    var vertices = []
    var colors = []
    var centers = []

    var offset_x = Math.random() * 300-150;
    var offset_y = Math.random() * 300-150;


    for (var row = 1; row < segmentsY; row++) {
        for (var col = 0; col < segmentsX; col++) {
            var phi = Math.PI / segmentsY*row; // latitude
            var theta = 2*Math.PI / segmentsX*col; // longitude
            var x = radius*Math.sin(phi)*Math.cos(theta) + offset_x;
            var y = radius*Math.cos(phi) + offset_y;
            var z = radius*Math.sin(phi)*Math.sin(theta) + offset_z;
            vertices.push(x, y, z);
            centers.push(offset_x, offset_y , offset_z);


            //var color = new THREE.Color(Math.random(), Math.random(), Math.random())
            colors.push(Math.random(), Math.random(), Math.random())

        }
    }
    return {vertices, colors, centers};
}

function initAudio(){
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audioElement);
    button.removeEventListener("click", initAudio, false);
    button.addEventListener("click", playAudio, false);
    button.innerText = "Play";
}

function loopAudio(analyser, dataArray){
    requestAnimationFrame(loopAudio);
    analyser.getByteTimeDomainData(dataArray);
    console.log(dataArray);
    loopAudio(analyser, dataArray);
}

function draw(){
    var drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, AUDIO_WIDTH, AUDIO_HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var sliceWidth = AUDIO_WIDTH * 1.0 / bufferLength;
    var x = 0;

    canvasCtx.beginPath();
    for(var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / 128.0;
        var y = v * AUDIO_HEIGHT/2;

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    console.log(dataArray);
}

function playAudio(){
    analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioElement.play();

    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    //analyser.getFloatFrequencyData(dataArray);
    //analyser.getByteFrequencyData(dataArray);
    analyser.getByteTimeDomainData(dataArray);
    //analyser.getFloatTimeDomainData(dataArray);
    //loopAudio(analyser, dataArray);
    canvasCtx.clearRect(0, 0, AUDIO_WIDTH, AUDIO_HEIGHT);
    draw();
    //console.log(dataArray);


}
var audioCtx, source, analyser, dataArray, canvasCtx;
audioElement = document.getElementById('audioInput');
button = document.getElementById('loadButton');
canvas = document.getElementById('myCanvas');
canvasCtx = canvas.getContext("2d");
loadListener = button.addEventListener("click", initAudio, false);
