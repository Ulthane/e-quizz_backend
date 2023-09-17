const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}
  
const getPlayerName = (nbChar) => {
    const char = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    const charArray = char.split('');
    let playerName = "";
    
    for (let i=0; i < nbChar; i++) {
      const randomChar = getRandomInt(char.length);
      playerName += charArray[randomChar];
    }
  
    return playerName
}

module.exports = getPlayerName;