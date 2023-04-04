"use strict";
let POINTS = {};
let LINES = {};
let SHAPES = {};
let POINT_CONTRAINTS = [];
let LINE_CONSTRAINTS = [];
//NEED TO IMPLEMENT A SYSTEM WHERE USER CAN DRAG POINTS ON DESMOS, WHICH WILL UPDATE THEIR X AND Y VALUES ACCORDINGLY
//However should only update points which have independent x/y values, e.g. not points' x/y value which is controlled by a line
//This should be called everytime the user is about to make 'overriding changes', e.g. clicking 'update model' from UI
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
    //Also need to get gradient data and update on the corresponding line generated with a gradient
};
let CALCULATOR;
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
    POINTS["a"] = Point(0, 10);
    POINTS["b"] = Point(10, 0);
    LINES["AB"] = Line("a", "b");
    POINTS["c"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));
    POINTS["d"] = Point("", "");
    POINT_CONTRAINTS.push(PointConstraint("d", "a", "h")); //inconsistencies arise when you try and supply too many constraints, e.g. a H and V to 2 points, but then also a distance from one point
    POINT_CONTRAINTS.push(PointConstraint("d", "b", "v"));
    //Square
    //Values given in Point() construction will be overwritten by constraints anyway
    POINTS["h"] = Point(0, 0);
    POINTS["j"] = Point(0, 0);
    POINTS["k"] = Point(0, 0);
    POINTS["l"] = Point(0, 0);
    SHAPES["A"] = Shape("rectangle", ["h", "j", "k", "l"], [], [3, 3]);
    //Circles
    SHAPES["B"] = Shape("circle", ["b", "c", "d"], [], []);
    SHAPES["C"] = Shape("circle", ["k", "a"], ["JK"], []);
    SHAPES["D"] = Shape("circle", ["a", "h"], [], []);
    SHAPES["E"] = Shape("circle", ["b"], [], [5]);
    SHAPES["F"] = Shape("circle", ["h", "l"], [], ["center+point"]);
    LINES["A_"] = Line("a", "", "5");
    POINTS["f"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("A_", "f", "y"));
    /*
    //Testing line constructed with point + gradient, to check if it interferes with a shape with the same ID
    POINTS["a"] = Point(0, 0);
    POINTS["b"] = Point(-5, 10);
    LINES["A_"] = Line("a", "", "5");

    SHAPES["A"] = Shape('circle', ["a", "b"], ["A_"], []);

    POINTS["c"] = Point(5, "");
    LINE_CONSTRAINTS.push(LineConstraint("A_", "c", "y"));
    */
    /*
    POINTS["a"] = Point(-2, 0);
    POINTS["b"] = Point("", "");
    POINT_CONTRAINTS.push(PointConstraint("b", "a", "h", 6));
    LINES["AB"] = Line("a", "b");

    POINTS["c"] = Point(0, "");
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));

    POINTS["d"] = Point("", "");
    POINT_CONTRAINTS.push(PointConstraint("d", "c", "v", 2));

    LINES["AD"] = Line("a", "d");
    LINES["BD"] = Line("b", "d");
    */
    //Ideal values of C_x: -1.2360679776 (gradient close to -1) or 3.2360679775 (gradient = -1)
    //In future may also want to switch RenderScene() function from using reference values to deep copied values
    const expressions = RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator(expressions);
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
