let POINTS: { [id: string] : Point } = {};
let LINES: { [id: string] : Line } = {};
let SHAPES: { [id: string] : Shape } = {};

//Conventions
//Point: a
//Point constraint: - (when no distance) or S_{independent}{dependent}, e.g. S_{ab}
//Line: AB (alphabetical order) ot just A if defined with gradient
//Line Constraint: - (array not dictionary)
//Shape: A

let POINT_CONTRAINTS: PointConstraint[] = [];
let LINE_CONSTRAINTS: LineConstraint[] = [];

const RecomputeLine = (line: Line) => {
    const [x1, y1] = [`${line.point1ID}_{x}`, `${line.point1ID}_{y}`];
    const [x2, y2] = [`${line.point2ID}_{x}`, `${line.point2ID}_{y}`]; //if gradient is used to construct line, then this will be updated before the line is drawn

    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;

    const equation = `${a}x + ${b}y + ${c} = 0`;
    [line.a, line.b, line.c] = [a, b, c];
    line.equation = equation;
}



//NEED TO IMPLEMENT A SYSTEM WHERE USER CAN DRAG POINTS ON DESMOS, WHICH WILL UPDATE THEIR X AND Y VALUES ACCORDINGLY
//However should only update points which have independent x/y values, e.g. not points' x/y value which is controlled by a line
//This should be called everytime the user is about to make 'overriding changes', e.g. clicking 'update model' from UI
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

    /*
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

    LINES["A"] = Line("h", "", "5");
    */

    POINTS["a"] = Point(0, 10);
    LINES["A"] = Line("a", "", "5");

    //In future may also want to switch RenderScene() function from using reference values to deep copied values
    const expressions = RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator(expressions);
}
Main();

//TODO
//IMPLEMENT ALL CIRCLE CONSTRUCTIONS - done
//IMPLEMENT DEPENDENCY GRAPH FUNCTION - dont (but not tested)
//USE DEPENDENCY GRAPH TO CHECK FOR 'OVER-CONSTRAINING'
//Implment polygons (more than just 4 sides)

//Remove ids from objects (don't need as they are stored with id in dictionary)
//New line construction: Line with point and gradient (∆y and ∆x) - implementeted
//New line constraint: Constrain point to circle

//MOST IMPORTANTLY - NEED UI

//New line constraint: Place point in a ratio on a line from point a -> b
//Also need to add ability to calculate areas to actually solve the problems