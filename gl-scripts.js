var scene, camera, renderer;
var ship;
var shapes = [];
var numShapes = 80;
var shapeRadMultiplier = 400;
var minShapeRadius = 400;
var maxSpawnDistance = 28000;

var maxSpeed = 270;

var randSpawnWidth = 8000;
var randSpawnHeight = 6000;
var directionalLight, shipLight, shipGlowLight;
var shapeMaterial;

var collisions = 0;
var startTime, currentTime;
var bestTime = 0;

var lastMouseX = 0;
var lastMouseY = 0;
var mouseLeftDown = false;
var mouseRightDown = false;

var leanSpeed = 0.03;

var stats;
var gauge;

var stop = false;

var audioQuote;
var falconQuotes = ["dontdie.wav", "gdiffuser.wav", "horrible.wav", "notbuddy.wav", "quitmoving.wav", "einstein.wav", "havefun.wav", "itsworking.wav", "outofmyway.wav", "someonepay.wav"];
var frogQuotes = ["9000.wav", "canyoumakeit.wav", "nohide.wav", "pieceofme.wav", "wemadeit.wav", "bigone.wav", "heatup.wav", "tooclose.wav", "yeahyeah.wav"];
var rabbitQuotes = ["barrelroll.wav", "goodwork.wav", "instincts.wav", "keeppace.wav", "toolow.wav", "betterpilot.wav", "father.wav", "incoming.wav", "itsatrap.wav", "lifeflash.wav", "tooquiet.wav"];

//lower for faster acceleration
var accel = 14000;

//every 400 asteroids missed, the cow will say something
var asteroidsMissed = 200;

function init() {
	$('#portrait').fadeOut('fast');
	$('#incomingMsg').fadeOut('fast');

	/* SCENE */
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	/* OBJECTS */
	var shipMaterial = new THREE.MeshPhongMaterial({
		color: 0x888888,
		ambient: 0x888888,
		specular: 0x050505,
		shininess: 300
	});

	ship = new THREE.Mesh(new THREE.CylinderGeometry(120, 144, 36, 30, 2, false), shipMaterial);
	ship.position.z = 0;
	scene.add(ship);

	generateShapes();

	/* ACTIONS */	
	$(window).resize(onWindowResize);
	$(document).mousemove(handleMouseMove);
	$(document).click(restart);
	$(document).mousedown(handleMouseDown);
	$(document).mouseup(handleMouseUp);
	$(document).ready(function() {
		$(document).bind("contextmenu", function(e) {
			return false;
		});
	});

	/* LIGHTS */
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	shipLight = new THREE.SpotLight(0xFFFFFF, 2, 50000, true);
	shipLight.position.z = 400;
	shipLight.distance = maxSpawnDistance;
	shipLight.target = ship;
	scene.add(shipLight);

	directionalLight = new THREE.DirectionalLight(0x111111, 0.1);
	directionalLight.distance = maxSpawnDistance * 0.8;
	scene.add(directionalLight);

	startTime = (new Date).getTime();
	
	camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 1, maxSpawnDistance);

	/* CAMERA */
	camera.position.z = 1400;

	ship.add(camera);
	camera.target = ship;

	stats = new Stats();
	stats.setMode(2);

	stats.domElement.style.position ='absolute';
	stats.domElement.style.left = '25px';
	stats.domElement.style.top = '25px';

	document.body.appendChild(stats.domElement);

	var opts = {
		lines: 20, // The number of lines to draw
		angle: 0, // The length of each line
		lineWidth: 0.44, // The line thickness
		pointer: {
			length: 0.9, // The radius of the inner circle
			strokeWidth: 0.035, // The rotation offset
			color: '#000000' // Fill color
		},
		colorStart: '#FF0000',   // Colors
		colorStop: '#FF0000',    // just experiment with them
		strokeColor: '#FFFFFF',   // to see which ones work best for you
		generateGradient: true
	};

	gauge = new Gauge($('#gauges')[0]);
	gauge.setOptions(opts); // create sexy gauge!
	gauge.minValue = shapes[0].speed;
	gauge.maxValue = maxSpeed; // set max gauge value
	gauge.animationSpeed = 1; // set animation speed (32 is default value)

	$('#bestTime')[0].innerHTML = "No Records";

	var audio = document.createElement("audio");
	audio.src = "sounds/letsrock.wav";
	audio.play();					

	render();
}

