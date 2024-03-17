const { zero, resultSet } = require('../../lib/parselib')

const zeroParser = zero()

test('creation of zero parser', ()=>{
    expect(zero()).toBeInstanceOf(Function)
})

test('parse empty string', ()=>{
    expect(zeroParser()).toStrictEqual(resultSet('',''))
})

test('parse chars', ()=>{
    expect(zeroParser('abc')).toStrictEqual(resultSet('', '', 'abc'))
})

test('parse null', ()=>{
    expect(zeroParser(null)).toStrictEqual(resultSet('', '', null))
})

test('parse undefined', ()=>{
    expect(zeroParser(undefined)).toStrictEqual(resultSet('', '', undefined))
})