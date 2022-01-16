const { initializeApp } = require('firebase/app')
const firestore = require('firebase/firestore')
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
}
initializeApp(firebaseConfig)

const readDB = async () => {
  const db = firestore.getFirestore()

  const col = firestore.collection(db, 'iptv').withConverter({
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options)
      return data.countries.map(c => JSON.stringify(c))
    }
  })

  const dataaaa = await firestore.getDocs(col)
  let countries = dataaaa.docs.map((s) => s.data()).flat()
  countries = [...new Set(countries)]

  return countries.map((c) => JSON.parse(c))
}

const updateDB = async (data) => {
  const db = firestore.getFirestore()

  await firestore.updateDoc(firestore.doc(db, 'hash', 'countries'), {
    countries: data
  })
}

readDB().then((data) => updateDB(data))
