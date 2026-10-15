import LandingPage from '@/components/public/LandingPage';
import Objectives from '@/components/public/Objectives';
import Map from '@/components/public/Map';
import AboutRecap from '@/components/public/AboutRecap';
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