import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // path to where you defined the type



interface LogEntry {
  id: string;
  taskId: number;
  title: string;
  action: "completed" | "deleted";
  timestamp: number;
}

const LogScreen = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Logs">>();
    useEffect(() => {
    const loadLogs = async () => {
        try {
        const storedLogs = await AsyncStorage.getItem("taskLogs");
        if (storedLogs) {
            const parsedLogs = JSON.parse(storedLogs);
            parsedLogs.sort((a: LogEntry, b: LogEntry) => b.timestamp - a.timestamp)
            setLogs(parsedLogs);
        }
        } catch (error) {
        console.error("Erro ao carregar logs:", error);
        }
    };

    loadLogs();
    }, []);

    const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
    };

    const renderItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.logItem}>
        <Text style={styles.logText}>
        📝 Tarefa "{item.title}" foi <Text style={styles.bold}>{item.action === "completed" ? "concluída" : "removida"}</Text>
        </Text>
        <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
    </View>
    );

    return (
    <View style={styles.container}>
        <TouchableOpacity style = {styles.navigationButton} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.navigationButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Histórico de Ações</Text>
        <FlatList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma ação registrada ainda.</Text>}
        />
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: "bold",
    marginBottom: 16,
  },
  logItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radii.m,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  logText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  bold: {
    fontWeight: "bold",
  },
  timestamp: {
    color: theme.colors.completedText,
    fontSize: 12,
    marginTop: 4,
  },
  empty: {
    color: theme.colors.completedText,
    fontStyle: "italic",
    marginTop: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: theme.colors.secondary,
    width: 50,
    borderRadius: theme.radii.m,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.s,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start', // prevent it from stretching full width
  },
  navigationButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  },
});

export { LogScreen };
