import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------------------- Regular Token Context ---------------------- */

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading token", error);
      }
    };
    loadToken();
  }, []);

  useEffect(() => {
    const storeToken = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem("token", token);
        } else {
          await AsyncStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error storing token", error);
      }
    };
    storeToken();
  }, [token]);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

/* -------------------- Parking Token Context -------------------- */

const ParkingTokenContext = createContext();

export const ParkingTokenProvider = ({ children }) => {
  // parkingTokenData is an object { token: string, timestamp: number }
  const [parkingTokenData, setParkingTokenData] = useState(null);

  useEffect(() => {
    const loadParkingToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("parking_token");
        if (storedToken) {
          setParkingTokenData(JSON.parse(storedToken));
        }
      } catch (error) {
        console.error("Error loading parking token", error);
      }
    };
    loadParkingToken();
  }, []);

  useEffect(() => {
    const storeParkingToken = async () => {
      try {
        if (parkingTokenData) {
          await AsyncStorage.setItem("parking_token", JSON.stringify(parkingTokenData));
        } else {
          await AsyncStorage.removeItem("parking_token");
        }
      } catch (error) {
        console.error("Error storing parking token", error);
      }
    };
    storeParkingToken();
  }, [parkingTokenData]);

  const saveToken = async (newToken) => {
    // Save the token along with the current timestamp (in ms)
    setParkingTokenData({ token: newToken, timestamp: Date.now() });
  };

  const clearToken = async () => {
    setParkingTokenData(null);
  };

  return (
    <ParkingTokenContext.Provider value={{ parkingTokenData, saveToken, clearToken }}>
      {children}
    </ParkingTokenContext.Provider>
  );
};

export const useParkingToken = () => useContext(ParkingTokenContext);

/* -------------------- Ride Request Context -------------------- */

const RideRequestContext = createContext();

export const RideRequestProvider = ({ children }) => {
  // rideRequestStatus is a boolean that indicates whether a ride has been requested
  const [rideRequestStatus, setRideRequestStatus] = useState(false);

  // Load ride request status from AsyncStorage when the provider mounts
  useEffect(() => {
    const loadRideStatus = async () => {
      try {
        const storedStatus = await AsyncStorage.getItem("ride_request_status");
        if (storedStatus !== null) {
          setRideRequestStatus(JSON.parse(storedStatus));
        }
      } catch (error) {
        console.error("Error loading ride request status", error);
      }
    };
    loadRideStatus();
  }, []);

  // Persist ride request status changes to AsyncStorage
  useEffect(() => {
    const storeRideStatus = async () => {
      try {
        await AsyncStorage.setItem("ride_request_status", JSON.stringify(rideRequestStatus));
      } catch (error) {
        console.error("Error storing ride request status", error);
      }
    };
    storeRideStatus();
  }, [rideRequestStatus]);

  // Function to clear (delete) the ride request status
  const clearRideRequestStatus = async () => {
    setRideRequestStatus(false);
  };

  // Function to edit (update) the ride request status
  const editRideRequestStatus = async (newStatus) => {
    setRideRequestStatus(newStatus);
  };

  return (
    <RideRequestContext.Provider
      value={{ rideRequestStatus, setRideRequestStatus, clearRideRequestStatus, editRideRequestStatus }}
    >
      {children}
    </RideRequestContext.Provider>
  );
};

export const useRideRequest = () => useContext(RideRequestContext);
