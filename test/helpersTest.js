const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

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

const chai = require('chai');
const expect = chai.expect;

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    expect(user).to.have.property('id').that.equals(expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return null if email is not in users database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    expect(user).to.be.null;
  });
});
