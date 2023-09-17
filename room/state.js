exports.roomData = {};

exports.roomState = {
    'LOBBY': {
        type: 'LOBBY',
        maxPlayers: 8
    },
    'LOADING': {
        type: 'LOADING',
        timer: 4
    },
    'PLAY': {
        type: 'PLAY',
        timer: 15
    },
    'PENDING': {
        type: 'PENDING',
        timer: 10
    },
    'FINISH': {
        type: 'FINISH',
        timer: 10
    }
}