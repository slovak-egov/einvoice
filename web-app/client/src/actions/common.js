export const setData = (path) => (data) => ({
  type: `SET DATA ON ${path}`,
  path,
  payload: data,
  reducer: (_, data) => data,
})

export const updateRunningRequests = (change) => ({
  type: 'UPDATE RUNNING REQUESTS',
  path: ['loadingRequests'],
  payload: change,
  reducer: (state, change) => state + change,
})

export const loadingWrapper = (action) => (
  async (dispatch) => {
    dispatch(updateRunningRequests(1))
    const returnValue = await dispatch(action)
    dispatch(updateRunningRequests(-1))
    return returnValue
  }
)
