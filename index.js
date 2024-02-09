const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // Import the cors middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware for handling JSON

// Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Jalankan server setelah terkoneksi ke MongoDB
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Definisi Model dan Skema
const ItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nama: String,
  gender: { type: String, required: true },
  barang: { type: String, required: true },
  uang: { type: String, default: "" },
  beras: { type: String, required: true },
  waktu: { type: Date, default: Date.now },
});

const Item = mongoose.model("Item", ItemSchema);

// Middleware untuk meng-handle JSON
app.use(express.json());

// Endpoint untuk mendapatkan semua item
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan satu item berdasarkan ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk menambahkan item baru
app.post("/api/items", async (req, res) => {
  try {
    const { nama, gender, barang, uang, beras } = req.body;
    const newItem = new Item({
      id: await generateId(),
      nama,
      gender,
      barang,
      uang,
      beras,
      waktu: new Date(),
    });

    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk memperbarui item berdasarkan ID
app.put("/api/items/:id", async (req, res) => {
  try {
    const { nama, gender, barang, uang, beras } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        nama,
        gender,
        barang,
        uang,
        beras,
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk menghapus item berdasarkan ID
app.delete("/api/items/:id", async (req, res) => {
  try {
    const itemId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const deletedItem = await Item.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fungsi untuk membuat id berurutan
async function generateId() {
  try {
    const latestItem = await Item.findOne().sort({ id: -1 });
    const newId = latestItem ? latestItem.id + 1 : 1;
    return newId;
  } catch (error) {
    throw new Error("Error generating ID");
  }
}
