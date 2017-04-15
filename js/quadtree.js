var allObjects = [],
	quad = new Node(0, new Rectangle(0, 0, canvas.width, canvas.height)),
	colors = ['#4B0082', '#008080', '#002366', '#B57EDC', '#C23B22', '#CB99C9'],
	ctx = canvas.getContext('2d'),
	lastRender = Date.now(),
	lastFpsCycle = Date.now(),
	last = Date.now(),
	lastUpdate = Date.now(),
	lastSpawn = 0,
	requestId;

window.onload = function() {
	init(20);
	animate();
}

function normalize(vec) {
	var divider = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
	return {x: vec.x / divider, y: vec.y / divider};
}

function spawn(player) {
	var x = Math.floor(Math.random() * canvas.width); // random between 0 and 150
	var y = Math.floor(Math.random() * canvas.height);
	var size = (player) ? 20 : Math.floor(Math.random() * 20) + 5; // random between 5 and 20
	var velX = Math.floor(Math.random() * 3) - 1.5; // random between -1.5 and 1.5
	var velY = Math.floor(Math.random() * 3) - 1.5;
	var vel = normalize({x: velX, y: velY});
	var color = (player) ? 'black' : colors[Math.floor(Math.random() * (colors.length - 1))];
	var rect = new Circle(x, y, size, vel, color, player);
	allObjects.push(rect);
	lastSpawn = Date.now();
}

function init(count) {
	canvas.style.top = (window.innerHeight - canvas.height) / 2 + 20 + "px";
	canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
	// Player
	spawn(true);

	// Enemies
	for (var i = 0; i < count; i++) {
		spawn(false);
	}
}

canvas.onmousemove = function(e) {
	if (allObjects.length > 0) {
		allObjects[0].goTo(e.clientX - canvas.style.left.replace(/px/g, ''), e.clientY - canvas.style.top.replace(/px/g, ''));
	}
}

document.onkeyup = function(e) {
	switch (e.keyCode) {
		case 37: // Left
			allObjects[0].goLeft();
			break;
		case 38: // Up
			allObjects[0].goUp();
			break;
		case 39: // Right
			allObjects[0].goRight();
			break;
		case 40: // Down
			allObjects[0].goDown();
			break;
	}
}

function collide(entity1, entity2) {
	ent1 = entity1.getPos();
	ent2 = entity2.getPos();

	var dist = Math.sqrt(Math.pow(entity1.x - entity2.x, 2) + Math.pow(entity1.y - entity2.y, 2));
	return (dist < entity1.size / 2 + entity2.size / 2);
}

// GAME LOOP
function animate() {
	var delta = (Date.now() - lastRender) / 1000;
	update(delta);
	lastRender = Date.now();
	draw();

	requestId = window.requestAnimFrame(animate);
};

// UPDATE
function update(dt) {
	var start = Date.now();
	quad.clear();
	for (var i = allObjects.length - 1; i >= 0; i--) {
		if (allObjects[i].size > 0) {
			allObjects[i].update();
			quad.insert(allObjects[i]);
		}
		else {
			allObjects.splice(i, 1);
		}
	}

	var possColl = [];
	for (var i = 0; i < allObjects.length; i++) {
		possColl.length = 0;
		possColl = quad.retrieve(possColl,  allObjects[i]);
		for (var j = 0; j < possColl.length; j++) {
			var coll = collide(allObjects[i], possColl[j]);
			if (coll && allObjects[i] != possColl[j]) {
				allObjects[i].collision = true;
				possColl[j].collision = true;
				// When growing, take 1px from the victim and add a relative amount of pixels to the attacker
				// So when a 20px attacks a 10px, it gets 0.5px
				if (allObjects[i].size > possColl[j].size && possColl[j].size > 0) {
					allObjects[i].grow(possColl[j].size / allObjects[i].size);
					possColl[j].shrink();
				}
				else if (allObjects[i].size < possColl[j].size && allObjects[i].size > 0) {
					possColl[j].grow(allObjects[i].size / possColl[j].size);
					allObjects[i].shrink();
				}
			}
		}
	}

	kontrolle.innerHTML = "Score: " + Math.floor(allObjects[0].size);

	if (Date.now() - lastSpawn > 2000 && allObjects.length < 10) {
		spawn(false);
	}
};

// DRAW
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for (var o of allObjects) {
		if (o.collision) {
			ctx.beginPath();
			ctx.strokeStyle = "red";
			ctx.lineWidth = "0.5";
			ctx.arc(o.x, o.y, o.size / 2, 0, 2 * Math.PI);
			ctx.stroke();
		}
		else {
			ctx.beginPath();
			ctx.arc(o.x, o.y, o.size / 2, 0, 2 * Math.PI);
			ctx.fillStyle = o.color;
			ctx.fill();
		}
		o.collision = false;
	}
};
