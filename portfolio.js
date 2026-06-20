document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. CARICAMENTO ASINCRONO BILINGUE DELLE SKILLS
    // ==========================================================================
    var skillsSection = document.getElementById("skills");

    // Funzione per determinare la lingua attiva sul sito
    function getActiveLanguage() {
        const langEnBtn = document.getElementById("lang-en");
        if (langEnBtn && langEnBtn.classList.contains("active")) {
            return "en";
        }
        return "it"; // Default
    }

    // Funzione asincrona per caricare il file di skills corretto
    function loadLocalizedSkills() {
        if (!skillsSection) return;
        const lang = getActiveLanguage();
        const skillsFile = `skills-content-${lang}.html`;

        fetch(skillsFile)
            .then(response => {
                if (!response.ok) throw new Error('Impossibile caricare le competenze.');
                return response.text();
            })
            .then(data => {
                skillsSection.innerHTML = data; // Inietta il codice localizzato
                initAccordion(); // Inizializza l'accordion sui nuovi elementi iniettati
            })
            .catch(error => {
                skillsSection.innerHTML = '<p style="color: var(--accent-red); text-align: center; padding: 20px;">Errore durante il caricamento delle competenze.</p>';
            });
    }

    // FUNZIONE DI INIZIALIZZAZIONE ACCORDION
    function initAccordion() {
        var acc = document.getElementsByClassName("accordion-button");
        var i;
        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function () {
                for (var j = 0; j < acc.length; j++) {
                    if (this !== acc[j]) {
                        acc[j].classList.remove("active");
                        acc[j].nextElementSibling.style.maxHeight = null;
                    }
                }
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }

    // ==========================================================================
    // 2. GESTIONE CARICAMENTO ASINCRONO BILINGUE DEL GDD POP-UP (Fetch)
    // ==========================================================================
    var modal = document.getElementById("gdd-modal");
    var openBtn = document.getElementById("open-gdd-btn");
    var closeBtn = document.getElementById("close-gdd-btn");
    var gddContent = document.getElementById("gdd-text-content");

    // Funzione asincrona per caricare il GDD corretto
    function loadLocalizedGDD() {
        const lang = getActiveLanguage();
        const gddFile = `gdd-carnacki-${lang}.html`;

        fetch(gddFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Codice errore: ' + response.status + ' - File non trovato.');
                }
                return response.text();
            })
            .then(data => {
                if (gddContent) {
                    gddContent.innerHTML = data;
                }
            })
            .catch(error => {
                if (gddContent) {
                    gddContent.innerHTML = '<p style="color: var(--accent-red); text-align: center; padding: 20px;"><strong>Errore di Caricamento:</strong><br>' + error.message + '</p>';
                }
            });
    }

    if (openBtn && modal) {
        openBtn.addEventListener("click", function () {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            loadLocalizedGDD();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // ==========================================================================
    // 3. GESTIONE TRADUZIONE IN TEMPO REALE (Skills e GDD coordinati)
    // ==========================================================================
    const langItBtn = document.getElementById("lang-it");
    const langEnBtn = document.getElementById("lang-en");

    if (langItBtn && langEnBtn) {
        langItBtn.addEventListener("click", function () {
            setTimeout(loadLocalizedSkills, 50);
            if (modal && modal.style.display === "flex") {
                setTimeout(loadLocalizedGDD, 50);
            }
        });

        langEnBtn.addEventListener("click", function () {
            setTimeout(loadLocalizedSkills, 50);
            if (modal && modal.style.display === "flex") {
                setTimeout(loadLocalizedGDD, 50);
            }
        });
    }

    // ==========================================================================
    // 4. BLOCCO TASTIERA (Salvataggio e Stampa)
    // ==========================================================================
    window.addEventListener('keydown', function (e) {
        if (modal && modal.style.display === "flex") {
            if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                alert('Download e stampa non consentiti per tutelare la proprietà intellettuale dell\'opera.');
            }
        }
    });

    // ==========================================================================
    // 5. EASTER EGG AVATAR (Spostato in sicurezza dentro il blocco DOMContentLoaded)
    // ==========================================================================
    var avatar = document.getElementById("about-avatar");
    var dblClickTimer = null;

    if (avatar) {
        function triggerElasticJump() {
            if (!avatar.classList.contains("bounce-active")) {
                avatar.classList.add("bounce-active");
                setTimeout(function () {
                    avatar.classList.remove("bounce-active");
                }, 1000);
            }
        }

        // --- GESTIONE PC ---
        avatar.addEventListener("dblclick", function () {
            triggerElasticJump();
        });

        // --- GESTIONE MOBILE ---
        avatar.addEventListener("touchstart", function (e) {
            if (dblClickTimer === null) {
                dblClickTimer = setTimeout(function () {
                    dblClickTimer = null;
                }, 300);
            } else {
                clearTimeout(dblClickTimer);
                dblClickTimer = null;
                e.preventDefault();
                triggerElasticJump();
            }
        });
    }

    // ==========================================================================
    // 6. MICRO-INTERAZIONE SUL BOTTONE CV (Hold-to-Charge)
    // ==========================================================================
    var cvBtn = document.getElementById("cv-btn");
    var cvPreview = document.getElementById("cv-preview");
    var chargeInterval = null;
    var chargeLevel = 0;

    if (cvBtn && cvPreview) {

        function startCharge(e) {
            chargeLevel = 0;
            cvBtn.style.setProperty("--charge-width", "0%");

            chargeInterval = setInterval(function () {
                chargeLevel += 5;
                if (chargeLevel >= 100) {
                    chargeLevel = 100;
                    clearInterval(chargeInterval);
                    triggerCVPreview();
                }
                cvBtn.style.setProperty("--charge-width", chargeLevel + "%");
            }, 60);
        }

        function stopCharge() {
            clearInterval(chargeInterval);
            if (chargeLevel < 100) {
                chargeLevel = 0;
                cvBtn.style.setProperty("--charge-width", "0%");
            }
        }

        function triggerCVPreview() {
            cvPreview.classList.add("preview-active");
            cvBtn.style.setProperty("--charge-width", "100%");

            setTimeout(function () {
                cvPreview.classList.remove("preview-active");
                cvBtn.style.setProperty("--charge-width", "0%");
                chargeLevel = 0;
            }, 4000);
        }

        // --- EVENTI MOBILE ---
        cvBtn.addEventListener("touchstart", function (e) {
            e.preventDefault();
            startCharge(e);
        });

        cvBtn.addEventListener("touchend", function (e) {
            stopCharge();
            if (chargeLevel < 25) {
                window.open(cvBtn.href, "_blank");
            }
        });

        cvBtn.addEventListener("touchcancel", stopCharge);
    }

    // ==========================================================================
    // 7. GESTIONE GIOCAFOLIO (Apertura, Chiusura ed evento d'uscita da giocafolio)
    // ==========================================================================
    var gameModal = document.getElementById("game-modal");
    var openGameBtn = document.getElementById("open-game-btn");
    var closeGameBtn = document.getElementById("close-game-btn");
    var gameIframe = document.getElementById("game-iframe");

    if (openGameBtn && gameModal && gameIframe) {
        openGameBtn.addEventListener("click", function () {
            gameModal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Blocca lo scroll del sito dietro

            // Carica la pagina giocafolio.html situata nella sottocartella giocafolio/
            gameIframe.src = "giocafolio/giocafolio.html";
        });
    }

    if (closeGameBtn) {
        closeGameBtn.addEventListener("click", function () {
            gameModal.style.display = "none";
            document.body.style.overflow = "auto";
            gameIframe.src = ""; // Svuota l'iframe per fermare l'esecuzione
        });
    }

    // Ascolta il messaggio d'uscita proveniente da giocafolio.html
    window.addEventListener("message", function (event) {
        if (event.data === 'close-giocafolio') {
            gameModal.style.display = "none";
            document.body.style.overflow = "auto";
            gameIframe.src = ""; // Ferma l'esecuzione
        }
    });

    // ==========================================================================
    // 8. AVVIO INIZIALE DEL SITO (Caricamento delle Skills corrette)
    // ==========================================================================
    loadLocalizedSkills();

}); 