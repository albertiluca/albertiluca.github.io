document.addEventListener("DOMContentLoaded", function () {

    // 1. GESTIONE ACCORDION SKILLS
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

    // 2. GESTIONE CARICAMENTO ASINCRONO ED APERTURA GDD POP-UP (Fetch Localizzato)
    var modal = document.getElementById("gdd-modal");
    var openBtn = document.getElementById("open-gdd-btn");
    var closeBtn = document.getElementById("close-gdd-btn");
    var gddContent = document.getElementById("gdd-text-content");

    // Funzione per determinare la lingua attiva sul sito
    function getActiveLanguage() {
        const langEnBtn = document.getElementById("lang-en");
        if (langEnBtn && langEnBtn.classList.contains("active")) {
            return "en";
        }
        return "it"; // Default
    }

    // Funzione asincrona per caricare il GDD corretto
    function loadLocalizedGDD() {
        const lang = getActiveLanguage();
        const gddFile = `gdd-carnacki-${lang}.html`; // Carica gdd-carnacki-it.html o gdd-carnacki-en.html

        fetch(gddFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Codice errore: ' + response.status + ' - File non trovato.');
                }
                return response.text();
            })
            .then(data => {
                if (gddContent) {
                    gddContent.innerHTML = data; // Inserisce il testo localizzato
                }
            })
            .catch(error => {
                if (gddContent) {
                    gddContent.innerHTML = '<p style="color: var(--accent-red); text-align: center; padding: 20px;"><strong>Errore di Caricamento:</strong><br>' + error.message + '</p>';
                }
            });
    }

    if (openBtn && modal) {
        // Apri il pop-up e carica il GDD
        openBtn.addEventListener("click", function () {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden"; // Blocca lo scroll dello sfondo
            loadLocalizedGDD();
        });
    }

    // GESTIONE TRADUZIONE IN TEMPO REALE CON MODAL APERTA
    const langItBtn = document.getElementById("lang-it");
    const langEnBtn = document.getElementById("lang-en");

    if (langItBtn && langEnBtn) {
        // Se l'utente clicca sulle lingue, ricarica subito il GDD corrispondente
        langItBtn.addEventListener("click", function () {
            if (modal && modal.style.display === "flex") {
                setTimeout(loadLocalizedGDD, 50); // Piccolo ritardo per dare il tempo al traduttore di aggiornare le classi
            }
        });
        langEnBtn.addEventListener("click", function () {
            if (modal && modal.style.display === "flex") {
                setTimeout(loadLocalizedGDD, 50);
            }
        });
    }

    if (closeBtn) {
        // Chiudi il pop-up con la 'X'
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    // Chiudi il pop-up cliccando fuori dalla finestra centrale
    window.addEventListener("click", function (e) {
        if (e.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    // 3. BLOCCO TASTIERA (Salvataggio e Stampa)
    window.addEventListener('keydown', function (e) {
        if (modal && modal.style.display === "flex") {
            if ((e.ctrlKey && e.key === 's') || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                alert('Download e stampa non consentiti per tutelare la proprietà intellettuale dell\'opera.');
            }
        }
    });

});