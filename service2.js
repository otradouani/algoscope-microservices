const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));


// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint pour charger des images à partir de leurs noms
app.post('/upload-images', upload.array('images'), (req, res) => {
    try {
        const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ message: 'Images uploaded successfully', imagePaths });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading images');
    }
});

// Endpoint pour récupérer les masques à partir du micro service externe
app.post('/get-masks', async (req, res) => {
    try {
        const { imagePaths } = req.body;
        if (!imagePaths || !Array.isArray(imagePaths)) {
            return res.status(400).send('Image paths are required');
        }

        const masks = await Promise.all(imagePaths.map(async imagePath => {
            const fullImagePath = path.join(__dirname, imagePath);
            const imageBuffer = fs.readFileSync(fullImagePath);
            const base64Image = imageBuffer.toString('base64');

            const response = await axios.post('http://localhost:3000/get-polygon-mask', {
                image: base64Image
            });

            return {
                imagePath,
                mask: response.data
            };
        }));

        res.json(masks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving masks');
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});