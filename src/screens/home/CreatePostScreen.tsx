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
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { postService } from '../../services/post.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';
import { colors } from '../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideNavbar } from '../../hooks/useHideNavbar';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CreatePost'>;

export const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('Todas');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ uri: string; type?: string; fileName?: string }[]>([]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigation = useNavigation<CreatePostScreenNavigationProp>();

  useHideNavbar(true);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 4,
      });

      if (result.didCancel) {
        return; // Usuario canceló la selección
      }

      if (result.errorCode) {
        Alert.alert('Error', 'No se pudo acceder a las imágenes. Verifica los permisos de la aplicación.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const availableSlots = 4 - images.length;
        const imagesToAdd = result.assets.slice(0, availableSlots).map((asset) => ({
          uri: asset.uri!,
          type: asset.type ?? 'image/jpeg',
          fileName: asset.fileName ?? `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        }));
        
        if (imagesToAdd.length > 0) {
          setImages([...images, ...imagesToAdd]);
        } else {
          Alert.alert('Información', 'Ya has seleccionado el máximo de 4 imágenes');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Ocurrió un error al seleccionar las imágenes. Intenta nuevamente.');
      console.error('Error selecting images:', error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (!price.trim()) {
      Alert.alert('Error', 'El precio es requerido');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'El número de contacto es requerido');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos una imagen');
      return;
    }

    try {
      setLoading(true);
      // Construir el contenido con toda la información
      const fullContent = `${description.trim()}\n\nPrecio: ${currency} $${price}\nCategoría: ${category}\nContacto: ${phoneNumber}`;
      
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', fullContent);
      formData.append('type', 'MARKETPLACE');
      
      // Agregar la primera imagen (principal)
      if (images[0]) {
        const imageUri = Platform.OS === 'android' 
          ? images[0].uri 
          : images[0].uri.replace('file://', '');
        
        formData.append('image', {
          uri: imageUri,
          type: images[0].type || 'image/jpeg',
          name: images[0].fileName || `marketplace_${Date.now()}.jpg`,
        } as any);
      }
      
      await postService.createPost(formData);
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo crear la publicación. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currencies = ['USD', 'EUR', 'PEN'];
  const paymentMethods = ['Todas', 'Efectivo', 'Transferencia', 'Tarjeta'];
  const categories = ['Tecnología', 'Libros', 'Ropa', 'Servicios', 'Otros'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear publicación</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell" size={20} color={colors.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkButton}>
            <MaterialCommunityIcons name="bookmark" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Título Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Título</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Ej: Vendo calculadora Casio"
            placeholderTextColor="#B6B6B6"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.mainImageContainer}
            onPress={handleImagePick}
            activeOpacity={0.8}>
            {images[0] ? (
              <Image source={{ uri: images[0].uri }} style={styles.mainImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image-multiple" size={48} color="#D9D9D9" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.sideImagesContainer}>
            {[1, 2, 3].map((index) => (
              <TouchableOpacity
                key={index}
                style={styles.sideImageContainer}
                onPress={handleImagePick}
                activeOpacity={0.8}>
                {images[index] ? (
                  <Image source={{ uri: images[index].uri }} style={styles.sideImage} />
                ) : (
                  <View style={styles.sideImagePlaceholder}>
                    <MaterialCommunityIcons name="image-multiple" size={24} color="#D9D9D9" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Objetivo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objetivo</Text>
          <TouchableOpacity style={styles.saleButton}>
            <Text style={styles.saleButtonText}>Venta</Text>
          </TouchableOpacity>
        </View>

        {/* Precio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio</Text>
          <View style={styles.priceContainer}>
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowCurrencyModal(true)}>
              <Text style={styles.currencyText}>{currency}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#131413" />
            </TouchableOpacity>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.pricePrefix}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#B6B6B6"
                value={price}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 2) return;
                  setPrice(cleaned);
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Métodos de pago Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métodos de pago permitidos</Text>
          <TouchableOpacity
            style={styles.paymentSelector}
            onPress={() => setShowPaymentModal(true)}>
            <View style={styles.paymentSelectorLeft}>
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>$</Text>
              </View>
              <View style={styles.paymentTextContainer}>
                <Text style={styles.paymentLabel}>Seleccione como desea recibir el pago</Text>
                <Text style={styles.paymentValue}>{paymentMethod}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#131413" />
          </TouchableOpacity>
        </View>

        {/* Categoría Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <TouchableOpacity
            style={styles.categoryInput}
            onPress={() => setShowCategoryModal(true)}>
            <Text style={[styles.categoryInputText, !category && styles.categoryPlaceholder]}>
              {category || 'Seleccione una categoría'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#131413" />
          </TouchableOpacity>
        </View>

        {/* Descripción Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Escriba una descripción del producto..."
            placeholderTextColor="#B6B6B6"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Contacto Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          <TextInput
            style={styles.contactInput}
            placeholder="000 000 0000"
            placeholderTextColor="#B6B6B6"
            value={phoneNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9\s]/g, '');
              setPhoneNumber(cleaned);
            }}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handleSubmit}
          disabled={loading}>
          <Text style={styles.publishButtonText}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Currency Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#131413" />
              </TouchableOpacity>
            </View>
            {currencies.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={styles.modalOption}
                onPress={() => {
                  setCurrency(curr);
                  setShowCurrencyModal(false);
                }}>
                <Text style={styles.modalOptionText}>{curr}</Text>
                {currency === curr && (
                  <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Métodos de Pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#131413" />
              </TouchableOpacity>
            </View>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.modalOption}
                onPress={() => {
                  setPaymentMethod(method);
                  setShowPaymentModal(false);
                }}>
                <Text style={styles.modalOptionText}>{method}</Text>
                {paymentMethod === method && (
                  <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#131413" />
              </TouchableOpacity>
            </View>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}>
                <Text style={styles.modalOptionText}>{cat}</Text>
                {category === cat && (
                  <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}>
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>¡Publicación Creada!</Text>
            <Text style={styles.successMessage}>
              Tu publicación ha sido creada exitosamente y ya está disponible en el marketplace.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
              activeOpacity={0.8}>
              <Text style={styles.successButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  imageSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mainImageContainer: {
    flex: 1,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  sideImagesContainer: {
    gap: 8,
  },
  sideImageContainer: {
    width: 80,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sideImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131413',
  },
  saleButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  saleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    gap: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#131413',
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pricePrefix: {
    fontSize: 16,
    color: '#B6B6B6',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#131413',
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  paymentSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#B6B6B6',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#383938',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#131413',
  },
  categoryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  categoryInputText: {
    fontSize: 16,
    color: '#131413',
    flex: 1,
  },
  categoryPlaceholder: {
    color: '#B6B6B6',
  },
  descriptionInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: '#131413',
  },
  contactInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131413',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#131413',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
