const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==========================================================================
// 1. CARICAMENTO DELLE RISORSE GRAFICHE (Sfondo, 7 Props e 8 Idle + 48 Walk)
// ==========================================================================
const bgImage = new Image();

// I 7 Props di Photoshop per il livello sopra al giocatore (2.5D)
const fgBed = new Image();
const fgSofa = new Image();
const fgChair = new Image();
const fgPlant = new Image();
const fgDog = new Image();      // Cagnolino sul letto
const fgDesk = new Image();     // Scrivania a doppio monitor
const fgCurtains = new Image(); // Tende ritagliate per vento procedurale

// Contenitore per gli sprite IDLE (Statici ad 1 fotogramma da character/)
const playerIdleSprites = {
    south: new Image(), south_east: new Image(), east: new Image(), north_east: new Image(),
    north: new Image(), north_west: new Image(), west: new Image(), south_west: new Image()
};

// Contenitore per gli sprite WALK (Dentro character/animations/walk/[direzione]/)
const playerWalkSprites = {
    south: [], south_east: [], east: [], north_east: [],
    north: [], north_west: [], west: [], south_west: []
};

const directions = ["south", "south_east", "east", "north_east", "north", "north_west", "west", "south_west"];
const totalWalkFrames = 6;

let assetsLoaded = 0;
// 1 (sfondo) + 7 (props) + 8 (idle) + 48 (walk) = 64 File totali (Scrivania e Tende incluse)
const totalAssets = 1 + 7 + 8 + (8 * totalWalkFrames);

function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        mainLoop();
    }
}

// Configura i listener di caricamento per gli sfondi e i Props
bgImage.onload = assetLoaded;
bgImage.src = "../img/FolioRoom_LV.png";

fgBed.onload = assetLoaded;
fgBed.src = "../img/prop_bed.png";

fgSofa.onload = assetLoaded;
fgSofa.src = "../img/prop_sofa.png";

fgChair.onload = assetLoaded;
fgChair.src = "../img/prop_chair.png";

fgPlant.onload = assetLoaded;
fgPlant.src = "../img/prop_plant.png";

fgDog.onload = assetLoaded;
fgDog.src = "../img/prop_dog.png";

fgDesk.onload = assetLoaded;
fgDesk.src = "../img/prop_desk.png";

fgCurtains.onload = assetLoaded;
fgCurtains.src = "../img/prop_curtains.png"; // Carica la maschera delle tende

// Carica i 8 sprite statici Idle direttamente dalla cartella character/
for (let dir in playerIdleSprites) {
    playerIdleSprites[dir].onload = assetLoaded;
    const fileDirName = dir.replace('_', '-');
    playerIdleSprites[dir].src = `character/${fileDirName}.png`;
    if (playerIdleSprites[dir].complete) assetLoaded();
}

// Carica i 48 fotogrammi di camminata (Walk)
directions.forEach(dir => {
    const fileDirName = dir.replace('_', '-');
    for (let f = 0; f < totalWalkFrames; f++) {
        let img = new Image();
        img.onload = assetLoaded;
        img.src = `character/animations/walk/${fileDirName}/frame_00${f}.png`;
        playerWalkSprites[dir].push(img);
        if (img.complete) assetLoaded();
    }
});

// ==========================================================================
// 2. DEFINIZIONE DEL PROTAGONISTA ED EDITOR VISIVO DI COLLISIONE (Grid-based)
// ==========================================================================
const player = {
    x: 200,
    y: 200,
    width: 256,
    height: 256,
    speed: 3,
    vx: 0,
    vy: 0,
    direction: "south",
    state: "idle",
    currentFrame: 0,
    frameSpeed: 8,
    frameCount: 0
};

let debugMode = false;
let draggingProp = null;
let draggingCandle = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
const candleDragRadius = 15;

let activeDialogue = null;
let activeChoice = null;
let selectedOption = "yes";
let gameStarted = false;   // CORRETTO: Dichiarata la variabile di stato per l'avvio partita sicuro
let menuNavigated = false; // Blocca lo scroll selvaggio dei menù con la levetta analogica

