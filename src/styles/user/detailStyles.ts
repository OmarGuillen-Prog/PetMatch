import { StyleSheet } from 'react-native';
import { colors } from '../shared/colors';

export const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 15,
    color: colors.text,
  },
  status: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: colors.white,
    fontWeight: 'bold',
  },
});