const { roomData, roomState } = require('../room/state');
const getQuestionList = require("../library/getQuestionList");


module.exports = (io, socket) => {

    // Modifie la difficulté au lancement du jeu
    const modifyDifficulty = (room, difficulty) => {
        const newDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        roomData[room].setDifficulty(newDifficulty);
        io.to(room).emit("room:get difficulty", roomData[room].getDifficulty());
    }

    // Modifie le nombre de question pour la room
    const modifyQuestion = (room, nbQuestion) => {
        roomData[room].setNbQuestion(nbQuestion);
        io.to(room).emit("room:get nb-question", roomData[room].getNbQuestion());
    }

    // --- Démarrage de la room --- //
    const startGame = async (room) => {
        console.log(`!! la room ${room} vient de démarrer la partie.`);
        roomData[room].setState({...roomState.LOADING}); // On modifie l'état de la room en chargement
        io.to(room).emit("room:state", roomData[room].getState()); // On envoie le nouvelle etat au client

        // Attend le retour de la promesse pour déclencher sont contenu
        roomData[room].startTimer(io).then(() => {
            gameLoop(room);
        })
        
        // Pendant le chargement on créer les questions
        const questionList = getQuestionList(roomData[room].getNbQuestion(), roomData[room].getDifficulty());
        roomData[room].setQuestionList(questionList);
        roomData[room].setRemainingQuestion(roomData[room].getNbQuestion()); // Set le compteur de question restante ave cle nombre de question par défaut
        io.to(room).emit("room:remaining-question", roomData[room].getRemainingQuestion()); // Envoie le compteur de question restante
    }
    
    // Boucle de jeu
    const gameLoop = async (room) => {
        const nbQuestions = roomData[room].getRemainingQuestion();
        
        if (nbQuestions > 0) {
            io.to(room).emit("room:question", roomData[room].getQuestion()); // Envoie la question au client
            io.to(room).emit("room:remaining-question", roomData[room].getRemainingQuestion()); // Envoie le compteur de question restante
            
            roomData[room].setState({...roomState.PLAY}); // On modifie l'état de la room en chargement                                
            io.to(room).emit("room:state", roomData[room].getState()); // On envoie le nouvelle etat au client
            
            roomData[room].startTimer(io).then(() => {
                roomData[room].setState({...roomState.PENDING}); // On modifie l'état de la room en chargement
                io.to(room).emit("room:state", roomData[room].getState());
                io.to(room).emit("room:response", roomData[room].getResponse()); // A la fin du timer on envoie la réponse
                
                roomData[room].startTimer(io).then(() => {
                    gameLoop(room);
                })
            })
        } else {
            roomData[room].setState({...roomState.FINISH});
            io.to(room).emit("room:state", roomData[room].getState()); // On envoie le nouvelle etat au client
            console.log(`!! La room ${room} vient de terminer la partie.`);

            roomData[room].startTimer(io).then(() => {
                // Reset des scores
                roomData[room].players.forEach(p => {
                    p.delScore();
                })

                roomData[room].setState({...roomState.LOBBY}); // On modifie l'état de la room en chargement                                
                io.to(room).emit("room:state", roomData[room].getState()); // On envoie le nouvelle etat au client
                io.to(room).emit("room:players", roomData[room].getPlayers()); // On envoie la liste des joueurs avec leurs nouveaux score    
            })
            
        }
    }

    const controlResponse = (room, response, playerID) => {
        const player = roomData[room].getPlayer(playerID); // On récupère le joueur qui a fait la demande

        if (!player.getResponded()) {

            roomData[room].setNbResponse(); // On dit qu'un des joueurs a envoyer son résultat à la room   
            const roomResponse = roomData[room].getResponse(); // On récupère la réponse de la salle
            
            response === roomResponse.response && player.setScore(); // Si la réponse est identique à la salle on lui met +1 point
            player.setResponded(true);
        
            
            if (roomData[room].getNbResponse() === roomData[room].getNbPlayers()) {
                roomData[room].setRanking();
                io.to(room).emit("room:players", roomData[room].getPlayers()); // On envoie la liste des joueurs avec leurs nouveaux score
                roomData[room].delNbResponse(); // Remet à zéro le compteur de réponse

                roomData[room].getPlayers().forEach(p => {
                    p.setResponded(false);
                })

            }
        }
    }

    socket.on("room:set difficulty", modifyDifficulty);
    socket.on("room:set nb-question", modifyQuestion);
    socket.on("game:start", startGame);
    socket.on("game:response", controlResponse);

}