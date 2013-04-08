var scene, camera, renderer;
var ship;
var shapes = [];
var numShapes = 170;
var directionalLight, shipLight;
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
	var shipMaterial = new THREE.MeshPhongMaterial({color: 0x172E00});

	ship = new THREE.Mesh(new THREE.CylinderGeometry(60, 80, 30, 8, 1, false), shipMaterial);
	ship.position.z = 700;
	scene.add(ship);

	generateShapes();

	/* MOUSE */
	document.onmousemove = handleMouseMove;

	/* LIGHTS */
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	shipLight = new THREE.SpotLight(0xFFFFFF, 6, 6000, true);
	shipLight.position.z = 800;
	shipLight.shadowCameraFov = 100;
	scene.add(shipLight);

	directionalLight = new THREE.PointLight(0xFFFFFF, 0.2);
	directionalLight.position.set(0, 0, 750);
	scene.add(directionalLight);
	

	render();
}

init();

/* ACTION */
function render() {
	requestAnimationFrame(render);
	ship.rotation.y += 0.02;

	for(var i = 0; i < shapes.length; i++) {
		shapes[i].position.z += shapes[i].speed;
		shapes[i].rotation.x += 0.2;

		if(shapes[i].position.z > 1000) {
			shapes[i].position.x = Math.random() * 7000 - 3500; //5600-2800
			shapes[i].position.y = Math.random() * 5000 - 2500; //3200-1600
			shapes[i].position.z = -8000;
		}
	}
	renderer.render(scene, camera);
}

function handleMouseMove(event) {
	ship.position.x = (event.clientX - 700) * 0.8;
	ship.position.y = -(event.clientY - 350) * 0.8;
	shipLight.position.x = directionalLight.position.x = -ship.position.x;
	shipLight.position.y = directionalLight.position.y = -ship.position.y;
}

function generateShapes() {
	var shape;
	var randX, randY, randZ, randColor;

	for(var i = 0; i < numShapes; i++) {
		randX = Math.random() * 10000 - 5000; //-1400 to 1400
		randY = Math.random() * 6000 - 300; //-800 to 800
		randZ = Math.random() * -6000 - 4000;
		randColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16); //gets random color

		shapeMaterial = new THREE.MeshLambertMaterial({color: randColor });
		shape = new THREE.Mesh(new THREE.SphereGeometry(60, 10, 10), shapeMaterial);
		shape.speed = Math.random() * 260 + 10;
		shape.position.set(randX, randY, randZ)

		scene.add(shape);
		shapes.push(shape);
	}
}