let canvas0 = document.getElementById("myCanvas0");
let ctx0 = canvas0.getContext("2d");
let canvas1 = document.getElementById("myCanvas1");
let ctx1 = canvas1.getContext("2d");
let canvas2 = document.getElementById("myCanvas2");
let ctx2 = canvas2.getContext("2d");

//center all origins
ctx0.translate(canvas0.width / 2, canvas0.width / 2);
ctx1.translate(canvas1.width / 2, canvas1.width / 2);
ctx2.translate(canvas2.width / 2, canvas2.width / 2);

//creates black circle around ship
let radius = canvas0.width / 2;
ctx0.beginPath();
ctx0.arc(0, 0, radius, 0, Math.PI * 2, true);
ctx0.clip();


let transforms  = {rotate: 0, thrust: 0, deg: 0, thrustForce: 3, dx: 0, dy: 90};
let score = 0;
let lives = 12;
//let ship = {x: 250, y: 250, dx: 0, dy: 0};
let enemySpeed = 2;
let enemies = {};
let count = 0;
//top layer
function drawShip() {
    ctx1.beginPath();
    ctx1.moveTo(-10, 0);
    ctx1.lineTo(10, 0);
    ctx1.lineTo(0, -20);
    ctx1.fillStyle = "#0f0";
    ctx1.fill();
    ctx1.closePath();
}
function drawHaze() {
    ctx1.fillStyle = "rgba(200, 200, 200, 0.002)";
    for(let i = 1; i < radius; i+= 2) {
        ctx1.beginPath();
        ctx1.arc(0, 0, i, 0, Math.PI * 2);
        ctx1.fill();
        ctx1.closePath();
    }
}
//bottom layer
function randomEnemy() {
    let ponRandom = ~~(Math.random() * 2);
    let randomCoordinate = ponRandom ? ~~(Math.random() * radius): -(~~(Math.random() * radius));
    let delta  = deltaCoor(randomCoordinate);
    let chosen = ~~(Math.random() * 4);
    let rSize  = 1 + ~~(Math.random() * 3);
    switch(chosen) {
        case 0: enemies[count] = {x: -radius, dx: enemySpeed,  y: randomCoordinate, dy: delta,  value: rSize};
                break;
        case 1: enemies[count] = {x: radius,  dx: -enemySpeed, y: randomCoordinate, dy: delta,  value: rSize};
                break;
        case 2: enemies[count] = {x: randomCoordinate, dx: delta,  y: -radius, dy: enemySpeed,  value: rSize};
                break;
        case 3: enemies[count] = {x: randomCoordinate, dx: delta,  y: radius,  dy: -enemySpeed, value: rSize};
                break;
    }
    count++;
}
function drawEnemies() {
    for (enemy in enemies) {
        let e = enemies[enemy];
        if(e.x <  -radius || e.x > radius || e.y <  -radius || e.y > radius) {
            score += e.value;
            delete enemies[enemy]; // don't use delete e, wont delete enemy from enemies object SLOWS DOWN
        } 
        else {
            enemyBuilder(e);
            if(transforms.thrust) {
                e.x += e.dx + ((transforms.dx / 90) * transforms.thrust) * transforms.thrustForce;
                e.y += e.dy + ((transforms.dy / 90) * transforms.thrust) * transforms.thrustForce;
            }
            else {
                e.x += e.dx;
                e.y += e.dy;
            }
        }
    }
}
function enemyBuilder(e) {
    ctx0.beginPath();
    ctx0.arc(e.x, e.y, e.value * 5, 0, Math.PI * 2);
    ctx0.fillStyle = "#a00";
    ctx0.fill();
    ctx0.closePath();
}
function deltaCoor(xoy) {
    return (0 - xoy) / (radius / enemySpeed);
}
function abs(n) {
    return (n ^ (n >> 31)) - (n >> 31);
}
//world motion logic
function transformScreen(trans) {
    if(trans.rotate) {
        trans.deg = (trans.rotate + trans.deg) % 360; //posible bitwise operation for speed up?
        ctx0.rotate((Math.PI / 180) * trans.rotate);
        let absDeg = abs(trans.deg);
        if(absDeg > 270 || absDeg <= 90) {
            trans.dx += trans.rotate;
            trans.dy = 90 - abs(trans.dx);
        }
        else {
            trans.dx -= trans.rotate;
            trans.dy = -(90 - abs(trans.dx));
        }
    }
}
//temporary compass
function drawCompas(){
    ctx0.font = '48px serif';
    ctx0.fillText('N', 0, -200);
    ctx0.fillText('E', 200, 0);
    ctx0.fillText('S', 0, 200);
    ctx0.fillText('W', -200, 0);
}
//Thruster logic
function drawThrusters() {
    if(transforms.rotate) {
        if(transforms.rotate === 1) {
            rightThruster();
        }
        else {
            leftThruster();
        }
    }
    else if(transforms.thrust) {
        rightThruster();
        leftThruster();
    }
}
function rightThruster() {
    ctx2.beginPath();
    ctx2.moveTo(10, 0);
    ctx2.lineTo(0, 0);
    ctx2.lineTo(5, 10);
    ctx2.fillStyle = "#aa0";
    ctx2.fill();
    ctx2.closePath();
}
function leftThruster() {
    ctx2.beginPath();
    ctx2.moveTo(-10, 0);
    ctx2.lineTo(0, 0);
    ctx2.lineTo(-5, 10);
    ctx2.fillStyle = "#aa0";
    ctx2.fill();
    ctx2.closePath();
}
//controls
function keyDownHandler(e) {
    if(e.key == "ArrowRight" || e.key == "d") {
        transforms.rotate = 1;
    }
    else if(e.key == "ArrowLeft" || e.key == "a") {
        transforms.rotate = -1;
    }
    else if(e.key == "ArrowUp" || e.key == "w") {
        transforms.thrust = 1;
    }
    else if(e.key == "ArrowDown" || e.key == "s") {
        transforms.thrust = -1;
    }
    else if(e.key == " ") {
        document.getElementById("game").mozRequestFullScreen();
    }
}

function keyUpHandler(e) {
    if(e.key == "ArrowRight" || e.key == "d") {
    transforms.rotate = 0;
    }
    else if(e.key == "ArrowLeft" || e.key == "a") {
        transforms.rotate = 0;
    }
    else if(e.key == "ArrowUp" || e.key == "w") {
        transforms.thrust = 0;
    }
    else if(e.key == "ArrowDown" || e.key == "s") {
        transforms.thrust = 0;
    }
}

function draw() {
    ctx0.clearRect( -radius,  -radius, 1000, 1000);
    transformScreen(transforms);
    drawCompas();
    drawEnemies();
    drawThrusters();
    requestAnimationFrame(draw);
}

function draw2() {
    ctx2.clearRect(-10, 0, 20, 10);
    drawThrusters();
    requestAnimationFrame(draw2);
}

document.addEventListener("keydown",   keyDownHandler, false);
document.addEventListener("keyup",     keyUpHandler,   false);

setInterval(randomEnemy, 3000);
drawHaze();
drawShip();
draw();
draw2();