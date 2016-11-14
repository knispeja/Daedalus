const MAZE_DIMENSION = 40; // in cells
const MESSAGE_DURATION = 6500; // in ms

const CELL_LENGTH = 75.0; // in px
const HALF_CELL = CELL_LENGTH / 2.0;

const USER_COLOR = "red";
const OBSTACLE_COLOR = "black";
const EMPTY_COLOR = "white";
const OBJECTIVE_COLOR = "lime";

const OBSTACLE_CELL = "obstacle";
const EMPTY_CELL = "empty";
const OBJECTIVE_CELL = "objective";

const INTERPOLATION_INCREMENT = 2; // in px

const TORCH_INNER_RADIUS_LOWER = 0.40;
const TORCH_INNER_RADIUS_UPPER = 0.45;
const TORCH_RADIUS_LOWER = 0.55;
const TORCH_RADIUS_UPPER = 0.80;
const TORCH_FLICKER_FRAMES_LOWER = 9;
const TORCH_FLICKER_FRAMES_UPPER = 19;
const INNER_TORCH_MULTIPLIER = 1/10.0;
const OUTER_TORCH_MULTIPLIER = 1/2.2;

const NUM_WALL_OPTIONS = 3;
const NUM_FLOOR_OPTIONS = 1;

const TOP = 1;
const RIGHT = 2;
const BOTTOM = 3;
const LEFT = 4;

function YarnContainer(numOptions, path) {
    this.numOptions = numOptions;
    this.path = path;
    this.images = [];
}
var yarnPath = 'resources/yarn/';
var yarnVertical = new YarnContainer(3, yarnPath + 'vertical/');
var yarnHorizontal = new YarnContainer(4, yarnPath + 'horizontal/');
var yarnTopToRight = new YarnContainer(2, yarnPath + 'topToRight/');
var yarnRightToBot = new YarnContainer(2, yarnPath + 'rightToBot/');
var yarnBotToLeft = new YarnContainer(2, yarnPath + 'botToLeft/');
var yarnLeftToTop = new YarnContainer(2, yarnPath + 'leftToTop/');

var canvas;
var ctx;

// user input directions
var up;
var down;
var left;
var right;

var maze = [];
var userLocation = {x:0, y:0};
var userDrawnLocation = {x:0, y:0};
var originalLocation = {x:0, y:0};
var objectiveCell;
var cols;
var rows;

var frameRadiusX;
var frameRadiusY;
var trueFrameRadiusX;
var trueFrameRadiusY;

var torchFlickerFrames = TORCH_FLICKER_FRAMES_LOWER;
var torchFlickerCounter = 0;
var innerTorchRadius = 0;
var torchRadius = 0;

var stepsTaken = 0;
var optimalPath = 0;

var interpOffset = {x:0, y:0, mag:0};

var originalYarn = 0;
var yarn = 0;
var maxQuality = true;

var wallTileImage;
var floorTileImage;
var yarnImage;
var openDoorImage;
var closedDoorImage;

var minotaurIsKilled = false;

function oppositeSide(side) {
    switch(side) {
        case TOP:
            return BOTTOM;
        case BOTTOM:
            return TOP;
        case RIGHT:
            return LEFT;
        case LEFT:
            return RIGHT;
    }
}

function decideTileset() {

    var yarnContainers = [yarnBotToLeft, yarnLeftToTop, yarnTopToRight, yarnRightToBot, yarnHorizontal, yarnVertical];
    for (var i=0; i<yarnContainers.length; i++) {
        var yarn = yarnContainers[i];
        var yarnImages = yarn.images;
        for (var j=0; j<yarn.numOptions; j++) {
            yarnImages.push(new Image());
            yarnImages[j].src = yarn.path + (j + 1) + ".png";
        }
    }

    openDoorImage = new Image();
    openDoorImage.src = 'resources/door_open.png';
    closedDoorImage = new Image();
    closedDoorImage.src = 'resources/door_closed.png';

    wallTileImage = new Image();
    floorTileImage = new Image();
    yarnImage = new Image();

    yarnImage.src = "resources/yarn/yarn.png";
    
    var ext = ".jpg";
    var wallNum = randomIntFromZero(NUM_WALL_OPTIONS) + 1;
    wallTileImage.src = "resources/wall/" + wallNum + ext;
    
    var floorNum = randomIntFromZero(NUM_FLOOR_OPTIONS) + 1;
    floorTileImage.src = "resources/floor/" + floorNum + ext;
}

