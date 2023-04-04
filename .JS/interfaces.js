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
const Shape = (type, pointIDs, lineIDs, data) => {
    return { type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data };
};
//ID conventions
//Point: a
//Point constraint: - (when no distance) or S_{independent}{dependent}, e.g. S_{ab}
//Line: AB (alphabetical order) ot just A_ if you use a gradient (will generate another point with id as 'A')
//Line Constraint: - (array not dictionary)
//Shape: A (id doesn't matter if it is a polygon, if it is a circle then it will appear as "C_{A}")
//I had to use altered IDs for the shapes when outputting due to the newly formed point when creating a line with a gradient (the point is just the capital of p1, so it would interfere with the original shape ID)
//Shape definitions
//Square/Rectangle: pointIDs: [independent (bottom left), bottom right, top right, top left], data: [height, width]
//Circle [3 points]: pointIDs: [p1, p2, p3]
//Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
//Circle [2 points which are diameter]: pointIDs: [p1, p2]
//Circle [center and radius]: pointIDs: [C], data: [r]
//Circle [center and point]: pointIDs: [C, p1], data: ["center+point"]
//Circle [center and tangent] (having got formula yet)
