import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { MemoryRouter } from 'react-router-dom';
import { loginUser, warmupBackend } from './Api';

// Mock the API module
jest.mock('./Api', () => ({
  warmupBackend: jest.fn(),
  loginUser: jest.fn(),
}));

// Mock the useNavigate hook from react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock localStorage for the test environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Login Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    warmupBackend.mockResolvedValue({});
    loginUser.mockClear();
    mockedNavigate.mockClear();
    localStorageMock.clear();
  });

  it('renders the login form', () => {
    render(<Login login={() => {}} />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter dashboard/i })).toBeInTheDocument();
  });

  it('shows a warning if fields are empty on login attempt', async () => {
    render(<Login login={() => {}} />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole('button', { name: /enter dashboard/i }));

    // Snackbar message appears
    expect(await screen.findByText(/enter username and password/i)).toBeInTheDocument();
  });

  it('calls loginUser and handles successful login', async () => {
    const mockLogin = jest.fn();
    const mockToken = 'fake-jwt-token';
    const mockRole = 'ADMIN';
    const mockUsername = 'testuser';

    loginUser.mockResolvedValue({
      data: { token: mockToken, role: mockRole, username: mockUsername },
    });

    render(<Login login={mockLogin} />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: mockUsername } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /enter dashboard/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ username: mockUsername, password: 'password123' });
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('role')).toBe(mockRole);
      expect(localStorage.getItem('username')).toBe(mockUsername);
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('shows an error message on failed login', async () => {
    loginUser.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
    render(<Login login={() => {}} />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /enter dashboard/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('navigates to register page when register button is clicked', () => {
    render(<Login login={() => {}} />, { wrapper: MemoryRouter });
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/register');
  });
});