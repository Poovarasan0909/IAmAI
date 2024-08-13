const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/testing', (req, res) => {
    res.send('test success')
})

app.listen(5000, () => {
    console.log('Server running at http://localhost:5000/');
});