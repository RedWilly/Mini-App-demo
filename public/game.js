Telegram.WebApp.ready();

const telegramUser = Telegram.WebApp.initDataUnsafe.user;

if (!telegramUser) {
    alert('User information is not available.');
} else {
    let score = 0;
    const coin = document.getElementById('coin');
    const scoreDisplay = document.getElementById('score');

    async function loadScore() {
        try {
            const response = await fetch('/get-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: telegramUser.id })
            });
            const data = await response.json();
            if (data.success) {
                score = data.score;
                scoreDisplay.textContent = `Score: ${score}`;
            } else {
                console.error('Failed to load score:', data.message);
            }
        } catch (error) {
            console.error('Error loading score:', error);
        }
    }

    async function updateScore() {
        try {
            const response = await fetch('/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: telegramUser.id,
                    username: telegramUser.username || '',
                    first_name: telegramUser.first_name || '',
                    last_name: telegramUser.last_name || '',
                    score: score
                })
            });
            const data = await response.json();
            if (!data.success) {
                console.error('Failed to update score:', data.message);
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    }

    coin.addEventListener('click', async () => {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        await updateScore();
    });

    loadScore();
}
