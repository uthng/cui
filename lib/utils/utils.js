// mapping a path to a map with the value for the end of each path
// function using recursion
exports.createMapPaths = function (map, sep = '.', path, value) {
  // var localmap = map
  // var localpath = path.split('.')

  // while (localpath.length > 1) {
  // map = map[localpath[0]] = localmap[localpath.shift()] || {}
  // }
  // map[localpath.shift()] = value
  var lmap = map
  var lpath = path.split(sep)
  for (var i = 0, numPath = lpath.length - 1; i < numPath; ++i) {
    if (!(lpath[i] in lmap)) {
      lmap[lpath[i]] = {}
    }
    lmap = lmap[lpath[i]]
  }

  if (value !== undefined && value !== null) {
    lmap[lpath[i]] = value
  }

  map = lmap
}
