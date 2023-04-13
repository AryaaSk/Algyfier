const EXPRESSION_EVALUATE_TIME = 100;
const MATCH_ACCURACY = 12; //12 d.p. of accuracy

//File to store all functions which provide utilities to extract data from the desmos calculator
//E.g. the distance between 2 points, area under given curve
//Most important function: match(input, output, desiredValue)

const TestValue = async (inputID: string, value: Number, outputID: string) => {
    CALCULATOR.setExpression({ id: inputID, latex: `${inputID} = ${value}`});
    await Wait(EXPRESSION_EVALUATE_TIME);
    const desmosOutput = CALCULATOR.expressionAnalysis[outputID];
    return <number>desmosOutput.evaluation!.value;
}

const Match = async (inputID: string, outputID: string, desiredOutput: number, startingAccuracy?: number) => {
    //input and output are both latex for the id's of the sliders which we are dealing with
    //e.g. input may be a point's x coordinate, and output may be something calculated, e.g. the distance between that point and another
    
    //Gradient method: Use gradient to continue changing x until change in sign, at which point go to previous x value and repeat with next decimal point until you get 8+ d.p. of precision
    const startingInput = <number>CALCULATOR.expressionAnalysis[inputID].evaluation!.value;

    const y1 = await TestValue(inputID, startingInput, outputID);
    const h = 0.000000000001;
    const y2 = await TestValue(inputID, startingInput + h, outputID);
    const gradient = (y2 - y1) / h;
    const gradientSign = gradient >= 0 ? 1 : -1;

    if (y2 == desiredOutput) {
        return;
    }

    const stepSign = y2 < desiredOutput ? gradientSign : -1 * gradientSign;

    let currentValue = startingInput;
    let outputSign = y1 < desiredOutput ? -1 : 1;
    const initialPlaceValue = startingAccuracy == undefined ? -1 : startingAccuracy;
    for (let placeValue = initialPlaceValue; placeValue >= -MATCH_ACCURACY; placeValue -= 1) { //e.g. if placeValue 0, we are focusing on the 'ones' column
        const step = stepSign * 10**placeValue;

        //continue incrementing the step to currentValue until a change in outputSign
        while (true) {
            currentValue += step;
            const output = await TestValue(inputID, currentValue, outputID);
            const newOutputSign = output < desiredOutput ? -1 : 1;
            if (newOutputSign != outputSign) {
                currentValue -= step;
                break;
            }
        }
    }
}

const Wait = (t: number) => {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve("Done");
        }, t);
    });
    return promise;
}

const HelperExpressions = () => {
    const expressions: Desmos.ExpressionState[] = [
        { id: "HELPER-M_{AD}", latex: "M_{AD}=\\frac{d_{y}-a_{y}}{d_{x}-a_{x}}" },
        { id: "HELPER-M_{BD}", latex: "M_{BD}=\\frac{d_{y}-b_{y}}{d_{x}-b_{x}}" },
        { id: "HELPER-P_{MADMBD}", latex: "P_{MADMBD}=M_{AD}\\cdot M_{BD}" }
    ];
    return expressions;
}