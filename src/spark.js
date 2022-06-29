const FlameError = require("./errors");


/*
 * A Flame Shape Instance.
 */
class Spark {
  shape = null;
  meta = null;
  val = null;
  ref = null;
  ext = null;

  constructor(shape, meta, val, ref, ext) {
    this.shape = shape;
    this.meta = meta;
    this.val = val;
    this.ref = ref;
    this.ext = ext;
  }

  ok() {
    const okSection = (s, ok) => Object.keys(s).every((k) => ok[k](s[k]));
    return okSection(this.meta, this.shape.ok.meta) &&
      okSection(this.val, this.shape.ok.val) &&
      okSection(this.ref, this.shape.ok.ref) &&
      okSection(this.ext, this.shape.ok.ext);
  }

  save() {
    throw new FlameError(`Not implemented!`);
  };

  update() {
    throw new FlameError(`Not implemented!`);
  };

  upsert() {
    throw new FlameError(`Not implemented!`);
  };

  remove() {
    throw new FlameError(`Not implemented!`);
  };
};


module.exports = Spark;
