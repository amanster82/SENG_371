/* eslint-disable no-unused-vars */
/**
 * This implementation is based loosely off of the Redux design paradigm
 * The difference is that we give the store a function which can directly
 * alter the state before triggering the listeners rather than relying
 * on combining reducers and actions
 *
 * This will return an object with a few functions for managing global
 * application state as well as subscribers to trigger when that state changes
 */
function createStore() {

  // State tree
  let currentState = {};

  // An array of functions to invoke when state is changed; observables
  const currentListeners = [];

  // Return the state of this store
  function getState() {
    return currentState;
  }

  // Will update the state and trigger all listener callbacks
  function setState(newState) {

    // Merge the new state into the current state non-destructively
    currentState = Object.assign({}, currentState, newState);

    // Copy the listeners to avoid mutation during iteration
    const listeners = currentListeners;

    for (let i = 0; i < listeners.length; i++) { // eslint-disable-line no-plusplus

      // Invoke the listener function
      listeners[i]();
    }
  }

  // Will add the listener function to a list of functions that will trigger whenever state changes
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('subscribe: listener is not a valid function');
    }

    currentListeners.push(listener);
  }

  return {
    getState,
    setState,
    subscribe,
  };
}
