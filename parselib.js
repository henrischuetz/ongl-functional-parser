// return types
// ToDo merge return types into one
const resultSet = (...args) => {
    const [matched, remaining] = args
    return {
        matched: matched,
        remaining: remaining
    }
}

const errorSet = (...args) => {
    const [expected, found, remaining] = args
    return {
        expected: expected,
        found: found,
        remaining: remaining
    }
}

// functions
function parse(charToMatch) {
    return (input) => {

        if (input[0] === charToMatch) {
            return resultSet(charToMatch, input.substr(1))
        } else {
            return errorSet(charToMatch, input[0], input)
        }
    }
}

function zero() {
    return (input) => {
        return resultSet('', input)
    }
}

function combineParser(...parses) {
    return parses.reduce((parse1, parse2) => {
        return (input) => {
            const result1 = parse1(input)
            if (result1.matched === undefined) {
                return result1
            }
            const result2 = parse2(result1.remaining)
            if (result2.expected !== undefined) {
                return result2
            }
            return resultSet(result1.matched + result2.matched, result2.remaining)
        }
    })
}

function orElseParser(parse1, parse2) {
    return (input) => {
        const result = parse1(input)

        if (result.matched === undefined) {
            return parse2(input)
        }
        return result
    }
}

function anyofChars(...chars) {
    return chars
        .map(char => parse(char))
        .reduce(((a, b) => { return orElseParser(a, b) }))
}

function stringParser(string) {
    return combineParser(...string.split('').map(char => parse(char)))
}

function oneOrMore(parser) {
    return (input) => {
        let result, previousResult, i = 0
        let concat = ''
        do {
            previousResult = result
            result = parser(input.substr(i++))
            if (result.matched) {
                concat += result.matched
            }
        } while (result.matched !== undefined)

        if (previousResult && previousResult.matched !== undefined) {
            previousResult.matched = concat
            return previousResult
        }

        return result
    }
}

function oneOrZero(parser) {
    return orElseParser(parser, zero())
}

const whiteSpace = anyofChars('\n', '\r', '\t', ' ')

module.exports = {
    parse: parse,
    combineParser: combineParser,
    orElseParser: orElseParser,
    anyofChars: anyofChars,
    stringParser: stringParser,
    oneOrMore: oneOrMore,
    whiteSpace: whiteSpace,
    oneOrMoreWhiteSpace: oneOrMore(whiteSpace),
    zero: zero,
    oneOrZero: oneOrZero,
    resultSet: resultSet,
    errorSet: errorSet
}