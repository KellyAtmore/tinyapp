//Function for generating random id and shorturl
const generateRandomString = function() {
  
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * 6));
  }
  return result;
};

//returns urls based on user id
const urlsForUser = function(urlDatabase,id) {
  
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};

//used for checking if emails already exist & password macthing
const getUserByEmail = function(email, users) {
  
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

module.exports = {generateRandomString, urlsForUser, getUserByEmail};