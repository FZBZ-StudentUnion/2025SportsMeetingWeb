import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { LoginPage } from '../pages/LoginPage';

// 用户类型
interface User {
  id: string;
  username: string;
  role: 'admin' | 'teacher';
}

// 认证状态
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 认证动作类型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH_STATE' };

// 初始状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// 认证reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CHECK_AUTH_STATE':
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return {
          ...state,
          user,
          isAuthenticated: true,
        };
      }
      return state;
    default:
      return state;
  }
}

// 认证上下文
const AuthContext = createContext<{
  state: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
} | null>(null);

// 认证提供者
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 检查本地存储中的认证状态
  useEffect(() => {
    dispatch({ type: 'CHECK_AUTH_STATE' });
  }, []);

  // 登录函数
  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 简单的验证逻辑（实际应用中应该调用后端API）
      const validUsers = [
        { username: 'admin', password: 'admin123', role: 'admin' as const },
        { username: 'teacher', password: 'teacher123', role: 'teacher' as const },
      ];
      
      const user = validUsers.find(u => u.username === username && u.password === password);
      
      if (user) {
        const authUser: User = {
          id: Date.now().toString(),
          username: user.username,
          role: user.role,
        };
        
        localStorage.setItem('authUser', JSON.stringify(authUser));
        dispatch({ type: 'LOGIN_SUCCESS', payload: authUser });
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: '用户名或密码错误' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: '登录失败，请重试' });
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 认证hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 受保护路由组件
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <LoginPage />;
  }
  
  if (requiredRole && state.user?.role !== requiredRole) {
    return (
      <div className="access-denied">
        <h2>权限不足</h2>
        <p>您没有足够的权限访问此页面</p>
        <button onClick={() => window.location.href = '/'}>返回首页</button>
      </div>
    );
  }
  
  return <>{children}</>;
};