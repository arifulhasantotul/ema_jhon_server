const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nebgy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

async function run() {
   try {
      await client.connect();
      console.log("connected to db successfully");

      const database = client.db("online_shop");
      const productsCollection = database.collection("products");
      const orderCollection = database.collection("orders");

      // GET API
      app.get("/products", async (req, res) => {
         // console.log(req.query);
         const cursor = productsCollection.find({});
         const page = req.query.page;
         const size = parseInt(req.query.size);
         let products;
         const count = await cursor.count();
         if (page) {
            products = await cursor
               .skip(page * size)
               .limit(size)
               .toArray();
         } else {
            products = await cursor.toArray();
         }

         res.send({ count, products });
      });

      // POST API
      app.post("/products/byKeys", async (req, res) => {
         const keys = req.body;
         console.log(keys);
         const query = { key: { $in: keys } };
         const products = await productsCollection.find(query).toArray();
         res.json(products);
      });

      // Add orders api
      app.post("/orders", async (req, res) => {
         const order = req.body;
         order.createdAt = new Date();
         const result = await orderCollection.insertOne(order);
         console.log("order", order);
         res.json(result);
      });

      // DELETE API
   } finally {
      // await client.close();
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("ema john server running on port");
});

app.listen(port, () => {
   console.log("server running", port);
});
