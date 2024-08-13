const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = 'mongodb+srv://poovarasan_0909:poov09092002@gemini-api.ka3hnmn.mongodb.net/?retryWrites=true&w=majority&appName=gemini-api';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model
const itemSchema = new mongoose.Schema({
    roles: {
        Admin: {
            type: Number,
            default: 2001
        },
        history: {
            type: String,
            default: 'empty'
        },
        Operator: Number,
        Customer: Number
    }
});
const Item = mongoose.model('Item', itemSchema);

const test3Schema = new mongoose.Schema({
    test: {
        authInfo: {
            name : {
                type: String,
                default: 'Poovarasan',
                required: true
            },
            age: {
                type: Number,
                default: 21,
            }
        }
    }
})
const test3 = mongoose.model('Test2', test3Schema);

// const testData = new test3({
//     test: {
//         authInfo: {
//             name: 'Poovarasan11',
//             age: 21
//         }
//     }
// });

// testData.save().then(savedItems => {    console.log(savedItems)})

const id = '6669791a9ea24b5ec1998258';
test3.findOneAndUpdate({ _id: id }, {"test.authInfo.name": "New john", "test.authInfo.age": 30 },
    { new: true, useFindAndModify: false }).then(updatedDoc => {
    console.log("Updated document:", updatedDoc);
})
    .catch(err => {
        console.error("Error updating document:", err);
    });

// test3.findOneAndDelete({ _id: id }, { lean: true })
//     .then(deletedDoc => {
//         console.log("Deleted document:", deletedDoc);
//     })
//     .catch(err => {
//         console.error("Error deleting document:", err);
//     });

// API endpoints
app.get('/api/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

app.get('/api/test', async (req, res) => {
    const test = await test3.find();
    res.json(test);
})
