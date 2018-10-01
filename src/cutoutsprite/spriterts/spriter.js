export function loadBool(json, key, def = false) {
  const value = json[key];
  switch (typeof(value)) {
    case "string": return (value === "true") ? true : false;
    case "boolean": return value;
    default: return def;
  }
}

export function saveBool(json, key, value, def) {
  if ((typeof(def) !== "boolean") || (value !== def)) {
    json[key] = value;
  }
}

export function loadFloat(json, key, def = 0) {
  const value = json[key];
  switch (typeof(value)) {
    case "string": return parseFloat(value);
    case "number": return value;
    default: return def;
  }
}

export function saveFloat(json, key, value, def) {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadInt(json, key, def = 0) {
  const value = json[key];
  switch (typeof(value)) {
    case "string": return parseInt(value, 10);
    case "number": return 0 | value;
    default: return def;
  }
}

export function saveInt(json, key, value, def) {
  if ((typeof(def) !== "number") || (value !== def)) {
    json[key] = value;
  }
}

export function loadString(json, key, def = '') {
  const value = json[key];
  switch (typeof(value)) {
    case "string": return value;
    default: return def;
  }
}

export function saveString(json, key, value, def) {
  if ((typeof(def) !== "string") || (value !== def)) {
    json[key] = value;
  }
}

function makeArray(value) {
  if ((typeof(value) === 'object') && (typeof(value.length) === 'number')) { // (Object.isArray(value))
    return value;
  }
  if (typeof(value) !== 'undefined') {
    return [ value ];
  }
  return [];
}

export function wrap(num, min, max) {
  if (min < max) {
    if (num < min) {
      return max - ((min - num) % (max - min));
    } else {
      return min + ((num - min) % (max - min));
    }
  } else if (min === max) {
    return min;
  } else {
    return num;
  }
}

function interpolateLinear(a, b, t) {
  return a + ((b - a) * t);
}

function interpolateQuadratic(a, b, c, t) {
  return interpolateLinear(interpolateLinear(a, b, t), interpolateLinear(b, c, t), t);
}

function interpolateCubic(a, b, c, d, t) {
  return interpolateLinear(interpolateQuadratic(a, b, c, t), interpolateQuadratic(b, c, d, t), t);
}

function interpolateQuartic(a, b, c, d, e, t) {
  return interpolateLinear(interpolateCubic(a, b, c, d, t), interpolateCubic(b, c, d, e, t), t);
}

function interpolateQuintic(a, b, c, d, e, f, t) {
  return interpolateLinear(interpolateQuartic(a, b, c, d, e, t), interpolateQuartic(b, c, d, e, f, t), t);
}

function interpolateBezier(x1, y1, x2, y2, t) {
  function SampleCurve(a, b, c, t) {
    return ((a * t + b) * t + c) * t;
  }

  function SampleCurveDerivativeX(ax, bx, cx, t) {
    return (3.0 * ax * t + 2.0 * bx) * t + cx;
  }

  function SolveEpsilon(duration) {
    return 1.0 / (200.0 * duration);
  }

  function Solve(ax, bx, cx, ay, by, cy, x, epsilon) {
    return SampleCurve(ay, by, cy, SolveCurveX(ax, bx, cx, x, epsilon));
  }

  function SolveCurveX(ax, bx, cx, x, epsilon) {
    let t0;
    let t1;
    let t2;
    let x2;
    let d2;
    let i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = SampleCurve(ax, bx, cx, t2) - x;
      if (Math.abs(x2) < epsilon) return t2;

      d2 = SampleCurveDerivativeX(ax, bx, cx, t2);
      if (Math.abs(d2) < epsilon) break;

      t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {
      x2 = SampleCurve(ax, bx, cx, t2);
      if (Math.abs(x2 - x) < epsilon) return t2;
      if (x > x2) t0 = t2;
      else t1 = t2;
      t2 = (t1 - t0) * 0.5 + t0;
    }

    return t2; // Failure.
  }

  const duration = 1;
  const cx = 3.0 * x1;
  const bx = 3.0 * (x2 - x1) - cx;
  const ax = 1.0 - cx - bx;
  const cy = 3.0 * y1;
  const by = 3.0 * (y2 - y1) - cy;
  const ay = 1.0 - cy - by;

  return Solve(ax, bx, cx, ay, by, cy, t, SolveEpsilon(duration));
}

export function tween(a, b, t) {
  return a + ((b - a) * t);
}

export function wrapAngleRadians(angle) {
  if (angle <= 0.0) {
    return ((angle - Math.PI) % (2.0 * Math.PI)) + Math.PI;
  } else {
    return ((angle + Math.PI) % (2.0 * Math.PI)) - Math.PI;
  }
}

export function tweenAngleRadians(a, b, t, spin) {
  if (spin === 0) {
    return a;
  } else if (spin > 0) {
    if ((b - a) < 0.0) {
      b += 2.0 * Math.PI;
    }
  } else if (spin < 0) {
    if ((b - a) > 0.0) {
      b -= 2.0 * Math.PI;
    }
  }
  return wrapAngleRadians(a + (wrapAngleRadians(b - a) * t));
}

export class Angle {
  constructor(rad = 0) {
    this.rad = rad;
  }
  get deg() { return this.rad * 180 / Math.PI; }
  set deg(value) { this.rad = value * Math.PI / 180; }
  get cos() { return Math.cos(this.rad); }
  get sin() { return Math.sin(this.rad); }
  selfIdentity() { this.rad = 0; return this; }
  copy(other) { this.rad = other.rad; return this; }
  add(other, out = new Angle()) { return Angle.add(this, other, out); }
  selfAdd(other) { return Angle.add(this, other, this); }
  tween(other, pct, spin, out = new Angle()) {
    return Angle.tween(this, other, pct, spin, out);
  }
  selfTween(other, pct, spin) {
    return Angle.tween(this, other, pct, spin, this);
  }
}
Angle.add = function(a, b, out = new Angle()) { out.rad = wrapAngleRadians(a.rad + b.rad); return out; }
Angle.tween = function(a, b, pct, spin, out = new Angle()) {
  out.rad = tweenAngleRadians(a.rad, b.rad, pct, spin);
  return out;
}

export class Vector {
  constructor(x = 0.0, y = 0.0) {
    this.x = x;
    this.y = y;
  }
  copy(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }
  add(other, out = new Vector()) {
    return Vector.add(this, other, out);
  }
  selfAdd(other) {
    // return Vector.add(this, other, this);
    this.x += other.x;
    this.y += other.y;
    return this;
  }
  tween(other, pct, out = new Vector()) {
    return Vector.tween(this, other, pct, out);
  }
  selfTween(other, pct) {
    return Vector.tween(this, other, pct, this);
  }
}
Vector.equal = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a.x - b.x) > epsilon) { return false; }
  if (Math.abs(a.y - b.y) > epsilon) { return false; }
  return true;
}
Vector.add = function(a, b, out = new Vector()) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
}
Vector.tween = function(a, b, pct, out = new Vector()) {
  out.x = tween(a.x, b.x, pct);
  out.y = tween(a.y, b.y, pct);
  return out;
}

export class Position extends Vector {
  constructor() {
    super(0.0, 0.0);
  }
}

export class Rotation extends Angle {
  constructor() {
    super(0.0);
  }
}

export class Scale extends Vector {
  constructor() {
    super(1.0, 1.0);
  }
  selfIdentity() {
    this.x = 1.0;
    this.y = 1.0;
    return this;
  }
}

export class Pivot extends Vector {
  constructor() {
    super(0.0, 0.0);
  }
  selfIdentity() {
    this.x = 0.0;
    this.y = 0.0;
    return this;
  }
}

/**
 * @constructor
 */
