const { roomData } = require('../room/state');

module.exports = (io, socket) => {

    const setPlayerName = async (id, name, room) => {
        const players = roomData[room].getPlayers(); // On récupère la liste des joueurs.
        const player = players.find(p => p.getId() === id); // On va chercher le joueur qui à fait la demande
        
        console.log(`# L'utilisateur ${player.getName()} à changer son pseudo par ${name}.`)
        player.setName(name); // Puis on change son nom

        io.to(room).emit("room:players", roomData[room].getPlayers());
    }

    socket.on("player:setname", setPlayerName);

}