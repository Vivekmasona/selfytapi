const fetch = require('node-fetch');
const cheerio = require('cheerio');

function cleanTitle(title) {
    // Define unwanted Unicode characters to remove
    const unwantedChars = ['\u0938', '\u095c', '\u093f', '\u092f', '\u093e', '\u092c', '\u0941', '\u0932', '\u0942', '\u0915', '\u093f', '\u092f', '\u093e'];

    // Remove unwanted Unicode characters from title
    unwantedChars.forEach(char => {
        title = title.replace(new RegExp(char, 'g'), '');
    });

    return title;
}

async function fetchVideoDetails(videoId) {
    const url = `https://m.youtube.com/watch?v=${videoId}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content');
    const thumbnail = $('meta[property="og:image"]').attr('content');

    return {
        author: 'Vivek Masona', // Assuming 'Vivek Masona' is the correct author name
        title: cleanTitle(title),
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoId: videoId,
        channel: 'Unknown Channel' // You may adjust this based on the actual channel information available
    };
}

async function searchVideos(query) {
    const searchUrl = `https://m.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const html = await response.text();

    const videoIds = [];
    const $ = cheerio.load(html);
    $('script').each((index, script) => {
        const scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes('"videoId":"')) {
            const matches = scriptContent.match(/"videoId":"([^"]+)/g);
            if (matches) {
                matches.forEach(match => {
                    const videoId = match.replace('"videoId":"', '');
                    if (!videoIds.includes(videoId)) {
                        videoIds.push(videoId);
                    }
                });
            }
        }
    });

    const results = [];
    for (let i = 0; i < Math.min(videoIds.length, 10); i++) { // Limiting to first 10 results
        const videoId = videoIds[i];
        const videoDetails = await fetchVideoDetails(videoId);
        results.push(videoDetails);
    }

    return results;
}

// Example usage
(async () => {
    const query = 'your search query'; // Replace with your actual search query
    const results = await searchVideos(query);
    console.log(results);
})();