// Rilevamento automatico del supporto Touch all'avvio
let isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
    document.body.classList.add("touch-active");
}

const tileSize = 32;
const gridWidth = 16;
const gridHeight = 16;

// Coordinate calibrate delle candele C1, C2 e C3 (C4 commentata come richiesto)
let candles = [
    { x: 41, y: 311 },  // C1: Comodino letto
    { x: 333, y: 82 },  // C2: Muro sinistra finestra centrale
    { x: 451, y: 177 }  // C3: Destra porta d'ingresso
    // { x: 410, y: 312 }  // C4: Commentata
];

// Array particelle aumentato a 35 unità con opacità dorata elevata
const dustParticles = [];
for (let i = 0; i < 35; i++) {
    dustParticles.push({
        x: Math.random() * 512,
        y: Math.random() * 512,
        size: Math.random() * 2.0 + 1.0,
        speedX: Math.random() * 0.1 - 0.05,
        speedY: Math.random() * 0.12 + 0.04,
        alpha: Math.random() * 0.6 + 0.3
    });
}

// Array dinamico per contenere le particelle di cuoricini attive
const heartParticles = [];

let collisionGrid =
    [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],//1
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],//2
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],//3
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],//4
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],//5
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],//6
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],//7
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],//8
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],//9
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],//10
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],//11
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],//12
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],//13
        [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],//14
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],//15
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] //16
    ];

// Zone d'Interazione
const interactiveProps = [
    { name: "computer", x: 353, y: 323, width: 80, height: 60, message: "Quale gioco desideri visionare sul computer?" },
    { name: "letto", x: 147, y: 240, width: 40, height: 40, message: "Hai accarezzato il cagnolino! *Cuoricini*" },
    { name: "porta_uscita", x: 364, y: 163, width: 60, height: 80, message: "Uscita dalla stanza. Ritorno al portfolio standard." },
    { name: "stereo", x: 192, y: 188, width: 50, height: 45, message: "Accensione Stereo" },
    { name: "printer", x: 270, y: 190, width: 50, height: 45, message: "Uso stampante" }
];

const keys = {};

// ==========================================================================
// 3. INPUT TASTIERA E MOUSE/TOUCH
// ==========================================================================
window.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    if (key === "f2") {
        debugMode = !debugMode;
    }

    if (activeChoice) {
        if (activeChoice.options) {
            // Navigazione circolare multiscelta indicizzata (per 3 opzioni del computer)
            const numOpts = activeChoice.options.length;
            if (key === "a" || key === "arrowleft") {
                selectedOption = (selectedOption - 1 + numOpts) % numOpts;
            }
            if (key === "d" || key === "arrowright") {
                selectedOption = (selectedOption + 1) % numOpts;
            }
        } else {
            // Classica scelta a due opzioni (Sì/No o CV/GDD)
            if (key === "a" || key === "arrowleft") {
                selectedOption = "yes";
            }
            if (key === "d" || key === "arrowright") {
                selectedOption = "no";
            }
        }
    }
});

window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

window.addEventListener("keypress", e => {
    if (e.key === " " || e.code === "Space") {
        handleSpacebarPress();
    }
});

function handleSpacebarPress() {
    if (activeChoice) {
        const choice = activeChoice;
        activeChoice = null;

        if (choice.options) {
            // Esegue il callback specifico associato all'opzione selezionata (indice numerico)
            choice.callbacks[selectedOption]();
        } else {
            // Classica scelta Sì/No
            if (selectedOption === "yes") {
                choice.onYes();
            } else {
                choice.onNo();
            }
        }
    } else if (activeDialogue) {
        activeDialogue = null;
    } else {
        checkInteraction();
    }
}

function handleBButtonPress() {
    if (activeChoice) {
        activeChoice = null; // Il tasto B chiude direttamente il menù di scelta attiva (annulla)
    } else if (activeDialogue) {
        activeDialogue = null;
    }
}

