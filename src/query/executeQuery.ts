import { debug } from 'debug'
import { Database, EntityInstance } from '../glossary'
import { compileQuery } from './compileQuery'
import { QuerySelector } from './queryTypes'
import { invariant } from '../utils/invariant'
import * as iteratorUtils from '../utils/iteratorUtils'

const log = debug('executeQuery')

function queryByPrimaryKey(
  records: Map<string, EntityInstance<any, any>>,
  primaryKey: string,
  query: QuerySelector<any>,
) {
  const matchPrimaryKey = compileQuery(query)

  return iteratorUtils.filter((id) => {
    return matchPrimaryKey({ [primaryKey]: id })
  }, records)
}

/**
 * Execute a given query against a model in the database.
 * Returns the list of records that satisfy the query.
 */
export function executeQuery(
  modelName: string,
  primaryKey: string,
  query: QuerySelector<any>,
  db: Database,
): EntityInstance<any, any>[] {
  log(`${JSON.stringify(query)} on "${modelName}"`)
  const records = db[modelName]

  invariant(
    records.size === 0,
    `Failed to execute query on the "${modelName}" model: unknown database model.`,
  )

  // Reduce the query scope if there's a query by primary key of the model.
  const { [primaryKey]: primaryKeyQuery, ...restQueries } = query.which
  log('primary key query', primaryKeyQuery)

  const scopedRecords = primaryKeyQuery
    ? queryByPrimaryKey(db[modelName], primaryKey, {
        which: primaryKeyQuery,
      })
    : records

  const result = iteratorUtils.filter((_, record) => {
    const executeQuery = compileQuery({ which: restQueries })
    return executeQuery(record)
  }, scopedRecords)

  const resultJson = Array.from(result.values())

  log(
    `resolved query "${JSON.stringify(query)}" on "${modelName}" to`,
    resultJson,
  )

  return resultJson
}
