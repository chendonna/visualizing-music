// import { analyze } from "./node_modules/web-audio-beat-detector/build/es5/bundle.js";
// import { analyze } from 'https://dev.jspm.io/web-audio-beat-detector';
// import { analyze } from 'https://dev.jspm.io/web-audio-beat-detector';

const AUDIO_WIDTH = 200;
const AUDIO_HEIGHT = 100;
const api_key = "6f444187-f008-4d1f-901a-89dfce20f317";

// SETTING CONSTANTS

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const VIEW_ANGLE = 45;
const ASPECT = WIDTH/HEIGHT;
const NEAR = 0.1;
const FAR = 10000;
const CAMERA_Z = 700;

var animationTime = 0;
var animationDelta = 5.0;
var loop = 0;

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

camera.position.z = CAMERA_Z;

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

    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('');
    var texture = loader.load('../assets/galaxy.jpg');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(1, 1);
    var disk = loader.load('https://threejs.org/examples/textures/sprites/circle.png');

    shaderUniforms = {
        amplitude: {
            type: "f",
            value: 1,
        },
        shape: {
            value: disk
        },
        texture: {
            value: texture
        }
    };

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

    // var sphere_origin = new THREE.SphereBufferGeometry(50, 35, 35);
    // sphere_origin.translate(-25.0, -25.0, -25.0);
    // console.log(sphere_origin.attributes.position.array)
    // vertices = sphere_origin.attributes.position.array;
    // colors = Array(5).fill(Math.random())
    // centers = Array(5).fill(0)


    for (var z = -300; z < 450; z+=5) {
        var output = createCircle(35, 35, 50, z)
        vertices = vertices.concat(output.vertices);
        colors = colors.concat(output.colors)
        centers = centers.concat(output.centers)
    }
    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'center', new THREE.Float32BufferAttribute( centers, 3 ) );

    var system = new THREE.Points(geometry, shaderMaterial);

    console.log("system ", system)
    system.sortParticles = true;

    return system;

}

function animate() {
	requestAnimationFrame( animate );
    if(dataArray != undefined){
        analyser.getByteTimeDomainData(dataArray);
        var currentTime = audioElement.currentTime;
        //amplitude = dataArray[100] / 128.0;
        amplitude = Math.max.apply(null, dataArray) / 128.0;
        shaderUniforms.amplitude.value = amplitude;
        //console.log(amplitude);
        if(currentTime <= 2){
            tempData = dataArray.slice();
        }

        if(dataArray[256] > 180){// above threshold, looking only at 256
            var numPeaks = peakTimes.length;
            if(currentTime - peakTimes[numPeaks - 1] > 0.25){
                peakTimes.push(currentTime);
            }
        }
    }


    //shaderUniforms.offset_z.value = animationTime;
    //animationTime += animationDelta;

    //updateParticles();
    system.geometry.attributes.position.needsUpdate = true;

    //parentContainer.position.z += 0.1;
    //console.log(parentContainer.position.z)

    // parentContainer.rotation.y += 0.001;
    // parentContainer.rotation.x = (mousePos.y-0.5) * Math.PI;
    // parentContainer.rotation.z = (mousePos.x-0.5) * Math.PI;
    //system.rotation.x = (mousePos.y-0.5) * Math.PI;
    //system.rotation.z = (mousePos.x-0.5) * Math.PI;

	renderer.render( scene, camera );
}
animate();

function updateParticles() {
    var particles = system.geometry.attributes.position.array
    var count = system.geometry.attributes.position.count * 3;
    for (var i = 2; i<count; i +=3) {
        particles[i] += 5.0;
        if (particles[i] > CAMERA_Z) {
            particles[i] = -CAMERA_Z;
        }
    }
}
function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 20;
  }
    }
}

