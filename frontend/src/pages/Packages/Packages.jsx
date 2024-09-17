import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../hooks/useAxiosFetch';
import { Transition } from '@headlessui/react';
import { useUser } from '../../hooks/useUser';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { Link } from 'react-router-dom';
const Packages = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const { currentUser } = useUser();
    const role = currentUser?.role;
    const [enrolledPackages, setEnrolledPackages] = useState([]);

    const handleHover = (index) => {
        setHoveredCard(index);
    };

    const [Packages, setPackages] = useState([]);
    const axiosFetch = useAxiosFetch();
    const axiosSecure = useAxiosSecure();
    useEffect(() => {
        axiosFetch.get('/Packages')
            .then(res => setPackages(res.data))
            .catch(err => console.log(err))
    }, [])

    const handelSelect = (id) => {
        axiosSecure.get(`/enrolled-Packages/${currentUser?.email}`)
            .then(res => setEnrolledPackages(res.data))
            .catch(err => console.log(err))
        if (!currentUser) {
            return toast.error('Please Login First');
        }
        axiosSecure.get(`/cart-item/${id}?email=${currentUser.email}`)
            .then(res => {
                if (res.data.PackageId === id) {
                    return toast.error('Already Selected');
                }
                else if (enrolledPackages.find(item => item.Packages._id === id)) {
                    return toast.error('Already Enrolled');
                }
                else {
                    const data = {
                        PackageId: id,
                        userMail: currentUser.email,
                        date: new Date()
                    }

                    toast.promise(axiosSecure.post('/add-to-cart', data)
                        .then(res => {
                            console.log(res.data);
                        })

                        , {
                            pending: 'Selecting...',
                            success: {
                                render({ data }) {
                                    return `Selected Successfully`;
                                }
                            },
                            error: {
                                render({ data }) {
                                    return `Error: ${data.message}`;
                                }
                            }
                        });
                }
            })

    }


    return (
        <div>

            <div className="mt-20 pt-3">
                <h1 className="text-4xl font-bold text-center text-dark-primary">Packages</h1>
            </div>


            <div className="my-16 w-[90%] gap-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-auto">
                {Packages.map((Pac, index) => (
                    <div
                        key={index}
                        className={`relative hover:-translate-y-2  duration-150 hover:ring-[2px] hover:ring-secondary w-64 h-[350px] mx-auto ${Pac.availableSeats < 1 ? 'bg-red-300' : 'bg-white'} dark:bg-slate-600 rounded-lg shadow-lg overflow-hidden cursor-pointer`}
                        onMouseEnter={() => handleHover(index)}
                        onMouseLeave={() => handleHover(null)}
                    >
                        <div className="relative h-48">
                            <div
                                className={`absolute inset-0 bg-black opacity-0 transition-opacity duration-300 ${hoveredCard === index ? 'opacity-60' : ''
                                    }`}
                            />
                            <img
                                //src={Cls.image}
                                src={Pac.image}
                                alt="Course Image"
                                className="object-cover w-full h-full"
                            />
                            <Transition
                                show={hoveredCard === index}
                                enter="transition-opacity duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition-opacity duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute inset-0 flex items-center justify-center">

                                    <button onClick={() => handelSelect(Pac._id)} title={role === 'admin' || role === 'instructor' ? 'Instructor/Admin Can not be able to select ' ? Pac.availableSeats <1 : 'No seat avalible' : 'You can select this classes' } disabled={role === 'admin' || role === 'instructor' || Pac.availableSeats < 1} className="px-4 py-2 text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700">
                                        Select
                                    </button>

                                </div>
                            </Transition>
                        </div>
                        <div className="px-6 py-2">
                            <h3 className={`${Pac.name.length > 25 ? 'text-[14px]' : 'text-[16px]'}  font-bold`}>{Pac.name}</h3>
                            <p className="text-gray-500 text-xs">Instructor : {Pac.instructorName}</p>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-gray-600 text-xs">Available Seats: <span className='text-secondary'>{Pac.availableSeats}</span> </span>
                                <span className="text-green-500 font-semibold">${Pac.price}</span>
                            </div>
                            
                            <Link to={`/Package/${Pac._id}`}><button className="px-4 py-2 mt-4 w-full mx-auto text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700">
                                        View
                                    </button></Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Packages;
