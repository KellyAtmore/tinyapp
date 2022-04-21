const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const generateRandomString = function() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * 6));
  }
  return result;
};

const urlsForUser = function(id) {
  const urls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
};


const getUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
  
    if (users[userId].email === email) {
      return user;
    }
  }
  return null;
};

module.exports = {generateRandomString, urlsForUser, getUserByEmail};