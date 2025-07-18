import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {matchService} from '../services/match.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {User} from '../services/match.service';

const {width} = Dimensions.get('window');

const FILTERS = [
  {key: 'interest', label: 'Intereses'},
  {key: 'faculty', label: 'Facultad'},
  {key: 'search', label: 'Serch'},
];

const INTEREST_ICONS = {
  Robótica: 'robot',
  Videojuegos: 'gamepad-variant',
  Fotografía: 'camera',
  Gaming: 'gamepad-variant',
  Startups: 'lightbulb',
  Senderismo: 'airplane',
  Viajar: 'airplane',
  Gastronomía: 'food',
  'K-Pop': 'account-music',
  // ... agrega más si es necesario
};

export default function MatchesScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<string | undefined>(
    undefined,
  );
  const [faculty, setFaculty] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<
    'interest' | 'faculty' | 'search'
  >('interest');

  useEffect(() => {
    fetchInterests();
    fetchUsers();
  }, []);

  const fetchInterests = async () => {
    try {
      const data = await matchService.getAllInterests();
      setInterests(data?.data || []);
    } catch (err) {
      setInterests([]);
    }
  };

  const fetchUsers = async (
    filters: {interest?: string; faculty?: string; search?: string} = {},
  ) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (!filters.interest && !filters.faculty && !filters.search) {
        response = await matchService.getVisibleUsers();
      } else {
        response = await matchService.getPotentialMatches(filters);
      }
      if (
        response.status === 'success' &&
        response.data &&
        Array.isArray(response.data)
      ) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError('No se encontraron usuarios');
      }
    } catch (err) {
      setUsers([]);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterKey: 'interest' | 'faculty' | 'search') => {
    setActiveFilter(filterKey);
  };

  const handleInterestSelect = (interest: string) => {
    const newInterest = interest === selectedInterest ? undefined : interest;
    setSelectedInterest(newInterest);
    fetchUsers({interest: newInterest, faculty, search});
  };

  const handleFacultyChange = (text: string) => {
    setFaculty(text);
    fetchUsers({interest: selectedInterest, faculty: text, search});
  };

  const handleSearchChange = (text: string) => {
    setSearch(text);
    fetchUsers({interest: selectedInterest, faculty, search: text});
  };

  const handleConnect = async (userId: string) => {
    try {
      await matchService.likeUser(userId);
      fetchUsers({interest: selectedInterest, faculty, search});
    } catch (err) {
      // Manejar error
    }
  };

  const renderInterestChip = (interest: string) => (
    (
      <TouchableOpacity
        key={interest}
        style={[
          styles.chip,
          selectedInterest === interest && styles.chipSelected,
        ]}
        onPress={() => handleInterestSelect(interest)}>
        <MaterialCommunityIcons
          name={
            INTEREST_ICONS[interest as keyof typeof INTEREST_ICONS] || 'star'
          }
          size={18}
          color="#333"
          style={{marginRight: 6}}
        />
        <Text style={styles.chipText}>{interest}</Text>
      </TouchableOpacity>
    )
  );

  const renderUserCard = ({item}: {item: User}) => (
    <View style={styles.userCard}>
      <Image
        source={{
          uri: item.avatarUrl || 'https://dummyimage.com/600x400/000/fff',
        }}
        style={styles.avatar}
      />
      <View style={{flex: 1}}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userCareer}>{item.career}</Text>
        <View style={styles.userInterests}>
          {item.interests.map((interest, idx) => (
            <View key={idx} style={styles.userInterestTag}>
              <MaterialCommunityIcons
                name={
                  INTEREST_ICONS[interest as keyof typeof INTEREST_ICONS] ||
                  'star'
                }
                size={16}
                color="#333"
                style={{marginRight: 4}}
              />
              <Text style={styles.userInterestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => handleConnect(item.id)}>
        <Text style={styles.connectButtonText}>Conectar</Text>
      </TouchableOpacity>
    </View>
  );
  console.log('INTERESTS=====', interests);
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#2d1863'}}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Conexiones</Text>
        <View style={styles.filterTabs}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                activeFilter === f.key && styles.filterTabActive,
              ]}
              onPress={() =>
                handleFilter(f.key as 'interest' | 'faculty' | 'search')
              }>
              <Text style={styles.filterTabText}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeFilter === 'interest' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}>
            {interests?.map(renderInterestChip)}
          </ScrollView>
        )}
        {activeFilter === 'faculty' && (
          <TextInput
            style={styles.input}
            placeholder="Buscar por facultad"
            placeholderTextColor="#bbb"
            value={faculty}
            onChangeText={handleFacultyChange}
          />
        )}
        {activeFilter === 'search' && (
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre o interés"
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={handleSearchChange}
          />
        )}
      </View>
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#8a2be2"
            style={{marginTop: 40}}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={users}
            keyExtractor={item => item.id}
            renderItem={renderUserCard}
            contentContainerStyle={{paddingBottom: 40}}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2d1863',
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  filterTab: {
    backgroundColor: '#432c7a',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: '#6d4aff',
  },
  filterTabText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  chipsScroll: {
    marginVertical: 10,
    minHeight: 40,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6f5e6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: '#b2f0c0',
  },
  chipText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f8f8ff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 18,
    paddingHorizontal: 10,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  userCareer: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  userInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  userInterestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6f5e6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  userInterestText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: '#6d4aff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'center',
    marginLeft: 10,
  },
  connectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  errorText: {
    color: '#8a2be2',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
