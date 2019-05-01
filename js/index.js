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

// ADDING A CUBE
// var geometry = new THREE.BoxGeometry( 1, 1, 1 );
// var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// var cube = new THREE.Mesh( geometry, material );
// scene.add( cube );
//

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
    //sphere.verticesNeedUpdate = true;

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

    shaderUniforms.amplitude.value = Math.sin(animationTime);

    animationTime += animationDelta;

    parentContainer.rotation.y += 0.001;
    parentContainer.rotation.x = (mousePos.y-0.5) * Math.PI;
    parentContainer.rotation.z = (mousePos.x-0.5) * Math.PI;

	renderer.render( scene, camera );
}
animate();
