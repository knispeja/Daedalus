// Maze generation method enums
const KRUSKAL = 1;
const RECURSIVE_BACKTRACKING = 2;

/*
    Modifies the given maze m, assumed empty, to be a fully-connected maze.

    This method starts with a grid of walls. Every wall is considered for
    removal, in random order. A wall is only removed if the empty spaces
    on either side of that wall are NOT already connected by empty space.

    More here: http://weblog.jamisbuck.org/2011/1/3/maze-generation-kruskal-s-algorithm
*/
function generateMazeKruskal(m, cols, rows) {

    // TODO: eyespots

    // Edges that will be considered for removal
    var edges = [];

    // Place initial grid and fill edges array
    for(var row=0; row<rows; row++) {
        for(var col=0; col<cols; col++) {
            var rowMod = (row % 2 === 0);
            var colMod = (col % 2 === 0);
            if(rowMod || colMod) {
                m[row][col].convertToObstacle();
                if (rowMod !== colMod) edges.push(m[row][col]);
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
function generateMazeRecursiveBacktracking(m, cols, rows) {

    // Place initial grid
    for(var row=0; row<rows; row++) {
        for(var col=0; col<cols; col++) {
            if(row % 2 === 0 || col % 2 === 0)
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
function generateMaze(method, cols, rows) {
    var newMaze = [];

    // Generate empty maze
    for(var row=0; row<rows; row++) {
        var newRow = [];
        for(var col=0; col<cols; col++) {
            newRow.push(new Cell(EMPTY_CELL, col, row, floorTileImage));
        }
        newMaze.push(newRow);
    }

    // Generate maze innards -- these methods will not place starting/ending pts
    switch(method) {
        case KRUSKAL:
            generateMazeKruskal(newMaze, cols, rows);
            break;
        case RECURSIVE_BACKTRACKING:
            generateMazeRecursiveBacktracking(newMaze, cols, rows);
            break;
    }

    // Place objective and starting point along top wall
    for(var col=cols-Math.floor(mazeDimension/2); col>=0; col--) {
        if(newMaze[1][col].isEmpty()) {
            userLocation = {x: col, y: 1};
            newMaze[1][col].lastEnteredFrom = TOP;
            newMaze[0][col].convertToObjective();
            break;
        }
    }

    // Place minotaur near the bottom somewhere
    for(var col=randomIntFromZero(cols-1); col<cols; col++) {
        var cell = newMaze[rows-4][col];
        if(cell.isEmpty()) {
            cell.containsMinotaur = true;
            minotaurCell = cell;
            break;
        }
    }

    return newMaze;
}