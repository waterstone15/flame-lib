const Fb = require("../src/firebase");


describe("FirebaseApp creates app for ", () => {
  it("empty config", async () => {
    const actualApp = await Fb.create({}, "", {});
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("custom config", async () => {
    const actualApp = await Fb.create({ a: "x" }, "", {});
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("null config", async () => {
    const actualApp = await Fb.create(null, "", {});
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("undefined config", async () => {
    const actualApp = await Fb.create(undefined, "", {});
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });

  it("no config", async () => {
    const actualApp = await Fb.create();
    await actualApp.delete();
    expect(actualApp).toEqual(expect.anything());
  });
});
