function createElem(type, parent, className=null) {
	let elem = document.createElement(type);
	parent.appendChild(elem);
	if (className!==null) elem.classList.add(className);
	return elem;
}

function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

String.prototype.toInt = function () {
	return parseInt(this.replace('px', ''));
};

class Field {
	constructor(containerHTML, pipeSpeed=3) {
		this.gameActive = true;
		this.initScoreBlock();
		this.html = createElem('div', containerHTML, 'field');
		this.bird = new Bird(this);
		this.pipeSpeed = pipeSpeed;
		this.height = getComputedStyle(this.html).height.toInt();
		this.width = getComputedStyle(this.html).width.toInt();
		this.pipeGap = this.height / 5;
		this.createPipes();
	}

	initScoreBlock() {
		this.scoreHTML = createElem('p', document.querySelector('.info'), 'score')
		this.scoreHTML.innerText = 0;
		this.score = 0;
	}

	createPipes() {
		this.topPipe = new Pipe('top', this.pipeSpeed, this);
		this.bottomPipe = new Pipe('bottom', this.pipeSpeed, this);
		this.setPipesHeights();
		this.topPipe.move();
		this.bottomPipe.move();
	}

	setPipesHeights() {
		let h1 = getRandInt(this.height / 5, this.height / 2);
		let h2 = this.height - this.pipeGap - h1;
		this.topPipe.setHeight(h1);
		this.bottomPipe.setHeight(h2);
	}


	inGap() {
		return this.bird.getY() > this.topPipe.height &&
			this.bird.getY()+this.bird.height < this.topPipe.height + this.pipeGap;
	}

	checkGap() {
		if (!this.inGap()) this.endGame();
	}

	endGame() {
		if (!this.gameActive) return;
		this.gameActive = false;
		this.clearIntervals();
		document.removeEventListener('click', this.bird.jump);
		console.log("GAME OVER!");
	}

	clearIntervals() {
		clearInterval(this.bird.accelerationId);
		clearInterval(this.bird.movingId);
		clearInterval(this.topPipe.movingId);
		clearInterval(this.bottomPipe.movingId);
	}

	addScore() {
		this.scoreHTML.innerText = ++this.score;
	}

	getHTML() { return this.html; }
}

class Bird {
	constructor(field) {
		this.speed = 0;
		this.acceleration = 0.1;
		this.jumpSize = 5;
		this.field = field;
		this.jump = ()=>this.speed = -this.jumpSize;
		this.html = createElem('div', field.getHTML(), 'bird');
		this.setHeight();
		this.move();
	}

	setHeight() {
		this.html.style.height = getComputedStyle(this.html).width.toInt()*0.555+'px';
		this.height = getComputedStyle(this.html).height.toInt();
	}

	getY() {
		return getComputedStyle(this.html).top.toInt();
	}

	setY(y) {
		this.html.style.top = y+'px';
	}

	getBottom() {
		return getComputedStyle(this.html).bottom.toInt();
	}

	fall() {
		if (this.getBottom()<0) this.field.endGame();
		this.setY(this.getY()+this.speed);
	}
	
	accelerate() {
		this.speed+=this.acceleration;
	}

	handleClicks() {
		document.addEventListener('click', this.jump);
	}

	move() {
		this.accelerationId = setInterval(()=>{this.accelerate()}, 10);
		this.movingId = setInterval(()=>{this.fall()}, 10);
		this.handleClicks();
	}
}

class Pipe {
	constructor(position, speed, field) {
		this.position = position;
		this.speed = speed;
		this.field = field;
		this.draw();
		this.width = getComputedStyle(this.html).width.toInt();
	}

	draw() {
		this.html = createElem('div', this.field.getHTML(), 'pipe');
		this.html.classList.add(this.position);
	}

	setHeight(height) {
		this.height = height;
		this.html.style.height = this.height + 'px';
	}

	getX() {
		return getComputedStyle(this.html).left.toInt();
	}

	getRight() {
		return getComputedStyle(this.html).right.toInt();
	}

	setRight(offset) {
		this.html.style.right = offset + 'px';
	}

	move() {
		this.movingId = setInterval(() => { this.movement() }, 10);
	}

	movement() {
		if (this.getX()+this.width < 0) {
			this.setRight(-this.width);
			if (this.position == 'top') {
				this.field.setPipesHeights();
				this.field.addScore();
			}
		}
		else if (this.getX() < this.field.width / 2 && this.getX() > this.field.width / 2.5) {
			this.field.checkGap();
		}
		this.setRight(this.getRight() + this.speed);
	}

}

new Field(document.querySelector('.game'));
