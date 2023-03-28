"use strict";
let POINTS = {};
let LINES = {};
let SHAPES = {};
let POINT_CONTRAINTS = [];
let LINE_CONSTRAINTS = [];
const DEPENDANCY_GRAPH = {}; //DEPENDANCY_GRAPH[id] returns a list of all objects id is dependent on
const Point = (ID, x, y) => {
    return { ID: ID, x: x, y: y };
};
const PointConstraint = (point1ID, point2ID, relationship) => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship };
};
const Line = (ID, point1ID, point2ID) => {
    const line = { ID: ID, point1ID: point1ID, point2ID: point2ID, a: "", b: "", c: "", equation: "" };
    RecomputeLine(line);
    return line;
};
const LineConstraint = (lineID, pointID, constraintType) => {
    return { lineID: lineID, pointID: pointID, constraintType: constraintType };
};
const Shape = (ID, type, pointIDs, lineIDs, data) => {
    return { ID: ID, type: type, pointIDs: pointIDs, lineIDs: lineIDs, data: data };
};
const RecomputeLine = (line) => {
    const [x1, y1] = [`${line.point1ID}_{x}`, `${line.point1ID}_{y}`];
    const [x2, y2] = [`${line.point2ID}_{x}`, `${line.point2ID}_{y}`];
    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;
    const equation = `${a}x + ${b}y + ${c} = 0`;
    [line.a, line.b, line.c] = [a, b, c];
    line.equation = equation;
};
//NEED TO IMPLEMENT A SYSTEM WHERE USER CAN DRAG POINTS ON DESMOS, WHICH WILL UPDATE THEIR X AND Y VALUES ACCORDINGLY
//However should only update points which have independent x/y values, e.g. not points' x/y value which is controlled by a line
const UpdatePoints = () => {
    //reads data from calculator, and updates x and y values of points
    const data = CALCULATOR.getExpressions();
    for (const expression of data) {
        const id = expression.id;
        const point = POINTS[id];
        if (point != undefined) {
            //we know the id from desmos is definetly a point, get x and y value of point from desmos
            //however we only want to alter points' x/y value if it is independent, which will be clear by checking whether the x or y value of the point is a number or string
            if (isNaN((point.x))) {
                const desmosX = Number(CALCULATOR.expressionAnalysis[id + "_{x}"].evaluation.value);
                point.x = desmosX;
            }
            if ((isNaN((point.y)))) {
                const desmosY = Number(CALCULATOR.expressionAnalysis[id + "_{y}"].evaluation.value);
                point.y = desmosY;
            }
        }
    }
    console.log(POINTS);
};
let CALCULATOR;
let EXPRESSIONS = [];
const InitCalculator = (element, options) => {
    const calculator = Desmos.GraphingCalculator(element, options);
    const state = calculator.getState();
    calculator.setDefaultState(state);
    return calculator;
};
const UpdateCalculator = (expressions) => {
    const expression_states = CALCULATOR.getExpressions();
    CALCULATOR.removeExpressions(expression_states); //clear old expressions
    CALCULATOR.setExpressions(expressions); //add new ones
};
//NEED TO IMPLEMENT DEPENDENCY MAP
const RenderScene = (points, lines, shapes, pointConstraints, lineConstraints) => {
    //need to add expressions in a specific order to avoid 'in terms of' error
    //points -> point constraints -> lines -> line constraints -> shapes
    EXPRESSIONS = [];
    //before rendering scene, we need to make sure all constraints are in place
    //Since I am directly modifying the points dictionary, this may cause some reference value issues, however as long as the constraints are correct, then it is 'controlled-overwriting'
    //point constraints: use an external variable and write the dependant point in terms of the independant and the external variable
    for (const constraint of pointConstraints) {
        //e.g. p1 is horizontal to p2 -> p2 is independent, p1 is dependent
        const dependentID = constraint.point1ID;
        const independantID = constraint.point2ID;
        //const id = constraint.relationship + `_{${dependentID}${independantID}}`;
        const dependentPoint = points[dependentID];
        if (constraint.relationship == "v") {
            dependentPoint.x = `${independantID}_{x}`;
        }
        else if (constraint.relationship == "h") {
            dependentPoint.y = `${independantID}_{y}`;
        }
        //const baseValue = 5;
        //const externalVariable: Desmos.ExpressionState = { id: id, latex: `${id} = ${baseValue}` };
        //EXPRESSIONS.push(externalVariable);
    }
    //then squares/rectangles are just special cases of point constraints, where you just 'lock' all constraints in terms of 1 or 2 variables
    //JUST REALISED THAT I DON'T NEED TO HAVE AN EXTERNAL VARIABLE FOR REGULAR POINT CONSTRAINTS    
    //line constraint: either lock points with y-coordiante or x-coorindate, will need to make a judgment later, then just replace the points_x/y with the line equation with their x/y counterpart substituted in
    for (const constraint of lineConstraints) {
        const dependent = constraint.constraintType;
        const point = points[constraint.pointID];
        const line = lines[constraint.lineID];
        const [px, py] = [point.ID + "_{x}", point.ID + "_{y}"];
        //need to rearrange equation for x or y
        const [a, b, c] = [line.a, line.b, line.c];
        if (dependent == "x") {
            const newEquation = `(-${c} - ${b}${py})/${a}`;
            point.x = newEquation;
        }
        if (dependent == "y") {
            const newEquation = `(-${c} - ${a}${px})/${b}`;
            point.y = newEquation;
        }
    }
    //points: generate 2 variables for each point, point_x and point_y
    for (const id in points) {
        const point = points[id];
        const x = point.x ? point.x : 0;
        const y = point.y ? point.y : 0;
        const pX = { id: `${id}_{x}`, latex: `${id}_{x} = ${x}` };
        const pY = { id: `${id}_{y}`, latex: `${id}_{y} = ${y}` };
        const p = { id: id, latex: `${id} = (${id}_{x}, ${id}_{y})`, label: id, showLabel: true };
        EXPRESSIONS.push(p, pX, pY);
    }
    //lines: already have equation, just plot line
    for (const id in lines) {
        const line = lines[id];
        const equation = line.equation;
        const l = { id: id, latex: equation };
        EXPRESSIONS.push(l);
    }
    //shape: for square, will need to consider this as a point constraint
    //       for circle, simply use information given an construct using points and/or line equations already calculated
    console.log(EXPRESSIONS);
};
const Main = () => {
    const options = {
        expressionsCollapsed: true,
        settingsMenu: false,
        zoomButtons: false,
        showGrid: false
    };
    const calculatorElement = document.getElementById("calculator");
    CALCULATOR = InitCalculator(calculatorElement, options);
    document.onkeydown = ($e) => {
        const key = $e.key.toLowerCase();
        if (key == " ") {
            UpdatePoints();
        }
    };
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
    DEPENDANCY_GRAPH["b"] = [];
    LINES["AB"] = Line("AB", "a", "b");
    DEPENDANCY_GRAPH["AB"] = ["a", "b"];
    POINTS["c"] = Point("c", 5, "");
    DEPENDANCY_GRAPH["c"] = [];
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));
    DEPENDANCY_GRAPH["c"].push("AB");
    POINTS["d"] = Point("d", "", "");
    DEPENDANCY_GRAPH["d"] = [];
    POINT_CONTRAINTS.push(PointConstraint("d", "a", "h"));
    DEPENDANCY_GRAPH["d"].push("a");
    POINT_CONTRAINTS.push(PointConstraint("d", "b", "v"));
    DEPENDANCY_GRAPH["d"].push("b");
    RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator(EXPRESSIONS);
};
Main();
