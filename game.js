let canvas0 = document.getElementById("myCanvas0");
let ctx0    = canvas0.getContext("2d", {alpha: false});
let canvas1 = document.getElementById("myCanvas1");
let ctx1    = canvas1.getContext("2d");

//center all origins
ctx0.translate(canvas0.width / 2, canvas0.width / 2);
ctx1.translate(canvas1.width / 2, canvas1.width / 2);

//creates black circle around ship
let radius = canvas0.width / 2;
ctx0.beginPath();
ctx0.arc(0, 0, radius, 0, Math.PI * 2, true);
ctx0.clip();


let wState  = {
    rotate: 0, 
    thrust: 0, 
    deg: 0, 
    thrustForce: 2, 
    dx: 0, 
    dy: 90,
    paused: false,
};

let spawnState = {
    timer: 0,
    interval: 60,
    foodRange: 10,
    abilityRange: 15,
};


let score = 0;
let lifeMeter = 100;
let foodMeter = 100;


let enemySet = {};
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
function ranStart() {
    let chosen  = ~~(Math.random() * 4);
    let ranCoor = ~~(Math.random() * 2) ? ~~(Math.random() * radius): -(~~(Math.random() * radius));
    switch(chosen) {
        case 0: return {x: -radius, y: ranCoor};
        case 1: return {x: radius,  y: ranCoor};
        case 2: return {x: ranCoor, y: -radius};
        case 3: return {x: ranCoor, y: radius};
    }
}

function randomEntity(state, enemies) {
    if(state.timer == state.interval) {
        state.timer = 0;
        let co = ranStart();
        let speed = 1 + ~~(Math.random() * 4);
        
        enemies[count] = {
            co: co,
            speed: speed,
            deltas: deltaCo(co, speed),
            value: 1 + ~~(Math.random() * 3),
        };
        count++;
    }
    else {
        state.timer++;
    }
}

/*function entityType() {
    switch(~~(Math.random() * 100)) {
        case 
    };
}*/

function drawEntities(enemies) {
    for(enemy in enemies) {
        let e = enemies[enemy];
        if(e.x <  -radius || e.x > radius || e.y <  -radius || e.y > radius) {
            score += e.value;
            delete enemies[enemy]; // don't use delete e, wont delete enemy from enemies object SLOWS DOWN
        } 
        else {
            enemyBuilder(e);
            if(wState.thrust) {
                e.co.x += e.deltas.dx + ((wState.dx / 90) * wState.thrust) * wState.thrustForce;
                e.co.y += e.deltas.dy + ((wState.dy / 90) * wState.thrust) * wState.thrustForce;
            }
            else {
                e.co.x += e.deltas.dx;
                e.co.y += e.deltas.dy;
            }
        }
    }
}

function enemyBuilder(e) {
    ctx0.beginPath();
    ctx0.arc(e.co.x, e.co.y, e.value * 5, 0, Math.PI * 2);
    ctx0.fillStyle = "#a00";
    ctx0.fill();
    ctx0.closePath();
}

function deltaCo(co, speed) {
    if(co.x < radius && co.x > -radius) {
        return {dx: (0 - co.x) / (radius / speed), dy: (co.y < 0) ? speed: -speed};
    }
    else{
        return {dx: (co.x < 0) ? speed: -speed, dy: (0 - co.y) / (radius / speed)};
    }
}

function abs(n) {
    return (n ^ (n >> 31)) - (n >> 31);
}


//world motion logic
function wStatecreen(trans) {
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
function drawThrusters(world) {
    ctx0.rotate((Math.PI / 180) * -world.deg);
    if(wState.rotate) {
        if(wState.rotate === 1) {
            rightThruster();
        }
        else {
            leftThruster();
        }
    }
    else if(wState.thrust) {
        rightThruster();
        leftThruster();
    }
    ctx0.rotate((Math.PI / 180) * world.deg);
}

function rightThruster() {
    ctx0.beginPath();
    ctx0.moveTo(10, 0);
    ctx0.lineTo(0, 0);
    ctx0.lineTo(5, 10);
    ctx0.fillStyle = "#aa0";
    ctx0.fill();
    ctx0.closePath();
}

function leftThruster() {
    ctx0.beginPath();
    ctx0.moveTo(-10, 0);
    ctx0.lineTo(0, 0);
    ctx0.lineTo(-5, 10);
    ctx0.fillStyle = "#aa0";
    ctx0.fill();
    ctx0.closePath();
}


//controls
function keyDownHandler(e) {
    if(e.key == "ArrowRight" || e.key == "d") {
        wState.rotate = 1;
    }
    else if(e.key == "ArrowLeft" || e.key == "a") {
        wState.rotate = -1;
    }
    else if(e.key == "ArrowUp" || e.key == "w") {
        wState.thrust = 1;
    }
    else if(e.key == "ArrowDown" || e.key == "s") {
        wState.thrust = -1;
    }
    else if(e.key == " ") {
        document.getElementById("game").mozRequestFullScreen();
    }
    else if(e.key == "p") {
        wState.paused ^= 1;
        console.log(wState.paused);
    }
}

function keyUpHandler(e) {
    if(e.key == "ArrowRight" || e.key == "d") {
    wState.rotate = 0;
    }
    else if(e.key == "ArrowLeft" || e.key == "a") {
        wState.rotate = 0;
    }
    else if(e.key == "ArrowUp" || e.key == "w") {
        wState.thrust = 0;
    }
    else if(e.key == "ArrowDown" || e.key == "s") {
        wState.thrust = 0;
    }
}


//setup
function draw0() {
    if(!wState.paused) {
        //frames++
        ctx0.clearRect( -radius,  -radius, 1000, 1000);
        wStatecreen(wState);
        randomEntity(spawnState, enemySet);
        drawCompas();
        drawThrusters(wState);
        drawEntities(enemySet);
    }
    requestAnimationFrame(draw0);
}

function draw1() {
    drawHaze();
    drawShip();
}


document.addEventListener("keydown",   keyDownHandler, false);
document.addEventListener("keyup",     keyUpHandler,   false);

let frames = 0;

//setInterval(function () {console.log(frames)}, 1000);

draw0();
draw1();