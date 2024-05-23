const express = require('express');
const Jimp = require('jimp');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

app.post('/get-polygon-mask', async (req, res) => {
  try {
    const base64Image = req.body.image;
    if (!base64Image) {
      return res.status(400).send('Image parameter is required');
    }

    // Decode the base64 image
    const buffer = Buffer.from(base64Image, 'base64');

    // Read the image with Jimp
    const image = await Jimp.read(buffer);

    // Create a random polygon mask
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const polygon = generateRandomPolygon(width, height);

    res.json(polygon);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the image.');
  }
});

const generateRandomPolygon = (width, height) => {
  const points = [];
  const numPoints = Math.floor(Math.random() * 5) + 3; // 3 to 7 points
  for (let i = 0; i < numPoints; i++) {
    points.push({ x: Math.random() * width, y: Math.random() * height });
  }
  points.push(points[0]); // Close the polygon
  return points;
};

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
