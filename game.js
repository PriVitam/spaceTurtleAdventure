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
    difMulti: 1,
    bSpeed: 1,
    tSpeed: 4,
    pSpeed: 2,
    timer: 0,
    interval: 180,
    sRadius: radius,
};

const hud = {
    score: {
        count: 0,
        value: 0,
        x: -375,
        y: -440,
        w: 120,
        h: 48,
        draw: function(ctx) {
            ctx.clearRect(this.x, this.y - 46, this.w, this.h);
            ctx.fillStyle = "#29ABE2";
            ctx.font = '48px Oswald';
            ctx.fillText(~~this.value, this.x, this.y, this.w);
        },

        drawWords: function(ctx) {
            ctx.fillStyle = "#29ABE2";
            ctx.font = '48px Oswald';
            ctx.fillText("score:", this.x - 125, this.y, this.w);
        }
    },

    health: {
        max: 1000,
        value: 1000,
        x: 300,
        y: -480,
        h: 15,
        draw: function(ctx) {
            ctx.clearRect(this.x, this.y, this.value/5, this.h);
            ctx.fillStyle = "#3EA472";
            ctx.fillRect(this.x, this.y, this.value/5, this.h);
        },
        drawWords(ctx) {
            ctx.fillStyle = "#3EA472";
            ctx.font = '48px Oswald';
            ctx.fillText("health:", this.x - 150, this.y + 20, this.w);
        }
    },

    energy: {
        max: 1000,
        value: 1000,
        x: 300,
        y: -430,
        h: 15,
        draw: function(ctx) {
            ctx.clearRect(this.x, this.y, this.value/5, this.h);
            ctx.fillStyle = "#F7931E";
            ctx.fillRect(this.x, this.y, this.value/5, this.h);
        },
        drawWords(ctx) {
            ctx.fillStyle = "#F7931E";
            ctx.font = '48px Oswald';
            ctx.fillText("energy:", this.x - 150, this.y + 20, this.w);
        }
    },
    //only draw energy and health when necessary
    update: function(thrust, ctx) {
        if(this.health.value <= 0) {
            gameOver();
        }
        if(thrust) {
            (this.energy.value > 0) ? this.energy.value-- : this.health.value--;
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
    randomEntity: function(d2, w2Deg) {
        if(d2.timer == d2.interval) {
            d2.timer = 0;

            let e    = {...eType[~~(Math.random() * eType.length)]};
            e.co     = ranStart();
            e.speed  = d2.bSpeed + ~~(Math.random() * d2.tSpeed);
            e.value  = (1 + ~~(Math.random() * 3)) * d2.difMulti;
            e.index  = this.count;
            e.deg    = abs(w2Deg);
            e.width  = 100 * e.value;
            e.height = 58 * e.value;
            e.size   = e.value * 20;
            e.deltas = deltaCo(e);
            console.log(e.co);
            console.log(e.deltas);
            console.log(Math.atan2(e.co.y, e.co.x) * 180 / Math.PI);
            console.log(Math.atan2(-e.co.y, (e.co.x > 0 ? e.co.x : -e.co.x)) * 180 / Math.PI);
            console.log();
            let image = new Image();
            image.src = (e.src) ? e.src() : saucer.src;
            e.image  = image;
            
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
                    e.effect(h2, p2)    
                }
                if(e.hazard) {
                    h2.health.value -= e.size;
                }
                delete this.entitySet[e.index];
            } 
            else {
                if(e.rad) {
                    //ctx.translate(e.co.x + e.width / 2, e.co.y + e.height / 2);
                    //ctx.rotate(-e.rad);
                    ctx.drawImage(e.image, e.co.x, e.co.y, e.width, e.height);
                    //ctx.rotate(e.rad);
                    //ctx.translate(-(e.co.x + e.width / 2), -(e.co.y + e.height / 2));
                }
                else {
                    ctx.drawImage(e.image, e.co.x, e.co.y, e.width, e.height);
                }
                
                entityLocUpdate(w2, e);
            }
        }
    },

    
};
let turtle = new Image();
turtle.src = "Player.jpeg";

let saucer = new Image();
saucer.src = "saucer.svg";


