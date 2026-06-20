// js/audio-system.js

// Istanza audio globale dello stereo della stanza
let bgMusic = new Audio("../audio/pixel-glow.mp3"); // Salva qui la tua traccia retro-synthwave
bgMusic.loop = true;
bgMusic.volume = 0.35; // Volume di default moderato
let isMusicPlaying = false;

function playStereoMusic() {
    if (isMusicPlaying) return;

    bgMusic.play()
        .then(() => {
            isMusicPlaying = true;
        })
        .catch(err => {
            console.warn("Autoplay bloccato dal browser. L'utente deve prima interagire con la pagina.");
        });
}

function stopStereoMusic() {
    if (!isMusicPlaying) return;

    bgMusic.pause();
    bgMusic.currentTime = 0; // Riposiziona la traccia all'inizio
    isMusicPlaying = false;
}