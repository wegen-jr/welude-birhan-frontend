import LandingPage from "../Components/LandingPage";
import AboutRecap from '../Components/AboutRecap';
import Testimonies from '../Components/Testimonies';
import Map from '../Components/Map';
import Objectives from '../Components/Objectives';
import Contact from '../Components/Contact';

export default function Home() {
  return (
    <main>
      <LandingPage/>
      <AboutRecap/>
      <Testimonies/>
      <Objectives/>
      <Map/>
      <Contact/>
    </main>
  );
}