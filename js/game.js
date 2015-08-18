console.log("game");

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


