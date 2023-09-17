module.exports = class Room {

    constructor(id, state) {
        this.name = id;
        this.players = [];
        this.state = state;
        this.questionList = [];
        this.currentQuestion = {};
        this.currentResponse = {
            response: "",
            anecdote: ""
        };
        this.nbQuestion = 20;
        this.remainingQuestion = 0;
        this.timer = 0;
        this.difficulty = "Confirmé";
        this.nbResponse = 0;
        this.intervalId = null
    }

    // METHOD CHANGE ROOM STATE OR TIMER
    // TIMER
    startTimer(io) {
        return new Promise((resolve) => {
            this.timer = this.state.timer;
            io.to(this.name).emit("room:timer", this.timer);
            
            this.intervalId = setInterval(() => {
                this.timer--;
                io.to(this.name).emit("room:timer", this.timer);

                
                if (this.timer <= 0) {
                    this.setClearInterval()
                    resolve(true);
                }
            }, 1000);     
        })
    }

    setClearInterval() {
        clearInterval(this.intervalId)
    }


    // ----- GETTER ----- //
    // Retourne le timer
    getTimer() {
        return this.timer;
    }

    getPlayer(id) {
        return this.players.find(p => p.id === id)
    }

    // Retourne la liste de joueurs
    getPlayers() {
        return this.players;
    }

    // Retourne le nombre de joueurs dans la salle
    getNbPlayers() {
        return this.players.length;
    }

    getMaxPlayers() {
        return this.maxPlayers;
    }

    // Retourne la liste d'information de la salle pour le front
    getSendInfo() {
        const info = {
            name: this.name,
            players: this.players,
            state: this.state,
            nbQuestion: this.nbQuestion,
            remainingQuestion: this.remainingQuestion,
            difficulty: this.difficulty,
            question: this.currentQuestion,
            response: this.currentResponse,
            ranking: this.ranking
        }

        return info
    }

    // Retourne le state de la room
    getState() {
        return this.state;
    }

    // Retourne le nombre de question pour la génération de la liste
    getNbQuestion() {
        return this.nbQuestion;
    }

    // Retourne le nombre de question restante
    getRemainingQuestion() {
        return this.remainingQuestion;
    }

    // Retourne la difficulté de la room
    getDifficulty() {
        return this.difficulty;
    }
    
    // Retourne une question de la liste.
    // L'ajoute a la question en cours sur le serveur
    // La formate pour le client
    getQuestion() {
        const rnd = Math.floor(Math.random() * this.questionList.length);
        this.currentQuestion = this.questionList[rnd];

        const sendQuestion = {
            id: rnd,
            question: this.currentQuestion.question,
            propositions: this.currentQuestion.propositions,
            category: this.currentQuestion.category
        }

        this.questionList.splice(rnd, 1); // On supprime la question de la liste
        this.remainingQuestion--; // On enleve 1 question au compteur

        return sendQuestion
    }

    // Retourne la réponse
    getResponse() {
        return {
            response: this.currentQuestion["réponse"],
            anecdote: this.currentQuestion["anecdote"]
        }
    }

    // Retourne le nombre de réponse reçu
    getNbResponse() {
        return this.nbResponse;
    }

    // ----- SETTER ----- //
    // Ajoute un joueur à la liste des joueurs de la salle.
    setPlayer(player) {
        this.players.push(player);
    }

    // Set la liste des questions de la salle
    setQuestionList(list) {
        this.questionList = list;
    }

    // Modifie le state de la room
    setState(state) {
        this.state = state;
    }

    // Modifie le nombre de questions de la salle
    setNbQuestion(nb) {
        this.nbQuestion = nb;
    }

    // Modifie le nombre de joueur maximum
    setMaxPlayers(max) {
        this.maxPlayers = max;
    }

    // Modifie la difficulté de la salle
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    // Modifie le nombre de réponse reçu
    setNbResponse() {
        this.nbResponse++;
    }

    // Modife le nombre de question restante
    setRemainingQuestion(nbQuestion) {
        this.remainingQuestion = nbQuestion;
    }

    // Modifie le rang de chaquent joueurs
    setRanking() {
        let playersList = [...this.players];
        let rank = 1;
        while (playersList.length > 0) {

            let playerIndex = 0;
            let bestPlayer = false;

            playersList.forEach((p, index) => {
       
                if (!bestPlayer) {
                    bestPlayer = p; // SI il n'y a pas de meilleur joueur, alors le joueur devient le meilleur
                    playerIndex = index;
                } else {
                    if (p.score >= bestPlayer.score) {
                        bestPlayer = p;
                        playerIndex = index;
                    }
                }

            })
          
            bestPlayer.setRank(rank);
            playersList.splice(playerIndex, 1);
            rank++;

        }

    }

    // ----- DELETER ----- //
    // Supprime un joueur de la liste des joueurs
    delPlayer(index) {
        this.players.splice(index, 1);
    }

    // Remet a zéro le compteur de réponse
    delNbResponse() {
        this.nbResponse = 0;
    }

}