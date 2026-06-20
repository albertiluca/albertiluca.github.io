// document-system.js

function openProjectDocument(docType) {
    let docSrc = "";
    let themeColor = "";

    // Configurazione dei percorsi e dei colori a tema coordinati per CV e GDD
    if (docType === "cv") {
        docSrc = "../docs/LucaAlberti_GameDesigner_TechArtist - CV.png";
        themeColor = "#06b6d4"; // Azzurro neon
    }
    else if (docType === "gdd") {
        docSrc = "../gdd-carnacki-en.html";
        themeColor = "#f43f5e"; // Rosso/rosa neon
    }

    if (!docSrc) return;

    // Rimuove eventuali overlay precedentemente aperti
    const existingOverlay = document.getElementById("document-overlay");
    if (existingOverlay) existingOverlay.remove();

    // Creazione del contenitore overlay (Agganciato a tutto schermo sull'intero body dell'iframe)
    const overlay = document.createElement("div");
    overlay.id = "document-overlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "#05020a";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.zIndex = "120"; // Superiore a qualsiasi altro elemento
    overlay.style.overflow = "hidden";

    // Barra Superiore dinamica con il pulsante "Torna al Gioco" a tema
    const backBar = document.createElement("div");
    backBar.textContent = "X TORNA AL GIOCO";
    backBar.style.color = themeColor;
    backBar.style.fontFamily = "monospace";
    backBar.style.fontWeight = "bold";
    backBar.style.fontSize = "12px";
    backBar.style.padding = "14px";
    backBar.style.textAlign = "center";
    backBar.style.backgroundColor = "rgba(5, 2, 10, 0.98)";
    backBar.style.borderBottom = `2px solid ${themeColor}`;
    backBar.style.letterSpacing = "1.5px";
    backBar.style.cursor = "pointer";
    backBar.style.userSelect = "none";

    backBar.onclick = () => {
        overlay.remove();
    };

    overlay.appendChild(backBar);

    // INTEGRATO: Iniezione dinamica della scrollbar personalizzata coordinata al colore del tema
    let scrollStyle = document.getElementById("document-scrollbar-style");
    if (!scrollStyle) {
        scrollStyle = document.createElement("style");
        scrollStyle.id = "document-scrollbar-style";
        document.head.appendChild(scrollStyle);
    }
    scrollStyle.innerHTML = `
        #document-scroll-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        #document-scroll-container::-webkit-scrollbar-track {
            background: #05020a;
        }
        #document-scroll-container::-webkit-scrollbar-thumb {
            background: ${themeColor};
            border-radius: 4px;
        }
    `;

    // GESTIONE DIFFERENZIATA: Immagine interattiva per il CV, Iframe per il GDD
    if (docType === "cv") {
        // Contenitore scorrevole per l'immagine del CV
        const scrollContainer = document.createElement("div");
        scrollContainer.id = "document-scroll-container";
        scrollContainer.style.width = "100%";
        scrollContainer.style.height = "calc(100% - 45px)"; // Esclude l'altezza della barra superiore
        scrollContainer.style.overflow = "auto"; // Abilita scorrimento sia verticale che orizzontale per lo zoom
        scrollContainer.style.backgroundColor = "#05020a";
        scrollContainer.style.padding = "10px";
        scrollContainer.style.boxSizing = "border-box";

        const cvImg = document.createElement("img");
        cvImg.src = docSrc;
        cvImg.style.width = "100%"; // Di base sfrutta tutta la larghezza dello schermo
        cvImg.style.height = "auto";
        cvImg.style.maxHeight = "none";
        cvImg.style.display = "block";
        cvImg.style.margin = "0 auto";
        cvImg.style.borderRadius = "4px";
        cvImg.style.transition = "width 0.2s ease-out"; // Transizione fluida dello zoom
        cvImg.style.cursor = "zoom-in"; // Cursore a lente di ingrandimento

        // INTEGRATO: Sistema di Zoom a clic/tap singolo per massima leggibilità
        let isZoomed = false;
        cvImg.addEventListener("click", () => {
            isZoomed = !isZoomed;
            if (isZoomed) {
                cvImg.style.width = "180%"; // Ingrandisce l'immagine per permettere la lettura dei dettagli
                cvImg.style.cursor = "zoom-out"; // Cursore lente meno
            } else {
                cvImg.style.width = "100%"; // Ritorna a schermo intero
                cvImg.style.cursor = "zoom-in";
            }
        });

        scrollContainer.appendChild(cvImg);
        overlay.appendChild(scrollContainer);
    }
    else if (docType === "gdd") {
        // Iframe per caricare la pagina HTML del GDD di Carnacki
        const docFrame = document.createElement("iframe");
        docFrame.id = "document-scroll-container"; // Applica la stessa scrollbar personalizzata
        docFrame.src = docSrc;
        docFrame.style.width = "100%";
        docFrame.style.height = "calc(100% - 45px)";
        docFrame.style.border = "none";
        docFrame.style.backgroundColor = "#05020a";

        overlay.appendChild(docFrame);
    }

    // CORRETTO: Appende l'overlay direttamente al body del documento (non al canvas)
    // per coprire l'intera modale e sfruttare l'altezza totale dello schermo su mobile
    document.body.appendChild(overlay);
}