function Cell(type, x, y, color) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.color = color;
    this.neighbors = [];
    this.accessibleNeighbors = [];

    this.lastEnteredFrom = undefined;
    this.stringImage = undefined;

    this.isObjective = function() {return this.type == OBJECTIVE_CELL;}
    this.isObstacle = function() {return this.type == OBSTACLE_CELL;}
    this.isEmpty = function() {return this.type == EMPTY_CELL;}

    this.equals = function(other) {return this.x == other.x && this.y == other.y;}

    this.convertToEmpty = function() {
        this.type = EMPTY_CELL;
        this.color = EMPTY_COLOR;
    }

    this.convertToObstacle = function() {
        this.type = OBSTACLE_CELL;
        this.color = OBSTACLE_COLOR;
    }

    this.draw = function(drawColor = this.color, xmod = this.x, ymod = this.y, noOffset = false) {
        ctx.fillStyle = drawColor;

        var defMod = CELL_LENGTH;
        var xOff = noOffset ? 0 : (interpOffset.x * interpOffset.mag);
        var yOff = noOffset ? 0 : (interpOffset.y * interpOffset.mag);

        var rectX = xmod * CELL_LENGTH + xOff - defMod;
        var rectY = ymod * CELL_LENGTH + yOff - defMod;

        if (drawColor == USER_COLOR) {
            ctx.fillRect(
                rectX, 
                rectY, 
                CELL_LENGTH, 
                CELL_LENGTH
            );
            userDrawnLocation.x = rectX;
            userDrawnLocation.y = rectY;
        } else {
            var drawImg;
            if (maxQuality) {
                if (this.isObstacle()) {
                    drawImg = wallTileImage;
                } else if (this.isEmpty()) {
                    drawImg = floorTileImage;
                } else if (this.isObjective()) {

                    ctx.drawImage(
                        wallTileImage,
                        rectX,
                        rectY,
                        CELL_LENGTH,
                        CELL_LENGTH
                    );

                    drawImg = minotaurIsKilled ? openDoorImage : closedDoorImage;
                }
            }

            if (drawImg) {
                ctx.drawImage(
                    drawImg,
                    rectX,
                    rectY,
                    CELL_LENGTH,
                    CELL_LENGTH
                );
            } else {
                ctx.fillRect(
                    rectX,
                    rectY,
                    CELL_LENGTH,
                    CELL_LENGTH
                );
            }

            if (this.stringImage) {
                ctx.drawImage(
                    this.stringImage,
                    rectX,
                    rectY,
                    CELL_LENGTH,
                    CELL_LENGTH
                );
            }
        }
    }

    this.drawAt = function(x, y, drawColor = this.color, noOffset = false) {
        this.draw(drawColor, x, y, noOffset);
    }
}

function makeObjectiveCell(x, y) {return new Cell(OBJECTIVE_CELL, x, y, OBJECTIVE_COLOR);}
function makeEmptyCell(x, y) {return new Cell(EMPTY_CELL, x, y, EMPTY_COLOR);}

function getCellAtUserLocation() {
    return maze[userLocation.y][userLocation.x];
}

function updateCanvasSize(redraw = true) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var cellsX = Math.ceil(canvas.width / CELL_LENGTH);
    var cellsY = Math.ceil(canvas.height / CELL_LENGTH);
    frameRadiusX = Math.ceil(cellsX / 2.0);
    frameRadiusY = Math.ceil(cellsY / 2.0);
    trueFrameRadiusX = trueFrameRadiusY = Math.min(frameRadiusX, frameRadiusY);

    if(redraw) drawMaze();
}

