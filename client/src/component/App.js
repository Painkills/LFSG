import { Routes, Route, BrowserRouter } from "react-router-dom"
import RaidRoom from './RaidRoom'
import MainRoom from './MainRoom'
import Layout from './Layout'
import NoPage from "./NoPage";


function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />} >
                        <Route path="/" element={<MainRoom />} />
                        <Route path="room" element={<RaidRoom />} />
                        <Route path="/*" element={<NoPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App