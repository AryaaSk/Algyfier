"use strict";
//Need to make a shape system
var ShapeType;
(function (ShapeType) {
    ShapeType[ShapeType["Circle"] = 0] = "Circle";
    ShapeType[ShapeType["Polygon"] = 1] = "Polygon";
    ShapeType[ShapeType["Line"] = 2] = "Line";
})(ShapeType || (ShapeType = {}));
const Point = (x, y) => {
    return { x: x, y: y };
};
class Shape {
    type = undefined;
    CreateEquation() { }
}
class Circle extends Shape {
    radius = 0;
    center = Point(0, 0);
    constructor(radius, center) {
        super();
        this.type = ShapeType.Circle;
        this.radius = radius;
        this.center = center;
    }
    CreateEquation() {
        return `(x - ${this.center.x})^2 + (y - ${this.center.y})^2 = ${this.radius}^2`;
    }
}
/*
//User wants to add a general circle
const circleRadius = General("r", "Radius of base circle", 10);
scene.generals.push(circleRadius);
const circle = new Circle();
scene.baseObject = circle;
*/ 