export class Space {
  constructor() {
    this.position = new Position();
    this.rotation = new Rotation();
    this.scale = new Scale();
  }
  copy(other) {
    const space = this;
    space.position.copy(other.position);
    space.rotation.copy(other.rotation);
    space.scale.copy(other.scale);
    return space;
  }
  load(json) {
    const space = this;
    space.position.x = loadFloat(json, 'x', 0.0);
    space.position.y = loadFloat(json, 'y', 0.0);
    space.rotation.deg = loadFloat(json, 'angle', 0.0);
    space.scale.x = loadFloat(json, 'scale_x', 1.0);
    space.scale.y = loadFloat(json, 'scale_y', 1.0);
    return space;
  }
}
Space.equal = function(a, b, epsilon = 1e-6) {
  if (Math.abs(a.position.x - b.position.x) > epsilon) { return false; }
  if (Math.abs(a.position.y - b.position.y) > epsilon) { return false; }
  if (Math.abs(a.rotation.rad - b.rotation.rad) > epsilon) { return false; }
  if (Math.abs(a.scale.x - b.scale.x) > epsilon) { return false; }
  if (Math.abs(a.scale.y - b.scale.y) > epsilon) { return false; }
  return true;
}
Space.identity = function(out = new Space()) {
  out.position.x = 0.0;
  out.position.y = 0.0;
  out.rotation.rad = 0.0;
  out.scale.x = 1.0;
  out.scale.y = 1.0;
  return out;
}
Space.translate = function(space, x, y) {
  x *= space.scale.x;
  y *= space.scale.y;
  const rad = space.rotation.rad;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  space.position.x += tx;
  space.position.y += ty;
  return space;
}
Space.rotate = function(space, rad) {
  space.rotation.rad = wrapAngleRadians(space.rotation.rad + rad);
  return space;
}
Space.scale = function(space, x, y) {
  space.scale.x *= x;
  space.scale.y *= y;
  return space;
}
Space.invert = function(space, out) {
  // invert
  // out.sca = space.sca.inv();
  // out.rot = space.rot.inv();
  // out.pos = space.pos.neg().rotate(space.rot.inv()).mul(space.sca.inv());
  out = out || new Space();
  const inv_scale_x = 1.0 / space.scale.x;
  const inv_scale_y = 1.0 / space.scale.y;
  const inv_rotation = -space.rotation.rad;
  const inv_x = -space.position.x;
  const inv_y = -space.position.y;
  out.scale.x = inv_scale_x;
  out.scale.y = inv_scale_y;
  out.rotation.rad = inv_rotation;
  const x = inv_x;
  const y = inv_y;
  const rad = inv_rotation;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  out.position.x = tx * inv_scale_x;
  out.position.y = ty * inv_scale_y;
  return out;
}
Space.combine = function(a, b, out) {
  // combine
  // out.pos = b.pos.mul(a.sca).rotate(a.rot).add(a.pos);
  // out.rot = b.rot.mul(a.rot);
  // out.sca = b.sca.mul(a.sca);
  out = out || new Space();
  const x = b.position.x * a.scale.x;
  const y = b.position.y * a.scale.y;
  const rad = a.rotation.rad;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  out.position.x = tx + a.position.x;
  out.position.y = ty + a.position.y;
  if ((a.scale.x * a.scale.y) < 0.0) {
    out.rotation.rad = wrapAngleRadians(a.rotation.rad - b.rotation.rad);
  } else {
    out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
  }
  out.scale.x = b.scale.x * a.scale.x;
  out.scale.y = b.scale.y * a.scale.y;
  return out;
}
Space.extract = function(ab, a, out) {
  // extract
  // out.sca = ab.sca.mul(a.sca.inv());
  // out.rot = ab.rot.mul(a.rot.inv());
  // out.pos = ab.pos.add(a.pos.neg()).rotate(a.rot.inv()).mul(a.sca.inv());
  out = out || new Space();
  out.scale.x = ab.scale.x / a.scale.x;
  out.scale.y = ab.scale.y / a.scale.y;
  if ((a.scale.x * a.scale.y) < 0.0) {
    out.rotation.rad = wrapAngleRadians(a.rotation.rad + ab.rotation.rad);
  } else {
    out.rotation.rad = wrapAngleRadians(ab.rotation.rad - a.rotation.rad);
  }
  const x = ab.position.x - a.position.x;
  const y = ab.position.y - a.position.y;
  const rad = -a.rotation.rad;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  out.position.x = tx / a.scale.x;
  out.position.y = ty / a.scale.y;
  return out;
}
Space.transform = function(space, v, out) {
  out = out || new Vector();
  const x = v.x * space.scale.x;
  const y = v.y * space.scale.y;
  const rad = space.rotation.rad;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  out.x = tx + space.position.x;
  out.y = ty + space.position.y;
  return out;
}
Space.untransform = function(space, v, out) {
  out = out || new Vector();
  const x = v.x - space.position.x;
  const y = v.y - space.position.y;
  const rad = -space.rotation.rad;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const tx = c * x - s * y;
  const ty = s * x + c * y;
  out.x = tx / space.scale.x;
  out.y = ty / space.scale.y;
  return out;
}
Space.tween = function(a, b, pct, spin, out) {
  out.position.x = tween(a.position.x, b.position.x, pct);
  out.position.y = tween(a.position.y, b.position.y, pct);
  out.rotation.rad = tweenAngleRadians(a.rotation.rad, b.rotation.rad, pct, spin);
  out.scale.x = tween(a.scale.x, b.scale.x, pct);
  out.scale.y = tween(a.scale.y, b.scale.y, pct);
  return out;
}

export class Element {
  constructor() {
    this.id = -1;
    this.name = "";
  }
  load(json) {
    this.id = loadInt(json, 'id', -1);
    this.name = loadString(json, 'name', "");
    return this;
  }
}

export class File extends Element {
  constructor(type = 'unknown') {
    super();
    this.type = type;
  }
  load(json) {
    super.load(json);
    const type = loadString(json, 'type', "image");
    if (this.type !== type) throw new Error();
    return this;
  }
}

export class ImageFile extends File {
  constructor() {
    super('image');

    this.width = 0;
    this.height = 0;
    this.pivot = new Pivot();
  }
  load(json) {
    super.load(json);
    this.width = loadInt(json, 'width', 0);
    this.height = loadInt(json, 'height', 0);
    this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
    this.pivot.y = loadFloat(json, 'pivot_y', 0.0);
    return this;
  }
}

export class SoundFile extends File {
  constructor() {
    super('sound');
  }
  load(json) {
    super.load(json);
    return this;
  }
}

export class Folder extends Element {
  constructor() {
    super()
    this.file_array = []
  }
  load(json) {
    super.load(json);
    this.file_array = [];
    json.file = makeArray(json.file);
    json.file.forEach((file_json) => {
      switch (file_json.type) {
      case 'image':
      default:
        this.file_array.push(new ImageFile().load(file_json));
        break;
      case 'sound':
        this.file_array.push(new SoundFile().load(file_json));
        break;
      }
    });
    return this;
  }
}

export class BaseObject {
  constructor(type = 'unknown') {
    this.type = type;
    this.name = '';
  }
  load(json) {
    const type = loadString(json, 'type', "sprite");
    if (this.type !== type) throw new Error();
    return this;
  }
}

export class SpriteObject extends BaseObject {
  constructor() {
    super('sprite');
    this.parent_index = -1;
    this.folder_index = -1;
    this.file_index = -1;
    this.local_space = new Space();
    this.world_space = new Space();
    this.default_pivot = false;
    this.pivot = new Pivot();
    this.z_index = 0;
    this.alpha = 1.0;
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.folder_index = loadInt(json, 'folder', -1);
    this.file_index = loadInt(json, 'file', -1);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    if ((typeof(json['pivot_x']) !== 'undefined') || (typeof(json['pivot_y']) !== 'undefined')) {
      this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
      this.pivot.y = loadFloat(json, 'pivot_y', 0.0);
    } else {
      this.default_pivot = true;
    }
    this.z_index = loadInt(json, 'z_index', 0);
    this.alpha = loadFloat(json, 'a', 1.0);
    return this;
  }
  copy(other) {
    this.parent_index = other.parent_index;
    this.folder_index = other.folder_index;
    this.file_index = other.file_index;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    this.default_pivot = other.default_pivot;
    this.pivot.copy(other.pivot);
    this.z_index = other.z_index;
    this.alpha = other.alpha;
    return this;
  }
  tween(other, pct, spin) {
    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
    if (!this.default_pivot) {
      Vector.tween(this.pivot, other.pivot, pct, this.pivot);
    }
    this.alpha = tween(this.alpha, other.alpha, pct);
  }
}

