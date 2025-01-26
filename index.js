const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const cors = require("cors");
const fs = require('fs');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const Sentiment = require('sentiment');

// Function to clean and reformat the text (remove unwanted characters, add basic punctuation)
function processText(text) {
    let processedText = text.replace(/[-\n\[\]°|\(\)@©~%]/g, ' ')
                            .replace(/\s+/g, ' ') 
                            .replace(/(Write a comment.*?comment)/g, '') 
                            .trim();
    processedText = processedText.replace(/([a-z])([A-Z])/g, '$1. $2');  // Add periods between lowercase and uppercase letters
    processedText = processedText.replace(/(\d{4})([a-zA-Z])/g, '$1. $2');  // Add periods between year and text
    return processedText;
}

// Perform sentiment analysis
function analyzeSentiment(text) {
    const sentiment = new Sentiment();
    return sentiment.analyze(text);  // Returns positive, negative, neutral sentiment
}

app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
const mongoURI = 'mongodb+srv://SambavJetty:plusinfinity@cluster0.uz0ku.mongodb.net/facebook-parser';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    });

// Define a screenshot schema for MongoDB
const Screenshot = mongoose.model("Screenshot", {
    post_id: { type: String, required: true },
    image_url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }  // Add timestamp field for sorting
});

// Multer configuration for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// Middleware to serve images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API endpoint to upload images
app.post("/upload-screenshot", (req, res) => {
    upload.single('screenshot')(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err);
            return res.status(500).json({ success: false, message: "Error uploading file" });
        }

        const { post_id } = req.body;

        try {
            const screenshot = await new Screenshot({
                post_id: post_id,
                image_url: `http://localhost:4000/uploads/${req.file.filename}`
            }).save();

            res.json({
                success: true,
                message: "Image uploaded and saved to database",
                image_url: screenshot.image_url,
                mongo_id: screenshot._id,
                post_id: screenshot.post_id
            });
        } catch (err) {
            console.error("Error saving to database:", err);
            res.status(500).json({ success: false, message: "Error saving to database" });
        }
    });
});

// API to retrieve the latest 12 posts
app.get('/api/latest-user-posts', async (req, res) => {
    try {
        const latestPosts = await Screenshot.find()
                                            .sort({ timestamp: -1 })
                                            .limit(12);

        if (latestPosts.length === 0) return res.status(404).json({ success: false, error: "No posts found" });

        res.json({ success: true, latestPosts });
    } catch (error) {
        console.error("Error fetching latest posts:", error);
        res.status(500).json({ success: false, error: "Error fetching latest posts" });
    }
});

// API to retrieve meaningful text and sentiment analysis from the latest 12 posts
app.get('/api/meaningful-text-and-sentiment', async (req, res) => {
    try {
        const latestPosts = await Screenshot.find()
                                            .sort({ timestamp: -1 })
                                            .limit(12);

        if (latestPosts.length === 0) return res.status(404).json({ success: false, error: "No posts found" });

        let combinedText = "";

        // Process each post to extract text from its image URL
        for (const post of latestPosts) {
            try {
                const response = await axios.get(post.image_url, { responseType: 'arraybuffer' })
                    .catch(err => {
                        console.error("Error fetching image:", err);
                        return null;  // Return null if fetching image fails
                    });

                if (!response) {
                    continue;  // Skip this post if image couldn't be fetched
                }

                const imageBuffer = Buffer.from(response.data, 'binary');
                const image = await loadImage(imageBuffer);
                const canvas = createCanvas(image.width, image.height);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);

                const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng', { logger: m => console.log(m) });
                combinedText += text + " ";
            } catch (error) {
                console.error(`Error processing image for post ${post._id}:`, error);
            }
        }

        // Process and reformat the combined text
        const meaningfulText = processText(combinedText);

        // Perform sentiment analysis
        const sentimentResult = analyzeSentiment(meaningfulText);

        res.json({
            success: true,
            meaningfulText: meaningfulText, 
            sentiment: {
                score: sentimentResult.score,  
                comparative: sentimentResult.comparative,  
                positive: sentimentResult.positive,  
                negative: sentimentResult.negative  
            }
        });
    } catch (error) {
        console.error("Error processing text and sentiment:", error);
        res.status(500).json({ success: false, error: "Error processing text and sentiment" });
    }
});

// Start the Express server
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
