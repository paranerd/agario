function Circle (x, y, size, vel, color, player) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.velocity = vel;
	this.color = color;
	this.player = player;
	this.speed = 1;
	this.collision = false;
	this.pendingGrow = false;
	this.pendingShrink = false;
	this.growAmount = 0;

	this.update = function(dt) {
		this.x += this.velocity.x * this.speed;
		this.y += this.velocity.y * this.speed;

		if (this.x + this.size / 2 >= canvas.width) {
			this.x = canvas.width - this.size / 2;
			this.velocity.x *= -1;
		}
		else if (this.x <= this.size / 2) {
			this.x = this.size / 2;
			this.velocity.x *= -1;
		}
		if (this.y + this.size / 2 >= canvas.height) {
			this.y = canvas.height - this.size / 2;
			this.velocity.y *= -1;
		}
		else if (this.y <= this.size / 2) {
			this.y = this.size / 2;
			this.velocity.y *= -1;
		}

		if (this.pendingGrow) {
			this.size += this.growAmount;
		}
		else if (this.pendingShrink) {
			this.size -= 1;

			if (this.size <= 0) {
				this.size = 0;
			}
		}

		this.pendingGrow = false;
		this.pendingShrink = false;
	};

	this.getPos = function() {
		return {left: this.x, right: this.x + this.size, top: this.y, bottom: this.y + this.size};
	};

	this.grow = function(amount) {
		this.pendingGrow = true;
		this.growAmount = amount;
	}

	this.shrink = function() {
		this.pendingShrink = true;
	}

	this.goLeft = function() {
		this.velocity.x = -Math.abs(this.velocity.x);
	}

	this.goUp = function() {
		this.velocity.y = -Math.abs(this.velocity.y);
	}

	this.goRight = function() {
		this.velocity.x = Math.abs(this.velocity.x);
	}

	this.goDown = function() {
		this.velocity.y = Math.abs(this.velocity.y);
	}

	this.goTo = function(x, y) {
		var vel = {x: x - this.x, y: y - this.y};
		// Normalize
		var divider = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
		var norm_vel = {x: vel.x / divider, y: vel.y / divider};
		this.velocity.x = norm_vel.x;
		this.velocity.y = norm_vel.y;
	}
}
