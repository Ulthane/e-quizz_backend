module.exports = class Player {

    constructor(id) {
        this.id = id;
        this.name = "Guest";
        this.score = 0;
        this.rank = 0;
        this.responded = false;
        this.host = true;
    }

    // ----- GETTER ----- //
    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    getResponded() {
        return this.responded;
    }

    getHost() {
        return this.host;
    }


    // ----- SETTER ----- //
    setName(name) {
        this.name = name;
    }

    setScore() {
        this.score++;
    }

    setResponded(state) {
        this.responded = state;
    }

    setRank(rank) {
        this.rank = rank;
    }

    setHost(state) {
        this.host = state;
    }


    // ----- DELETER ----- //
    delScore() {
        this.score = 0;
    }

}