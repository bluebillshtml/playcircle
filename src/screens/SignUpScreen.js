import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import EmailConfirmationOverlay from "../components/EmailConfirmationOverlay";

export default function SignUpScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const inputAnims = useRef(
    [...Array(5)].map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Main content animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Stagger input animations
    Animated.stagger(
      80,
      inputAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert(t("common.error"), t("signUp.errors.fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("signUp.errors.passwordMismatch"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), t("signUp.errors.passwordTooShort"));
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, {
        firstName: firstName,
        lastName: lastName,
        username: email.split("@")[0], // Use email prefix as username
        skillLevel: "Beginner",
      });
      // Show confirmation overlay instead of navigating
      setShowConfirmationOverlay(true);
    } catch (error) {
      Alert.alert(
        t("signUp.errors.signUpFailed"),
        error.message || t("signUp.errors.unableToCreate")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationOverlay(false);
    // Optionally navigate to sign in screen
    navigation.navigate("SignIn");
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: logoScale },
                    {
                      rotate: logoRotate.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="tennisball" size={44} color="#FFFFFF" />
              </View>
            </Animated.View>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.brandName}>PlayCircle</Text>
              <Text style={styles.tagline}>{t("signUp.tagline")}</Text>
            </Animated.View>

            {/* Welcome Card */}
            <Animated.View
              style={[
                styles.welcomeCard,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: cardScale }, { translateY: slideAnim }],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.welcomeHeader,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={32}
                  color="#FFFFFF"
                  style={styles.sparkleIcon}
                />
                <Text style={styles.welcomeTitle}>{t("signUp.title")}</Text>
                <Text style={styles.welcomeSubtitle}>
                  {t("signUp.subtitle")}
                </Text>
              </Animated.View>

              {/* Sign Up Form */}
              <View style={styles.formCard}>
                {/* First Name Input */}
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnims[0],
                      transform: [
                        {
                          translateX: inputAnims[0].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.label}>{t("signUp.firstName")}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("signUp.firstNamePlaceholder")}
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </Animated.View>

                {/* Last Name Input */}
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnims[1],
                      transform: [
                        {
                          translateX: inputAnims[1].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.label}>{t("signUp.lastName")}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("signUp.lastNamePlaceholder")}
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </Animated.View>

                {/* Email Input */}
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnims[2],
                      transform: [
                        {
                          translateX: inputAnims[2].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.label}>{t("signUp.email")}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("signUp.emailPlaceholder")}
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </Animated.View>

                {/* Password Input */}
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnims[3],
                      transform: [
                        {
                          translateX: inputAnims[3].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.label}>{t("signUp.password")}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("signUp.passwordPlaceholder")}
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* Confirm Password Input */}
                <Animated.View
                  style={[
                    styles.inputContainer,
                    {
                      opacity: inputAnims[4],
                      transform: [
                        {
                          translateX: inputAnims[4].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.label}>
                    {t("signUp.confirmPassword")}
                  </Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={t("signUp.confirmPasswordPlaceholder")}
                      placeholderTextColor="#999"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signUpButtonText}>
                        {t("signUp.createAccount")}
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("signUp.or")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={styles.signInButton}
                  onPress={() => navigation.navigate("SignIn")}
                >
                  <Text style={styles.signInButtonText}>
                    {t("signUp.alreadyHaveAccount")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t("signUp.termsText")}{" "}
                <Text style={styles.footerLink}>{t("signUp.terms")}</Text>{" "}
                {t("signUp.and")}{" "}
                <Text style={styles.footerLink}>
                  {t("signUp.privacyPolicy")}
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Email Confirmation Overlay */}
      <EmailConfirmationOverlay
        visible={showConfirmationOverlay}
        onClose={handleCloseConfirmation}
        email={email}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 32,
  },
  welcomeCard: {
    backgroundColor: "rgba(55, 65, 81, 0.7)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  welcomeHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  sparkleIcon: {
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E5E7EB",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  eyeIcon: {
    padding: 4,
  },
  signUpButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#4B5563",
  },
  dividerText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginHorizontal: 12,
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10B981",
  },
  footer: {
    alignItems: "center",
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },
  footerLink: {
    color: "#10B981",
    fontWeight: "500",
  },
});
