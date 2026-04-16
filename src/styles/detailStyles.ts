import { StyleSheet } from 'react-native';

export const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
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
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});