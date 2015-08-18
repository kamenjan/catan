// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 900;
document.body.appendChild(canvas);


// Tile images
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};

// -----------------------------------------------------------------------------
// Game objects adn fields

// Size of hexagons for axialToPixel
var size = 100;
var basicMap;

// Graphics objects

// Desert image
var desertReady = false;
var desertImage = new Image();
desertImage.onload = function () {
    desertReady = true;
};
desertImage.src = "images/desert.png";

// Lumber image
var lumberReady = false;
var lumberImage = new Image();
lumberImage.onload = function () {
    lumberReady = true;
};
lumberImage.src = "images/lumber.png";

// Clay image
var clayReady = false;
var clayImage = new Image();
clayImage.onload = function () {
    clayReady = true;
};
clayImage.src = "images/clay.png";

// Wool image
var woolReady = false;
var woolImage = new Image();
woolImage.onload = function () {
    woolReady = true;
};
woolImage.src = "images/wool.png";

// Grain image
var grainReady = false;
var grainImage = new Image();
grainImage.onload = function () {
    grainReady = true;
};
grainImage.src = "images/grain.png";

// Ore image
var oreReady = false;
var oreImage = new Image();
oreImage.onload = function () {
    oreReady = true;
};
oreImage.src = "images/ore.png";

// -----------------------------------------------------------------------------
//Classes

function CubeTile(x, y, z, type) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;

}
;

function Hexagon(x, y, z, type) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;

    this.q = q;
    this.r = r;
    
}
;

function AxialTile(q, r) {
    this.q = q;
    this.r = r;
}
;

function Point(x, y) {
    this.x = x;
    this.y = y;
}
;

function Intersection(face1, face2, face3, point) {
    this.face1 = face1;
    this.face2 = face2;
    this.face3 = face3;
    this.point = point;
}
;

function Board() {

    // Proper way of defining objects field as opposed to " var grid = []; "
    this.grid = [];

    this.intersections = [];

    //this.resources = getResourceArray();
    this.resources = testResourceArray();

    // Function assinged only to "class", so instantiated objects can share it,
    // otherwise ( this.generateMap(){} ) it is created with each object instance 
    Board.prototype.generateMap = function (radius) {
        var resourceCounter = 0;

        for (var width = -radius; width <= radius; width++) {
            var r1 = Math.max(-radius, -width - radius);
            var r2 = Math.min(radius, -width + radius);

            for (var r = r1; r <= r2; r++) {
                this.grid.push(new CubeTile(width, r, -width - r, this.resources[resourceCounter]));
                resourceCounter++;
            }
        }
    };
}
;

// debug function
function testResourceArray() {

    var resources = [];
    resources.push("desert");
    resources.push("desert");
    resources.push("desert");
    resources.push("ore");
    resources.push("ore");
    resources.push("ore");
    resources.push("ore");
    resources.push("clay");
    resources.push("clay");
    resources.push("clay");
    resources.push("clay");
    resources.push("lumber");
    resources.push("lumber");
    resources.push("lumber");
    resources.push("lumber");
    resources.push("wool");
    resources.push("wool");
    resources.push("wool");
    resources.push("wool");
    
    return resources;
}

// -----------------------------------------------------------------------------
// Helper functions

function cubeToAxial(cubeCoordinates) {

    // If we pass array as argument, return converted array, otherwise
    // return a single AxialTile cooridnates
    if (Array.isArray(cubeCoordinates)) {

        var axialCoordinates = [];

        cubeCoordinates.forEach(function (coordinates) {
            var q = coordinates.x;
            var r = coordinates.z;

            axialCoordinates.push(new AxialTile(q, r));
        });

        return axialCoordinates;

    } else {

        var axialCoordinates;

        var q = cubeCoordinates.x;
        var r = cubeCoordinates.z;

        axialCoordinates = new AxialTile(q, r);

        return axialCoordinates;
    }
}

// TODO - rename faceToPixel (accepts axial coordinates)
function axialToPixel(axialCoordinates) {

    var x = size * 3 / 2 * axialCoordinates.q;
    var y = size * Math.sqrt(3) * (axialCoordinates.r + axialCoordinates.q / 2);

    return new Point(x, y);
}

function intersectionsToPixel(face, direction) {

    switch (direction) {
        case "left":
            var x = size * 3 / 2 * face.q - size;
            var y = size * Math.sqrt(3) * (face.r + face.q / 2);
            break;
        case "right":
            var x = size * 3 / 2 * face.q + size;
            var y = size * Math.sqrt(3) * (face.r + face.q / 2);
    }

    return new Point(x, y);
}

// User interface functions
// -----------------------------------------------------------------------------

// Draw everything
var render = function () {

    basicMap.grid.forEach(function (hex) {
        var offset = 400;

        var point = axialToPixel(cubeToAxial(hex));

        switch (hex.type) {
            case "desert":
                ctx.drawImage(desertImage, point.x + offset, point.y + offset);
                break;
            case "lumber":
                ctx.drawImage(lumberImage, point.x + offset, point.y + offset);
                break;
            case "clay":
                ctx.drawImage(clayImage, point.x + offset, point.y + offset);
                break;
            case "wool":
                ctx.drawImage(woolImage, point.x + offset, point.y + offset);
                break;
            case "grain":
                ctx.drawImage(grainImage, point.x + offset, point.y + offset);
                break;
            case "ore":
                ctx.drawImage(oreImage, point.x + offset, point.y + offset);
                break;
        }


        //ctx.drawImage(desertImage, point.x + offset, point.y + offset);
        //console.log(hex);
    });

//    if (shipReady) {
//        ctx.drawImage(shipImage, ship.x, ship.y);
//    }
};

// -----------------------------------------------------------------------------
// Game mehanics

// Create intersection array
function getIntersections() {

    var faceCoordinates = cubeToAxial(basicMap.grid);

    var intersections = [];

    faceCoordinates.forEach(function (face) {

        var u = face.q;
        var v = face.r;

        intersections.push(new Intersection(
                new AxialTile(u, v),
                new AxialTile(u - 1, v),
                new AxialTile(u - 1, v = 1),
                intersectionsToPixel(face, "left")));

        intersections.push(new Intersection(
                new AxialTile(u + 1, v),
                new AxialTile(u + 1, v - 1),
                new AxialTile(u, v),
                intersectionsToPixel(face, "right")));
    });

    return intersections;
}

// Create resource array and shuffle it
function getResourceArray() {

    var resources = [];

    for (var i = 0; i < 4; i++) {
        if (i < 1)
            resources.push("desert");

        if (i < 3) {
            resources.push("ore");
            resources.push("clay");
        }
        resources.push("lumber");
        resources.push("wool");
        resources.push("grain");
    }

    var counter = resources.length, temp, index;

    // While there are elements in the resources
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = resources[counter];
        resources[counter] = resources[index];
        resources[index] = temp;
    }


    return resources;
}

// Assignment expression with function expression on the right side
function init() {
    basicMap = new Board();
    basicMap.generateMap(2);


    // debugging foreach lopp
    basicMap.grid.forEach(function (tile) {
        //console.log(tile.x, tile.y, tile.z);
    });

    var count = 0;
    getIntersections().forEach(function (intersection) {
        count++;
        console.log(intersection);
    });

    console.log(count);
}

var main = function () {

    render();
    requestAnimationFrame(main);
};

init();
main();