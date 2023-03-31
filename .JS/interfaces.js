"use strict";
const Point = (x, y) => {
    return { x: x, y: y };
};
const PointConstraint = (point1ID, point2ID, relationship, distance) => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship, distance: distance };
};
const Line = (point1ID, point2ID, gradient) => {
    const line = { point1ID: point1ID, point2ID: point2ID, gradient: gradient, a: "", b: "", c: "", equation: "" };
    RecomputeLine(line);
    return line;
};
const LineConstraint = (lineID, pointID, constraintType) => {
    return { lineID: lineID, pointID: pointID, constraintType: constraintType };
};
const Shape = (type, pointIDs, lineIDs, data) => {
    return { type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data };
};
