const yts = require("yt-search");
const express = require("express");
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Helper function to extract video ID from a YouTube URL
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function ytSearch(query) {
    return new Promise((resolve, reject) => {
        try {
            // Check if the query is a URL and extract the video ID
            let searchQuery = query;
            if (query.startsWith('http://') || query.startsWith('https://')) {
                const videoId = extractVideoId(query);
                if (videoId) {
                    searchQuery = videoId;
                } else {
                    reject(new Error('Invalid YouTube URL'));
                    return;
                }
            }

            // Perform the search
            yts(searchQuery)
                .then((data) => {
                    // Transform the data to match RapidAPI format
                    const videos = data.all.map(video => ({
                        type: video.type,
                        id: video.videoId,
                        name: video.title,
                        description: video.description,
                        url: `https://www.youtube.com/watch?v=${video.videoId}`,
                        views: video.views,
                        published: video.ago,
                        author: video.author?.name,
                        duration: video.timestamp,
                        thumbnail: video.thumbnail,
                        isLive: false
                    }));
                    resolve({ videos }); // Return in RapidAPI format
                })
                .catch((error) => {
                    reject(error);
                    console.error(error);
                });
        } catch (error) {
            reject(error);
            console.error(error);
        }
    });
}

app.get('/', async (req, res) => {
    const query = req.query.q; // Changed from 'query' to 'q' to match RapidAPI
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing query parameter' 
        });
    }

    try {
        const results = await ytSearch(query);
        res.json(results); // Return the transformed data directly
    } catch (error) {
        console.error('Error fetching yts data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
