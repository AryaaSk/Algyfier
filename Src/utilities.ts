//File to store all functions which provide utilities to extract data from the desmos calculator
//E.g. the distance between 2 points, area under given curve
//Most important function: match(input, output, desiredValue)

const Match = (input: string, output: string, desiredValue: number) => {
    //input and output are both latex for the id's of the sliders which we are dealing with
    //e.g. input may be a point's x coordinate, and output may be something calculated, e.g. the distance between that point and another
    //this function will use a 'gradient descent' like algorithm to adjust the input up and down until the output's value is the desired value

    //'gradient descent' like algorithm
    //find gradient at current value of input (by adding very small value of h and noting the change in output)
    //if current output is too low, then move up, otherwise move down
    //adjust step size proportional to how close current output's value is to the desired value
}