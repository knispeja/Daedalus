// Enum for both draw and direction enums
const NONE = 0;

// Special draw enums (0 reserved because it is falsy)
const USER = 1;
const MINOTAUR_EYES = 2;
const TILE_HIGHLIGHT = 3;

// Directional enums
// NOTE: Although an enum, the order is important as it defines the tileset orientation.
//       For example, the Theseus tileset faces down, then left, then right, then up.
const BOTTOM = 1;
const LEFT = 2;
const RIGHT = 3;
const TOP = 4;

// Function to get the opposite directional enum
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
        default:
            return NONE;
    }
}

// Cell type enums
const OBSTACLE_CELL = "obstacle";
const EMPTY_CELL = "empty";
const OBJECTIVE_CELL = "objective";

// Difficulty and gameplay-related constants
const KRUSKAL_MIN_THRESHOLD = 0.4;
const MAZE_DIMENSION_MAX = 120; // in cells
const MAZE_DIMENSION_MIN_PERCENT = 0.20;
const TIME_TO_SHOW_SOLUTION = 10000; // in ms
const YARN_TRADE_PERCENT_OF_ORIGINAL = 0.4;
const TIME_BEFORE_OFFERING_HINT = 1000; // in ms

// Quality of life and rendering constants
const MESSAGE_DURATION = 6500; // in ms
const CELL_LENGTH = 64.0; // in px
const HALF_CELL = CELL_LENGTH / 2.0;
const INTERPOLATION_INCREMENT = 2; // in px, 1 is perfect rendering

// Torch constants
const TORCH_INNER_RADIUS_LOWER = 0.40;
const TORCH_INNER_RADIUS_UPPER = 0.45;
const TORCH_RADIUS_LOWER = 0.55;
const TORCH_RADIUS_UPPER = 0.80;
const TORCH_FLICKER_FRAMES_LOWER = 9;
const TORCH_FLICKER_FRAMES_UPPER = 19;
const INNER_TORCH_MULTIPLIER = 0.1;
const OUTER_TORCH_MULTIPLIER = 0.45;
const OUTER_TORCH_MULTIPLIER_HINT = 0.5;

// Theseus animation constants
const THESEUS_ANIMATION_TICKS_PER_FRAME = CELL_LENGTH/4;
const THESUES_ANIMATION_FRAMES = 3;
const TILESET_TILE_SIZE = 32; // in px

// Number of options for various images
const NUM_WALL_OPTIONS = 3;
const NUM_FLOOR_OPTIONS = 1;

// Yarn container stuff -- YarnContainer simplifies yarn drawing
function YarnContainer(numOptions, path) {
    this.numOptions = numOptions;
    this.path = path;
    this.images = [];
}
var yarnPath = 'resources/yarn/';
var yarnVertical = new YarnContainer(4, yarnPath + 'vertical/');
var yarnHorizontal = new YarnContainer(4, yarnPath + 'horizontal/');
var yarnTopToRight = new YarnContainer(2, yarnPath + 'topToRight/');
var yarnRightToBot = new YarnContainer(2, yarnPath + 'rightToBot/');
var yarnBotToLeft = new YarnContainer(2, yarnPath + 'botToLeft/');
var yarnLeftToTop = new YarnContainer(2, yarnPath + 'leftToTop/');

// Global DOM elements
var canvas;
var ctx;
var tradeBtn;

// User input directionals
var up;
var down;
var left;
var right;

// Important maze globals
var maze = [];
var cols;
var rows;
var originalLocation = {x:0, y:0};
var objectiveCell;

// User-related variables
var userLocation = {x:0, y:0};
var userDrawnLocation = {x:0, y:0};
var directionMoved = BOTTOM;

// Drawing-related
var highQualityMode = true; // same as "!highPerformanceMode" (toggle via ESC)
var mazeDimension; // height/width of the maze in cells
var frameRadiusX;
var frameRadiusY;
var trueFrameRadiusX;
var trueFrameRadiusY;
var interpOffset = {x:0, y:0, mag:0}; // used in interpolation
var interpolationAdj = 0; // adjusts interpolation increment for higher performance
var lastYarnIndex = 0; // helps prevent repetitive yarn images
var showYarnAmount = false;
var theseusAnimationTick = 0; // ticks up every frame
var theseusAnimationFrame = 0; // animation frame Theseus is on -- changed by theseusAnimationTick

// Torch stuff
var torchFlickerFrames = TORCH_FLICKER_FRAMES_LOWER;
var torchFlickerCounter = 0;
var innerTorchRadius = 0;
var torchRadius = 0;

