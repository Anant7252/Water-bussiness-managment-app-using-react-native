import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRef } from "react";

// MobileAds()
//   .initialize()
//   .then((responese) => {});

// const adUnitId = __DEV__
//   ? TestIds.BANNER
//   : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

export default function Index(props: any) {
  const bannerRef = useRef(null);
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/images/mainpagebg.png")}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            position: "absolute",
            bottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            className="px-12 py-3 m-5 bg-blue-300 border-2 border-gray-800 rounded-full"
            onPress={() => {
              props.navigation.navigate("Ownerlogin");
            }}
          >
            <Text className="font-bold">Sign in as Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-10 py-3 m-5 bg-blue-300 border-2 border-gray-800 rounded-full"
            onPress={() => {
              props.navigation.navigate("Customerlogin");
            }}
          >
            <Text className="font-bold">Sign in as Customer</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {/* <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      /> */}
    </View>
  );
}
