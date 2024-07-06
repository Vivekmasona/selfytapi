const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`https://m.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching search results');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
