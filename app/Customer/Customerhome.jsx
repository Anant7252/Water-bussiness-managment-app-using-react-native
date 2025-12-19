import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { app } from "../../firebase";
import { Picker } from "@react-native-picker/picker";

const auth = getAuth(app);
const db = getFirestore(app);

function Customerhome(props) {
  const [ownerId, setOwnerId] = useState("");
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      props.navigation.navigate("Index");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const fetchCustomerData = async (uid, ownerDocId) => {
    if (!uid || !ownerDocId) return;
    const customerRef = doc(db, "owners", ownerDocId, "customers", uid);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      setDetails(customerSnap.data());
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log(auth.currentUser);
    const fetchingdatafromdb = async () => {
      const userid = auth.currentUser?.uid;
      const storagedata = await AsyncStorage.getItem("userdata");
      const datastore=JSON.parse(storagedata)
      const ownersRef =  collection(db, "owners");
      const q = query(ownersRef, where("username", "==", datastore.ownerusername));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        setOwnerId(docId);
        fetchCustomerData(userid, docId);
        console.log(userid, docId);
      } else {
        setLoading(false);
      }
    };
    fetchingdatafromdb();
  }, []);

  const renderDetails = (key) =>
    details[key] !== undefined ? details[key] : "Not Available";

  const renderWaterDetails = () => {
    const waterDetails = details.waterDetails;
    if (!waterDetails || Object.keys(waterDetails).length === 0) {
      return <Text>No water details available</Text>;
    }

    const filteredDetails = Object.keys(waterDetails).filter((date) => {
      const [year, month] = date.split("-");
      return selectedMonth ? month === selectedMonth : true;
    });

    if (filteredDetails.length === 0) {
      return <Text>No water details for the selected month</Text>;
    }

    const sortedDates = filteredDetails.sort(
      (a, b) => new Date(b) - new Date(a)
    );
    return sortedDates.map((date) => {
      const dateDetails = waterDetails[date];
      return (
        <View
          style={{ flexDirection: "row", justifyContent: "space-between" }}
          key={date}
        >
          <Text
            style={{ flex: 1, textAlign: "center", borderWidth: 1, padding: 5 }}
          >
            {date}
          </Text>
          <Text
            style={{ flex: 1, textAlign: "center", borderWidth: 1, padding: 5 }}
          >
            {dateDetails.normalCount || 0}
          </Text>
          <Text
            style={{ flex: 1, textAlign: "center", borderWidth: 1, padding: 5 }}
          >
            {dateDetails.coldCount || 0}
          </Text>
        </View>
      );
    });
  };

  const advance = details["advance"];

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: 64,
          backgroundColor: "black",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            borderWidth: 2,
            backgroundColor: "#1a1a1a",
            borderColor: "#444",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 24,
          }}
        >
          <Text style={{ color: "white" }}>Signout</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, padding: 10 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#003366" />
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 18, color: "#003366" }}>
                Name:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {renderDetails("name")}
                </Text>
              </Text>
              <View>
                <Text style={{ fontSize: 18, color: "#003366" }}>
                  Payment: ₹{renderDetails("payment")}
                </Text>
                {advance > 0 && (
                  <Text style={{ fontSize: 18, color: "green" }}>
                    Advance Payment: ₹{advance}
                  </Text>
                )}
              </View>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                color: "#003366",
              }}
            >
              Water Details
            </Text>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 16 }}>Select Month</Text>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value) => setSelectedMonth(value)}
              >
                <Picker.Item label="All Months" value="" />
                {months.map((month) => (
                  <Picker.Item
                    key={month.value}
                    label={month.label}
                    value={month.value}
                  />
                ))}
              </Picker>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderWidth: 1,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: 5,
                }}
              >
                Date
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: 5,
                }}
              >
                Normal Water
              </Text>
              <Text
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: 5,
                }}
              >
                Cold Water
              </Text>
            </View>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {renderWaterDetails()}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

export default Customerhome;