// Gameplay-related
var stepsTaken = 0; // steps the user has taken, total
var stepsToMinotaur = 0; // steps away the Minotaur was at the start
var originalYarn = 0; // original amount of yarn the user was given (used in big yarn drawing)
var yarn = 0; // amount of squares of yarn the user has left
var yarnTradeAmount = 0;
var seenMinotaur = false;
var minotaurIsKilled = false;
var showSolution = false;

// Images used frequently for various tiles
var wallTileImage;
var floorTileImage;
var floorTileHighlightImage;
var yarnImage;
var openDoorImage;
var closedDoorImage;
var minotaurImage;
var minotaurEyesImage;
var theseusTilesetImage;

function Cell(type, x, y, image) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.image = image;
    this.neighbors = [];
    this.accessibleNeighbors = [];
    this.inSolution = false;

    this.lastEnteredFrom = undefined;
    this.stringImage = undefined;

    this.containsMinotaur = false;

    this.isObjective = function() {return this.type === OBJECTIVE_CELL;}
    this.isObstacle = function() {return this.type === OBSTACLE_CELL;}
    this.isEmpty = function() {return this.type === EMPTY_CELL;}

    this.equals = function(other) {return this.x === other.x && this.y === other.y;}

    this.convertToEmpty = function() {
        this.type = EMPTY_CELL;
        this.image = floorTileImage;
    }

    this.convertToObstacle = function() {
        this.type = OBSTACLE_CELL;
        this.image = wallTileImage;
    }

    this.convertToObjective = function() {
        this.type = OBJECTIVE_CELL;
        this.image = wallTileImage;
    }

    this.drawAt = function(xmod, ymod, specialDraw = NONE) {

        var defMod = CELL_LENGTH;
        var xOff = (specialDraw === USER) ? 0 : (interpOffset.x * interpOffset.mag);
        var yOff = (specialDraw === USER) ? 0 : (interpOffset.y * interpOffset.mag);

        var rectX = xmod * CELL_LENGTH + xOff - defMod;
        var rectY = ymod * CELL_LENGTH + yOff - defMod;

        if (specialDraw === USER) {
            if (interpOffset.x || interpOffset.y) {
                if (++theseusAnimationTick > THESEUS_ANIMATION_TICKS_PER_FRAME) {
                    if (++theseusAnimationFrame === THESUES_ANIMATION_FRAMES) {
                        theseusAnimationFrame = 0;
                    }
                    theseusAnimationTick = 0;
                }
            }

            var clipX = theseusAnimationFrame * TILESET_TILE_SIZE;
            var clipY = (directionMoved - 1) * TILESET_TILE_SIZE;

            ctx.drawImage(
                theseusTilesetImage,
                clipX,
                clipY,
                TILESET_TILE_SIZE,
                TILESET_TILE_SIZE,
                rectX,
                rectY,
                CELL_LENGTH,
                CELL_LENGTH
            );
            userDrawnLocation.x = rectX;
            userDrawnLocation.y = rectY;

            return;
        }

        var drawImage = this.image;
        if (specialDraw === MINOTAUR_EYES)
            drawImage = minotaurEyesImage;
        else if (specialDraw === TILE_HIGHLIGHT)
            drawImage = floorTileHighlightImage;

        // Draw whatever image this tile is represented by
        ctx.drawImage(
            drawImage,
            rectX,
            rectY,
            CELL_LENGTH,
            CELL_LENGTH
        );

        // Return if this is a special case
        if (specialDraw) return;

        // Additional images on top of drawn tile
        var hasAdditionalContent =
                (this.stringImage ||
                this.containsMinotaur ||
                this.isObjective());

        if (hasAdditionalContent) {
            if (this.isObjective())
                addImg = minotaurIsKilled ? openDoorImage : closedDoorImage;
            else
                addImg = this.containsMinotaur ? minotaurImage : this.stringImage;

            ctx.drawImage(
                addImg,
                rectX,
                rectY,
                CELL_LENGTH,
                CELL_LENGTH
            );
        }
    }
}

// Convenience functions for creating different cell types
function makeObjectiveCell(x, y) {return new Cell(OBJECTIVE_CELL, x, y, wallTileImage);}
function makeEmptyCell(x, y) {return new Cell(EMPTY_CELL, x, y, floorTileImage);}

// Gets the cell the user is in
function getCellAtUserLocation() {
    return maze[userLocation.y][userLocation.x];
}

// Updates the size of the canvas
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