// LOGICA JOYSTICK VIRTUAL IN HTML/CSS (Pomello con feedback fisico)
const joystick = document.getElementById("touch-joystick");
const knob = document.getElementById("touch-knob");
const btnA = document.getElementById("btn-a");
const btnB = document.getElementById("btn-b");

if (joystick && knob) {
    let joystickActive = false;
    const maxDistance = 35;

    joystick.addEventListener("touchstart", startJoystick, { passive: false });
    window.addEventListener("touchmove", moveJoystick, { passive: false });
    window.addEventListener("touchend", endJoystick, { passive: false });

    function startJoystick(e) {
        e.preventDefault();
        isTouchDevice = true;
        document.body.classList.add("touch-active");
        joystickActive = true;
        updateJoystick(e.touches[0]);
    }

    function moveJoystick(e) {
        if (!joystickActive) return;
        const touch = Array.from(e.touches).find(t => t.target === joystick || t.target === knob || joystick.contains(t.target));
        if (touch) {
            e.preventDefault();
            updateJoystick(touch);
        }
    }

    function endJoystick(e) {
        if (!joystickActive) return;
        joystickActive = false;
        knob.style.transform = `translate(0px, 0px)`;
        keys["w"] = false; keys["s"] = false; keys["a"] = false; keys["d"] = false;
    }

    function updateJoystick(touch) {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = touch.clientX - centerX;
        let dy = touch.clientY - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance;
            dy = (dy / distance) * maxDistance;
        }

        knob.style.transform = `translate(${dx}px, ${dy}px)`;

        keys["w"] = false; keys["s"] = false; keys["a"] = false; keys["d"] = false;

        if (distance > 10) {
            const angle = Math.atan2(dy, dx);
            const deg = angle * (180 / Math.PI);

            if (deg >= -22.5 && deg < 22.5) { keys["d"] = true; }
            else if (deg >= 22.5 && deg < 67.5) { keys["s"] = true; keys["d"] = true; }
            else if (deg >= 67.5 && deg < 112.5) { keys["s"] = true; }
            else if (deg >= 112.5 && deg < 157.5) { keys["s"] = true; keys["a"] = true; }
            else if (deg >= 157.5 || deg < -157.5) { keys["a"] = true; }
            else if (deg >= -157.5 && deg < -112.5) { keys["w"] = true; keys["a"] = true; }
            else if (deg >= -112.5 && deg < -67.5) { keys["w"] = true; }
            else if (deg >= -67.5 && deg < -22.5) { keys["w"] = true; keys["d"] = true; }
        }
    }
}

if (btnA) {
    btnA.addEventListener("touchstart", e => {
        e.preventDefault();
        isTouchDevice = true;
        document.body.classList.add("touch-active");
        handleSpacebarPress();
    });
}

if (btnB) {
    btnB.addEventListener("touchstart", e => {
        e.preventDefault();
        isTouchDevice = true;
        document.body.classList.add("touch-active");
        handleBButtonPress();
    });
}

// Clic / Tap diretto sul vetro del Canvas per selezionare e confermare le opzioni dei dialoghi
canvas.addEventListener("click", function (e) {
    if (activeChoice) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

        const optY = 450;

        if (mouseY >= optY - 20 && mouseY <= optY + 15) {
            if (activeChoice.options) {
                const numOpts = activeChoice.options.length;
                const boxX = 20;
                const boxW = 472;
                for (let i = 0; i < numOpts; i++) {
                    const anchorX = boxX + (boxW / (numOpts + 1)) * (i + 1);
                    if (mouseX >= anchorX - 50 && mouseX <= anchorX + 50) {
                        selectedOption = i;
                        handleSpacebarPress();
                        break;
                    }
                }
            } else {
                const boxX = 20;
                const boxW = 472;
                const leftX = boxX + (boxW * 0.3);
                const rightX = boxX + (boxW * 0.7);

                if (mouseX >= leftX - 80 && mouseX <= leftX + 80) {
                    selectedOption = "yes";
                    handleSpacebarPress();
                }
                else if (mouseX >= rightX - 80 && mouseX <= rightX + 80) {
                    selectedOption = "no";
                    handleSpacebarPress();
                }
            }
        }
    }
});