export class Bone extends BaseObject {
  constructor() {
    super('bone');
    this.parent_index = -1;
    this.local_space = new Space();
    this.world_space = new Space();
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    return this;
  }
  copy(other) {
    this.parent_index = other.parent_index;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    return this;
  }
  tween(other, pct, spin) {
    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
  }
}

export class BoxObject extends BaseObject {
  constructor() {
    super('box');
    this.parent_index = -1;
    this.local_space = new Space();
    this.world_space = new Space();
    this.pivot = new Pivot();
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
    this.pivot.y = loadFloat(json, 'pivot_y', 0.0);
    return this;
  }
  copy(other) {
    this.parent_index = other.parent_index;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    this.pivot.copy(other.pivot);
    return this;
  }
  tween(other, pct, spin) {
    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
    // Vector.tween(this.pivot, other.pivot, pct, this.pivot);
  }
}

export class PointObject extends BaseObject {
  constructor() {
    super('point');
    this.parent_index = -1;
    this.local_space = new Space();
    this.world_space = new Space();
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    return this;
  }
  copy(other) {
    this.parent_index = other.parent_index;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    return this;
  }
  tween(other, pct, spin) {
    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
  }
}

export class SoundObject extends BaseObject {
  constructor() {
    super('sound');
    this.folder_index = -1;
    this.file_index = -1;
    this.trigger = false;
    this.volume = 1.0;
    this.panning = 0.0;
  }
  load(json) {
    super.load(json);
    this.folder_index = loadInt(json, 'folder', -1);
    this.file_index = loadInt(json, 'file', -1);
    this.trigger = loadBool(json, 'trigger', false);
    this.volume = loadFloat(json, 'volume', 1.0);
    this.panning = loadFloat(json, 'panning', 0.0);
    return this;
  }
  copy(other) {
    this.folder_index = other.folder_index;
    this.file_index = other.file_index;
    this.trigger = other.trigger;
    this.volume = other.volume;
    this.panning = other.panning;
    return this;
  }
  tween(other, pct, spin) {
    this.volume = tween(this.volume, other.volume, pct);
    this.panning = tween(this.panning, other.panning, pct);
  }
}

export class EntityObject extends BaseObject {
  constructor() {
    super('entity');
    this.parent_index = -1;
    this.local_space = new Space();
    this.world_space = new Space();
    this.entity_index = -1;
    this.animation_index = -1;
    this.animation_time = 0.0
    this.pose
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.local_space.load(json);
    this.world_space.copy(this.local_space);
    this.entity_index = loadInt(json, 'entity', -1);
    this.animation_index = loadInt(json, 'animation', -1);
    this.animation_time = loadFloat(json, 't', 0.0);
    return this;
  }
  copy(other) {
    this.parent_index = other.parent_index;
    this.local_space.copy(other.local_space);
    this.world_space.copy(other.world_space);
    this.entity_index = other.entity_index;
    this.animation_index = other.animation_index;
    this.animation_time = other.animation_time;
    return this;
  }
  tween(other, pct, spin) {
    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
    this.animation_time = tween(this.animation_time, other.animation_time, pct);
  }
}

export class VariableObject extends BaseObject {
  constructor() {
    super('variable');
  }
  load(json) {
    super.load(json);
    return this;
  }
  copy(other) {
    return this;
  }
  tween(other, pct, spin) {
  }
}

export class Ref extends Element {
  constructor() {
    super()
    this.parent_index = -1;
    this.timeline_index = -1;
    this.keyframe_index = -1;
  }
  load(json) {
    super.load(json);
    this.parent_index = loadInt(json, 'parent', -1);
    this.timeline_index = loadInt(json, 'timeline', -1);
    this.keyframe_index = loadInt(json, 'key', -1);
    return this;
  }
}

export class BoneRef extends Ref {
}

export class ObjectRef extends Ref {
  constructor() {
    super()
    this.z_index = 0
  }
  load(json) {
    super.load(json);
    this.z_index = loadInt(json, 'z_index', 0);
    return this;
  }
}

export class Keyframe extends Element {
  constructor() {
    super()
    this.time = 0
  }
  load(json) {
    super.load(json);
    this.time = loadInt(json, 'time', 0);
    return this;
  }
}
Keyframe.find = function(array, time) {
  if (array.length <= 0) { return -1; }
  if (time < array[0].time) { return -1; }
  const last = array.length - 1;
  if (time >= array[last].time) { return last; }
  let lo = 0;
  let hi = last;
  if (hi === 0) { return 0; }
  let current = hi >> 1;
  while (true) {
    if (array[current + 1].time <= time) { lo = current + 1; } else { hi = current; }
    if (lo === hi) { return lo; }
    current = (lo + hi) >> 1;
  }
}
Keyframe.compare = function(a, b) {
  return a.time - b.time;
}

export class Curve {
  constructor() {
    this.type = "linear";
    this.c1 = 0.0;
    this.c2 = 0.0;
    this.c3 = 0.0;
    this.c4 = 0.0;
  }
  load(json) {
    this.type = loadString(json, 'curve_type', "linear");
    this.c1 = loadFloat(json, 'c1', 0.0);
    this.c2 = loadFloat(json, 'c2', 0.0);
    this.c3 = loadFloat(json, 'c3', 0.0);
    this.c4 = loadFloat(json, 'c4', 0.0);
    return this;
  }
  evaluate(t) {
    switch (this.type) {
    case "instant": return 0.0;
    case "linear": return t;
    case "quadratic": return interpolateQuadratic(0.0, this.c1, 1.0, t);
    case "cubic": return interpolateCubic(0.0, this.c1, this.c2, 1.0, t);
    case "quartic": return interpolateQuartic(0.0, this.c1, this.c2, this.c3, 1.0, t);
    case "quintic": return interpolateQuintic(0.0, this.c1, this.c2, this.c3, this.c4, 1.0, t);
    case "bezier": return interpolateBezier(this.c1, this.c2, this.c3, this.c4, t);
    }
    return 0.0;
  }
}

export class MainlineKeyframe extends Keyframe {
  constructor() {
    super()
    this.curve = new Curve();
    this.bone_ref_arrayRef = [];
    this.object_ref_array = [];
  }
  load(json) {
    super.load(json);
    const mainline_keyframe = this;
    mainline_keyframe.curve.load(json);
    mainline_keyframe.bone_ref_array = [];
    json.bone_ref = makeArray(json.bone_ref);
    json.bone_ref.forEach(function(bone_ref_json) {
      mainline_keyframe.bone_ref_array.push(new BoneRef().load(bone_ref_json));
    });
    mainline_keyframe.bone_ref_array.sort(function(a, b) { return a.id - b.id; });
    mainline_keyframe.object_ref_array = [];
    json.object_ref = makeArray(json.object_ref);
    json.object_ref.forEach(function(object_ref_json) {
      mainline_keyframe.object_ref_array.push(new ObjectRef().load(object_ref_json));
    });
    mainline_keyframe.object_ref_array.sort(function(a, b) { return a.id - b.id; });
    return mainline_keyframe;
  }
}

export class Mainline {
  constructor() {
    this.keyframe_array = []
  }
  load(json) {
    const mainline = this;
    mainline.keyframe_array = [];
    json.key = makeArray(json.key);
    json.key.forEach(function(key_json) {
      mainline.keyframe_array.push(new MainlineKeyframe().load(key_json));
    });
    mainline.keyframe_array.sort(Keyframe.compare);
    return mainline;
  }
}

