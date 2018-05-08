let canvas0 = document.getElementById("myCanvas0");
let ctx0    = canvas0.getContext("2d");
let canvas1 = document.getElementById("myCanvas1");
let ctx1    = canvas1.getContext("2d");

//center all origins
ctx0.translate(canvas0.width / 2, canvas0.height / 2);
ctx1.translate(canvas1.width / 2, canvas1.height / 2);
let radius = canvas0.height / 2;


//World
const wState  = {
    rotate: 0, 
    thrust: 0, 
    deg: 0, 
    thrustForce: 2, 
    dx: 0, 
    dy: 90,
    paused: false,
    alive: false,
    fs: false,
};

const difState = {
    difMulti: 1.0,
    bSpeed: 1,
    tSpeed: 4,
    timer: 0,
    interval: 180,
    foodRange: 100,
    abilityRange: 200,
    sRadius: radius,
};

const hud = {
    score: {
        count: 0,
        value: 0,
        x: -500,
        y: -450,
        w: 120,
        h: 48,
        draw: function(ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y - 46, this.w, this.h);
            ctx.fillStyle = "#0f0";
            ctx.font = '48px serif';
            ctx.fillText("score: " + this.value, this.x, this.y, this.w);
            //ctx.fillRect(this.x, this.y, this.w, this.h);
        }
    },

    health: {
        value: 1000,
        x: 200,
        y: -500,
        h: 15,
        draw: function(ctx) {
            ctx.fillStyle = "black";
            ctx.clearRect(this.x, this.y, this.value/5, this.h);
            ctx.fillStyle = "#0f0";
            ctx.fillRect(this.x, this.y, this.value/5, this.h);
        }
    },

    energy: {
        value: 1000,
        x: 200,
        y: -450,
        h: 15,
        draw: function(ctx) {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.value/5, this.h);
            ctx.fillStyle = "#f00";
            ctx.fillRect(this.x, this.y, this.value/5, this.h);
        }
    },

    update: function(thrust, ctx) {
        if(thrust) {
            (this.energy.value) ? this.energy.value-- : this.health.value--;
            (this.energy.value) ? this.energy.draw(ctx) : this.health.draw(ctx);
        }
        else {
            this.score.count++;
            if(this.score.count == 60){
                this.score.count = 0;
                this.score.value++;
                this.score.draw(ctx);
            }
        }
    },
};


const entities = {
    entitySet: {},
    count: 0,
    type: {},
};

let ng = {};

let logo = new Image();
logo.src ="blueberry.jpg";


//top layer---------------------------------------------------------------------------------------
function drawShip() {
    ctx1.beginPath();
    ctx1.moveTo(-10, 0);
    ctx1.lineTo(10, 0);
    ctx1.lineTo(0, -20);
    ctx1.fillStyle = "#0f0";
    ctx1.fill();
    ctx1.closePath();
}

function drawHaze(ctx, sRadius) {
    var radgrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRadius);
    radgrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radgrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = radgrad;
    ctx.fillRect(-920, -920, 1920, 1920);
}

function draw1(ctx, h2) {
    ctx.clearRect( -970,  -970, 1920, 1920);
    drawHaze(ctx, radius);
    drawShip();
    h2.score.draw(ctx);
    h2.health.draw(ctx);
    h2.energy.draw(ctx);
}  


//bottom layer---------------------------------------------------------------------------------------
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

function randomEntity(d2, e2) {
    if(d2.timer == d2.interval) {
        d2.timer = 0;
        let co = ranStart();
        let speed = (d2.bSpeed + ~~(Math.random() * d2.tSpeed)) * d2.difMulti;
        
        e2.entitySet[e2.count] = {
            co: co,
            speed: speed,
            deltas: deltaCo(co, speed),
            value: 1 + ~~(Math.random() * 3),
            index: e2.count,
        };
        e2.count++;
    }
    else {
        d2.timer++;
    }
}

/*function entityType() {
    switch(~~(Math.random() * 100)) {
        case 
    };
}*/

function trackEntities(w2, ctx, e2) {
    for(entity in e2.entitySet) {
        let e = e2.entitySet[entity];
        if(e.co.x <  -radius || e.co.x > radius || e.co.y <  -radius || e.co.y > radius) {
            delete e2.entitySet[e.index]; // don't use delete e, wont delete enemy from enemies object SLOWS DOWN
        } 
        else {
            entityDraw(ctx, e);
            entityLocUpdate(w2, e);
        }
    }
}

function entityDraw(ctx, e) {
    ctx.drawImage(logo, e.co.x - e.value * 10, e.co.y - e.value * 10, e.value * 20, e.value * 20);
}

