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
    const user = getUserByEmail("user@example.com", testUsers);
    //const output = testUsers["userRandomID"];
    const output = testUsers["userRandomID"];
    //console.log(user);
    assert.equal(user, output);
  });
  it('should return undefined for invalid email', function() {
    const user = getUserByEmail("kelly@example.com", testUsers);
    //const output = testUsers["userRandomID"];
    const output = undefined;
    //console.log(user);
    assert.equal(user, output);
  });
});