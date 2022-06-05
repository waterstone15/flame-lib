const Flame = require("../src/flame");
const FlameError = require("../src/errors");


describe("Flame", () => {
  it("ignites", async () => {
    const flame = await Flame.ignite("flame-X", {});
    expect(flame).toEqual(expect.anything());
  });

  it("ignites and holds", async () => {
    const flame1 = await Flame.ignite("flame-Y", {});
    const flame2 = Flame.hold("flame-Y");
    expect(flame1).toEqual(flame2);
  });

  it("ignites and quenches", async () => {
    await Flame.ignite("flame-Z", {});
    await Flame.quench("flame-Z");

    const t = () => Flame.hold("flame-Z");
    expect(t).toThrow(FlameError);
  });

  it("quenches many times", async () => {
    await Flame.ignite("flame-Q", {});
    await Flame.quench("flame-Q");
    await Flame.quench("flame-Q");
    await Flame.quench("flame-Q");
  });

  it("ignites only once", async () => {
    await Flame.ignite("flame-R", {});

    await expect(Flame.ignite("flame-R")).rejects.toThrow(FlameError);
  });
});
