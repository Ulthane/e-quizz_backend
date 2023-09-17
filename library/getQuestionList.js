const fs = require('fs');
const path = require('path');
const folderPath = './quizz';
const absoluteFolder = '../quizz';
const requireArray = fs.readdirSync(folderPath);
let Question = [];

requireArray.forEach(filename => {
    Question.push(require(path.join(absoluteFolder, filename)));
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = (nbQuestion, mode) => {
    const list = [];
    const selected = [];

    function getCategoryQuestion(mode, selected) {
        const rndCategory = getRandomInt(Question.length);
        const category = Question[rndCategory].quizz.fr;
        const categoryName = Question[rndCategory]['catégorie-nom-slogan'].fr.catégorie;
        const rndQuestion = getRandomInt(category[mode].length);
        const question = category[mode][rndQuestion];
        const hasSelected = selected.find(s => s.category === rndCategory && s.question === rndQuestion);

        if (!hasSelected) {
            selected.push({category: rndCategory, question: rndQuestion});
            const newQuestion = {...question};
            newQuestion.category = categoryName;
            list.push(newQuestion);
        } else {
            getCategoryQuestion(mode, selected)
        }
    }

    for (let i=0; i < nbQuestion; i++) {
        getCategoryQuestion(mode.toLowerCase(), selected)
    }

    return list;
}