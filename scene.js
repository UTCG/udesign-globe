import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControlsJsm.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

// const spherePosition = new THREE.Vector3(0, 0, 0);
// const geometry = new THREE.SphereGeometry(0.75, 16, 32);
// geometry.position = spherePosition;
// const wireframe = new THREE.WireframeGeometry( geometry );
// const material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('./img/globe.jpg') } );
const material = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('./img/globe.jpg')
    })

material.bumpMap   = new THREE.TextureLoader().load('./img/earthbump1k.jpg');     
material.bumpScale = 0.05;

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 30, 30),
    material
    );
scene.add( sphere );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 3;

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

const light = new THREE.PointLight( 0xffffff, 10, 20 );
light.position.set(10, 10, 10);
scene.add( light );

// convert latitude and longitude coordinates into a useable form
function calcPosFromLatLonRad(lat, lng) {
    var phi = (90 - lat) * (Math.PI/180);
    var theta = (lng + 180) * (Math.PI/180);
    let x = (-(Math.sin(phi)*Math.cos(theta)));
    let z = (Math.sin(phi)*Math.sin(theta));
    let y = (Math.cos(phi));

    return {x, y, z};
}

// add a marker to the globe. NOTE: googled coordinates will NOT show negative signs, so verify if there should be a negative.
function addMarker(lat, lng, markerColor) {
    let mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 20, 20),
            new THREE.MeshStandardMaterial({ color: markerColor })
        )

    let pos = calcPosFromLatLonRad(lat, lng)

        mesh.position.set(pos.x, pos.y, pos.z)

        sphere.add(mesh)
}

// Ottawa
addMarker(45.4215, -75.6972, 0xff0000)

// Nairobi
addMarker(-1.286389, 36.817223, 0x0000ff)

// Rio de Janeiro
addMarker(-22.908333, -43.196388, 0x00ff00)




const group = new THREE.Group()
group.add(sphere)
scene.add(group)

const mouse = {
    x: undefined,
    y: undefined
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    sphere.rotation.y += 0.005
    // group.rotation.y = mouse.x * 0.7
    // group.rotation.x = mouse.y * 0.7
    
}

animate();



// addEventListener('mousemove', () => {
//     mouse.x = (event.clientX / innerWidth) * 2 - 1
//     mouse.y = (event.clientY / innerWidth) * 2 + 1
// })