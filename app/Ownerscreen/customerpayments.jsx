import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '@/firebase';

const db = getFirestore(app);
const auth = getAuth(app);

const CustomerPayments = ({ route }) => {
  const { id } = route.params;
  const [customerData, setCustomerData] = useState({});
  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7);
  const currentDay = currentDate.getDate();

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
    }
  };

  // const updateMonthlyPayment = async () => {
  //   const user = auth.currentUser;
  //   if (!user) {
  //     alert('Please log in');
  //     return;
  //   }
  //   try {
  //     const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
  //     const customerSnapshot = await getDoc(customerDocRef); // Fetch data again
  //     if (customerSnapshot.exists()) {
  //       const customerData = customerSnapshot.data();
  
  //       // Check if the current month has already been updated
  //       if (customerData.lastUpdatedMonth === currentMonth) {
  //         console.log('Monthly payment already updated for this month.');
  //         return;
  //       }
  
  //       const currentPayment = customerData.payment || 0;
  
  //       const newMonthlyPayment = {
  //         month: currentMonth,
  //         payment: currentPayment,
  //         paid: false,
  //       };
  
  //       await updateDoc(customerDocRef, {
  //         monthlypayment: customerData.monthlypayment
  //           ? [newMonthlyPayment, ...customerData.monthlypayment]
  //           : [newMonthlyPayment],
  //         lastUpdatedMonth: currentMonth, // Update the month
  //       });
  
  //       console.log('Monthly payment updated successfully.');
  //       fetchCustomerData();
  //     } else {
  //       alert('Customer not found');
  //     }
  //   } catch (error) {
  //     console.error('Error updating monthly payment:', error);
  //     alert('Error updating monthly payment');
  //   }
  // };
  
  

  const togglePaymentStatus = async (index) => {
    const user = auth.currentUser;
    if (!user) {
      alert('Please log in');
      return;
    }
    try {
      const customerDocRef = doc(db, 'owners', user.uid, 'customers', id);
      const updatedPayments = [...customerData.monthlypayment];
      updatedPayments[index].paid = !updatedPayments[index].paid;
      await updateDoc(customerDocRef, {
        monthlypayment: updatedPayments,
      });
      fetchCustomerData();
    } catch (error) {
      alert('Error updating payment status');
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // useEffect(() => {
  //   const runUpdateMonthlyPayment = async () => {
  //     if (currentDay === 27 && customerData.lastUpdatedMonth !== currentMonth) {
  //       await updateMonthlyPayment();
  //     }
  //   };
  //   runUpdateMonthlyPayment();
  // }, [customerData]);

  return (
    <View className="flex-col flex-1">
      <Text className="p-5 text-2xl font-bold">Payments:</Text>
      <View>
        <Text className="p-5 text-xl font-bold">
          Current Payment: <Text>{customerData.payment || 0}</Text>
        </Text>
        <Text className="p-5 text-xl font-bold">Monthly Payments:</Text>
        <FlatList
          data={customerData.monthlypayment || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => togglePaymentStatus(index)}
              className={`p-4 m-2 ${item.paid ? 'bg-green-500' : 'bg-gray-100'} border border-gray-300 rounded-lg`}
            >
              <Text className="text-lg">
                {index + 1}. {item.month}: {item.payment} -{' '}
                <Text className={item.paid ? 'text-green-600' : 'text-red-600'}>
                  {item.paid ? 'Paid' : 'Not Paid'}
                </Text>
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

export default CustomerPayments;

const styles = StyleSheet.create({});
