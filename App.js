import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import AuthenticationScreen from "./src/screens/AuthenticationScreen";
import { RideRequestProvider, TokenProvider, ParkingTokenProvider } from './src/context/TokenContext'; // Import TokenProvider
import ProfileScreen from './src/screens/ProfileScreen'
import RegisterVehicleScreen from './src/screens/RegisterVehicleScreen'
import ChatbotScreen from './src/screens/ChatbotScreen'
import SecureAlertScreen from "./src/screens/SecureAlertScreen";
import ParkingSecureSpotOptions from "./src/screens/ParkingScreen";
import MapScreen from "./src/screens/MapScreen";
import DetectParkingScreen from "./src/screens/DetectParkingScreen";
import RideSharingScreen from "./src/screens/RideSharingScreen";
import ParkingTokenScreen from "./src/screens/ParkingTokenScreen";
import RideRequestScreen from "./src/screens/RideRequestScreen";
import RideShareScreen from "./src/screens/RideShareScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <TokenProvider>
      <ParkingTokenProvider>
        <RideRequestProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Authentication" component={AuthenticationScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Register Vehicle" component={RegisterVehicleScreen} />
          <Stack.Screen name="Assistant" component={ChatbotScreen} />
          <Stack.Screen name="SecureAlert" component={SecureAlertScreen} />
          <Stack.Screen name="RideSharing" component={RideSharingScreen} />
           <Stack.Screen name="Parking" component={ParkingSecureSpotOptions} />
          <Stack.Screen name="ParkingMapScreen" component={MapScreen} />
          <Stack.Screen name="DetectParkingScreen" component={DetectParkingScreen} />

          <Stack.Screen name="ParkingTokenScreen" component={ParkingTokenScreen} />

          <Stack.Screen name="RideRequest" component={RideRequestScreen} />
          <Stack.Screen name="RideShare" component={RideShareScreen} />
        </Stack.Navigator>
      </NavigationContainer>
        </RideRequestProvider>
        </ParkingTokenProvider>
    </TokenProvider>
  );
}
