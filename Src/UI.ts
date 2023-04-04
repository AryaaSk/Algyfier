const [
    POINTS_DIV,
    POINT_CONSTRAINTS_DIV,
    LINES_DIV,
    LINE_CONSTRAINTS_DIV,
    SHAPES_DIV
] = [
    document.getElementById("points")!,
    document.getElementById("pointContstraints")!,
    document.getElementById("lines")!,
    document.getElementById("lineConstraints")!,
    document.getElementById("shapes")!,
];

const PopulateDivs = (points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
    POINTS_DIV.innerHTML = '';
    for (const id in points) {
        const element = document.createElement("div");
        element.className = "cell";
        element.innerHTML = `${id}`
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
        element.innerHTML = message

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
        element.innerHTML = message

        LINE_CONSTRAINTS_DIV.append(element);
    }

    SHAPES_DIV.innerHTML = ``;
    for (const id in shapes) {
        const shape = shapes[id];

        //could customise identifier as it is not the same as id, e.g. circles get changed to
        let message = "This is a shape";
        
        //change message depending on what type of shape it is

        const element = document.createElement("div");
        element.className = "shapeRow";
        element.innerHTML =
        `<div>${id}</div>
        <div>${message}</div>`;

        SHAPES_DIV.append(element);
    }
}




const MainUI = () => {
    PopulateDivs(POINTS, LINES, SHAPES, POINT_CONTRAINTS, LINE_CONSTRAINTS);
}
MainUI();