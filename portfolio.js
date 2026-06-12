document.addEventListener("DOMContentLoaded", function () {

    // ==========================================================================
    // GESTIONE CARICAMENTO ASINCRONO BILINGUE DELLE SKILLS
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
    // GESTIONE CARICAMENTO ASINCRONO BILINGUE DEL GDD POP-UP (Fetch)
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
    // GESTIONE TRADUZIONE IN TEMPO REALE (Skills e GDD coordinati)
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
    // AVVIO INIZIALE DEL SITO (Caricamento delle Skills corrette)
    // ==========================================================================
    loadLocalizedSkills();

});