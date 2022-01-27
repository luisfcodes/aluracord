import React, { useEffect, useState } from "react"

export const AuthContext = React.createContext({})

export async function Api(user) {
  const req = await fetch(`https://api.github.com/users/${user}`)
  const data = await req.json()
  return data
}

export const AuthProvider = (props) => {

  const [user, setUser] = useState('')
  const [infoGit, setInfoGit] = useState({login: 'LFS9902', name: 'Luis Fernando'})

  return (
    <AuthContext.Provider value={{user, setUser, infoGit, setInfoGit}}>
      {props.children}
    </AuthContext.Provider>
  )
}