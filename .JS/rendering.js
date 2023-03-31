"use strict";
//Uses specific order to map points and constraints to desmos:
//1. Shapes: Mainly generates points with constraints, and then lines, or just creates the shape implicitally using pre-existing points
//2. Lines: Checking if gradient is present, if so then p2 is overwritten with a point mimicing the gradient, and an external variable is generated to modify this gradient
//3. Point constraints: Rewrites dependent point in terms of independent point, and also adds external variables if a length is involved
//4. Line constraints: Points' x or y value is rewritten in terms of a line
//5. Points: Simply plots points using x and y values given/generated previously
const RenderScene = (points, lines, shapes, pointConstraints, lineConstraints) => {
    const pointExpressions = [];
    const lineExpressions = [];
    const externalVariables = [];
    const shapeExpressions = [];
    //before rendering scene, we need to make sure all constraints are in place
    //Since I am directly modifying the points dictionary, this may cause some reference value issues, however as long as the constraints are correct, then it is 'controlled-overwriting'
    //CONSTRAINTS OVERWRITE DIRECT VALUES/EQUATIONS
    //lines - check if it is constructed with gradient - if so then convert gradient into 2nd point
    for (const id in lines) {
        const line = lines[id];
        if (id[1] == "_") {
            const linePointID = id[0];
            const gradientVariableID = `m_{${linePointID}}`;
            const externalVariable = { id: gradientVariableID, latex: `${gradientVariableID} = ${line.gradient}` };
            externalVariables.push(externalVariable);
            //Create new point which is 1 more than p1 horizontally and m more than p2 vertically
            const p1 = line.point1ID;
            const gradientPointID = `${linePointID}`; //using same id as line, as this will prevent the point from being displayed (line will override in desmos map), so we can just take advantage of the x and y coordinate without having to display the point
            points[gradientPointID] = Point(`${p1}_{x} + 1`, `${p1}_{y} + ${gradientVariableID}`);
            line.point2ID = gradientPointID;
            RecomputeLine(line);
        }
    }
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
            ];
            for (const lineID of newLineIDs) {
                const p1 = lineID[0].toLowerCase();
                const p2 = lineID[1].toLowerCase();
                lines[lineID] = Line(p1, p2);
            }
            console.log(lines);
        }
        else if (shape.type == "circle") {
            let [Cx, Cy, Cr] = ["", "", ""];
            const circleID = `C_{${id}}`;
            const [CxID, CyID, CrID] = [`C_{${id}x}`, `C_{${id}y}`, `C_{${id}r}`];
            //IDs: Cx -> id_{x}, etc...
            //Need to identify which type it is:
            //Circle [3 points]: pointIDs: [p1, p2, p3]
            if (shape.pointIDs.length == 3) {
                const [p1, p2, p3] = shape.pointIDs;
                Cx = `\\frac{\\left(${p1}_{x}^{2}-${p2}_{x}^{2}+${p1}_{y}^{2}-${p2}_{y}^{2}\\right)\\left(${p1}_{y}-${p3}_{y}\\right)-\\left(${p1}_{x}^{2}-${p3}_{x}^{2}+${p1}_{y}^{2}-${p3}_{y}^{2}\\right)\\left(${p1}_{y}-${p2}_{y}\\right)}{2\\left(\\left(${p3}_{x}-${p1}_{x}\\right)\\left(${p1}_{y}-${p2}_{y}\\right)-\\left(${p2}_{x}-${p1}_{x}\\right)\\left(${p1}_{y}-${p3}_{y}\\right)\\right)}`;
                Cy = `\\frac{${p1}_{x}^{2}\\left(${p2}_{x}-${p3}_{x}\\right)+${p1}_{x}\\left(-${p2}_{x}^{2}-${p2}_{y}^{2}+${p3}_{x}^{2}+${p3}_{y}^{2}\\right)+${p1}_{y}^{2}\\left(${p2}_{x}-${p3}_{x}\\right)+${p3}_{x}\\left(${p2}_{x}^{2}-${p2}_{x}${p3}_{x}+${p2}_{y}^{2}\\right)-${p2}_{x}${p3}_{y}^{2}}{2\\left(${p1}_{x}\\left(${p3}_{y}-${p2}_{y}\\right)+${p1}_{y}\\left(${p2}_{x}-${p3}_{x}\\right)-${p2}_{x}${p3}_{y}+${p2}_{y}${p3}_{x}\\right)}`;
                Cr = `\\sqrt{\\left(${p1}_{x}-${CxID}\\right)^{2}+\\left(${p1}_{y}-${CyID}\\right)^{2}}`;
            }
            //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
            else if (shape.pointIDs.length == 2 && shape.lineIDs.length == 1) {
                const [p1, p2] = shape.pointIDs;
                const line = lines[shape.lineIDs[0]];
                const [a, b] = [line.a, line.b]; //define 2 new variables to hold information of line's a and b
                Cx = `\\left\\{${a}=0:\\ ${p1}_{x},\\ \\frac{\\left(\\frac{${p1}_{x}^{2}+${p1}_{y}^{2}-${p2}_{x}^{2}-${p2}_{y}^{2}}{2${p1}_{y}-2${p2}_{y}}-\\frac{-${b}${p1}_{x}+${a}${p1}_{y}}{${a}}\\right)}{\\left(\\frac{${b}}{${a}}+\\frac{2${p1}_{x}-2${p2}_{x}}{2${p1}_{y}-2${p2}_{y}}\\right)}\\right\\}`;
                Cy = `\\left\\{${b}=0:\\ ${p1}_{y},\\ \\frac{\\left(\\frac{${p1}_{x}^{2}+${p1}_{y}^{2}-${p2}_{x}^{2}-${p2}_{y}^{2}}{2${p1}_{x}-2${p2}_{x}}-\\frac{${b}${p1}_{x}-${a}${p1}_{y}}{${b}}\\right)}{\\left(\\frac{${a}}{${b}}+\\frac{2${p1}_{y}-2${p2}_{y}}{2${p1}_{x}-2${p2}_{x}}\\right)}\\right\\}`;
                Cr = `\\sqrt{\\left(${p1}_{x}-${CxID}\\right)^{2}+\\left(${p1}_{y}-${CyID}\\right)^{2}}`;
            }
            //Circle [2 points which are diameter]: pointIDs: [p1, p2]
            else if (shape.pointIDs.length == 2 && shape.data.length == 0) {
                const [p1, p2] = shape.pointIDs;
                Cx = `\\frac{${p1}_{x}+${p2}_{x}}{2}`;
                Cy = `\\frac{${p1}_{y}+${p2}_{y}}{2}`;
                Cr = `\\frac{1}{2}\\sqrt{\\left(${p1}_{x}-${p2}_{x}\\right)^{2}+\\left(${p1}_{y}-${p2}_{y}\\right)^{2}}`;
            }
            //Circle [center and radius]: pointIDs: [C], data: [r]
            else if (shape.pointIDs.length == 1 && shape.data.length == 1) {
                const point = shape.pointIDs[0];
                const radius = shape.data[0];
                Cx = point + "_{x}";
                Cy = point + "_{y}";
                Cr = String(radius);
                //external variable initialised so that user can adjust it as well, basically just overwriting the r value below to bring the slider to the top
                const radiusVariableID = CrID;
                const externalVariable = { id: radiusVariableID, latex: `${radiusVariableID} = ${radius}` };
                externalVariables.push(externalVariable);
            }
            //Circle [center and point]: pointIDs: [C, p1], data: ["center+point"] //to differentiate from the diameter construction
            else if (shape.pointIDs.length == 2 && shape.data[0] == "center+point") {
                const [center, point] = shape.pointIDs;
                Cx = center + "_{x}";
                Cy = center + "_{y}";
                Cr = `\\sqrt{\\left(${point}_{x}-${CxID}\\right)^{2}+\\left(${point}_{y}-${CyID}\\right)^{2}}`;
            }
            //Circle [center and tangent] (having got formula yet)
            //Then handle separately by generating Cx, Cy and Cr
            const centerX = { id: CxID, latex: `${CxID} = ${Cx}` };
            const centerY = { id: CyID, latex: `${CyID} = ${Cy}` };
            const radius = { id: CrID, latex: `${CrID} = ${Cr}` };
            const equation = { id: circleID, latex: `\\left(x-${CxID}\\right)^{2}+\\left(y-${CyID}\\right)^{2}=${CrID}^{2}` };
            shapeExpressions.push(centerX, centerY, radius, equation);
        }
    }
    for (const id in lines) {
        const line = lines[id];
        const equation = line.equation;
        const l = { id: id, latex: equation };
        lineExpressions.push(l);
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
                dependentPoint.y = `${independantID}_{y} + ${id}`;
            }
        }
        else if (constraint.relationship == "h") {
            dependentPoint.y = `${independantID}_{y}`;
            if (distance != undefined) {
                dependentPoint.x = `${independantID}_{x} + ${id}`;
            }
        }
        if (distance != undefined) {
            const externalVariable = { id: id, latex: `${id} = ${distance}` };
            externalVariables.push(externalVariable);
        }
    }
    //line constraint: either lock points with y-coordiante or x-coorindate, will need to make a judgment later, then just replace the points_x/y with the line equation with their x/y counterpart substituted in
    for (const constraint of lineConstraints) {
        const dependent = constraint.constraintType;
        const point = points[constraint.pointID];
        const line = lines[constraint.lineID];
        const [px, py] = [constraint.pointID + "_{x}", constraint.pointID + "_{y}"];
        //need to rearrange equation for x or y
        const [a, b, c] = [line.a, line.b, line.c];
        if (dependent == "x") {
            const newEquation = `(-${c} - ${b}${py})/${a}`;
            point.x = newEquation;
        }
        if (dependent == "y") {
            const newEquation = `(-${c} - ${a}${px})/${b}`;
            point.y = newEquation;
        }
    }
    //points: generate 2 variables for each point, point_x and point_y
    for (const id in points) {
        const point = points[id];
        const x = point.x;
        const y = point.y;
        const pX = { id: `${id}_{x}`, latex: `${id}_{x} = ${x}` };
        const pY = { id: `${id}_{y}`, latex: `${id}_{y} = ${y}` };
        const p = { id: id, latex: `${id} = (${id}_{x}, ${id}_{y})`, label: id, showLabel: true };
        pointExpressions.push(p, pX, pY);
    }
    //also need to check if some points are 'over-constrained'
    //e.g. a point has 2 variables of freedom (x and y), so if there are more than 2 constraints acting on it then it is 'over-constrained'
    //constraints on points include: point constraints (constrain v or h to a point), point constraints (distance), line constraints, 
    //a shape formation may also be 'over-constrained', e.g. a circle trying to be defined with 3 points and a tangent
    //Check if a point has more than 2 dependencies and if a circle has more than 3 constraints (may be some edge cases)
    const dependencyGraph = GenerateDependencyGraph(points, lines, shapes, pointConstraints, lineConstraints);
    let expressions = [];
    expressions = expressions.concat(externalVariables);
    expressions = expressions.concat(pointExpressions);
    expressions = expressions.concat(lineExpressions);
    expressions = expressions.concat(shapeExpressions);
    console.log(expressions);
    return expressions;
};
const RecomputeLine = (line) => {
    const [x1, y1] = [`${line.point1ID}_{x}`, `${line.point1ID}_{y}`];
    const [x2, y2] = [`${line.point2ID}_{x}`, `${line.point2ID}_{y}`]; //if gradient is used to construct line, then this will be updated before the line is drawn
    const a = `(${y1} - ${y2})`;
    const b = `(${x2} - ${x1})`;
    const c = `(${x1}${y2} - ${x2}${y1})`;
    const equation = `${a}x + ${b}y + ${c} = 0`;
    [line.a, line.b, line.c] = [a, b, c];
    line.equation = equation;
};
const GenerateDependencyGraph = (points, lines, shapes, pointConstraints, lineConstraints) => {
    //will alter the original the original dependency graph object passed in
    const dependencyGraph = {}; //depGraph[id] returns list of ids which it is dependent on
    //first initiailise all points, lines and shapes
    for (const id in points) {
        dependencyGraph[id] = [];
    }
    for (const id in lines) {
        const line = lines[id];
        dependencyGraph[id] = [line.point1ID, line.point2ID];
    }
    for (const id in shapes) {
        const shape = shapes[id];
        dependencyGraph[id] = [];
        dependencyGraph[id] = dependencyGraph[id].concat(shape.pointIDs); //don't add unneccesary data to the shape construction
        dependencyGraph[id] = dependencyGraph[id].concat(shape.lineIDs);
    }
    for (const pointConstraint of pointConstraints) {
        //p1 is dependent on p2
        const [independantID, dependentID] = [pointConstraint.point2ID, pointConstraint.point1ID];
        dependencyGraph[dependentID].push(independantID);
        if (pointConstraint.distance != undefined) {
            const externalVariable = "S" + `_{${independantID}${dependentID}}`;
            dependencyGraph[dependentID].push(externalVariable);
        }
    }
    for (const lineConstraint of lineConstraints) {
        //point is dependent on line
        //May differentiate between x and y constraining in future, but for now will just treat it all as 1 point
        const [pointID, lineID] = [lineConstraint.pointID, lineConstraint.lineID];
        dependencyGraph[lineID].push(pointID);
    }
    return dependencyGraph;
};
