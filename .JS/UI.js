"use strict";
const [POINTS_DIV, POINT_CONSTRAINTS_DIV, LINES_DIV, LINE_CONSTRAINTS_DIV, SHAPES_DIV] = [
    document.getElementById("points"),
    document.getElementById("pointContstraints"),
    document.getElementById("lines"),
    document.getElementById("lineConstraints"),
    document.getElementById("shapes"),
];
const PopulateDivs = (points, lines, shapes, pointConstraints, lineConstraints) => {
    POINTS_DIV.innerHTML = '';
    for (const id in points) {
        const element = document.createElement("div");
        element.className = "cell";
        element.innerHTML = `${id}`;
        POINTS_DIV.append(element);
    }
    POINT_CONSTRAINTS_DIV.innerHTML = '';
    for (const pointConstraint of pointConstraints) {
        const element = document.createElement("div");
        element.className = "row";
        let message = `(${pointConstraint.point1ID}) is horizontal to (${pointConstraint.point2ID})`;
        if (pointConstraint.distance != undefined) {
            message += ` with distance ${pointConstraint.distance}`;
        }
        element.innerHTML = message;
        POINT_CONSTRAINTS_DIV.append(element);
    }
    LINES_DIV.innerHTML = '';
    for (const id in lines) {
        const element = document.createElement("div");
        element.className = "cell";
        element.innerHTML = id;
        LINES_DIV.append(element);
    }
    LINE_CONSTRAINTS_DIV.innerHTML = '';
    for (const lineConstraint of lineConstraints) {
        const element = document.createElement("div");
        element.className = "row";
        const message = `(${lineConstraint.pointID}) is ${lineConstraint.constraintType}-constrained to line ${lineConstraint.lineID}`;
        element.innerHTML = message;
        LINE_CONSTRAINTS_DIV.append(element);
    }
    SHAPES_DIV.innerHTML = ``;
    for (const id in shapes) {
        const shape = shapes[id];
        //could customise identifier as it is not the same as id, e.g. circles get changed to
        let message = "";
        //change message depending on what type of shape it is
        if (shape.type == "rectangle") {
            const [p1, p2, p3, p4] = shape.pointIDs;
            const [height, width] = shape.data;
            message = `Rectangle <br> (${p2}), (${p3}), (${p4}) dependent on (${p1}) <br> Height: ${height}, Width: ${width}`;
        }
        else if (shape.type == "circle") {
            //Circle [3 points]: pointIDs: [p1, p2, p3]
            //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
            //Circle [2 points which are diameter]: pointIDs: [p1, p2]
            //Circle [center and radius]: pointIDs: [C], data: [r]
            //Circle [center and point]: pointIDs: [C, p1], data: ["center+point"]
            //A little messy but seems to handle all the above cases
            const p1 = shape.pointIDs[0];
            const independentPoints = shape.pointIDs.map((v) => { return `(${v})`; }).join(", ");
            const independentLines = shape.lineIDs.join(", ");
            message = `Circle <br> Dependent on ${independentPoints}`;
            if (independentLines.length > 0) { //the only construction involving a line is tangent
                message += `<br> Tangent at (${p1}) with ${independentLines}`;
            }
            if (shape.pointIDs.length == 2 && shape.lineIDs.length == 0 && shape.data.length == 0) { //diameter
                message += "<br> [Diameter]";
            }
            const data = shape.data;
            if (data.length == 1) { //everything that includes data doesn't have any lines
                if (isNaN(Number(data[0]))) {
                    //center + point
                    message += "<br> [Center + Point]";
                }
                else {
                    const radius = data[0];
                    message = `Circle <br> Dependent on Center (${p1}) <br> Radius ${radius}`;
                }
            }
        }
        const element = document.createElement("div");
        element.className = "shapeRow";
        element.innerHTML =
            `<div>${id}</div>
        <div>${message}</div>`;
        SHAPES_DIV.append(element);
    }
};
const UpdateDataFromCalculator = () => {
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
    //Gather shape data, e.g. if rectangle height and width have been altered, or if circle's radius has been altered
};
const AttachListeners = () => {
    const bind = document.getElementById("bind");
    bind.onclick = () => {
        UpdateDataFromCalculator();
        PopulateDivs(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    };
    const construct = document.getElementById("construct");
    construct.onclick = () => {
        const expressions = RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
        UpdateCalculator(expressions);
    };
};
const MainUI = () => {
    PopulateDivs(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    const expressions = RenderScene(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator(expressions);
};
MainUI();
