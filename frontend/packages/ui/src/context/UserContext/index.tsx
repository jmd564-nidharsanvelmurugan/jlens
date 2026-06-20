import React, {
	createContext,
	useReducer,
	ReactNode,
	Reducer,
	useEffect,
} from "react"

interface State {
	id: string
	name: string
	designation: string
	email: string
	phone: string
	headshot:string
}

const actionTypes = {
	SET_USER_DATA: "SET_USER_DATA",
} as const

type ActionType = typeof actionTypes

type Action = { type: ActionType["SET_USER_DATA"]; payload: State }

const initialState: State = {
	id: "",
	name: "",
	designation: "",
	email: "",
	phone: "",
	headshot:""
}

const reducer: Reducer<State, Action> = (state, action) => {
	switch (action.type) {
		case actionTypes.SET_USER_DATA:
            localStorage.setItem('userState', JSON.stringify({ ...state, ...action?.payload }));
			return { ...state, ...action?.payload }
		default:
			return state
	}
}

interface AppContextProps {
	state: State
	dispatch: React.Dispatch<Action>
}

export const UserContext = createContext<AppContextProps>({
	state: initialState,
	dispatch: () => {},
})

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	useEffect(() => {
		const localStorageState = localStorage.getItem("userState")
		if (localStorageState) {
			try {
				const parsedState: State = JSON.parse(localStorageState)
				dispatch({
					type: actionTypes.SET_USER_DATA,
					payload: parsedState,
				})
			} catch (error) {
				console.error("Failed to parse localStorage state", error)
			}
		}
	}, [])

	return (
		<>
			<UserContext.Provider value={{ state, dispatch }}>
				{children}
			</UserContext.Provider>
		</>
	)
}