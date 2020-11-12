const fs = require(`fs`)
const path = require(`path`)
const { parse, combineParser, whiteSpace, stringParser, oneOrMore, anyofChars, oneOrZero, orElseParser, resultSet, errorSet} = require('./parselib')
const { error } = require('console')


const ognl = fs.readFileSync(`./ognl.txt`, { encoding: "utf-8" })

function excludeChars(...args) {
    const chars = []
    let char
    for (let i = 0; i < 256; i++) {
        char = String.fromCharCode(i)
        if (args.indexOf(char) === -1) chars.push(char)
    }
    return anyofChars(...chars)
}



const nonControllCharackters = excludeChars('#', '(', ')', '?', '@', ':', '\n', '\r', '\t', '"', '\'', '=', ' ')
const unescapedChars = excludeChars('\n', '\r', '\t', '"', '\'')
const noParenthesis = excludeChars('(', ')')
const ignoreChars = oneOrMore(anyofChars(' ','\t','\n','\r',','))

// number stuff
const digit = anyofChars('1', '2', '3', '4', '5', '6', '7', '8', '9', '0')
const digits = oneOrMore(digit)
const decimal = combineParser(parse('.'), digits)
const number = combineParser(oneOrZero(parse('-')), digits, oneOrZero(orElseParser(decimal, digits)))

// ognl specific
const variablePrefix = parse('#')
const assignmentOperator = combineParser(whiteSpace, parse('='), whiteSpace)
const valTrue = stringParser('true')
const valFalse = stringParser('false')
const valNull = stringParser('null')
const quote = orElseParser(parse('"'), parse('\''))
const variable = combineParser(variablePrefix, oneOrMore(nonControllCharackters))
const quotedString = combineParser(quote, oneOrMore(unescapedChars), quote)
const constant = orElseParser(quotedString, number)
const assignment = combineParser(variable, assignmentOperator, constant)
const compare = [stringParser('=='), stringParser('!='), parse('<'), parse('>'), stringParser('<='), stringParser('>=')].reduce((a,b)=>{return orElseParser(a,b)})
const expression = combineParser(orElseParser(variable, constant), whiteSpace, compare, whiteSpace, orElseParser(variable, constant))
const expressionOrAssignment = orElseParser(expression, assignment)


// parsing blocks...
// enter block
// call recursive on '('
// exit on ')'
const block = (()=>{
    return (input)=>{

        const firstChar = parse('(')(input)
        if (firstChar.matched === undefined){
            return firstChar
        }
        let middlePart = oneOrMore(noParenthesis)(firstChar.remaining)
        
        if(middlePart.found === '('){
            // found another block
            // don't use recursion in block parsing just parse the fucking block and do the rest in the primary function...
            const subBlock = block(middlePart.remaining)
        } 
        
        let endOfBlock = parse(')')(middlePart.remaining)
        
        // something went wrong
        if(endOfBlock.matched === undefined){
            return errorSet(')', endOfBlock.found, input)
        }
        
        return resultSet(firstChar.matched + middlePart.matched + endOfBlock.matched, endOfBlock.remaining)
        

    }
})()

// console.log(block("((1 == #myVar))"))
// console.log(parse('(')("(1 == #myVar)"))


const ognlParsers = {
    "assignment": assignment,
    "variable": variable,
    "assignmentOperator": assignmentOperator,
    "quotedString": quotedString,
    "number": number,
    "constant": constant,
    "expression" : expression,
    "compare" : compare,
    "block" : block
}

const rules = {
    "ognl": [
        ["assignment"],
        ["expression"],
        ["block"]
    ],
    "block":[
        ["assignment"],
        ["expression"]
    ],
    "expression" : [
        ["variable", "compare", "variable"],
        ["variable", "compare", "constant"],
        ["constant", "compare", "variable"],
        ["constant", "compare", "constant"]
    ],
    "assignment": [
        ["variable", "assignmentOperator", "constant"]
    ],
    "constant": [
        ["quotedString"],
        ["number"]
    ]
}

// expanding
// assignment
// variable assignmentOperator constant

// terminal
// string | number | assignmentOperator | variable


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
        value: string,
        children: []
    }
})



// token
// options
// token | token token

function parseOgnl(startingToken) {


    // check if is terminal
    if(!rules[startingToken.name]){
        return
    }

    let remainingString = startingToken.value

    // looping through the options and if find one 
    rules[startingToken.name].map((option) => {

        let parseResult

        // loop through the options and try to parse it into it's tokens
        for (let i = 0; i < option.length; i++) {


            // console.log("invalid call function: ", ognlParsers[option[i]])
            parseResult = ognlParsers[option[i]](remainingString)

            // valid parse
            if (parseResult.matched !== undefined) {
                let token = tokens.get(option[i])(parseResult.matched)
                remainingString = parseResult.remaining
                startingToken.children.push(token)
                parseOgnl(token)
            }
        }
    })

    // we have something left
    if (remainingString !== '' && startingToken.value !== remainingString) {

        //check if its not relevant with ignore
        startingToken.value = ignoreChars(remainingString).remaining
        // console.log(startingToken)
        parseOgnl(startingToken)
    } else if( startingToken.value === remainingString) {
        console.log(`can't parse: \n${startingToken.value}`)
    }
}

const root = {
    name: "ognl",
    value: ognl,
    children: []
}
parseOgnl(root)
// console.log(root)

