function getUserByEmail(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

function generateRandom(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomValue = '';
  for (let i = 0; i < length; i++) {
    randomValue += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomValue;
}

function urlsForUser(id, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

module.exports = { getUserByEmail, generateRandom, urlsForUser };