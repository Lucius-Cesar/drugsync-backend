//keep only unique element in array
function unique(arr) {
    const uniqueSet = new Set(arr);
    return Array.from(uniqueSet);
}

function uniqueObjectArray(arr){
    const uniqueObjects = [];
    const uniqueMap = new Map();
  
    for (const obj of arr) {
      const objString = JSON.stringify(obj);
      if (!uniqueMap.has(objString)) {
        uniqueMap.set(objString, true);
        uniqueObjects.push(obj);
      }
    }
    return uniqueObjects
}
module.exports = { uniqueObjectArray, unique };
