import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import Card from './Card';

const PopularPackages = () => {
    const axiosFetch = useAxiosFetch();
    const [Packages, setPackages] = useState([]);
    useEffect(()=>{
        const fetchPackages = async () => {
            const response = await axiosFetch.get('/popular-Packages');
            setPackages(response.data);
        };
        fetchPackages();
    },[])
    return (
        <div className='md:w-[80%] mx-auto my-36'>
            <div className="">
                <h1 className='text-5xl font-bold text-center'>Our <span className='text-secondary'>Popular</span> Packages</h1>
                <div className="w-[40%] text-center mx-auto my-4">
                    <p className='text-gray-500'>Explore our Popular Packages . Here is some popular Packages based  on How many student enrolled</p>
                </div>
            </div>


        <div className="grid  md:grid-cols-2 lg:grid-cols-3">
            {
                Packages.map((item, index) => <Card id={item._id} key={index} availableSeats={item.availableSeats} price={item.price} name={item.name} image={item.image} totalEnrolled={item.totalEnrolled} />)
            }
        </div>

        </div>
    );
};

export default PopularPackages;