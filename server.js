// Import des librairie
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const getPlayerName = require('./helpers/getPlayerName');
const { roomState, roomData } = require('./room/state');
const Room = require('./library/room');

// Paramètre (a déplacer dans un environnement)
const port = 5000;
const ip = '0.0.0.0';


// SOCKET.IO
// Initialisation de socket.IO
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
});

// Import des events
const joinHandlers = require('./handlers/joinHandlers');
const playerHandlers = require('./handlers/playerHandlers');
const gameHandlers = require('./handlers/gameHandlers');
const Player = require('./library/player');

// Paramètre globaux du socket
let id = 0;

// Gestion globale
io.on('connection', async (socket) => {
    // ----- GESTION A LA CONNEXION ----- //
    id++;
    
    const player = new Player(socket.id); // On créer le joueur
    player.setName(`Guest_${getPlayerName(8)}`); // On set son nom
    console.log(`${id} - A user ${socket.id} connected. Name : ${player.getName()}`);

    const room = new Room(socket.id, roomState.LOBBY); // On créer la room
    room.setPlayer(player); // On ajoute le joueur à la room
    roomData[socket.id] = room; // On ajoute la room a la configuration de room

    // Emission des premiers paramètres
    socket.emit("player:id", socket.id); // Emet l'id personnel de l'utilisateur
    socket.emit("player:name", player.getName()); // Emet le pseudo de l'utilisateur
    socket.emit("player:host", player.getHost()); // Emet sont statut d'hote
    socket.emit("room:info", roomData[socket.id].getSendInfo()); // On envoie toutes les informations de la room la première fois.

    // ----- FIN DE LA GESTION A LA CONNEXION ----- //
    // Listener pour joindre une salle
    playerHandlers(io, socket);
    joinHandlers(io, socket);
    gameHandlers(io, socket);

    // Listener de déconnexion
    socket.on("disconnecting", async () => {
        // Si l'utilisateur se déconnecte, on le recherche dans les rooms ou il été connecté
        // Puis on le supprime des données pour vider la liste du client
        let roomName = undefined;
        socket.rooms.forEach(room => { if (!roomName) roomName = room;}) // On déduit que le joueur n'a qu'une seul salle. Donc on la copie en dehors de l'objet
        
        const players = roomData[roomName].getPlayers(); // Récupère la liste des joueurs de la room
        const player = players.find(p => p.getId() === socket.id); // On récupère le joueur qui fait la demande
        const playerIsHost = player.getHost(); // Récupère le statut d'hôte
        const playerIndex = players.findIndex(p => p.getId() === socket.id); // On va chercher l'index du joueur qui à fait la demande
        const sockets = await io.in(roomName).fetchSockets(); // Récupère tout les sockets connecté à la room


        if (room && player) {
            console.log(`Le joueur ${player.getName()} s'est déconnecté.`);
            roomData[roomName].delPlayer(playerIndex); // On supprime le joueur de l'ancienne room

            
            if (roomData[roomName].getNbPlayers() <= 0) {
                roomData[roomName].setClearInterval();
                delete roomData[roomName];
                console.log(`>> La room ${roomName} est vide et a été supprimée.`);
            } else {
                // Des que le joueurs est supprimé, on choisi un nouvelle ID et on récupère sont socket.
                const rnd = Math.floor(Math.random() * players.length);
                const newPlayer = players[rnd];
                const newSocket = sockets.find(s => s.id === newPlayer.id);

                if (playerIsHost) {
                    newPlayer.setHost(true);
                    newSocket.emit("player:host", true);
                    io.to(roomName).emit("room:players", roomData[roomName].getPlayers()); // On envoie la liste des joueurs avec leurs nouveaux score     
                }
            }      
        }
    })

    socket.on("connect_error", () => {
        setTimeout(() => {
          socket.connect();
        }, 10000);
    });

})


server.listen(port, ip, () => {
    console.log(`Le serveur écoute sur ${ip}:${port}.`);
})