canvas.addEventListener("mousedown", function (e) {
    if (debugMode) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

        // 1. Controlla se abbiamo cliccato dentro una zona blu interattiva
        let clickedProp = null;
        for (let i = interactiveProps.length - 1; i >= 0; i--) {
            let prop = interactiveProps[i];
            if (mouseX >= prop.x && mouseX <= prop.x + prop.width &&
                mouseY >= prop.y && mouseY <= prop.y + prop.height) {
                clickedProp = prop;
                break;
            }
        }

        if (clickedProp) {
            draggingProp = clickedProp;
            dragOffsetX = mouseX - clickedProp.x;
            dragOffsetY = mouseY - clickedProp.y;
        } else {
            // 2. Controlla se abbiamo cliccato vicino al punto luce di una candela
            let clickedCandle = null;
            for (let i = 0; i < candles.length; i++) {
                const dist = Math.hypot(mouseX - candles[i].x, mouseY - candles[i].y);
                if (dist <= candleDragRadius) {
                    clickedCandle = candles[i];
                    break;
                }
            }

            if (clickedCandle) {
                draggingCandle = clickedCandle;
            } else {
                // 3. Altrimenti dipinge le collisioni sulla griglia
                const col = Math.floor(mouseX / tileSize);
                const row = Math.floor(mouseY / tileSize);

                if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
                    collisionGrid[row][col] = collisionGrid[row][col] === 1 ? 0 : 1;
                    console.log("Matrice di collisione aggiornata da copiare:", JSON.stringify(collisionGrid));
                }
            }
        }
    }
});

canvas.addEventListener("mousemove", function (e) {
    if (debugMode) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

        if (draggingProp) {
            draggingProp.x = Math.max(0, Math.min(canvas.width - draggingProp.width, mouseX - dragOffsetX));
            draggingProp.y = Math.max(0, Math.min(canvas.height - draggingProp.height, mouseY - dragOffsetY));
        }
        else if (draggingCandle) {
            draggingCandle.x = Math.round(Math.max(0, Math.min(canvas.width, mouseX)));
            draggingCandle.y = Math.round(Math.max(0, Math.min(canvas.height, mouseY)));
        }
    }
});

canvas.addEventListener("mouseup", function () {
    if (debugMode) {
        if (draggingProp) {
            console.log("Zone interattive aggiornate da copiare nel codice:", JSON.stringify(interactiveProps));
            draggingProp = null;
        }
        else if (draggingCandle) {
            console.log("Coordinate candele aggiornate da copiare nel codice:", JSON.stringify(candles));
            draggingCandle = null;
        }
    }
});

