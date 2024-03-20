const fs = require(`fs`)
const { parse, notParse, combineParser, whiteSpace, stringParser, oneOrMore, anyofChars, oneOrZero, orElseParser, resultSet } = require('../lib/parselib')
const tokens = require('../lib/tokens')

const nonControllCharackters = notParse('#', '(', ')', '?', '@', ':', '\n', '\r', '\t', '"', '\'', '=', ' ', ',')
const unescapedChars = notParse('\n', '\r', '\t', '"', '\'')
const ignoreChars = oneOrMore(anyofChars(' ', '\t', '\n', '\r', ','))
const questionmark = parse('?')
const colon = parse(':')

// number stuff
const digit = anyofChars('1', '2', '3', '4', '5', '6', '7', '8', '9', '0')
const digits = oneOrMore(digit)
const decimal = combineParser(parse('.'), digits)
const number = combineParser(oneOrZero(parse('-')), digits, oneOrZero(orElseParser(decimal, digits)))

// ognl specific
const variablePrefix = parse('#')
const assignmentOperator = combineParser(oneOrZero(whiteSpace), parse('='), oneOrZero(whiteSpace))
const valTrue = stringParser('true')
const valFalse = stringParser('false')
const valNull = stringParser('null')
const quote = orElseParser(parse('"'), parse('\''))
const variable = combineParser(variablePrefix, oneOrMore(nonControllCharackters))
const quotedString = combineParser(quote, oneOrMore(unescapedChars), quote)
const constant = [quotedString, number, valNull, valFalse, valTrue].reduce((a, b) => { return orElseParser(a, b) })
const assignment = combineParser(variable, assignmentOperator, constant)
const compare = [stringParser('=='), stringParser('!='), parse('<'), parse('>'), stringParser('<='), stringParser('>=')].reduce((a, b) => { return orElseParser(a, b) })
const expression = combineParser(orElseParser(variable, constant), oneOrZero(whiteSpace), compare, oneOrZero(whiteSpace), orElseParser(variable, constant))
const statement = combineParser([expression, block, assignment, variable, constant].reduce((a, b) => { return orElseParser(a, b) }), oneOrZero(whiteSpace), questionmark, oneOrZero(whiteSpace), [expression, block, assignment, variable, constant].reduce((a, b) => { return orElseParser(a, b) }))

const ognlParsers = {
	"assignment": assignment,
	"variable": variable,
	"assignmentOperator": assignmentOperator,
	"quotedString": quotedString,
	"number": number,
	"constant": constant,
	"expression": expression,
	"compare": compare,
	"block": block,
	"statement": statement,
	"questionmark": questionmark
}

const rules = {
	"ognl": [
		["statement"],
		["block"],
		["assignment"],
		["expression"]
	],
	"block": [
		["assignment"],
		["expression"],
		["block"]
	],
	"expression": [
		["variable", "compare", "variable"],
		["variable", "compare", "constant"],
		["constant", "compare", "variable"],
		["constant", "compare", "constant"]
	],
	"assignment": [
		["variable", "assignmentOperator", "constant"],
		["variable", "assignmentOperator", "variable"]
	],
	"statement": [
		["expression", "questionmark", "assignment"],
		["block", "questionmark", "assignment"],
		["assignment", "questionmark", "assignment"],
		["statement", "questionmark", "assignment"],
		["expression", "questionmark", "expression"],
		["block", "questionmark", "expression"],
		["assignment", "questionmark", "expression"],
		["statement", "questionmark", "expression"],
		["expression", "questionmark", "block"],
		["block", "questionmark", "block"],
		["assignment", "questionmark", "block"],
		["statement", "questionmark", "block"],
		["expression", "questionmark", "statement"],
		["block", "questionmark", "statement"],
		["assignment", "questionmark", "statement"],
		["statement", "questionmark", "statement"],
	],
	"constant": [
		["quotedString"],
		["number"]
	]
}


// variablen in Map  bzw deklaration von variablen ueberpruefen

function parseOgnl(startingToken) {

	// check if is terminal
	if (!rules[startingToken.name]) {
		return
	}

	let remainingString = ignoreChars(startingToken.value).remaining

	// looping through the options and if find one 
	rules[startingToken.name].map((option) => {

		let parseResult

		// loop through the options and try to parse it into it's tokens
		for (let i = 0; i < option.length; i++) {

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
	if (ignoreChars(remainingString).remaining !== '' && startingToken.value !== remainingString) {
		//check if its not relevant with ignore
		startingToken.value = ignoreChars(remainingString).remaining
		parseOgnl(startingToken)
	} else if (startingToken.value === remainingString) {
		throw Error(`can't parse: \n${startingToken.value}`)
	}
}

const ognl = fs.readFileSync(`./ognl.txt`, { encoding: "utf-8" })

const root = {
	name: "ognl",
	value: ognl,
	children: []
}

// ToDo write rendering function to expand tree
parseOgnl(root)
console.log(root)

