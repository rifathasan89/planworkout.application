
import React, { useRef, useState } from 'react';
import { useUser } from '../../../hooks/useUser';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
const KEY = import.meta.env.VITE_IMG_TOKEN;

const AddPackage = () => {
    const API_URL = `https://api.imgbb.com/1/upload?key=${KEY}$name=`;
    const axiosSecure = useAxiosSecure();
    const { currentUser, isLoading } = useUser();
    const [image, setImage] = useState(null);
    const handleFormSubmit = (e) => {
        e.preventDefault();
        e.preventDefault();
        const formData = new FormData(e.target);
        const newData = Object.fromEntries(formData);
        formData.append('file', image);

        toast.promise(
            fetch(API_URL, {
                method: 'POST',
                body: formData
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (data.success === true) {
                        console.log(data.data.display_url);
                        newData.image = data.data.display_url;
                        newData.instructorName = currentUser.name;
                        newData.instructorEmail = currentUser.email;
                        newData.status = 'pending';
                        newData.submitted = new Date(); 
                        newData.totalEnrolled = 0;
                        // console.log(newData);
                        axiosSecure.post('/new-Package' , newData)
                        .then(res => {
                            console.log(res.data);
                        })

                    }
                }),
            {
                pending: 'Submitting your pack...',
                success: 'Submitted successfully!',
                error: 'Failed to submit your Package',
            }
        )
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <div PackageName="">
            <div PackageName="my-10">
                <h1 PackageName='text-center text-3xl font-bold'>Add Your package</h1>
            </div>


            <form onSubmit={handleFormSubmit} packagename=" mx-auto p-6 bg-white rounded shadow">
                <div PackageName="grid grid-cols-2 w-full gap-3">
                    <div PackageName="mb-6">
                        <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="name">
                            Package name
                        </label>
                        <input
                            PackageName=" w-full px-4 py-2  border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                            type="text"
                            required
                            placeholder='Your Package Name'
                            name='name'
                        />
                    </div>
                    <div PackageName="mb-6">
                        <label htmlFor="image" PackageName="font-bold">Thumbnail Photo</label>
                        <input
                            type="file"
                            required
                            onChange={handleImageChange}
                            name="image"
                            PackageName="block mt-[5px] w-full border border-secondary shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500    file:border-0 file:bg-secondary file:text-white file:mr-4 file:py-3 file:px-4 " />
                    </div>
                </div>
                <div PackageName="">
                    <h1 PackageName='text-[12px] my-2 ml-2 text-secondary'>You can not change your name or email</h1>
                    <div PackageName="grid gap-3 grid-cols-2">
                        <div PackageName="mb-6">
                            <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="instructorName">
                                Instructor name
                            </label>
                            <input
                                PackageName="w-full px-4 py-2 border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                                type="text"
                                value={currentUser?.name}
                                readOnly
                                disabled
                                placeholder='Instructor Name'
                                name='instructorName'
                            />
                        </div>
                        <div PackageName="mb-6">
                            <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="instructorEmail">
                                Instructor email
                            </label>
                            <input
                                title='You can not update your email'
                                PackageName="w-full px-4 py-2 border border-secondary rounded-md focus:outline-none focus:ring-blue-500"
                                type="email"
                                value={currentUser?.email}
                                disabled
                                readOnly
                                name='instructorEmail'
                            />
                        </div>
                    </div>
                </div>
                <div PackageName="grid gap-3 md:grid-cols-2">
                    <div PackageName="mb-6">
                        <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="availableSeats">
                            Available seats
                        </label>
                        <input
                            PackageName="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                            type="number"
                            required
                            placeholder='How many seats are available?'
                            name='availableSeats'
                        />
                    </div>
                    <div PackageName="mb-6">
                        <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="price">
                            Price
                        </label>
                        <input
                            PackageName="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                            type="number"
                            required
                            placeholder='How much does it cost?'
                            name='price'
                        />
                    </div>
                </div>
                <div PackageName="mb-6">
                    <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="price">
                        Youtube Link
                    </label>
                    <p PackageName='text-[12px] my-2 mt-2 text-secondary'>Only youtube videos are support</p>
                    <input
                        required
                        PackageName="w-full border-secondary px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500"
                        type="text"
                        placeholder='Your course intro video link'
                        name='videoLink'
                    />
                </div>
                <div PackageName="mb-6">
                    <label PackageName="block text-gray-700 font-bold mb-2" htmlFor="price">
                        Description About your Package 
                    </label>
                    <textarea placeholder='Description about your course' name="description" PackageName='resize-none border w-full p-2 rounded-lg  border-secondary outline-none' rows="4"></textarea>
                </div>
                <div PackageName="text-center w-full">
                    <button
                        PackageName="bg-secondary w-full hover:bg-red-400 duration-200 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddPackage; 

