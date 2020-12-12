const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');
const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = { id: "user2RandomID",
                             email: "user2@example.com",
                             password: "dishwasher-funk" };
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});

describe('getUserByEmail', function() {
  it('should return false with invalid email', function() {
    const user = getUserByEmail("user2@exampl.com", testUsers);
    const expectedOutput = { id: "user2RandomID",
                             email: "user2@example.com",
                             password: "dishwasher-funk" };
    // Write your assert statement here
    assert.notDeepEqual(user, expectedOutput);
  });

});
