import {
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    View,
    Button,
    TouchableOpacity,
    Alert
  } from "react-native";
  import React, { useState } from "react";
  import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
  } from "firebase/auth";
  import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
  import { db, auth } from "../firebase";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const customerlogin = (props) => {
    const [islogin, setislogin] = useState(true);
    const [name,setname]=useState("");
    const [username, setusername] = useState("");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [usernameExists, setUsernameExists] = useState(false);
    const [phoneNumber,setPhonenumber]=useState("");
    const [ownerUsername,setownerusername]=useState("");
    const [address,setAddress]=useState("");
    
  
    const handlelogin= async () =>{
      try{
          if(email===""||password===""||ownerUsername===""){
              alert("Please fill all details")
              return
          }
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
              alert('Error', 'Please verify your email before logging in.');
              return;
            }
            
            const userData = {
              usertype: "customer",
              ownerusername:ownerUsername,
              email: email,
              password: password
            };
            await AsyncStorage.setItem('userdata', JSON.stringify(userData));
            const storedData = await AsyncStorage.getItem('userdata');
            console.log("Stored Data: ", storedData);
            console.log("stored successfully")
            props.navigation.navigate("Customer Home");
      }catch (error) {
        if (error.code === 'auth/invalid-credential') {
          alert("Please fill in correct details.");
        } else if (error.code === 'auth/user-not-found') {
          alert("No user found with this email.");
        } else if (error.code === 'auth/wrong-password') {
          alert("Incorrect password.");
        } else {
          alert("An error occurred: " + error.message);
        }
        console.error(error);
      }
    }
    const checkusernameexist =async () =>{
      try{
        const collectionRef=collection(db,'owners');
        const querySanpshot=await getDocs(collectionRef);
        setUsernameExists(
          querySanpshot.docs.some((doc)=> doc.data().username=== ownerUsername)
        ); 
      }catch(error){
        console.log(error)
      }
    }
    const handleregister=async () =>{
      await checkusernameexist();
  
      if (!ownerUsername) {
        Alert.alert('Please enter a valid owner username.');
        return;
      }
      try {
        const ownersCollection = collection(db, 'owners');
        const querySnapshot = await getDocs(ownersCollection);

        const ownerDoc = querySnapshot.docs.find(
          (doc) => doc.data().username === ownerUsername.trim()
        );

        if (!ownerDoc) {
          alert('The owner username you entered does not exist.');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const customerData = {
          ownerUsername:ownerUsername.trim(),
          name:name.trim(),
          email:email.trim(),
          phoneNumber:phoneNumber.trim(),
          address:address.trim(),
        };

        const customersCollectionRef = collection(
          db,
          `owners/${ownerDoc.id}/customers`
        );
        await setDoc(doc(customersCollectionRef, user.uid), customerData);
        await sendEmailVerification(user);
        Alert.alert('Success', 'Registration successful. Please verify your email.');
      } catch (error) {
        Alert.alert('Error registering customer:', error.message);
      }
    }
  
    const handleForgotPassword = async () => {
      try {
        if (!email) {
          Alert.alert('Error', 'Please enter your email.');
          return;
        }
        await sendPasswordResetEmail(auth, email);
        Alert.alert('Success', 'Password reset email sent.');
      } catch (error) {
        console.error('Error sending password reset email:', error.message);
        Alert.alert('Error', error.message);
      }
    };
    return (
      <View className="flex-1">
        <ImageBackground
          source={require("../assets/images/ownerlogin.png")}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {islogin ? (
            <View className="flex flex-col items-start justify-center gap-5 bg-white p-7 rounded-3xl">
              <Text className="text-2xl font-bold text-center translate-x-14">
                Customer Login
              </Text>
              <View>
                <Text className="px-5 py-1 text-xl">Owner Username</Text>
                <TextInput
                  placeholder="Enter Owner Username"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text) => setownerusername(text)}
                />
                <Text className="px-5 py-1 text-xl">Email</Text>
                <TextInput
                  placeholder="Enter Email address"
                  keyboardType="email-address"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text) => setemail(text)}
                />
                <Text className="px-5 py-1 text-xl">Passowrd</Text>
                <TextInput
                  onChangeText={(text) => setpassword(text)}
                  placeholder="Enter Password"
                  keyboardType="default"
                  className={`p-2 border-2 rounded-full w-60 ${
                    password.length >= 6
                      ? "focus:border-blue-500"
                      : "focus:border-red-800"
                  }`}
                  secureTextEntry={true}
                />
                <TouchableOpacity className="mt-2" onPress={handleForgotPassword}>
                  <Text className="text-blue-600">Forget password</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-6 py-2 mt-5 bg-blue-500 rounded-3xl" onPress={handlelogin}>
                  <Text className="text-xl text-center text-white">Signin</Text>
                </TouchableOpacity>
                <View className="flex flex-row gap-2 mt-2">
                  <Text>Don't have an account</Text>
                  <TouchableOpacity onPress={() => setislogin(false)}>
                    <Text className="text-red-500 underline">Register Here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex flex-col items-start justify-center gap-5 bg-white p-7 rounded-3xl">
              <Text className="text-2xl font-bold text-center translate-x-8 ">
                Customer Register
              </Text>
              <View>
                <Text className="px-5 py-1 text-xl">Owner Username</Text>
                <TextInput
                  placeholder="Enter Username"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text) => setownerusername(text)}
                  
                />
                <Text className="px-5 py-1 text-xl">Name</Text>
                <TextInput
                  placeholder=" Enter Name"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text) => setname(text)}
                  
                />
                <Text className="px-5 py-1 text-xl">Email</Text>
                <TextInput
                  placeholder="Enter Email address"
                  keyboardType="email-address"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text)=>setemail(text)}
                />
                <Text className="px-5 py-1 text-xl">Phone Number</Text>
                <TextInput
                  placeholder="Enter Phone Number"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text)=>setPhonenumber(text)}
                />
                <Text className="px-5 py-1 text-xl">Address</Text>
                <TextInput
                  placeholder=" Enter Name"
                  className="p-2 border-2 rounded-full w-60 focus:border-blue-500"
                  onChangeText={(text) => setAddress(text)}
                  
                />
                <Text className="px-5 py-1 text-xl">Passowrd</Text>
                <TextInput
                  placeholder="Enter Password"
                  keyboardType="default"
                  className={`p-2 border-2 rounded-full w-60 ${
                    password.length >= 6
                      ? "focus:border-blue-500"
                      : "focus:border-red-800"
                  }`}
                  secureTextEntry={true}
                  onChangeText={(text)=>setpassword(text)}
                />
                <TouchableOpacity className="px-6 py-2 mt-5 bg-blue-500 rounded-3xl" onPress={handleregister}>
                  <Text className="text-xl text-center text-white">Register</Text>
                </TouchableOpacity>
                <View className="flex flex-row gap-2 mt-2">
                  <Text>If have an account</Text>
                  <TouchableOpacity onPress={() => setislogin(true)}>
                    <Text className="text-red-500 underline">Signin Here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ImageBackground>
      </View>
    );
  };
  
  export default customerlogin;
  
  const styles = StyleSheet.create({});
  