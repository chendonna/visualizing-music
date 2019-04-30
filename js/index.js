// SETTING CONSTANTS

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const VIEW_ANGLE = 45;
const ASPECT = WIDTH/HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

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
    var particles = new THREE.Geometry(),
        pMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            blending: THREE.AdditiveBlending,
            map: generateSprite()
        });

    var sphere = new THREE.SphereGeometry(10, 30, 30);
    sphere.verticesNeedUpdate = true;

    var system = new THREE.Points(sphere, pMat);
    system.sortParticles = true;

    return system;

}

function generateSprite() {

    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;

    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;

}
console.log(system.geometry.vertices)

function animate() {
	requestAnimationFrame( animate );

    system.geometry.vertices.forEach(function(v) {
        // console.log(v.y)
        // console.log(v.vy)
        system.geometry.verticesNeedUpdate = true;
    })

    // unsure why it's flipped but ok lol
    parentContainer.rotation.y += 0.001;
    parentContainer.rotation.x = (mousePos.y-0.5) * Math.PI;
    parentContainer.rotation.z = (mousePos.x-0.5) * Math.PI;

	renderer.render( scene, camera );
}
animate();
