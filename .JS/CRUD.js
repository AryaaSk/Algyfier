"use strict";
const AddButtonsCallbacks = [
    () => {
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
    () => {
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
        POINT_CONSTRAINTS.push(PointConstraint(p1, p2, type, distance == undefined ? undefined : Number(distance)));
        UpdateUI();
    },
    () => {
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
    () => {
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
    () => {
        //Need to actually implement a UI system for the shape, since it is too complicated to input via text
        //This one won't have any validation for all the different cases
        const id = prompt("New Shape: [id]")?.toUpperCase();
        if (id == undefined) {
            return;
        }
        if (SHAPES[id] != undefined) {
            alert("Already another shape with same ID");
        }
        if (id.length != 1) {
            alert("ID must be 1 character long");
            return;
        }
        const validIds = "abcdefghijklmnopqrstuvwxyz".toUpperCase().split("");
        if (validIds.includes(id) == false) {
            alert("ID must be a letter in the alphabet");
            return;
        }
        const type = prompt("New Shape [circle|rectangle]")?.toLowerCase();
        ;
        if (type == undefined || (type != "circle" && type != "rectangle")) {
            return;
        }
        //Square/Rectangle: pointIDs: [independent (bottom left), bottom right, top right, top left], data: [height, width]
        //3P [3 points]: pointIDs: [p1, p2, p3]
        //2P+T [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
        //2PD [2 points which are diameter]: pointIDs: [p1, p2]
        //C+R [center and radius]: pointIDs: [C], data: [r]
        //C+P [center and point]: pointIDs: [C, p1]
        //Circle [center and tangent] C+T (haven't got formula yet)
        let pointIDs = [];
        let lineIDs = [];
        let data = [];
        let construction = undefined;
        if (type == "rectangle") {
            const pointIDData = prompt("Points: [indepdendent, p1, p2, p3]");
            pointIDs = pointIDData.replaceAll(" ", "").split(",").map((v) => { return v.toLowerCase(); });
            const dimensionData = prompt("Dimensions: [height, width]");
            data = dimensionData.replaceAll(" ", "").split(",").map((v) => { return Number(v); });
        }
        else {
            //circle
            const constructionData = prompt(`Construction [construction]: \n\n3P [3 points]: pointIDs: [p1, p2, p3]\n2P+T [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]\n2PD [2 points which are diameter]: pointIDs: [p1, p2]\nC+R [center and radius]: pointIDs: [C], data: [r]\nC+P [center and point]: pointIDs: [C, p1]`)?.toUpperCase();
            if (constructionData == undefined) {
                return;
            }
            const validConstructions = "3P,2P+T,2PD,C+R,C+P".split(",");
            if (validConstructions.includes(constructionData) == false) {
                alert(`Not valid construction, must be one of: ${validConstructions}`);
                return;
            }
            construction = constructionData;
            const pointData = prompt("Points (only if required): [p1, p2 ...]")?.replaceAll(" ", "").toLowerCase().split(",");
            if (pointData == undefined) {
                return;
            }
            const lineData = prompt("Lines (only if required): [AB, A_ ...]")?.replaceAll(" ", "").toUpperCase().split(",");
            if (lineData == undefined) {
                return;
            }
            const shapeData = prompt("Data (only if required): []")?.replaceAll(" ", "").split(",").map((v) => { return Number(v); });
            if (shapeData == undefined) {
                return;
            }
            [pointIDs, lineIDs, data] = [pointData, lineData, shapeData];
        }
        SHAPES[id] = Shape(type, pointIDs, lineIDs, data, construction);
        UpdateUI();
    }
];
//All data taken in is passed by reference, so can just edit it easily
const PointClick = (id, point) => {
    console.log(id, point);
};
const PointConstraintClick = (pointConstraint) => {
    console.log(pointConstraint);
};
const LineClick = (id, line) => {
    console.log(id, line);
};
const LineConstraintClick = (lineConstraint) => {
    console.log(lineConstraint);
};
const ShapeClick = (id, shape) => {
    console.log(id, shape);
};
//Helper data
const GetMatchData = () => {
    const data = prompt("Set input to an approximately close value.\nThen enter IDs of input and output: [inputID, outputID, desiredValue]")?.replaceAll(" ", "").split(",");
    if (data == undefined) {
        return undefined;
    }
    if (isNaN(Number(data[2]))) {
        alert("Desired value must be a plain number");
        return undefined;
    }
    return [data[0], data[1], Number(data[2])];
};
