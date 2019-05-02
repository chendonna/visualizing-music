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

camera.position.z = 50;

renderer.setSize(WIDTH, HEIGHT);
scene_dom.appendChild(renderer.domElement);

var parentContainer = new THREE.Object3D();
scene.add(parentContainer)

var shaderUniforms, shaderAttributes;

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


    var sphere = new THREE.SphereBufferGeometry(10, 30, 30);
    console.log(sphere);
    sphere.verticesNeedUpdate = true;

    const shaderMaterial = new THREE.ShaderMaterial({
                                  //attributes: shaderAttributes,
                                  uniforms: shaderUniforms,
                                  vertexShader: document.getElementById("vertexShader").textContent,
                                  fragmentShader: document.getElementById("fragmentShader").textContent,
                                  transparent: true,
    });

    var system = new THREE.Points(sphere, shaderMaterial);
    console.log(system)
    system.sortParticles = true;

    particles = system.geometry.vertices;

    return system;

}

function animate() {
	requestAnimationFrame( animate );
    if(dataArray != undefined){
        analyser.getByteTimeDomainData(dataArray);
        var amplitude;
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


    //shaderUniforms.amplitude.value = Math.sin(animationTime);

    animationTime += animationDelta;

    parentContainer.rotation.y += 0.001;
    parentContainer.rotation.x = (mousePos.y-0.5) * Math.PI;
    parentContainer.rotation.z = (mousePos.x-0.5) * Math.PI;

	renderer.render( scene, camera );
}
animate();


// Function to identify peaks

function getPeaksAtThreshold(data, threshold) {
  var peaksArray = [];
  var length = data.length;
  for(var i = 0; i < length;) {
    if (data[i] > threshold) {
      peaksArray.push(i);
      // Skip forward ~ 1/4s to get past this peak.
      i += 20;
    }
    i++;
  }
  return peaksArray;
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
        continue;
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
    //console.log(dataArray);
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



