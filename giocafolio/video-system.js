// video-system.js

function bootComputerSystem() {
    // Rimuove un eventuale overlay già esistente per sicurezza
    const existing = document.getElementById("video-overlay");
    if (existing) existing.remove();

    // Crea l'overlay di sfondo nero che copre l'INTERA pagina (body)
    const overlay = document.createElement("div");
    overlay.id = "video-overlay";

    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(5, 2, 10, 0.95)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "100";

    // Contenitore del Monitor (Sfrutta l'intera superficie della modale su mobile!)
    const monitorContainer = document.createElement("div");
    monitorContainer.style.position = "relative";
    monitorContainer.style.width = "512px";
    monitorContainer.style.height = "512px";
    monitorContainer.style.maxWidth = "95vw";  // Sfrutta fino al 95% dello schermo mobile
    monitorContainer.style.maxHeight = "95vw";
    monitorContainer.style.boxSizing = "border-box";

    // Schermo del Monitor (Inizialmente mostra lo sfondo prop_desktop_on.png)
    const monitorScreen = document.createElement("img");
    monitorScreen.id = "monitor-screen";
    monitorScreen.src = "../img/prop_desktop_on.png";
    monitorScreen.style.position = "absolute";
    monitorScreen.style.top = "0";
    monitorScreen.style.left = "0";
    monitorScreen.style.width = "100%";
    monitorScreen.style.height = "100%";
    monitorScreen.style.objectFit = "contain";
    monitorScreen.style.zIndex = "15";

    // Menù di selezione dei giochi (posizionato all'interno dello schermo del PC)
    const menuContainer = document.createElement("div");
    menuContainer.id = "computer-menu";
    menuContainer.style.position = "absolute";
    menuContainer.style.top = "15.2%";
    menuContainer.style.left = "14.2%";
    menuContainer.style.width = "71.5%";
    menuContainer.style.height = "53.5%";
    menuContainer.style.display = "flex";
    menuContainer.style.flexDirection = "column";
    menuContainer.style.justifyContent = "center";
    menuContainer.style.alignItems = "center";
    menuContainer.style.zIndex = "25";

    // Titolo del menù retro
    const menuTitle = document.createElement("p");
    menuTitle.textContent = "SELECT GAME TRAILER";
    menuTitle.style.color = "#fde047";
    menuTitle.style.fontFamily = "monospace";
    menuTitle.style.fontWeight = "bold";
    menuTitle.style.fontSize = "13px";
    menuTitle.style.marginBottom = "15px";
    menuTitle.style.letterSpacing = "1.5px";
    menuTitle.style.textShadow = "0 0 5px rgba(253, 224, 71, 0.4)";
    menuContainer.appendChild(menuTitle);

    // I tre pulsanti dei giochi
    const gamesList = [
        { id: "shadowseeker", name: "SHADOWSEEKER" },
        { id: "sandy", name: "SANDY" },
        { id: "debian", name: "DEBIAN CHRONICLES" }
    ];

    gamesList.forEach(game => {
        const btn = document.createElement("button");
        btn.textContent = game.name;
        btn.style.width = "75%";
        btn.style.padding = "6px";
        btn.style.marginBottom = "8px";
        btn.style.backgroundColor = "rgba(6, 182, 212, 0.12)";
        btn.style.border = "1.5px solid #06b6d4";
        btn.style.color = "#06b6d4";
        btn.style.fontFamily = "monospace";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "10px";
        btn.style.cursor = "pointer";
        btn.style.borderRadius = "4px";
        btn.style.transition = "all 0.15s ease";

        // Hover Desktop (Mouse)
        btn.onmouseover = () => {
            btn.style.backgroundColor = "rgba(6, 182, 212, 0.35)";
            btn.style.boxShadow = "0 0 8px rgba(6, 182, 212, 0.5)";
        };
        btn.onmouseout = () => {
            btn.style.backgroundColor = "rgba(6, 182, 212, 0.12)";
            btn.style.boxShadow = "none";
        };

        // INTEGRATO: Touch feedback immediato per dispositivi mobile (Illuminazione al tocco)
        btn.addEventListener("touchstart", () => {
            btn.style.backgroundColor = "rgba(6, 182, 212, 0.45)";
            btn.style.boxShadow = "0 0 12px rgba(6, 182, 212, 0.6)";
        });
        btn.addEventListener("touchend", () => {
            btn.style.backgroundColor = "rgba(6, 182, 212, 0.12)";
            btn.style.boxShadow = "none";
        });

        btn.onclick = () => {
            startVideoPlayer(game.id, monitorContainer);
        };

        menuContainer.appendChild(btn);
    });

    // Tasto di spegnimento PC
    const turnOffBtn = document.createElement("div");
    turnOffBtn.textContent = "X SPEGNI PC E TORNA AL GIOCO";
    turnOffBtn.style.color = "#f43f5e";
    turnOffBtn.style.fontFamily = "monospace";
    turnOffBtn.style.fontWeight = "bold";
    turnOffBtn.style.fontSize = "11px";
    turnOffBtn.style.marginTop = "15px";
    turnOffBtn.style.cursor = "pointer";
    turnOffBtn.style.letterSpacing = "1.5px";
    turnOffBtn.style.transition = "color 0.1s";

    turnOffBtn.onmouseover = () => { turnOffBtn.style.color = "#ff4d6d"; };
    turnOffBtn.onmouseout = () => { turnOffBtn.style.color = "#f43f5e"; };

    // Feedback touch spegnimento
    turnOffBtn.addEventListener("touchstart", () => { turnOffBtn.style.color = "#ff4d6d"; });
    turnOffBtn.addEventListener("touchend", () => { turnOffBtn.style.color = "#f43f5e"; });

    turnOffBtn.onclick = () => {
        overlay.remove();
    };

    monitorContainer.appendChild(monitorScreen);
    monitorContainer.appendChild(menuContainer);
    overlay.appendChild(monitorContainer);
    overlay.appendChild(turnOffBtn);

    // CORRETTO: Appende direttamente al body dell'iframe per riempire tutto lo schermo nero su mobile
    document.body.appendChild(overlay);
}

