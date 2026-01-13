export const CLIENT = {
    NETWORK_ERROR: 'networkError',
    NO_SESSION: 'no-session',
    USERNAME_MISSING: 'Username-missing',
    REQUIRED_USERNAME: 'required-username',
    USERNAME_NOT_FOUND: 'username-not-found',
};

export const SERVER = {
    AUTH_MISSING: 'auth-missing',
    AUTH_INSUFFICIENT: 'auth-insufficient',
    ACCESS_DENIED: 'access-denied',
    REQUIRED_USERNAME: 'required-username',
    USERNAME_NOT_FOUND: 'username-not-found',
};

export const ERROR_MESSAGES = {
    [CLIENT.NO_SESSION]: 'You are not logged in. Please log in to continue.',
    [CLIENT.NETWORK_ERROR]: 'Trouble connecting to the network. Please try again!',
    [CLIENT.REQUIRED_USERNAME]: 'Username can only contain letters, numbers, and underscores.',
    [CLIENT.USERNAME_MISSING]: 'Username can not be empty.',
    [CLIENT.USERNAME_NOT_FOUND]: 'Username not found. Please sign up first.',
    [CLIENT.REQUIRED_WORD]: 'Word can only contain letters, numbers, and underscores.',
    [CLIENT.WORD_MISSING]: 'Word cannot be empty.',

    [SERVER.AUTH_MISSING]: 'Please log in to continue.',
    [SERVER.AUTH_INSUFFICIENT]: 'User not allowed.',
    [SERVER.ACCESS_DENIED]: 'User not allowed.',
    [SERVER.REQUIRED_USERNAME]: 'Username can only contain letters, numbers, and underscores.',
    [SERVER.USERNAME_NOT_FOUND]: 'Username not found. Please sign up first.',
    [SERVER.REQUIRED_WORD]: 'Word can only contain letters, numbers, and underscores.',
    [SERVER.WORD_MISSING]: 'Word cannot be empty.',
    default: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Login successful!",
    SIGNUP_SUCCESS: "Sign up successful! You can now log in.",
};