let POINTS: { [id: string] : Point } = {};
let LINES: { [id: string] : Line } = {};
let SHAPES: { [id: string] : Shape } = {};

let POINT_CONTRAINTS: PointConstraint[] = [];
let LINE_CONSTRAINTS: LineConstraint[] = [];

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
    ID: string; //always have capital p1 -> p2, (alphabetical order)
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
    type: "circle" | "rectangle"; //rectangle may be handled differently as it must control points rather than being defined implicitally
    pointIDs: string[];
    lineIDs: string[];

    data: number[]; //differet data assosiated with different shapes, e.g. for circle: [Cx, Cy, r]

    //Conventions:
    //Square/Rectangle: pointIDs: [independent (bottom left), bottom right, top right, top left], data: [height, width]
    //Circle [3 points]: pointIDs: [p1, p2, p3]
    //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
    //Circle [2 points which are diameter]: pointIDs: [p1, p2]
    //Circle [center and radius]: pointIDs: [C], data: [r]
    //Circle [center and point]: pointIDs: [C, p1]
    //Circle [center and tangent] (having got formula yet)
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
const Shape = (ID: string, type: "circle" | "rectangle", pointIDs: string[], lineIDs: string[], data: number[]): Shape => {
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

const UpdateDependencyGraph = (dependencyGraph: { [id: string] : string[] }, points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
    dependencyGraph = {}; //depGraph[id] returns list of ids which it is dependent on

    /*
    //point
    DEPENDANCY_GRAPH["a"] = [];

    //point constraint
    DEPENDANCY_GRAPH["d"].push("a") //d is dependent on a, don't know if it is vertical or horizontal
    //also need a way to conventionalise if d had a distance assosiated with a, could use the id given to the external variables

    //line
    DEPENDANCY_GRAPH["AB"] = ["a", "b"];

    //line constraint
    DEPENDANCY_GRAPH["c"].push("AB"); //c must be on AB

    //for square, apply point constraints and line constraints, these will have already been done from above
    //for circle will need to add dependencies depending on the circle's construction
    */
}

const RenderScene = (points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
    //need to add expressions in a specific order to avoid 'in terms of' error

    const pointExpressions: Desmos.ExpressionState[] = [];
    const lineExpressions: Desmos.ExpressionState[] = [];
    const externalVariables: Desmos.ExpressionState[] = [];
    const shapeExpressions: Desmos.ExpressionState[] = [];
    //before rendering scene, we need to make sure all constraints are in place
    //Since I am directly modifying the points dictionary, this may cause some reference value issues, however as long as the constraints are correct, then it is 'controlled-overwriting'
    //CONSTRAINTS OVERWRITE DIRECT VALUES/EQUATIONS

    //shape: for rectangle, will need to consider this as a point constraint
    //       for circle, simply use information given an construct using points and/or line equations already calculated
    for (const id in shapes) {
        const shape = shapes[id];
        
        if (shape.type == "rectangle") {
            //Treat like point constraints: external variable for sideLength, then make all points dependent on independent point (bottom-left)
            //Just add some point constraints
            const [height, width] = shape.data;
            const [bl, br, tr, tl] = shape.pointIDs;
            pointConstraints.push(PointConstraint(br, bl, "h", width));
            pointConstraints.push(PointConstraint(tl, bl, "v", height));
            pointConstraints.push(PointConstraint(tr, br, "v"));
            pointConstraints.push(PointConstraint(tr, tl, "h"));

            //Also add lines between the points
            const newLineIDs = [
                [bl, br].sort().join("").toUpperCase(),
                [br, tr].sort().join("").toUpperCase(),
                [tr, tl].sort().join("").toUpperCase(),
                [tl, bl].sort().join("").toUpperCase()
            ]
            for (const lineID of newLineIDs) {
                const p1 = lineID[0].toLowerCase();
                const p2 = lineID[1].toLowerCase();
                lines[lineID] = Line(lineID, p1, p2);
            }
        }

        else if (shape.type == "circle") {
            //Need to identify which type it is:
            //Circle [3 points]: pointIDs: [p1, p2, p3]
            //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
            //Circle [2 points which are diameter]: pointIDs: [p1, p2]
            //Circle [center and radius]: pointIDs: [C], data: [r]
            //Circle [center and point]: pointIDs: [C, p1]
            //Circle [center and tangent] (having got formula yet)

            //Then handle separately by generating C_{id}x, C_{id}y and C_{id}r
            //Release 4 expressions: 3 above and circle equation (x - a)^2 + (y - b)^2 = r^2
        }
    }

    //point constraints: write the dependant point in terms of the independant point
    for (const constraint of pointConstraints) {
        const dependentID = constraint.point1ID;
        const independantID = constraint.point2ID;

        //if there is also an assosiated distance then the dependent point has no freedom - use external variable to dictate the position of dependent point
        const distance = constraint.distance;
        const id = "S" + `_{${independantID}${dependentID}}`; //S stands for displacement/distance

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
            const externalVariable: Desmos.ExpressionState = { id: id, latex: `${id} = ${distance!}`, sliderBounds: { min: 0, max: 10, step: "" } };
            externalVariables.push(externalVariable);
        }
    }

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
        pointExpressions.push(p, pX, pY);
    }

    //lines: already have equation, just plot line
    for (const id in lines) {
        const line = lines[id];
        const equation = line.equation;
        const l: Desmos.ExpressionState = { id: id, latex: equation };
        lineExpressions.push(l);
    }

    //also need to check if some points are 'over-constrained'
    //e.g. a point has 2 variables of freedom (x and y), so if there are more than 2 constraints acting on it then it is 'over-constrained'
    //constraints on points include: point constraints (constrain v or h to a point), point constraints (distance), line constraints, 
    //a shape formation may also be 'over-constrained', e.g. a circle trying to be defined with 3 points and a tangent

    //This can be checked using the dependency graph
    const dependencyGraph: { [id: string] : string[] } = {}; //DEPENDANCY_GRAPH[id] returns a list of all objects id is dependent on
    UpdateDependencyGraph(dependencyGraph, points, lines, shapes, pointConstraints, lineConstraints);
    //Check if a point has more than 2 dependencies and if a circle has more than 3 constraints (may be some edge cases)

    let expressions: Desmos.ExpressionState[] = [];
    expressions = expressions.concat(externalVariables);
    expressions = expressions.concat(pointExpressions);
    expressions = expressions.concat(lineExpressions);
    expressions = expressions.concat(shapeExpressions);
    
    console.log(expressions);
    return expressions;
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

    //Formats:
    //Point: a
    //Point constraint: - (when no distance) or S_{independent}{dependent}, e.g. S_{ab}
    //Line: AB (alphabetical order)
    //Line Constraint: - (array not dictionary)
    //Shape: A

    POINTS["a"] = Point("a", 0, 10);
    POINTS["b"] = Point("b", 10, 0);

    LINES["AB"] = Line("AB", "a", "b");

    POINTS["c"] = Point("c", 5, "");
    LINE_CONSTRAINTS.push(LineConstraint("AB", "c", "y"));

    POINTS["d"] = Point("d", "", "");
    POINT_CONTRAINTS.push(PointConstraint("d", "a", "h")); //inconsistencies arise when you try and supply too many constraints, e.g. a H and V to 2 points, but then also a distance from one point
    POINT_CONTRAINTS.push(PointConstraint("d", "b", "v"));

    //Square
    //Values given in Point() construction will be overwritten by constraints anyway
    POINTS["h"] = Point("h", 0, 0);
    POINTS["j"] = Point("j", 0, 0);
    POINTS["k"] = Point("k", 0, 0);
    POINTS["l"] = Point("l", 0, 0);
    SHAPES["A"] = Shape("A", "rectangle", ["h", "j", "k", "l"], [], [5, 5]);

    //In future may also want to switch RenderScene() function from using reference values to deep copied values
    const expressions = RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator(expressions);
}
Main();

//TODO
//IMPLEMENT ALL CIRCLE CONSTRUCTIONS
//IMPLEMENT DEPENDENCY GRAPH FUNCTION
//USE DEPENDENCY GRAPH TO CHECK FOR 'OVER-CONSTRAINING'