const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-form.html'));
});

app.listen(port, () => {
  console.log(`Test form server running at http://localhost:${port}`);
});
