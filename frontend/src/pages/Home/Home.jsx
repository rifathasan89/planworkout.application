import React from 'react';
import { useTitle } from '../../hooks/useTitle';
import Map from './Map/Map';
//import PopularPackages from './PopularPackages/PopularPackages';
import PopularPackages from './PopularPackages/PopularPackages';
import PopularInstructor from './PopularTeacher/PopularInstructor';
import HeroContainer from './Hero/HeroContainer';
import Gallary from './Gallary/Gallary';

const Home = () => {
    useTitle('Home | Workout Master - Unleashed Your Inner Self');
    return (
        <section>
            <HeroContainer />
            <div className="max-w-screen-xl mx-auto">
            <Gallary/>
                <PopularPackages />
                
                <PopularInstructor />
            </div>
            <Map />
        </section>
    );
};

export default Home;