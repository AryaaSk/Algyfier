//Uses specific order to map points and constraints to desmos:
//1. Shapes: Mainly generates points with constraints, and then lines, or just creates the shape implicitally using pre-existing points
//2. Lines: Checking if gradient is present, if so then p2 is overwritten with a point mimicing the gradient, and an external variable is generated to modify this gradient
//3. Point constraints: Rewrites dependent point in terms of independent point, and also adds external variables if a length is involved
//4. Line constraints: Points' x or y value is rewritten in terms of a line
//5. Points: Simply plots points using x and y values given/generated previously

const RenderScene = (points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
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
            pointConstraints.push(PointConstraint(br, bl, "h", <number>width));
            pointConstraints.push(PointConstraint(tl, bl, "v", <number>height));
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
                lines[lineID] = Line(p1, p2);
            }
        }

        else if (shape.type == "circle") {
            let [Cx, Cy, Cr] = ["", "", ""];
            //IDs: Cx -> id_{x}, etc...

            //Need to identify which type it is:
            //Circle [3 points]: pointIDs: [p1, p2, p3]
            if (shape.pointIDs.length == 3) {
                const [p1, p2, p3] = shape.pointIDs;
                Cx = `\\frac{\\left(${p1}_{x}^{2}-${p2}_{x}^{2}+${p1}_{y}^{2}-${p2}_{y}^{2}\\right)\\left(${p1}_{y}-${p3}_{y}\\right)-\\left(${p1}_{x}^{2}-${p3}_{x}^{2}+${p1}_{y}^{2}-${p3}_{y}^{2}\\right)\\left(${p1}_{y}-${p2}_{y}\\right)}{2\\left(\\left(${p3}_{x}-${p1}_{x}\\right)\\left(${p1}_{y}-${p2}_{y}\\right)-\\left(${p2}_{x}-${p1}_{x}\\right)\\left(${p1}_{y}-${p3}_{y}\\right)\\right)}`;
                Cy = `\\frac{${p1}_{x}^{2}\\left(${p2}_{x}-${p3}_{x}\\right)+${p1}_{x}\\left(-${p2}_{x}^{2}-${p2}_{y}^{2}+${p3}_{x}^{2}+${p3}_{y}^{2}\\right)+${p1}_{y}^{2}\\left(${p2}_{x}-${p3}_{x}\\right)+${p3}_{x}\\left(${p2}_{x}^{2}-${p2}_{x}${p3}_{x}+${p2}_{y}^{2}\\right)-${p2}_{x}${p3}_{y}^{2}}{2\\left(${p1}_{x}\\left(${p3}_{y}-${p2}_{y}\\right)+${p1}_{y}\\left(${p2}_{x}-${p3}_{x}\\right)-${p2}_{x}${p3}_{y}+${p2}_{y}${p3}_{x}\\right)}`;
                Cr = `\\sqrt{\\left(${p1}_{x}-${id}_{x}\\right)^{2}+\\left(${p1}_{y}-${id}_{y}\\right)^{2}}`;
            }

            //Circle [2 points + tangent]: pointIDs: [p1, p2], lineIDs: [tangentAtp1]
            else if (shape.pointIDs.length == 2 && shape.lineIDs.length == 1) {
                const [p1, p2] = shape.pointIDs;
                const line = lines[shape.lineIDs[0]]
                const [a, b] = [line.a, line.b]; //define 2 new variables to hold information of line's a and b

                Cx = `\\left\\{${a}=0:\\ ${p1}_{x},\\ \\frac{\\left(\\frac{${p1}_{x}^{2}+${p1}_{y}^{2}-${p2}_{x}^{2}-${p2}_{y}^{2}}{2${p1}_{y}-2${p2}_{y}}-\\frac{-${b}${p1}_{x}+${a}${p1}_{y}}{${a}}\\right)}{\\left(\\frac{${b}}{${a}}+\\frac{2${p1}_{x}-2${p2}_{x}}{2${p1}_{y}-2${p2}_{y}}\\right)}\\right\\}`;
                Cy = `\\left\\{${b}=0:\\ ${p1}_{y},\\ \\frac{\\left(\\frac{${p1}_{x}^{2}+${p1}_{y}^{2}-${p2}_{x}^{2}-${p2}_{y}^{2}}{2${p1}_{x}-2${p2}_{x}}-\\frac{${b}${p1}_{x}-${a}${p1}_{y}}{${b}}\\right)}{\\left(\\frac{${a}}{${b}}+\\frac{2${p1}_{y}-2${p2}_{y}}{2${p1}_{x}-2${p2}_{x}}\\right)}\\right\\}`;
                Cr = `\\sqrt{\\left(${p1}_{x}-${id}_{x}\\right)^{2}+\\left(${p1}_{y}-${id}_{y}\\right)^{2}}`;
            }

            //Circle [2 points which are diameter]: pointIDs: [p1, p2]
            else if (shape.pointIDs.length == 2 && shape.data.length == 0) {
                const [p1, p2] = shape.pointIDs;
                Cx = `\\frac{${p1}_{x}+${p2}_{x}}{2}`;
                Cy = `\\frac{${p1}_{y}+${p2}_{y}}{2}`;
                Cr = `\\frac{1}{2}\\sqrt{\\left(${p1}_{x}-${p2}_{x}\\right)^{2}+\\left(${p1}_{y}-${p2}_{y}\\right)^{2}}`
            }

            //Circle [center and radius]: pointIDs: [C], data: [r]
            else if (shape.pointIDs.length == 1 && shape.data.length == 1) {
                const point = shape.pointIDs[0];
                const radius = shape.data[0];
                Cx = point + "_{x}";
                Cy = point + "_{y}";
                Cr = String(radius);

                //external variable initialised so that user can adjust it as well
                const radiusVariableID = `${id}_{r}`;
                const externalVariable: Desmos.ExpressionState = { id: radiusVariableID, latex: `${radiusVariableID} = ${radius}`};
                externalVariables.push(externalVariable);
            }

            //Circle [center and point]: pointIDs: [C, p1], data: ["center+point"] //to differentiate from the diameter construction
            else if (shape.pointIDs.length == 2 && shape.data[0] == "center+point") {
                const [center, point] = shape.pointIDs;
                Cx = center + "_{x}";
                Cy = center + "_{y}";
                Cr = `\\sqrt{\\left(${id}_{x}-${point}_{x}\\right)^{2}+\\left(${id}_{y}-${point}_{y}\\right)^{2}}`
            }

            //Circle [center and tangent] (having got formula yet)

            //Then handle separately by generating {id}_x, {id}_y and {id}_r
            const centerX: Desmos.ExpressionState = { id: `${id}_{x}`, latex: `${id}_{x} = ${Cx}` };
            const centerY: Desmos.ExpressionState = { id: `${id}_{y}`, latex: `${id}_{y} = ${Cy}` };
            const radius: Desmos.ExpressionState = { id: `${id}_{r}`, latex: `${id}_{r} = ${Cr}` };
            const equation: Desmos.ExpressionState = { id: id, latex: `\\left(x-${id}_{x}\\right)^{2}+\\left(y-${id}_{y}\\right)^{2}=${id}_{r}^{2}` };
            shapeExpressions.push(centerX, centerY, radius, equation);
        }
    }

    //lines
    for (const id in lines) {
        const line = lines[id];
        if (line.gradient != undefined) {
            const gradientVariableID = `m_{${id}}`
            const externalVariable: Desmos.ExpressionState = { id: gradientVariableID, latex: `${gradientVariableID} = ${line.gradient !}`};
            externalVariables.push(externalVariable);

            //Create new point which is 1 more than p1 horizontally and m more than p2 vertically
            const p1 = line.point1ID;
            const mPointID = `${id}`; //using same id as line, as this will prevent the point from being displayed (line will override in desmos map), so we can just take advantage of the x and y coordinate without having to display the point
            points[mPointID] = Point(`${p1}_{x} + 1`, `${p1}_{y} + ${gradientVariableID}`);
            line.point2ID = mPointID

            RecomputeLine(line);
        }

        const equation = line.equation;
        const l: Desmos.ExpressionState = { id: id, latex: equation };
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
            const externalVariable: Desmos.ExpressionState = { id: id, latex: `${id} = ${distance!}`};
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
        const x = point.x;
        const y = point.y;

        const pX: Desmos.ExpressionState = { id: `${id}_{x}`, latex: `${id}_{x} = ${x}` };
        const pY: Desmos.ExpressionState = { id: `${id}_{y}`, latex: `${id}_{y} = ${y}` };
        const p: Desmos.ExpressionState = { id: id, latex: `${id} = (${id}_{x}, ${id}_{y})`, label: id, showLabel: true };
        pointExpressions.push(p, pX, pY);
    }

    //also need to check if some points are 'over-constrained'
    //e.g. a point has 2 variables of freedom (x and y), so if there are more than 2 constraints acting on it then it is 'over-constrained'
    //constraints on points include: point constraints (constrain v or h to a point), point constraints (distance), line constraints, 
    //a shape formation may also be 'over-constrained', e.g. a circle trying to be defined with 3 points and a tangent

    //Check if a point has more than 2 dependencies and if a circle has more than 3 constraints (may be some edge cases)
    const dependencyGraph = GenerateDependencyGraph(points, lines, shapes, pointConstraints, lineConstraints);

    let expressions: Desmos.ExpressionState[] = [];
    expressions = expressions.concat(externalVariables);
    expressions = expressions.concat(pointExpressions);
    expressions = expressions.concat(lineExpressions);
    expressions = expressions.concat(shapeExpressions);

    console.log(expressions);
    return expressions;
}





const GenerateDependencyGraph = (points: { [id: string] : Point }, lines: { [id: string] : Line }, shapes: { [id: string] : Shape }, pointConstraints: PointConstraint[], lineConstraints: LineConstraint[]) => {
    //will alter the original the original dependency graph object passed in
    const dependencyGraph: { [id: string] : string[] } = {}; //depGraph[id] returns list of ids which it is dependent on

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
        const [independantID, dependentID] = [pointConstraint.point2ID, pointConstraint.point1ID]
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
}