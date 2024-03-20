const { notParse, resultSet } = require('../../../lib/parselib')

const parseChar = notParse('a')

test('create parser for character', ()=>{
    expect(notParse('a')).toBeInstanceOf(Function)
})

test('handle null during creation', ()=>{
    expect(()=>notParse(null)).toThrowError()
})

test('handle undefined during creation', ()=>{
    expect(()=>notParse(undefined)).toThrowError()
})

test('handle multiple chars during creation', ()=>{
    expect(()=>notParse('ab')).toThrowError()
})

test('handle empty strin during creation', ()=>{
    expect(()=>notParse('')).toThrowError()
})

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
