import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, Modal, TextInput } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

const Explore = () => {
  const [customers, setCustomers] = useState(null);
  const [normal, setNormal] = useState('');
  const [cold, setCold] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchOwnerData = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No Owner Logged in!');
      return;
    }
    try {
      const ownerDocRef = doc(db, 'owners', user.uid);
      const ownerDocSnap = await getDoc(ownerDocRef);

      if (ownerDocSnap.exists()) {
        setCustomers({
          id: ownerDocSnap.id,
          ...ownerDocSnap.data(),
        });
      } else {
        Alert.alert('Error', 'Owner document does not exist');
        setCustomers(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Error fetching data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Please log in');
      return;
    }
    try {
      const ownerDocRef = doc(db, 'owners', user.uid);
      await updateDoc(ownerDocRef, {
        normalcost: parseFloat(normal),
        coldcost: parseFloat(cold),
      });
      Alert.alert('Success', 'Payment updated successfully');
      setIsEditing(false);
      fetchOwnerData();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Error updating data');
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!customers) {
    return <Text>No data available</Text>;
  }

  return (
    <View className='flex flex-col items-center justify-center flex-1'>
      <Text className='text-2xl font-bold text-center '>Normal Water Cost: ₹{customers.normalcost}</Text>
      <Text className='text-2xl font-bold text-center'>Cold Water Cost: ₹{customers.coldcost}</Text>
      <TouchableOpacity onPress={() => setIsEditing(true)} className='w-48 p-2 m-3 bg-blue-500 rounded-full '>
        <Text className='text-xl font-bold text-center text-white'>Edit</Text>
      </TouchableOpacity>
      <Modal
        visible={isEditing}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditing(false)}
      >
        <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
          <View className="w-3/4 p-5 bg-white rounded-lg">
            <Text className="mb-4 text-lg font-bold">Edit Water Cost</Text>
            <Text className="mb-2 font-bold">Normal Water Cost</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter Normal Water Cost"
              onChangeText={setNormal}
              value={normal}
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <Text className="mb-2 font-bold">Cold Water Cost</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter Cold Water Cost"
              onChangeText={setCold}
              value={cold}
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <View className="flex flex-row justify-between">
              <TouchableOpacity
                onPress={handleSave}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 rounded"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Explore;
