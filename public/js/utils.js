function deep_set(obj, path, term) {
    if (path.length == 1)  return obj[path[0]] = term
    
    if (!obj[path[0]])
	obj[path[0]] = {}
    return deep_set(obj[path[0]], path.slice(1), term) }

function deep_get(obj, path, defaul) {
    if (path.length == 1
	&& obj[path[0]] !== undefined)
	return obj[path[0]]
    
    if (!obj[path[0]])
	return defaul

    return deep_get(obj[path[0]], path.slice(1), defaul) }

function do_nothing() {}
var _a   = Object.assign
function int(x) { return Number.parseInt(x) }

