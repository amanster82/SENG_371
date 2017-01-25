/* eslint-disable no-unused-vars, no-undef */
// Create a global state store with an initial state
const store = createStore({
  projects: [],
});

// If projects page is empty, then for debug purposes populate it with a few
// TODO: Remove this once more functionality is added to application
if (store.getState().projects.length === 0) {
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
}
