import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },

  center: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  },

  error: {
    fontSize: 16,
    color: 'red',
  },
});