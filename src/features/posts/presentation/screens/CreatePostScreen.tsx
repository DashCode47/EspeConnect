import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostStackParamList } from '../../../../navigation/types';
import { useAuthStore, useMarketplaceStore } from '../../../../store';
import { ProductCategory } from '../../../marketplace/domain/entities/product.entity';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import { FormInput } from '../../../../components/forms/FormInput';
import { FormTextArea } from '../../../../components/forms/FormTextArea';
import { SuccessModal } from '../../../../components/modals/SuccessModal';
import { ErrorModal } from '../../../../components/modals/ErrorModal';

type CreatePostScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'CreatePost'>;

const BACKGROUND_COLOR = '#F6F8F7';

const paymentMethods = ['Todas', 'Efectivo', 'Transferencia', 'Tarjeta'];
const categories = ['Tecnología', 'Comida', 'Libros', 'Servicios', 'Otros'];

const categoryMap: Record<string, ProductCategory> = {
  'Tecnología': 'TECNOLOGIA',
  'Comida': 'COMIDA',
  'Libros': 'LIBROS',
  'Servicios': 'SERVICIOS',
  'Otros': 'OTROS',
};

const categoryEmoji: Record<string, string> = {
  'Tecnología': '💻',
  'Comida': '🍔',
  'Libros': '📚',
  'Servicios': '🛠️',
  'Otros': '📦',
};

export const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('Todas');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ uri: string; base64?: string; type: string; name: string }[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const navigation = useNavigation<CreatePostScreenNavigationProp>();
  const { user } = useAuthStore();
  const { createProduct } = useMarketplaceStore();

  useHideNavbar(true);

  const showError = (message: string) => setErrorModal({ visible: true, message });

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 4,
        includeBase64: true,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        showError('No se pudo acceder a las imágenes. Verifica los permisos de la aplicación.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const availableSlots = 4 - images.length;
        const imagesToAdd = result.assets.slice(0, availableSlots).map((asset) => ({
          uri: asset.uri!,
          base64: asset.base64 ?? undefined,
          type: asset.type ?? 'image/jpeg',
          name: asset.fileName ?? `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`,
        }));

        if (imagesToAdd.length > 0) {
          setImages([...images, ...imagesToAdd]);
        } else {
          showError('Ya has seleccionado el máximo de 4 imágenes');
        }
      }
    } catch (error: any) {
      showError('Ocurrió un error al seleccionar las imágenes. Intenta nuevamente.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category.trim()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }
    if (!price.trim()) {
      showError('El precio es requerido');
      return;
    }
    if (!phoneNumber.trim()) {
      showError('El número de contacto es requerido');
      return;
    }
    if (images.length === 0) {
      showError('Por favor selecciona al menos una imagen');
      return;
    }

    try {
      setLoading(true);
      if (!user) throw new Error('Usuario no autenticado');

      await createProduct({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: categoryMap[category] ?? 'OTHER',
        images: images.filter(img => img.base64).map(img => ({
          base64: img.base64!,
          type: img.type,
          name: img.name,
        })),
        contact: phoneNumber.trim(),
        authorId: user.id,
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      showError(error.message || 'No se pudo crear la publicación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Publicación</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Images */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Fotos del producto</Text>
          <View style={styles.imageGrid}>
            {/* Main image */}
            <TouchableOpacity
              style={styles.mainImageContainer}
              onPress={handleImagePick}
              activeOpacity={0.8}>
              {images[0] ? (
                <>
                  <Image source={{ uri: images[0].uri }} style={styles.mainImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => handleRemoveImage(0)}>
                    <MaterialCommunityIcons name="close-circle" size={22} color={colors.white} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image-plus" size={36} color={`${colors.primary}66`} />
                  <Text style={styles.imagePlaceholderText}>Principal</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Side images */}
            <View style={styles.sideImagesContainer}>
              {[1, 2, 3].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.sideImageContainer}
                  onPress={handleImagePick}
                  activeOpacity={0.8}>
                  {images[index] ? (
                    <>
                      <Image source={{ uri: images[index].uri }} style={styles.sideImage} />
                      <TouchableOpacity
                        style={styles.removeImageBtnSmall}
                        onPress={() => handleRemoveImage(index)}>
                        <MaterialCommunityIcons name="close-circle" size={16} color={colors.white} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.sideImagePlaceholder}>
                      <MaterialCommunityIcons name="plus" size={20} color={`${colors.primary}66`} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Title */}
        <FormInput
          label="Título"
          placeholder="Ej: Vendo calculadora Casio fx-991"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.fieldSpacing}
        />

        {/* Category */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
            activeOpacity={0.7}>
            <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
              {category ? `${categoryEmoji[category]} ${category}` : 'Selecciona una categoría'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <FormTextArea
          label="Descripción"
          placeholder="Describe el producto: estado, características, motivo de venta..."
          value={description}
          onChangeText={setDescription}
          numberOfLines={4}
          containerStyle={styles.fieldSpacing}
        />

        {/* Price */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Precio</Text>
          <View style={styles.priceContainer}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>{currency}</Text>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.pricePrefix}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
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

        {/* Payment method */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Métodos de pago</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowPaymentModal(true)}
            activeOpacity={0.7}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color="#6B7280" />
            <Text style={[styles.selectText, { marginLeft: 10, flex: 1 }]}>
              {paymentMethod}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Contact */}
        <FormInput
          label="Contacto"
          placeholder="000 000 0000"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9\s]/g, ''))}
          keyboardType="phone-pad"
          leftIcon="phone-outline"
          containerStyle={styles.fieldSpacing}
        />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}>
          <Text style={styles.submitButtonText}>
            {loading ? 'Publicando...' : 'Publicar'}
          </Text>
          {!loading && (
            <MaterialCommunityIcons name="tag-plus" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Method Bottom Sheet */}
      {showPaymentModal && (
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentModal(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Métodos de pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                style={styles.sheetOption}
                onPress={() => { setPaymentMethod(method); setShowPaymentModal(false); }}>
                <Text style={styles.sheetOptionText}>{method}</Text>
                {paymentMethod === method && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Category Bottom Sheet */}
      {showCategoryModal && (
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.sheetOption}
                onPress={() => { setCategory(cat); setShowCategoryModal(false); }}>
                <Text style={styles.sheetOptionText}>
                  {categoryEmoji[cat]}{'  '}{cat}
                </Text>
                {category === cat && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="¡Publicación creada!"
        message="Tu producto ya está disponible en el marketplace para que otros estudiantes lo vean."
        buttonText="Ver marketplace"
        icon="tag-check"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${BACKGROUND_COLOR}F2`,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Fields
  fieldSpacing: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  // Images
  imageGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  mainImageContainer: {
    flex: 1,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.15)',
    borderStyle: 'dashed',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: `${colors.primary}66`,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  sideImagesContainer: {
    gap: 8,
  },
  sideImageContainer: {
    width: 88,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    borderStyle: 'dashed',
  },
  sideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sideImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtnSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
  },

  // Category / Payment selects
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },

  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 2,
    borderRightColor: 'rgba(16, 90, 57, 0.1)',
    backgroundColor: 'rgba(16, 90, 57, 0.04)',
  },
  currencyText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  pricePrefix: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  priceInput: {
    flex: 1,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 15,
    color: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  // Bottom sheet
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  sheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sheetOptionText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
  },

  // Bottom CTA
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
});
