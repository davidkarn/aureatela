function deep_set(obj, path, term) {
    if (path.length == 1)  return obj[path] = term
    
    if (!obj[path[0]])
	obj[path[0]] = {}
    return deep_set(obj[path[0]], path.slice(1), term) }

function deep_get(obj, path, defaul) {
    if (path.length == 1)  return obj[path]
    if (!obj[path[0]])     return defaul
	
    return deep_get(obj[path[0]], path.slice(1), defaul) }

function do_nothing() {}
var _a   = Object.assign
