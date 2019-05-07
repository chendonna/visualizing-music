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


var system = createParticleSystem();
parentContainer.add(system)

//PARTICLE SYSTEM
function createParticleSystem() {

    var loader = new THREE.TextureLoader();
    loader.setCrossOrigin('');
    var texture = loader.load('../assets/galaxy.jpg');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(1, 1);
    var disk = loader.load('https://threejs.org/examples/textures/sprites/circle.png');

    shaderUniforms = {
        amp_b: {
            type: "f",
            value: 1,
        },
        amp_t: {
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
    var types = [];
    var amps = [];

    // var sphere_origin = new THREE.SphereBufferGeometry(50, 35, 35);
    // sphere_origin.translate(-25.0, -25.0, -25.0);
    // console.log(sphere_origin.attributes.position.array)
    // vertices = sphere_origin.attributes.position.array;
    // colors = Array(5).fill(Math.random())
    // centers = Array(5).fill(0)

    // 1 is base; 0 is treble
    var type = 0.0

    var c1 = new THREE.Color(0x6dc43e) // base
    var c2 = new THREE.Color(0x4286f4) // trebel
    for (var z = -700; z < 450; z+=10) {
        var output;
        if (type == 1.0 ) {
            type = 0.0;
            //output = createCircle(35, 35, 50, z, c1);
        } else if (type == 0.0) {
            type = 1.0
            //output = createCircle(35, 35, 50, z, c2);
        }
        var output = createCircle(35, 35, 50, z);
        types = types.concat(Array(output.vertices.length/3).fill(type))
        vertices = vertices.concat(output.vertices);
        colors = colors.concat(output.colors)
        centers = centers.concat(output.centers)
        amps = amps.concat(Array(output.vertices.length/3).fill(1.0))
    }
    // console.log(vertices)
    // console.log(types)
    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry.addAttribute( 'center', new THREE.Float32BufferAttribute( centers, 3 ) );
    geometry.addAttribute( 'type', new THREE.Float32BufferAttribute( types, 1 ) );
    geometry.addAttribute( 'amp', new THREE.Float32BufferAttribute( amps, 1 ) );
    //for (var i = 0; i < )

    var system = new THREE.Points(geometry, shaderMaterial);

    // console.log("system ", system)
    system.sortParticles = true;

    return system;

}

function animate() {
	requestAnimationFrame( animate );
  // var dataArray = dataArrayTreble;
  // var analyser = analyserTreble;
  // var audio = audioTreble;
    if(dataArrayTreble != undefined && dataArrayBass != undefined){
        analyserBass.getByteTimeDomainData(dataArrayBass);
        analyserTreble.getByteTimeDomainData(dataArrayTreble);
        var amplitudeBass, amplitudeTreble;
        var currentTime = audioPlay.currentTime;
        amplitudeBass = Math.max.apply(null, dataArrayBass) / 128.0;
        amplitudeTreble = Math.max.apply(null, dataArrayTreble) / 128.0;


        //updateAmplitude(amplitudeBass, amplitudeTreble);
        //system.geometry.attributes.amp.needsUpdate = true;

        shaderUniforms.amp_b.value = amplitudeBass;
        shaderUniforms.amp_t.value = amplitudeTreble;
        if(currentTime <= 2){
            tempData = dataArrayBass.slice();
        }

        if(dataArrayBass[256] > 120){// above threshold, looking only at 256
            var numPeaks = peakTimes.length;
            if(currentTime - peakTimes[numPeaks - 1] > 0.25){
                peakTimes.push(currentTime);
            }
        }

        // tempo calculation
        // var tempo = 0;
        // if(peakTimes.length > 10){ // get some initial data
        //     var intervalCounts = countIntervalsBetweenNearbyPeaks(peakTimes);
        //     var tempos = groupNeighborsByTempo(intervalCounts);
        //     var total = 0;
        //     var count = 0;
        //     tempos.forEach(function(tempo){
        //         //console.log(`tempo is ${tempo.tempo}`);
        //         if(isNaN(tempo.tempo))
        //             return;
        //         total += tempo.tempo;
        //         count += tempo.count;
        //     });
        //     //console.log(`average predicted tempo is ${total / count}`);
        //     tempo = total / count;
        // }

    }


    //shaderUniforms.offset_z.value = animationTime;
    //animationTime += animationDelta;

    updateParticles();
    system.geometry.attributes.position.needsUpdate = true;

    if(moveMouse){
      system.rotation.x = (mousePos.y-0.5) * Math.PI;
      system.rotation.z = (mousePos.x-0.5) * Math.PI;
    }


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

    foundTempo = tempoCounts.some(function(tempoCount) {
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
  return tempoCounts;
}


function initAudio(audioFile, button){
    audioTreble.src = audioFile;
    audioBass.src = audioFile;
    audioPlay.src = audioFile;

    audioCtx = new AudioContext();
    sourceTreble = audioCtx.createMediaElementSource(audioTreble);
    sourceBass = audioCtx.createMediaElementSource(audioBass);
    sourcePlay = audioCtx.createMediaElementSource(audioPlay);

    biquadFilterBass = audioCtx.createBiquadFilter();
    biquadFilterTreble = audioCtx.createBiquadFilter();

    biquadFilterTreble.type = "highpass";
    biquadFilterTreble.frequency.value = 10000;

    biquadFilterBass.type = "lowpass";
    biquadFilterBass.frequency.value = 100;

    btsButton.removeEventListener("click", btsCallBack, false);
    strayButton.removeEventListener("click", strayCallBack, false);
    bassButton.removeEventListener("click", bassCallBack, false);
    jazzButton.removeEventListener("click", jazzCallBack, false);
    blackPinkButton.removeEventListener("click", blackPinkCallBack, false);

    strayButton.style.display = "none";
    jazzButton.style.display = "none";
    bassButton.style.display = "none";
    blackPinkButton.style.display = "none";
    btsButton.addEventListener("click", playAudio, false);
    btsButton.innerText = "Play";

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
    sourceBass.buffer = myArrayBuffer;
}


function draw(){
    var drawVisual = requestAnimationFrame(draw);
    analyserBass.getByteTimeDomainData(dataArrayBass);
    analyserTreble.getByteTimeDomainData(dataArrayTreble);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, AUDIO_WIDTH, AUDIO_HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var sliceWidth = AUDIO_WIDTH * 1.0 / bufferLength;
    var x = 0;

    canvasCtx.beginPath();
    for(var i = 0; i < bufferLength; i++) {

        var v = dataArrayBass[i] / 128.0;
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
    //console.log(dataArrayBass);
}

function playAudio(){
    analyserBass = audioCtx.createAnalyser();
    analyserTreble = audioCtx.createAnalyser();
    sourceBass.connect(biquadFilterBass);
    sourceTreble.connect(biquadFilterTreble);
    biquadFilterBass.connect(analyserBass);
    biquadFilterTreble.connect(analyserTreble);

    //analyserBass.connect(audioCtx.destination);
    //analyserTreble.connect(audioCtx.destination);
    //source.connect(audioCtx.destination);

    sourcePlay.connect(audioCtx.destination);

    audioBass.play();
    audioPlay.play();

    analyserBass.fftSize = 1024;
    bufferLength = analyserBass.frequencyBinCount;
    dataArrayBass = new Uint8Array(bufferLength);
    dataArrayTreble = new Uint8Array(bufferLength);
    //analyserBass.getFloatFrequencyData(dataArrayBass);
    //analyserBass.getByteFrequencyData(dataArrayBass);
    analyserBass.getByteTimeDomainData(dataArrayBass);
    analyserTreble.getByteTimeDomainData(dataArrayTreble);
    //analyserBass.getFloatTimeDomainData(dataArrayBass);
    //canvasCtx.clearRect(0, 0, AUDIO_WIDTH, AUDIO_HEIGHT);
    //draw();
    //console.log(dataArrayBass);


}


function setListeners(){
    btsCallBack = function(){initAudio("bts.wav", btsButton)};
    strayCallBack = function(){initAudio("stray.wav", strayButton)};
    jazzCallBack = function(){initAudio("jazz.wav", jazzButton)};
    bassCallBack = function(){initAudio("bass.wav", bassButton)};
    blackPinkCallBack = function(){initAudio("blackpink.wav", blackPinkButton)};

    btsButton.addEventListener("click", btsCallBack, false);
    strayButton.addEventListener("click", strayCallBack, false);
    jazzButton.addEventListener("click", jazzCallBack, false);
    bassButton.addEventListener("click", bassCallBack, false);
    blackPinkButton.addEventListener("click", blackPinkCallBack, false);

    audioPlay.addEventListener("pause", function(){
        audioBass.pause();
        audioTreble.pause();
    }, false);

    audioPlay.addEventListener("play", function(){
        audioBass.play();
        audioTreble.play();
    }, false);
    audioPlay.addEventListener("timeupdate", function(){
        audioBass.currentTime = audioPlay.currentTime;
        audioTreble.currentTime = audioPlay.currentTime;
    }, false);

  $(document).keydown(function(event){
    if(event.which == 66) // b
      moveMouse = true;
    //console.log(moveMouse); 
  });
  $(document).keyup(function(event){
      moveMouse = false;
    //console.log(moveMouse); 
  });
}

var audioCtx, sourceTreble, sourceBass, sourcePlay, biquadFilterTreble, biquadFilterBass;
var analyserTreble, analyserBass, dataArrayTreble, dataArrayBass, canvasCtx, tempData;
var peakTimes = [0];
var moveMouse = false;
audioTreble = document.getElementById('audioTreble');
audioBass = document.getElementById('audioBass');
audioPlay = document.getElementById('audioPlay');
btsButton = document.getElementById('btsButton');
strayButton = document.getElementById('strayButton');
blackPinkButton = document.getElementById('blackPinkButton');
jazzButton = document.getElementById('jazzButton');
bassButton = document.getElementById('bassButton');
setListeners();