/*
    Modifies the given maze m, assumed empty, to be a fully-connected maze.

    This method starts with a grid of walls. Every wall is considered for
    removal, in random order. A wall is only removed if the empty spaces
    on either side of that wall are NOT already connected by empty space.

    More here: http://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
*/
function generateMazeKruskal(m) {

    // TODO: eyespots

    // Edges that will be considered for removal
    var edges = [];

    // Place initial grid and fill edges array
    for(var row=0; row<rows; row++) {
        for(var col=0; col<cols; col++) {
            var rowMod = (row % 2 == 0);
            var colMod = (col % 2 == 0);
            if(rowMod || colMod) {
                m[row][col].convertToObstacle();
                if (rowMod != colMod) edges.push(m[row][col]);
            }
            else {
                var c = [];
                c.push(m[row][col]);

                // We don't have to update quite as many references if we store the sets in an object
                // rather than just as a simple array. See note labeled @setObjects below...
                m[row][col].containingSet = {set:c};
            }
        }
    }
    
    // Generate graph
    generateGraphForMaze(m);

    // Loop over the list of relevant edges
    while(edges.length > 0) {

        // Choose a random edge and remove it from the list of edges
        var edgeInd = randomIndexOf(edges);
        var edge = edges[edgeInd];
        edges.splice(edgeInd, 1);
        
        // Gather all empty cell neighbors in n0 and n1
        var n0 = false;
        var n1 = false;
        var extra = false;
        for(var i=0; i<edge.accessibleNeighbors.length; i++) {
            var neighbor = edge.accessibleNeighbors[i];

            if(!n0) n0 = neighbor;
            else if(!n1) n1 = neighbor;
            else extra = true;
        }

        // Consider tearing the wall down only if there are exactly
        // TWO empty neighbors -- any less/more and it wouldn't make sense
        if(n0 && n1 && !extra) {
            var set0 = n0.containingSet.set;
            var set1 = n1.containingSet.set;

            // Check if the spaces are joined or not
            if(set0 !== set1) {
                
                m[edge.y][edge.x].convertToEmpty();

                // Array of length 2, the smaller array is at 0, bigger is at 1
                var setsBySize = set0.length > set1.length ? [set1, set0] : [set0, set1];

                var setContainer = setsBySize[1][0].containingSet;
                m[edge.y][edge.x].containingSet = setContainer;

                // @setObjects
                // Rather than have to update every set in every tile, we now only have to
                // update half at the most -- we can force all tiles in the same set to have
                // the same containingSet object, so that's the only reference we need to update
                setsBySize[1][0].containingSet.set = set0.concat(set1); // instantly update all references in the bigger set
                for(var i=0; i<setsBySize[0].length; i++) // update references in the smaller set
                    setsBySize[0][i].containingSet = setContainer;
            }
        }
    }
}

/*
    Modifies the given maze m, assumed empty, to be a fully-connected maze.

    This method starts with a grid of walls. A path is carved through the grid
    by recursive backtracking/wandering -- tends to create river-like mazes.

    More here: http://weblog.jamisbuck.org/2010/12/27/maze-generation-recursive-backtracking
*/
function generateMazeRecursiveBacktracking(m) {

    // Place initial grid
    for(var row=0; row<rows; row++) {
        for(var col=0; col<cols; col++) {
            if(row % 2 == 0 || col % 2 == 0)
                m[row][col].convertToObstacle();
            else
                m[row][col].visited = false;
        }
    }

    // Generate graph for neighbors
    generateGraphForMaze(m);

    // Get a random blank space as a starting point
    // This method is faster/more memory efficient than storing all blanks in an array
    var numBlanks = ((cols - 1)*(rows - 1))/4; // assumes odd rows/cols
    var blankCols = (cols - 1)/2;
    var blankRows = (rows - 1)/2;

    // Faster than running Math.rand() twice for cols and rows. Instead
    // I just generate one number using the total blanks and derive the
    // column/row position of the blank from that number
    var blankNum = Math.floor(Math.random() * numBlanks);
    var blankRow = (blankNum % blankRows) * 2 + 1;
    var blankCol = (blankNum % blankCols) * 2 + 1

    // Recursive wandering
    function carvePassages(cell) {

        cell.visited = true;

        var shuffledNeighbors = shuffleArray(cell.neighbors);

        for(var i=0; i<shuffledNeighbors.length; i++) {
            var neighbor = shuffledNeighbors[i];
            if(neighbor.isObstacle()) {
                for(var j=0; j<neighbor.accessibleNeighbors.length; j++) {
                    var adjacentEmptyCell = neighbor.accessibleNeighbors[j];
                    if(!adjacentEmptyCell.visited) {
                        neighbor.convertToEmpty();
                        carvePassages(adjacentEmptyCell);
                    }
                }
            }
        }
    }

    carvePassages(m[blankRow][blankCol]);
}

