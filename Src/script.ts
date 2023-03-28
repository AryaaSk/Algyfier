let POINTS: { [id: string] : Point } = {};
let LINES: { [id: string] : Line } = {};
let SHAPES: { [id: string] : Shape } = {};

let POINT_CONTRAINTS: PointConstraint[] = [];
let LINE_CONSTRAINTS: LineConstraint[] = [];

const DEPENDANCY_GRAPH: { [id: string] : string[] } = {}; //DEPENDANCY_GRAPH[id] returns a list of all objects id is dependent on

interface Point {
    ID: string;
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
    ID: string;
    point1ID: string;
    point2ID: string;

    //will be generated when initialising the line
    a: string;
    b: string;
    c: string;
    equation: string;
}
interface LineConstraint {
    lineID: string; //point must lie on line, will use x or y constraining depending on the situation
    pointID: string;
    constraintType: "x" | "y";
}
interface Shape {
    ID: string;
    type: "circle" | "square"; //square may be handled differently as it must control points rather than being defined implicitally
    pointIDs: string[];
    lineIDs: string[];

    data: number[]; //differet data assosiated with different shapes, e.g. for circle: [Cx, Cy, r]
}

const Point = (ID: string, x: number | string, y: number | string): Point => {
    return { ID: ID, x: x, y: y  };
}
const PointConstraint = (point1ID: string, point2ID: string, relationship: "v" | "h", distance?: number): PointConstraint => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship, distance: distance };
}
const Line = (ID: string, point1ID: string, point2ID: string): Line => {
    const line = { ID: ID, point1ID: point1ID, point2ID: point2ID,  a: "", b: "", c: "", equation: "" };
    RecomputeLine(line);
    return line;
}
const LineConstraint = (lineID: string, pointID: string, constraintType: "x" | "y" ): LineConstraint => {
    return { lineID: lineID, pointID: pointID, constraintType: constraintType };
}
const Shape = (ID: string, type: "circle" | "square", pointIDs: string[], lineIDs: string[], data: number[]): Shape => {
    return { ID: ID, type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data };
}


const RecomputeLine = (line: Line) => {
    const [x1, y1] = [`${line.point1ID}_{x}`, `${line.point1ID}_{y}`];
    const [x2, y2] = [`${line.point2ID}_{x}`, `${line.point2ID}_{y}`];

    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;
    const equation = `${a}x + ${b}y + ${c} = 0`;
    [line.a, line.b, line.c] = [a, b, c];
    line.equation = equation;
}



//NEED TO IMPLEMENT A SYSTEM WHERE USER CAN DRAG POINTS ON DESMOS, WHICH WILL UPDATE THEIR X AND Y VALUES ACCORDINGLY
//However should only update points which have independent x/y values, e.g. not points' x/y value which is controlled by a line
const UpdatePoints = () => {
    //reads data from calculator, and updates x and y values of points
    const data = CALCULATOR.getExpressions();
    for (const expression of data) {
        const id = expression.id!;
        const point = POINTS[id];
        if (point != undefined) {
            //we know the id from desmos is definetly a point, get x and y value of point from desmos
            //however we only want to alter points' x/y value if it is independent, which will be clear by checking whether the x or y value of the point is a number or string
            if (isNaN(<any>(point.x))) {
                const desmosX = Number((<any>CALCULATOR.expressionAnalysis[id + "_{x}"]).evaluation.value);
                point.x = desmosX;
            }
            if ((isNaN(<any>(point.y)))) {
                const desmosY = Number((<any>CALCULATOR.expressionAnalysis[id + "_{y}"]).evaluation.value);
                point.y = desmosY
            }
        }
    }

    console.log(POINTS);
}





let CALCULATOR: Desmos.Calculator;
let EXPRESSIONS: Desmos.ExpressionState[] = [];

const InitCalculator = (element: HTMLElement, options: { [k : string] : boolean }) => {
    const calculator = Desmos.GraphingCalculator(element, options);
    const state = calculator.getState();
    calculator.setDefaultState(state);
    return calculator;
}

const UpdateCalculator = (expressions: Desmos.ExpressionState[]) => {
    const expression_states = CALCULATOR.getExpressions();
    CALCULATOR.removeExpressions(expression_states); //clear old expressions
    CALCULATOR.setExpressions(expressions); //add new ones
}

