export const getLoggedUser = (state) => state.loggedUserId && state.users[state.loggedUserId]

export const isUserLogged = (state) => state.loggedUserId != null
