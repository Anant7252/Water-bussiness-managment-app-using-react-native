import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./Home";
import Index from "./index";
import "../global.css";
import ownerlogin from "./ownerlogin";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tablayout from "./Ownerscreen/_layout";
import Customerprofile from "./Ownerscreen/customerprofile";
import customerpayments from "./Ownerscreen/customerpayments";
import * as BackgroundFetch from 'expo-background-fetch';
import { BACKGROUND_FETCH_TASK } from './MonthlyPaymentTask';
import customerlogin from './customerlogin'
import Customerhome from './Customer/Customerhome.jsx';




const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [initialRoute, setInitialRoute] = useState("");
  const [loading, setLoading] = useState(true);

  
  

  async function registerBackgroundTask() {
    console.log('Background task executed at:', new Date().toLocaleTimeString());
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60*60*24*30, 
        stopOnTerminate: false, 
        startOnBoot: true, 
      });
  
      console.log('Background task registered!');
    } catch (err) {
      console.log('Error registering background task:', err);
    }
  }

  useEffect(() => {
    registerBackgroundTask();
  }, []);
 

  useEffect(() => {
    const autologin = async () => {
      try {
        const userdata = await AsyncStorage.getItem("userdata");
        if (userdata) {
          const data = JSON.parse(userdata);
          const { usertype, email, password } = data;
          console.log(data)
          await signInWithEmailAndPassword(auth, email, password);
          if (usertype === "owner") {
            setInitialRoute("ownermain");
          }
          if(usertype === "customer"){
            setInitialRoute("Customer Home");
          } 
          else {
            setInitialRoute("Index");
          }
        } else {
          setInitialRoute("Index");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    autologin();
  }, []);

  if (loading) {
    return null; 
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
      <Stack.Screen name="Ownerlogin" component={ownerlogin} options={{ headerShown: false }} />
      <Stack.Screen name="Customerlogin" component={customerlogin} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Customer Home" component={Customerhome} options={{headerShown:false}}/>
      <Stack.Screen name="ownermain" component={Tablayout} />
      <Stack.Screen name="Customer Profile" component={Customerprofile} options={{
        headerShown:true,
        animation:'ios_from_right'
      }}/>
      <Stack.Screen name="Customer Pyament" component={customerpayments} options={{
        headerShown:true,
        animation:'ios_from_right'
      }}/>
    </Stack.Navigator>
  );
}