// ==========================================================================
// 4. MOVIMENTO & COLLISIONI (Fisica a Doppio Collisionatore: Piedi + Testa)
// ==========================================================================
function update() {
    player.vx = 0;
    player.vy = 0;

    // INTEGRATO: Navigazione controlli virtuali o analogico per scorrere i menù di scelta (SÌ/NO e CV/GDD)
    if (activeChoice) {
        player.state = "idle";

        const navLeft = keys["a"] || keys["arrowleft"];
        const navRight = keys["d"] || keys["arrowright"];

        if (navLeft || navRight) {
            if (!menuNavigated) {
                menuNavigated = true;

                if (activeChoice.options) {
                    const numOpts = activeChoice.options.length;
                    if (navLeft) selectedOption = (selectedOption - 1 + numOpts) % numOpts;
                    if (navRight) selectedOption = (selectedOption + 1) % numOpts;
                } else {
                    if (navLeft) selectedOption = "yes";
                    if (navRight) selectedOption = "no";
                }
            }
        } else {
            menuNavigated = false;
        }
        return;
    }

    if (activeDialogue) {
        player.state = "idle";
        return;
    }

    const up = keys["w"] || keys["arrowup"];
    const down = keys["s"] || keys["arrowdown"];
    const left = keys["a"] || keys["arrowleft"];
    const right = keys["d"] || keys["arrowright"];

    if (up) player.vy = -player.speed;
    if (down) player.vy = player.speed;
    if (left) player.vx = -player.speed;
    if (right) player.vx = player.speed;

    if (player.vx !== 0 || player.vy !== 0) {
        player.state = "walk";
        player.frameCount++;
        if (player.frameCount >= player.frameSpeed) {
            player.frameCount = 0;
            player.currentFrame = (player.currentFrame + 1) % totalWalkFrames;
        }
    } else {
        player.state = "idle";
        player.currentFrame = 0;
        player.frameCount = 0;
    }

    if (up && right) player.direction = "north_east";
    else if (up && left) player.direction = "north_west";
    else if (down && right) player.direction = "south_east";
    else if (down && left) player.direction = "south_west";
    else if (up) player.direction = "north";
    else if (down) player.direction = "south";
    else if (left) player.direction = "west";
    else if (right) player.direction = "east";

    let nextX = player.x + player.vx;
    let nextY = player.y + player.vy;

    function checkGridCollision(x, y) {
        const headBox = { x: x + 108, y: y + 130, width: 40, height: 40 };
        const feetBox = { x: x + 108, y: y + 190, width: 40, height: 20 };

        function checkIndividualBox(box) {
            const corners = [
                { x: box.x, y: box.y },
                { x: box.x + box.width, y: box.y },
                { x: box.x, y: box.y + box.height },
                { x: box.x + box.width, y: box.y + box.height }
            ];

            for (let i = 0; i < corners.length; i++) {
                const col = Math.floor(corners[i].x / tileSize);
                const row = Math.floor(corners[i].y / tileSize);

                if (col < 0 || col >= gridWidth || row < 0 || row >= gridHeight) {
                    return true;
                }
                if (collisionGrid[row][col] === 1) {
                    return true;
                }
            }
            return false;
        }

        return checkIndividualBox(feetBox) || checkIndividualBox(headBox);
    }

    if (!checkGridCollision(nextX, nextY)) {
        player.x = nextX;
        player.y = nextY;
    }

    checkAutoExit();
}

// ==========================================================================
// ANIMAZIONI PROCEDURALI (Ambientazione)
// ==========================================================================

