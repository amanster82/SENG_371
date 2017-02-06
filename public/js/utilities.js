/**
  * This function will iteratively remove every html element attached to the 'element' node
  */
function removeAllChildren(element) { // eslint-disable-line no-unused-vars

  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}

/**
  * Will instantiate a web component with the given name and pass it the properties
  */
function createElement(elementName, props) { // eslint-disable-line no-unused-vars

  return new (customElements.get(elementName))(props);
}