export class TimelineKeyframe extends Keyframe {
  constructor(type = 'unknown') {
    super();
    this.type = type;
    this.spin = 1; // 1: counter-clockwise, -1: clockwise
    this.curve = new Curve();
  }
  load(json) {
    super.load(json);
    // const type = loadString(json, 'type', "sprite");
    // if (this.type !== type) throw new Error();
    this.spin = loadInt(json, 'spin', 1);
    this.curve.load(json);
    return this;
  }
}

export class SpriteTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('sprite');
    this.sprite
  }
  load(json) {
    super.load(json);
    this.sprite = new SpriteObject().load(json.object);
    return this;
  }
}

export class BoneTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('bone')
    this.bone
  }
  load(json) {
    super.load(json);
    json.bone.type = json.bone.type || 'bone';
    this.bone = new Bone().load(json.bone);
    return this;
  }
}

export class BoxTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('box')
    this.box
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'box';
    this.box = new BoxObject().load(json.object);
    return this;
  }
}

export class PointTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('point')
    this.point
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'point';
    this.point = new PointObject().load(json.object);
    return this;
  }
}

export class SoundTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('sound')
    this.sound
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'sound';
    this.sound = new SoundObject().load(json.object);
    return this;
  }
}

export class EntityTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('entity')
    this.entity
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'entity';
    this.entity = new EntityObject().load(json.object);
    return this;
  }
}

export class VariableTimelineKeyframe extends TimelineKeyframe {
  constructor() {
    super('variable')
    this.variable
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'variable';
    this.variable = new VariableObject().load(json.object);
    return this;
  }
}

export class TagDef extends Element {
  constructor() {
    super()
    this.tag_index = -1
  }
  load(json) {
    super.load(json);
    return this;
  }
}

export class Tag extends Element {
  constructor() {
    super()
    this.tag_def_index = -1
  }
  load(json) {
    super.load(json);
    this.tag_def_index = loadInt(json, 't', -1);
    return this;
  }
}

export class TaglineKeyframe extends Keyframe {
  constructor() {
    super()
    this.tag_array = []
  }
  load(json) {
    super.load(json);
    const tagline_keyframe = this;
    tagline_keyframe.tag_array = [];
    json.tag = makeArray(json.tag);
    json.tag.forEach(function(tag_json) {
      tagline_keyframe.tag_array.push(new Tag().load(tag_json));
    });
    return this;
  }
}

export class Tagline extends Element {
  constructor() {
    super()
    this.keyframe_array = [];
  }
  load(json) {
    super.load(json);
    const tagline = this;
    tagline.keyframe_array = [];
    json.key = makeArray(json.key);
    json.key.forEach(function(key_json) {
      tagline.keyframe_array.push(new TaglineKeyframe().load(key_json));
    });
    return this;
  }
}

export class VarlineKeyframe extends Keyframe {
  constructor() {
    super()
    this.val
  }
  load(json) {
    super.load(json);
    const varline_keyframe = this;
    switch (typeof(json.val)) {
    case 'number':
      varline_keyframe.val = loadFloat(json, 'val', 0.0);
      break;
    case 'string':
      varline_keyframe.val = loadString(json, 'val', "");
      break;
    }
    return this;
  }
}

export class Varline extends Element {
  constructor() {
    super()
    this.var_def_index = -1
    this.keyframe_array = []
  }
  load(json) {
    super.load(json);
    const varline = this;
    varline.var_def_index = loadInt(json, 'def', -1);
    varline.keyframe_array = [];
    json.key = makeArray(json.key);
    json.key.forEach(function(key_json) {
      varline.keyframe_array.push(new VarlineKeyframe().load(key_json));
    });
    return this;
  }
}

export class Meta extends Element {
  constructor() {
    super()
    this.tagline
    this.varline_array = []
  }
  load(json) {
    super.load(json);
    const meta = this;
    meta.tagline = new Tagline();
    if (json.tagline) {
      meta.tagline.load(json.tagline);
    }
    meta.varline_array = [];
    json.valline = json.valline || null; // HACK
    json.varline = json.varline || json.valline; // HACK
    if (json.varline) {
      json.varline = makeArray(json.varline);
      json.varline.forEach(function(varline_json) {
        meta.varline_array.push(new Varline().load(varline_json));
      });
    }
    return this;
  }
}

export class Timeline extends Element {
  constructor() {
    super()
    this.type = 'sprite'
    this.object_index = -1
    this.keyframe_array = []
    this.meta
  }
  load(json) {
    super.load(json);
    const timeline = this;
    timeline.type = loadString(json, 'object_type', "sprite");
    timeline.object_index = loadInt(json, 'obj', -1);
    timeline.keyframe_array = [];
    json.key = makeArray(json.key);
    switch (timeline.type) {
    case 'sprite':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new SpriteTimelineKeyframe().load(key_json));
      });
      break;
    case 'bone':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new BoneTimelineKeyframe().load(key_json));
      });
      break;
    case 'box':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new BoxTimelineKeyframe().load(key_json));
      });
      break;
    case 'point':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new PointTimelineKeyframe().load(key_json));
      });
      break;
    case 'sound':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new SoundTimelineKeyframe().load(key_json));
      });
      break;
    case 'entity':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new EntityTimelineKeyframe().load(key_json));
      });
      break;
    case 'variable':
      json.key.forEach(function(key_json) {
        timeline.keyframe_array.push(new VariableTimelineKeyframe().load(key_json));
      });
      break;
    default:
      console.log("TODO: Timeline::load", timeline.type, json.key);
      break;
    }
    timeline.keyframe_array.sort(Keyframe.compare);
    if (json.meta) {
      timeline.meta = new Meta().load(json.meta);
    }
    return timeline;
  }
}

export class SoundlineKeyframe extends Keyframe {
  constructor() {
    super()
    this.sound
  }
  load(json) {
    super.load(json);
    json.object.type = json.object.type || 'sound';
    this.sound = new SoundObject().load(json.object);
    return this;
  }
}

export class Soundline extends Element {
  constructor() {
    super()
    this.keyframe_array = []
  }
  load(json) {
    super.load(json);
    const soundline = this;
    soundline.keyframe_array = [];
    json.key = makeArray(json.key);
    json.key.forEach(function(key_json) {
      soundline.keyframe_array.push(new SoundlineKeyframe().load(key_json));
    });
    soundline.keyframe_array.sort(Keyframe.compare);
    return this;
  }
}

export class EventlineKeyframe extends Keyframe {
  /// event: EventObject;
  load(json) {
    super.load(json);
    ///  this.event = new EventObject().load(json.object || {});
    return this;
  }
}

export class Eventline extends Element {
  constructor() {
    super()
    this.keyframe_array = []
  }
  load(json) {
    super.load(json);
    const eventline = this;
    eventline.keyframe_array = [];
    json.key = makeArray(json.key);
    json.key.forEach(function(key_json) {
      eventline.keyframe_array.push(new EventlineKeyframe().load(key_json));
    });
    eventline.keyframe_array.sort(Keyframe.compare);
    return this;
  }
}

export class MapInstruction {
  constructor() {
    this.folder_index = -1
    this.file_index = -1
    this.target_folder_index = -1
    this.target_file_index = -1
  }
  load(json) {
    const map_instruction = this;
    map_instruction.folder_index = loadInt(json, 'folder', -1);
    map_instruction.file_index = loadInt(json, 'file', -1);
    map_instruction.target_folder_index = loadInt(json, 'target_folder', -1);
    map_instruction.target_file_index = loadInt(json, 'target_file', -1);
    return this;
  }
}

