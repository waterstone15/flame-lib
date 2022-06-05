

const appMock = {
  name: "fba-app-mock",
  delete: () => {},
};
const fbaMock = {
  credential: { cert: (x) => x },
  initializeApp: async (x) => appMock,
};


function mockFirebase() {
  const fbaConfig = {
    project_id: "pid",
    private_key: "pkey",
    client_email: "cemail@email.com",
  };
  process.env.FIREBASE_CONFIG_BASE64 = Buffer.from(JSON.stringify(fbaConfig)).toString("base64");
  process.env.FIREBASE_DATABASE_URL = "https://my-firebase-test-app.firebaseio.com";

  const mock = fbaMock;
  jest.mock("firebase-admin", () => mock);
}


module.exports = mockFirebase
