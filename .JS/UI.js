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
        element.onclick = () => {
            PointClick(id, points[id]);
        };
        POINTS_DIV.append(element);
    }
    POINT_CONSTRAINTS_DIV.innerHTML = '';
    for (const pointConstraint of pointConstraints) {
        const element = document.createElement("div");
        element.className = "row";
        const constraintType = pointConstraint.relationship == "h" ? "horizontal" : "vertical";
        element.onclick = () => {
            PointConstraintClick(pointConstraint);
        };
        let message = `(${pointConstraint.point1ID}) is ${constraintType} to (${pointConstraint.point2ID})`;
        if (pointConstraint.distance != undefined) {
            message += ` with distance ≈ ${Math.round(pointConstraint.distance)}`;
        }
        element.innerHTML = message;
        POINT_CONSTRAINTS_DIV.append(element);
    }
    LINES_DIV.innerHTML = '';
    for (const id in lines) {
        const element = document.createElement("div");
        element.className = "cell";
        element.onclick = () => {
            LineClick(id, lines[id]);
        };
        let message = "";
        const line = lines[id];
        if (line.gradient != undefined) {
            message = `${line.point1ID.toUpperCase()}<u>${Math.round(line.gradient)}</u>`;
        }
        else {
            message = id;
        }
        element.innerHTML = message;
        LINES_DIV.append(element);
    }
    LINE_CONSTRAINTS_DIV.innerHTML = '';
    for (const lineConstraint of lineConstraints) {
        const element = document.createElement("div");
        element.className = "row";
        element.onclick = () => {
            LineConstraintClick(lineConstraint);
        };
        const message = `(${lineConstraint.pointID}) is ${lineConstraint.constraintType}-constrained to line ${lineConstraint.lineID}`;
        element.innerHTML = message;
        LINE_CONSTRAINTS_DIV.append(element);
    }
    SHAPES_DIV.innerHTML = ``;
    for (const id in shapes) {
        const shape = shapes[id];
        let message = "";
        if (shape.type == "rectangle") {
            const [p1, p2, p3, p4] = shape.pointIDs;
            const [height, width] = shape.data;
            message = `Rectangle <br> (${p2}), (${p3}), (${p4}) dependent on (${p1}) <br> Height ≈ ${Math.round(height)}, Width ≈ ${Math.round(width)}`;
        }
        else if (shape.type == "circle") {
            const p1 = shape.pointIDs[0];
            const independentPoints = shape.pointIDs.map((v) => { return `(${v})`; }).join(", ");
            const independentLines = shape.lineIDs.join(", ");
            const data = shape.data;
            const construction = shape.construction;
            //A little messy but seems to handle all the above cases, uses base and then adds extra information
            message = `Circle <br> Dependent on ${independentPoints}`;
            if (construction == "2P+T") {
                message += `<br> Tangent at (${p1}) with ${independentLines}`;
            }
            else if (construction == "2PD") {
                message += "<br> [Diameter]";
            }
            else if (construction == "C+P") {
                message += "<br> [Center + Point]";
            }
            else if (construction == "C+R") {
                const radius = data[0];
                message = `Circle <br> Dependent on Center (${p1}) <br> Radius ≈ ${Math.round(radius)}`;
            }
        }
        const element = document.createElement("div");
        element.className = "shapeRow";
        element.onclick = () => {
            ShapeClick(id, shape);
        };
        element.innerHTML =
            `<div>${id}</div>
        <div>${message}</div>`;
        SHAPES_DIV.append(element);
    }
    const buttonElements = [];
    for (let i = 0; i != 5; i += 1) {
        const element = document.createElement('button');
        element.className = "cell add";
        element.innerText = "+";
        element.onclick = AddButtonsCallbacks[i];
        buttonElements.push(element);
    }
    POINTS_DIV.append(buttonElements[0]); //to ensure unique references
    POINT_CONSTRAINTS_DIV.append(buttonElements[1]);
    LINES_DIV.append(buttonElements[2]);
    LINE_CONSTRAINTS_DIV.append(buttonElements[3]);
    SHAPES_DIV.append(buttonElements[4]);
};
const AttachListeners = () => {
    const bind = document.getElementById("bind");
    bind.onclick = () => {
        UpdateDataFromCalculator();
        PopulateDivs(POINTS, LINES, SHAPES, POINT_CONSTRAINTS, LINE_CONSTRAINTS);
    };
    const construct = document.getElementById("construct");
    construct.onclick = () => {
        UpdateCalculator();
    };
    const match = document.getElementById("match");
    match.onclick = () => {
        const data = GetMatchData();
        if (data == undefined) {
            return;
        }
        const [inputID, outputID, desiredValue] = data;
        console.log(data);
        //Match(<string>inputID, <string>outputID, <number>desiredValue);
        //Match("c_{x}", "P_{MADMBD}", -1);
        Match("c_{x}", "HELPER-P_{MADMBD}", -1);
    };
    const setupNav = document.getElementById("setup");
    const helpersNav = document.getElementById("helpers");
    const setupContainer = document.getElementById("setupConstraintsWrapper");
    const helperContainer = document.getElementById("helperConstraintsWrapper");
    setupNav.onclick = () => {
        setupContainer.style.display = "";
        helperContainer.style.display = "none";
    };
    helpersNav.onclick = () => {
        setupContainer.style.display = "none";
        helperContainer.style.display = "";
    };
};
const UpdateUI = () => {
    PopulateDivs(POINTS, LINES, SHAPES, POINT_CONSTRAINTS, LINE_CONSTRAINTS);
    UpdateCalculator();
};
