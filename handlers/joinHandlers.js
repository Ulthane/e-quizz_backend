const { roomData } = require('../room/state');

module.exports = (io, socket) => {

    // Fonction qui controle le nombre de joueurs dans la salle
    function controlRoom(room) {
        // On vérifie que la room existe avant de la rejoindre
        if (roomData[room]) {
            // Controle si le joueur qui veut rejoindre la salle, existe déjà dans la salle.
            const playerExist = roomData[room].getPlayers().some(p => p.id === socket.id);

            if (playerExist) {
                socket.emit("room:message", 0, "Vous êtes déjà dans la salle.");
                return false
            }

            // Si la salle existe, on vérifie qu'elle est en state LOBBY
            const state = roomData[room].getState();

            if (state.type !== "LOBBY") {
                socket.emit("room:message", 0, "La salle est en cours de jeu.");
                return false
            }

            // Sinon on vérifie que la salle n'est pas pleine
            const nbPlayer = roomData[room].getNbPlayers();
            if (nbPlayer >= roomData[room].state.maxPlayers) { 
                socket.emit("room:message", 0, "La salle est pleine.");
                return false;
            }
        } else {
            socket.emit("room:message", 1, "La salle n'existe pas.");
            return false
        }

        return true;
    }

    // Fonction qui permet à un utilisateur de rejoindre une salle.
    const joinOrder = (room, oldRoom) => {

        // On controle si la salle est disponible ou non avant de la rejoindre.
        const roomIsOpen = controlRoom(room);

        if (roomIsOpen) {
            socket.leave(oldRoom); // Quitte la room
            socket.join(room); // Rejoint la room
            
            // const players = roomData[room].getPlayers(); // On récupère la liste des joueurs de la salle cible
            const oldRoomPlayers = roomData[oldRoom].getPlayers() // On récupère la liste des joueurs de l'ancienne salle.
            const player = oldRoomPlayers.find(p => p.getId() === socket.id); // On va chercher le joueur qui à fait la demande
            const playerIndex = oldRoomPlayers.findIndex(p => p.getId() === socket.id); // On vachercher l'index du joueur qui à fait la demande

            player.setHost(false); // Le joueur qui rejoint une room n'est plus hôte
            socket.emit("player:host", player.getHost());
            
            roomData[room].setPlayer(player); // On ajoute le nouveau joueurs dans la nouvelle room
            roomData[oldRoom].delPlayer(playerIndex); // On supprime le joueur de l'ancienne room
            
            if (roomData[oldRoom].getNbPlayers() === 0) {
                delete roomData[oldRoom]; // Si la room n'a plus de joueur, on la supprime.
                console.log(`>> La room ${oldRoom} est vide et a été supprimée.`);
            } else {
                io.to(oldRoom).emit("room:info", roomData[oldRoom].getSendInfo()); // Sinon on lui envoie les nouvelles informations des joueurs.
            } 
            
            io.to(room).emit("room:info", roomData[room].getSendInfo()); // Envoie les nouvelles informations des joueurs.

            console.log(`>> Le joueur ${player.getName()} rejoint la room ${room} et quitte la room ${oldRoom}`);
        }

    }

    socket.on("join:room", joinOrder);

}