function createCircle(radius, segmentsX, segmentsY, offset_z) {
    var vertices = []
    var colors = []
    var centers = []

    var offset_x = Math.random() * 300-150;
    var offset_y = Math.random() * 300 -150;

    while ((offset_x > -25 && offset_x < 25) || (offset_y > -25 && offset_y < 25)) {
        offset_x = Math.random() * 300-150;
        offset_y = Math.random() * 300 -150;
    }

    var r = Math.random();
    var g = Math.random();
    var b = Math.random();

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
            colors.push(r, g, b)

        }
    }
    return {vertices, colors, centers};
}

// Function used to return a histogram of peak peakTimes

function countIntervalsBetweenNearbyPeaks(peaks) {
  var intervalCounts = [];
  peaks.forEach(function(peak, index) {
    for(var i = 0; i < 10; i++) {
      var interval = peaks[index + i] - peak;
      var foundInterval = intervalCounts.some(function(intervalCount) {
        if (intervalCount.interval === interval)
          return intervalCount.count++;
      });
      if (!foundInterval) {
        intervalCounts.push({
          interval: interval,
          count: 1
        });
      }
    }
  });
  return intervalCounts;
}

// Function used to return a histogram of tempo candidates.

function groupNeighborsByTempo(intervalCounts) {
  var tempoCounts = []
  intervalCounts.forEach(function(intervalCount, i) {
    // Convert an interval to tempo
    if(intervalCount.interval == 0)
        return;
    var theoreticalTempo = 60 / (intervalCount.interval / 44100 );

    // Adjust the tempo to fit within the 90-180 BPM range
    while (theoreticalTempo < 90) theoreticalTempo *= 2;
    while (theoreticalTempo > 180) theoreticalTempo /= 2;

    var foundTempo = tempoCounts.some(function(tempoCount) {
      if (tempoCount.tempo === theoreticalTempo)
        return tempoCount.count += intervalCount.count;
    });
    if (!foundTempo) {
      tempoCounts.push({
        tempo: theoreticalTempo,
        count: intervalCount.count
      });
    }
  });
}


function initAudio(){
    audioCtx = new AudioContext();
    source = audioCtx.createMediaElementSource(audioElement);
    sourcePlay = audioCtx.createMediaElementSource(audioPlay);
    biquadFilter = audioCtx.createBiquadFilter();

    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 60;

    button.removeEventListener("click", initAudio, false);
    button.addEventListener("click", playAudio, false);
    button.innerText = "Play";

    var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 3, audioCtx.sampleRate);

    // Fill the buffer with white noise;
    //just random values between -1.0 and 1.0
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
      // This gives us the actual ArrayBuffer that contains the data
      var nowBuffering = myArrayBuffer.getChannelData(channel);
      for (var i = 0; i < myArrayBuffer.length; i++) {
        // Math.random() is in [0; 1.0]
        // audio needs to be in [-1.0; 1.0]
        nowBuffering[i] = Math.random() * 2 - 1;
      }
    }
    source.buffer = myArrayBuffer;
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
        //console.log(`y is ${y}`);

        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
    //console.log(dataArray);
}

function playAudio(){
    analyser = audioCtx.createAnalyser();
    source.connect(biquadFilter);

    biquadFilter.connect(analyser);

    //analyser.connect(audioCtx.destination);
    //source.connect(audioCtx.destination);

    sourcePlay.connect(audioCtx.destination);

    audioElement.play();
    audioPlay.play();

    analyser.fftSize = 1024;
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

function setListeners(){
    loadListener = button.addEventListener("click", initAudio, false);
    audioPlay.addEventListener("pause", function(){
        audioElement.pause();
    }, false);

    audioPlay.addEventListener("play", function(){
        audioElement.play();
    }, false);
    audioPlay.addEventListener("timeupdate", function(){
        audioElement.currentTime = audioPlay.currentTime;
    }, false);
}

var audioCtx, source, sourcePlay, biquadFilter, analyser, dataArray, canvasCtx, tempData;
var peakTimes = [0];
audioElement = document.getElementById('audioInput');
audioPlay = document.getElementById('audioPlay');
button = document.getElementById('loadButton');
canvas = document.getElementById('myCanvas');
canvasCtx = canvas.getContext("2d");
setListeners();
