export const isNull = (value: any): value is null => value === null
export const isNotNull = (value: any): value is null => !isNull(value)

export const isUndefined = (value: any): value is undefined => typeof value === 'undefined'
export const isNotUndefined = (value: any): value is undefined => !isUndefined(value)

export const isNullOrUndefined = (value: any): value is null | undefined => isNull(value) || isUndefined(value)
export const isNotNullOrUndefined = (value: any): value is null | undefined => isNotNull(value) && isNotUndefined(value)

export const isBoolean = (value: any): value is boolean => typeof value === 'boolean'
export const isNotBoolean = (value: any): value is boolean => !isBoolean(value)

export const isFunction = (value: any) => typeof value === 'function'
export const isNotFunction = (value: any) => !isFunction(value)

export const isNumber = (value: any): value is number => typeof value === 'number'
export const isNotNumber = (value: any): value is number => !isNumber(value)

export const isString = (value: any): value is string => typeof value === 'string'
export const isNotString = (value: any): value is string => !isString(value)

export const isObject = (value: any): value is object =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const isNotObject = (value: any): value is object => !isObject(value)

export const isArray = (value: any): value is any[] => Array.isArray(value)
export const isNotArray = (value: any): value is any[] => !isArray(value)

export const isDate = (value: any): value is Date => value instanceof Date
export const isNotDate = (value: any): value is Date => !isDate(value)

export const isMap = (value: any): value is Map<any, any> => value instanceof Map
export const isNotMap = (value: any): value is Map<any, any> => !isMap(value)

export const isEmpty = (value: any): boolean => {
  if (isNullOrUndefined(value)) {
    return true
  }

  if (isString(value) || isArray(value)) {
    return value.length === 0
  }

  if (isMap(value)) {
    return value.size === 0
  }

  if (isObject(value)) {
    return Object.keys(value).length === 0
  }

  return false
}
export const isNotEmpty = (value: any): boolean => !isEmpty(value)
