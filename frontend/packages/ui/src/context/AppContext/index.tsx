import React, { createContext, useReducer, ReactNode, Reducer, useEffect } from "react";

interface State {
	isLoggedIn: boolean
	isAppLoading: boolean
}

const actionTypes = {
	SET_LOGIN_TRUE: "SET_LOGIN_TRUE",
	SET_LOGIN_FALSE: "SET_LOGIN_FALSE",
	SET_LOADING_TRUE: "SET_LOADING_TRUE",
	SET_LOADING_FALSE: "SET_LOADING_FALSE"
} as const;

type ActionType = typeof actionTypes;

type Action =
	{ type: ActionType["SET_LOADING_TRUE"]; } |
	{ type: ActionType["SET_LOADING_FALSE"]; } |
	{ type: ActionType["SET_LOGIN_TRUE"]; } |
	{ type: ActionType["SET_LOGIN_FALSE"]; }


const initialState: State = {
	isLoggedIn: false,
	isAppLoading: false
};

const reducer: Reducer<State, Action> = (state, action) => {
	switch (action.type) {
		case actionTypes.SET_LOADING_TRUE:
			localStorage.setItem('appState', JSON.stringify({ ...state, isAppLoading: true }));
			return { ...state, isAppLoading: true };
		case actionTypes.SET_LOADING_FALSE:
			localStorage.setItem('appState', JSON.stringify({ ...state, isAppLoading: false }));
			return { ...state, isAppLoading: false };
		case actionTypes.SET_LOGIN_TRUE:
			localStorage.setItem('appState', JSON.stringify({ ...state, isLoggedIn: true }));
			return { ...state, isLoggedIn: true };
		case actionTypes.SET_LOGIN_FALSE:
			localStorage.setItem('appState', JSON.stringify({ ...state, isLoggedIn: false }));
			return { ...state, isLoggedIn: false };
		default:
			return state;
	}
};

interface AppContextProps {
	state: State;
	dispatch: React.Dispatch<Action>;
}

export const AppContext = createContext<AppContextProps>({
	state: initialState,
	dispatch: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		const localStorageState = localStorage.getItem('appState');
		if (localStorageState) {
			try {
				const parsedState: State = JSON.parse(localStorageState);
				dispatch({ type: parsedState.isAppLoading ? actionTypes.SET_LOADING_TRUE : actionTypes.SET_LOADING_FALSE });
				dispatch({ type: parsedState.isLoggedIn ? actionTypes.SET_LOGIN_TRUE : actionTypes.SET_LOGIN_FALSE });
			} catch (error) {
				console.error('Failed to parse localStorage state', error);
			}
		}
	}, []);

	return (
		<>
			<AppContext.Provider value={{ state, dispatch }}>
				{children}
			</AppContext.Provider>
		</>
	);
};