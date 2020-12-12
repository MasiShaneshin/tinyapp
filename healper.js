const getUserByEmail = function(email, dataBase) {
  for (let userId in dataBase) {
    if (dataBase[userId].email === email) {
      return dataBase[userId];
    }
  }
  return false;
};

module.exports = { getUserByEmail };