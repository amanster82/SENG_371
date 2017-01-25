/* eslint-disable no-unused-vars, no-undef */
// Create a global state store
const store = createStore();

// Initial state
store.setState({
  projects: [{
    project_name: 'Project One',
  },
  {
    project_name: 'Project Two',
  },
  {
    project_name: 'Project Three',
  }],
});
