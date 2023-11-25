import React, {useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, orderBy, limit, query, snapshot, QuerySnapshot } from 'firebase/firestore';

firebase.initializeApp({
  //your config
  apiKey: "AIzaSyBelfMN3fZALd3IzMHn7FdN_X0-5tAtiok",
  authDomain: "rychat-14241.firebaseapp.com",
  projectId: "rychat-14241",
  storageBucket: "rychat-14241.appspot.com",
  messagingSenderId: "121190259328",
  appId: "1:121190259328:web:404205cfbd109fda7d246"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn /> }
      </section>
    </div>
  );
}
function SignIn(){
  
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }

  return (
    <>
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )
}
function SignOut(){
  
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}
function ChatRoom() {

  const dummy = useRef()
  const messagesRef = firestore.collection('messages');
  const ref = query(
    collection(firestore, "messages"),
    orderBy('createdAt'),
    limit(25)
  );

  const [messages, loading, error, snapshot] = useCollectionData(ref,{
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    
    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading == false) {
    for (let i = 0; i < messages.length; i++) {
      messages[i].id = snapshot.docs[i].id;
    }
  }
  console.log(error)
  console.log(loading)

  return (
    <>
      <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Document: Loading...</span>}
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">✉️<strong>send</strong></button>
      </form>
    </>
  )
}
function ChatMessage(props){
  const {text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  )
}
export default App;
