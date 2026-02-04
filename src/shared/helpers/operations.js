import React from "react";

const operations = (oppArray = ["add", "subtract", "multiply", "divide"]) => {
  const operationsPicker = Math.floor(Math.random() * oppArray.length);
  const operationUsed = oppArray[operationsPicker];
  const returningOperations = {
    add: {
      operation: "+",
      operationText: "+",
      undoOperation: "-",
      word: "add",
      undoWord: "subtract",
    },
    subtract: {
      operation: "-",
      operationText: "-",
      undoOperation: "+",
      word: "subtract",
      undoWord: "add",
    },
    multiply: {
      operation: "*",
      operationText: "\\cdot",
      undoOperation: "/",
      word: "multiply",
      undoWord: "divide",
    },
    divide: {
      operation: "/",
      operationText: "/",
      undoOperation: "*",
      word: "divide",
      undoWord: "multiply",
    },
    pow: {
      operation: "^",
      operationText: "^",
      undoOperation: "^1/",
      word: "pow",
      undoWord: "nthRoot",
    },
  };
  return returningOperations[operationUsed];
};

export default operations;
