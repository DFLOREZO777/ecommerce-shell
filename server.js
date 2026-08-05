// server.js
const express = require('express');
const path = require('path');

const app = express();

// La carpeta que contiene el build de Angular
const staticPath = path.join(__dirname, 'dist', 'ecommerce-shell', 'browser');
app.use(express.static(staticPath));

// Para que Angular maneje el routing del cliente
app.use((req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
