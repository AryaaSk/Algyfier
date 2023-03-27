"use strict";
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
let POINTS = [];
let POINT_CONTRAINTS = [];
let LINES = [];
let LINE_CONSTRAINTS = [];
let SHAPES = [];
const Point = (ID, x, y) => {
    return { ID: ID, x: x, y: y };
};
const PointConstraint = (point1ID, point2ID, relationship) => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship };
};
const Line = (ID, point1ID, point2ID) => {
    const [x1, y1] = [`${point1ID}_{x}`, `${point1ID}_{y}`];
    const [x2, y2] = [`${point2ID}_{x}`, `${point2ID}_{y}`];
    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;
    const equation = `${a}x + ${b}y + ${c} = 0`;
    return { ID: ID, point1ID: point1ID, point2ID: point2ID, a: a, b: b, c: c, equation: equation };
};
//Continue to add the rest of constraints
//NEED TO IMPLEMENT DEPENDENCY MAP
const RenderScene = (points, pointConstraints, lines, LineConstraints, shapes) => {
    //need to add expressions in a specific order to avoid 'in terms of' error
    //points -> point constraints -> lines -> line constraints -> shapes
    //points: generate 2 variables for each point, point_x and point_y
    //BELOW IS WHERE WE NEED THE DEPENDENCY GRAPH
    //point constraints: use an external variable and write the dependant point in terms of the independant and the external variable
    //lines: already have equation, just plot line
    //line constraint: either lock points with y-coordiante or x-coorindate, will need to make a judgment later, then just replace the points_x/y with the line equation with their x/y counterpart substituted in
    //shape: for square, will need to consider this as a point constraint
    //       for circle, simply use information given an construct using points and/or line equations already calculated
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
    //EXPRESSIONS.push({ latex: 'y=x^2' }, { latex: "m = 0", sliderBounds: {min: 0, max: 10, step: 1} }, { latex: "x = m" });
    //NEED TO IMPLEMENT A SYSTEM WHERE USER CAN DRAG POINTS ON DESMOS, WHICH WILL UPDATE THEIR X AND Y VALUES ACCORDINGLY
    POINTS = [
        Point("a", 0, 100),
        Point("b", 100, 0)
    ];
    LINES = [
        Line("AB", "a", "b")
    ];
    RenderScene(POINTS, POINT_CONTRAINTS, LINES, LINE_CONSTRAINTS, SHAPES);
    UpdateCalculator(EXPRESSIONS);
};
Main();
