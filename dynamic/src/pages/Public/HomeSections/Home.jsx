import LandingPage from '../../../Components/public/LandingPage.jsx';
import Objectives from '../../../Components/public/Objectives.jsx';
import Map from '../../../Components/public/Map.jsx';
import AboutRecap from '../../../Components/public/AboutRecap.jsx';
export default function Home() {
    return (
        <>
            <main>
                <LandingPage />
                <Objectives />
                <AboutRecap />
                <Map />
            </main>
        </>
    );
}