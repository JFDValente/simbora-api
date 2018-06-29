const math = require('mathjs');

/**
 * The earth's radius, in meters.
 * Mean radius as defined by IUGG.
 */
const EARTH_RADIUS = 6371009

/**
 * Restrict x to the range [low, high].
 */
const clamp = (x, low, high) => {
    return x < low ? low : (x > high ? high : x);
}

/**
 * Wraps the given value into the inclusive-exclusive interval between min and max.
 * @param n   The value to wrap.
 * @param min The minimum.
 * @param max The maximum.
 */
const wrap = (n, min, max) => {
    return (n >= min && n < max) ? n : (math.mod(n - min, max - min) + min);
}

/**
 * Returns the non-negative remainder of x / m.
 * @param x The operand.
 * @param m The modulus.
 */
const mod = (x, m) => {
    return ((x % m) + m) % m;
}

/**
 * Returns mercator Y corresponding o latitude.
 * See http://en.wikipedia.org/wiki/Mercator_projection .
 */
const mercator = (lat) => {
    return math.log(math.tan(lat * 0.5 + math.PI/4));
}

/**
 * Returns latitude from mercator Y.
 */
const inverseMercator = (y) => {
    return 2 * math.atan(math.exp(y)) - math.PI / 2;
}

/**
 * Returns haversine(angle-in-radians).
 * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
 */
const hav = (x) => {
    let sinHalf = math.sin(x * 0.5);
    return sinHalf * sinHalf;
}

/**
 * Computes inverse haversine. Has good numerical stability around 0.
 * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
 * The argument must be in [0, 1], and the result is positive.
 */
const arcHav = (x) => {
    return 2 * math.asin(math.sqrt(x));
}

// Given h==hav(x), returns sin(abs(x)).
const sinFromHav = (h) => {
    return 2 * math.sqrt(h * (1 - h));
}

// Returns hav(asin(x)).
const havFromSin = (x) => {
    let x2 = x * x;
    return x2 / (1 + math.sqrt(1 - x2)) * 0.5;
}

// Returns sin(arcHav(x) + arcHav(y)).
const sinSumFromHav = (x, y) => {
    let a = math.sqrt(x * (1 - x));
    let b = math.sqrt(y * (1 - y));
    return 2 * (a + b - 2 * (a * y + b * x));
}

/**
 * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
 */
const havDistance = (lat1, lat2, dLng) => {
    return hav(lat1 - lat2) + hav(dLng) * math.cos(lat1) * math.cos(lat2);
}

module.exports = MathUtil = {
    EARTH_RADIUS,
    clamp,
    wrap,
    mod,
    mercator,
    inverseMercator,
    hav,
    arcHav,
    sinFromHav,
    havFromSin,
    sinSumFromHav,
    havDistance
}
