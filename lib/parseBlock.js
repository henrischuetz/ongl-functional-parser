const { parse, notParse, oneOrZero, oneOrMore, resultSet } = require("./parselib")

const noParenthesis = notParse('(', ')')
const blockContent = oneOrZero(oneOrMore(noParenthesis))

// parsing blocks...
// enter block
// find the closing tag of the block.... while counting opening and closing tags 
// exit on ')'
function parseBlock(input) {

	// is it the start of a block?
	const firstChar = parse('(')(input)
	if (firstChar.matched === "") {
		return firstChar
	}

	// start counting tags
	let openingTags = 1
	let middlePart = blockContent(firstChar.remaining)
	let alreadyParsed = firstChar.matched
	do {

		alreadyParsed += middlePart.matched
		// no closing tag
		if (middlePart.remaining === '') {
			return resultSet(')', "", middlePart.matched)
		}

		// counting tags
		if (middlePart.remaining[0] === '(') {
			openingTags++
			alreadyParsed += '('
		} else if (middlePart.remaining[0] === ')') {
			openingTags--
			alreadyParsed += ')'

			if (openingTags === 0) {
				return resultSet('(...)', alreadyParsed, middlePart.remaining.substr(1))
			}
		}
		middlePart = blockContent(middlePart.remaining.substr(1))

	} while (openingTags > 0)
}

module.exports = { 
    parseBlock: parseBlock,
    blockContent: blockContent
}