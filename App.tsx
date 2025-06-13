// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import { theme } from "./src/theme";
import 'react-native-gesture-handler';
import {LogScreen} from "./src/screens/LogScreen"

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor={theme.colors.background} />
      <Stack.Navigator initialRouteName = "Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Gerenciador de Tarefas" }}
        />
        <Stack.Screen
          name="Logs"
          component={LogScreen}
          options={{ title: "Log de tarefas" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;