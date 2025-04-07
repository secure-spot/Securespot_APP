import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useToken } from "../context/TokenContext";

// Endpoints & API key
const BASE_URL = "https://sarakhan100-securespot.hf.space";
const GOOGLE_MAPS_APIKEY = "AIzaSyA4WeE-BvNOhIA7g3sxQQ_bVlEmGu2adhs";
const RIDE_REQUEST_ENDPOINT = `${BASE_URL}/ride_requests`;
const RIDE_REQUEST_STATUS_ENDPOINT = `${BASE_URL}/ride_request_status`;
const GET_RIDE_REQUEST_ENDPOINT = `${BASE_URL}/get_ride_requests`;
const STOP_RIDE_REQUEST_ENDPOINT = `${BASE_URL}/stop_ride_request`;

// Polling hook
const useInterval = (callback, delay) => {
  useEffect(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
};

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const RideRequestScreen = ({ navigation }) => {
  const { token } = useToken();

  // Inputs + suggestions
  const [currentLocation, setCurrentLocation] = useState("");
  const [destLocation, setDestLocation] = useState("");
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Ride + offers state
  const [rideRequested, setRideRequested] = useState(false);
  const [matchingOffers, setMatchingOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Loading + modal
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Debounced inputs
  const debouncedCurrent = useDebounce(currentLocation, 300);
  const debouncedDest = useDebounce(destLocation, 300);

  // Fetch ride status
  const fetchRideRequestStatus = useCallback(async () => {
    if (!token) {
      setStatusLoading(false);
      return;
    }
    try {
      setStatusLoading(true);
      const res = await fetch(`${RIDE_REQUEST_STATUS_ENDPOINT}/${token}`);
      const data = await res.json();
      if (data.status === true) {
        setRideRequested(true);
        fetchMatchingOffers(false);
      } else {
        setRideRequested(false);
        setMatchingOffers([]);
      }
    } catch (e) {
      console.error(e);
      setRideRequested(false);
    } finally {
      setStatusLoading(false);
    }
  }, [token]);

  // Fetch matching offers
  const fetchMatchingOffers = useCallback(
    async (silent = false) => {
      if (!token) return;
      try {
        if (!silent) setOffersLoading(true);
        const res = await fetch(`${GET_RIDE_REQUEST_ENDPOINT}/${token}`);
        const data = await res.json();
        if (data.status === true && data.matching_offers) {
          setMatchingOffers(data.matching_offers);
        } else {
          setMatchingOffers([]);
        }
        setLastFetchTime(new Date());
      } catch (e) {
        console.error(e);
        setMatchingOffers([]);
      } finally {
        if (!silent) setOffersLoading(false);
      }
    },
    [token]
  );

  // On mount
  useEffect(() => {
    fetchRideRequestStatus();
  }, [fetchRideRequestStatus]);

  // Poll offers every 30s
  useInterval(() => {
    if (rideRequested) fetchMatchingOffers(true);
  }, 30000);

  // Autocomplete helper
  const fetchSuggestions = async (input, setter) => {
    if (!input || input.length < 3) return setter([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const json = await res.json();
      setter(json.status === "OK" ? json.predictions : []);
    } catch (e) {
      console.error(e);
      setter([]);
    }
  };

  // When debounced inputs change
  useEffect(() => {
    if (showCurrentSuggestions) fetchSuggestions(debouncedCurrent, setCurrentSuggestions);
  }, [debouncedCurrent, showCurrentSuggestions]);

  useEffect(() => {
    if (showDestSuggestions) fetchSuggestions(debouncedDest, setDestSuggestions);
  }, [debouncedDest, showDestSuggestions]);

  // Select suggestion
  const handleSelectSuggestion = (item, type) => {
    if (type === "current") {
      setCurrentLocation(item.description);
      setShowCurrentSuggestions(false);
      setCurrentSuggestions([]);
    } else {
      setDestLocation(item.description);
      setShowDestSuggestions(false);
      setDestSuggestions([]);
    }
  };

  // Request ride
  const handleRequestRide = async () => {
    if (!currentLocation || !destLocation) {
      setModalMessage("Please enter both current and destination locations.");
      return setModalVisible(true);
    }
    if (!token) {
      setModalMessage("Please login first.");
      return setModalVisible(true);
    }
    setLoading(true);
    try {
      const res = await fetch(RIDE_REQUEST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          current_location: currentLocation,
          destination_location: destLocation,
        }),
      });
      const result = await res.json();
      if (result.status === true) {
        setRideRequested(true);
        setModalMessage(result.message || "Ride requested.");
        fetchMatchingOffers(false);
      } else {
        setModalMessage(result.message || "Request failed.");
      }
    } catch (e) {
      console.error(e);
      setModalMessage("Error requesting ride.");
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  // Stop ride
  const handleStopRideRequest = async () => {
    if (!token) {
      setModalMessage("Please login first.");
      return setModalVisible(true);
    }
    try {
      const res = await fetch(`${STOP_RIDE_REQUEST_ENDPOINT}/${token}`, { method: "POST" });
      const result = await res.json();
      if (result.status === true) {
        setRideRequested(false);
        setMatchingOffers([]);
        setModalMessage(result.message || "Ride stopped.");
      } else {
        setModalMessage(result.message || "Stop failed.");
      }
    } catch (e) {
      console.error(e);
      setModalMessage("Error stopping ride.");
    } finally {
      setModalVisible(true);
    }
  };

  // Manual refresh
  const handleRefreshOffers = () => fetchMatchingOffers(false);

  // Format last update
  const formatLastUpdateTime = () => {
    if (!lastFetchTime) return "";
    const diff = Math.floor((Date.now() - lastFetchTime) / 1000);
    if (diff < 60) return `Updated ${diff}s ago`;
    if (diff < 3600) return `Updated ${Math.floor(diff/60)}m ago`;
    return `Updated at ${lastFetchTime.toLocaleTimeString()}`;
  };

  // While loading status
  if (statusLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={["#1F1C2C", "#928DAB"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Checking ride status...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#1F1C2C", "#928DAB"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerContainer}>
            <Text style={styles.appName}>SecureSpot</Text>
            <Text style={styles.header}>Ride Request</Text>

            {rideRequested ? (
              <>
                <Text style={styles.alreadyText}>You have an active ride request.</Text>
                <TouchableOpacity style={styles.stopButton} onPress={handleStopRideRequest}>
                  <Text style={styles.buttonText}>Stop Ride Request</Text>
                </TouchableOpacity>

                <View style={styles.offersContainer}>
                  <View style={styles.offersHeaderContainer}>
                    <Text style={styles.offersHeader}>Matching Offers</Text>
                    <TouchableOpacity
                      style={styles.refreshButton}
                      onPress={handleRefreshOffers}
                      disabled={offersLoading}
                    >
                      <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                  </View>

                  {lastFetchTime && (
                    <Text style={styles.lastUpdateText}>{formatLastUpdateTime()}</Text>
                  )}

                  {offersLoading ? (
                    <View style={styles.loadingOffers}>
                      <ActivityIndicator color="#333" />
                      <Text style={styles.loadingOffersText}>Loading offers...</Text>
                    </View>
                  ) : matchingOffers.length > 0 ? (
                    matchingOffers.map((offer) => (
                      <View key={offer.rider_offer_id} style={styles.offerItem}>
                        <Text style={styles.offerTitle}>{offer.name}'s Ride</Text>
                        <View style={styles.offerDetails}>
                          <Text style={styles.offerText}>
                            <Text style={styles.offerLabel}>Vehicle: </Text>
                            {offer.vehicle_model} ({offer.color})
                          </Text>
                          <Text style={styles.offerText}>
                            <Text style={styles.offerLabel}>From: </Text>
                            {offer.current_location}
                          </Text>
                          <Text style={styles.offerText}>
                            <Text style={styles.offerLabel}>To: </Text>
                            {offer.destination_location}
                          </Text>
                          <Text style={styles.offerText}>
                            <Text style={styles.offerLabel}>Seats: </Text>
                            {offer.available_seats}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noOffersContainer}>
                      <Text style={styles.noOffersText}>No matching offers found yet.</Text>
                      <Text style={styles.noOffersSubtext}>
                        We'll keep looking. You can stop the request any time.
                      </Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                {/* Current Location Input + Suggestions */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current location"
                    placeholderTextColor="#B0B0B0"
                    value={currentLocation}
                    onChangeText={(t) => {
                      setCurrentLocation(t);
                      setShowCurrentSuggestions(true);
                    }}
                  />
                  {showCurrentSuggestions && currentSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {currentSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectSuggestion(item, "current")}
                        >
                          <Text style={styles.suggestionText}>{item.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Destination Location Input + Suggestions */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter destination location"
                    placeholderTextColor="#B0B0B0"
                    value={destLocation}
                    onChangeText={(t) => {
                      setDestLocation(t);
                      setShowDestSuggestions(true);
                    }}
                  />
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {destSuggestions.map((item) => (
                        <TouchableOpacity
                          key={item.place_id}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectSuggestion(item, "dest")}
                        >
                          <Text style={styles.suggestionText}>{item.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={handleRequestRide}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Request Ride</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RideRequestScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  innerContainer: {
    width: "90%",
    maxWidth: 370,
    backgroundColor: "#ffffffcc",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 6,
    alignItems: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F1C2C",
    marginBottom: 20,
    textAlign: "center",
  },
  header: {
    fontSize: 28,
    color: "#1F1C2C",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  alreadyText: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  // Wraps each input + suggestions
  inputWrapper: {
    width: "100%",
    position: "relative",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F4F6F8",
    borderRadius: 30,
    paddingLeft: 20,
    fontSize: 16,
    color: "#333",
    borderColor: "#D0D0D0",
    borderWidth: 1,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 55, // input height + gap
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 150,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    zIndex: 100,
  },
  suggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
  },

  requestButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#928DAB",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    elevation: 4,
  },
  stopButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#c0392b",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  offersContainer: { width: "100%", marginTop: 20, paddingHorizontal: 10 },
  offersHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  offersHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F1C2C",
  },
  refreshButton: {
    backgroundColor: "#928DAB",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  lastUpdateText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", fontSize: 18, marginTop: 10 },
  loadingOffers: { alignItems: "center", paddingVertical: 20 },
  loadingOffersText: { marginTop: 10, fontSize: 16, color: "#666" },
  offerItem: {
    backgroundColor: "#F4F6F8",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1C2C",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 5,
  },
  offerDetails: { paddingLeft: 5 },
  offerLabel: { fontWeight: "bold", color: "#555" },
  offerText: { fontSize: 16, color: "#333", marginBottom: 5 },
  noOffersContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
  },
  noOffersText: { fontSize: 18, fontWeight: "bold", color: "#555", marginBottom: 10 },
  noOffersSubtext: { fontSize: 14, color: "#777", textAlign: "center" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 300,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#928DAB",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