export class CharacterMap extends Element {
  constructor() {
    super()
    this.map_instruction_array = []
  }
  load(json) {
    super.load(json);
    const character_map = this;
    character_map.map_instruction_array = [];
    json.map = makeArray(json.map);
    json.map.forEach(function(map_json) {
      const map_instruction = new MapInstruction().load(map_json);
      character_map.map_instruction_array.push(map_instruction);
    });
    return this;
  }
}

export class VarDef extends Element {
  constructor() {
    super()
    this.type
    this.default_value
    this.value
  }
  load(json) {
    super.load(json);
    this.type = this.default_value = loadString(json, 'type', "");
    switch (this.type) {
      case 'int':
      this.value = this.default_value = loadInt(json, 'default_value', 0);
      break;
      case 'float':
      this.value = this.default_value = loadFloat(json, 'default_value', 0.0);
      break;
      case 'string':
      this.value = this.default_value = loadString(json, 'default_value', "");
      break;
    }
    return this;
  }
}

export class VarDefs extends Element {
  constructor() {
    super()
    this.var_def_array = []
  }
  load(json) {
    super.load(json);
    const var_defs = this;
    this.var_def_array = [];
    let json_var_def_array = [];
    if (typeof(json.i) === 'object') {
      // in SCML files, json.i is an object or array of objects
      json_var_def_array = makeArray(json.i);
    } else if ((typeof(json) === 'object') && (typeof(json.length) === 'number')) {
      // in SCON files, json is an array
      json_var_def_array = makeArray(json);
    }
    json_var_def_array.forEach(function(var_def_json) {
      var_defs.var_def_array.push(new VarDef().load(var_def_json));
    });
    return this;
  }
}

export class ObjInfo extends Element {
  constructor(type = 'unknown') {
    super();
    this.type = type
    this.var_defs
  }
  load(json) {
    super.load(json);
    // const type = loadString(json, 'type', "unknown");
    // if (this.type !== type) throw new Error();
    this.var_defs = new VarDefs().load(json.var_defs || {});
    return this;
  }
}

export class SpriteFrame {
  constructor() {
    this.folder_index = -1
    this.file_index = -1
  }
  load(json) {
    this.folder_index = loadInt(json, 'folder', -1);
    this.file_index = loadInt(json, 'file', -1);
    return this;
  }
}

export class SpriteObjInfo extends ObjInfo {
  constructor() {
    super('sprite');
    this.sprite_frame_array = []
  }
  load(json) {
    super.load(json);
    const obj_info = this;
    obj_info.sprite_frame_array = [];
    json.frames = makeArray(json.frames);
    json.frames.forEach(function(frames_json) {
      obj_info.sprite_frame_array.push(new SpriteFrame().load(frames_json));
    });
    return this;
  }
}

export class BoneObjInfo extends ObjInfo {
  constructor() {
    super('bone')
    this.w = 0
    this.h = 0
  }
  load(json) {
    super.load(json);
    this.w = loadInt(json, 'w', 0);
    this.h = loadInt(json, 'h', 0);
    return this;
  }
}

export class BoxObjInfo extends ObjInfo {
  constructor() {
    super('box');
    this.w = 0
    this.h = 0
  }
  load(json) {
    super.load(json);
    this.w = loadInt(json, 'w', 0);
    this.h = loadInt(json, 'h', 0);
    return this;
  }
}

export class Animation extends Element {
  constructor() {
    super()
    this.length = 0;
    this.looping = "true"; // "true", "false" or "ping_pong"
    this.loop_to = 0;
    this.mainline;
    this.timeline_array = [];
    this.soundline_array = [];
    this.eventline_array = [];
    this.meta
    this.min_time = 0;
    this.max_time = 0;
  }
  load(json) {
    super.load(json);
    const anim = this;
    anim.length = loadInt(json, 'length', 0);
    anim.looping = loadString(json, 'looping', "true");
    anim.loop_to = loadInt(json, 'loop_to', 0);
    anim.mainline = new Mainline().load(json.mainline || {});
    anim.timeline_array = [];
    json.timeline = makeArray(json.timeline);
    json.timeline.forEach(function(timeline_json) {
      anim.timeline_array.push(new Timeline().load(timeline_json));
    });
    anim.soundline_array = [];
    json.soundline = makeArray(json.soundline);
    json.soundline.forEach(function(soundline_json) {
      anim.soundline_array.push(new Soundline().load(soundline_json));
    });
    anim.eventline_array = [];
    json.eventline = makeArray(json.eventline);
    json.eventline.forEach(function(eventline_json) {
      anim.eventline_array.push(new Eventline().load(eventline_json));
    });
    if (json.meta) {
      anim.meta = new Meta().load(json.meta);
    }
    anim.min_time = 0;
    anim.max_time = anim.length;
    return this;
  }
}

export class Entity extends Element {
  constructor() {
    super()
    this.character_map_map
    this.character_map_keys = []
    this.var_defs
    this.obj_info_map
    this.obj_info_keys = []
    this.animation_map
    this.animation_keys = [];
  }
  load(json) {
    super.load(json);
    const entity = this;
    entity.character_map_map = {};
    entity.character_map_keys = [];
    json.character_map = makeArray(json.character_map);
    json.character_map.forEach(function(character_map_json) {
      const character_map = new CharacterMap().load(character_map_json);
      entity.character_map_map[character_map.name] = character_map;
      entity.character_map_keys.push(character_map.name);
    });
    this.var_defs = new VarDefs().load(json.var_defs || {});
    entity.obj_info_map = {};
    entity.obj_info_keys = [];
    json.obj_info = makeArray(json.obj_info);
    json.obj_info.forEach(function(obj_info_json) {
      let obj_info;
      switch (obj_info_json.type) {
      case 'sprite':
        obj_info = new SpriteObjInfo().load(obj_info_json);
        break;
      case 'bone':
        obj_info = new BoneObjInfo().load(obj_info_json);
        break;
      case 'box':
        obj_info = new BoxObjInfo().load(obj_info_json);
        break;
      case 'point':
      case 'sound':
      case 'entity':
      case 'variable':
      default:
        console.log("TODO: Entity.load", obj_info_json.type, obj_info_json);
        obj_info = new ObjInfo(obj_info_json.type).load(obj_info_json);
        break;
      }
      entity.obj_info_map[obj_info.name] = obj_info;
      entity.obj_info_keys.push(obj_info.name);
    });
    entity.animation_map = {};
    entity.animation_keys = [];
    json.animation = makeArray(json.animation);
    json.animation.forEach(function(animation_json) {
      const animation = new Animation().load(animation_json);
      entity.animation_map[animation.name] = animation;
      entity.animation_keys.push(animation.name);
    });
    return this;
  }
}

export class Data {
  constructor() {
    this.folder_array = []
    this.tag_def_array = []
    this.entity_map = {}
    this.entity_keys = []
  }
  load(json) {
    const data = this;
    const scon_version = loadString(json, 'scon_version', "");
    const generator = loadString(json, 'generator', "");
    const generator_version = loadString(json, 'generator_version', "");
    data.folder_array = [];
    json.folder = makeArray(json.folder);
    json.folder.forEach(function(folder_json) {
      data.folder_array.push(new Folder().load(folder_json));
    });
    data.tag_def_array = [];
    json.tag_list = makeArray(json.tag_list);
    json.tag_list.forEach(function(tag_list_json) {
      data.tag_def_array.push(new TagDef().load(tag_list_json));
    });
    data.entity_map = {};
    data.entity_keys = [];
    json.entity = makeArray(json.entity);
    json.entity.forEach(function(entity_json) {
      const entity = new Entity().load(entity_json);
      data.entity_map[entity.name] = entity;
      data.entity_keys.push(entity.name);
    });
    // patch SpriteObject::pivot
    data.entity_keys.forEach(function(entity_key) {
      const entity = data.entity_map[entity_key];
      entity.animation_keys.forEach(function(animation_key) {
        const animation = entity.animation_map[animation_key];
        animation.timeline_array.forEach(function(timeline) {
          timeline.keyframe_array.forEach(function(timeline_keyframe) {
            if (timeline_keyframe instanceof SpriteTimelineKeyframe) {
              const sprite = timeline_keyframe.sprite;
              if (sprite.default_pivot) {
                const folder = data.folder_array[sprite.folder_index];
                const file = folder && folder.file_array[sprite.file_index];
                if (file) {
                  sprite.pivot.copy((file).pivot);
                }
              }
            }
          });
        });
      });
    });
    return this;
  }
  getEntities() { return this.entity_map; }
  getEntityKeys() { return this.entity_keys; }
  getAnims(entity_key) {
    const entity = this.entity_map && this.entity_map[entity_key];
    if (entity) {
      return entity.animation_map;
    }
    return {};
  }
  getAnimKeys(entity_key) {
    const entity = this.entity_map && this.entity_map[entity_key];
    if (entity) {
      return entity.animation_keys;
    }
    return [];
  }
}

