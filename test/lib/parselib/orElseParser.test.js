const { parse, orElseParser, resultSet } = require('../../../lib/parselib')

const aOrB = orElseParser(parse('a'), parse('b'))

test('combine a and b parsers to or parser', ()=>{
    expect(orElseParser(parse('a'), parse('b'))).toBeInstanceOf(Function)
})

test('parse a with a or b', ()=>{
    expect(aOrB('ab')).toStrictEqual(resultSet('a|b', 'a', 'b'))
})

test('parse b with a or b', ()=>{
    expect(aOrB('bc')).toStrictEqual(resultSet('a|b', 'b', 'c'))
})

test('prase no char', ()=>{
    expect(aOrB('xy')).toStrictEqual(resultSet('a|b', '', 'xy'))
})
