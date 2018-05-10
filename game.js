let canvas0 = document.getElementById("myCanvas0");
let ctx0    = canvas0.getContext("2d");
let canvas1 = document.getElementById("myCanvas1");
let ctx1    = canvas1.getContext("2d");
let canvas2 = document.getElementById("myCanvas2");
let ctx2    = canvas2.getContext("2d");

//center all origins
ctx0.translate(canvas0.width / 2, canvas0.height / 2);
ctx1.translate(canvas0.width / 2, canvas0.height / 2);
ctx2.translate(canvas0.width / 2, canvas0.height / 2);
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
    rotateWorld: function(ctx) {
        if(this.rotate) {
            this.deg = (this.rotate + this.deg) % 360;
            ctx.rotate((Math.PI / 180) * this.rotate);
            let absDeg = abs(this.deg);
            if(absDeg > 270 || absDeg <= 90) {
                this.dx += this.rotate;
                this.dy = 90 - abs(this.dx);
            }
            else {
                this.dx -= this.rotate;
                this.dy = -(90 - abs(this.dx));
            }
        }
    },
};

const difState = {
    difMulti: 1.5,
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
            ctx.fillText("score: " + ~~this.value, this.x, this.y, this.w);
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
    //only draw energy and health when necessary
    update: function(thrust, ctx) {
        if(thrust) {
            (this.energy.value > 0) ? this.energy.value-- : (this.health.value > 0) ? this.health.value-- : gameOver();
        }
        else {
            this.score.count++;
            if(this.score.count == 60){
                this.score.count = 0;
                this.score.value++;
            }
        }
    },
};

const entities = {
    entitySet: {},
    count: 0,
    randomEntity: function(d2) {
        if(d2.timer == d2.interval) {
            d2.timer = 0;

            let e = {...entities.type[~~(Math.random() * entities.type.length)]};
            e.co = ranStart();
            e.speed = (d2.bSpeed + ~~(Math.random() * d2.tSpeed)) * d2.difMulti;
            e.value = (1 + ~~(Math.random() * 3)) * d2.difMulti;
            e.index = this.count;
            e.image = logo;
            e.size = e.value * 20;
            e.deltas = deltaCo(e);
            this.entitySet[this.count] = {...e};
            
            
            this.count++;
        }
        else {
            d2.timer++;
        }
    },

    trackEntities: function(w2, ctx, h2, p2) {
        for(entity in this.entitySet) {
            let e = this.entitySet[entity];
            if(e.co.x <  -radius || e.co.x > radius || e.co.y <  -radius || e.co.y > radius) {
                if(e.hazard) {
                    h2.score.value += e.value; 
                }
                delete this.entitySet[e.index];
            }
            else if(p2.isHit(e)) {
                if(e.effect) {
                    e.effect()    
                }
                if(e.hazard) {
                    h2.health.value -= e.size;
                }
                delete this.entitySet[e.index];
            } 
            else {
                ctx.drawImage(e.image, e.co.x, e.co.y, e.size, e.size);
                entityLocUpdate(w2, e);
            }
        }
    },

    type: [
        {
            name: "fish",
            hazard: false,
            effect: function() {

            },
         },
         {
            name: "seaweed",
            hazard: false,
            effect: function() {

            },
         },
         {
            name: "faster",
            hazard: false,
            effect: function() {

            },
         },
         {
            name: "heal",
            hazard: false,
            effect: function() {

            },
         },
         {
            name: "asteroid1",
            hazard: true, 
         },
         {
            name: "asteroid2",
            hazard: true, 
         },
         {
            name: "asteroid3",
            hazard: true, 
         },
         {
            name: "asteroid4",
            hazard: true, 
         },
    ],
};
let turtle = new Image();
turtle.src = "Player.jpeg";