export class Pose {
  constructor(data) {
    this.data = data;
    this.entity_key = ''
    this.character_map_key_array = []
    this.anim_key = ''
    this.time = 0
    this.elapsed_time = 0
    this.dirty = true
    this.bone_array = []
    this.object_array = []
    this.sound_array = []
    this.event_array = []
    this.tag_array = []
    this.var_map = {}
  }
  getEntities() {
    if (this.data) {
      return this.data.getEntities();
    }
    return null;
  }
  getEntityKeys() {
    if (this.data) {
      return this.data.getEntityKeys();
    }
    return null;
  }
  curEntity() {
    const entity_map = this.data.entity_map;
    return entity_map && entity_map[this.entity_key];
  }
  getEntity() {
    return this.entity_key;
  }
  setEntity(entity_key) {
    if (this.entity_key !== entity_key) {
      this.entity_key = entity_key;
      this.anim_key = "";
      this.time = 0;
      this.dirty = true;
      this.bone_array = [];
      this.object_array = [];
    }
  }
  getAnims() {
    if (this.data) {
      return this.data.getAnims(this.entity_key);
    }
    return null;
  }
  getAnimKeys() {
    if (this.data) {
      return this.data.getAnimKeys(this.entity_key);
    }
    return null;
  }
  curAnim() {
    const anims = this.getAnims();
    return anims && anims[this.anim_key];
  }
  curAnimLength() {
    const pose = this;
    const data = pose.data;
    const entity = data && data.entity_map[pose.entity_key];
    const anim = entity && entity.animation_map[pose.anim_key];
    return (anim && anim.length) || 0;
  }
  getAnim() {
    return this.anim_key;
  }
  setAnim(anim_key) {
    if (this.anim_key !== anim_key) {
      this.anim_key = anim_key;
      const anim = this.curAnim();
      if (anim) {
        this.time = wrap(this.time, anim.min_time, anim.max_time);
      }
      this.elapsed_time = 0;
      this.dirty = true;
    }
  }
  getTime() {
    return this.time;
  }
  setTime(time) {
    const anim = this.curAnim();
    if (anim) {
      time = wrap(time, anim.min_time, anim.max_time);
    }
    if (this.time !== time) {
      this.time = time;
      this.elapsed_time = 0;
      this.dirty = true;
    }
  }
  update(elapsed_time) {
    const pose = this;
    pose.elapsed_time += elapsed_time;
    pose.dirty = true;
  }
  strike() {
    const pose = this;
    if (!pose.dirty) { return; }
    pose.dirty = false;

    const entity = pose.curEntity();

    pose.var_map = pose.var_map || {};
    entity.var_defs.var_def_array.forEach(function(var_def) {
      if (!(var_def.name in pose.var_map)) {
        pose.var_map[var_def.name] = var_def.default_value;
      }
    });

    const anim = pose.curAnim();

    const prev_time = pose.time;
    const elapsed_time = pose.elapsed_time;

    pose.time = pose.time + pose.elapsed_time; // accumulate elapsed time
    pose.elapsed_time = 0; // reset elapsed time for next strike
    let wrapped_min = false;
    let wrapped_max = false;
    if (anim) {
      wrapped_min = (elapsed_time < 0) && (pose.time <= anim.min_time);
      wrapped_max = (elapsed_time > 0) && (pose.time >= anim.max_time);
      pose.time = wrap(pose.time, anim.min_time, anim.max_time);
    }

    const time = pose.time;

    if (anim) {
      const mainline_keyframe_array = anim.mainline.keyframe_array;
      const mainline_keyframe_index1 = Keyframe.find(mainline_keyframe_array, time);
      const mainline_keyframe_index2 = (mainline_keyframe_index1 + 1) % mainline_keyframe_array.length;
      const mainline_keyframe1 = mainline_keyframe_array[mainline_keyframe_index1];
      const mainline_keyframe2 = mainline_keyframe_array[mainline_keyframe_index2];
      const mainline_time1 = mainline_keyframe1.time;
      let mainline_time2 = mainline_keyframe2.time;
      if (mainline_time2 < mainline_time1) { mainline_time2 = anim.length; }
      let mainline_time = time;
      if (mainline_time1 !== mainline_time2) {
        let mainline_tween = (time - mainline_time1) / (mainline_time2 - mainline_time1);
        mainline_tween = mainline_keyframe1.curve.evaluate(mainline_tween);
        mainline_time = tween(mainline_time1, mainline_time2, mainline_tween);
      }

      const timeline_array = anim.timeline_array;

      const data_bone_array = mainline_keyframe1.bone_ref_array;
      const pose_bone_array = pose.bone_array;

      data_bone_array.forEach(function(data_bone, bone_index) {
        const timeline_index = data_bone.timeline_index;
        const timeline = timeline_array[timeline_index];
        const timeline_keyframe_array = timeline.keyframe_array;
        const keyframe_index1 = data_bone.keyframe_index;
        const keyframe_index2 = (keyframe_index1 + 1) % timeline_keyframe_array.length;
        const timeline_keyframe1 = timeline_keyframe_array[keyframe_index1];
        const timeline_keyframe2 = timeline_keyframe_array[keyframe_index2];
        const time1 = timeline_keyframe1.time;
        let time2 = timeline_keyframe2.time;
        if (time2 < time1) { time2 = anim.length; }
        let pct = 0.0;
        if (time1 !== time2) {
          pct = (mainline_time - time1) / (time2 - time1);
          pct = timeline_keyframe1.curve.evaluate(pct);
        }

        const pose_bone = (pose_bone_array[bone_index] = (pose_bone_array[bone_index] || new Bone()));
        const bone_timeline_keyframe1 = timeline_keyframe1;
        const bone_timeline_keyframe2 = timeline_keyframe2;
        pose_bone.copy(bone_timeline_keyframe1.bone).tween(bone_timeline_keyframe2.bone, pct, timeline_keyframe1.spin);
        pose_bone.name = timeline.name; // set name from timeline
        pose_bone.parent_index = data_bone.parent_index; // set parent from bone_ref
      });

      // clamp output bone array
      pose_bone_array.length = data_bone_array.length;

      // compute bone world space
      pose_bone_array.forEach(function(bone) {
        const parent_bone = pose_bone_array[bone.parent_index];
        if (parent_bone) {
          Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
        } else {
          bone.world_space.copy(bone.local_space);
        }
      });

      const data_object_array = mainline_keyframe1.object_ref_array;
      const pose_object_array = pose.object_array;

      data_object_array.forEach(function(data_object, object_index) {
        const timeline_index = data_object.timeline_index;
        const timeline = timeline_array[timeline_index];
        const timeline_keyframe_array = timeline.keyframe_array;
        const keyframe_index1 = data_object.keyframe_index;
        const keyframe_index2 = (keyframe_index1 + 1) % timeline_keyframe_array.length;
        const timeline_keyframe1 = timeline_keyframe_array[keyframe_index1];
        const timeline_keyframe2 = timeline_keyframe_array[keyframe_index2];
        const time1 = timeline_keyframe1.time;
        let time2 = timeline_keyframe2.time;
        if (time2 < time1) { time2 = anim.length; }
        let pct = 0.0;
        if (time1 !== time2) {
          pct = (mainline_time - time1) / (time2 - time1);
          pct = timeline_keyframe1.curve.evaluate(pct);
        }

        switch (timeline.type) {
        case 'sprite':
          const pose_sprite = (pose_object_array[object_index] = (pose_object_array[object_index] || new SpriteObject()));
          const sprite_timeline_keyframe1 = timeline_keyframe1;
          const sprite_timeline_keyframe2 = timeline_keyframe2;
          pose_sprite.copy(sprite_timeline_keyframe1.sprite).tween(sprite_timeline_keyframe2.sprite, pct, timeline_keyframe1.spin);
          pose_sprite.name = timeline.name; // set name from timeline
          pose_sprite.parent_index = data_object.parent_index; // set parent from object_ref
          break;
        case 'bone':
          const pose_bone = (pose_object_array[object_index] = (pose_object_array[object_index] || new Bone()));
          const bone_timeline_keyframe1 = timeline_keyframe1;
          const bone_timeline_keyframe2 = timeline_keyframe2;
          pose_bone.copy(bone_timeline_keyframe1.bone).tween(bone_timeline_keyframe2.bone, pct, timeline_keyframe1.spin);
          pose_bone.name = timeline.name; // set name from timeline
          pose_bone.parent_index = data_object.parent_index; // set parent from object_ref
          break;
        case 'box':
          const pose_box = (pose_object_array[object_index] = (pose_object_array[object_index] || new BoxObject()));
          const box_timeline_keyframe1 = timeline_keyframe1;
          const box_timeline_keyframe2 = timeline_keyframe2;
          pose_box.copy(box_timeline_keyframe1.box).tween(box_timeline_keyframe2.box, pct, timeline_keyframe1.spin);
          pose_box.name = timeline.name; // set name from timeline
          pose_box.parent_index = data_object.parent_index; // set parent from object_ref
          break;
        case 'point':
          const pose_point = (pose_object_array[object_index] = (pose_object_array[object_index] || new PointObject()));
          const point_timeline_keyframe1 = timeline_keyframe1;
          const point_timeline_keyframe2 = timeline_keyframe2;
          pose_point.copy(point_timeline_keyframe1.point).tween(point_timeline_keyframe2.point, pct, timeline_keyframe1.spin);
          pose_point.name = timeline.name;
          pose_point.parent_index = data_object.parent_index; // set parent from object_ref
          break;
        case 'sound':
          const pose_sound = (pose_object_array[object_index] = (pose_object_array[object_index] || new SoundObject()));
          const sound_timeline_keyframe1 = timeline_keyframe1;
          const sound_timeline_keyframe2 = timeline_keyframe2;
          pose_sound.copy(sound_timeline_keyframe1.sound).tween(sound_timeline_keyframe2.sound, pct, timeline_keyframe1.spin);
          pose_sound.name = timeline.name;
          break;
        case 'entity':
          const pose_entity = (pose_object_array[object_index] = (pose_object_array[object_index] || new EntityObject()));
          const entity_timeline_keyframe1 = timeline_keyframe1;
          const entity_timeline_keyframe2 = timeline_keyframe2;
          pose_entity.copy(entity_timeline_keyframe1.entity).tween(entity_timeline_keyframe2.entity, pct, timeline_keyframe1.spin);
          pose_entity.name = timeline.name;
          pose_entity.parent_index = data_object.parent_index; // set parent from object_ref
          break;
        case 'variable':
          const pose_variable = (pose_object_array[object_index] = (pose_object_array[object_index] || new VariableObject()));
          const variable_timeline_keyframe1 = timeline_keyframe1;
          const variable_timeline_keyframe2 = timeline_keyframe2;
          pose_variable.name = timeline.name;
          pose_variable.copy(variable_timeline_keyframe1.variable).tween(variable_timeline_keyframe2.variable, pct, timeline_keyframe1.spin);
          break;
        default:
          throw new Error(timeline.type);
        }
      });

      // clamp output object array
      pose_object_array.length = data_object_array.length;

      // apply character map
      pose.character_map_key_array.forEach(function(character_map_key) {
        const character_map = entity.character_map_map[character_map_key];
        if (character_map) {
          character_map.map_instruction_array.forEach(function(map_instruction) {
            pose_object_array.forEach(function(object) {
              switch (object.type) {
              case 'sprite':
                const sprite_object = object;
                if ((sprite_object.folder_index === map_instruction.folder_index) &&
                  (sprite_object.file_index === map_instruction.file_index)) {
                  sprite_object.folder_index = map_instruction.target_folder_index;
                  sprite_object.file_index = map_instruction.target_file_index;
                }
                break;
              case 'bone':
              case 'box':
              case 'sound':
              case 'event':
              case 'entity':
              case 'variable':
                break;
              default:
                throw new Error(object.type);
              }
            });
          });
        }
      });

      // compute object world space
      pose_object_array.forEach(function(object) {
        switch (object.type) {
        case 'sprite':
          const sprite_object = object;
          const bone = pose_bone_array[sprite_object.parent_index];
          if (bone) {
            Space.combine(bone.world_space, sprite_object.local_space, sprite_object.world_space);
          } else {
            sprite_object.world_space.copy(sprite_object.local_space);
          }
          break;
        case 'bone': {
          const bone_object = object;
          const bone = pose_bone_array[bone_object.parent_index];
          if (bone) {
            Space.combine(bone.world_space, bone_object.local_space, bone_object.world_space);
          } else {
            bone_object.world_space.copy(bone_object.local_space);
          }
          break;
        }
        case 'box': {
          const box_object = object;
          const bone = pose_bone_array[box_object.parent_index];
          if (bone) {
            Space.combine(bone.world_space, box_object.local_space, box_object.world_space);
          } else {
            box_object.world_space.copy(box_object.local_space);
          }
          const obj_info = entity.obj_info_map[object.name];
          if (obj_info) {
            const box_obj_info = obj_info;
            const offset_x = (0.5 - box_object.pivot.x) * box_obj_info.w;
            const offset_y = (0.5 - box_object.pivot.y) * box_obj_info.h;
            Space.translate(box_object.world_space, offset_x, offset_y);
          }
          break;
        }
        case 'point': {
          const point_object = object;
          const bone = pose_bone_array[point_object.parent_index];
          if (bone) {
            Space.combine(bone.world_space, point_object.local_space, point_object.world_space);
          } else {
            point_object.world_space.copy(point_object.local_space);
          }
          break;
        }
        case 'sound':
          break;
        case 'entity': {
          const entity_object = object;
          const bone = pose_bone_array[entity_object.parent_index];
          if (bone) {
            Space.combine(bone.world_space, entity_object.local_space, entity_object.world_space);
          } else {
            entity_object.world_space.copy(entity_object.local_space);
          }
          break;
        }
        case 'variable':
          break;
        default:
          throw new Error(object.type);
        }
      });

      // process sub-entities
      pose_object_array.forEach(function(object) {
        switch (object.type) {
        case 'entity':
          const entity_object = object;
          const sub_pose = entity_object.pose = entity_object.pose || new Pose(pose.data);
          const sub_entity_key = sub_pose.data.entity_keys[entity_object.entity_index];
          if (sub_entity_key !== sub_pose.getEntity()) {
            sub_pose.setEntity(sub_entity_key);
          }
          const sub_entity = sub_pose.curEntity();
          const sub_anim_key = sub_entity.animation_keys[entity_object.animation_index];
          if (sub_anim_key !== sub_pose.getAnim()) {
            sub_pose.setAnim(sub_anim_key);
            const anim_length = sub_pose.curAnimLength();
            const sub_time = entity_object.animation_time * anim_length;
            sub_pose.setTime(sub_time);
          } else {
            const anim_length = sub_pose.curAnimLength();
            const sub_time = entity_object.animation_time * anim_length;
            const sub_dt = sub_time - sub_pose.getTime();
            sub_pose.update(sub_dt);
          }
          sub_pose.strike();
          break;
        }
      });

      // process soundlines
      pose.sound_array = [];
      anim.soundline_array.forEach(function(soundline) {
        function add_sound (sound_keyframe) {
          const folder = pose.data.folder_array[sound_keyframe.sound.folder_index];
          const file = folder && folder.file_array[sound_keyframe.sound.file_index];
          // console.log(prev_time, sound_keyframe.time, time, "sound", file.name);
          pose.sound_array.push({ name: file.name, volume: sound_keyframe.sound.volume, panning: sound_keyframe.sound.panning });
        }

        if (elapsed_time < 0) {
          if (wrapped_min) {
            // min    prev_time           time      max
            //  |         |                |         |
            //  ----------x                o<---------
            // all events between min_time and prev_time, not including prev_time
            // all events between max_time and time
            soundline.keyframe_array.forEach(function(sound_keyframe) {
              if (((anim.min_time <= sound_keyframe.time) && (sound_keyframe.time < prev_time)) ||
                ((time <= sound_keyframe.time) && (sound_keyframe.time <= anim.max_time))) {
                add_sound(sound_keyframe);
              }
            });
          } else {
            // min       time          prev_time    max
            //  |         |                |         |
            //            o<---------------x
            // all events between time and prev_time, not including prev_time
            soundline.keyframe_array.forEach(function(sound_keyframe) {
              if ((time <= sound_keyframe.time) && (sound_keyframe.time < prev_time)) {
                add_sound(sound_keyframe);
              }
            });
          }
        } else {
          if (wrapped_max) {
            // min       time          prev_time    max
            //  |         |                |         |
            //  --------->o                x----------
            // all events between prev_time and max_time, not including prev_time
            // all events between min_time and time
            soundline.keyframe_array.forEach(function(sound_keyframe) {
              if (((anim.min_time <= sound_keyframe.time) && (sound_keyframe.time <= time)) ||
                ((prev_time < sound_keyframe.time) && (sound_keyframe.time <= anim.max_time))) {
                add_sound(sound_keyframe);
              }
            });
          } else {
            // min    prev_time           time      max
            //  |         |                |         |
            //            x--------------->o
            // all events between prev_time and time, not including prev_time
            soundline.keyframe_array.forEach(function(sound_keyframe) {
              if ((prev_time < sound_keyframe.time) && (sound_keyframe.time <= time)) {
                add_sound(sound_keyframe);
              }
            });
          }
        }
      });

      // process eventlines
      pose.event_array = [];
      anim.eventline_array.forEach(function(eventline) {
        function add_event (event_keyframe) {
          // console.log(prev_time, keyframe.time, time, "event", eventline.name);
          pose.event_array.push(eventline.name);
        }

        if (elapsed_time < 0) {
          if (wrapped_min) {
            // min    prev_time           time      max
            //  |         |                |         |
            //  ----------x                o<---------
            // all events between min_time and prev_time, not including prev_time
            // all events between max_time and time
            eventline.keyframe_array.forEach(function(event_keyframe) {
              if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < prev_time)) ||
                ((time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                add_event(event_keyframe);
              }
            });
          } else {
            // min       time          prev_time    max
            //  |         |                |         |
            //            o<---------------x
            // all events between time and prev_time, not including prev_time
            eventline.keyframe_array.forEach(function(event_keyframe) {
              if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
                add_event(event_keyframe);
              }
            });
          }
        } else {
          if (wrapped_max) {
            // min       time          prev_time    max
            //  |         |                |         |
            //  --------->o                x----------
            // all events between prev_time and max_time, not including prev_time
            // all events between min_time and time
            eventline.keyframe_array.forEach(function(event_keyframe) {
              if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= time)) ||
                ((prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                add_event(event_keyframe);
              }
            });
          } else {
            // min    prev_time           time      max
            //  |         |                |         |
            //            x--------------->o
            // all events between prev_time and time, not including prev_time
            eventline.keyframe_array.forEach(function(event_keyframe) {
              if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
                add_event(event_keyframe);
              }
            });
          }
        }
      });

      if (anim.meta) {
        // process tagline
        if (anim.meta.tagline) {
          const add_tag = function(tag_keyframe) {
            pose.tag_array = [];
            tag_keyframe.tag_array.forEach(function(tag) {
              const tag_def = pose.data.tag_def_array[tag.tag_def_index];
              pose.tag_array.push(tag_def.name);
            });
            pose.tag_array.sort();
            // console.log(prev_time, tag_keyframe.time, time, "tag", pose.tag_array);
          };

          if (elapsed_time < 0) {
            if (wrapped_min) {
              // min    prev_time           time      max
              //  |         |                |         |
              //  ----------x                o<---------
              // all events between min_time and prev_time, not including prev_time
              // all events between max_time and time
              anim.meta.tagline.keyframe_array.forEach(function(tag_keyframe) {
                if (((anim.min_time <= tag_keyframe.time) && (tag_keyframe.time < prev_time)) ||
                  ((time <= tag_keyframe.time) && (tag_keyframe.time <= anim.max_time))) {
                  add_tag(tag_keyframe);
                }
              });
            } else {
              // min       time          prev_time    max
              //  |         |                |         |
              //            o<---------------x
              // all events between time and prev_time, not including prev_time
              anim.meta.tagline.keyframe_array.forEach(function(tag_keyframe) {
                if ((time <= tag_keyframe.time) && (tag_keyframe.time < prev_time)) {
                  add_tag(tag_keyframe);
                }
              });
            }
          } else {
            if (wrapped_max) {
              // min       time          prev_time    max
              //  |         |                |         |
              //  --------->o                x----------
              // all events between prev_time and max_time, not including prev_time
              // all events between min_time and time
              anim.meta.tagline.keyframe_array.forEach(function(tag_keyframe) {
                if (((anim.min_time <= tag_keyframe.time) && (tag_keyframe.time <= time)) ||
                  ((prev_time < tag_keyframe.time) && (tag_keyframe.time <= anim.max_time))) {
                  add_tag(tag_keyframe);
                }
              });
            } else {
              // min    prev_time           time      max
              //  |         |                |         |
              //            x--------------->o
              // all events between prev_time and time, not including prev_time
              anim.meta.tagline.keyframe_array.forEach(function(tag_keyframe) {
                if ((prev_time < tag_keyframe.time) && (tag_keyframe.time <= time)) {
                  add_tag(tag_keyframe);
                }
              });
            }
          }
        }

        // process varlines
        pose.var_map = pose.var_map || {};
        anim.meta.varline_array.forEach(function(varline) {
          const keyframe_array = varline.keyframe_array;
          const keyframe_index1 = Keyframe.find(keyframe_array, time);
          if (keyframe_index1 !== -1) {
            const keyframe_index2 = (keyframe_index1 + 1) % keyframe_array.length;
            const keyframe1 = keyframe_array[keyframe_index1];
            const keyframe2 = keyframe_array[keyframe_index2];
            const time1 = keyframe1.time;
            let time2 = keyframe2.time;
            if (time2 < time1) { time2 = anim.length; }
            let pct = 0.0;
            if (time1 !== time2) {
              pct = (time - time1) / (time2 - time1);
              // TODO: pct = keyframe1.curve.evaluate(pct);
            }
            const var_def = entity.var_defs.var_def_array[varline.var_def_index];
            let val = 0;
            switch (var_def.type) {
            case 'int':
              val = 0 | tween(+keyframe1.val, +keyframe2.val, pct);
              break;
            case 'float':
              val = tween(+keyframe1.val, +keyframe2.val, pct);
              break;
            case 'string':
              val = keyframe1.val;
            }
            // console.log(prev_time, keyframe.time, time, "const", var_def.name, val, var_def.default_value);
            pose.var_map[var_def.name] = val;
          }
        });
      }
    }
  }
}
