const fs = require(`fs`)
const path = require(`path`)
const { parse, combineParser, whiteSpace, stringParser, oneOrMore, anyofChars, oneOrZero, orElseParser, resultSet, errorSet } = require('./parselib')
const { error } = require('console')
const tokens = require('./tokens')


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



const nonControllCharackters = excludeChars('#', '(', ')', '?', '@', ':', '\n', '\r', '\t', '"', '\'', '=', ' ', ',')
const unescapedChars = excludeChars('\n', '\r', '\t', '"', '\'')
const noParenthesis = excludeChars('(', ')')
const ignoreChars = oneOrMore(anyofChars(' ', '\t', '\n', '\r', ','))

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
const compare = [stringParser('=='), stringParser('!='), parse('<'), parse('>'), stringParser('<='), stringParser('>=')].reduce((a, b) => { return orElseParser(a, b) })
const expression = combineParser(orElseParser(variable, constant), whiteSpace, compare, whiteSpace, orElseParser(variable, constant))



// parsing blocks...
// enter block
// find the closing tag of the block.... while counting opening and closing tags 
// exit on ')'
function block(input) {

	// is it the start of a block?
	const firstChar = parse('(')(input)
	if (firstChar.matched === undefined) {
		return errorSet('(', input[0], input)
	}

	// start counting tags
	let openingTags = 1
	console.log(firstChar)
	let middlePart = oneOrZero(oneOrMore(noParenthesis))(firstChar.remaining)
	let alreadyParsed = firstChar.matched
	do {

		alreadyParsed += middlePart.matched
		// no closing tag
		if (middlePart.remaining === '') {
			return errorSet(')', middlePart.matched, input)
		}

		// counting tags
		if (middlePart.remaining[0] === '(') {
			openingTags++
			alreadyParsed += '('
		} else if (middlePart.remaining[0] === ')') {
			openingTags--

			if (openingTags === 0) {
				alreadyParsed += ')'
				console.log(alreadyParsed)
				return resultSet(alreadyParsed, middlePart.remaining.substr(1))
			}


		}
		middlePart = oneOrZero(oneOrMore(noParenthesis))(middlePart.remaining.substr(1))


	} while (openingTags > 0)

	return resultSet(alreadyParsed,)

}

// console.log(block("((1 == #myVar)(()()))"))
// console.log(parse('(')("(1 == #myVar)"))


const ognlParsers = {
	"assignment": assignment,
	"variable": variable,
	"assignmentOperator": assignmentOperator,
	"quotedString": quotedString,
	"number": number,
	"constant": constant,
	"expression": expression,
	"compare": compare,
	"block": block
}




const rules = {
	"ognl": [
		["assignment"],
		["expression"],
		["block"]
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
	"constant": [
		["quotedString"],
		["number"]
	]
}





function parseOgnl(startingToken) {


	// check if is terminal
	if (!rules[startingToken.name]) {
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
				// console.log(token)
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
	} else if (startingToken.value === remainingString) {
		console.log(`can't parse: \n${startingToken.value}`)
	}
}

const root = {
	name: "ognl",
	value: ognl,
	children: []
}

parseOgnl(root)
// console.log(root.children[2].children[0].children[0])

