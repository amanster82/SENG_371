/**
  * This function will iteratively remove every html element attached to the 'element' node
  */
function removeAllChildren(element) { // eslint-disable-line no-unused-vars

  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}