const eType = [
    {
        name: "fish",
        hazard: false,
        whichEffect: "all",
        effect: function(h2) {
            switch(this.whichEffect) {
                case "all": h2.score.value += this.size;
                    (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
                case "energy": (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    break;
                case "score": h2.score.value += this.size;
                    break;
                case "health": (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
            }
        },
        src: function(){
            let randomEye;
            let r = ~~(Math.random() * 4);
            switch(r){
                case 0: randomEye = encodeURIComponent(document.getElementById("gEye").innerHTML);
                    this.whichEffect = "all";
                    break;
                case 1: randomEye = encodeURIComponent(document.getElementById("eEye").innerHTML);
                    this.whichEffect = "energy";
                    break;
                case 2: randomEye = encodeURIComponent(document.getElementById("sEye").innerHTML);
                    this.whichEffect = "score";
                    break;
                case 3: randomEye = encodeURIComponent(document.getElementById("hEye").innerHTML);
                    this.whichEffect = "health";
                    break;
            }
            //keep it inside the <> else it errors on ctx.drawImage()
            return `data:image/svg+xml,<${document.getElementById("bFish").outerHTML.match(/^<(.*?)>/)[1]}
                    transform="scale(${this.co.x > 0 ? -1: 1},${this.deg >= 180 ? -1: 1})
                    rotate(${Math.atan2(-this.co.y, (this.co.x > 0 ? this.co.x : -this.co.x)) * 180 / Math.PI})">
                    ${encodeURIComponent(document.getElementById("bFish").innerHTML)}
                    ${randomEye}</svg>`},
     },
     {
        name: "seaweed",
        hazard: false,
        effect: function(h2) {
            switch(this.whichEffect) {
                case "all": h2.score.value += this.size;
                    (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
                case "energy": (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    break;
                case "score": h2.score.value += this.size;
                    break;
                case "health": (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
            }
        },
        src: function(){
            let randomEye;
            let r = ~~(Math.random() * 4);
            switch(r){
                case 0: randomEye = encodeURIComponent(document.getElementById("gEye").innerHTML);
                    this.whichEffect = "all";
                    break;
                case 1: randomEye = encodeURIComponent(document.getElementById("eEye").innerHTML);
                    this.whichEffect = "energy";
                    break;
                case 2: randomEye = encodeURIComponent(document.getElementById("sEye").innerHTML);
                    this.whichEffect = "score";
                    break;
                case 3: randomEye = encodeURIComponent(document.getElementById("hEye").innerHTML);
                    this.whichEffect = "health";
                    break;
            }
            return `data:image/svg+xml,<${document.getElementById("bFish").outerHTML.match(/^<(.*?)>/)[1]}
                    transform="scale(${this.co.x > 0 ? -1: 1},${this.deg >= 180 ? -1: 1})
                    rotate(${Math.atan2(-this.co.y, (this.co.x > 0 ? this.co.x : -this.co.x)) * 180 / Math.PI})">
                    ${encodeURIComponent(document.getElementById("bFish").innerHTML)}
                    ${randomEye}</svg>`},
        
     },
     {
        name: "faster",
        hazard: false,
        effect: function(h2) {
            switch(this.whichEffect) {
                case "all": h2.score.value += this.size;
                    (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
                case "energy": (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    break;
                case "score": h2.score.value += this.size;
                    break;
                case "health": (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
            }
        },
        src: function(){
            let randomEye;
            let r = ~~(Math.random() * 4);
            switch(r){
                case 0: randomEye = encodeURIComponent(document.getElementById("gEye").innerHTML);
                    this.whichEffect = "all";
                    break;
                case 1: randomEye = encodeURIComponent(document.getElementById("eEye").innerHTML);
                    this.whichEffect = "energy";
                    break;
                case 2: randomEye = encodeURIComponent(document.getElementById("sEye").innerHTML);
                    this.whichEffect = "score";
                    break;
                case 3: randomEye = encodeURIComponent(document.getElementById("hEye").innerHTML);
                    this.whichEffect = "health";
                    break;
            }
            return `data:image/svg+xml,<${document.getElementById("bFish").outerHTML.match(/^<(.*?)>/)[1]}
                    transform="scale(${this.co.x > 0 ? -1: 1},${this.deg >= 180 ? -1: 1})
                    rotate(${Math.atan2(-this.co.y, (this.co.x > 0 ? this.co.x : -this.co.x)) * 180 / Math.PI})">
                    ${encodeURIComponent(document.getElementById("bFish").innerHTML)}
                    ${randomEye}</svg>`},
     },
     {
        name: "heal",
        hazard: false,
        effect: function(h2) {
            switch(this.whichEffect) {
                case "all": h2.score.value += this.size;
                    (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
                case "energy": (h2.energy.value <= h2.energy.max - this.size) ? h2.energy.value += this.size: h2.energy.value = h2.energy.max;
                    break;
                case "score": h2.score.value += this.size;
                    break;
                case "health": (h2.health.value <= h2.health.max - this.size) ? h2.health.value += this.size: h2.health.value = h2.health.max;
                    break;
            }
        },
        src: function(){
            let randomEye;
            let r = ~~(Math.random() * 4);
            switch(r){
                case 0: randomEye = encodeURIComponent(document.getElementById("gEye").innerHTML);
                    this.whichEffect = "all";
                    break;
                case 1: randomEye = encodeURIComponent(document.getElementById("eEye").innerHTML);
                    this.whichEffect = "energy";
                    break;
                case 2: randomEye = encodeURIComponent(document.getElementById("sEye").innerHTML);
                    this.whichEffect = "score";
                    break;
                case 3: randomEye = encodeURIComponent(document.getElementById("hEye").innerHTML);
                    this.whichEffect = "health";
                    break;
            }
            return `data:image/svg+xml,<${document.getElementById("bFish").outerHTML.match(/^<(.*?)>/)[1]}
                    transform="scale(${this.co.x > 0 ? -1: 1},${this.deg >= 180 ? -1: 1})
                    rotate(${Math.atan2(-this.co.y, (this.co.x > 0 ? this.co.x : -this.co.x)) * 180 / Math.PI})">
                    ${encodeURIComponent(document.getElementById("bFish").innerHTML)}
                    ${randomEye}</svg>`},
     },
     {
        name: "saucer",
        hazard: true,
        image: saucer,
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
];

const player = {
    x: -25,
    y: -25,
    w: 50,
    h: 50,
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
            e.co.x < this.x + this.w &&
            e.co.x + e.width > this.x &&
            e.co.y < this.y + this.h &&
            e.height + e.co.y > this.y);
    }
};

let ng = {};


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
        //frames++;
        ctx0.clearRect( -970,  -970, 1920, 1920);
        w2.rotateWorld(ctx0);
        e2.randomEntity(d2, w2.deg);
        e2.trackEntities(w2, ctx, h2, p2);
    }
    if(w2.alive){
        requestAnimationFrame(function(){
            draw0(w2, d2, e2, ctx, h2, p2);
        });
    }
} 

function drawMiddle(ctx, sRadius) {
    ctx.clearRect( -970,  -970, 1920, 1920);
    var radgrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sRadius);
    radgrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radgrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = radgrad;
    ctx.fillRect(-920, -920, 1920, 1920);
    hud.score.drawWords(ctx);
    hud.health.drawWords(ctx);
    hud.energy.drawWords(ctx);
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
        case "quit":        quit("pause");
            break;
        case "playAgain":   quit("go");
                            startGame();
            break;
        case "gameOverQuit":quit("go");
    }
}

function startGame() {
    document.getElementById("startMenu").style.display = "none";
    document.getElementById("game").style.display = "block";
    ng = {
        w2: {...wState},
        e2: deepCopy(entities),
        h2: deepCopy(hud),
        p2: deepCopy(player),
    };
    ng.w2.alive = true;
    ctx0.save(); //saved to return ctx0 to nonrotated state afterwards
    draw0(ng.w2, difState, ng.e2, ctx0, ng.h2, ng.p2);
    drawMiddle(ctx1, difState.sRadius);
    draw2(ng.w2, ctx2, ng.h2, ng.p2);
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

function quit(menu) {
    ng.w2.alive = false;
    ng = {};
    ctx0.restore();
    if(menu == "pause") {
        document.getElementById("pauseMenu").style.display = "none";
    }
    else if(menu == "go") {
        document.getElementById("gameOverScreen").style.display = "none";
    }
    document.getElementById("startMenu").style.display = "grid";
    document.getElementById("game").style.display = "none";
}

function gameOver() {
    ng.w2.alive = false;
    document.getElementById("gameOverScreen").style.display = "grid";
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

//let frames = 0;

//setInterval(function () {console.log(`end of frame count:  ${frames}`)}, 1000);

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