import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Image, Text } from 'react-native';
import { Appbar, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { postService } from '../../services/post.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CreatePost'>;

type PostType = 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';

export const CreatePostScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState<PostType>('CONFESSION');
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const navigation = useNavigation<CreatePostScreenNavigationProp>();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]?.uri) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        type: postType,
        imageUrl: image?.uri,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Post" />
      </Appbar.Header>

      <View style={styles.content}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Content"
          value={content}
          onChangeText={setContent}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={6}
        />
        
        <SegmentedButtons
          value={postType}
          onValueChange={value => setPostType(value as PostType)}
          buttons={[
            { value: 'CONFESSION', label: 'Confession' },
            { value: 'MARKETPLACE', label: 'Marketplace' },
            { value: 'LOST_AND_FOUND', label: 'Lost & Found' },
          ]}
          style={styles.segmentedButtons}
        />

        <TouchableOpacity 
          style={styles.imagePickerButton} 
          onPress={handleImagePick}
        >
          {image ? (
            <Image 
              source={{ uri: image.uri }} 
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons 
                name="image-plus" 
                size={32} 
                color="#666"
              />
              <Text style={styles.imagePlaceholderText}>Add Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          Post
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  imagePickerButton: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
}); 