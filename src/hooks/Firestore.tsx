// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef, useState } from 'react'
import { initializeApp } from 'firebase/app'
import * as firestore from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
}
initializeApp(firebaseConfig)

export const useFirestoreQuery = (collectionPath: string): [firestore.DocumentData[], React.Dispatch<React.SetStateAction<firestore.QueryConstraint>>] => {
  const [snapshot, setSnapshot] = useState<firestore.DocumentData[]>([])

  // TODO - move this sibling level to nav pane
  const [filter, setFilter] = useState<firestore.QueryConstraint>(firestore.where('url', '!=', null))
  const unsubscribeRef = useRef<firestore.Unsubscribe>()

  const db = firestore.getFirestore()
  const col = firestore.collection(db, collectionPath)

  useEffect(() => {
    if (unsubscribeRef.current != null) {
      unsubscribeRef.current()
    }
    unsubscribeRef.current = firestore.onSnapshot(firestore.query(col, filter, firestore.limit(10)), (snap) => {
      setSnapshot(snap.docs.map((doc) => doc.data()))
    })
  }, [filter])

  return [snapshot, setFilter]
}
