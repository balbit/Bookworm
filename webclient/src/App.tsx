import { useEffect, useState } from 'react'
import { setCookie, getCookie } from './helpers/cookies'
import { UserSchema } from '@common/schemas/ts/userSchema'
import { getUserInfo } from './helpers/requests'
import Book from './components/book/Book.tsx'
import './App.css'

function App() {
    const [userID, setUserID] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<UserSchema | undefined>(undefined);

    useEffect(() => {
        if (!userID) {
            const localUserID = localStorage.getItem('userID');
            if (!localUserID) {
                const storedUserID = getCookie('userID');
                if (storedUserID) {
                    setUserID(storedUserID);
                    localStorage.setItem('userID', storedUserID);
                    console.log(`Found stored user ID: ${storedUserID}`);
                } else {
                    const newUserID = 'user-Test_1';
                    setCookie('userID', newUserID);
                    setUserID(newUserID);
                    localStorage.setItem('userID', newUserID);
                }
            } else {
                setUserID(localUserID);
            }
        }
    }, [userID]);

    useEffect(() => {
        if (userID) {
            console.log(`Fetching user info for ${userID}`);
            getUserInfo(userID)
                .then((userInfo) => {
                    setUser(userInfo);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [userID]);

    const bookId = 'book-8Q7HM3';
    return (
        <>
            <div>
                Welcome to the app, {userID}!
            </div>
            <Book id={bookId} bookProgress={user?.progress[bookId]}/>
        </>
    );
}

export default App
