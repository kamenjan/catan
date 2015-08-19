// Game objects and fields

// Half of width of flat top hexagons (x = 200, y = 173)
var hexSize = 100;

// Half of width of intersection buildings (x = 50, y = 50)
var buildingSize = 25;

// Half of width of top edge road (x = 50, y = 50)
var roadSize = 25;

var offset = 600;

// Graphics objects
var canvas;
var ctx;
var woolImage;
var desertImage;
var lumberImage;
var clayImage;
var clayReady;
var grainImage;
var grainReady;
var waterImage;
var waterReady;
var oreImage;

var villageImage;
var diagonalRoadWImage;
var diagonalRoadEImage;
var horizontalRoadImage;

// Game objects
var gameGrid;
var faces = [];
var intersections = [];
var edges = [];


// -----------------------------------------------------------------------------
//Classes

function Face(x, y, z, type) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.q = x;
    this.r = z;

    this.pixelPoint = axialToPixel(this.q, this.r);
    this.type = type;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}
;

function Intersection(face1, face2, face3, point) {
    this.faces = [];

    this.faces.push(face1);
    this.faces.push(face2);
    this.faces.push(face3);
    this.pixelPoint = point;
}
;

function Edge(face1, face2, point, direction) {
    this.faces = [];

    this.faces.push(face1);
    this.faces.push(face2);
    this.pixelPoint = point;

    this.direction = direction;
}

function Board() {

    // Function assinged only to "class", so instantiated objects can share it,
    // otherwise ( this.generateMap(){} ) it is created with each object instance 
    Board.prototype.generateMap = function (radius) {

        var resourceCounter = 0;
        var waterCounter = 0;

        // Populate resources[]
        this.resources = getResourceArray();
        this.waterTiles = getWaterArray(radius);

        // Populate faces[]
        for (var width = -radius; width <= radius; width++) {


            var r1 = Math.max(-radius, -width - radius);
            var r2 = Math.min(radius, -width + radius);

            for (var r = r1; r <= r2; r++) {
                if (Math.abs(width) === radius || (r === r1 || r === r2)) {
                    faces.push(new Face(width, r, -width - r, this.waterTiles[waterCounter]));
                    waterCounter++;
                } else {
                    faces.push(new Face(width, r, -width - r, this.resources[resourceCounter]));
                    resourceCounter++;
                }
            }
        }

        // Populate intersections[]
        faces.forEach(function (face) {

            var intersectionL;
            var intersectionLpixel;
            var faceL1, faceL2, faceL3;

            var intersectionR;
            var intersectionRpixel;
            var faceR1, faceR2, faceR3;

            var u = face.q;
            var v = face.r;

            // Asign all 2 (left and right intersections) * 3 faces to temp values 
            faces.forEach(function (temp_face) {
                // Get current and common face
                if (temp_face.q === u && temp_face.r === v) {
                    faceL1 = temp_face;
                    faceR1 = temp_face;
                }
                // Get leftmost faces for left intersection
                if (temp_face.q === u - 1 && temp_face.r === v) {
                    faceL2 = temp_face;
                }
                if (temp_face.q === u - 1 && temp_face.r === v + 1) {
                    faceL3 = temp_face;
                }
                // Get rightmost faces for right intersection
                if (temp_face.q === u + 1 && temp_face.r === v) {
                    faceR2 = temp_face;
                }
                if (temp_face.q === u + 1 && temp_face.r === v - 1) {
                    faceR3 = temp_face;
                }
            });

            // Calculate intersection W and E pixels based on face point and intersection image size
            intersectionLpixel = new Point(face.pixelPoint.x - buildingSize, face.pixelPoint.y + Math.sqrt(3) * hexSize / 2 - buildingSize);
            intersectionRpixel = new Point(face.pixelPoint.x + 2 * hexSize - buildingSize, face.pixelPoint.y + Math.sqrt(3) * hexSize / 2 - buildingSize);

            // Asign temp values to left and right intersection and populate intersections[]
            // If intersections has all three faces defined (is inside the playing field) add it to intersections[]
            if (faceL1 && faceL2 && faceL3) {
                intersections.push(new Intersection(faceL1, faceL2, faceL3, intersectionLpixel));
            }

            if (faceR1 && faceR2 && faceR3) {
                intersections.push(new Intersection(faceR1, faceR2, faceR3, intersectionRpixel));
            }
        });

        // Populate edges[]
        faces.forEach(function (face) {
            var edgeW;
            var edgeWpixel;
            var faceW1, faceW2;

            var edgeN;
            var edgeNpixel;
            var faceN1, faceN2;

            var edgeE;
            var edgeEpixel;
            var faceE1, faceE2;

            var u = face.q;
            var v = face.r;

            // Asign all 2 (left and right intersections) * 3 faces to temp values 
            faces.forEach(function (temp_face) {
                // Get current and common face
                if (temp_face.q === u && temp_face.r === v) {
                    faceW1 = temp_face;
                    faceN1 = temp_face;
                    faceE1 = temp_face;
                }
                if (temp_face.q === u - 1 && temp_face.r === v + 1) {
                    faceW2 = temp_face;
                }
                if (temp_face.q === u + 1 && temp_face.r === v) {
                    faceN2 = temp_face;
                }
                if (temp_face.q === u + 1 && temp_face.r === v) {
                    faceE2 = temp_face;
                }
            });

            edgeWpixelPoint = new Point(face.pixelPoint.x + hexSize / 4 - roadSize, face.pixelPoint.y + Math.sqrt(3) / 4 * hexSize - roadSize);
            edgeNpixelPoint = new Point(face.pixelPoint.x + hexSize - roadSize, face.pixelPoint.y - roadSize);
            edgeEpixelPoint = new Point(face.pixelPoint.x + hexSize * 7 / 4 - roadSize, face.pixelPoint.y + Math.sqrt(3) / 4 * hexSize - roadSize);

            if (faceW1 && faceW2) {
                edges.push(new Edge(faceW1, faceW2, edgeWpixelPoint, "W"));
            }

            if (faceN1 && faceN2) {
                edges.push(new Edge(faceN1, faceN2, edgeNpixelPoint, "N"));
            }

            if (faceE1 && faceE2) {
                edges.push(new Edge(faceE1, faceE2, edgeEpixelPoint, "E"));
            }
        });

    };
}
;

