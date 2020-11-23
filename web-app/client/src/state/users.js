export const getLoggedUser = (state) => state.loggedUserId && state.users[state.loggedUserId]

export const isLogged = (state) => state.loggedUserId != null