// Returns a new maze (2D array, row-indexed first) using the user-selected method
function generateMaze() {
    var newMaze = [];

    // Generate empty maze
    for(var row=0; row<rows; row++) {
        var newRow = [];
        for(var col=0; col<cols; col++) {
            newRow.push(makeEmptyCell(col, row));
        }
        newMaze.push(newRow);
    }

    // Generate maze innards -- these methods will not place starting/ending pts
    generateMazeKruskal(newMaze);
    //generateMazeRecursiveBacktracking(newMaze);

    // Place objective and starting point along top wall
    for(var col=cols-2; col>=0; col--) {
        if(newMaze[1][col].isEmpty()) {
            userLocation = {x: col, y: 1};
            newMaze[1][col].lastEnteredFrom = TOP;
            objectiveCell = makeObjectiveCell(cols-1, row);
            newMaze[0][col] = objectiveCell;
            break;
        }
    }

    return newMaze;
}

// Only pass frameKey/old user position if interpolation is desired
function drawMaze(interpolate = false, oldUserLocation = userLocation, recurseCount = 0) {

    // Clear the canvas so we only have to draw the walls
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(recurseCount == 0) {
        var offX, offY;
        if (oldUserLocation.x == userLocation.x) offX = 0;
        else if (oldUserLocation.x > userLocation.x) offX = -1;
        else offX = 1;

        if (oldUserLocation.y == userLocation.y) offY = 0;
        else if (oldUserLocation.y > userLocation.y) offY = -1;
        else offY = 1;

        interpOffset = {x: offX, y: offY, mag: CELL_LENGTH};
    }

    if(interpolate) {
        interpOffset.mag -= INTERPOLATION_INCREMENT;
        if (interpOffset.mag < 0) {
            interpOffset.mag = 0;
        }
    }

    var rowStart = userLocation.y - trueFrameRadiusY - 1;
    if (rowStart < 0) rowStart = 0;
    var colStart = userLocation.x - trueFrameRadiusX - 1;
    if (colStart < 0) colStart = 0;

    var rowEnd = userLocation.y + trueFrameRadiusY;
    if (rowEnd >= rows) rowEnd = rows - 1;
    var colEnd = userLocation.x + trueFrameRadiusX;
    if (colEnd >= cols) colEnd = cols - 1;

    var drawLast;
    for(var row=rowStart; row<=rowEnd; row++) {
        for(var col=colStart; col<=colEnd; col++) {

            var cell = maze[row][col];
            var isUser = false;
            if (userLocation.x == col && userLocation.y == row) {
               isUser = true;
            }
            if (!maxQuality && cell.isEmpty() && !isUser) {
                continue;
            }

            var x = (col - userLocation.x) + frameRadiusX;
            var y = (row - userLocation.y) + frameRadiusY;

            if (isUser) {
                drawLast = {x: x, y: y, cell: cell};
            }

            cell.drawAt(x, y);
        }
    }
    drawLast.cell.drawAt(drawLast.x, drawLast.y, USER_COLOR, true)

    drawLightingEffects();
    drawYarn();

    // Either continue interpolation, recall user input function, or stop entirely
    if (interpolate) {
        if (interpOffset.mag == 0) {
            reactToUserInput();
        } else {
            setTimeout(function () {
                drawMaze(true, oldUserLocation, recurseCount + 1);
            }, 0);
        }
        return;
    }
}

