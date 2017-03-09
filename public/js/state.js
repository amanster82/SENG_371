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

// Check for localStorage availability
function localStorageAvailable() {
  try {
    const x = '__storage_test__';

    localStorage.setItem(x, x);
    localStorage.removeItem(x);

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * This will return an object with a few functions for managing global
 * application state as well as subscribers to trigger when that state changes
 */
function createStore(initialState) {

  // Initial state tree
  let currentState = initialState || {};

  // An array of functions to invoke when state is changed; observables
  const currentListeners = [];

  // Localstorage check
  const useLocalStorage = localStorageAvailable();
  const storageKey = 'NexGenState';

  // Load state from previous session
  if (useLocalStorage && localStorage.getItem(storageKey)) {
    currentState = JSON.parse(localStorage.getItem(storageKey));
  }

  // Return the state of this store
  function getState() {
    return currentState;
  }

  // Will update the state and trigger all listener callbacks
  function setState(newState, options) {

    // Merge the new state into the current state non-destructively
    currentState = Object.assign({}, currentState, newState);

    // Persist to localStorage
    if (useLocalStorage) {
      localStorage.setItem(storageKey, JSON.stringify(currentState));
    }

    if (options && options.suppressUpdate === true) {
      return;
    }

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
