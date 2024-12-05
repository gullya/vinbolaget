const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 7000);

app.use(express.json());

const mongoUri = process.env.MONGO_CONNECTION_STRING ;
const dbName = 'vinbolaget';
const collectionName = 'products';

let db;
let collection;

MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    collection = db.collection(collectionName);
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); 
  });

// Routes
app.post('/products', async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const result = await collection.insertOne({ name, description, price });
    res.status(201).json({ message: 'Product created', productId: result.insertedId });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await collection.find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await collection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, description, price } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
