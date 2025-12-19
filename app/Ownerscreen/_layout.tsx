import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } 
         from '@react-navigation/bottom-tabs';
import explore from './explore';
import Index from '..';
import Home from './Home';
import Profile from './profile';
import { MaterialIcons } from '@expo/vector-icons';

const Tab=createBottomTabNavigator();
const Tablayout = () => {
  return (
      <Tab.Navigator initialRouteName="Home" 
      screenOptions={{
        tabBarStyle:{
          height:60,
          borderRadius:40,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
        },
      }}
      >
        <Tab.Screen 
          name="Home" 
          component={Home} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="home" size={size || 32} color={color || 'black'} />
              </View>
            ),
            headerShown: false,
          }} 
        />
        <Tab.Screen 
        name="Water Cost" 
        component={explore}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="note" size={size || 32} color={color || 'black'} />
            </View>
          ),
          headerShown: false,
        }}
        />
        <Tab.Screen name="Profile" component={Profile} 
        options={{
          headerShown:false,
          tabBarIcon:({color,size})=>(
            <View>
                <MaterialIcons name='person' size={size||32} color={color||'black'}/>
            </View>
          )
        }}
        />
      </Tab.Navigator>

  )
}

export default Tablayout

const styles = StyleSheet.create({})