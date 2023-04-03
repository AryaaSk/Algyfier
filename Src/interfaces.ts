interface Point {
    x: number | string;
    y: number | string;
}
interface PointConstraint {
    //p1 is horizontal to p2
    point1ID: string; //dependent
    point2ID: string; //independent
    relationship: "v" | "h"; //e.g. if relationship was vertical, point 2 must be vertical to point 1
    distance?: number;
}
interface Line {
    //ID: string; //always have capital p1 -> p2, (alphabetical order)
    point1ID: string;
    point2ID: string;
    gradient?: string; //if gradient is used then point2 will be overwritten

    //will be generated when initialising the line
    a: string;
    b: string;
    c: string;
    equation: string;
}
interface LineConstraint {
    //point must lie on line, will use x or y constraining depending on the situation
    lineID: string; 
    pointID: string;
    constraintType: "x" | "y";
}
interface Shape {
    type: "circle" | "rectangle"; //rectangle may be handled differently as it must control points rather than being defined implicitally
    pointIDs: string[];
    lineIDs: string[];

    data: (number | string)[]; //differet data assosiated with different shapes, e.g. for circle: [Cx, Cy, r]

    //Conventions:
    //Square/Rectangle: pointIDs: [independent (bottom left), bottom right, top right, top left], data: [height, width]
    //Circle [3 points]: pointIDs: [p1, p2, p3]
    //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
    //Circle [2 points which are diameter]: pointIDs: [p1, p2]
    //Circle [center and radius]: pointIDs: [C], data: [r]
    //Circle [center and point]: pointIDs: [C, p1]
    //Circle [center and tangent] (having got formula yet)
}

const Point = (x: number | string, y: number | string): Point => {
    return { x: x, y: y  };
}
const PointConstraint = (dependantPointID: string, independentPointID: string, relationship: "v" | "h", distance?: number): PointConstraint => {
    return { point1ID: dependantPointID, point2ID: independentPointID, relationship: relationship, distance: distance };
}
const Line = (point1ID: string, point2ID: string, gradient?: string): Line => {
    const line = { point1ID: point1ID, point2ID: point2ID, gradient: gradient, a: "", b: "", c: "", equation: "" };
    RecomputeLine(line);
    return line;
}
const LineConstraint = (lineID: string, pointID: string, constraintType: "x" | "y" ): LineConstraint => {
    return { lineID: lineID, pointID: pointID, constraintType: constraintType };
}
const Shape = (type: "circle" | "rectangle", pointIDs: string[], lineIDs: string[], data: (number | string)[]): Shape => {
    return { type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data };
}

//ID conventions
//Point: a
//Point constraint: - (when no distance) or S_{independent}{dependent}, e.g. S_{ab}
//Line: AB (alphabetical order) ot just A_ if you use a gradient (will generate another point with id as 'A')
//Line Constraint: - (array not dictionary)
//Shape: A (id doesn't matter if it is a polygon, if it is a circle then it will appear as "C_{A}")

//Shape definitions
//Square/Rectangle: pointIDs: [independent (bottom left), bottom right, top right, top left], data: [height, width]
//Circle [3 points]: pointIDs: [p1, p2, p3]
//Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
//Circle [2 points which are diameter]: pointIDs: [p1, p2]
//Circle [center and radius]: pointIDs: [C], data: [r]
//Circle [center and point]: pointIDs: [C, p1], data: ["center+point"]
//Circle [center and tangent] (having got formula yet)