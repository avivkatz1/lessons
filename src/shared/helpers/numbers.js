function numbers(number, max, min = 0, decimal = 0, neg = false, obj = false) {
  const variables = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
  const newMax = max ? max : 200;
  const numbersArray = obj ? {} : [];
  for (let i = 0; i < number; i++) {
    let newNum = Math.floor(Math.random() * newMax) + min;
    if (neg === true) {
      const posNeg = Math.random();
      newNum = posNeg > 0.5 ? newNum : newNum * -1;
    }
    obj ? (numbersArray[variables[i]] = newNum) : numbersArray.push(newNum);
  }
  return numbersArray;
}

export default numbers;
