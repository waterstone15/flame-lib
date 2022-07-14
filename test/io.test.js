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

    await expect(shape.get("asd")).resolves.toEqual(null);
    await spark1.insert();
    await expect(spark1.insert()).rejects.toThrow(FlameError);
    await expect(shape.get(spark1.meta.id)).resolves.toEqual(spark1);
    await spark1.remove();
    await spark1.remove();
    await expect(shape.get(spark1.meta.id)).resolves.toEqual(null);
    await spark1.insert();
    await shape.get(spark1.meta.id);
    await expect(shape.get(spark1.meta.id)).resolves.toEqual(spark1);
  });

  it("creates and updates and upserts", async () => {
    const spark1 = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const spark2 = shape.spark({ val: { firstName: "ooooo", lastName: "aaaa" } });
    spark2.meta.id = spark1.meta.id;

    await expect(spark1.update()).rejects.toThrow(FlameError);
    await spark1.upsert();
    await spark1.upsert();
    await spark2.update(); // changes firstName and lastName for spark1, since IDs are same.
    await expect(spark1.insert()).rejects.toThrow(FlameError);
    await expect(shape.get(spark1.meta.id)).resolves.toEqual(spark2); // verifies names were updated.
  });

  it("finds and lists", async () => {
    const spark1 = shape.spark({ val: { firstName: "11", lastName: "xxx" } });
    const spark2 = shape.spark({ val: { firstName: "22", lastName: "xxx" } });
    const spark3 = shape.spark({ val: { firstName: "33", lastName: "xxx" } });

    await expect(shape.find(["val.firstName", "==", "11"])).resolves.toBe(null);
    await expect(shape.list(10, 0, ["val.lastName", "==", "xxx"])).resolves.toEqual([]);
    await spark1.insert();
    await expect(shape.find(["val.firstName", "==", "11"])).resolves.toEqual(spark1);
    await expect(shape.list(10, 0, ["val.lastName", "==", "xxx"])).resolves.toEqual([spark1]);
    await spark2.upsert();
    await spark3.insert();
    await expect(shape.find(["val.firstName", "==", "22"])).resolves.toEqual(spark2);
    await expect(shape.find(["val.firstName", "==", "33"])).resolves.toEqual(spark3);
    const sparks = await shape.list(10, 0, ["val.lastName", "==", "xxx"]);
    expect(sparks.length).toEqual(3);
    expect(sparks).toEqual(expect.arrayContaining([spark1, spark2, spark3]));
  });

  it("lists paginated", async () => {
    const spark1 = shape.spark({ val: { firstName: "11", lastName: "yyy" } });
    const spark2 = shape.spark({ val: { firstName: "22", lastName: "yyy" } });
    const spark3 = shape.spark({ val: { firstName: "33", lastName: "yyy" } });
    const spark4 = shape.spark({ val: { firstName: "44", lastName: "yyy" } });
    const spark5 = shape.spark({ val: { firstName: "55", lastName: "yyy" } });
    const filter = ["val.lastName", "==", "yyy"];

    await spark1.insert();
    await spark2.insert();
    await spark3.insert();
    await spark4.insert();
    await spark5.insert();

    await expect(shape.list(2, 0, filter)).resolves.toHaveLength(2);
    await expect(shape.list(2, 1, filter)).resolves.toHaveLength(2);
    await expect(shape.list(2, 2, filter)).resolves.toHaveLength(1);
    await expect(shape.list(2, 3, filter)).resolves.toHaveLength(0);
  });
});
