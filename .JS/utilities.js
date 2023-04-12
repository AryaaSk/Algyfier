"use strict";
const ExpressionEvaluateTime = 50;
//File to store all functions which provide utilities to extract data from the desmos calculator
//E.g. the distance between 2 points, area under given curve
//Most important function: match(input, output, desiredValue)
const Match = async (inputID, outputID, desiredValue) => {
    //input and output are both latex for the id's of the sliders which we are dealing with
    //e.g. input may be a point's x coordinate, and output may be something calculated, e.g. the distance between that point and another
    //this function will use a 'gradient descent' like algorithm to adjust the input up and down until the output's value is the desired value
    //'gradient descent' like algorithm
    //find gradient at current value of input (by adding very small value of h and noting the change in output)
    //if current output is too low, then move up, otherwise move down
    //adjust step size proportional to how close current output's value is to the desired value
    //Generate graph of input |-> output
    const xs = [];
    const ys = [];
    const xRange = [-1.3, -1.2, 0.001]; //lb, ub, step
    for (let x = xRange[0]; x <= xRange[1]; x += xRange[2]) {
        CALCULATOR.setExpression({ id: inputID, latex: `${inputID} = ${x}` });
        await Wait(ExpressionEvaluateTime);
        const desmosOutput = CALCULATOR.expressionAnalysis[outputID];
        xs.push(x);
        ys.push(desmosOutput.evaluation.value);
    }
    console.log(xs, ys);
    CALCULATOR.setExpression({
        type: 'table',
        columns: [
            {
                latex: 'x',
                values: xs.map((v) => { return String(v); })
            },
            {
                latex: 'y',
                values: ys.map((v) => { return String(v); })
            }
        ]
    });
    CALCULATOR.setExpression({ latex: `y = ${desiredValue}` });
    //Effectively outputs the input -> output function, and we are trying to get the values as close to the y = desiredValue line
    //Two methods: Above root bisection like, or gradient descent (which I think would be more efficient)
    //Gradient: Use gradient to continue changing x until change in sign, at which point go to previous x value and repeat with next decimal point until you get 8+ d.p. of precision
};
const Wait = (t) => {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve("Done");
        }, t);
    });
    return promise;
};
const HelperExpressions = () => {
    const expressions = [
        { id: "HELPER-M_{AD}", latex: "M_{AD}=\\frac{d_{y}-a_{y}}{d_{x}-a_{x}}" },
        { id: "HELPER-M_{BD}", latex: "M_{BD}=\\frac{d_{y}-b_{y}}{d_{x}-b_{x}}" },
        { id: "HELPER-P_{MADMBD}", latex: "P_{MADMBD}=M_{AD}\\cdot M_{BD}" }
    ];
    return expressions;
};
