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
    const spark = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const expected = shape.spark({ val: { firstName: "12", lastName: "aaaa" } });
    expected.meta.id = spark.meta.id;

    const fragments = await spark.fragments() // changes lastName for spark.
      .set("val", "lastName", "aaaa");
    await expect(fragments.update()).rejects.toThrow(FlameError); // spark not found
    await spark.upsert();
    await spark.upsert();
    await fragments.update();
    await expect(spark.insert()).rejects.toThrow(FlameError);
    await expect(shape.get(spark.meta.id)).resolves.toEqual(expected); // verifies names were updated.
  });

  it("finds and lists", async () => {
    const spark1 = shape.spark({ val: { firstName: "11", lastName: "xxx" } });
    const spark2 = shape.spark({ val: { firstName: "22", lastName: "xxx" } });
    const spark3 = shape.spark({ val: { firstName: "33", lastName: "xxx" } });

    await expect(shape.find(["val", "firstName", "==", "11"])).resolves.toBe(null);
    await expect(shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"])).resolves.toEqual([]);
    await spark1.insert();
    await expect(shape.find(["val", "firstName", "==", "11"])).resolves.toEqual(spark1);
    await expect(shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"])).resolves.toEqual([spark1]);
    await spark2.upsert();
    await spark3.insert();
    await expect(shape.find(["val", "firstName", "==", "22"])).resolves.toEqual(spark2);
    await expect(shape.find(["val", "firstName", "==", "33"])).resolves.toEqual(spark3);
    const sparks = await shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"]);
    expect(sparks.length).toEqual(3);
    expect(sparks).toEqual(expect.arrayContaining([spark1, spark2, spark3]));
  });

  it("lists paginated", async () => {
    await shape.spark({ val: { firstName: "11", lastName: "yyy" } }).insert();
    await shape.spark({ val: { firstName: "22", lastName: "yyy" } }).insert();
    await shape.spark({ val: { firstName: "33", lastName: "yyy" } }).insert();
    await shape.spark({ val: { firstName: "44", lastName: "yyy" } }).insert();
    await shape.spark({ val: { firstName: "55", lastName: "yyy" } }).insert();
    const filter = ["val", "lastName", "==", "yyy"];

    await expect(shape.list(2, 0, null, null, filter)).resolves.toHaveLength(2);
    await expect(shape.list(2, 1, null, null, filter)).resolves.toHaveLength(2);
    await expect(shape.list(2, 2, null, null, filter)).resolves.toHaveLength(1);
    await expect(shape.list(2, 3, null, null, filter)).resolves.toHaveLength(0);
  });

  it("lists specific fields", async () => {
    await shape.spark({ val: { firstName: "11", lastName: "zzz" } }).insert();
    await shape.spark({ val: { firstName: "22", lastName: "zzz" } }).insert();
    await shape.spark({ val: { firstName: "33", lastName: "zzz" } }).insert();
    await shape.spark({ val: { firstName: "44", lastName: "zzz" } }).insert();

    await expect(shape.list(10, 0, ["val:firstName"], ["val:firstName"], ["val", "lastName", "==", "zzz"]))
      .resolves.toEqual([
        { val: { firstName: "11" }, meta: {}, ref: {}, ext: {} },
        { val: { firstName: "22" }, meta: {}, ref: {}, ext: {} },
        { val: { firstName: "33" }, meta: {}, ref: {}, ext: {} },
        { val: { firstName: "44" }, meta: {}, ref: {}, ext: {} },
      ]);
  });
});
