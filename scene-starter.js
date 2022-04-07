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
    // marker mesh
    let mesh;
    // ... TODO ...

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

function init(font) {
    // basic scene objects
    // ... TODO ...

    // set up camera
    // ... TODO ...

    // group of all of the objects we want to render in our scene
    // ... TODO ...

    // globe
    // ... TODO ...

    // lighting
    // ... TODO ...

    // add markers to cool cities
    // ... TODO ...
}

function animate() {
    // ... TODO ...
}

// ---------------- RUN PROGRAM ----------------

init();
animate();
