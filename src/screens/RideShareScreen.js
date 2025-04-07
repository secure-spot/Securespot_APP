import React, { useState, useEffect } from "react";
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
const RIDE_SHARE_STATUS_ENDPOINT = `${BASE_URL}/ride_share_status`;
const RIDE_SHARE_ENDPOINT = `${BASE_URL}/ride_share`;
const STOP_RIDE_SHARE_ENDPOINT = `${BASE_URL}/stop_ride_share`;

const RideShareScreen = () => {
  const { token } = useToken();

  // Inputs + suggestions
  const [currentLocation, setCurrentLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showCurrentSuggestions, setShowCurrentSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Seats picker (1–4)
  const [availableSeats, setAvailableSeats] = useState(null);

  // Ride share state
  const [rideShareActive, setRideShareActive] = useState(false);

  // Loading + modal
  const [statusLoading, setStatusLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // 1. Check ride-share status on mount
  useEffect(() => {
    if (!token) {
      setStatusLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${RIDE_SHARE_STATUS_ENDPOINT}/${token}`, {
          method: "POST",
        });
        const json = await res.json();
        setRideShareActive(json.status === true);
      } catch (e) {
        console.error("Status error:", e);
      } finally {
        setStatusLoading(false);
      }
    })();
  }, [token]);

  // 2. Autocomplete helper
  const fetchSuggestions = async (input, setter) => {
    if (!input || input.length < 3) return setter([]);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_APIKEY}`;
      const res = await fetch(url);
      const { status, predictions } = await res.json();
      setter(status === "OK" ? predictions : []);
    } catch (e) {
      console.error("Autocomplete error:", e);
      setter([]);
    }
  };

  useEffect(() => {
    if (showCurrentSuggestions) fetchSuggestions(currentLocation, setCurrentSuggestions);
  }, [currentLocation, showCurrentSuggestions]);

  useEffect(() => {
    if (showDestinationSuggestions) fetchSuggestions(destinationLocation, setDestinationSuggestions);
  }, [destinationLocation, showDestinationSuggestions]);

  // 3. Select suggestion
  const handleSelectSuggestion = (item, type) => {
    if (type === "current") {
      setCurrentLocation(item.description);
      setShowCurrentSuggestions(false);
      setCurrentSuggestions([]);
    } else {
      setDestinationLocation(item.description);
      setShowDestinationSuggestions(false);
      setDestinationSuggestions([]);
    }
  };

  // 4. Share ride
  const handleShareRide = async () => {
    if (!currentLocation || !destinationLocation || !availableSeats) {
      setModalMessage("Please fill out all fields.");
      return setModalVisible(true);
    }
    if (!token) {
      setModalMessage("Please login first.");
      return setModalVisible(true);
    }
    setLoading(true);
    try {
      const res = await fetch(RIDE_SHARE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          current_location: currentLocation,
          destination_location: destinationLocation,
          available_seats: availableSeats,
        }),
      });
      const json = await res.json();
      if (json.status === true) {
        setRideShareActive(true);
        setModalMessage(json.message || "Ride shared successfully");
      } else {
        setModalMessage(json.message || "Ride share failed");
      }
    } catch (e) {
      console.error("Share error:", e);
      setModalMessage("Error sharing ride.");
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  // 5. Stop ride share
  const handleStopRideShare = async () => {
    if (!token) {
      setModalMessage("Please login first.");
      return setModalVisible(true);
    }
    setLoading(true);
    try {
      const res = await fetch(`${STOP_RIDE_SHARE_ENDPOINT}/${token}`, { method: "POST" });
      const json = await res.json();
      if (json.status === true) {
        setRideShareActive(false);
        setModalMessage(json.message || "Ride sharing stopped.");
      } else {
        setModalMessage(json.message || "Stop failed");
      }
    } catch (e) {
      console.error("Stop error:", e);
      setModalMessage("Error stopping ride share.");
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  // 6. Transparent status loader
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

  // 7. Main UI
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#1F1C2C", "#928DAB"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.innerContainer}>
            <Text style={styles.appName}>SecureSpot</Text>
            <Text style={styles.header}>Ride Share</Text>

            {rideShareActive ? (
              <>
                <Text style={styles.alreadyText}>You are currently sharing a ride.</Text>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={handleStopRideShare}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Stop Ride Share</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Current Location */}
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

                {/* Destination Location */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter destination location"
                    placeholderTextColor="#B0B0B0"
                    value={destinationLocation}
                    onChangeText={(t) => {
                      setDestinationLocation(t);
                      setShowDestinationSuggestions(true);
                    }}
                  />
                  {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {destinationSuggestions.map((item) => (
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

                {/* Seats Picker */}
                <View style={styles.seatsContainer}>
                  {[1, 2, 3, 4].map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[
                        styles.seatButton,
                        availableSeats === n && styles.seatButtonActive,
                      ]}
                      onPress={() => setAvailableSeats(n)}
                    >
                      <Text
                        style={[
                          styles.seatText,
                          availableSeats === n && styles.seatTextActive,
                        ]}
                      >
                        {n}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Share Ride */}
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={handleShareRide}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Share Ride</Text>
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

export default RideShareScreen;

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

  // Transparent full-screen loader
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },

  // Input + suggestions
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
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 55,
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

  // Seats picker
  seatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginVertical: 20,
  },
  seatButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
  },
  seatButtonActive: {
    backgroundColor: "#928DAB",
  },
  seatText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
  seatTextActive: {
    color: "#fff",
  },

  // Buttons
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

  // Modal
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
