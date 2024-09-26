require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { Telegraf } = require('telegraf');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Path to the JSON file where we'll store scores
const DATA_FILE = 'scores.json';

// Helper functions to read and write scores
function readScores() {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function writeScores(scores) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

// Endpoint to get user's current score
app.post('/get-score', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ success: false, message: 'No user ID provided' });
    }
    const scores = readScores();
    const userScore = scores[user_id] ? scores[user_id].score : 0;
    res.json({ success: true, score: userScore });
});

// Endpoint to update user's score
app.post('/update-score', (req, res) => {
    const { user_id, username, first_name, last_name, score } = req.body;

    if (!user_id || score == null) {
        return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    const scores = readScores();

    scores[user_id] = {
        username,
        first_name,
        last_name,
        score
    };

    writeScores(scores);

    res.json({ success: true });
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// npm start will run on localhost:3000 but using ngrok to expose it to the internet since telegram web app can't access localhost
bot.start((ctx) => {
    const userId = ctx.from.id;
    const userInfo = encodeURIComponent(JSON.stringify(ctx.from));
    ctx.reply('Welcome to Tapping Coins Game!', {
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Play Game',
                    web_app: { url: `https://08f6-102-176-65-118.ngrok-free.app?user=${userInfo}` }
                }]
            ]
        }
    });
});

bot.launch()
    .then(() => {
        console.log('Bot started successfully.');
    })
    .catch((err) => {
        console.error('Failed to start bot:', err);
    });

process.once('SIGINT', () => {
    bot.stop('SIGINT');
    process.exit(0);
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
