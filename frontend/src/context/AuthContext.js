import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem('accessToken'));
  const [userId, setUserId] = useState(sessionStorage.getItem('userId'));
  const [username, setUsername] = useState(sessionStorage.getItem('username'));

  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    if (accessToken) {
      try {
        const response = await axios.get(`${config.apiBASEURL}/authentication/status`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { isAuthenticated, Username, role, userId} = response.data;
        setIsAuthenticated(isAuthenticated);
        setRole(role);
        setUserId(userId);
        setUsername(Username);


        // Store the tokens and user details in session storage
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('username', Username);

      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        setRole(null);
        setUserId(null);
        setUsername(null);

      }
    } else {
      setIsAuthenticated(false);
      setRole(null);
      setUserId(null);
      setUsername(null);

    }
    setLoading(false);
  };

  useEffect(() => {
    // Check the token status immediately on mount
    checkAuthStatus();

    // Set an interval to check the token status every 30 minutes (1800000 ms)
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 1800000); // 30 minutes in milliseconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [accessToken]);

  const login = (authData) => {
    setIsAuthenticated(true);
    setRole(authData.role);
    setAccessToken(authData.accessToken);
    setUserId(authData.userId);
    setUsername(authData.username);


    // Store the tokens and user details in session storage
    sessionStorage.setItem('accessToken', authData.accessToken);
    sessionStorage.setItem('role', authData.role);

  };

  const logout = async () => {
    setIsAuthenticated(false);
    setRole(null);
    setAccessToken(null);
    setUserId(null);
    setUsername(null);


    // Remove tokens and user details from session storage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');

  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, accessToken, userId, username, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

