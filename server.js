const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 1337;

// 1. Rende disponibile l'intera cartella principale usando i percorsi assoluti sicuri
app.use(express.static(path.join(__dirname)));

// 2. Forza l'esposizione esplicita della cartella 'Video' (Risolve i 404 sui file multimediali)
app.use('/Video', express.static(path.join(__dirname, 'Video')));

// 3. Rotta principale per servire in sicurezza il file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Avvio del server sulla porta 1337
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});