const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
const mongoose = require('mongoose');

const testRoutes = require('./routes/testRoutes');
const geminiApiRoutes = require('./routes/GeminiApiRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = 'mongodb+srv://poovarasan_0909:poov09092002@gemini-api.ka3hnmn.mongodb.net/?retryWrites=true&w=majority&appName=gemini-api';
mongoose.connect(uri).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use('/', testRoutes);
app.use('/', geminiApiRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});