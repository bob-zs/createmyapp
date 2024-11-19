const path = require('path');
const express = require('express');

const app = express();

app.use('/dist', express.static('dist'));

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public/index.html')));


const PORT = 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));