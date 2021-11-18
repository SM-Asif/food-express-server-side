const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

//middleware
app.use(cors());
app.use(express.json());

//DB access
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.74f46.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//api function
async function run() {
    try {
        await client.connect();
        const database = client.db("foodExpress");
        const foodsCollection = database.collection("foods");
        const ordersCollection = database.collection("orders");
        
        //get foods api
        app.get('/foods', async (req, res) => {
            const cursor = foodsCollection.find({});
            const foods = await cursor.toArray();
            res.send(foods);
        });

        //get single food api
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const food = await foodsCollection.findOne(query);
            res.json(food);
        });

        //orders post api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        //orders get api
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //ordered foods post api to get data
        app.post('/orders/orderId', async (req, res) => {
            const orderIds = req.body;
            const newOrderIds = [];
            orderIds.map(orderId => newOrderIds.push(ObjectId(orderId)));
            const query = {_id: {$in: newOrderIds}}
            const foods = await foodsCollection.find(query).toArray();
            res.json(foods);
        });

        //delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {orderId: id};
            const result = await ordersCollection.deleteMany(query);
            console.log('deleting order', result);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);//call api function

//default route
app.get('/', (req, res) => {
    res.send('running Food Express server');
});
app.listen(port, () => {
    console.log('running Food Express server on port', port);
});