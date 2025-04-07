import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'http://34128153484-2lfk3rb9pn431vscnsmb252t0n4oibqh.apps.googleusercontent.com/',
});

// Local Dummy Users for Username/Password Login
const USERS = [
  { username: 'testuser', password: '123456', email: 'testuser@example.com' },
];

// Local Username/Password Authentication
export const loginWithUsername = async (username, password) => {
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (user) {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
};

// Google Sign-In
export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken, user } = await GoogleSignin.signIn();
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

// Logout
export const logout = async () => {
  await AsyncStorage.removeItem('user');
  await GoogleSignin.signOut();
};
