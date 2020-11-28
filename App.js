// @refresh reset

import React, {useState, useEffect, useCallback} from 'react';
import {GiftedChat} from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import { StyleSheet, Text, TextInput, View, Button} from 'react-native';
import  firebase from 'firebase';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyB2o1mzLj8p8FNTzz2oMf35SmNTxsfXt80",
  authDomain: "react-native-chat-142ae.firebaseapp.com",
  databaseURL: "https://react-native-chat-142ae.firebaseio.com",
  projectId: "react-native-chat-142ae",
  storageBucket: "react-native-chat-142ae.appspot.com",
  messagingSenderId: "291925683834",
  appId: "1:291925683834:web:ae91a421a9c3bcaff895c3",
  measurementId: "G-BJHRJT5F6K"
};


firebase.initializeApp(firebaseConfig);


const db = firebase.firestore();
const chatRef = db.collection('chats');

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessages] = useState([]);

  useEffect(()=>{
    readUser();
    const unsubscribe = chatRef.onSnapshot(answerSnapshot =>{
      const messageFirestore = answerSnapshot
          .docChanges()
          .filter(({type}) => type === 'added')
          .map(({doc}) =>{
              const message = doc.data();
              return {...message, createdAt: message.createdAt.toDate()
              }
      }).sort((i, j) => j.createdAt.getTime() - i.createdAt.getTime());
      appendMessages(messageFirestore)
    });
    return () => unsubscribe()
  },[]);

  const appendMessages = useCallback((messages) =>{
    setMessages((previosMessages)=> GiftedChat.append(previosMessages, messages))
  }, [message]);

  async function readUser (){
    const user = await AsyncStorage.get('user');
    if(user){
      setUser(JSON.parse(user))
    }
  }
  
  async function clickButton() {
    const _id = Math.random().toString(36).substring(7);
    const user = {_id, name};
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user)
  }

  async function sendMessage(messages) {
    const writes = messages.map(m => chatRef.add(m));
    await Promise.all(writes)
  }

  if(!user){
    return(
        <View style = {styles.container}>
          <TextInput
              style = {styles.input}
              placeholder = "Введите ваше имя!"
              value = {name}
              onChangeText = {setName}
          />
          <Button
              onPress = {clickButton}
              title="В чат"
          />
        </View>
    )
  }

  return (
      <GiftedChat messages={message} user={user} onSend={sendMessage}/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  input:{
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'blue'
  }
});
