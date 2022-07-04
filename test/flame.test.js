const Flame = require("../src/registry");
const FlameError = require("../src/errors");


const cfg = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
const dbURL = process.env.FIREBASE_DATABASE_URL;


describe("Flame", () => {
  it("ignites", async () => {
    const flame = await Flame.ignite("flame-X", cfg, dbURL);
    await flame.quench();
    expect(flame).toEqual(expect.anything());
  });

  it("ignites and holds", async () => {
    const flame1 = await Flame.ignite("flame-Y", cfg, dbURL);
    const flame2 = Flame.hold("flame-Y");
    await flame1.quench();
    expect(flame1).toEqual(flame2);
  });

  it("ignites and quenches", async () => {
    await Flame.ignite("flame-Z", cfg, dbURL);
    await Flame.quench("flame-Z");

    const t = () => Flame.hold("flame-Z");
    expect(t).toThrow(FlameError);
  });

  it("quenches many times", async () => {
    await Flame.ignite("flame-Q", cfg, dbURL);
    await Flame.quench("flame-Q");
    await Flame.quench("flame-Q");
    await Flame.quench("flame-Q");
  });

  it("ignites only once", async () => {
    const flame = await Flame.ignite("flame-R", cfg, dbURL);
    await expect(Flame.ignite("flame-R", cfg, dbURL)).rejects.toThrow(FlameError);
    await flame.quench();
  });
});
