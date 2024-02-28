/**
 * Converts an object meant to store as a Mongo document to dot notation syntax.
 * @returns Object which contains the dot notation syntax to update the intended Mongo document
 */
function transformObjectToDotNotation(obj) {
  const returnObj = {};
  for (const [key, value] of Object.entries(obj)) {
    // Always return mongo key as it is
    if (key === "_id") {
      returnObj[key] = value;
      continue;
    }
    switch (typeof value) {
      case "function":
      case "undefined":
      case "symbol": // mongo will ignore symbols
        continue;
      case "bigint":
      case "number":
      case "boolean":
      case "string":
        returnObj[key] = value;
        continue;
      case "object":
        if (value instanceof Date || value === null) {
          returnObj[key] = value;
        } else if (Array.isArray(value)) {
          const newElem = transformArrayForDotNotation(value);
          for (const [innerKey, innerValue] of Object.entries(newElem)) {
            returnObj[`${key}.${innerKey}`] = innerValue;
          }
        } else {
          const innerObj = transformObjectToDotNotation(value);
          for (const [innerKey, innerValue] of Object.entries(innerObj)) {
            returnObj[`${key}.${innerKey}`] = innerValue;
          }
        }
    }
  }
  return returnObj;
}

/**
 * This function is only meant to be used as a helper function as a Mongo document is not an array but an object.
 * However, it is necessary to handle multidimensional arrays recursively.
 * @returns Object which contains the dot notation syntax of the array
 */
function transformArrayForDotNotation(arr) {
  const newObj = {};
  for (let i = 0; i < arr.length; i++) {
    switch (typeof arr[i]) {
      case "function":
      case "undefined":
      case "symbol": // mongo will ignore symbols
        continue;
      case "bigint":
      case "number":
      case "boolean":
      case "string":
        newObj[i] = arr[i];
        continue;
      case "object":
        const el = arr[i];
        if (el instanceof Date || el === null) {
          newObj[i] = el;
        } else if (Array.isArray(el)) {
          const newElem = transformArrayForDotNotation(el);
          for (const [innerKey, innerValue] of Object.entries(newElem)) {
            newObj[`${i}.${innerKey}`] = innerValue;
          }
        } else {
          const innerObj = transformObjectToDotNotation(el);
          for (const [innerKey, innerValue] of Object.entries(innerObj)) {
            newObj[`${i}.${innerKey}`] = innerValue;
          }
        }
    }
  }
  return newObj;
}

modules.export = { transformObjectToDotNotation, transformArrayForDotNotation };
