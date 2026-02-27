import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useLocalSearchParams, useRouter } from "expo-router";

// Updated courses with code and name
const courses = [
  {
    field: "Electrical Engineering",
    courses: [
      { code: "ELEC 101", name: "Circuit Analysis" },
      { code: "ELEC 102", name: "Electromagnetics" },
      { code: "ELEC 103", name: "Control Systems" },
      { code: "ELEC 104", name: "Signal Processing" },
      { code: "ELEC 105", name: "Power Systems" },
    ],
  },
  {
    field: "Mechanical Engineering",
    courses: [
      { code: "MECH 201", name: "Thermodynamics" },
      { code: "MECH 202", name: "Fluid Mechanics" },
      { code: "MECH 203", name: "Dynamics" },
      { code: "MECH 204", name: "Material Science" },
      { code: "MECH 205", name: "Machine Design" },
    ],
  },
  {
    field: "Civil Engineering",
    courses: [
      { code: "CIVL 301", name: "Structural Analysis" },
      { code: "CIVL 302", name: "Geotechnical Engineering" },
      { code: "CIVL 303", name: "Transportation Engineering" },
      { code: "CIVL 304", name: "Hydraulics" },
      { code: "CIVL 305", name: "Construction Management" },
    ],
  },
  {
    field: "Software Development",
    courses: [
      { code: "SOFT 401", name: "Data Structures & Algorithms" },
      { code: "SOFT 402", name: "Web Development" },
      { code: "SOFT 403", name: "Mobile App Development" },
      { code: "SOFT 404", name: "Database Systems" },
      { code: "SOFT 405", name: "Software Testing" },
    ],
  },
  {
    field: "Chemical Engineering",
    courses: [
      { code: "CHEM 501", name: "Chemical Reaction Engineering" },
      { code: "CHEM 502", name: "Process Control" },
      { code: "CHEM 503", name: "Thermodynamics" },
      { code: "CHEM 504", name: "Transport Phenomena" },
      { code: "CHEM 505", name: "Separation Processes" },
    ],
  },
  {
    field: "Biomedical Engineering",
    courses: [
      { code: "BIOM 601", name: "Biomaterials" },
      { code: "BIOM 602", name: "Medical Imaging" },
      { code: "BIOM 603", name: "Biomechanics" },
      { code: "BIOM 604", name: "Bioinformatics" },
      { code: "BIOM 605", name: "Tissue Engineering" },
    ],
  },
  {
    field: "Environmental Science",
    courses: [
      { code: "ENVR 701", name: "Ecology" },
      { code: "ENVR 702", name: "Environmental Chemistry" },
      { code: "ENVR 703", name: "Sustainable Development" },
      { code: "ENVR 704", name: "Waste Management" },
      { code: "ENVR 705", name: "Environmental Policy" },
    ],
  },
  {
    field: "Aerospace Engineering",
    courses: [
      { code: "AERO 801", name: "Aerodynamics" },
      { code: "AERO 802", name: "Propulsion Systems" },
      { code: "AERO 803", name: "Flight Dynamics" },
      { code: "AERO 804", name: "Avionics" },
      { code: "AERO 805", name: "Aircraft Design" },
    ],
  },
  {
    field: "Industrial Engineering",
    courses: [
      { code: "INDU 901", name: "Operations Research" },
      { code: "INDU 902", name: "Supply Chain Management" },
      { code: "INDU 903", name: "Quality Control" },
      { code: "INDU 904", name: "Manufacturing Processes" },
      { code: "INDU 905", name: "Human Factors Engineering" },
    ],
  },
  {
    field: "Nuclear Physics",
    courses: [
      { code: "NUCL 101", name: "Quantum Mechanics" },
      { code: "NUCL 102", name: "Nuclear Reactions" },
      { code: "NUCL 103", name: "Radiation Detection" },
      { code: "NUCL 104", name: "Nuclear Reactor Physics" },
      { code: "NUCL 105", name: "Medical Physics" },
    ],
  },
  {
    field: "Data Science",
    courses: [
      { code: "DATA 201", name: "Statistical Analysis" },
      { code: "DATA 202", name: "Machine Learning" },
      { code: "DATA 203", name: "Data Visualization" },
      { code: "DATA 204", name: "Big Data Technologies" },
      { code: "DATA 205", name: "Natural Language Processing" },
    ],
  },
  {
    field: "Artificial Intelligence",
    courses: [
      { code: "AI 301", name: "Neural Networks" },
      { code: "AI 302", name: "Computer Vision" },
      { code: "AI 303", name: "Reinforcement Learning" },
      { code: "AI 304", name: "Natural Language Processing" },
      { code: "AI 305", name: "Robotics Fundamentals" },
    ],
  },
  {
    field: "Robotics",
    courses: [
      { code: "ROBO 401", name: "Robot Kinematics" },
      { code: "ROBO 402", name: "Sensor Integration" },
      { code: "ROBO 403", name: "Autonomous Systems" },
      { code: "ROBO 404", name: "Robot Programming" },
      { code: "ROBO 405", name: "Human-Robot Interaction" },
    ],
  },
  {
    field: "Cybersecurity",
    courses: [
      { code: "CYBR 501", name: "Network Security" },
      { code: "CYBR 502", name: "Cryptography" },
      { code: "CYBR 503", name: "Ethical Hacking" },
      { code: "CYBR 504", name: "Malware Analysis" },
      { code: "CYBR 505", name: "Cloud Security" },
    ],
  },
  {
    field: "Network Engineering",
    courses: [
      { code: "NETW 601", name: "TCP/IP Networking" },
      { code: "NETW 602", name: "Routing Protocols" },
      { code: "NETW 603", name: "Network Security" },
      { code: "NETW 604", name: "SDN Fundamentals" },
      { code: "NETW 605", name: "VoIP Systems" },
    ],
  },
  {
    field: "Telecommunications",
    courses: [
      { code: "TELE 701", name: "Wireless Communications" },
      { code: "TELE 702", name: "Optical Networks" },
      { code: "TELE 703", name: "Satellite Communications" },
      { code: "TELE 704", name: "5G Technology" },
      { code: "TELE 705", name: "Network Planning" },
    ],
  },
];

const Courses = () => {
  const { field } = useLocalSearchParams();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const router = useRouter();

  const filteredField = courses.find((item) => item.field === field);

  const handleCheckboxPress = (code: string) => {
    if (selectedCourses.includes(code)) {
      setSelectedCourses((prev) => prev.filter((c) => c !== code));
    } else {
      setSelectedCourses((prev) => [...prev, code]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>{field}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer}>
        {filteredField?.courses.map((course) => (
          <TouchableOpacity
            key={course.code}
            onPress={() => handleCheckboxPress(course.code)}
            style={styles.courseItem}
          >
            <Checkbox
              value={selectedCourses.includes(course.code)}
              onValueChange={() => handleCheckboxPress(course.code)}
              style={styles.checkbox}
            />
            <View style={styles.courseDetails}>
              <Text style={styles.courseCode}>{course.code}</Text>
              <Text style={styles.courseTitle}>{course.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.doneButton,
            selectedCourses.length > 0 ? {} : styles.disabledButton,
          ]}
          disabled={selectedCourses.length === 0}
          onPress={() => {
            console.log("Selected:", selectedCourses);
            router.push("/");
          }}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  checkbox: {
    marginRight: 10,
  },
  courseDetails: {
    flex: 1,
  },
  courseCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseTitle: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  doneButton: {
    backgroundColor: "#0066CC",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Courses;
