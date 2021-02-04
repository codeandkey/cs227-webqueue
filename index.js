const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)

const AD_KEY = process.env.WEBQUEUE_ADMIN_KEY;
const PORT = process.env.PORT || 8124;

let queues = new Array(30); // queue state

for (var i = 0; i < queues.length; ++i) {
    queues[i] = [];
}

if (!AD_KEY) {
    console.error("Please set WEBQUEUE_ADMIN_KEY before launching.");
    process.exit(1);
}

app.set('view engine', 'pug');
app.use(express.static('static'));

app.get('/', (req, res) => {
    res.render('index');
    console.log(`Serving index to ${res.socket.remoteAddress}`);
});

io.on('connection', (socket) => {
    console.log('Accepted socketio connection');

    socket.on('add', (sect, name) => {
        if (!Number.isInteger(sect) || sect < 0 || sect > queues.length) {
            return socket.emit('q_error', 'Invalid section');
        }

        for (var i = 0; i < queues[sect].length; ++i) {
            if (queues[sect][i] == name) {
                return socket.emit('q_error', 'Already queued!');
            }
        }

        queues[sect].push(name);

        io.emit('queues', queues);

        return socket.emit('message', 'Queued!');
    });

    socket.on('remove', (sect, ind, key) => {
        if (key != AD_KEY) {
            return socket.emit('q_error', 'Invalid control key');
        }

        if (!Number.isInteger(sect) || sect < 0 || sect > queues.length) {
            return socket.emit('q_error', 'Invalid section');
        }

        if (ind < 0 || ind >= queues[sect].length) {
            return socket.emit('q_error', 'Invalid index');
        }

        var n = queues[sect][ind];

        queues[sect].splice(ind, 1);

        io.emit('queues', queues);

        return socket.emit('message', `Removed ${n} from queue.`);
    });

    socket.on('request', () => {
        // Broadcast update
        io.emit('queues', queues);
    });
})

http.listen(PORT, () => {
    console.log(`Listening on ${PORT}, ready for requests`);
});