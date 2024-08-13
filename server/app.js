const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/testing', (req, res) => {
    res.send('test success')
})

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});