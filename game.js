let canvas0 = document.getElementById("myCanvas0");
let ctx0    = canvas0.getContext("2d", {alpha: false});
let canvas1 = document.getElementById("myCanvas1");
let ctx1    = canvas1.getContext("2d");

//center all origins
ctx0.translate(canvas0.width / 2, canvas0.height / 2);
ctx1.translate(canvas1.width / 2, canvas1.height / 2);
let radius = canvas0.height / 2;

function draw(e) {
    ctx0.drawImage(e.image, e.x, e.y, e.width, e.height);
}

//World
let wState  = {
    rotate: 0, 
    thrust: 0, 
    deg: 0, 
    thrustForce: 2, 
    dx: 0, 
    dy: 90,
    paused: false,
    alive: true,
};

let spawnState = {
    timer: 0,
    interval: 180,
    foodRange: 10,
    abilityRange: 15,
};

let hud = {
    score: {
        value: 0,
        x: 0,
        y: 0, 
    },

    lifeMeter: {
        vale: 100,
        x: 0,
        y: 0,
    },

    foodMeter: {
        value: 100,
        x: 0,
        y: 0,
    },
};

let entites = {

};

let entitySet = {};
let count = 0;

let logo = new Image();
logo.src ="blueberry.jpg";


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
    var radgrad = ctx1.createRadialGradient(0, 0, 0, 0, 0, 540);
    radgrad.addColorStop(0, 'rgba(200, 200, 200, 0.5)');
    radgrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx1.fillStyle = radgrad;
    ctx1.fillRect(-920, -920, 1920, 1920);
}

function drawHUD(hud) {

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
    console.log("e spawn");
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
            entityDraw(e);
            //entityLocUpdate(e);
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

function entityDraw(e) {
    ctx0.drawImage(logo, e.co.x - e.value * 10, e.co.y - e.value * 10, e.value * 20, e.value * 20);
}

function entityLocUpdate(e) {
    if(wState.thrust) {
        e.co.x += e.deltas.dx + ((wState.dx / 90) * wState.thrust) * wState.thrustForce;
        e.co.y += e.deltas.dy + ((wState.dy / 90) * wState.thrust) * wState.thrustForce;
    }
    else {
        e.co.x += e.deltas.dx;
        e.co.y += e.deltas.dy;
    }
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


//UI controls
function menuInput(e) {
    switch(e.target.id) {
        case "play":        playGame();
            break;
        case "startOptions":optionsMenu(true);
            break;
        case "easy":        easy();
            break;
        case "medium":      medium();
            break;
        case "hard":        hard();
            break;
        case "AI":          ai();
            break;
        case "back":        back(wState.paused);
            break;
        case "fullScreen":  fullScreen();
            break;
        case "resume":      resume();
            break;
        case "restart":     restart();
            break;
        case "pauseOptions":optionsMenu(false);
            break;
        case "quit":        quit();
            break;
    }
}

function playGame() {
    console.log("play called");
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("game").style.display = "block";
    wState.alive = true;
    draw0(wState, spawnState, entitySet, ctx0);
    draw1();
}

function optionsMenu(b) {
    console.log("options called");
    if(b) {
        document.getElementById("startMenu").style.display = "none";
        document.getElementById("optionsMenu").style.display = "grid";
    }
    else {
        document.getElementById("pauseMenu").style.display = "none";
        document.getElementById("optionsMenu").style.display = "grid";
    }
}

function easy() {
    console.log("easy called");
}

function medium() {
    console.log("medium called");
}

function hard() {
    console.log("hard called");
}

function ai() {
    console.log("ai called");
}

function back(paused) {
    console.log("back called");
    if(paused) {
        document.getElementById("pauseMenu").style.display = "grid";
        document.getElementById("optionsMenu").style.display = "none"; 
    } 
    else {
        document.getElementById("startMenu").style.display = "grid";
        document.getElementById("optionsMenu").style.display = "none";
    } 
    
}

function fullScreen() {
    document.getElementById("gameContainer").mozRequestFullScreen();
}

function resume() {
    console.log("resume called");
    document.getElementById("pauseMenu").style.display = "none";
    wState.paused ^= 1;
}

function restart() {
    killGame();
    wState.alive = true;
    draw0(wState, spawnState, entitySet, ctx0);
    draw1();
    document.getElementById("pauseMenu").style.display = "none";
}

function quit() {
    console.log("quit called");
    killGame();
    document.getElementById("pauseMenu").style.display = "none";
    document.getElementById("startMenu").style.display = "grid";
    document.getElementById("game").style.display = "none";
}

function killGame() {
    console.log("kill called");
    ctx0.clearRect( -970,  -970, 1920, 1920);
    ctx1.clearRect( -970,  -970, 1920, 1920);
    entitySet = {};
    wState.alive = false;
    wState.paused = false;
}


//player controls
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
    else if(e.key == "p") {
        wState.paused ^= 1;
        document.getElementById("pauseMenu").style.display = "grid";    
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
function draw0(wState, sState, eSet, ctx) {
    if(!wState.paused) {
        //frames++
        ctx.clearRect( -970,  -970, 1920, 1920);
        wStatecreen(wState);
        randomEntity(sState, eSet);
        drawThrusters(wState);
        drawEntities(eSet);
    }
    if(wState.alive){
        requestAnimationFrame(function(){
            draw0(wState, sState, eSet, ctx);
        });
    }
    
}

function draw1() {
    drawHaze();
    drawHUD(hud);
    drawShip();
}   


//add handlers

document.addEventListener("keydown",   keyDownHandler, false);
document.addEventListener("keyup",     keyUpHandler,   false);
for (button of document.getElementsByClassName("UI")) {
    button.addEventListener("click", menuInput, false);
}
//let frames = 0;

//setInterval(function () {console.log(frames)}, 1000);
//console.log(ctx);