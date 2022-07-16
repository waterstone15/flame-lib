const Fb = require("../src/firebase");


describe("FirebaseApp creates app for ", () => {
  it("empty config", async () => {
    const [actualApp, db] = await Fb.create({}, "", {});
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("custom config", async () => {
    const [actualApp, db] = await Fb.create({ a: "x" }, "", {});
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("null config", async () => {
    const [actualApp, db] = await Fb.create(null, "", {});
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("undefined config", async () => {
    const [actualApp, db] = await Fb.create(undefined, "", {});
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("no config", async () => {
    const [actualApp, db] = await Fb.create();
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });
});
