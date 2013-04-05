var scene, camera, renderer;
var ship;
var particles = [];
var directionalLight;

function init() {
	/* SCENE */
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 1, 4000);

	/* CAMERA */
	camera.position.z = 1000;
	scene.add(camera);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	/* OBJECTS */
	var shipMaterial = new THREE.MeshLambertMaterial({color: 0x172E00});

	ship = new THREE.Mesh(new THREE.CylinderGeometry(200,200,200,6,1,false), shipMaterial);
	scene.add(ship);

	material = new THREE.ParticleCanvasMaterial( { color: 0xffffff, program: particleRender } );
	// make the particle
	particle = new THREE.Particle(material);
	scene.add(particle);

	particles = [];
	makeParticles();

	/* MOUSE */
	document.onmousemove = handleMouseMove;

	/* LIGHTS */
	directionalLight = new THREE.PointLight(0xFFFFFF, 1);

	directionalLight.position.set(0, 0, 100);
	scene.add(directionalLight);

	render();
}

init();

/* ACTION */
function render() {
	requestAnimationFrame(render);
	ship.rotation.y += 0.02;
	updateParticles();
	renderer.render(scene, camera);
}

var mouseY;

function handleMouseMove(event) {
	mouseY = event.clientY;
	ship.position.x = (event.clientX - 750) * 1.4;
	ship.position.y = -(event.clientY - 450) * 1.4;
}

function makeParticles() { 
	var particle, material; 
 
	// we're gonna move from z position -1000 (far away) 
	// to 1000 (where the camera is) and add a random particle at every pos. 
	for ( var zpos= -1000; zpos < 1000; zpos+=20 ) {
 
		// we make a particle material and pass through the 
		// colour and custom particle render function we defined. 
		material = new THREE.ParticleCanvasMaterial( { color: 0xffffff, program: particleRender } );
		// make the particle
		particle = new THREE.Particle(material);
 
		// give it a random x and y position between -500 and 500
		//particle.position.x = Math.random() * 1000 - 500;
		//particle.position.y = Math.random() * 1000 - 500;
 		particle.position.x = 0;
 		particle.position.y = 0;

		// set its z position
		particle.position.z = zpos;
 
		// scale it up a bit
		particle.scale.x = particle.scale.y = 10;
 
		// add it to the scene
		scene.add(particle);
 
		// and to the array of particles. 
		particles.push(particle); 
	}
}

function particleRender( context ) {
	// we get passed a reference to the canvas context
	context.beginPath();
	// and we just have to draw our shape at 0,0 - in this
	// case an arc from 0 to 2Pi radians or 360º - a full circle!
	context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
	context.fill();
};

function updateParticles() { 
	// iterate through every particle
	for(var i=0; i<particles.length; i++) {
		particle = particles[i]; 

		// and move it forward dependent on the mouseY position. 
		particle.position.z +=  mouseY * .01;
 
		// if the particle is too close move it to the back
		if(particle.position.z>1000) particle.position.z-=2000; 
	}
}