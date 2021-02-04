const socket = io();

var queues = [];
var err_timer;

function reloadUi() {
    // Get the current section selection
    var cur_sect = parseInt($('#section-input').val());

    $('#queue-entries').empty();

    for (var i = 0; i < queues[cur_sect].length; ++i) {
        var id = i;

        console.log('adding element ' + id);
        $('#queue-entries').append('<div class="row queue-entry h2 text-center text-light" id="queue-element' + id + '">' + (i + 1) + '. ' + queues[cur_sect][id] + '</div>');

        $('#queue-element' + id).click(function() {
            var ind = parseInt($(this).attr('id').slice(-1));
            console.log('clicked on ' + ind);
            socket.emit('remove', cur_sect, ind, $('#key-input').val());
            console.log('sending remove: ', cur_sect, ind, $('#key-input').val());
        });
    }
}

socket.on('queues', (states) => {
    // Update queue states.
    queues = states;

    // Remove waiting msg.
    $('#waiting-msg').css('display', 'none');

    console.log('Received ' + states.length + ' queue states.');

    // Refresh the current UI
    reloadUi();
});

socket.on('q_error', (msg) => {
    // Make error alert visible, set timer
    err_timer = setTimeout(() => {
        $('#error-msg').css('opacity', 0.0);
        clearTimeout(err_timer);
    }, 5000);

    $('#error-msg').text(msg);
    $('#error-msg').css('opacity', 1.0);
});

$(document).ready(() => {
    $('#btn-queue').click(() => {
        var cur_sect = parseInt($('#section-input').val());
    
        socket.emit('add', cur_sect, $('#name-input').val());
    
        console.log('Send add request for ' + cur_sect + ' : ' + $('#name-input').val());
    });

    $('#section-input').change(() => {
        reloadUi();
    });
});

socket.emit('request');