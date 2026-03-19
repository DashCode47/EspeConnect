import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from '../../../../navigation/types';
import { colors } from '../../../../config/colors';

type WebViewScreenRouteProp = RouteProp<AuthStackParamList, 'WebViewScreen'>;

export const WebViewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<WebViewScreenRouteProp>();
    const insets = useSafeAreaInsets();
    const { url, title } = route.params;
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(url)
            .then(res => res.text())
            .then(text => setHtmlContent(text))
            .catch(() => setError(true));
    }, [url]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <View style={styles.backButton} />
            </View>

            {!htmlContent && !error && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {error && (
                <View style={styles.loadingOverlay}>
                    <Text style={{ color: '#666' }}>No se pudo cargar el contenido</Text>
                </View>
            )}

            {htmlContent && (
                <WebView
                    source={{ html: htmlContent, baseUrl: url }}
                    style={styles.webview}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.primary,
    },
    backButton: {
        width: 36,
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: colors.white,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
    },
});