// 1. Bagliori delle candele
function drawCandleGlows() {
    const time = Date.now() * 0.005; // Velocità pulsazione

    candles.forEach(candle => {
        const flicker = Math.sin(time + Math.random() * 0.2) * 1.5 + (Math.random() * 2);
        const radius = 18 + flicker;

        const grad = ctx.createRadialGradient(
            candle.x, candle.y, 1,
            candle.x, candle.y, radius
        );
        grad.addColorStop(0, "rgba(253, 224, 71, 0.75)");
        grad.addColorStop(0.3, "rgba(249, 115, 22, 0.45)");
        grad.addColorStop(1, "rgba(249, 115, 22, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(candle.x, candle.y, radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 2. Pulviscolo atmosferico dorato
function drawDust() {
    ctx.fillStyle = "rgba(253, 224, 71, 0.5)";
    dustParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y > 512) { p.y = 0; p.x = Math.random() * 512; }
        if (p.x > 512 || p.x < 0) p.x = Math.random() * 512;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// 3. Emettitore di cuoricini vettoriali al tocco/interazione
function spawnHearts(centerX, centerY) {
    for (let i = 0; i < 6; i++) {
        heartParticles.push({
            x: centerX + (Math.random() * 30 - 15),
            y: centerY + (Math.random() * 20 - 10),
            vx: Math.random() * 0.6 - 0.3,
            vy: -(Math.random() * 0.8 + 0.6),
            size: Math.floor(Math.random() * 8 + 12),
            alpha: 1.0,
            fadeSpeed: Math.random() * 0.012 + 0.01
        });
    }
}

// Disegna e aggiorna lo stato dei cuoricini attivi
function drawHearts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = heartParticles.length - 1; i >= 0; i--) {
        const p = heartParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.fadeSpeed;

        if (p.alpha <= 0) {
            heartParticles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.font = `bold ${p.size}px sans-serif`;

        ctx.shadowBlur = 6;
        ctx.shadowColor = "#f43f5e";
        ctx.fillStyle = "#ec4899";

        ctx.fillText("\u2665", p.x, p.y);
    }
    ctx.restore();
}

// INTEGRATO: Rilevamento asincrono della lingua attiva dal portfolio madre
function getParentLanguage() {
    try {
        return window.parent.document.documentElement.lang || "it";
    } catch (e) {
        return "it";
    }
}

// INTEGRATO: Avvia il monologo iniziale del personaggio in base alla lingua attiva
function triggerStartingMonologue() {
    const lang = getParentLanguage();
    if (lang === "en") {
        activeDialogue = "Hello, and welcome to the Folio! The playable portfolio. Turn on the PC to view the games, put on music on the stereo, or use the printer to view your CV or GDD. Or pet Lola, but be careful, she's sleeping...";
    } else {
        activeDialogue = "Ciao, e benvenuto in Folio! Il portfolio giocabile. Accendi il PC per visualizzare i giochi, metti la musica sullo stereo o usa la stampante per visualizzare il CV o il GDD. Oppure accarezza Lola, ma fai piano, sta dormendo...";
    }
}

// ==========================================================================
// 5. RENDERING LOOP (Y-Sorting condizionale)
// ==========================================================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImage, 0, 0, 512, 512);

    const playerFeetY = player.y + 190;

    if (fgCurtains.complete && fgCurtains.width > 0) {
        ctx.save();
        const curtainsSway = Math.sin(Date.now() * 0.0025) * 0.025;
        ctx.translate(0, 110);
        ctx.transform(1, 0, curtainsSway, 1, 0, 0);
        ctx.drawImage(fgCurtains, 0, -110, 512, 512);
        ctx.restore();
    }

    if (fgBed.complete && playerFeetY >= 350) {
        ctx.drawImage(fgBed, 0, 0, 512, 512);
        if (fgDog.complete) {
            ctx.drawImage(fgDog, 120, 210, 96, 96);
        }
    }
    if (fgSofa.complete && playerFeetY >= 460) {
        ctx.drawImage(fgSofa, 0, 0, 512, 512);
    }
    if (fgChair.complete && playerFeetY >= 370) {
        ctx.drawImage(fgChair, 0, 0, 512, 512);
    }
    if (fgPlant.complete && playerFeetY >= 270) {
        ctx.drawImage(fgPlant, 0, 0, 512, 512);
    }
    if (fgDesk.complete && playerFeetY >= 390) {
        ctx.drawImage(fgDesk, 0, 0, 512, 512);
    }

    if (player.state === "walk") {
        const walkFrames = playerWalkSprites[player.direction];
        if (walkFrames && walkFrames[player.currentFrame] && walkFrames[player.currentFrame].complete) {
            ctx.drawImage(walkFrames[player.currentFrame], player.x, player.y, player.width, player.height);
        }
    } else {
        const idleSprite = playerIdleSprites[player.direction];
        if (idleSprite && idleSprite.complete) {
            ctx.drawImage(idleSprite, player.x, player.y, player.width, player.height);
        }
    }

    drawCandleGlows();

    if (fgBed.complete && playerFeetY < 350) {
        ctx.drawImage(fgBed, 0, 0, 512, 512);
        if (fgDog.complete) {
            ctx.drawImage(fgDog, 120, 210, 96, 96);
        }
    }
    if (fgSofa.complete && playerFeetY < 460) {
        ctx.drawImage(fgSofa, 0, 0, 512, 512);
    }
    if (fgChair.complete && playerFeetY < 470) {
        ctx.drawImage(fgChair, 0, 0, 512, 512);
    }
    if (fgPlant.complete && playerFeetY < 470) {
        ctx.drawImage(fgPlant, 0, 0, 512, 512);
    }
    if (fgDesk.complete && playerFeetY < 390) {
        ctx.drawImage(fgDesk, 0, 0, 512, 512);
    }

    drawDust();
    drawHearts();

    if (debugMode) {
        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                if (collisionGrid[r][c] === 1) {
                    ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
                } else {
                    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
                }
                ctx.fillRect(c * tileSize, r * tileSize, tileSize - 1, tileSize - 1);
            }
        }

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;

        interactiveProps.forEach(prop => {
            ctx.fillStyle = "rgba(59, 130, 246, 0.3)";
            ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
            ctx.strokeRect(prop.x, prop.y, prop.width, prop.height);

            ctx.fillStyle = "#3b82f6";
            ctx.font = "bold 9px monospace";
            ctx.fillText(prop.name.toUpperCase(), prop.x + 4, prop.y + 12);
        });

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;

        ctx.strokeRect(player.x + 108, player.y + 130, 40, 40);
        ctx.strokeRect(player.x + 108, player.y + 190, 40, 20);

        ctx.fillStyle = "#10b981";
        ctx.font = "bold 10px monospace";
        ctx.fillText("EDITOR ACTIVE - Click to paint (F2 to close)", 10, 495);

        candles.forEach((candle, index) => {
            ctx.strokeStyle = "#fde047";
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.arc(candle.x, candle.y, 8, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(candle.x - 12, candle.y);
            ctx.lineTo(candle.x + 12, candle.y);
            ctx.moveTo(candle.x, candle.y - 12);
            ctx.lineTo(candle.x, candle.y + 12);
            ctx.stroke();

            ctx.fillStyle = "#fde047";
            ctx.font = "bold 9px monospace";
            ctx.fillText(`C${index + 1}`, candle.x + 10, candle.y - 10);
        });
    }

    if (activeDialogue) {
        const boxX = 20;
        const boxY = 370;
        const boxW = 472;
        const boxH = 120;

        ctx.fillStyle = "rgba(10, 5, 20, 0.95)";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;

        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = "#f3f4f6";
        ctx.font = "13px monospace";

        const words = activeDialogue.split(' ');
        let line = '';
        let textY = boxY + 30;
        const maxWidth = boxW - 40;
        const lineHeight = 22;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, boxX + 20, textY);
                line = words[n] + ' ';
                textY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, boxX + 20, textY);

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 9px monospace";
        ctx.fillText("PREMI SPAZIO PER CHIUDERE", boxX + boxW - 170, boxY + boxH - 15);
    }

    // --- LIVELLO 5.5: MENÙ DI SCELTA GENERICO SÌ/NO / DIVERSI (CENTRATURA DINAMICA - AGGIORNATO) ---
    if (activeChoice) {
        const boxX = 20;
        const boxY = 370;
        const boxW = 472;
        const boxH = 120;

        ctx.fillStyle = "rgba(10, 5, 20, 0.95)";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 3;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Impostiamo l'allineamento centrato per la domanda
        ctx.fillStyle = "#f3f4f6";
        ctx.font = "13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(activeChoice.question, boxX + (boxW / 2), boxY + 38);

        const optY = boxY + 80;
        ctx.font = "bold 13px monospace";

        if (activeChoice.options) {
            const numOpts = activeChoice.options.length;
            activeChoice.options.forEach((opt, index) => {
                const anchorX = boxX + (boxW / (numOpts + 1)) * (index + 1);
                const isSelected = (selectedOption === index);

                if (isSelected) {
                    ctx.fillStyle = "#06b6d4";
                    ctx.fillText(`> ${opt}`, anchorX, optY);
                } else {
                    ctx.fillStyle = "#9ca3af";
                    ctx.fillText(`  ${opt}`, anchorX, optY);
                }
            });
        } else {
            const yesLabel = activeChoice.labelYes || "SI";
            const noLabel = activeChoice.labelNo || "NO";

            const leftAnchorX = boxX + (boxW * 0.3);
            if (selectedOption === "yes") {
                ctx.fillStyle = "#10b981";
                ctx.fillText(`> ${yesLabel}`, leftAnchorX, optY);
            } else {
                ctx.fillStyle = "#9ca3af";
                ctx.fillText(`  ${yesLabel}`, leftAnchorX, optY);
            }

            const rightAnchorX = boxX + (boxW * 0.7);
            if (selectedOption === "no") {
                ctx.fillStyle = "#f43f5e";
                ctx.fillText(`> ${noLabel}`, rightAnchorX, optY);
            } else {
                ctx.fillStyle = "#9ca3af";
                ctx.fillText(`  ${noLabel}`, rightAnchorX, optY);
            }
        }

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 8px monospace";
        ctx.fillText("USA A/D o FRECCE per selezionare • SPAZIO per confermare", boxX + (boxW / 2), boxY + boxH - 12);

        ctx.textAlign = "left";
    }
}

