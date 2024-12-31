import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:8000';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * Initiates the Google OAuth flow by redirecting to Google's sign-in page
 * @throws {Error} If the redirect fails
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    window.location.href = `${API_URL}/auth/google/signin`;
  } catch (error) {
    throw new Error('Failed to redirect to Google sign-in');
  }
};

/**
 * Handles the Google OAuth callback by exchanging the code for user data
 * @param code - The authorization code returned by Google
 * @returns Promise<AuthResponse> - User authentication data
 * @throws {AuthError} If the callback fails
 */
export const handleGoogleCallback = async (code: string): Promise<AuthResponse> => {
  try {
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const response = await axios.get<AuthResponse>(
      `${API_URL}/auth/google/callback?code=${code}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    return response.data;
  } catch (error) {
    const authError: AuthError = {
      message: 'Authentication failed',
    };

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      authError.code = axiosError.response?.status?.toString();
    }

    throw authError;
  }
};

// Helper function to validate the auth response
export const isValidAuthResponse = (response: any): response is AuthResponse => {
  return (
    response &&
    typeof response.token === 'string' &&
    response.user &&
    typeof response.user.id === 'string' &&
    typeof response.user.email === 'string' &&
    typeof response.user.name === 'string'
  );
};