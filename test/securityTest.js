const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

describe("Access Control Tests", () => {
  let agent;

  before(() => {
    agent = chai.request.agent("http://localhost:8080");
  });

  it('should redirect GET request to "/" to "/login" with status code 302', () => {
    return agent
      .get("/")
      .then((res) => {
        expect(res).to.redirectTo("http://localhost:8080/login");
        expect(res).to.have.status(302);
      });
  });

  it('should redirect GET request to "/urls/new" to "/login" with status code 302', () => {
    return agent
      .get("/urls/new")
      .then((res) => {
        expect(res).to.redirectTo("http://localhost:8080/login");
        expect(res).to.have.status(302);
      });
  });

  it('should return 404 status code for GET request to "/urls/NOTEXISTS"', () => {
    return agent
      .get("/urls/NOTEXISTS")
      .then((res) => {
        expect(res).to.have.status(404);
      });
  });

  it('should return 403 status code for GET request to "/urls/b2xVn2"', () => {
    return agent
      .get("/urls/b2xVn2")
      .then((res) => {
        expect(res).to.have.status(403);
      });
  });

  after(() => {
    agent.close();
  });
});