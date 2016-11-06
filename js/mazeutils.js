// Used for form inputs that only accept numbers
function numericOnly() {
    return event.charCode >= 48 && event.charCode <= 57;
}

// Downloads maze as an image
function downloadMaze(link, fileName) {
    link.href = canvas.toDataURL();
    link.download = fileName;
}

// Returns a random index from all possible in the given array, or -1 if it is empty
function randomIndexOf(arr) {
    if(arr.length < 1) return -1;
    return Math.floor(Math.random() * arr.length);
}

// Returns a randomly shuffled version of the given array
function shuffleArray(arr) {
    var shuffled = [];
    var indices = Array.apply(null, Array(arr.length)).map(function (_, i) {return i;}); // makeshift range()
    while(indices.length > 0) {
        var indexIndex = randomIndexOf(indices);
        shuffled.push(arr[indices[indexIndex]]);
        indices.splice(indexIndex, 1);
    }
    return shuffled;
}