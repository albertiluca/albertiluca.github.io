document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // 1. GESTIONE CARICAMENTO ASINCRONO BILINGUE DELLE SKILLS
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
        const skillsFile = `skills-content-${lang}.html`; // Carica skills-content-it.html o skills-content-en.html

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

    // ==========================================================================
    // 3. GESTIONE TRADUZIONE IN TEMPO REALE (Skills e GDD coordinati)
    // ==========================================================================
    const langItBtn = document.getElementById("lang-it");
    const langEnBtn = document.getElementById("lang-en");

    if (langItBtn && langEnBtn) {
        langItBtn.addEventListener("click", function () {
            // Aggiorna le skills in tempo reale all'istante
            setTimeout(loadLocalizedSkills, 50);

            // Se la modal del GDD è aperta, aggiorna anche il GDD all'istante
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

    // BLOCCO TASTIERA (Salvataggio e Stampa)
    window.addEventListener('keydown', function (e) {
        if (modal && modal.style.display === "flex") {
            if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                alert('Download e stampa non consentiti per tutelare la proprietà intellettuale dell\'opera.');
            }
        }
    });

    // ==========================================================================
    // 4. AVVIO INIZIALE DEL SITO (Caricamento delle Skills corrette)
    // ==========================================================================
    loadLocalizedSkills();

    // ==========================================================================
    // 5. EASTER EGG SUL PULSANTE CV (Hold-to-Charge per Mobile, Hover per PC)
    // ==========================================================================
    var cvBtn = document.getElementById("cv-btn");
    var cvPreview = document.getElementById("cv-preview");
    var chargeInterval = null;
    var chargeLevel = 0;       // Percentuale di caricamento (0-100)
    var isHolding = false;     // Traccia se l'utente sta tenendo premuto

    if (cvBtn && cvPreview) {

        // Funzione che avvia il riempimento della barra
        function startCharge(e) {
            isHolding = true;
            chargeLevel = 0;
            cvBtn.style.setProperty("--charge-width", "0%");

            // Incrementa la barra del 5% ogni 60ms (Totale: 1.2 secondi per caricare al 100%)
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

        // Funzione che ferma il caricamento se rilasciato prima del tempo
        function stopCharge() {
            isHolding = false;
            clearInterval(chargeInterval);

            // Se rilasciato prima del 100%, resetta la barra
            if (chargeLevel < 100) {
                chargeLevel = 0;
                cvBtn.style.setProperty("--charge-width", "0%");
            }
        }

        // Sblocca la nuvoletta di preview su mobile
        function triggerCVPreview() {
            cvPreview.classList.add("preview-active");
            cvBtn.style.setProperty("--charge-width", "100%");

            // Chiude automaticamente la preview dopo 4 secondi per non intasare lo schermo
            setTimeout(function () {
                cvPreview.classList.remove("preview-active");
                cvBtn.style.setProperty("--charge-width", "0%");
                chargeLevel = 0;
            }, 4000);
        }

        // --- EVENTI MOBILE/TOUCH ---
        cvBtn.addEventListener("touchstart", function (e) {
            e.preventDefault(); // Impedisce il download immediato al tocco lungo nativo del sistema
            startCharge(e);
        });

        cvBtn.addEventListener("touchend", function (e) {
            stopCharge();
            // Se è stato un tap rapido (senza caricamento), apri il PDF normalmente
            if (chargeLevel < 25) {
                window.open(cvBtn.href, "_blank");
            }
        });

        cvBtn.addEventListener("touchcancel", stopCharge);
    }

});