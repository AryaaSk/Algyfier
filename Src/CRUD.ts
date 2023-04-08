const AddButtonsCallbacks = [
    () => { //point
        const pointData = prompt("New Point [ID, x, y]");
        if (pointData == undefined) {
            return;
        }

        //validate id
        let [id, x, y] = pointData.replaceAll(" ", "").split(",");
        id = id.toLowerCase();
        if (POINTS[id] != undefined) {
            alert("ID already in use by another point");
            return;
        }
        else if (id.length != 1) {
            alert("ID must be of length 1");
            return;
        }
        const validIds = "abcdefghijklmnopqrstuvwxyz".split("");
        if (validIds.includes(id) == false) {
            alert("ID must be a letter in the alphabet");
            return;
        }
        
        POINTS[id] = Point(x == undefined ? 0 : Number(x), y == undefined ? 0 : Number(y)); //x and y coordinates will be overwritten with constraints anyway
        UpdateUI();
    },

    () => { //point constraint
        const pointConstraintData = prompt("New Point Constraint [depdendent, independent, h|v, distance]");
        if (pointConstraintData == undefined) {
            return;
        }

        let [p1, p2, type, distance] = pointConstraintData.replaceAll(" ", "").split(",");
        type = type.toLowerCase();
        if (POINTS[p1] == undefined) {
            alert("Unable to find dependent point");
        }
        if (POINTS[p2] == undefined) {
            alert("Unable to find independent point");
        }
        if (type != "h" && type != "v") {
            alert("Invalid type: Must be either 'h' or 'v'");
        }

        POINT_CONSTRAINTS.push(PointConstraint(p1, p2, <"v" | "h">type, distance == undefined ? undefined : Number(distance)));
        UpdateUI();
    },

    () => { //line
        const lineData = prompt("New Line [p1, p2|gradient]");
        if (lineData == undefined) {
            return;
        }

        const [p1, p2OrGradient] = lineData.replaceAll(" ", "").split(",");
        if (POINTS[p1] == undefined) {
            alert("Unable to find p1");
            return;
        }

        if (isNaN(Number(p2OrGradient))) {
            const p2 = p2OrGradient;

            if (POINTS[p2] == undefined) {
                alert("Unable to find p2");
                return;
            }

            const lineID = [p1, p2].sort().join("").toUpperCase();
            LINES[lineID] = Line(lineID[0].toLowerCase(), lineID[1].toLowerCase());
            UpdateUI();
        }
        else {
            const gradient = Number(p2OrGradient);
            const lineID = `${p1.toUpperCase()}_`;
            LINES[lineID] = Line(p1, "", gradient);
            UpdateUI();
        }
    },

    () => { //line constraint
        const lineConstraintPrompt = prompt("New Line Constraint [lineID, pointID, x|y-constraining]");
        if (lineConstraintPrompt == undefined) {
            return;
        }

        let [lineID, pointID, type] = lineConstraintPrompt.replaceAll(" ", "").split(",");
        type = type.toLowerCase();
        /* //Not doing this check as the line could be part of a shape
        if (LINES[lineID] == undefined) {
            alert("Unable to find line");
            return;
        }
        */
        if (POINTS[pointID] == undefined) {
            alert("Unable to find point");
            return;
        }
        if (type != "x" && type != "y") {
            alert("Invalid type: must be 'x' or 'y'");
            return;
        }

        LINE_CONSTRAINTS.push(LineConstraint(lineID, pointID, type));
        UpdateUI();
    },

    () => { //shape
        //Need to actually implement a UI system for the shape, since it is too complicated to input via text
    }
];

//All data taken in is passed by reference, so can just edit it easily
const PointClick = (id: string, point: Point) => {
    console.log(id, point);
}
const PointConstraintClick = (pointConstraint: PointConstraint) => {
    console.log(pointConstraint);
}
const LineClick = (id: string, line: Line) => {
    console.log(id, line);
}
const LineConstraintClick = (lineConstraint: LineConstraint) => {
    console.log(lineConstraint);
}
const ShapeClick = (id: string, shape: Shape) => {
    console.log(id, shape);
}