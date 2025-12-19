
import { View, Image, Text, TextInput, Button, ActivityIndicator, FlatList, StyleSheet,RefreshControl,ScrollView, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc,getDoc,DocumentData } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { app } from "@/firebase";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const auth= getAuth(app);
const db=getFirestore(app);


export default function Home(props) {
  const [refreshing,setrefreshing]=useState(false);
  const [customers, setCustomers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWater, setSelectedWater] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const formattedDate = format(selectedDate, 'dd-MM-yy');
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchCustomerData(user);
    }
  }, [selectedDate]);
  
  const fetchOwnerData=async () =>{
    setLoading(true);
    const user=auth.currentUser;
    if(!user){
      alert("No Owner Logged in!");
      setLoading(false);
      return;
    }
    try{
      const ownerDocRef=doc(db,'owners',user.uid);
      const ownerdocsnap=await getDoc(ownerDocRef);
      
      if(ownerdocsnap.exists()){
        setOwners([{
          id:ownerdocsnap.id,
          ...ownerdocsnap.data(),
        }]);
      }else{
        alert("Owner document does not esist");
        setOwners([]);
      }
    }catch(error){
      alert("Error fetching data");
      console.log(error);
    }
    setLoading(false);
  }
  useEffect(()=>{
    fetchOwnerData();
  },[])

  const onRefresh=()=>{
    setrefreshing(true);
    setLoading(true)
    fetchCustomerData();
    setTimeout(() => {
      setrefreshing(false);
      setLoading(false);
    }, 1000);
  }
  const fetchCustomerData=async (user)=>{
    const customerRef=collection(db,'owners',user.uid,'customers');
    const customerSnap=await getDocs(customerRef);
    if(customerSnap.empty){
      alert("No customer or customer data found");
    }
    else if(!customerSnap.empty){
      const customerList=customerSnap.docs.map(
        (doc)=>({id:doc.id,...doc.data()})
      );
      setCustomers(customerList);
      setFilteredCustomers(customerList);

      const fetchWaterDetails={};
      customerList.forEach(
        (customer)=>{
          const waterDetails=customer.waterDetails || {};
          fetchWaterDetails[customer.id]={
            ...waterDetails,
            payment:customer.payment || 0,
          };
        }
      );
      setSelectedWater(fetchWaterDetails); 
    }
    setLoading(false);
  }

  const handleWaterCountChange = async (customerId, waterType, newCount) => {
    if (newCount < 0) return;
  
    const updateWater = { ...selectedWater };
    const dateKey = formattedDate;
  
    if (!updateWater[customerId]) {
      updateWater[customerId] = {};
    }
    if (!updateWater[customerId][dateKey]) {
      updateWater[customerId][dateKey] = {};
    }
  
    updateWater[customerId][dateKey][`${waterType}Count`] = newCount;
  
    let totalNormalCount = 0;
    let totalColdCount = 0;
  
    Object.keys(updateWater[customerId]).forEach((date) => {
      totalNormalCount += updateWater[customerId][date]?.normalCount || 0;
      totalColdCount += updateWater[customerId][date]?.coldCount || 0;
    });
  
    updateWater[customerId].payment =
      totalNormalCount * owners[0].normalcost + totalColdCount * owners[0].coldcost;
    setSelectedWater(updateWater);
  
    const user = auth.currentUser;
    if (!user) return;
  
    const customerRef = doc(db, 'owners', user.uid, 'customers', customerId);
  
    await updateDoc(customerRef, {
      [`waterDetails.${dateKey}`]: updateWater[customerId][dateKey],
      payment: updateWater[customerId].payment,
    });
  
    
    const updatedCustomers = customers.map((customer) => {
      if (customer.id === customerId) {
        return {
          ...customer,
          payment: updateWater[customerId].payment,
        };
      }
      return customer;
    });
    setCustomers(updatedCustomers);
  };
  

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.phoneNumber.includes(query) ||
        customer.address.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };
  const renderCustomerDetails=({item:customer})=>{
    
    return (
      <View className="border-2 border-gray-300 rounded-lg shadow-md">   
        <View
      key={customer.id}
      className="flex flex-row bg-white border-b-2 border-gray-300"
    >

      <View className="w-1/3 p-3 text-center">
        <TouchableOpacity  onPress={()=>props.navigation.navigate("Customer Profile",{
          id:customer.id,
          name: customer.name,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          newadvancepayment: customer.advance,
          payment: customer.payment
        })}>
          <Text>{customer.name}</Text>
        </TouchableOpacity>
      </View>


      <TextInput
        className="w-1/3 p-3 text-center border-l-2 border-gray-200"
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#aaa"
        value={`${selectedWater[customer.id]?.[formattedDate]?.normalCount || 0}`}
        onChangeText={(text) =>
          handleWaterCountChange(customer.id, "normal", parseInt(text) || 0)
        }
      />


      <TextInput
        className="w-1/3 p-3 text-center border-l-2 border-gray-200"
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#aaa"
        value={`${selectedWater[customer.id]?.[formattedDate]?.coldCount || 0}`}
        onChangeText={(text) =>
          handleWaterCountChange(customer.id, "cold", parseInt(text) || 0)
        }
      />
    </View>
    </View>
    
    );
  };
  return (
    <View className="flex">
      <View className="flex items-center justify-center px-2 bg-blue-500 h-max " >
        <Image source={require('@/assets/images/logo1.png')} resizeMode="contain" className="object-cover w-28 h-14"/>
      </View>
      <View className="mt-3 ">
        <View className="flex flex-row gap-5 p-3 ">
          <TextInput placeholder="search by name ,address,phonenumber" className="h-12 px-2 border-2 border-gray-800 rounded-3xl w-72" value={searchQuery} onChangeText={(text)=>setSearchQuery(text)}/>
          <TouchableOpacity className="px-5 py-2 bg-blue-600 rounded-full" onPress={handleSearch}>
            <MaterialIcons name="search" size={32} color="white"/>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row justify-between w-screen px-5 pt-3">
          <View className="h-12 py-2 border-2 rounded-full w-72">
            <Text className="text-xl font-bold text-center ">{formattedDate}</Text>
          </View>
          {showDatePicker && (
            <DateTimePicker
            value={selectedDate}
            mode="date"
            display="defalut"
            onChange={(event,date)=>{
              setShowDatePicker(false);
              if(date) setSelectedDate(date);
            }}
            maximumDate={new Date()}
            />
          )}
          <TouchableOpacity onPress={()=>setShowDatePicker(true)}>
            <Image source={require("@/assets/icons/calendar.png")} resizeMode="contain" className="m-5 translate-y-[-20] size-14"/>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row bg-gray-200 border-b-2 border-gray-300">
        <Text className="w-1/3 p-3 font-bold text-center text-gray-700">Name</Text>
        <Text className="w-1/3 p-3 font-bold text-center text-gray-700">Normal Water</Text>
        <Text className="w-1/3 p-3 font-bold text-center text-gray-700">Cold Water</Text>
      </View>
        <View>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff"/>
          ):(
            <FlatList
            data={filteredCustomers}
            renderItem={renderCustomerDetails}
            keyExtractor={(item)=>item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            />
          )
          }
        </View>
      </View>
    </View>
  );
}
 