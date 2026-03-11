import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';

interface RidesInfoModalProps {
    visible: boolean;
    onClose: () => void;
}

export const RidesInfoModal: React.FC<RidesInfoModalProps> = ({ visible, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}>
                <View style={styles.modalCard}>
                    <MaterialCommunityIcons name="shield-check" size={32} color={colors.primary} style={{ marginBottom: 12 }} />
                    <Text style={styles.modalTitle}>Plataforma 100% estudiantil</Text>
                    <Text style={styles.modalBody}>
                        Todos los viajes en CamPlus son ofrecidos y solicitados exclusivamente por estudiantes verificados de tu institución.{'\n\n'}
                        Viajas con compañeros reales, en un entorno seguro y de confianza.
                    </Text>
                    <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                        <Text style={styles.modalButtonText}>Entendido</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    modalBody: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.REGULAR,
        color: '#444',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 32,
    },
    modalButtonText: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.white,
    },
});