init();

var speedUpdate, gaugeLevel, maxLevel, newSpeed, collisionDetected;
var targetX, targetY, futureX, futureY;
var possibleCollidable = [];

/* ACTION */
function render() {
	currentTime = (new Date).getTime() - startTime;
	var currentSeconds = currentTime/1000;
	$('#time')[0].innerHTML = currentSeconds + " seconds";

	if(!stop)
		requestAnimationFrame(render);

	speedUpdate = (1 + currentTime/accel);
	gaugeLevel = speedUpdate * shapes[0].speed;
	maxLevel = gaugeLevel < maxSpeed? gaugeLevel : maxSpeed;
	gauge.set(maxLevel); // set actual value
	
	//ship update
	if(mouseLeftDown) {
		if(ship.rotation.z < Math.PI/2) {
			ship.rotation.z += leanSpeed;
			camera.rotation.z -= leanSpeed;
		}
	}
	else {
		if(ship.rotation.z > 0) {
			ship.rotation.z -= leanSpeed;
			camera.rotation.z += leanSpeed;
		}
	}

	if(mouseRightDown) {
		if(ship.rotation.z > -Math.PI/2) {
			ship.rotation.z -= leanSpeed;
			camera.rotation.z += leanSpeed;
		}
	}
	else {
		if(ship.rotation.z < 0) {
			ship.rotation.z += leanSpeed;
			camera.rotation.z -= leanSpeed;
		}
	}		
		

	collisionDetected = false;
	possibleCollidable = [];
	//shapes update
	for(var i = 0; i < shapes.length; i++) {
		randBool = Math.random() - 0.5 < 0;
		newSpeed = shapes[i].speed * speedUpdate;
		shapes[i].position.z += newSpeed < maxSpeed ? newSpeed : maxSpeed;
		//only test those in front of you
		if(shapes[i].position.z > -500) {
			possibleCollidable.push(shapes[i]);
		}

		if(collisions == 1) {
			//single msg			
			if(!stop) {
				var loseContain = document.createElement('div');
				loseContain.id = 'loseContainer';

				var loseMsg = document.createElement('div');
				loseMsg.id = 'loseMsg';
				loseMsg.innerHTML = "You died! Click to restart.";

				loseContain.appendChild(loseMsg);				
				document.body.appendChild(loseContain);

				var audio = document.createElement("audio");
				audio.src = "sounds/Frog/ohno.wav";
				audio.play();

				if(currentSeconds > bestTime) {
					bestTime = Math.round((currentSeconds + .016)*1000) / 1000;
					$('#bestTime')[0].innerHTML = "Best: " + bestTime + " seconds";
				}
			}
			stop = true;
			return;		
		}	

		if(shapes[i].position.z > 1000) {
			asteroidsMissed++;
			shapes[i].position.x = (Math.random() * randSpawnWidth) - randSpawnWidth/2;
			shapes[i].position.y = (Math.random() * randSpawnHeight) - randSpawnHeight/2;
			shapes[i].position.z = -maxSpawnDistance;
		}
	}

	collisionDetected = detectCollisions(possibleCollidable);
	if(!collisionDetected) {
		if(asteroidsMissed > 400) {
			var character = Math.floor(Math.random()*3) + 1;
			var folder;
			var quote;
	
			if(character == 1) { //falcon
				quote = falconQuotes[Math.floor(Math.random() * falconQuotes.length)];
				folder = "Falcon/";
				$('#portrait')[0].src = "pictures/falcon.jpg"; 
			}
			else if(character == 2) { //frog
				quote = frogQuotes[Math.floor(Math.random() * frogQuotes.length)];
				folder = "Frog/";
				$('#portrait')[0].src = "pictures/frog.jpg";
			}
			else if(character == 3) { //rabbit
				quote = rabbitQuotes[Math.floor(Math.random() * rabbitQuotes.length)];
				folder = "Rabbit/";
				$('#portrait')[0].src = "pictures/rabbit.jpg";
			}

			$('#incomingMsg').fadeIn();
			$('#portrait').fadeIn(function() {
				var audio = document.createElement("audio");

				audio.src = "sounds/" + folder + quote;
				audio.play();
					
				audio.addEventListener('ended', function() {
				$('#portrait').fadeOut();
				$('#incomingMsg').fadeOut();
				}, false);
			});

			asteroidsMissed = 0;	
		}
	}

	targetX = (lastMouseX / window.innerWidth) * 2 - 1;
	targetY = (lastMouseY / window.innerHeight) * 2 - 1;
	futureX = ship.position.x + targetX * 90;
	futureY = ship.position.y - targetY * 60;

	if(futureX >= -(randSpawnWidth/2)+400 && futureX <= (randSpawnWidth/2)-400)
		ship.position.x = futureX;
	if(futureY >= -(randSpawnHeight/2)+400 && futureY <= (randSpawnHeight/2)-400)
		ship.position.y = futureY;
	shipLight.position.x = ship.position.x;
	shipLight.position.y = ship.position.y;
	stats.update();

	renderer.render(scene, camera);
}

