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
// I:L+L (id: I_{l1idl2id}) = Intersection between 2 lines, data: [l1ID, l2ID]
// I:I+C (id: I_{Cidlid}) = Intersection between circle and line, data: [CID, lID, sign?: 1 | -1]
// A:L (id: A_{lid}) = Integral under line, data: [lID, lim1, lim2]
// A:C (id: A_{Cid}) = Integral under circle, data: [CID, lim1, lim2, sign?: 1 | -1]
// P (id: P_{1|2|3...}) = Product between 2 other values, data: [id1, id2]
