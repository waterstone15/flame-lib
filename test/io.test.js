const Fba = require("firebase-admin");

const Flame = require("../src/registry");
const FlameError = require("../src/errors");


const cfg = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
const dbURL = process.env.FIREBASE_DATABASE_URL;
const like = (spark) => {
  return {
    ext: {...spark.ext},
    index: {...spark.index},
    meta: {
      id: spark.meta.id,
      type: spark.meta.type,
      created_at: expect.anything(),
      modified_at: expect.anything(),
    },
    ref: {...spark.ref},
    val: {...spark.val},
  };
};


describe("Spark", () => {
  flame = null;
  shape = null;

  beforeEach(async () => {
    flame = await Flame.ignite("X", cfg, dbURL);
    shape = flame.shape("sh4pe", {
      val: {
        firstName: null,
        lastName: null,
        fullName: s => `${s.val.firstName} ${s.val.lastName}`,
      },
      ok: {
        val: {
          firstName: v => typeof v === "string" && v.length > 2,
          lastName: v => typeof v === "string" && v.length > 2,
        },
      }
    });
  });

  afterEach(async () => {
     await Flame.quench("X");
  });

  it("creates and retrieves", async () => {
    const spark = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const expected = like(spark);

    await expect(shape.get("asd")).resolves.toEqual(null);
    await spark.insert();
    await expect(spark.insert()).rejects.toThrow(FlameError);
    await expect(shape.get(spark.meta.id)).resolves.toEqual(expected);
    await spark.remove();
    await spark.remove();
    await expect(shape.get(spark.meta.id)).resolves.toEqual(null);
    await spark.insert();
    await shape.get(spark.meta.id);
    await expect(shape.get(spark.meta.id)).resolves.toEqual(expected);
  });

  it("creates and updates and upserts", async () => {
    const spark = shape.spark({ val: { firstName: "12", lastName: "xyz" } });
    const expected = like(spark);
    expected.val.lastName = "aaaa";

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
    const expect1 = like(spark1);
    const expect2 = like(spark2);
    const expect3 = like(spark3);

    await expect(shape.find(["val", "firstName", "==", "11"])).resolves.toBe(null);
    await expect(shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"])).resolves.toEqual([]);
    await spark1.insert();
    await expect(shape.find(["val", "firstName", "==", "11"])).resolves.toEqual(expect1);
    await expect(shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"])).resolves.toEqual([expect1]);
    await spark2.upsert();
    await spark3.insert();
    await expect(shape.find(["val", "firstName", "==", "22"])).resolves.toEqual(expect2);
    await expect(shape.find(["val", "firstName", "==", "33"])).resolves.toEqual(expect3);
    const sparks = await shape.list(10, 0, null, null, ["val", "lastName", "==", "xxx"]);
    expect(sparks.length).toEqual(3);
    expect(sparks).toEqual(expect.arrayContaining([expect1, expect2, expect3]));
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
        { val: { firstName: "11" }, meta: {}, ref: {}, ext: {}, index: {} },
        { val: { firstName: "22" }, meta: {}, ref: {}, ext: {}, index: {} },
        { val: { firstName: "33" }, meta: {}, ref: {}, ext: {}, index: {} },
        { val: { firstName: "44" }, meta: {}, ref: {}, ext: {}, index: {} },
      ]);
  });

  it("hadndles derived fields", async () => {
    const spark = shape.spark({ val: { firstName: "11", lastName: "www" } });

    await spark.insert();
    const actual = await shape.get(spark.meta.id);

    expect(actual.val.fullName).toEqual("11 www");
    expect(actual).toEqual(like(spark));
  });

  it("handles batch-writes", async () => {
    const spark1 = shape.spark({ val: { firstName: "abcd", lastName: "xyzt" } });
    const fragments1 = spark1.fragments().set("val", "lastName", "aaaa"); // changes lastName for spark.
    const spark2 = shape.spark({ val: { firstName: "weee", lastName: "fooo" } });
    const expected1 = like(spark1);
    expected1.val.lastName = "aaaa";
    const expected2 = like(spark2);

    await spark2.insert();
    await expect(shape.get(spark2.meta.id)).resolves.toEqual(expected2);

    await flame.writeBatch()
      .insert(spark1)
      .upsert(spark1)
      .remove(spark2)
      .update(fragments1)
      .commit();

    await expect(shape.get(spark1.meta.id)).resolves.toEqual(expected1);
    await expect(shape.get(spark2.meta.id)).resolves.toEqual(null);
  });
});
