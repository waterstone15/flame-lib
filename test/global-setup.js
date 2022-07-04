

function mockFirebase() {
  const fbaConfig = {
    projectId: "pid",
    privateKey: "pkey",
    clientEmail: "cemail@email.com",
  };
  process.env.FIREBASE_CONFIG_BASE64 = Buffer.from(JSON.stringify(fbaConfig)).toString("base64");
  process.env.FIREBASE_DATABASE_URL = "https://my-firebase-test-app.firebaseio.com";
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
}


module.exports = mockFirebase
