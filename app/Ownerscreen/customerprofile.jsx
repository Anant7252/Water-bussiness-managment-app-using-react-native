import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { getFirestore, doc, updateDoc,getDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { navigate } from 'expo-router/build/global-state/routing';
import { useNavigation } from '@react-navigation/native';

const CustomerProfile = ({ route }) => {
  const navigation = useNavigation();
  const { id, name, email, phoneNumber, address, newadvancepayment } = route.params;
  const avatar = name ? name.charAt(0).toUpperCase() : '?';
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingAdvance, setIsEditingAdvance] = useState(false);
  const [newPayment, setNewPayment] = useState('');
  const [newAdvance, setNewAdvance] = useState('');
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [customerData, setCustomerData] = useState({
    name: name || '',
    email: email || '',
    phoneNumber: phoneNumber || '',
    address: address || '',
    advance: newadvancepayment || 0,
    payment: 0,
  });

  const fetchCustomerData = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in');
      return;
    }

    try {
      const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
      const customerSnapshot = await getDoc(customerDocRef);
      if (customerSnapshot.exists()) {
        setCustomerData(customerSnapshot.data());
      } else {
        alert('Customer not found');
      }
    } catch (error) {
      alert('Error fetching customer data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleSavePayment = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in');
      return;
    }

    if (newPayment === '' || isNaN(newPayment)) {
      alert('Invalid payment value');
      return;
    }

    try {
      const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
      await updateDoc(customerDocRef, { payment: parseFloat(newPayment) });
      setIsEditingPayment(false);
      alert('Payment updated successfully');
      fetchCustomerData();
    } catch (error) {
      alert('Error updating payment');
      console.error(error);
    }
  };

  const handleSaveAdvance = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in');
      return;
    }

    if (newAdvance === '' || isNaN(newAdvance)) {
      alert('Invalid advance payment value');
      return;
    }

    try {
      const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
      await updateDoc(customerDocRef, { advance: parseFloat(newAdvance) });
      setIsEditingAdvance(false);
      alert('Advance Payment updated successfully');
      fetchCustomerData();
    } catch (error) {
      alert('Error updating advance payment');
      console.error(error);
    }
  };

  const handleDeleteCustomer = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in');
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this customer's account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion Cancelled"),
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
              await deleteDoc(customerDocRef);
              alert("Customer account deleted successfully");
              navigation.navigate("ownermain");
            } catch (error) {
              console.error(error);
              alert("Error deleting customer");
            }
          },
          style: "destructive",
        },
      ]
    );
  };
  return (
    <View className="flex-1 bg-white">
      <Text className="py-4 text-2xl font-bold text-center">Customer Profile</Text>
      <View className="flex items-center justify-center my-4">
        <View className="flex flex-row items-center justify-center w-32 h-32 bg-blue-500 border-4 border-gray-600 rounded-full">
          <Text className="font-bold text-center text-white text-7xl">{avatar}</Text>
        </View>
      </View>
      <View className="px-4 mt-5">
        <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
          <MaterialIcons name="person" size={28} color="black" />
          <Text className="text-xl font-bold">Name: <Text className="font-normal">{name}</Text></Text>
        </View>
        <View className="flex flex-row items-start gap-3 py-3 border-t-2 border-gray-300">
          <MaterialIcons name="email" size={28} color="black" />
          <Text className="text-xl font-bold">Email: <Text className="font-normal">{email}</Text></Text>
        </View>
        <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
          <MaterialIcons name="phone" size={28} color="black" />
          <Text className="text-xl font-bold">Phone: <Text className="font-normal">{phoneNumber}</Text></Text>
        </View>
        <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
          <MaterialIcons name="home" size={28} color="black" />
          <Text className="text-xl font-bold">Address: <Text className="font-normal">{address}</Text></Text>
        </View>
        <View className="flex flex-row items-center gap-3 py-3 border-t-2 border-gray-300">
          <MaterialIcons name="money" size={28} color="black" />
          <Text className="text-xl font-bold">Advance Payment: <Text className="font-normal">{customerData.advance}</Text></Text>
          <TouchableOpacity
            onPress={() => setIsEditingAdvance(true)}
            className="absolute right-0 p-2 bg-blue-500 rounded-full "
          >
            <MaterialIcons name="edit-square" size={25}/>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row items-center gap-3 py-3 mb-16 border-t-2 border-gray-300">
          <MaterialIcons name="attach-money" size={28} color="black" />
          <TouchableOpacity onPress={() => { navigation.navigate("Customer Pyament",{id}) }}>
            <Text className="text-xl font-bold">Payment</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex flex-row items-center gap-3 py-3 border-gray-300 border-y-2">
          <MaterialIcons name="delete" size={28} color="red" />
          <TouchableOpacity
            onPress={handleDeleteCustomer}
            className=""
          >
            <Text className="text-xl text-red-700">Delete Customer Account</Text>
          </TouchableOpacity>
        </View>
        
      </View>


      <Modal
        visible={isEditingPayment}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditingPayment(false)}
      >
        <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
          <View className="w-3/4 p-5 bg-white rounded-lg">
            <Text className="mb-4 text-lg font-bold">Edit Payment</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter new payment"
              value={newPayment}
              onChangeText={setNewPayment}
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <View className="flex flex-row justify-between">
              <TouchableOpacity
                onPress={handleSavePayment}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditingPayment(false)}
                className="px-4 py-2 bg-gray-500 rounded"
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={isEditingAdvance}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditingAdvance(false)}
      >
        <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
          <View className="w-3/4 p-5 bg-white rounded-lg">
            <Text className="mb-4 text-lg font-bold">Edit Advance Payment</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Enter advance payment"
              value={newAdvance}
              onChangeText={setNewAdvance}
              className="p-2 mb-4 border border-gray-300 rounded"
            />
            <View className="flex flex-row justify-between">
              <TouchableOpacity
                onPress={handleSaveAdvance}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditingAdvance(false)}
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

export default CustomerProfile;
