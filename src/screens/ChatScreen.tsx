import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';
import { chatStyles as styles } from '../styles/chatStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hola 👋', sender: 'other' },
    { id: '2', text: 'Estoy interesado en la mascota', sender: 'me' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === 'me'
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.button} onPress={sendMessage}>
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}