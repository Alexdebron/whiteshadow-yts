const yts = require("yt-search");

// Helper function to extract video ID from a YouTube URL
function extractVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

async function ytsearch(query) {
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
                    const res = data.all;
                    resolve(res); // Resolve with the data fetched from YouTube search
                })
                .catch((error) => {
                    reject(error); // Reject in case of any errors
                    console.error(error);
                });
        } catch (error) {
            reject(error);
            console.error(error);
        }
    });
}