const player = {
    x: -50,
    y: -50,
    w: 100,
    h: 100,
    ani: function(thrust, ctx) {
        if(thrust < 0){
            ctx.drawImage(turtle, this.x, this.y, this.w, this.h);
        }
        else if(thrust > 0){
            ctx.drawImage(turtle, this.x, this.y, this.w, this.h);
        }
        else{
            ctx.drawImage(turtle, this.x, this.y, this.w, this.h);
        }
    },
    isHit: function(e) {
        return(
            ((e.co.x > this.x) && (e.co.x < this.w + this.x) && (e.co.y > this.y) && (e.co.y < this.h + this.y))
            || (e.co.x + e.size > this.x) && (e.co.x + e.size < this.w + this.x) && (e.co.y + e.size > this.y) && (e.co.y + e.size < this.h + this.y)
        );
    }
};

let displays = {
    sMenu: document.getElementById("startMenu"),
    oMenu: document.getElementById("optionsMenu"),
};

let ng = {};

let logo = new Image();
logo.src ="blueberry.jpg";

let fish = new Image();
fish.src = "logo.svg";

//top layer---------------------------------------------------------------------------------------
/*function drawShip() {
    ctx1.beginPath();
    ctx1.moveTo(-10, 0);
    ctx1.lineTo(10, 0);
    ctx1.lineTo(0, -20);
    ctx1.fillStyle = "#0f0";
    ctx1.fill();
    ctx1.closePath();
}*/

function drawFOW(sRadius) {
    ctx1.clearRect( -970,  -970, 1920, 1920);
    var radgrad = ctx1.createRadialGradient(0, 0, 0, 0, 0, sRadius);
    radgrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radgrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx1.fillStyle = radgrad;
    ctx1.fillRect(-920, -920, 1920, 1920);
}

function draw2(w2, ctx, h2, p2) {
    if(!w2.paused) {
        ctx.clearRect( -970,  -970, 1920, 1920);
        h2.score.draw(ctx);
        h2.health.draw(ctx);
        h2.energy.draw(ctx);
        h2.update(w2.thrust, ctx);
        p2.ani(w2.thrust, ctx);
    } 
    if(w2.alive){
        requestAnimationFrame(function(){
            draw2(w2, ctx, h2, p2);
        });
    }
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

/*function entityType() {
    switch(~~(Math.random() * 100)) {
        case 
    };
}*/

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

function deltaCo(e) {
    if(e.co.x < radius && e.co.x > -radius) {
        return {dx: (-e.size / 2 - e.co.x) / (radius / e.speed), dy: (e.co.y < 0) ? e.speed: -e.speed};
    }
    else{
        return {dx: (e.co.x < 0) ? e.speed: -e.speed, dy: (-e.size / 2 - e.co.y) / (radius / e.speed)};
    }
}

function abs(n) {
    return (n ^ (n >> 31)) - (n >> 31);
}



function draw0(w2, d2, e2, ctx, h2, p2) {
    if(!w2.paused) {
        ctx0.clearRect( -970,  -970, 1920, 1920);
        w2.rotateWorld(ctx0);
        e2.randomEntity(d2);
        e2.trackEntities(w2, ctx, h2, p2);
    }
    if(w2.alive){
        requestAnimationFrame(function(){
            draw0(w2, d2, e2, ctx, h2, p2);
        });
    }
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
        p2: deepCopy(player),
    };
    ng.w2.alive = true;
    draw0(ng.w2, ng.d2, ng.e2, ctx0, ng.h2, ng.p2);
    drawFOW(ng.d2.sRadius);
    draw2(ng.w2, ctx2, ng.h2, ng.p2);
}

function optionsMenu(b) {
    if(b) {
        //document.getElementById("startMenu").style.display = "none";
        document.getElementById("optionsMenu").style.display = "grid";
        displays.sMenu.style.display = "none";
        //displays.oMenu = "grid";
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
    ng = {};
    document.getElementById("pauseMenu").style.display = "none";
    document.getElementById("startMenu").style.display = "grid";
    document.getElementById("game").style.display = "none";
}

function gameOver() {
    ng.w2.alive = false;
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