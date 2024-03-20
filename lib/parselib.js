// return type
function resultSet(expected, matched, remaining) {
    return {
        expected: expected,
        matched: matched,
        remaining: remaining
    }
}

// functions
function parse(charToMatch) {

    // handle devs without coffee
    if(typeof charToMatch !== 'string' || charToMatch.length !== 1){
        throw new Error("parse needs exactly one char")
    }

    return (input) => {

        if (input && input[0] === charToMatch) {
            return resultSet(charToMatch, charToMatch, input.substr(1))
        } else {
            return resultSet(charToMatch, "", input)
        }
    }
}

function notParse(charToNotMatch) {

    // handle devs without coffee
    if(typeof charToNotMatch !== 'string' || charToNotMatch.length !== 1){
        throw new Error("notParse needs exactly one char")
    }

    return (input) => {

        if (input && input[0] !== charToNotMatch) {
            return resultSet('!' + charToNotMatch, input[0], input.substr(1))
        } else {
            return resultSet('!' + charToNotMatch, "", input)
        }
    }
}

function zero() {
    return (input) => {
        return resultSet('', '', input)
    }
}

function combineParser(...parsers) {
    return parsers.reduce((parse1, parse2) => {
        return (input) => {
            const result1 = parse1(input)
            const result2 = parse2(result1.remaining)
            const combinedResult = resultSet(result1.expected + result2.expected, result1.matched + result2.matched, result2.remaining)

            if (result1.matched === "" || result2.matched === "") {
                // failed to parse
                combinedResult.matched = ''
                combinedResult.remaining = input
            }

            return combinedResult
        }
    })
}

function orElseParser(parse1, parse2) {
    return (input) => {
        const result1 = parse1(input)
        const result2 = parse2(input)
        const expected = result1.expected + '|' +result2.expected

        if(result1.matched) {
            result1.expected = expected
            return result1
        } else {
            result2.expected = expected
            return result2
        }
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
        do {
            previousResult = result
            result = parser(input.substr(i++))
        } while (result.matched)
        result.expected += '+'
        
        if(!previousResult || (previousResult && !previousResult.matched)) {
            // found no matches
            return result
        }

        result.matched = previousResult.matched.repeat(i-1)
        return result
    }
}

function oneOrZero(parser) {
    return orElseParser(parser, zero())
}

const whiteSpace = anyofChars('\n', '\r', '\t', ' ')

module.exports = {
    parse: parse,
    notParse: notParse,
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
}