"use strict";
const Point = (x, y) => {
    return { x: x, y: y };
};
const PointConstraint = (dependantPointID, independentPointID, relationship, distance) => {
    return { point1ID: dependantPointID, point2ID: independentPointID, relationship: relationship, distance: distance };
};
const Line = (point1ID, point2ID, gradient) => {
    const line = { point1ID: point1ID, point2ID: point2ID, gradient: gradient, a: "", b: "", c: "", equation: "" };
    RecomputeLine(line);
    return line;
};
const LineConstraint = (lineID, pointID, constraintType) => {
    return { lineID: lineID, pointID: pointID, constraintType: constraintType };
};
const Shape = (type, pointIDs, lineIDs, data, construction) => {
    return { type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data, construction: construction };
};
//Helper definitions
// I:L+L = Intersection between 2 lines, data: [l1ID, l2ID]
// I:I+C = Intersection between circle and line, data: [CID, lID, sign?: 1 | -1]
// A:L = Integral under line, data: [lID, lim1, lim2]
// A:C = Integral under circle, data: [CID, lim1, lim2, sign?: 1 | -1]
// M = Gradient between 2 points: data, [p1ID, p2ID]
