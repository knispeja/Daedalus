// Adds the given neighbor to the given cell's neighbor list and
// its accessibleNeighbor list (if necessary), if it exists
function addCellToNeighbors(cell, possibleNeighbor) {
    if(possibleNeighbor) {
        cell.neighbors.push(possibleNeighbor);
        if(!possibleNeighbor.isObstacle())
            cell.accessibleNeighbors.push(possibleNeighbor);
    }
}

// Generates two lists for every cell in the given maze:
//      cell.accessibleNeighbors, which holds non-obstacle neighbors, and
//      cell.neighbors, which holds all neighbors
function generateGraphForMaze(m = maze) {

    // Loop over all cells in maze
    for(var row=0; row<rows; row++) {
        for(var col=0; col<cols; col++) {

            var cell = m[row][col];

            // Only initialize A* values for non-obstacles
            if(!cell.isObstacle()) {
                cell.f = 0;
                cell.g = 0;
                cell.h = 0;
                cell.parent = null;
                cell.inOpen = false;
                cell.inClosed = false;
            }

            // Above
            if(m[row-1]) addCellToNeighbors(cell, m[row-1][col]);

            // Below
            if(m[row+1]) addCellToNeighbors(cell, m[row+1][col]);

            // To the left
            addCellToNeighbors(cell, m[row][col-1]);

            // To the right
            addCellToNeighbors(cell, m[row][col+1]);
        }
    }
}

function solveMazeWithAStar(startCell, endCell, displayResult) {
    var open = [];
    var closed = [];
    open.push(startCell);
    startCell.inOpen = true;

    while(open.length > 0) {

        // Find the lowest f to look at next
        var lowInd = 0;
        for(var i=1; i<open.length; i++) {
            if(open[i].f < open[lowInd].f) lowInd = i;
        }
        var currentCell = open[lowInd];

        // End case: found the objective cell
        if(currentCell.equals(endCell)) {
            optimalPath = 0; // reset optimal path before calculating
            while(currentCell.parent) {
                if(displayResult) {
                    currentCell.draw("yellow");
                }
                optimalPath++;
                var temp = currentCell.parent;
                currentCell.parent = null;
                currentCell = temp;
            }
            return;
        }

        // Normal case
        open.splice(lowInd, 1);
        currentCell.inOpen = false;
        closed.push(currentCell);
        currentCell.inClosed = true;
        for(var i=0; i<currentCell.accessibleNeighbors.length; i++) {
            var neighbor = currentCell.accessibleNeighbors[i];
            if(neighbor.inClosed || neighbor.isObstacle()) continue;

            var g = currentCell.g + 1;
            var bestG = false;

            if(!neighbor.inOpen) {
                bestG = true;
                neighbor.h = (
                        Math.abs(neighbor.x - currentCell.x) +
                        Math.abs(neighbor.y - currentCell.y)
                    );
                open.push(neighbor);
                neighbor.inOpen = true;
            }
            else if(g < neighbor.g) {
                bestG = true;
            }

            if(bestG) {
                neighbor.parent = currentCell;
                neighbor.g = g;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
}

function solveMaze(displayResult = true) {

    generateGraphForMaze();

    // TODO: save solution if it's already been solved to save time
    solveMazeWithAStar(getCellAtUserLocation(), objectiveCell, displayResult);
}