function onWindowResize(event) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleMouseMove(event) {
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}

function handleMouseDown(event) {
	switch(event.which) {
		case 1:
			mouseLeftDown = true;
			break;
		case 3:
			mouseRightDown = true;
			break;
		default:
			console.log("WHAT");
	}
}

function handleMouseUp(event) {
	switch(event.which) {
		case 1:
			mouseLeftDown = false;
			break;
		case 3:
			mouseRightDown = false;
			break;
		default:
			console.log("WHAT");
	}
}

/* OTHER STUFF */
function generateShapes() {
	var shape;
	var randX, randY, randZ, randColor, randRadius;
	var randBool;

	for(var i = 0; i < numShapes; i++) {
		randX = (Math.random() * randSpawnWidth) - randSpawnHeight/2;
		randY = (Math.random() * randSpawnHeight) - randSpawnHeight/2;
		randZ = Math.random() * -maxSpawnDistance * 0.75 - 10000;
		randColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16); //gets random color
		randRadius = (Math.random() * shapeRadMultiplier) + minShapeRadius;

		shapeMaterial = new THREE.MeshPhongMaterial({
			color: randColor,
			ambient: randColor,
			specular: 0x050505,
			shininess: 800
		});


		shape = new THREE.Mesh(new THREE.SphereGeometry(randRadius, 30, 30), shapeMaterial);
		shape.speed = (randRadius) / 8;
		shape.position.set(randX, randY, randZ);
		shape.rotation.x = Math.PI / 2;

		scene.add(shape);
		shapes.push(shape);	
	}
}

function detectCollisions(collidable) {
	var originPoint = ship.position.clone();

	for (var vertexIndex = 0; vertexIndex < ship.geometry.vertices.length; vertexIndex++) {		
		var localVertex = ship.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4(ship.matrix);
		var directionVector = globalVertex.sub(ship.position);

		var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
		var collisionResults = ray.intersectObjects(collidable);
		if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
			console.log("HIT");
			collisions++;
			return true;
		}
	}

	return false;
}

function restart(event) {
	if(!stop)
		return;

	var randX, randY, randZ;

	for(var i = 0; i < shapes.length; i++) {
		randX = (Math.random() * randSpawnWidth) - randSpawnHeight/2;
		randY = (Math.random() * randSpawnHeight) - randSpawnHeight/2;
		randZ = Math.random() * (-maxSpawnDistance * 0.75) - (maxSpawnDistance/2);

		shapes[i].position.set(randX, randY, randZ);
	}

	ship.position.x = 0;
	ship.position.y = 0;
	collisions = 0;
	asteroidsMissed = 200;

	var audio = document.createElement("audio");
	audio.src = "sounds/letsrock.wav";
	audio.play();

	requestAnimationFrame(render);
	stop = false;
	$('#loseMsg').fadeOut(function() {
		$('#loseContainer').remove();
		$('#loseMsg').remove();
	});

	startTime = (new Date).getTime();
}
