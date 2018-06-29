const math = require('mathjs')
const MathUtil = require('./MathUtil')

const DEFAULT_TOLERANCE = 0.1; // meters

function toRadians(degrees)
{
  let pi = math.PI;
  return degrees * (pi/180);
}

/**
 * Computes whether the given point lies on or near the edge of a polygon, within a specified
 * tolerance in meters. The polygon edge is composed of great circle segments if geodesic
 * is true, and of Rhumb segments otherwise. The polygon edge is implicitly closed -- the
 * closing segment between the first point and the last point is included.
 */
const isLocationOnEdge = (point, polygon, geodesic, tolerance) => {
    return isLocationOnEdgeOrPath(point, polygon, true, geodesic, tolerance);
}

const isLocationOnEdgeOrPath = (point, poly, closed, geodesic, toleranceEarth) => {
    var size = poly.length;
    if (size == 0) {
        return false;
    }
    let tolerance = toleranceEarth / MathUtil.EARTH_RADIUS;
    let havTolerance = MathUtil.hav(tolerance);
    let lat3 = toRadians(point.latitude);
    let lng3 = toRadians(point.longitude);
    let prev = poly[closed ? size - 1 : 0];
    let lat1 = toRadians(prev.latitude);
    let lng1 = toRadians(prev.longitude);
    if (geodesic) {
        for (i = 0; i < poly.length; i++){
            let point2 = poly[i];
            let lat2 = toRadians(point2.latitude);
            let lng2 = toRadians(point2.longitude);
            if (isOnSegmentGC(lat1, lng1, lat2, lng2, lat3, lng3, havTolerance)) {
                return true;
            }
            lat1 = lat2;
            lng1 = lng2;
        }
    } else {
        // We project the points to mercator space, where the Rhumb segment is a straight line,
        // and compute the geodesic distance between point3 and the closest point on the
        // segment. This method is an approximation, because it uses "closest" in mercator
        // space which is not "closest" on the sphere -- but the error is small because
        // "tolerance" is small.
        var minAcceptable = lat3 - tolerance;
        var maxAcceptable = lat3 + tolerance;
        var y1 = MathUtil.mercator(lat1);
        var y3 = MathUtil.mercator(lat3);
        var xTry = [];
        var point2 = null;
        for (i = 0; i < poly.length; i++){
            point2 = poly[i]
            var lat2 = toRadians(point2.latitude);
            var y2 = MathUtil.mercator(lat2);
            var lng2 = toRadians(point2.longitude);
            if (math.max(lat1, lat2) >= minAcceptable && math.min(lat1, lat2) <= maxAcceptable) {
                // We offset longitudes by -lng1; the implicit x1 is 0.
                let x2 = MathUtil.wrap(lng2 - lng1, -PI, PI);
                let x3Base = MathUtil.wrap(lng3 - lng1, -PI, PI);
                xTry[0] = x3Base;
                // Also explore wrapping of x3Base around the world in both directions.
                xTry[1] = x3Base + 2 * PI;
                xTry[2] = x3Base - 2 * PI;
                let x3 = null;
                for (j = 0; j < xTry.length; j++){
                    x3 = xTry[j]
                    let dy = y2 - y1;
                    let len2 = x2 * x2 + dy * dy;
                    let t = len2 <= 0 ? 0 : MathUtil.clamp((x3 * x2 + (y3 - y1) * dy) / len2, 0, 1);
                    let xClosest = t * x2;
                    let yClosest = y1 + t * dy;
                    let latClosest = MathUtil.inverseMercator(yClosest);
                    let havDist = MathUtil.havDistance(lat3, latClosest, x3 - xClosest);
                    if (havDist < havTolerance) {
                        return true;
                    }
                }
            }
            lat1 = lat2;
            lng1 = lng2;
            y1 = y2;
        };
    }
    return false;
}

/**
 * Returns sin(initial bearing from (lat1,lng1) to (lat3,lng3) minus initial bearing
 * from (lat1, lng1) to (lat2,lng2)).
 */
const sinDeltaBearing = (lat1, lng1, lat2, lng2, lat3, lng3) => {
    let sinLat1 = math.sin(lat1);
    let cosLat2 = math.cos(lat2);
    let cosLat3 = math.cos(lat3);
    let lat31 = lat3 - lat1;
    let lng31 = lng3 - lng1;
    let lat21 = lat2 - lat1;
    let lng21 = lng2 - lng1;
    let a = math.sin(lng31) * cosLat3;
    let c = math.sin(lng21) * cosLat2;
    let b = math.sin(lat31) + 2 * sinLat1 * cosLat3 * MathUtil.hav(lng31);
    let d = math.sin(lat21) + 2 * sinLat1 * cosLat2 * MathUtil.hav(lng21);
    let denom = (a * a + b * b) * (c * c + d * d);
    return denom <= 0 ? 1 : (a * d - b * c) / math.sqrt(denom);
}

const isOnSegmentGC = (lat1, lng1, lat2, lng2, lat3, lng3, havTolerance) => {
    let havDist13 = MathUtil.havDistance(lat1, lat3, lng1 - lng3);
    if (havDist13 <= havTolerance) {
        return true;
    }
    let havDist23 = MathUtil.havDistance(lat2, lat3, lng2 - lng3);
    if (havDist23 <= havTolerance) {
        return true;
    }
    let sinBearing = sinDeltaBearing(lat1, lng1, lat2, lng2, lat3, lng3);
    let sinDist13 = MathUtil.sinFromHav(havDist13);
    let havCrossTrack = MathUtil.havFromSin(sinDist13 * sinBearing);
    if (havCrossTrack > havTolerance) {
        return false;
    }
    let havDist12 = MathUtil.havDistance(lat1, lat2, lng1 - lng2);
    let term = havDist12 + havCrossTrack * (1 - 2 * havDist12);
    if (havDist13 > term || havDist23 > term) {
        return false;
    }
    if (havDist12 < 0.74) {
        return true;
    }
    let cosCrossTrack = 1 - 2 * havCrossTrack;
    let havAlongTrack13 = (havDist13 - havCrossTrack) / cosCrossTrack;
    let havAlongTrack23 = (havDist23 - havCrossTrack) / cosCrossTrack;
    let sinSumAlongTrack = MathUtil.sinSumFromHav(havAlongTrack13, havAlongTrack23);
    return sinSumAlongTrack > 0;  // Compare with half-circle == PI using sign of sin().
}

module.exports = PolyUtil = {isLocationOnEdge}
