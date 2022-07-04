const Fba = require("firebase-admin/firestore");

const Flame = require("../src/registry");
const FlameError = require("../src/errors");


const cfg = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
const dbURL = process.env.FIREBASE_DATABASE_URL;


describe("Spark", () => {
  shape = null;

  beforeAll(async () => {
    flame = await Flame.ignite("X", cfg, dbURL);
    shape = flame.shape("sh4pe", {
      val: { firstName: null, lastName: null },
      ok: {
        val: {
          firstName: (v) => typeof v === "string" && v.length > 2,
          lastName: (v) => typeof v === "string" && v.length > 2,
        },
      }
    });
  });

  afterAll(async () => {
     await Flame.quench("X");
  });

  it("creates and retrieves", async () => {
    const spark1 = shape.spark({ val: { firstName: "12", lastName: "xyz" } });

    await expect(shape.get("asd")).rejects.toThrow(FlameError);

    await spark1.insert();
    await expect(spark1.insert()).rejects.toThrow(FlameError);

    const spark2 = await shape.get(spark1.meta.id);
    expect(spark2).toEqual(spark1);

    await spark1.remove();
    await spark1.remove();

    await expect(shape.get(spark1.meta.id)).rejects.toThrow(FlameError);

    await spark1.insert();
    await shape.get(spark1.meta.id);
    const spark3 = await shape.get(spark1.meta.id);
    expect(spark3).toEqual(spark1);
  });

  it("creates and updates and upserts", async () => {
    const spark1 = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const spark2 = shape.spark({ val: { firstName: "ooooo", lastName: "aaaa" } });
    spark2.meta.id = spark1.meta.id;

    await expect(spark1.update()).rejects.toThrow(FlameError);

    await spark1.upsert();
    await spark1.upsert();
    await spark2.update(); // this simply changes firstName and lastName for spark1, since IDs are same.

    await expect(spark1.insert()).rejects.toThrow(FlameError);

    const spark3 = await shape.get(spark1.meta.id);
    expect(spark3).toEqual(spark2); // verifies firstName and lastName were updated.
  });

  it("finds and lists", async () => {
    const spark1 = shape.spark({ val: { firstName: "11", lastName: "xxx" } });
    const spark2 = shape.spark({ val: { firstName: "22", lastName: "xxx" } });
    const spark3 = shape.spark({ val: { firstName: "33", lastName: "xxx" } });

    // await shape.list({ val: { lastName: "xxx" } });
    // await spark1.insert();
    // await shape.list({ val: { lastName: "xxx" } });
    // await spark2.upsert();
    // await shape.list({ val: { lastName: "xxx" } });
    // await spark3.insert();
    // await shape.list({ val: { lastName: "xxx" } });
    //
    // await shape.find({ val: { firstName: "11" } });
  });
});
