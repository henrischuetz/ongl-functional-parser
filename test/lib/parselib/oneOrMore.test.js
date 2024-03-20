const { parse, oneOrMore, resultSet, notParse } = require('../../../lib/parselib')

const aParseAll = oneOrMore(parse('a'))

test('make a one or more a parser', ()=>{
    expect(oneOrMore(parse('a'))).toBeInstanceOf(Function)
})

test('parse a', ()=>{
    expect(aParseAll('a')).toStrictEqual(resultSet('a+', 'a', ''))
})

test('prase no char', ()=>{
    expect(aParseAll('xy')).toStrictEqual(resultSet('a+', '', 'xy'))
})

test('parse only first char of ab', ()=>{
    expect(aParseAll('ab')).toStrictEqual(resultSet('a+', 'a', 'b'))
})

test('parse multiple a\'s from aaab', ()=>{
    expect(aParseAll('aaab')).toStrictEqual(resultSet('a+', 'aaa', 'b'))
})

test('parse empty string', ()=>{
    expect(aParseAll('')).toStrictEqual(resultSet('a+', '', ''))
})

test('dont parse parenthesis for one or more chars', ()=>{
    expect(oneOrMore(notParse('(', ')'))('abc'))
    .toStrictEqual(resultSet('!()+','abc', ''))
})