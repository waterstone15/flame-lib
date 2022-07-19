const Fb = require("../src/firebase");


describe("FirebaseApp creates app for ", () => {
  it("empty config", async () => {
    const [actualApp, db] = await Fb.create("nameA", {}, "");
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("custom config", async () => {
    const [actualApp, db] = await Fb.create("nameB", { a: "x" }, "");
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("null config", async () => {
    const [actualApp, db] = await Fb.create("nameC", null, "");
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("undefined config", async () => {
    const [actualApp, db] = await Fb.create("nameD", undefined, "");
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("no config", async () => {
    const [actualApp, db] = await Fb.create("nameE");
    await db.terminate();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });
});