function entityLocUpdate(w, e) {
    if(w.thrust) {
        e.co.x += e.deltas.dx + ((w.dx / 90) * w.thrust) * w.thrustForce;
        e.co.y += e.deltas.dy + ((w.dy / 90) * w.thrust) * w.thrustForce;
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
function wStatecreen(w2, ctx) {
    if(w2.rotate) {
        w2.deg = (w2.rotate + w2.deg) % 360;
        ctx.rotate((Math.PI / 180) * w2.rotate);
        let absDeg = abs(w2.deg);
        if(absDeg > 270 || absDeg <= 90) {
            w2.dx += w2.rotate;
            w2.dy = 90 - abs(w2.dx);
        }
        else {
            w2.dx -= w2.rotate;
            w2.dy = -(90 - abs(w2.dx));
        }
    }
}


function draw0(w2, s2, e2, ctx0, ctx1, h2) {
    if(!w2.paused) {
        ctx0.clearRect( -970,  -970, 1920, 1920);
        wStatecreen(w2, ctx0);
        randomEntity(s2, e2);
        trackEntities(w2, ctx0, e2);
        h2.update(w2.thrust, ctx1);
    }
    if(w2.alive){
        requestAnimationFrame(function(){
            draw0(w2, s2, e2, ctx0, ctx1, h2);
        });
    }
} 


//Thruster logic
function drawThrusters(w2, ctx) {
    ctx.rotate((Math.PI / 180) * -w2.deg);
    if(w2.rotate) {
        if(w2.rotate === 1) {
            rightThruster();
        }
        else {
            leftThruster();
        }
    }
    else if(w2.thrust) {
        rightThruster();
        leftThruster();

    }
    ctx.rotate((Math.PI / 180) * w2.deg);
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


//UI controls-------------------------------------------------------------------------------------
function menuInput(e) {
    switch(e.target.id) {
        case "play":        startGame();
            break;
        case "startOptions":optionsMenu(true);
            break;
        case "easy":        easy(ng.d2);
            break;
        case "medium":      medium(ng.d2);
            break;
        case "hard":        hard(ng.d2);
            break;
        case "AI":          ai();
            break;
        case "back":        back(ng);
            break;
        case "fullScreen":  fullScreen();
            break;
        case "resume":      pause(ng.w2);
            break;
        case "pauseOptions":optionsMenu(false);
            break;
        case "quit":        quit();
            break;
    }
}

function startGame() {
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("game").style.display = "block";
    ng = {
        w2: {...wState},
        d2: (ng.d2) ? ng.d2: {...difState},
        e2: deepCopy(entities),
        h2: deepCopy(hud),
    };
    ng.w2.alive = true;
    console.log(ng.w2);
    draw0(ng.w2, ng.d2, ng.e2, ctx0, ctx1, ng.h2);
    draw1(ctx1, ng.h2);
}

function optionsMenu(b) {
    if(b) {
        document.getElementById("startMenu").style.display = "none";
        document.getElementById("optionsMenu").style.display = "grid";
    }
    else {
        document.getElementById("pauseMenu").style.display = "none";
        document.getElementById("optionsMenu").style.display = "grid";
    }
}

function easy(dState) {
    console.log("easy called");
}

function medium(dState) {
    console.log("medium called");
}

function hard(dState) {
    console.log("hard called");
}

function ai() {
    console.log("ai called");
}

function back(ng) {
    if(ng.w2) {
        document.getElementById("pauseMenu").style.display = "grid";
        document.getElementById("optionsMenu").style.display = "none"; 
    } 
    else {
        document.getElementById("startMenu").style.display = "grid";
        document.getElementById("optionsMenu").style.display = "none";
    } 
    
}

function fullScreen() {
    let docE = document.documentElement;
    if (docE.requestFullscreen) {
        (document.fullscreen) ? document.exitFullscreen(): docE.requestFullscreen();
    }
    else if (docE.mozRequestFullScreen) {
        (document.mozFullScreen) ? document.mozCancelFullScreen(): docE.mozRequestFullScreen();
    }
    else if (docE.webkitRequestFullscreen) {
        (document.webkitIsFullScreen) ? document.webkitExitFullscreen(): docE.webkitRequestFullScreen();
    }
}

function pause(w2) {
    if(w2.alive) {
        w2.paused ^= 1;
        if(w2.paused) {
            document.getElementById("pauseMenu").style.display = "grid";
        }
        else {
            document.getElementById("pauseMenu").style.display = "none";
        }
    }
}

function quit() {
    ng.w2.alive = false;
    console.log(ng.w2);
    ng = {};
    document.getElementById("pauseMenu").style.display = "none";
    document.getElementById("startMenu").style.display = "grid";
    document.getElementById("game").style.display = "none";
}


//player controls------------------------------------------------------------------------------------
function keyDownHandler(e) {
    if(ng.w2) {
        if(e.key == "ArrowRight" || e.key == "d") {
            ng.w2.rotate = 1;
        }
        else if(e.key == "ArrowLeft" || e.key == "a") {
            ng.w2.rotate = -1;
        }
        else if(e.key == "ArrowUp" || e.key == "w") {
            ng.w2.thrust = 1;
        }
        else if(e.key == "ArrowDown" || e.key == "s") {
            ng.w2.thrust = -1;
        }
        else if(e.key == "p") {
            pause(ng.w2);   
        }
    }
}

function keyUpHandler(e) {
    if(ng.w2) {
        if(e.key == "ArrowRight" || e.key == "d") {
            ng.w2.rotate = 0;
        }
        else if(e.key == "ArrowLeft" || e.key == "a") {
            ng.w2.rotate = 0;
        }
        else if(e.key == "ArrowUp" || e.key == "w") {
            ng.w2.thrust = 0;
        }
        else if(e.key == "ArrowDown" || e.key == "s") {
            ng.w2.thrust = 0;
        }
    }
    
}


//add handlers-------------------------------------------------------------------------
document.addEventListener("keydown",   keyDownHandler, false);
document.addEventListener("keyup",     keyUpHandler,   false);
for (button of document.getElementsByClassName("UI")) {
    button.addEventListener("click", menuInput, false);
}

//setInterval(function () {console.log("end of frame count")}, 1000);\

//poor implementation, don't really care
function deepCopy(obj) {
    let r = {};
    for(key in obj) {
        if(typeof obj[key] == "object"){
            r[key] = {...deepCopy(obj[key])};
        }
        else {
            r[key] = obj[key];
        }
    }
    return r;
}