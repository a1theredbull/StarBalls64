var scene, camera, renderer;
var ship, targetSun;
var shapes = [];
var numShapes = 100;
var directionalLight;
var shapeMaterial;

function init() {
	/* SCENE */
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 1, 8000);

	/* CAMERA */
	camera.position.z = 1000;
	scene.add(camera);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	/* OBJECTS */
	var shipMaterial = new THREE.MeshLambertMaterial({color: 0x172E00});
	var shapeMaterial = new THREE.MeshLambertMaterial({color: 0xE34F12});
	var sunMaterial = new THREE.MeshLambertMaterial({color: 0xFFFF00});

	ship = new THREE.Mesh(new THREE.CylinderGeometry(80,80,80,6,1,false), shipMaterial);
	ship.position.z = 700;
	scene.add(ship);

	targetSun = new THREE.Mesh(new THREE.SphereGeometry(500, 200, 200), sunMaterial);
	targetSun.position.set(0,0,-8000);
	scene.add(targetSun);

	generateShapes();

	/* MOUSE */
	document.onmousemove = handleMouseMove;

	/* LIGHTS */
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	directionalLight = new THREE.PointLight(0xFFFFFF, 3);
	directionalLight.position.set(10, 0, -500);
	scene.add(directionalLight);

	render();
}

init();

/* ACTION */
function render() {
	requestAnimationFrame(render);
	ship.rotation.y += 0.02;
	targetSun.position.z += 1;
	if(targetSun.position.z > 1000) {
		targetSun.position.z = -8000;
	}

	for(var i = 0; i < shapes.length; i++) {
		shapes[i].position.z += shapes[i].speed;
		shapes[i].rotation.x += 0.03;

		if(shapes[i].position.z > 1000) {
			shapes[i].position.x = Math.random() * 5600 - 2800;
			shapes[i].position.y = Math.random() * 3200 - 1600;
			shapes[i].position.z = -6000;
		}
	}
	renderer.render(scene, camera);
}

var mouseY;

function handleMouseMove(event) {
	mouseY = event.clientY;
	ship.position.x = (event.clientX - 700) * 0.8;
	ship.position.y = -(event.clientY - 350) * 0.8;
}

function generateShapes() {
	var shape;
	var randX, randY, randZ;

	for(var i = 0; i < numShapes; i++) {
		randX = Math.random() * 5600 - 2800; //-1400 to 1400
		randY = Math.random() * 3200 - 1600; //-800 to 800
		randZ = Math.random() * -6000 - 2000;

		shape = new THREE.Mesh(new THREE.SphereGeometry(60, 8, 8), shapeMaterial);
		shape.speed = Math.random() * 60 + 20;
		shape.position.set(randX, randY, randZ)
		scene.add(shape);
		shapes.push(shape);
	}
}