function drawLightingEffects() {
    gradX = userDrawnLocation.x + HALF_CELL;
    gradY = userDrawnLocation.y + HALF_CELL;
    gradient = ctx.createRadialGradient(
        gradX,
        gradY,
        canvas.height*INNER_TORCH_MULTIPLIER,
        gradX,
        gradY,
        canvas.height*OUTER_TORCH_MULTIPLIER
    );
    gradient.addColorStop(0, "rgba(248, 195, 119, 0.25)");

    if (maxQuality) {
        if (++torchFlickerCounter == torchFlickerFrames) {

            torchFlickerFrames = Math.floor(randRange(
                TORCH_FLICKER_FRAMES_LOWER,
                TORCH_FLICKER_FRAMES_UPPER
            ));

            torchFlickerCounter = 0;
            innerTorchRadius = randRange(
                TORCH_INNER_RADIUS_LOWER,
                TORCH_INNER_RADIUS_UPPER
            ).toFixed(2);
            torchRadius = randRange(
                TORCH_RADIUS_LOWER,
                TORCH_RADIUS_UPPER
            ).toFixed(2);
        }

        gradient.addColorStop(0.5, "rgba(118, 75, 9, " + innerTorchRadius + ")");
        gradient.addColorStop(0.80, "rgba(18, 0, 0, " + torchRadius + ")");
    }

    gradient.addColorStop(1, "rgba(0, 0, 0, 1.00)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawYarn() {
    var yarnX = (canvas.width - trueFrameRadiusX * CELL_LENGTH) / 8.0;
    var yarnY = -(yarnImage.height - yarnImage.height * (yarn * 1.0 / originalYarn));
    ctx.drawImage(
        yarnImage,
        yarnX,
        yarnY
    );
}

function chooseYarnImage(yarnContainer) {
    return yarnContainer.images[randomIndexOf(yarnContainer.images)];
}

function setMessage(text) {
    var mazeText = document.getElementById("mazeText");
    var message =
        "<i>\"" +
        text +
        "\"</i>";
    if (mazeText.innerHTML === message) return; // don't push message if it is equivalent
    mazeText.innerHTML = message;
    setTimeout(function() {
        document.getElementById("mazeText").innerHTML = "";
    }, MESSAGE_DURATION);
}

function isTraversable(cell) {
    return !(!cell || cell.isObstacle() || (cell.isObjective() && !minotaurIsKilled));
}

// Runs every USER_INPUT_WAIT_MS, so needs to be fast
function reactToUserInput() {

    // Ignore conflicting input
    if(!((up && down) || (left && right))) {
        
        var needsRedraw = false;

        var oldLocation = {x:userLocation.x, y:userLocation.y};

        var oldCell = getCellAtUserLocation();
        var newCell;

        // Determine new location if there is one...
        var directionMoved = false;
        if(up && userLocation.y != 0) {
            newCell = maze[userLocation.y - 1][userLocation.x];
            directionMoved = TOP;
        }
        else if(down && userLocation.y != cols - 1) {
            newCell = maze[userLocation.y + 1][userLocation.x];
            directionMoved = BOTTOM;
        }

        if(!isTraversable(newCell)) {
            if(left) {
                newCell = maze[userLocation.y][userLocation.x - 1];
                directionMoved = LEFT;
            }
            else if(right) {
                newCell = maze[userLocation.y][userLocation.x + 1];
                directionMoved = RIGHT;
            }
        }

        if (newCell && newCell.isObjective() && !minotaurIsKilled) {
            setMessage("I can't leave until the Minotaur lies dead.");
        }

        // Player moved to a valid space
        if(isTraversable(newCell) && !newCell.equals(oldCell)) {

            userLocation = {x: newCell.x, y: newCell.y};
            needsRedraw = true;

            if (!minotaurIsKilled) {
                // Pick up yarn or set lastEnteredFrom
                if (!newCell.stringImage && yarn)
                    newCell.lastEnteredFrom = oppositeSide(directionMoved);
                else if (newCell.stringImage) {
                    yarn += 2;
                    newCell.stringImage = undefined;
                }

                // Set yarn image
                if (!oldCell.stringImage && yarn) {
                    if ((oldCell.lastEnteredFrom === BOTTOM && directionMoved === TOP) ||
                        (oldCell.lastEnteredFrom === TOP && directionMoved === BOTTOM)) {
                        oldCell.stringImage = chooseYarnImage(yarnVertical);
                    } else if ((oldCell.lastEnteredFrom === LEFT && directionMoved === RIGHT) ||
                        (oldCell.lastEnteredFrom === RIGHT && directionMoved === LEFT)) {
                        oldCell.stringImage = chooseYarnImage(yarnHorizontal);
                    } else if ((oldCell.lastEnteredFrom === BOTTOM && directionMoved === LEFT) ||
                        (oldCell.lastEnteredFrom === LEFT && directionMoved === BOTTOM)) {
                        oldCell.stringImage = chooseYarnImage(yarnBotToLeft);
                    } else if ((oldCell.lastEnteredFrom === LEFT && directionMoved === TOP) ||
                        (oldCell.lastEnteredFrom === TOP && directionMoved === LEFT)) {
                        oldCell.stringImage = chooseYarnImage(yarnLeftToTop);
                    } else if ((oldCell.lastEnteredFrom === TOP && directionMoved === RIGHT) ||
                        (oldCell.lastEnteredFrom === RIGHT && directionMoved === TOP)) {
                        oldCell.stringImage = chooseYarnImage(yarnTopToRight);
                    } else if ((oldCell.lastEnteredFrom === RIGHT && directionMoved === BOTTOM) ||
                        (oldCell.lastEnteredFrom === BOTTOM && directionMoved === RIGHT)) {
                        oldCell.stringImage = chooseYarnImage(yarnRightToBot);
                    }
                }

                // Update yarn
                if(yarn != 0) {
                    yarn--;
                    if(yarn === 0)
                        setMessage("I've run out of thread...");
                }
            }

            // Update steps
            stepsTaken++;

            // Player reached the objective
            if(newCell.isObjective()) {
                var message = "Congratulations, you solved the maze!";
                message += "\nSteps taken:  " + stepsTaken;
                message += "\nOptimal path: " + optimalPath;
                alert(message);
            }
        }

        if(needsRedraw) {
            // Redraw canvas with interpolation
            drawMaze(true, oldLocation, 0);
            return; // drawMaze will call this function when it's done
        }
    }

    drawMaze();
    setTimeout(reactToUserInput, 0);
}

function resetMaze() {
    up = down = left = right = false;
    stepsTaken = 0;
    userLocation = originalLocation;
}

// If the inputs are appropriate, purges the current maze and generates a new one in its place.
// Resets any variables like user position, held keys, paths, etc. that the old maze relied on.
function remakeMaze() {

    // Reset any variables from the previous maze
    resetMaze();

    // Get columns and rows from the input boxes
    cols = MAZE_DIMENSION;
    rows = MAZE_DIMENSION;

    // Limit numbers to odd values
    if(cols % 2 == 0) cols++;
    if(rows % 2 == 0) rows++;

    // Generate maze and update the canvas...
    updateCanvasSize(false);

    maze = generateMaze();

    // Solve the maze in order to get the optimal number of steps
    // Function automatically changes optimalPath to the optimal number of steps
    solveMaze(false); // false prevents solution from displaying
}

function onKeyDown(event) {

    var keyCode = event.keyCode;

    // Respond to directional inputs
    switch(keyCode) {
        case 27:  //escape
            maxQuality = !maxQuality;
            break;
        case 38:  //up arrow
        case 87:  //w
            event.preventDefault();
            up = true;
            break;
        case 37:  //left arrow
        case 65:  //a
            event.preventDefault();
            left = true;
            break;
        case 40:  //down arrow
        case 83:  //s
            event.preventDefault();
            down = true;
            break;
        case 39:  //right arrow
        case 68:  //d
            event.preventDefault();
            right = true;
            break;
    }
}

function onKeyUp(event) {

    var keyCode = event.keyCode;

    // Always keep track of direction inputs being released
    switch(keyCode){
        case 38:  //up arrow
        case 87:  //w
            up = false;
            break;
        case 37:  //left arrow
        case 65:  //a
            left = false;
            break;
        case 40:  //down arrow
        case 83:  //s
            down = false;
            break;
        case 39:  //right arrow
        case 68:  //d
            right = false;
            break;
    }
}

// Add event listeners for moving about the maze
function addEventListeners() {
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
}

function hideCanvas() {
    canvas.style.display="none";
}

function showCanvas() {
    canvas.style.display="block";
}

function computeBaseYarnAmt() {
    return MAZE_DIMENSION;
}

function beginMazeNav(extraYarn) {
    document.body.style.backgroundColor = "black";
    yarn = extraYarn + computeBaseYarnAmt();
    originalYarn = yarn;
    showCanvas();
    reactToUserInput();
}

// Runs on load
function mazeGenInit() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    decideTileset();
    remakeMaze();
    addEventListeners();
}

window.onload = mazeGenInit;