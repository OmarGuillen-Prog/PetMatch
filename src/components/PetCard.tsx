import { View, Text, Image, TouchableOpacity } from 'react-native';
import { petCardStyles as styles } from '../styles/petCardStyles';

type Props = {
  nombre: string;
  imagen: string;
  estado: string;
  onPress: () => void;
};

export default function PetCard({ nombre, imagen, estado, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <Image source={{ uri: imagen }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.name}>{nombre}</Text>
          <Text style={styles.status}>{estado}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}