//NEED TO IMPLEMENT DEPENDENCY MAP
const RenderScene = (points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
    //need to add expressions in a specific order to avoid 'in terms of' error
    //points -> point constraints -> lines -> line constraints -> shapes

    EXPRESSIONS = [];
    //before rendering scene, we need to make sure all constraints are in place
    //Since I am directly modifying the points dictionary, this may cause some reference value issues, however as long as the constraints are correct, then it is 'controlled-overwriting'
    //CONSTRAINTS OVERWRITE DIRECT VALUES/EQUATIONS

    //point constraints: write the dependant point in terms of the independant point
    for (const constraint of pointConstraints) {
        const dependentID = constraint.point1ID;
        const independantID = constraint.point2ID;

        //if there is also an assosiated distance then the dependent point has no freedom - use external variable to dictate the position of dependent point
        const distance = constraint.distance;
        const id = constraint.relationship + `_{${dependentID}${independantID}}`;

        const dependentPoint = points[dependentID];
        if (constraint.relationship == "v") {
            dependentPoint.x = `${independantID}_{x}`;
            if (distance != undefined) {
                dependentPoint.y = `${independantID}_{y} + ${id}`
            }
        }
        else if (constraint.relationship == "h") {
            dependentPoint.y = `${independantID}_{y}`;
            if (distance != undefined) {
                dependentPoint.x = `${independantID}_{x} + ${id}`
            }
        }

        if (distance != undefined) {
            const externalVariable: Desmos.ExpressionState = { id: id, latex: `${id} = ${distance!}` };
            EXPRESSIONS.push(externalVariable);
        }
    }
    //then squares/rectangles are just special cases of point constraints, where you just 'lock' all constraints in terms of 1 or 2 variables

    //line constraint: either lock points with y-coordiante or x-coorindate, will need to make a judgment later, then just replace the points_x/y with the line equation with their x/y counterpart substituted in
    for (const constraint of lineConstraints) {
        const dependent = constraint.constraintType;
        const point = points[constraint.pointID];
        const line = lines[constraint.lineID];
        const [px, py] = [point.ID + "_{x}", point.ID + "_{y}"];

        //need to rearrange equation for x or y
        const [a, b, c] = [line.a, line.b, line.c];
        if (dependent == "x") {
            const newEquation = `(-${c} - ${b}${py})/${a}`
            point.x = newEquation;
        }
        if (dependent == "y") {
            const newEquation = `(-${c} - ${a}${px})/${b}`
            point.y = newEquation;
        }
    }


    //points: generate 2 variables for each point, point_x and point_y
    for (const id in points) {
        const point = points[id];
        const x = point.x ? point.x : 0;
        const y = point.y ? point.y : 0

        const pX: Desmos.ExpressionState = { id: `${id}_{x}`, latex: `${id}_{x} = ${x}` };
        const pY: Desmos.ExpressionState = { id: `${id}_{y}`, latex: `${id}_{y} = ${y}` };
        const p: Desmos.ExpressionState = { id: id, latex: `${id} = (${id}_{x}, ${id}_{y})`, label: id, showLabel: true };
        EXPRESSIONS.push(p, pX, pY);
    }

    //lines: already have equation, just plot line
    for (const id in lines) {
        const line = lines[id];
        const equation = line.equation;
        const l: Desmos.ExpressionState = { id: id, latex: equation };
        EXPRESSIONS.push(l);
    }

    //shape: for square, will need to consider this as a point constraint
    //       for circle, simply use information given an construct using points and/or line equations already calculated

    console.log(EXPRESSIONS);
}





const Main = () => {
    const options = {
        expressionsCollapsed: true,
        settingsMenu: false,
        zoomButtons: false,
        showGrid: false
    };

    const calculatorElement = document.getElementById("calculator")!;
    CALCULATOR = InitCalculator(calculatorElement, options);

    document.onkeydown = ($e) => {
        const key = $e.key.toLowerCase();
        if (key == " ") {
            UpdatePoints();
        }
    }

    //EXPRESSIONS.push({ latex: 'y=x^2' }, { latex: "m = 0", sliderBounds: {min: 0, max: 10, step: 1} }, { latex: "x = m" });

    //Formats:
    //Point: a
    //Point constraint: abV or abH
    //Line: AB
    //Line Constraint: ABa
    //Shape: A

    POINTS["a"] = Point("a", 0, 10);
    DEPENDANCY_GRAPH["a"] = []; //always add to dependency graph when adding to an array

    POINTS["b"] = Point("b", 10, 0);
    DEPENDANCY_GRAPH["b"] = []

    LINES["AB"] = Line("AB", "a", "b");
    DEPENDANCY_GRAPH["AB"] = ["a", "b"];

    POINTS["c"] = Point("c", 5, "");
    DEPENDANCY_GRAPH["c"] = [];
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));
    DEPENDANCY_GRAPH["c"].push("AB");

    POINTS["d"] = Point("d", "", "");
    DEPENDANCY_GRAPH["d"] = [];
    POINT_CONTRAINTS.push(PointConstraint("d", "a", "h")); //inconsistencies arise when you try and supply too many constraints, e.g. a H and V to 2 points, but then also a distance from one point
    DEPENDANCY_GRAPH["d"].push("a")
    POINT_CONTRAINTS.push(PointConstraint("d", "b", "v"));
    DEPENDANCY_GRAPH["d"].push("b")

    RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);

    UpdateCalculator(EXPRESSIONS);
}
Main();