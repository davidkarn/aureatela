import { createElement } from 'inferno-create-element';

function flatten(arr) {
    var flattened = []
    for (var i in arr) {
        if (arr[i] instanceof Array)
            flattened = flattened.concat(flatten(arr[i]))
        else if (arr[i])
            flattened.push(arr[i])}

    return flattened }

function translate_key(key) {
    return key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .toLowerCase() }

export default function(klass, attrs) {
    var children = [];
    for (var i = 2; i < arguments.length;i++)
        if (arguments[i]) {
            if (arguments[i] instanceof Array)
                children = children.concat(flatten(arguments[i]))
            else
                children.push(arguments[i]); }

    attrs        = attrs || {}
    attrs.key2   = attrs.key

    if (attrs.style) {
        var new_style   = {}
        for (var key in attrs.style) {
            new_style[translate_key(key)] = attrs.style[key] }
        attrs.style = new_style }
  
    var args = [klass, attrs].concat(children);

    return createElement.apply(createElement, args); }
