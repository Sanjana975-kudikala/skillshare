const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. MIDDLEWARE
app.use(helmet()); 

// Professional CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. DATABASE CONNECTION
// Removed deprecated options as they are default in Mongoose 6+
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      if (err.message.includes('MongooseServerSelectionError')) {
          console.log("👉 Check if your IP is whitelisted in MongoDB Atlas Network Access!");
      }
  });

// 3. ROUTES
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Skill Share API is active!");
});

// 4. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    console.error("Server Error Stack:", err.stack);
    // Ensure we don't leak stack traces in production
    const statusCode = err.status || 500;
    res.status(statusCode).json({ 
        message: err.message || "Something went wrong on the server!",
        error: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error" 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));