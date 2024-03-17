const { parse, resultSet } = require('../../../lib/parselib')

const parseChar = parse('a')

test('create parser for character', ()=>{
    expect(parse('a')).toBeInstanceOf(Function)
})

test('handle null during creation', ()=>{
    expect(()=>parse(null)).toThrowError()
})

test('handle undefined during creation', ()=>{
    expect(()=>parse(undefined)).toThrowError()
})

test('handle multiple chars during creation', ()=>{
    expect(()=>parse('ab')).toThrowError()
})

test('handle empty strin during creation', ()=>{
    expect(()=>parse('')).toThrowError()
})

test('parse character', ()=>{
    expect(parseChar('a')).toStrictEqual(resultSet('a', 'a', ''))
})

test('fail to parse char', ()=>{
    expect(parseChar('b')).toStrictEqual(resultSet('a', '', 'b'))
})

test('parse empty string', ()=>{
    expect(parseChar('')).toStrictEqual(resultSet('a', '', ''))
})

test('parse null', ()=>{
    expect(parseChar(null)).toStrictEqual(resultSet('a', '', null))
})

test('parse blank', ()=>{
    expect(parse(' ')(' ')).toStrictEqual(resultSet(' ', ' ', ''))
})