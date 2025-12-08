import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows, Gradients } from "@/constants/theme";

const QUICK_PROMPTS = [
  "Best street food in Chandni Chowk",
  "Hidden gems near Hauz Khas",
  "Weekend trip from Delhi",
  "Best time to visit Qutub Minar",
];

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Namaste! I'm UnfoldBot, your AI travel companion for exploring Delhi and NCR. Ask me about hidden gems, local food spots, or help planning your perfect itinerary!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "This feature is coming soon! I'll be able to help you discover amazing places across Delhi NCR with personalized recommendations.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(prompt);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={isDark ? Gradients.darkOverlay : Gradients.lightOverlay}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <View style={styles.quickPromptsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickPrompts}
        >
          {QUICK_PROMPTS.map((prompt, index) => (
            <Pressable
              key={index}
              style={[
                styles.quickPromptChip,
                { backgroundColor: theme.cardBackground },
              ]}
              onPress={() => handleQuickPrompt(prompt)}
            >
              <ThemedText type="caption" style={styles.quickPromptText}>
                {prompt}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: tabBarHeight + Spacing.sm },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.backgroundRoot },
            ]}
          />
        )}
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.cardBackground },
              Shadows.searchBar,
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ask about Delhi..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <LinearGradient
              colors={Gradients.saffronGold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Feather name="send" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.botBubble,
        {
          backgroundColor: message.isUser
            ? theme.primary
            : theme.cardBackground,
        },
        !message.isUser && Shadows.card,
      ]}
    >
      {!message.isUser ? (
        <View style={styles.botHeader}>
          <LinearGradient
            colors={Gradients.saffronGold}
            style={styles.botAvatar}
          >
            <Feather name="compass" size={14} color="#FFFFFF" />
          </LinearGradient>
          <ThemedText
            type="caption"
            style={styles.botName}
            lightColor={theme.primary}
            darkColor={theme.primary}
          >
            UnfoldBot
          </ThemedText>
        </View>
      ) : null}
      <ThemedText
        type="body"
        style={styles.messageText}
        lightColor={message.isUser ? "#FFFFFF" : theme.text}
        darkColor={message.isUser ? "#FFFFFF" : theme.text}
      >
        {message.text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: Spacing.xs,
  },
  botBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: Spacing.xs,
  },
  botHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  botAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  botName: {
    fontWeight: "600",
  },
  messageText: {
    lineHeight: 22,
  },
  quickPromptsWrapper: {
    marginBottom: Spacing.sm,
  },
  quickPrompts: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  quickPromptChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  quickPromptText: {
    fontWeight: "500",
  },
  inputContainer: {
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
});
