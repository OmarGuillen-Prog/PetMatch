import { View, Text, Image } from 'react-native';
import { petCardStyles as styles } from '../styles/petCardStyles';

type Props = {
  nombre: string;
  imagen: string;
  estado: string;
};

export default function PetCard({ nombre, imagen, estado }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imagen }} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.name}>{nombre}</Text>
        <Text style={styles.status}>{estado}</Text>
      </View>
    </View>
  );
}