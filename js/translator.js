document.addEventListener('DOMContentLoaded', () => {
    // Selezioniamo i pulsanti direttamente tramite il loro ID
    const langItButton = document.getElementById('lang-it');
    const langEnButton = document.getElementById('lang-en');

    // Controlliamo che i pulsanti esistano prima di continuare
    if (!langItButton || !langEnButton) {
        console.error("Pulsanti della lingua non trovati! Assicurati che gli ID 'lang-it' e 'lang-en' siano presenti nell'HTML.");
        return;
    }

    let translations = {};

    // 1. Carica il file JSON delle traduzioni
    async function loadTranslations() {
        try {
            const response = await fetch('js/languages.json');
            if (!response.ok) {
                throw new Error(`Errore nel caricamento del file JSON: ${response.statusText}`);
            }
            translations = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    // 2. Funzione principale per tradurre la pagina
    function translatePage(language) {
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[language] && translations[language][key]) {
                element.textContent = translations[language][key];
            }
        });

        // Aggiorna lo stile dei pulsanti
        if (language === 'it') {
            langItButton.classList.add('active');
            langEnButton.classList.remove('active');
        } else {
            langEnButton.classList.add('active');
            langItButton.classList.remove('active');
        }
    }

    // 3. Aggiunge gli eventi click
    langItButton.addEventListener('click', () => {
        localStorage.setItem('language', 'it'); // Salva la preferenza
        translatePage('it');
    });

    langEnButton.addEventListener('click', () => {
        localStorage.setItem('language', 'en'); // Salva la preferenza
        translatePage('en');
    });

    // 4. Inizializza la pagina al caricamento
    async function initialize() {
        await loadTranslations();
        // Controlla se una lingua è salvata, altrimenti usa quella del browser o default a 'en'
        const savedLang = localStorage.getItem('language') || (navigator.language.startsWith('it') ? 'it' : 'en');
        translatePage(savedLang);
    }

    initialize();
});