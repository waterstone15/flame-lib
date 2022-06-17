const Flame = require("../src/flame");
const FlameError = require("../src/errors");


describe("Flame", () => {
  flame = null;

  beforeAll(async () => {
    flame = await Flame.ignite("F1", {});
  })

  it("creates basic Shape", async () => {
    const shape = flame.shape({
      meta: { id: { default: "id", ok: (v) => true }, type: { default: "Shape1", ok: (v) => true } },
      val: {}
    });
    expect(shape).toEqual(expect.anything());
  });

  it("rejects Shape when 'ok' is not a function", async () => {
    expect(() => flame.shape({
      meta: { id: { default: "id", ok: true }, type: { default: "Shape1", ok: (v) => true } },
      val: {}
    })).toThrow(FlameError);
  });

  it("rejects Shape when 'meta.type.default' is a function", async () => {
    expect(() => flame.shape({
      meta: { id: { default: "id", ok: (v) => true }, type: { default: () => "Shape1", ok: (v) => true } },
      val: {}
    })).toThrow(FlameError);
  });

  it("rejects Shape without 'meta.id.ok'", async () => {
    expect(() => flame.shape({
      meta: { id: { default: "id" }, type: { default: "Shape1", ok: (v) => true } },
      val: {}
    })).toThrow(FlameError);
  });

  it("rejects Shape without 'meta.id'", async () => {
    expect(() => flame.shape({
      meta: { type: { default: "Shape1", ok: (v) => true } },
      val: {}
    })).toThrow(FlameError);
  });

  it("rejects Shape without 'meta.type'", async () => {
    expect(() => flame.shape({
      meta: { id: { default: "id", ok: (v) => true } },
      val: {}
    })).toThrow(FlameError);
  });

  it("creates very complex Shape", async () => {
    const shape = flame.shape({
      meta: {
        id: {
          default: "id",
          ok: (v) => true,
        },
        type: {
          default: "Person",
          ok: (v) => true
        },
        lastModifiedTime: {
          default: () => Date.now,
          ok: (v) => typeof v === "number" && v > 0,
        },
      },
      val: {
        firstName: {
          default: null,
          ok: (v) => typeof v === "string" && v.length > 0,
        },
        lastName: {
          default: null,
          ok: (v) => typeof v === "string" && v.length > 0,
        },
      },
      ref: {
        employerId: {
          default: null,
          ok: (v) => typeof v === "number" && v > 0,
        }
      },
      ext: {
        bitcoinRef: {
          default: null,
          ok: (v) => typeof v === "string" && v.length > 10,
        }
      }
    });
    expect(shape).toEqual(expect.anything());
  });
});

describe("Shape", () => {
  shape = null;

  beforeAll(async () => {
    flame = await Flame.ignite("F2", {});
    shape = flame.shape({
      meta: { id: { default: "id", ok: (v) => true }, type: { default: "Shape1", ok: (v) => true } },
      val: {}
    });;
  })

  it("creates Spark with defaults", async () => {
    const spark = shape.spark({});
    console.log(spark);
    expect(spark).toMatchObject({
      meta: { id: 'id', type: 'Shape1' },
      var: {},
      ref: {},
      ext: {},
      ok: expect.anything(),
      save: expect.anything(),
      update: expect.anything(),
      upsert: expect.anything(),
      remove: expect.anything(),
    });
  });

});
