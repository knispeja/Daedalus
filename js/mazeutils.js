function randomIntFromZero(value) {
    return Math.floor(Math.random() * value);
}

// Returns a random index from all possible in the given array, or -1 if it is empty
function randomIndexOf(arr) {
    if(arr.length < 1) return -1;
    return randomIntFromZero(arr.length);
}

function randRange(lower, upper) {
    return (Math.random() * (upper - lower) + lower);
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

// Checks if the given address exists
function urlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}