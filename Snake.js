// CONSTANTS are all CAP
var COLS = 30,
	ROWS = 30;
// IDs, which are constants too
var EMPTY = 0,
	SNAKE = 1,
	FOOD = 2;
// Directions
var LEFT = 0,
	UP = 1,
	RIGHT = 2,
	DOWN = 3;
// Key codes
var L = 37,
	U = 38,
	R = 39,
	D = 40;

var grid = {
	width: null,
	height: null,
	_grid: null,

	init: function(dir, col, row) {
		this.width = col;
		this.height = row;
		this._grid = [];

		for (var i = 0; i < col; i++) {
			this._grid.push([]);
			for (var j = 0; j < row; j++) {
				this._grid[i].push(dir);
			}
		}
	},

	set: function(val, x, y) {
		this._grid[x][y] = val;
	},

	get: function(x, y) {
		return this._grid[x][y];
	}
}

var snake = {

	direction: null,
	last: null,
	_queue: null,

	init: function(dir, x, y) {
		this.direction = dir;

		this._queue = [];

		this.insert(x - 2, y);
		this.insert(x - 1, y);
		this.insert(x, y);


	},
	insert: function(x, y) {
		this._queue.unshift({
			x: x,
			y: y
		});
		this.last = this._queue[0];
	},
	remove: function() {
		return this._queue.pop();
	}
}

function setFood() {
	var empty = [];
	for (var i = 0; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			if (grid.get(i, j) === EMPTY) {
				empty.push({
					x: i,
					y: j
				});
			}
		}
	}


	var randpos = empty[Math.floor(Math.random() * empty.length)];
	grid.set(FOOD, randpos.x, randpos.y);
}


// GAME Objects

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	keystate, frames, score, paused;

function pressKey(evt) {
	keystate[evt.keyCode] = true;
}

function pauseKey(evt) {
	if (evt.keyCode == 80) {
		pause();
	}
}

function main() {
	canvas = document.getElementById("canvas");
	canvas.width = COLS * 20;
	canvas.height = ROWS * 20;
	ctx = canvas.getContext("2d");

	frames = 0;
	keystate = {};

	document.addEventListener('keydown', pressKey);
	document.addEventListener('keyup', function(evt) {
		delete keystate[evt.keyCode];
	});

	init();
	loop();
	document.addEventListener('keydown', pauseKey);

	document.removeEventListener('keydown', pressToStart);

}

function init() {
	score = 0;
	grid.init(EMPTY, COLS, ROWS);
	var sp = {
		x: 4,
		y: ~~((ROWS - 1) / 2)
	};
	snake.init(RIGHT, sp.x, sp.y);
	grid.set(SNAKE, sp.x - 2, sp.y);
	grid.set(SNAKE, sp.x - 1, sp.y);
	grid.set(SNAKE, sp.x, sp.y);

	setFood();

	paused = false;
}



function endGame() {

	document.removeEventListener('keydown', pressKey);
	document.removeEventListener('keydown', pauseKey);
	paused = true;

	ctx.beginPath();
	ctx.strokeStyle = 'red';
	ctx.moveTo(0, 0);
	ctx.lineTo(400, 400);
	ctx.stroke();
	console.log(canvas)
	console.log(ctx)
	console.log('lose');
	document.addEventListener('keydown', pressToStart);
}

function pause() {
	if (!paused) {
		document.removeEventListener('keydown', pressKey);
		paused = true;
	} else {
		paused = false;
		document.addEventListener('keydown', pressKey);
		loop();
	}
}

function loop() {
	update();
	draw();
	// request animation frame
	if (!paused) {
		window.requestAnimationFrame(loop, canvas);
	}
}

function update() {
	frames++;

	if (keystate[L] && snake.direction != RIGHT) snake.direction = LEFT;
	if (keystate[U] && snake.direction != DOWN) snake.direction = UP;
	if (keystate[R] && snake.direction != LEFT) snake.direction = RIGHT;
	if (keystate[D] && snake.direction != UP) snake.direction = DOWN;

	if (frames % 5 === 0) {
		var nx = snake.last.x,
			ny = snake.last.y;
		switch (snake.direction) {
			case LEFT:
				nx--;
				break;
			case UP:
				ny--;
				break;
			case RIGHT:
				nx++;
				break;
			case DOWN:
				ny++;
				break;
		}

		//if (nx < 0 || nx > grid.width - 1 || ny < 0 || ny > grid.height - 1 || grid.get(nx, ny) == SNAKE) { ///Old code
		//	console.log('lose')
		//	return init(); // Or I should show 'U Lose' and show the start button again??
		//}
		if (nx < 0 && snake.direction == LEFT) {
			nx = grid.width - 1;
		}
		if (ny < 0 && snake.direction == UP) {
			ny = grid.height - 1;
		}
		if (nx > grid.width - 1 && snake.direction == RIGHT) {
			nx = 0;
		}
		if (ny > grid.height - 1 && snake.direction == DOWN) {
			ny = 0;
		}
		if (grid.get(nx, ny) == SNAKE) {
			endGame();
		}

		if (grid.get(nx, ny) == FOOD) {
			var tail = {
				x: nx,
				y: ny
			};
			score++;
			setFood();
		} else {
			var tail = snake.remove();
			grid.set(EMPTY, tail.x, tail.y);
			tail.x = nx;
			tail.y = ny;
		}


		grid.set(SNAKE, tail.x, tail.y);
		snake.insert(tail.x, tail.y);
	}
}

function draw() {
	var tw = canvas.width / grid.width,
		th = canvas.height / grid.height;

	for (var i = 0; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			switch (grid.get(i, j)) {
				case EMPTY:
					ctx.fillStyle = 'white';
					break;
				case SNAKE:
					ctx.fillStyle = 'black';
					break;
				case FOOD:
					ctx.fillStyle = 'red';
					break;
			}
			ctx.fillRect(i * tw, j * th, tw, th);
		}
	}

	ctx.fillStyle = 'black';
	ctx.fillText('SCORE: ' + score, 10, canvas.height - 10);
}

function pressToStart(evt) {
	if (evt.keyCode == 13) {
		main();
	}
}

ctx.beginPath();
ctx.font="30px Verdana";
ctx.fillStyle = 'black';
ctx.fillText("Press Enter to start", 150, 300);
ctx.stroke();

document.addEventListener('keydown', pressToStart);