// INTEGRATO: Avvia il ciclo principale inserendo il monologo iniziale di avvio partita bilingue
function mainLoop() {
    if (gameStarted) return;
    gameStarted = true;

    // Innesca il monologo bilingue all'avvio della partita
    triggerStartingMonologue();

    tick();
}

function tick() {
    update();
    draw();
    requestAnimationFrame(tick);
}

// ==========================================================================
// 6. INTERAZIONE
// ==========================================================================
function checkInteraction() {
    const pX = player.x + 108;
    const pY = player.y + 190;
    const pW = 40;
    const pH = 20;
    const padding = 25;

    interactiveProps.forEach(prop => {
        const isNear = (
            pX + pW + padding >= prop.x &&
            pX - padding <= prop.x + prop.width &&
            pY + pH + padding >= prop.y &&
            pY - padding <= prop.y + prop.height
        );

        if (isNear) {
            if (prop.name === "letto") {
                activeChoice = {
                    question: "Vuoi accarezzare il cagnolino sul letto?",
                    labelYes: "SI",
                    labelNo: "NO",
                    onYes: () => {
                        activeDialogue = "Hai accarezzato il cagnolino! *Cuoricini*";
                        spawnHearts(168, 248);
                    },
                    onNo: () => { activeDialogue = null; }
                };
                selectedOption = "yes";
            }
            else if (prop.name === "computer") {
                bootComputerSystem();
            }
            else if (prop.name === "porta_uscita") {
                activeChoice = {
                    question: "Vuoi uscire dalla stanza?",
                    labelYes: "SI",
                    labelNo: "NO",
                    onYes: () => { exitToPortfolio(); },
                    onNo: () => { activeDialogue = null; }
                };
                selectedOption = "yes";
            }
            else if (prop.name === "stereo") {
                activeChoice = {
                    question: "Vuoi accendere la musica dello stereo?",
                    labelYes: "ACCENDI",
                    labelNo: "SPEGNI",
                    onYes: () => {
                        playStereoMusic();
                        activeDialogue = "Musica avviata nello stereo a vinile.";
                    },
                    onNo: () => {
                        stopStereoMusic();
                        activeDialogue = "Musica interrotta. Silenzio nella stanza.";
                    }
                };
                selectedOption = "yes";
            }
            else if (prop.name === "printer") {
                activeChoice = {
                    question: "Cosa vuoi visualizzare tramite la stampante?",
                    labelYes: "CV",
                    labelNo: "GDD",
                    onYes: () => {
                        openProjectDocument("cv");
                        activeDialogue = "Stampante in corso: Apertura del Curriculum Vitae...";
                    },
                    onNo: () => {
                        openProjectDocument("gdd");
                        activeDialogue = "Stampante in corso: Caricamento dei Game Design Documents...";
                    }
                };
                selectedOption = "yes";
            }
        }
    });
}

function checkAutoExit() {
    let pCenterX = player.x + player.width / 2;
    let pCenterY = player.y + player.height / 2;

    if (pCenterX > 380 && pCenterX < 450 && pCenterY > 100 && pCenterY < 160) {
        exitToPortfolio();
    }
}

function exitToPortfolio() {
    window.parent.postMessage('close-giocafolio', '*');
}

if (assetsLoaded === totalAssets) {
    mainLoop();
}