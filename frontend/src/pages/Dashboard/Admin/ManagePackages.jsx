import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import { FcDeleteDatabase } from 'react-icons/fc';
import { GrUpdate } from 'react-icons/gr';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { Pagination, ThemeProvider, createTheme } from '@mui/material';

const ManagePackages = () => {
    const navigate = useNavigate();
    const axiosFetch = useAxiosFetch();
    const axiosSecure = useAxiosSecure();
    const [Packages, setPackages] = useState([]); 
    const [page, setPage] = useState(1);
    const [paginatedData, setPaginatedData] = useState([]);
    const itemPerPage = 5;
    const totalPage = Math.ceil(Packages.length / 5);


    useEffect(() => {
        axiosFetch.get('/Packages-manage')
            .then(res => setPackages(res.data))
            .catch(err => console.log(err))
    }, [])

    useEffect(()=>{
        let lastIndex = page * itemPerPage;
        const firstIndex = lastIndex - itemPerPage;
        if (lastIndex > Packages.length) {
            lastIndex = Packages.length;
        }
        const currentData = Packages.slice(firstIndex, lastIndex);
        setPaginatedData(currentData);
    },[page,totalPage])


    const theme = createTheme({
        palette: {
            primary: {
                main: '#ff0000', // Set the primary color
            },
            secondary: {
                main: '#00ff00', // Set the secondary color
            },
        },
    });


    const handleApprove = (id) => {
        axiosSecure.put(`/change-status/${id}`, { status: 'approved' })
            .then(res => {
                console.log(res.data)
                setPackages(Packages.map(Pac => Pac._id == id ? { ...Pac, status: 'approved' } : Pac))
            })
            .catch(err => console.log(err))
    }
    const handelReject = (id) => {
        Swal.fire({
            title: 'Reason for reject',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Reject',
            showLoaderOnConfirm: true,
            preConfirm: async (text) => {
                try {
                    const res = await axiosSecure.put(`/change-status/${id}`, { status: 'rejected', reason: text })
                    if (res.data.modifiedCount > 0) {
                        setPackages(Packages.map(Pac => Pac._id == id ? { ...Pac, status: 'rejected' } : Pac))
                    }
                    return res.data
                } catch (error) {
                    Swal.showValidationMessage(
                        `Request failed: ${error}`
                    )
                }

            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(
                    'Changed..!',
                    'You reject this Packages.',
                    'success'
                )
            }
        })
    }
    const handleChange = (event, value) => setPage(value);
    return (
        <div>
            <h1 className='text-4xl text-secondary font-bold text-center my-10'>Manage <span className='text-black'>Packages</span></h1>


            <div className="">

                <div className="flex flex-col">
                    <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                            <div className="overflow-hidden">
                                <table className="min-w-full text-left text-sm font-light">
                                    <thead className="border-b font-medium dark:border-neutral-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">PHOTO</th>
                                            <th scope="col" className="px-6 py-4">COURSE NAME</th>
                                            <th scope="col" className="px-6 py-4">INSTRUCTOR NAME</th>
                                            <th scope="col" className="px-6 py-4">STATUS</th>
                                            <th scope="col" className="px-6 py-4">DETAILS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            Packages.length == 0 ? <tr><td colSpan='6' className='text-center text-2xl font-bold'>No Packages Found</td></tr> :
                                                paginatedData.map((Pac, idx) => <tr
                                                    key={Pac._id}
                                                    className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <img src={Pac.image} className='h-[35px] w-[35px]' alt="" />
                                                    </td>
                                                    <td className="whitespace-pre-wrap px-6 py-4">{Pac.name}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">{Pac.instructorName}</td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className={`font-bold ${Pac.status === 'pending' ? 'bg-orange-400' : Pac.status === 'checking' ? 'bg-yellow-500' : Pac.status === 'approved' ? 'bg-green-600' : 'bg-red-600'} px-2 py-1 uppercase text-white rounded-xl`}>{Pac.status}</span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex gap-2">
                                                            {
                                                                <button
                                                                    onClick={() => handleApprove(cls._id)}
                                                                    className='text-[12px]  cursor-auto disabled:bg-green-700 bg-green-500 py-1 rounded-md px-2 text-white'>
                                                                    Approve
                                                                </button>
                                                            }
                                                            {

                                                                <button
                                                                    disabled={Pac.status === 'rejected' || Pac.status === 'checking'}
                                                                    onClick={() => handelReject(Pac._id)}
                                                                    className=' cursor-pointer disabled:bg-red-800 bg-red-600 py-1 rounded-md px-2 text-white'>
                                                                    Deny
                                                                </button>
                                                            }
                                                            {

                                                                <button
                                                                    disabled={Pac.status === 'rejected' || Pac.status === 'checking'}
                                                                    onClick={() => handelReject(Pac._id)}
                                                                    className=' cursor-pointer bg-red-600 py-1 rounded-md px-2 text-white'>
                                                                    Feedback
                                                                </button>
                                                            }


                                                        </div>
                                                    </td>

                                                </tr>)
                                        }

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <ThemeProvider theme={theme}>
                    <div className="w-full h-full flex justify-center items-center my-10">
                        <Pagination onChange={handleChange} count={totalPage} color="primary" />
                    </div>
                </ThemeProvider>
            </div>
        </div>
    );
};

export default ManagePackages;