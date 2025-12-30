import './App.css'
import {Route, Routes} from 'react-router-dom';
import Layout from './Layout';
import Auto from './components/Auto'
import Registration from './components/Registration';
import Authorization from './components/Authorization';
import Events from './components/Events';
import Cabinet from './components/Cabinet';
import Admin from './components/Admin';
import FirstPage from './FirstPage';
import EventDetail from "./components/EventDetail";

function App() {


  return (
    <>
     <Routes>
      <Route path='/' exact element={<FirstPage/>}/>
      <Route path='/auto' exact element={<Auto/>}/>
      <Route path='/registration' exact element={<Registration/>}/>
      <Route path='/cabinet' exact element={<Cabinet/>}/>
      <Route path='/authorization' exact element={<Authorization/>}/>
      <Route path='/admin' exact element={<Admin/>}/>
      <Route path="/event/:id" element={<EventDetail />} />
     </Routes>
    </>
  )
}

export default App
