// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import FontAwesome from "@expo/vector-icons/FontAwesome";
// import { useLocalSearchParams } from "expo-router";

// function Icon(props: React.ComponentProps<typeof FontAwesome>) {
//   return <FontAwesome size={20} style={{ marginBottom: -3 }} {...props} />;
// }

// const SettingsScreen = () => {
//   const settingsItems: Array<{
//     id: number;
//     icon: React.ComponentProps<typeof FontAwesome>["name"];
//     title: string;
//     route: string;
//   }> = [
//     {
//       id: 2,
//       icon: "bell",
//       title: "Notifications",
//       route: "/settings/notifications",
//     },
//     {
//       id: 3,
//       icon: "lock",
//       title: "Privacy & Security",
//       route: "/settings/privacy",
//     },
//     {
//       id: 4,
//       icon: "question-circle",
//       title: "Help & Support",
//       route: "/settings/help",
//     },
//     {
//       id: 5,
//       icon: "info-circle",
//       title: "About",
//       route: "/settings/about",
//     },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.heading}>Settings</Text>
//       </View>

//       {/* Settings List */}
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         {settingsItems.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={styles.settingsItem}
//             onPress={() => console.log(`Navigating to ${item.route}`)}
//           >
//             <View style={styles.iconContainer}>
//               <Icon name={item.icon} color="#0066CC" />
//             </View>
//             <Text style={styles.itemTitle}>{item.title}</Text>
//             <View style={styles.arrowContainer}>
//               <Icon name="angle-right" color="#666" />
//             </View>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerText}>Version 1.0.0</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#DDD",
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginLeft: 10,
//   },
//   contentContainer: {
//     padding: 20,
//   },
//   settingsItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#EEE",
//     marginHorizontal: -20,
//     paddingLeft: 20,
//   },
//   iconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#EAEAEA",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },
//   itemTitle: {
//     flex: 1,
//     fontSize: 16,
//     color: "#333",
//   },
//   arrowContainer: {
//     paddingRight: 20,
//   },
//   footer: {
//     borderTopWidth: 1,
//     borderTopColor: "#DDD",
//     padding: 20,
//     alignItems: "center",
//   },
//   footerText: {
//     color: "#999",
//     fontSize: 12,
//   },
// });

// export default SettingsScreen;
