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

const Point = (ID: string, x?: number, y?: number) => {
    return { ID: ID, x: x, y: y  };
}
const PointConstraint = (point1ID: string, point2ID: string, relationship: "vertical" | "horizontal") => {
    return { point1ID: point1ID, point2ID: point2ID, relationship: relationship };
}
//Continue to add the rest of constraints, and for line constraint, also construct line from 2 points using equation



const Main = () => {
    const options = {
        expressionsCollapsed: true,
        settingsMenu: false,
        zoomButtons: false,
        showGrid: false
    };

    const calculatorElement = document.getElementById("calculator")!;
    CALCULATOR = InitCalculator(calculatorElement, options);

    EXPRESSIONS.push({ latex: 'y=x^2' }, { latex: "m = 0", sliderBounds: {min: 0, max: 10, step: 1} }, { latex: "x = m" });
    UpdateCalculator(EXPRESSIONS);
}
Main();