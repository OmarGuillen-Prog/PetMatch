import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: colors.secondary, // 🟢
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});