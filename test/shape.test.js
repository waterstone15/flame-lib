const Flame = require("../src/registry");
const FlameError = require("../src/errors");


const cfg = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
const dbURL = process.env.FIREBASE_DATABASE_URL;


describe("Flame", () => {
  flame = null;

  beforeEach(async () => {
    flame = await Flame.ignite("F1", cfg, dbURL);
  })

  afterEach(async () => {
     await Flame.quench("F1");
  });

  it("creates basic Shape", async () => {
    const shape = flame.shape("sh4pe", {});
    expect(shape).toEqual(expect.anything());
  });

  it("rejects Shape when 'ok' is not a function", async () => {
    expect(() => flame.shape("sh4pe", {
      val: { x: "x" },
      ok: { val: { x: true } }
    })).toThrow(FlameError);
  });

  it("rejects Shape when 'meta.type' is present", async () => {
    expect(() => flame.shape("sh4pe", { meta: { type: "x" } })).toThrow(FlameError);
  });

  it("rejects Shape when 'meta.id' is present", async () => {
    expect(() => flame.shape("sh4pe", { meta: { id: "x" } })).toThrow(FlameError);
  });

  it("creates very complex Shape", async () => {
    const shape = flame.shape("sh4pe", {
      meta: {
        lastModifiedTime: () => Date.now,
      },
      val: {
        firstName: null,
        lastName: null,
      },
      ref: {
        employerId: null,
      },
      ext: {
        bitcoinRef: null,
      },
      ok: {
        meta: {
          lastModifiedTime: (v) => typeof v === "number" && v > 0,
        },
        val: {
          firstName: (v) => typeof v === "string" && v.length > 0,
          lastName: (v) => typeof v === "string" && v.length > 0,
        },
        ref: {
          employerId: (v) => typeof v === "number" && v > 0,
        },
        ext: {
          bitcoinRef: (v) => typeof v === "string" && v.length > 10,
        },
      },
    });
    expect(shape).toEqual(expect.anything());
  });
});

describe("Shape", () => {
  shape = null;

  beforeAll(async () => {
    flame = await Flame.ignite("F2", cfg, dbURL);
    shape = flame.shape("sh4pe", {
      val: { name: "doe" },
      ok: {
        val: { name: (v) => true }
      },
    });
  })

  afterAll(async () => {
     await Flame.quench("F2");
  });

  it("creates Spark with defaults", async () => {
    const spark = shape.spark({});
    expect(spark).toMatchObject({
      meta: { id: expect.anything(), type: 'sh4pe' },
      val: { name: "doe" },
      ref: {},
      ext: {},
    });
  });

  it("creates Spark from given values", async () => {
    const spark = shape.spark({ val: { name: "xyz" }});
    expect(spark).toMatchObject({
      meta: { id: expect.anything(), type: 'sh4pe' },
      val: { name: "xyz" },
      ref: {},
      ext: {},
    });
  });

  it("rejects Spark from extraneous values", async () => {
    expect(() => shape.spark({ meta: { extra: "abc" }})).toThrow(FlameError);
  });


  it("creates very complex Spark", async () => {
    const shape = flame.shape("Person", {
      meta: {
        lastModifiedTime: () => Date.now,
      },
      val: {
        firstName: null,
        lastName: null,
      },
      ref: {
        employerId: null,
      },
      ext: {
        bitcoinRef: null,
      },
      ok: {
        meta: {
          lastModifiedTime: (v) => typeof v === "number" && v > 0,
        },
        val: {
          firstName: (v) => typeof v === "string" && v.length > 0,
          lastName: (v) => typeof v === "string" && v.length > 0,
        },
        ref: {
          employerId: (v) => typeof v === "number" && v > 0,
        },
        ext: {
          bitcoinRef: (v) => typeof v === "string" && v.length > 10,
        },
      },
    });
    const spark = shape.spark({
      meta: { lastModifiedTime: 123 },
      val: { firstName: "John", lastName: "Doe" },
      ref: { employerId: "E123" },
      ext: { bitcoinRef: "B123" },
    });
    expect(spark).toMatchObject({
      meta: { id: expect.anything(), type: 'Person', lastModifiedTime: 123 },
      val: { firstName: "John", lastName: "Doe"},
      ref: { employerId: "E123" },
      ext: { bitcoinRef: "B123" },
    });
  });
});

describe("Spark", () => {
  shape = null;

  beforeAll(async () => {
    flame = await Flame.ignite("F3", cfg, dbURL);
    shape = flame.shape("sh4pe", {
      val: { firstName: null, lastName: null },
      ok: {
        val: {
          firstName: (v) => typeof v === "string" && v.length > 2,
          lastName: (v) => typeof v === "string" && v.length > 2,
        },
      }
    });
  })

  afterAll(async () => {
     await Flame.quench("F3");
  });

  it("is 'ok()'", async () => {
    const spark = shape.spark({ val: { firstName: "123", lastName: "xyz" } });
    expect(spark.ok()).toBe(true);
    expect(spark.errors()).toEqual([]);
  });

  it("is not 'ok()' - value too short", async () => {
    const spark = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    expect(spark.ok()).toBe(false);
    expect(spark.errors()).toEqual(["val.firstName"]);
  });

  it("is not 'ok()' - value is null (the default)", async () => {
    const spark = shape.spark({});
    const ok = spark.ok();
    expect(ok).toBe(false);
    expect(spark.errors()).toEqual(["val.firstName", "val.lastName"]);
  });

  it("converts to plain object", async () => {
    const spark = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const plain = spark.plainObject();
    expect(plain).toMatchObject({
      meta: { id: expect.anything(), type: 'sh4pe' },
      val: { firstName: "12", lastName: "xyz" },
      ref: {},
      ext: {},
    });
  });

});
