import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'light');

  const isAuthenticated = !!token;

  const user = {
    memberId,
    userRole,
    roles,
    permissions,
  };

  useEffect(() => {
    if (token) {
      console.log('AuthContext useEffect triggered:', { token, userRole, memberId });
      setRoles(JSON.parse(localStorage.getItem('roles') || '[]'));
      setPermissions(JSON.parse(localStorage.getItem('permissions') || '[]'));
      setUserRole(localStorage.getItem('userRole'));
      setMemberId(localStorage.getItem('memberId'));
    }
  }, [token]);

  const login = (newToken, newRoles, newPermissions, newUserRole, newMemberId) => {
    setToken(newToken);
    setRoles(newRoles);
    setPermissions(newPermissions);
    setUserRole(newUserRole);
    setMemberId(newMemberId);

    localStorage.setItem('token', newToken);
    localStorage.setItem('roles', JSON.stringify(newRoles));
    localStorage.setItem('permissions', JSON.stringify(newPermissions));
    localStorage.setItem('userRole', newUserRole);
    localStorage.setItem('memberId', newMemberId);
  };

  const logout = () => {
    setToken(null);
    setRoles([]);
    setPermissions([]);
    setUserRole(null);
    setMemberId(null);
    localStorage.clear();
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('mode', newMode);
  };

  console.log({
    token,
    roles,
    permissions,
    userRole,
    memberId,
    setToken,
    setRoles,
    setPermissions,
    setUserRole,
    setMemberId,
  });

  return (
    <AuthContext.Provider
      value={{
        token,
        roles,
        permissions,
        userRole,
        memberId,
        setToken,
        setRoles,
        setPermissions,
        setUserRole,
        setMemberId,
        login,
        logout,
        mode,
        toggleTheme,
        isAuthenticated,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Add this custom hook so you can use `useAuth()` anywhere
export const useAuth = () => useContext(AuthContext);
