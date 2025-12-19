import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = getFirestore(app);
const auth = getAuth(app);

const Profile = (props) => {
  const [owner, setOwner] = useState(null);

  const fetchOwnerData = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('No Owner Logged in!');
      return;
    }
    try {
      const ownerDocRef = doc(db, 'owners', user.uid);
      const ownerDocSnap = await getDoc(ownerDocRef);

      if (ownerDocSnap.exists()) {
        setOwner({
          id: ownerDocSnap.id,
          ...ownerDocSnap.data(),
        });
      } else {
        alert('Owner document does not exist');
        setOwner(null);
      }
    } catch (error) {
      alert('Error fetching data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userdata');
      props.navigation.navigate('Index');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Text className="py-4 m-4 text-3xl font-bold">Profile</Text>
      <View className="flex items-center justify-center my-4">
        <View className="flex flex-row items-center justify-center w-32 h-32 bg-red-500 border-4 border-gray-600 rounded-full">
          <Text className="font-bold text-center text-white text-7xl">
            {owner?.name ? owner.name.charAt(0) : '?'}
          </Text>
        </View>
      </View>
      <View className="px-4 mt-5">
        {owner ? (
          <>
            <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
              <MaterialIcons name="person" size={28} color="black" />
              <Text className="text-xl font-bold">
                UserName: <Text className="font-normal">{owner.username}</Text>
              </Text>
            </View>
            <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
              <MaterialIcons name="person" size={28} color="black" />
              <Text className="text-xl font-bold">
                Name: <Text className="font-normal">{owner.name}</Text>
              </Text>
            </View>
            <View className="flex flex-row items-start gap-3 py-3 border-t-2 border-gray-300">
              <MaterialIcons name="email" size={28} color="black" />
              <Text className="text-xl font-bold">
                Email: <Text className="font-normal">{owner.email}</Text>
              </Text>
            </View>
            <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
              <MaterialIcons name="phone" size={28} color="black" />
              <Text className="text-xl font-bold">
                Phone: <Text className="font-normal">{owner.phoneNumber}</Text>
              </Text>
            </View>
            <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
              <MaterialIcons name="home" size={28} color="black" />
              <Text className="text-xl font-bold">
                Address: <Text className="font-normal">{owner.address}</Text>
              </Text>
            </View>
            <View className="flex flex-row items-center gap-3 py-3 border-gray-300 border-y-2">
              <MaterialIcons name="exit-to-app" size={28} color="red" />
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-xl text-red-700">Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text className="text-lg text-center text-gray-500">No owner data available.</Text>
        )}
      </View>
    </View>
  );
};

export default Profile;
