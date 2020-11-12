
// expanding
// assignment
// variable assignmentOperator constant

// terminal
// string | number | assignmentOperator | variable

// token
// options
// token | token token

const tokens = new Map()

tokens.set('variable', (string) => {
    return {
        name: "variable",
        value: string.substring(1),
        children: []
    }
})
tokens.set('quotedString', (string) => {
    return {
        name: "quotedString",
        value: string.substring(1, string.length - 1),
        children: []
    }
})
tokens.set('assignment', (string) => {
    return {
        name: "assignment",
        value: string,
        children: []
    }
})
tokens.set('assignmentOperator', (string) => {
    return {
        name: "assignmentOperator",
        value: string[1],
        children: []
    }
})
tokens.set('constant', (string) => {
    return {
        name: "constant",
        value: string,
        children: []
    }
})
tokens.set('number', (string) => {
    return {
        name: "number",
        value: string,
        children: []
    }
})
tokens.set('expression', (string) => {
    return {
        name: "expression",
        value: string,
        children: []
    }
})
tokens.set('compare', (string) => {
    return {
        name: "compare",
        value: string,
        children: []
    }
})
tokens.set('block', (string) => {
    return {
        name: "block",
        value: string.substring(1, string.length - 1),
        children: []
    }
})

module.exports = tokens