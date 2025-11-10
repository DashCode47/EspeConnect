import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput as RNTextInput,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { postService } from '../../services/post.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';
import { colors } from '../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { globalStyles } from '../../config/globalStyles';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CreatePost'>;

type PostType = 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';

type Category = 'tecnologia' | 'libros' | 'ropa' | 'servicios';

export const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState<PostType>('MARKETPLACE');
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const navigation = useNavigation<CreatePostScreenNavigationProp>();

  // Ocultar el navbar en esta pantalla
  useHideNavbar(true);

  const handleImagePick = async () => {
    Alert.alert(
      'Seleccionar Imagen',
      '¿Desde dónde deseas seleccionar la imagen?',
      [
        {
          text: 'Galería',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
              selectionLimit: 5,
            });

            if (result.assets && result.assets[0]?.uri) {
              setImage({ uri: result.assets[0].uri });
            }
          },
        },
        {
          text: 'Cámara',
          onPress: async () => {
            const result = await ImagePicker.launchCamera({
              mediaType: 'photo',
              quality: 0.8,
            });

            if (result.assets && result.assets[0]?.uri) {
              setImage({ uri: result.assets[0].uri });
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (postType === 'MARKETPLACE' && !price.trim()) {
      Alert.alert('Error', 'El precio es requerido para publicaciones de Marketplace');
      return;
    }

    try {
      setLoading(true);
      // Include price in content if it's a marketplace post
      const finalContent = postType === 'MARKETPLACE' && price
        ? `${content.trim()}\n\nPrecio: $${parseFloat(price).toFixed(2)}`
        : content.trim();

      await postService.createPost({
        title: title.trim(),
        content: finalContent,
        type: postType,
        imageUrl: image?.uri,
      });
      Alert.alert('Éxito', 'Publicación creada exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo crear la publicación. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Publicación</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Uploader Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Añadir Fotos</Text>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImagePick}
            activeOpacity={0.8}
          >
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <MaterialCommunityIcons name="close" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={48}
                  color={colors.primary}
                />
                <Text style={styles.placeholderTitle}>Sube una o varias fotos</Text>
                <Text style={styles.placeholderSubtitle}>
                  Toca aquí para seleccionar desde tu galería o tomar una foto.
                </Text>
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleImagePick}
                >
                  <Text style={styles.addPhotoButtonText}>Añadir Fotos</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Fields Section */}
        <View style={styles.formSection}>
          {/* Título Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              mode="outlined"
              placeholder="Ej: Vendo calculadora Casio"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor={colors.secondary}
            />
          </View>

          {/* Descripción Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              mode="outlined"
              placeholder="Ej: Poco uso, incluye estuche..."
              value={content}
              onChangeText={setContent}
              style={styles.textArea}
              multiline
              numberOfLines={6}
              outlineColor="#E0E0E0"
              activeOutlineColor={colors.secondary}
            />
          </View>

          {/* Precio and Categoría Row */}
          <View style={styles.rowContainer}>
            {/* Precio Field */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <RNTextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  value={price}
                  onChangeText={(text) => {
                    // Only allow numbers and one decimal point
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    const parts = cleaned.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setPrice(cleaned);
                  }}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Categoría Field */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity
                style={styles.selectContainer}
                onPress={() => {
                  Alert.alert(
                    'Seleccionar Categoría',
                    '',
                    [
                      { text: 'Tecnología', onPress: () => setCategory('tecnologia') },
                      { text: 'Libros y Apuntes', onPress: () => setCategory('libros') },
                      { text: 'Ropa y Accesorios', onPress: () => setCategory('ropa') },
                      { text: 'Servicios', onPress: () => setCategory('servicios') },
                      { text: 'Cancelar', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text
                  style={[
                    styles.selectText,
                    !category && styles.selectPlaceholder,
                  ]}
                >
                  {category
                    ? category === 'tecnologia'
                      ? 'Tecnología'
                      : category === 'libros'
                      ? 'Libros y Apuntes'
                      : category === 'ropa'
                      ? 'Ropa y Accesorios'
                      : 'Servicios'
                    : 'Seleccionar categoría...'}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Contacto Field */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Medios de Contacto</Text>
            <TextInput
              mode="outlined"
              placeholder="Ej: 0991234567 o @miusuario"
              value={contact}
              onChangeText={setContact}
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor={colors.secondary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.publishButton}
          contentStyle={styles.publishButtonContent}
          labelStyle={styles.publishButtonLabel}
        >
          Publicar
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  imageUploadContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: `${colors.primary}80`,
    backgroundColor: `${colors.primary}10`,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addPhotoButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 8,
  },
  addPhotoButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    height: 56,
  },
  textArea: {
    backgroundColor: colors.white,
    minHeight: 144,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 56,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    height: '100%',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 56,
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  selectPlaceholder: {
    color: '#999',
  },
  bottomBar: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 56,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  publishButtonContent: {
    height: 56,
  },
  publishButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 