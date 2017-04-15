function Node(pLevel, pBounds) {
	this.level = pLevel;
	this.bounds = pBounds;

	this.objects = [];
	this.nodes = [];
	this.MAX_OBJECTS = 5;
	this.MAX_LEVELS = 7;

	this.clear = function() {
		this.objects.length = 0;

		for(var i = 0; i < this.nodes.length; i++) {
			if(this.nodes[i] != null) {
				this.nodes[i].clear();
				this.nodes[i] = null;
			}
		}
	};

	this.splitnode = function() {
		var subWidth = this.bounds.width / 2;
		var subHeight = this.bounds.height / 2;

		var x = this.bounds.x;
		var y = this.bounds.y;

		this.nodes[0] = new Node(this.level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight, this.bounds.velocity, this.bounds.collision)); // top-right
		this.nodes[1] = new Node(this.level + 1, new Rectangle(x, y, subWidth, subHeight, this.bounds.velocity, this.bounds.collision)); // top-left
		this.nodes[2] = new Node(this.level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight, this.bounds.velocity, this.bounds.collision)); // bottom-left
		this.nodes[3] = new Node(this.level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight, this.bounds.velocity, this.bounds.collision)); // bottom-right
	};

	this.getIndex = function(pCirc) {
		// Index -1 means pCirc does not fit in a child-node and
		// remains in the parent
		var index = -1;
		var verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
		var horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

		// Object fits completely in top quadrants
		//var topQuadrant = (pCirc.y < horizontalMidpoint && pCirc.y + pCirc.height < horizontalMidpoint);
		var topQuadrant = pCirc.y + pCirc.size < horizontalMidpoint;
		// Object fits completely in bottom quadrants
		//var bottomQuadrant = (pCirc.y > horizontalMidpoint);
		var bottomQuadrant = (pCirc.y - pCirc.size > horizontalMidpoint);

		// Object fits completely in left quadrants
		//if(pCirc.x < verticalMidpoint && pCirc.x + pCirc.width < verticalMidpoint) {
		if (pCirc.x + pCirc.size < verticalMidpoint) {
			if(topQuadrant) {
				index = 1;
			}
			else if(bottomQuadrant) {
				index = 2;
			}
		}
		// Object fits completely in right quadrants
		//else if(pCirc.x > verticalMidpoint) {
		else if(pCirc.x - pCirc.size > verticalMidpoint) {
			if(topQuadrant) {
				index = 0;
			}
			else if(bottomQuadrant) {
				index = 3;
			}
		}

		return index;
	};

	this.insert = function(pCirc) {
		if(this.nodes[0] != null) {
			var index = this.getIndex(pCirc);

			if(index != -1) {
				// pCirc fits into a quadrant, so insert it there
				this.nodes[index].insert(pCirc);
				return;
			}
		}

		// There are no child nodes or pCirc does not fit in a quadrant
		this.objects.push(pCirc);

		// If node capacity is exceeded and level < max depth, split node
		if(this.objects.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
			if(this.nodes[0] == null) {
				this.splitnode();
			}

			// Distribute all objects of this node into the new sub-nodes if they fit
			// otherwise skip and keep them in parent-node
			var i = 0;
			while(i < this.objects.length) {
				var index = this.getIndex(this.objects[i]);
				if(index != -1) {
					var theSplice = this.objects.splice(i, 1);
					this.nodes[index].insert(theSplice[0]);
				}
				else {
					i++;
				}
			}
		}
	};

	/* retrieve only returns elements that are in or above the last
	 * node they completely fit in
	 * retrieve2 also returns elements in further sub-nodes
	 * This is not always necessary as the element in the deeper
	 * sub-node will also check against collision and find
	 * the elements in all the parent-nodes
	 * Thus, retrieve (1) is more efficient
	 */

	this.retrieve = function(returnObjects, pCirc) {
		var index = this.getIndex(pCirc);
		if(index != -1 && this.nodes[0] != null) {
			returnObjects = this.nodes[index].retrieve(returnObjects, pCirc);
		}

		returnObjects = returnObjects.concat(this.objects);

		return returnObjects;
	};

	this.retrieve2 = function(returnObjects, pCirc) {
		if(this.nodes[0] != null) {
			var index = this.getIndex(pCirc);
			if(index != -1) {
				this.nodes[index].retrieve(returnObjects, pCirc);
			}
			else {
				for(var i = 0; i < this.nodes.length; i++) {
					this.nodes[i].retrieve(returnObjects, pCirc);
				}
			}
		}
		returnObjects = returnObjects.concat(this.objects);

		return returnObjects;
	};

	this.getAllNodes = function(nodes) {
		if(this.nodes[0] != null) {
			for(var i = 0; i < this.nodes.length; i++) {
				this.nodes[i].getAllNodes(nodes);
			}
		}
		nodes.push(this);
		return nodes;
	};
}
