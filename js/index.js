// // SETTING CONSTANTS
// const WIDTH = window.innerWidth;
// const HEIGHT = window.innerHeight;
// const VIEW_ANGLE = 45;
// const ASPECT = WIDTH/HEIGHT;
// const NEAR = 0.1;
// const FAR = 10000;

// // CREATING SCENE
// const scene_dom = document.getElementById('scene');

// const renderer = new THREE.WebGLRenderer();
// const camera =
//     new THREE.PerspectiveCamera(
//         VIEW_ANGLE,
//         ASPECT,
//         NEAR,
//         FAR
//     );

// const scene = new THREE.Scene();
// scene.add(camera);

// renderer.setSize(WIDTH, HEIGHT);
// scene_dom.appendChild(renderer.domElement);

// // ADDING A CUBE
// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

// camera.position.z = 5

// function animate() {
//     requestAnimationFrame( animate );
//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;
//     renderer.render( scene, camera );
// }
// animate();

WIDTH = 200;
HEIGHT = 100;

function help(){
    console.log("called help"); 
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
    canvasCtx.fillRect(0, 0, WIDTH,HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;

    canvasCtx.beginPath();
    for(var i = 0; i < bufferLength; i++) {
       
        var v = dataArray[i] / 128.0;
        var y = v * HEIGHT/2;

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
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();
    //console.log(dataArray);


}
var audioCtx, source, analyser, dataArray, canvasCtx;
audioElement = document.getElementById('audioInput');
button = document.getElementById('loadButton');
canvas = document.getElementById('myCanvas');
canvasCtx = canvas.getContext("2d");
loadListener = button.addEventListener("click", initAudio, false);






