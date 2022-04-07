import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControlsJsm.js';
import { TextGeometry } from './TextGeometry.js';
import { FontLoader } from './FontLoader.js';

const loader = new FontLoader();
const font = await loader.loadAsync('./gentilis_regular.typeface.json');

// necessary global objects
var scene;
var renderer;
var camera;

// objects in the scene that we want to access outside of init
var group;

// ---------------- HELPER FUNCTIONS ----------------

// convert latitude and longitude coordinates into xyz coordinates
function calcPosFromLatLonRad(lat, lng, rad) {
    // north pole has phi = 0, south pole has phi = PI
    // but north pole has lat = 90 and south pole has lat = -90
    // so must convert
    var phi = (90 - lat) * (Math.PI / 180);

    // similarly, must convert longitude to appropriate range for theta
    var theta = (lng + 180) * (Math.PI / 180);

    // calculate xyz based on angles
    let x = -(Math.sin(phi) * Math.cos(theta));
    let z = Math.sin(phi) * Math.sin(theta);
    let y = Math.cos(phi);

    // multiply so that it has correct radius
    let vec = new THREE.Vector3(x, y, z).multiplyScalar(rad);
    return vec;
}

function textMesh(s, font, markerColor) {
    let mesh = new THREE.Mesh(
        new TextGeometry(
            s,
            {
                font: font,
                size: 0.05,
                height: 0.001,
                curveSegments: 10,
                bevelEnabled: false,
            }
        ),
        new THREE.MeshStandardMaterial({ color: markerColor })
    );
    return mesh;
}

// add a marker to the globe
// NOTE: googled coordinates will be given as degrees N/S and E/W,
//       but this function expects S and W coordinates to be negative
//       e.g. (45.4215 N, 75.6972 W) should be passed in as (45.4215, -75.6972)
function addMarker(name, lat, lng, markerColor, font, group) {
    let mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 20, 20),
        new THREE.MeshStandardMaterial({ color: markerColor })
    );

    // .copy() sets mesh.position = a copy of the calculated pos vector
    mesh.position.copy(calcPosFromLatLonRad(lat, lng, 1));

    let text = textMesh(name, font, markerColor);
    text.position.copy(calcPosFromLatLonRad(
        lat - 1,  // move text south a little
        lng + 2,  //           and east a little
        1.01      //           and off the earth a little
    ));
    text.rotateY((lng + 90) * Math.PI / 180);  // rotate sideways i.e. around equator
    text.rotateX(-lat * Math.PI / 180);        // rotate vertically i.e. up and down

    console.log(name, lat, lng);

    group.add(mesh);
    group.add(text);
}

// ---------------- MAIN CODE ----------------

function init() {
    // basic scene objects
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 3;
    scene.add(camera);

    // group of all of the objects we want to render in our scene
    group = new THREE.Group();
    scene.add(group);

    // globe
    const geometry = new THREE.SphereGeometry(1, 40, 40);
    const material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('./img/globe.jpg'),
        bumpMap: new THREE.TextureLoader().load('./img/earthbump1k.jpg'),
        bumpScale: 0.05,
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.target = sphere;
    sun.position.set(7, 10, 7);
    camera.add(sun);

    // add markers to cool cities
    addMarker('Ottawa', 45.4215, -75.6972, 0x000000, font, group);
    addMarker('Nairobi', -1.286389, 36.817223, 0x000000, font, group);
    addMarker('Rio de Janeiro', -22.908333, -43.196388, 0x000000, font, group);
}

function animate() {
    // request for animate() to be called again next frame
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    group.rotation.y += 0.0025;
}

// ---------------- RUN PROGRAM ----------------

init();
animate();
