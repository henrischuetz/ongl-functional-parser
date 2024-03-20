const { parseBlock, blockContent } = require("../../../lib/parseBlock")
const { resultSet, oneOrMore, notParse } = require('../../../lib/parselib')

test('dont parse parenthesis for one or more chars', ()=>{
    expect(oneOrMore(notParse('(', ')'))('abc'))
    .toStrictEqual(resultSet('!()+','abc', ''))
})

// expecting no brackets once or more or nothing.... gets out of hand
test('parse characters as block content', ()=>{
    expect(blockContent('abc')).toStrictEqual(resultSet('!()+|', 'abc', ''))
})

test('parse empty block', ()=>{
    expect(parseBlock('()')).toStrictEqual(resultSet('(...)', '()', ''))
})

test('parse block with content', ()=>{
    expect(parseBlock('(abcdefg)')).toStrictEqual(resultSet('(...)', '(abcdefg)', ''))
})