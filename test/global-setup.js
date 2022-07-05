const fetch = require("node-fetch");


async function clearDb(emuHost, projId) {
  const response = await fetch(
    `http://${emuHost}/emulator/v1/projects/${projId}/databases/(default)/documents`,
    {
      method: 'DELETE',
    }
  );
  if (response.status !== 200) {
    throw new Error('Trouble clearing Emulator: ' + (await response.text()));
  }
}

async function mockFirebase() {
  const emulatorHost = "localhost:8080";
  const fbaConfig = {
    projectId: "pid",
    privateKey: "pkey",
    clientEmail: "cemail@email.com",
  };
  process.env.FIREBASE_CONFIG_BASE64 = Buffer.from(JSON.stringify(fbaConfig)).toString("base64");
  process.env.FIREBASE_DATABASE_URL = "https://my-firebase-test-app.firebaseio.com";
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;

  await clearDb(emulatorHost, fbaConfig.projectId);
}


module.exports = mockFirebase