// Initialize the images that will be used in drawing
function imageInit() {

    // Init yarn images using yarn containers
    var yarnContainers = [yarnBotToLeft, yarnLeftToTop, yarnTopToRight, yarnRightToBot, yarnHorizontal, yarnVertical];
    for (var i=0; i<yarnContainers.length; i++) {
        var yarn = yarnContainers[i];
        var yarnImages = yarn.images;
        for (var j=0; j<yarn.numOptions; j++) {
            yarnImages.push(new Image());
            yarnImages[j].src = yarn.path + (j + 1) + ".png";
        }
    }

    // Theseus himself
    theseusTilesetImage = new Image();
    theseusTilesetImage.src = "resources/theseus_tileset.png";

    // Door images
    openDoorImage = new Image();
    openDoorImage.src = "resources/door_open.png";
    closedDoorImage = new Image();
    closedDoorImage.src = "resources/door_closed.png";

    // Big yarn on the left
    yarnImage = new Image();
    yarnImage.src = "resources/yarn/yarn.png";

    // Minotaur images
    minotaurImage = new Image();
    minotaurImage.src = "resources/minotaur/minotaur.png";
    minotaurEyesImage = new Image();
    minotaurEyesImage.src = "resources/minotaur/minotaur_eyes.png"

    // Obstacle cell image  
    var wallNum = randomIntFromZero(NUM_WALL_OPTIONS) + 1;
    wallTileImage = new Image();  
    wallTileImage.src = "resources/wall/" + wallNum + ".jpg";
    
    // Floor (empty) cell image
    var floorNum = randomIntFromZero(NUM_FLOOR_OPTIONS) + 1;
    floorTileImage = new Image();
    floorTileImage.src = "resources/floor/" + floorNum + ".jpg";
    floorTileHighlightImage = new Image();
    floorTileHighlightImage.src = "resources/floor/" + floorNum + "_highlight.png";
}

// Choose an appropriate yarn image from the container
function chooseYarnImage(yarnContainer) {
    var i = randomIndexOf(yarnContainer.images);
    if (i === lastYarnIndex) {
        if (++i >= yarnContainer.images.length) i = 0;
    }
    lastYarnIndex = i;
    return yarnContainer.images[i];
}

// Only pass frameKey/old user position if interpolation is desired
function drawMaze(interpolate = false, oldUserLocation = userLocation, recurseCount = 0) {

    // Clear the canvas so we only have to draw the walls
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(recurseCount === 0) {
        var offX, offY;
        if (oldUserLocation.x === userLocation.x) offX = 0;
        else if (oldUserLocation.x > userLocation.x) offX = -1;
        else offX = 1;

        if (oldUserLocation.y === userLocation.y) offY = 0;
        else if (oldUserLocation.y > userLocation.y) offY = -1;
        else offY = 1;

        interpOffset = {x: offX, y: offY, mag: CELL_LENGTH};
    }

    if(interpolate) {
        interpOffset.mag -= (INTERPOLATION_INCREMENT + interpolationAdj);
        if (interpOffset.mag < 0) {
            interpOffset.mag = 0;
        }
    }

    if (showSolution) {
        var trueRowStart = userLocation.y - frameRadiusY - 1;
        if (trueRowStart < 0) trueRowStart = 0;
        var trueColStart = userLocation.x - frameRadiusX - 1;
        if (trueColStart < 0) trueColStart = 0;

        var trueRowEnd = userLocation.y + frameRadiusY;
        if (trueRowEnd >= rows) trueRowEnd = rows - 1;
        var trueColEnd = userLocation.x + frameRadiusX;
        if (trueColEnd >= cols) trueColEnd = cols - 1;
    }

    var rowStart = userLocation.y - trueFrameRadiusY - 1;
    if (rowStart < 0) rowStart = 0;
    var colStart = userLocation.x - trueFrameRadiusX - 1;
    if (colStart < 0) colStart = 0;

    var rowEnd = userLocation.y + trueFrameRadiusY;
    if (rowEnd >= rows) rowEnd = rows - 1;
    var colEnd = userLocation.x + trueFrameRadiusX;
    if (colEnd >= cols) colEnd = cols - 1;

    var solutionDraw = [];
    var userDraw;
    for(var row=(showSolution ? trueRowStart : rowStart); row<=(showSolution ? trueRowEnd : rowEnd); row++) {
        for(var col=(showSolution ? trueColStart : colStart); col<=(showSolution ? trueColEnd : colEnd); col++) {

            var cell = maze[row][col];

            if (showSolution) {
                if (cell.inSolution && !cell.containsMinotaur) solutionDraw.push(cell);
                if (row < rowStart || row > rowEnd) continue;
                if (col < colStart || col > colEnd) continue;
            }

            if (userLocation.x === col && userLocation.y === row) userDraw = cell;
            if (!seenMinotaur && cell.containsMinotaur) {
                setMessage("I can hear something breathing...");
                seenMinotaur = true;
            }

            drawCellRelativeToUser(cell);
        }
    }

    // Overlay darkness/torch effects over the scene
    drawLightingEffects();

    // Draw solution
    if (solutionDraw.length) {
        for (var i=0; i<solutionDraw.length; i++) {
            drawCellRelativeToUser(solutionDraw[i], TILE_HIGHLIGHT);
        }
    }

    // Draw the user
    if (userDraw) drawCellRelativeToUser(userDraw, USER);

    // Draw minotaur eyes through the darkness
    if (!minotaurIsKilled) drawCellRelativeToUser(objectiveCell, MINOTAUR_EYES);

    // Draw yarn graphic off to the left
    drawYarn();

    // Either continue interpolation, recall user input function, or stop entirely
    if (interpolate) {
        if (interpOffset.mag === 0) {
            reactToUserInput();
        } else {
            setTimeout(function () {
                drawMaze(true, oldUserLocation, recurseCount + 1);
            }, 0);
        }
        return;
    }
}

