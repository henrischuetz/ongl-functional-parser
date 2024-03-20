const { notParse, resultSet } = require('../../../lib/parselib')

const parseChar = notParse('a')

test('dont parse character', ()=>{
    expect(parseChar('a')).toStrictEqual(resultSet('!a', '', 'a'))
})

test('parse char with notParse', ()=>{ 
    expect(parseChar('b')).toStrictEqual(resultSet('!a', 'b', ''))
})

test('not parse empty string', ()=>{
    expect(parseChar('')).toStrictEqual(resultSet('!a', '', ''))
})

test('parse null', ()=>{
    expect(parseChar(null)).toStrictEqual(resultSet('!a', '', null))
})

test('parse null', ()=>{
    expect(notParse('(', ')')('abc')).toStrictEqual(resultSet('!()', 'a', 'bc'))
})