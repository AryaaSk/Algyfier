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
//Continue to add the rest of constraints, and for line constraint, also construct line from 2 points using equation
const Main = () => {
    const options = {
        expressionsCollapsed: true,
        settingsMenu: false,
        zoomButtons: false,
        showGrid: false
    };
    const calculatorElement = document.getElementById("calculator");
    CALCULATOR = InitCalculator(calculatorElement, options);
    EXPRESSIONS.push({ latex: 'y=x^2' }, { latex: "m = 0", sliderBounds: { min: 0, max: 10, step: 1 } }, { latex: "x = m" });
    UpdateCalculator(EXPRESSIONS);
};
Main();