function startVideoPlayer(gameId, container) {
    const menu = document.getElementById("computer-menu");
    if (menu) menu.remove();

    const screen = document.getElementById("monitor-screen");
    if (screen) {
        screen.src = "../img/prop_desktop_empty.png";
        screen.style.zIndex = "25";
        screen.style.pointerEvents = "none";
    }

    const videoSources = {
        shadowseeker: "../video/carnackiEstratto_trailer.mp4",
        sandy: "../video/sandy_trailer.mp4",
        debian: "../video/leCronacheDiDebian_trailer.mp4"
    };

    const source = videoSources[gameId] || "";

    const video = document.createElement("video");
    video.id = "computer-video";
    video.src = source;
    video.controls = true;
    video.autoplay = true;

    video.style.position = "absolute";
    video.style.top = "15.2%";
    video.style.left = "14.2%";
    video.style.width = "71.5%";
    video.style.height = "53.5%";
    video.style.zIndex = "10";
    video.style.backgroundColor = "#000";
    video.style.borderRadius = "2px";

    // Pulsante per tornare al Desktop del PC
    const backToDesktopBtn = document.createElement("div");
    backToDesktopBtn.id = "back-to-desktop";
    backToDesktopBtn.textContent = "X TORNA AL DESKTOP PC";
    backToDesktopBtn.style.position = "absolute";
    backToDesktopBtn.style.bottom = "8%";
    backToDesktopBtn.style.left = "50%";
    backToDesktopBtn.style.transform = "translateX(-50%)";
    backToDesktopBtn.style.color = "#06b6d4";
    backToDesktopBtn.style.fontFamily = "monospace";
    backToDesktopBtn.style.fontWeight = "bold";
    backToDesktopBtn.style.fontSize = "11px";
    backToDesktopBtn.style.cursor = "pointer";
    backToDesktopBtn.style.zIndex = "30";
    backToDesktopBtn.style.letterSpacing = "1.5px";
    backToDesktopBtn.style.transition = "color 0.1s";

    backToDesktopBtn.onmouseover = () => { backToDesktopBtn.style.color = "#22d3ee"; };
    backToDesktopBtn.onmouseout = () => { backToDesktopBtn.style.color = "#06b6d4"; };

    // Feedback touch ritorno desktop
    backToDesktopBtn.addEventListener("touchstart", () => { backToDesktopBtn.style.color = "#22d3ee"; });
    backToDesktopBtn.addEventListener("touchend", () => { backToDesktopBtn.style.color = "#06b6d4"; });

    backToDesktopBtn.onclick = () => {
        video.remove();
        backToDesktopBtn.remove();
        bootComputerSystem();
    };

    container.appendChild(video);
    container.appendChild(backToDesktopBtn);
}