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



let POINTS: Point[] = [];
let POINT_CONTRAINTS: PointConstraint[] = [];
let LINES: Line[] = [];
let LINE_CONSTRAINTS: LineConstraint[] = [];
let SHAPES: Shape[] = [];

interface Point {
    ID: string;
    x?: number;
    y?: number;
}
interface PointConstraint {
    point1ID: string;
    point2ID: string;
    relationship: "vertical" | "horizontal"; //e.g. if relationship was vertical, point 2 must be vertical to point 1
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
    pointID: string;
    lineID: string; //point must lie on line, will use x or y constraining depending on the situation
}
interface Shape {
    ID: string;
    type: "circle" | "square"; //square may be handled differently as it must control points rather than being defined implicitally
    pointIDs: string[];
    lineIDs: string[];

    data: number[]; //differet data assosiated with different shapes, e.g. for circle: [Cx, Cy, r]
}

const Point = (ID: string, x?: number, y?: number): Point => {
    return { ID: ID, x: x, y: y  };
}
const PointConstraint = (point1ID: string, point2ID: string, relationship: "vertical" | "horizontal"): PointConstraint => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship };
}
const Line = (ID: string, point1ID: string, point2ID: string): Line => {
    const [x1, y1] = [`${point1ID}_{x}`, `${point1ID}_{y}`];
    const [x2, y2] = [`${point2ID}_{x}`, `${point2ID}_{y}`];

    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;
    const equation = `${a}x + ${b}y + ${c} = 0`;
    return { ID: ID, point1ID: point1ID, point2ID: point2ID, a: a, b: b, c: c, equation: equation };
}
//Continue to add the rest of constraints



//NEED TO IMPLEMENT DEPENDENCY MAP
const RenderScene = (points: Point[], pointConstraints: PointConstraint[], lines: Line[], LineConstraints: LineConstraint[], shapes: Shape[]) => {
    //need to add expressions in a specific order to avoid 'in terms of' error
    //points -> point constraints -> lines -> line constraints -> shapes

    //points: generate 2 variables for each point, point_x and point_y

    //BELOW IS WHERE WE NEED THE DEPENDENCY GRAPH
    //point constraints: use an external variable and write the dependant point in terms of the independant and the external variable

    //lines: already have equation, just plot line

    //line constraint: either lock points with y-coordiante or x-coorindate, will need to make a judgment later, then just replace the points_x/y with the line equation with their x/y counterpart substituted in

    //shape: for square, will need to consider this as a point constraint
    //       for circle, simply use information given an construct using points and/or line equations already calculated
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
}
Main();