// -----------------------------------------------------------------------------
// Helper functions

// TODO - rename faceToPixel (accepts axial coordinates)
function axialToPixel(q, r) {

    var x = hexSize * 3 / 2 * q;
    var y = hexSize * Math.sqrt(3) * (r + q / 2);

    //console.log(x, y);
    return new Point(x, y);
}

// Graphics functions
// -----------------------------------------------------------------------------

function loadImages() {
    // Water image
    var waterReady = false;
    waterImage = new Image();
    waterImage.onload = function () {
        waterReady = true;
    };
    waterImage.src = "images/water.png";

    // Desert image
    var desertReady = false;
    desertImage = new Image();
    desertImage.onload = function () {
        desertReady = true;
    };
    desertImage.src = "images/desert.png";

// Lumber image
    var lumberReady = false;
    lumberImage = new Image();
    lumberImage.onload = function () {
        lumberReady = true;
    };
    lumberImage.src = "images/lumber.png";

// Clay image
    clayReady = false;
    clayImage = new Image();
    clayImage.onload = function () {
        clayReady = true;
    };
    clayImage.src = "images/clay.png";

// Wool image
    var woolReady = false;
    woolImage = new Image();
    woolImage.onload = function () {
        woolReady = true;
    };
    woolImage.src = "images/wool.png";

// Grain image
    grainReady = false;
    grainImage = new Image();
    grainImage.onload = function () {
        grainReady = true;
    };
    grainImage.src = "images/grain.png";

// Ore image
    var oreReady = false;
    oreImage = new Image();
    oreImage.onload = function () {
        oreReady = true;
    };
    oreImage.src = "images/ore.png";

    // Monster image
    var villageReady = false;
    villageImage = new Image();
    villageImage.onload = function () {
        villageReady = true;
    };
    villageImage.src = "images/village.png";

    // Diagonal W road image
    var diagonalRoadWReady = false;
    diagonalRoadWImage = new Image();
    diagonalRoadWImage.onload = function () {
        diagonalRoadWReady = true;
    };
    diagonalRoadWImage.src = "images/diagonalroadW.png";

    // Diagonal road image
    var diagonalRoadEReady = false;
    diagonalRoadEImage = new Image();
    diagonalRoadEImage.onload = function () {
        diagonalRoadEReady = true;
    };
    diagonalRoadEImage.src = "images/diagonalroadE.png";

    // Horizontal road image
    var horizontalRoadReady = false;
    horizontalRoadImage = new Image();
    horizontalRoadImage.onload = function () {
        horizontalRoadReady = true;
    };
    horizontalRoadImage.src = "images/horizontalroad.png";
}

// Draw everything
var render = function () {

    faces.forEach(function (face) {

        switch (face.type) {
            case "desert":
                ctx.drawImage(desertImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                break;
            case "lumber":
                ctx.drawImage(lumberImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                break;
            case "clay":
                if (clayReady) {
                    ctx.drawImage(clayImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                }
                break;
            case "wool":
                ctx.drawImage(woolImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                break;
            case "grain":
                if (grainReady) {
                    ctx.drawImage(grainImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                }
                break;
            case "ore":
                ctx.drawImage(oreImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                break;
            case "water":
                ctx.drawImage(waterImage, face.pixelPoint.x + offset, face.pixelPoint.y + offset);
                break;
        }
    });

    intersections.forEach(function (intersection) {
        ctx.drawImage(villageImage, intersection.pixelPoint.x + offset, intersection.pixelPoint.y + offset);
    });

    edges.forEach(function (edge) {
        var roadImage;

        switch (edge.direction) {
            case "W":
                roadImage = diagonalRoadWImage;
                break;
            case "N":
                roadImage = horizontalRoadImage;
                break;
            case "E":
                roadImage = diagonalRoadEImage;
                break;
        }

        ctx.drawImage(roadImage, edge.pixelPoint.x + offset, edge.pixelPoint.y + offset);
    });
};

// -----------------------------------------------------------------------------
// Game mehanics

function getWaterArray(radius) {
    var waterTiles = [];

    var tileCount = 6 * radius + 6;

    for (var i = 0; i < tileCount; i++) {
        waterTiles.push("water");
    }

    return waterTiles;
}

// Create resource array and shuffle it
function getResourceArray(radius) {

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
    // Create the canvas
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 1900;
    canvas.height = 1900;
    document.body.appendChild(canvas);

    gameGrid = new Board();
    gameGrid.generateMap(3);

    loadImages();

    console.log(edges); 
}

var main = function () {

    render();
    requestAnimationFrame(main);
};

init();
main();