function drawCellRelativeToUser(cell, special = NONE) {
    cell.drawAt(
        cell.x - userLocation.x + frameRadiusX,
        cell.y - userLocation.y + frameRadiusY, 
        special
    );
}

function drawLightingEffects() {
    gradX = userDrawnLocation.x + HALF_CELL;
    gradY = userDrawnLocation.y + HALF_CELL;
    gradient = ctx.createRadialGradient(
        gradX,
        gradY,
        canvas.height * INNER_TORCH_MULTIPLIER,
        gradX,
        gradY,
        canvas.height * (showSolution ? OUTER_TORCH_MULTIPLIER_HINT : OUTER_TORCH_MULTIPLIER)
    );
    gradient.addColorStop(0, "rgba(248, 195, 119, 0.25)");

    if (++torchFlickerCounter === torchFlickerFrames) {

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

    gradient.addColorStop(1, "rgba(0, 0, 0, 1.00)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawYarn() {
    // Draw yarn graphic -- move it upward as the user loses yarn
    var yarnX = (canvas.width - trueFrameRadiusX * CELL_LENGTH) / 8.0;
    var yarnY = -(yarnImage.height - yarnImage.height * (yarn * 1.0 / originalYarn));
    ctx.drawImage(
        yarnImage,
        yarnX,
        yarnY
    );

    // Draw numerical yarn amount overtop of the graphic
    if (showYarnAmount) {
        ctx.fillStyle = "white";
        ctx.font="16pt Arial";
        ctx.fillText(yarn, yarnX, 35);
    }
}

function setMessage(text, noTimeout=false) {
    var mazeText = document.getElementById("mazeText");
    var message =
        "<i>\"" +
        text +
        "\"</i>";
    if (mazeText.innerHTML === message) return; // don't push message if it is equivalent
    mazeText.innerHTML = message;
    if (!noTimeout) {
        setTimeout(function () {
            if (document.getElementById("mazeText").innerHTML === message)
                document.getElementById("mazeText").innerHTML = "";
        }, MESSAGE_DURATION);
    }
}

function isTraversable(cell) {
    return !(!cell || cell.isObstacle() || (cell.isObjective() && !minotaurIsKilled));
}

function reactToUserInput() {

    // Ignore conflicting input
    if(!((up && down) || (left && right))) {
        
        var needsRedraw = false;

        var oldLocation = {x:userLocation.x, y:userLocation.y};

        var oldCell = getCellAtUserLocation();
        var newCell;

        // Determine new location if there is one...
        if(up && userLocation.y !== 0) {
            newCell = maze[userLocation.y - 1][userLocation.x];
            directionMoved = TOP;
        }
        else if(down && userLocation.y !== cols - 1) {
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

            needsRedraw = true;

            if (oldCell.inSolution && newCell.inSolution) {
                oldCell.inSolution = false;
            } else {
                oldCell.inSolution = true;
            }
            newCell.inSolution = true;

            if (newCell.containsMinotaur) {
                minotaurIsKilled = true;
                showSolution = false;
                tradeBtn.style.display = HIDE;
                newCell.containsMinotaur = false;
                setMessage("I've slain the Minotaur in just " + stepsTaken + " steps. Time to find my way out.");
            }

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
                if(yarn !== 0) {
                    yarn--;
                    if(yarn === 0)
                        setMessage("I've run out of thread...");
                }
            }

            // Update steps
            stepsTaken++;

            // Player reached the objective
            if(newCell.isObjective()) {
                setMessage(
                    "Well run, Thisbe. You took " +
                    stepsTaken + " " +
                    "steps in order to complete the labyrinth.",
                    true
                );
                return;
            } else {
                // Update user location
                userLocation = {x: newCell.x, y: newCell.y};
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

// If the inputs are appropriate, purges the current maze and generates a new one in its place.
// Resets any variables like user position, held keys, paths, etc. that the old maze relied on.
function remakeMaze(method) {

    // Reset any variables from the previous maze
    up = down = left = right = false;
    stepsTaken = 0;
    userLocation = originalLocation;

    // Get columns and rows from the input boxes
    cols = mazeDimension;
    rows = mazeDimension;

    // Limit numbers to odd values
    if(cols % 2 === 0) cols++;
    if(rows % 2 === 0) rows++;

    // Generate maze and update the canvas...
    updateCanvasSize(false);

    maze = generateMaze(method, cols, rows);
    stepsToMinotaur = solveMaze(false);
}

function beginMazeNav(difficulty) {

    // Decide maze dimensions
    var mazeDimPercent = (difficulty < MAZE_DIMENSION_MIN_PERCENT) ? MAZE_DIMENSION_MIN_PERCENT : difficulty;
    mazeDimension = Math.ceil(mazeDimPercent * MAZE_DIMENSION_MAX);
    
    // Generate maze, use different method depending on difficulty
    if (difficulty <= KRUSKAL_MIN_THRESHOLD)
        remakeMaze(KRUSKAL);
    else
        remakeMaze(RECURSIVE_BACKTRACKING);

    // Decide how much yarn to give
    var yarnMultiplier = (difficulty < 0.5) ? 0.85 : 0.60;
    yarn = Math.floor(yarnMultiplier * stepsToMinotaur);
    originalYarn = yarn;

    // Decide yarn trade-in rate and set button text
    yarnTradeAmount = Math.floor(originalYarn * YARN_TRADE_PERCENT_OF_ORIGINAL);
    tradeBtn.style.backgroundColor = "#7F0000";
    tradeBtn.style.color = "white";
    tradeBtn.innerHTML = "Trade " + yarnTradeAmount + " yarn for a hint";

    // Canvas stuff
    document.body.style.backgroundColor = "black";
    canvas.style.display = SHOW;

    // Offer hint eventually
    tradeBtn.style.display = HIDE;
    setTimeout(function() {tradeBtn.style.display = SHOW}, TIME_BEFORE_OFFERING_HINT);

    // Finalize and start the game
    setMessage("The Minotaur is but " + stepsToMinotaur + " steps away.");
    addEventListeners();
    reactToUserInput();
}

function onKeyDown(event) {
    switch(event.keyCode) {
        case 27:  //escape
            highQualityMode = !highQualityMode;
            interpolationAdj = highQualityMode ? 0 : 1;
            setMessage(highQualityMode ?
                "High performance mode disabled." :
                "High performance mode enabled."
            );
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
    switch(event.keyCode) {
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

function tradeYarn() {
    if (yarn < yarnTradeAmount)
        setMessage("I don't have enough yarn.");
    else if (showSolution)
        setMessage("The path is already revealed. For now, at least...");
    else if (minotaurIsKilled)
        setMessage("Strange, the path isn't showing up.");
    else {
        setMessage("The solution is revealed! I must make haste.");
        yarn -= yarnTradeAmount;
        showSolution = true;
        setTimeout(function() {
            showSolution = false;
            if (!minotaurIsKilled) setMessage("That was short-lived.");
        }, TIME_TO_SHOW_SOLUTION);
    }
}

function onTradeHover() {
    showYarnAmount = true;
}

function onTradeLeave() {
    showYarnAmount = false;
}

function addEventListeners() {
    // Keypresses
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);

    // Button hover/click
    tradeBtn.onclick = tradeYarn;
    tradeBtn.addEventListener("mouseenter", onTradeHover, false);
    tradeBtn.addEventListener("mouseleave", onTradeLeave, false);
}

// Runs on load
function mazeGenInit() {
    canvas = document.getElementById("canvas");
    canvas.style.display = HIDE;

    ctx = canvas.getContext("2d");
    imageInit();
}