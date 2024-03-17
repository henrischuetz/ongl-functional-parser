const { parse, combineParser, resultSet } = require('../../lib/parselib')


const abParser = combineParser(parse('a'), parse('b'))

test('combine a and b parsers', ()=>{
    expect(combineParser(parse('a'), parse('b'))).toBeInstanceOf(Function)
})

// first time I wished js had function signatures....

test('parse ab ', ()=>{
    expect(abParser('ab')).toStrictEqual(resultSet('ab', 'ab', ''))
})

test('prase no char', ()=>{
    expect(abParser('xy')).toStrictEqual(resultSet('ab', '', 'xy'))
})

test('parse only first char of ab', ()=>{
    expect(abParser('ac')).toStrictEqual(resultSet('ab', '', 'ac'))
})

test('parse only second car of ab', ()=>{
    expect(abParser('cb')).toStrictEqual(resultSet('ab', '', 'cb'))
})
