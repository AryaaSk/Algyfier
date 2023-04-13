"use strict";
let POINTS = {};
let LINES = {};
let SHAPES = {};
let POINT_CONSTRAINTS = [];
let LINE_CONSTRAINTS = [];
let CALCULATOR;
const InitCalculator = (element, options) => {
    const calculator = Desmos.GraphingCalculator(element, options);
    const state = calculator.getState();
    calculator.setDefaultState(state);
    return calculator;
};
const UpdateCalculator = () => {
    const [externalVariables, expressions] = RenderScene(POINTS, LINES, SHAPES, POINT_CONSTRAINTS, LINE_CONSTRAINTS);
    const helperExpressions = HelperExpressions();
    UpdateCalculatorState(externalVariables, expressions, helperExpressions);
};
const UpdateCalculatorState = (externalVariables, expressions, helperExpressions) => {
    const expression_states = CALCULATOR.getExpressions();
    CALCULATOR.removeExpressions(expression_states); //clear old expressions
    CALCULATOR.setExpressions(externalVariables);
    CALCULATOR.setExpressions(helperExpressions);
    CALCULATOR.setExpressions(expressions);
};
const UpdateDataFromCalculator = () => {
    const data = CALCULATOR.getExpressions();
    for (const expression of data) {
        const id = expression.id;
        const point = POINTS[id];
        if (point != undefined) {
            //we know the id from desmos is definetly a point, get x and y value of point from desmos
            //however we only want to alter points' x/y value if it is independent, which will be clear by checking whether the x or y value of the point is a number or string
            if (!isNaN((point.x))) {
                const desmosX = Number(CALCULATOR.expressionAnalysis[id + "_{x}"].evaluation.value);
                point.x = desmosX;
            }
            if (!isNaN((point.y))) {
                const desmosY = Number(CALCULATOR.expressionAnalysis[id + "_{y}"].evaluation.value);
                point.y = desmosY;
            }
        }
        else if (id[0] == "M") { //gradient
            const pointIDUpper = id.split("{")[1].split("}").join("");
            const lineID = pointIDUpper + "_";
            const newGradient = Number(CALCULATOR.expressionAnalysis[id].evaluation.value);
            const line = LINES[lineID];
            line.gradient = newGradient;
        }
        else if (id[0] == "S") { //point constraint
            const [independantID, depdendentID] = id.split("{")[1].split("}").join("").toLowerCase().split("");
            const newValue = Number(CALCULATOR.expressionAnalysis[id].evaluation.value);
            //currently we don't know if this is a point constraint simply between 2 points or a shape
            //check if this is a point constraint, if not then it must be a shape
            let wasPointConstraint = false;
            for (const pointConstraint of POINT_CONSTRAINTS) {
                if (pointConstraint.point1ID == depdendentID && pointConstraint.point2ID == independantID) {
                    pointConstraint.distance = newValue;
                    wasPointConstraint = true;
                }
            }
            //find the corresponding shape if it wasn't a point constraint
            if (wasPointConstraint == false) {
                for (const id in SHAPES) {
                    const shape = SHAPES[id];
                    if (shape.type == "rectangle") {
                        const shapeIndependentPoint = shape.pointIDs[0];
                        //could be the height or width, pointIds[1] will be width, pointIds[3] will be height
                        const shapeWidthPoint = shape.pointIDs[1];
                        const shapeHeightPoint = shape.pointIDs[3];
                        //data[0] = height, data[1] = width 
                        if (independantID == shapeIndependentPoint && depdendentID == shapeWidthPoint) {
                            shape.data[1] = newValue;
                        }
                        else if (independantID == shapeIndependentPoint && depdendentID == shapeHeightPoint) {
                            shape.data[0] = newValue;
                        }
                    }
                }
            }
        }
        else if (id[0] == "C" && id.endsWith("r}")) {
            const newValue = Number(CALCULATOR.expressionAnalysis[id].evaluation.value);
            const circleID = id.split("{")[1].split("r}").join("");
            const circle = SHAPES[circleID];
            //circle's radius, now check if it's constructed with center + radius
            if (circle.construction == "C+R") {
                circle.data[0] = newValue;
            }
        }
    }
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
    /*
    POINTS["a"] = Point(0, 10);
    POINTS["b"] = Point(10, 0);

    LINES["AB"] = Line("a", "b");

    POINTS["c"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));

    POINTS["d"] = Point("", "");
    POINT_CONSTRAINTS.push(PointConstraint("d", "a", "h")); //inconsistencies arise when you try and supply too many constraints, e.g. a H and V to 2 points, but then also a distance from one point
    POINT_CONSTRAINTS.push(PointConstraint("d", "b", "v"));

    //Square
    //Values given in Point() construction will be overwritten by constraints anyway
    POINTS["h"] = Point(0, 0);
    POINTS["j"] = Point(0, 0);
    POINTS["k"] = Point(0, 0);
    POINTS["l"] = Point(0, 0);

    SHAPES["A"] = Shape("rectangle", ["h", "j", "k", "l"], [], [3, 3]);

    //Circles
    SHAPES["B"] = Shape("circle", ["b", "c", "d"], [], [], "3P");
    SHAPES["C"] = Shape("circle", ["k", "a"], ["JK"], [], "2P+T");
    SHAPES["D"] = Shape("circle", ["a", "h"], [], [], "2PD");
    SHAPES["E"] = Shape("circle", ["b"], [], [5], "C+R");
    SHAPES["F"] = Shape("circle", ["h", "l"], [], [], "C+P");

    LINES["A_"] = Line("a", "", 5);
    POINTS["f"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("A_", "f", "y"));
    */
    /*
    //Testing line constructed with point + gradient, to check if it interferes with a shape with the same ID
    POINTS["a"] = Point(0, 0);
    POINTS["b"] = Point(-5, 10);
    LINES["A_"] = Line("a", "", 5);

    SHAPES["A"] = Shape('circle', ["a", "b"], ["A_"], []);

    POINTS["c"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("A_", "c", "y"));
    */
    POINTS["a"] = Point(-2, 0);
    POINTS["b"] = Point("", "");
    POINT_CONSTRAINTS.push(PointConstraint("b", "a", "h", 6));
    LINES["AB"] = Line("a", "b");
    POINTS["c"] = Point(0, "");
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));
    POINTS["d"] = Point("", "");
    POINT_CONSTRAINTS.push(PointConstraint("d", "c", "v", 2));
    LINES["AD"] = Line("a", "d");
    LINES["BD"] = Line("b", "d");
    //Ideal values of C_x: -1.2360679776 (gradient close to -1) or 3.2360679775 (gradient = -1)
    /*
    //Testing point constraint and rectangle binding
    POINTS["h"] = Point(0, 0);
    POINTS["j"] = Point("", "");
    POINTS["k"] = Point("", "");
    POINTS["l"] = Point("", "");
    SHAPES["A"] = Shape("rectangle", ["h", "j", "k", "l"], [], [3, 3]);

    POINTS["a"] = Point("", "");
    POINT_CONSTRAINTS.push(PointConstraint("a", "h", "h", 5));
    */
    AttachListeners();
    UpdateUI();
};
Main();
//TODO
//IMPLEMENT ALL CIRCLE CONSTRUCTIONS - done
//IMPLEMENT DEPENDENCY GRAPH FUNCTION - dont (but not tested)
//USE DEPENDENCY GRAPH TO CHECK FOR 'OVER-CONSTRAINING'
//Implment polygons (more than just 4 sides)
//Remove ids from objects (don't need as they are stored with id in dictionary)
//New line construction: Line with point and gradient (∆y and ∆x) - implementeted
//New line constraint: Constrain point to circle -> Cannot implement this as it goes against the original idea of dependency: points -> lines -> shapes (excludes squares/rectangles since those are simply more point constraints)
//MOST IMPORTANTLY - NEED UI
//New line constraint: Place point in a ratio on a line from point a -> b
//Checking to actually solve the problem:
//Add a function which takes 1 variable to change, and tries to match an output variable to a specific value
//Show gradient of line generated by 2 points
//Add ability to calculate distance between 2 points
//Also need to add ability to calculate areas (probably using integrals)
