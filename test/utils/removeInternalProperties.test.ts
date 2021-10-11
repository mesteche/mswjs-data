import { InternalEntity } from '../../src/glossary'
import { removeInternalProperties } from '../../src/utils/removeInternalProperties'

it('removes internal properties from a plain entity', () => {
  const user: InternalEntity<any, any> = {
    __type: 'user',
    __primaryKey: 'id',
    id: 'abc-123',
    firstName: 'John',
  }

  expect(removeInternalProperties(user)).toEqual({
    id: 'abc-123',
    firstName: 'John',
  })
})

it('removes internal properties from an entity with relations', () => {
  const user: InternalEntity<any, any> = {
    __type: 'user',
    __primaryKey: 'id',
    id: 'abc-123',
    firstName: 'John',
    // "oneOf" relation.
    address: {
      __type: 'address',
      __primaryKey: 'id',
      id: 'addr-123',
      street: 'Broadway',
    },
    // "manyOf" relation.
    contacts: [
      {
        __type: 'contact',
        __primaryKey: 'id',
        id: 'contact-123',
        type: 'home',
      },
      {
        __type: 'contact',
        __primaryKey: 'id',
        id: 'contact-456',
        type: 'office',
      },
    ],
  }

  expect(removeInternalProperties(user)).toEqual({
    id: 'abc-123',
    firstName: 'John',
    address: {
      id: 'addr-123',
      street: 'Broadway',
    },
    contacts: [
      { id: 'contact-123', type: 'home' },
      { id: 'contact-456', type: 'office' },
    ],
  })
})

it('preserves custom properties starting with the double underscore', () => {
  const user: InternalEntity<any, any> = {
    __type: 'user',
    __primaryKey: 'id',
    __customProperty: true,
    id: 'abc-123',
  }

  expect(removeInternalProperties(user)).toEqual({
    __customProperty: true,
    id: 'abc-123',
  })
})

it('removes internal properties from nested relational nodes', () => {
  const user: InternalEntity<any, any> = {
    __primaryKey: 'id',
    __type: 'user',
    id: 'abc-123',
    address: {
      billing: {
        country: {
          __primaryKey: 'code',
          __type: 'country',
          code: 'us',
        },
      },
    },
  }

  expect(removeInternalProperties(user)).toEqual({
    id: 'abc-123',
    address: {
      billing: {
        country: {
          code: 'us',
        },
      },
    },
  })
})
