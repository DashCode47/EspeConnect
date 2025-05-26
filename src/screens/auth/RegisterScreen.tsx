import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, Chip, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../../services/auth.service';
import { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const AVAILABLE_INTERESTS = [
  'programming',
  'gaming',
  'music',
  'sports',
  'reading',
  'movies',
  'traveling',
  'cooking',
  'photography',
  'art'
];

export const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [career, setCareer] = useState('');
  const [gender, setGender] = useState('M');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 5) {
      setInterests([...interests, interest]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 5 interests');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !career) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name,
        email,
        password,
        career,
        gender,
        interests
      });
      setVisible(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            label="Career"
            value={career}
            onChangeText={setCareer}
            style={styles.input}
          />
          <SegmentedButtons
            value={gender}
            onValueChange={setGender}
            buttons={[
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' },
              { value: 'O', label: 'Other' }
            ]}
            style={styles.segmentedButtons}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
          
          <Text variant="titleMedium" style={styles.interestsTitle}>
            Select your interests (max 5)
          </Text>
          <View style={styles.interestsContainer}>
            {AVAILABLE_INTERESTS.map((interest) => (
              <Chip
                key={interest}
                selected={interests.includes(interest)}
                onPress={() => toggleInterest(interest)}
                style={styles.chip}
                mode={interests.includes(interest) ? 'flat' : 'outlined'}
              >
                {interest}
              </Chip>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          >
            Register
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            Already have an account? Login
          </Button>
        </View>
      </ScrollView>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Registro Exitoso
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  segmentedButtons: {
    marginBottom: 15,
  },
  interestsTitle: {
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    marginBottom: 8,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: '#4CAF50',
  },
}); 