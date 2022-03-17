import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControlsJsm.js';
import { TextGeometry } from './TextGeometry.js';
import { FontLoader } from './FontLoader.js';

// necessary global objects
var scene;
var renderer;
var camera;

// objects in the scene that we want to access outside of init
var group;

// convert latitude and longitude coordinates into a useable form
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
                height: 0.01,
                curveSegments: 10,
                bevelEnabled: false,
            }
        ),
        new THREE.MeshStandardMaterial({ color: markerColor })
    )
    return mesh;

}
// add a marker to the globe
// NOTE: googled coordinates will be given as degrees N/S and E/W,
//       but this function expects S and W coordinates to be negative
//       e.g. (45.4215 N, 75.6972 W) should be passed in as (45.4215, -75.6972)
function addMarker(name, lat, lng, markerColor, font, group) {
    let mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 40, 40),
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

    group.add(mesh)
    group.add(text)
}

function init(font) {
    // basic scene objects
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 3;

    // group of all of the objects we want to render in our scene
    group = new THREE.Group();
    scene.add(group);

    // globe texture
    const material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('./img/globe.jpg')
    })
    material.bumpMap = new THREE.TextureLoader().load('./img/earthbump1k.jpg');
    material.bumpScale = 0.05;

    // globe mesh
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 20, 20),
        material
    );
    group.add(sphere);

    // lighting
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);
    const light = new THREE.PointLight(0xffffff, 10, 20);
    light.position.set(10, 10, 10);
    scene.add(light);

    // add markers to cool cities
    addMarker('Ottawa', 45.4215, -75.6972, 0xff0000, font, group);
    addMarker('Nairobi', -1.286389, 36.817223, 0x0000ff, font, group);
    addMarker('Rio de Janeiro', -22.908333, -43.196388, 0x00ff00, font, group);

    // start animating
    animate();
}

function animate() {
    // request for animate() to be called again next frame
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    group.rotation.y += 0.005
}

const loader = new FontLoader();
const font = loader.load(
    './gentilis_regular.typeface.json',
    // onLoad
    function (font) {
        // init once font is loaded in
        init(font);
    },
    // onProgress (ignore)
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // onError (ignore)
    function (err) {
        console.log('An error happened');
    }
);
