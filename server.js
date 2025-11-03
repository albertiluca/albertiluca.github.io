const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 1337;

// Questa riga è la magia: dice al server di rendere disponibili
// tutti i file che si trovano nella sua stessa cartella (index.html, style.css, etc.)
app.use(express.static(__dirname));

// Quando il server parte, scrive un messaggio per farci sapere che è tutto OK.
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
