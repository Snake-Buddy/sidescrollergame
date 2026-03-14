const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Initial Game State
let gameState = {
    p1: { x: -5, color: 'red' },
    p2: { x: 5, color: 'blue' },
    roadWidth: 20 // The "Cliff" is at -20 and +20
};

io.on('connection', (socket) => {
    socket.emit('init', gameState);

    socket.on('rollDice', () => {
        const dm = Math.floor(Math.random() * 20) + 1;
        const p1Roll = Math.floor(Math.random() * 20) + 1;
        const p2Roll = Math.floor(Math.random() * 20) + 1;

        const p1BeatsDM = p1Roll > dm;
        const p2BeatsDM = p2Roll > dm;

        let resultText = `DM: ${dm} | Red: ${p1Roll} | Blue: ${p2Roll} -> `;

        if (p1BeatsDM || p2BeatsDM) {
            const diff = Math.abs(p1Roll - p2Roll);
            if (p1Roll > p2Roll) {
                gameState.p2.x += diff;
                resultText += "Red pushes Blue!";
            } else if (p2Roll > p1Roll) {
                gameState.p1.x -= diff;
                resultText += "Blue pushes Red!";
            } else {
                resultText += "A Draw! No movement.";
            }
        } else {
            // Environmental Pushback: Both failed DM check
            gameState.p1.x -= Math.abs(p1Roll - dm);
            gameState.p2.x += Math.abs(p2Roll - dm);
            resultText += "DM wins! Both pushed back!";
        }

        io.emit('update', { gameState, log: resultText });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Battle active on port ${PORT}`));
